import json, logging, uuid
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from fastapi import APIRouter, Depends, Header, Query, Request
from fastapi.responses import FileResponse

from app.api.deps import get_ai, get_config, get_engine, get_rules, get_store, get_pdf_service
from app.core.errors import ApiError, ErrorCode, not_found
from app.core.pagination import PageParams, envelope
from app.core.security import FarmerContext, get_current_farmer
from app.domain.snapshot import input_hash
from app.domain.units import UnitError, dec
from app.schemas.recommendations import RecommendationCreate

log = logging.getLogger("farmerx.recommendations")
router = APIRouter(prefix="/recommendations", tags=["recommendations"])

DISCLAIMER = ("Recommendations are calculated from validated agronomic rules. "
              "AI helps explain them.")


def _validate_context(payload: RecommendationCreate, config) -> None:
    errors = []
    if payload.crop_id not in config.crops:
        errors.append({"field": "crop_id", "message": "Unknown crop"})
    if payload.region_id not in config.regions:
        errors.append({"field": "region_id", "message": "Unknown region"})
    if config.stage_for(payload.stage_id, payload.crop_id, payload.region_id) is None:
        errors.append({"field": "stage_id",
                       "message": "Stage is not valid for this crop and region"})
    if payload.language not in config.languages:
        errors.append({"field": "language", "message": "Unsupported language"})
    if not config.units.is_area_unit_available(payload.area.unit):
        errors.append({"field": "area.unit",
                       "message": f"Area unit '{payload.area.unit}' is not available yet"})
    for param_id in (payload.soil_values or {}):
        if param_id not in config.soil_parameters:
            errors.append({"field": f"soil_values.{param_id}", "message": "Unknown parameter"})
    if errors:
        raise ApiError(ErrorCode.VALIDATION_ERROR, 422, "Validation failed",
                       "One or more inputs are invalid.", errors)


async def _resolve_soil_values(payload, farmer, store, config) -> tuple[dict, str | None]:
    if payload.soil_values:
        for param_id, value in payload.soil_values.items():
            if param_id in config.soil_parameters:
                low, high = config.soil_param_range(param_id)
                if not (low <= float(value) <= high):
                    raise ApiError(ErrorCode.VALIDATION_ERROR, 422, "Validation failed",
                                   f"values.{param_id} is outside accepted range.",
                                   [{"field": f"soil_values.{param_id}",
                                     "message": f"Out of accepted range [{low}, {high}]"}])
        return payload.soil_values, None

    report = await store.read("soil_reports", payload.report_id)
    if report is None or report.get("user_id") != farmer.farmer_id:
        raise not_found("Soil report")
    return {k: dec(v) for k, v in report["values"].items()}, report["report_id"]


def _soil_parameter_view(values: dict, region_id: str, config) -> list[dict]:
    out = []
    for param_id, value in values.items():
        meta = config.soil_parameters.get(param_id)
        if meta is None:
            continue
        out.append({
            "param": param_id,
            "value": format(dec(value).normalize(), "f"),
            "unit": meta["unit"],
            "category": config.thresholds.classify(region_id, param_id, value),
        })
    return out


def _render_items(result, rule_set, language, config) -> list[dict]:
    items = []
    for item in result.items:
        fert = config.fertilizers[item.fertilizer_id]
        fert_name = config.translate(language, fert.get("label_key", fert["id"]))
        unit_label = config.translate(language, f"unit.{item.quantity_unit}")
        quantity_value = dec(item.quantity_value)
        items.append({
            "action_id": item.action_id,
            "fertilizer": {"id": fert["id"], "name": fert_name},
            "quantity": {
                "value": format(quantity_value.normalize(), "f"),
                "unit": item.quantity_unit,
                "display": f"{format(quantity_value.normalize(), 'f')} {unit_label}",
            },
            "quantity_breakdown": item.quantity_breakdown,
            "timing": item.timing,
            "timing_label": config.translate(language, f"timing.{item.timing}"),
            "method": item.method,
            "method_label": config.translate(language, f"method.{item.method}"),
            "reason": config.translate(language, item.reason_key,
                                       fertilizer=fert_name,
                                       stage=config.translate(language, f"stage.{rule_set['stage_id']}")),
            "cautions": [config.translate(language, key) for key in item.cautions],
            "source": {
                "rule_set_id": rule_set["rule_set_id"],
                "rule_set_version": rule_set["version"],
                "rule_id": item.rule_id,
                "document": rule_set.get("source", {}).get("document"),
                "publisher": rule_set.get("source", {}).get("publisher"),
                "url": rule_set.get("source", {}).get("url"),
            },
        })
    return items


