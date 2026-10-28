import json, uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, Request

from app.api.deps import get_store, get_config
from app.core.errors import ApiError, ErrorCode, not_found
from app.core.pagination import PageParams, envelope
from app.core.security import FarmerContext, get_current_farmer
from app.schemas.soil_reports import SoilReportCreate

router = APIRouter(prefix="/soil-reports", tags=["soil-reports"])


def _validate_values(values: dict, config) -> dict:
    errors = []
    for param_id, raw in values.items():
        if param_id not in config.soil_parameters:
            errors.append({"field": f"values.{param_id}", "message": "Unknown parameter"})
            continue
        low, high = config.soil_param_range(param_id)
        if not (low <= float(raw) <= high):
            errors.append({"field": f"values.{param_id}",
                           "message": f"Out of accepted range [{low}, {high}]"})
    for param in config.soil_parameters.values():
        if param.get("required") and param["id"] not in values:
            errors.append({"field": f"values.{param['id']}", "message": "Required"})
    if errors:
        raise ApiError(ErrorCode.VALIDATION_ERROR, 422, "Validation failed",
                       "One or more soil values are invalid.", errors)
    return {k: str(v) for k, v in values.items()}


@router.post("", status_code=201)
async def create_report(request: Request,
                        farmer: FarmerContext = Depends(get_current_farmer),
                        store=Depends(get_store), config=Depends(get_config)):
    ctype = request.headers.get("content-type", "")
    upload_ref = None

    if ctype.startswith("multipart/form-data"):
        form = await request.form()
        raw = form.get("values")
        if raw is None:
            raise ApiError(ErrorCode.VALIDATION_ERROR, 422, "Validation failed",
                           "'values' form field is required.")
        payload = SoilReportCreate(**json.loads(raw))
        upload = form.get("file")
        if upload is not None and hasattr(upload, "read"):
            content = await upload.read()
            if len(content) > request.app.state.settings.max_upload_bytes:
                raise ApiError(ErrorCode.VALIDATION_ERROR, 413, "File too large",
                               "Uploaded file exceeds the configured limit.")
            upload_ref = f"{uuid.uuid4().hex}_{getattr(upload, 'filename', 'upload')}"
    else:
        payload = SoilReportCreate(**await request.json())

    values = _validate_values(payload.values, config)
    report_id = f"sr_{uuid.uuid4().hex}"
    now = datetime.now(timezone.utc).isoformat()

    doc = {
        "report_id": report_id,
        "display_ref": await store.next_ref("SR"),
        "user_id": farmer.farmer_id,
        "farm_id": payload.farm_id,
        "values": values,
        "source": payload.source,
        "upload_ref": upload_ref,
        "captured_at": (payload.captured_at or datetime.now(timezone.utc)).isoformat(),
        "created_at": now,
    }
    await store.write("soil_reports", report_id, doc)
    return doc


@router.get("")
async def list_reports(page: PageParams = Depends(),
                       farm_id: str | None = Query(None),
                       farmer: FarmerContext = Depends(get_current_farmer),
                       store=Depends(get_store)):
    filters = {"user_id": farmer.farmer_id}
    if farm_id:
        filters["farm_id"] = farm_id
    items, total = await store.list("soil_reports", filters=filters,
                                    sort=[("created_at", "desc")],
                                    page=page.page, page_size=page.page_size)
    return envelope(items, page.page, page.page_size, total)


@router.get("/{report_id}")
async def get_report(report_id: str,
                     farmer: FarmerContext = Depends(get_current_farmer),
                     store=Depends(get_store)):
    doc = await store.read("soil_reports", report_id)
    if doc is None or doc.get("user_id") != farmer.farmer_id:
        raise not_found("Soil report")
    return doc