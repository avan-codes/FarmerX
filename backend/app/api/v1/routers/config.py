from fastapi import APIRouter, Depends, Query
from app.api.deps import get_config
from app.core.errors import ApiError, ErrorCode

router = APIRouter(prefix="/config", tags=["config"])


def _ok(rows): return {"items": rows, "total": len(rows)}


def _resolve(doc, translations: dict, lang: str = "en") -> str:
    """Resolve a label_key to a human-readable string using translations."""
    label_key = doc.get("label_key") or ""
    table = translations.get(lang) or translations.get("en") or {}
    return table.get(label_key) or label_key


@router.get("/crops")
async def crops(config=Depends(get_config)):
    tr = config.translations
    return _ok([{
        "id": c["id"], "name": _resolve(c, tr),
        "label_key": c.get("label_key"), "active": c.get("active", True),
    } for c in config.crops.values()])


@router.get("/regions")
async def regions(config=Depends(get_config)):
    tr = config.translations
    return _ok([{
        "id": r["id"], "name": _resolve(r, tr),
        "label_key": r.get("label_key"), "country": r.get("country"),
        "level": r.get("level"), "active": r.get("active", True),
    } for r in config.regions.values()])


@router.get("/stages")
async def stages(crop_id: str = Query(...), region_id: str = Query(...),
                 config=Depends(get_config)):
    if crop_id not in config.crops:
        raise ApiError(ErrorCode.VALIDATION_ERROR, 422, "Invalid crop_id", crop_id)
    if region_id not in config.regions:
        raise ApiError(ErrorCode.VALIDATION_ERROR, 422, "Invalid region_id", region_id)
    tr = config.translations
    return _ok([{
        "id": s["id"], "name": _resolve(s, tr),
        "label_key": s.get("label_key"),
        "crop_ids": s.get("crop_ids", []),
        "region_ids": s.get("region_ids", []),
        "order": s.get("order"),
    } for s in config.stages_for(crop_id, region_id)])


@router.get("/units")
async def units(config=Depends(get_config)):
    doc = config.units
    tr = config.translations
    return _ok([{
        "kind": "area", "id": u["id"], "symbol": _resolve(u, tr),
        "label_key": u.get("label_key"), "available": u.get("available", True),
        "region_scoped": u.get("region_scoped", False),
    } for u in doc._area.values()]
               + [{
        "kind": "quantity", "id": u["id"], "symbol": _resolve(u, tr),
        "label_key": u.get("label_key"), "available": u.get("available", True),
    } for u in doc._quantity.values()])


@router.get("/languages")
async def languages(config=Depends(get_config)):
    names = config.language_names or {}
    return _ok([{
        "code": code,
        "native_name": names.get(code) or code,
        "name": names.get(code) or code,
    } for code in config.languages])


@router.get("/fertilizers")
async def fertilizers(config=Depends(get_config)):
    tr = config.translations
    return _ok([{
        "id": f["id"], "name": _resolve(f, tr),
        "label_key": f.get("label_key"), "kind": f.get("kind"),
    } for f in config.fertilizers.values()])


@router.get("/soil-parameters")
async def soil_parameters(config=Depends(get_config)):
    tr = config.translations
    return _ok([{
        "id": p["id"], "label": _resolve(p, tr),
        "label_key": p.get("label_key", p["id"]),
        "unit": p["unit"], "min": p["min"], "max": p["max"],
        "step": p.get("step", 1),
        "required": p.get("required", False),
        "helper_text": p.get("helper_text", ""),
    } for p in config.soil_parameters.values()])