@router.post("", status_code=201)
async def create_recommendation(
    payload: RecommendationCreate,
    request: Request,
    farmer: FarmerContext = Depends(get_current_farmer),
    store=Depends(get_store),
    config=Depends(get_config),
    rules=Depends(get_rules),
    engine=Depends(get_engine),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
):
    _validate_context(payload, config)
    soil_values, report_id = await _resolve_soil_values(payload, farmer, store, config)

    # input_hash deliberately excludes `language`: identical agronomy → identical hash.
    hash_payload = {
        "soil_values": {k: dec(v) for k, v in sorted(soil_values.items())},
        "crop_id": payload.crop_id,
        "region_id": payload.region_id,
        "stage_id": payload.stage_id,
        "area": {"value": dec(payload.area.value), "unit": payload.area.unit},
    }
    computed_hash = input_hash(hash_payload)

    if idempotency_key:
        existing = await _lookup_idempotent(store, farmer.farmer_id, idempotency_key)
        if existing:
            return await store.read("recommendations", existing)

    rule_set = rules.resolve(payload.crop_id, payload.region_id, payload.stage_id)
    try:
        result = engine.evaluate(
            soil_values=soil_values, crop_id=payload.crop_id,
            region_id=payload.region_id, stage_id=payload.stage_id,
            area_value=payload.area.value, area_unit=payload.area.unit,
            rule_set=rule_set,
        )
    except UnitError as exc:
        raise ApiError(ErrorCode.VALIDATION_ERROR, 422, "Validation failed", str(exc))

    rec_id = f"rec_{uuid.uuid4().hex}"
    now = datetime.now(timezone.utc).isoformat()

    doc = {
        "recommendation_id": rec_id,
        "user_id": farmer.farmer_id,
        "report_id": report_id,
        "farm_id": payload.farm_id,
        "status": result.status,
        "dose_generated": result.dose_generated,
        "generated_at": now,
        "language": payload.language,
        "context": {
            "crop": payload.crop_id,
            "region": payload.region_id,
            "district": payload.district,
            "stage": payload.stage_id,
            "farm_area": {"value": format(dec(payload.area.value).normalize(), "f"),
                          "unit": payload.area.unit},
            "language": payload.language,
        },
        "soil_parameters": _soil_parameter_view(soil_values, payload.region_id, config),
        "items": _render_items(result, rule_set, payload.language, config)
                 if result.status == "ok" else [],
        "cautions": [config.translate(payload.language, c) for c in result.cautions],
        "ai_summary": None,
        "ai_status": "not_requested",
        "message": None if result.status == "ok" else (
            "No validated recommendation is available for these inputs yet. "
            "No fertilizer dose has been generated."),
        "missing": result.missing,
        "disclaimer": DISCLAIMER,
        "input_hash": computed_hash,
        "engine_version": engine.engine_version,
        "rule_set_id": rule_set["rule_set_id"] if rule_set else None,
        "rule_set_version": rule_set["version"] if rule_set else None,
        "matched_rule_id": result.matched_rule_id,
        "search_blob": " ".join([
            payload.crop_id, payload.region_id, payload.stage_id,
            *(f["fertilizer"]["name"] for f in
              (_render_items(result, rule_set, "en", config) if rule_set else [])),
        ]).lower(),
    }

    await store.write("recommendations", rec_id, doc)
    await request.app.state.audit.append({
        "recommendation_id": rec_id,
        "user_id": farmer.farmer_id,
        "input_hash": computed_hash,
        "rule_set_id": doc["rule_set_id"],
        "rule_set_version": doc["rule_set_version"],
        "matched_rule_id": doc["matched_rule_id"],
        "engine_version": doc["engine_version"],
        "status": doc["status"],
        "dose_generated": doc["dose_generated"],
    })
    if idempotency_key:
        await _store_idempotent(store, farmer.farmer_id, idempotency_key, rec_id)

    log.info("recommendation created", extra={"extra_fields": {
        "recommendation_id": rec_id, "status": doc["status"],
        "input_hash": computed_hash}})
    return doc


async def _lookup_idempotent(store, farmer_id: str, key: str) -> str | None:
    doc = await store.read("_idempotency", f"{farmer_id}__{key}")
    return doc["recommendation_id"] if doc else None


async def _store_idempotent(store, farmer_id: str, key: str, rec_id: str) -> None:
    await store.write("_idempotency", f"{farmer_id}__{key}",
                      {"recommendation_id": rec_id})


@router.get("")
async def list_recommendations(
    page: PageParams = Depends(),
    crop: str | None = Query(None),
    region: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    q: str | None = Query(None),
    farmer: FarmerContext = Depends(get_current_farmer),
    store=Depends(get_store),
):
    items, total = await store.list(
        "recommendations", filters={"user_id": farmer.farmer_id},
        sort=[("generated_at", "desc")],
        page=1, page_size=10_000)                       # filter in-memory, then paginate
    if crop:
        items = [i for i in items if i["context"]["crop"] == crop]
    if region:
        items = [i for i in items if i["context"]["region"] == region]
    if date_from:
        items = [i for i in items if i["generated_at"] >= date_from]
    if date_to:
        items = [i for i in items if i["generated_at"] <= date_to]
    if q:
        needle = q.lower()
        items = [i for i in items if needle in i.get("search_blob", "")]
    total = len(items)
    start = (page.page - 1) * page.page_size
    return envelope(items[start:start + page.page_size], page.page,
                    page.page_size, total)


@router.get("/{rec_id}")
async def get_recommendation(rec_id: str,
                             farmer: FarmerContext = Depends(get_current_farmer),
                             store=Depends(get_store),
                             ai=Depends(get_ai)):
    doc = await store.read("recommendations", rec_id)
    if doc is None or doc.get("user_id") != farmer.farmer_id:
        raise not_found("Recommendation")

    out = dict(doc)
    cached = await ai.get_cached_summary(doc, doc.get("language", "en"))
    if cached:
        out["ai_summary"] = {key: cached.get(key) for key in
                             ("text", "provider", "model", "prompt_version",
                              "cached", "guardrails", "generated_at")}
        out["ai_summary"]["cached"] = True
        out["ai_status"] = ("ok" if cached["guardrails"]["passed"]
                            else "guardrail_blocked")
    else:
        out["ai_summary"] = None
        out["ai_status"] = "not_requested"
    return out


@router.get("/{rec_id}/pdf")
async def get_pdf(rec_id: str, language: str | None = Query(None),
                  farmer: FarmerContext = Depends(get_current_farmer),
                  store=Depends(get_store), pdf=Depends(get_pdf_service),
                  config=Depends(get_config),
                  request: Request = None):
    doc = await store.read("recommendations", rec_id)
    if doc is None or doc.get("user_id") != farmer.farmer_id:
        raise not_found("Recommendation")
    lang = language or doc.get("language", "en")
    if lang not in config.languages:
        raise ApiError(ErrorCode.VALIDATION_ERROR, 422, "Validation failed",
                       "Unsupported language.")
    # Attach the cached summary read-only; never regenerate during download.
    ai = request.app.state.ai_service
    cached = await ai.get_cached_summary(doc, lang)
    snapshot = dict(doc)
    snapshot["ai_summary"] = cached
    path = await pdf.render(snapshot, language=lang)
    return FileResponse(path, media_type="application/pdf",
                        filename=f"{rec_id}_{lang}.pdf")