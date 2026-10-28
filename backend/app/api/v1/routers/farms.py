import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.api.deps import get_config, get_store
from app.core.errors import ApiError, ErrorCode, not_found
from app.core.security import FarmerContext, get_current_farmer

router = APIRouter(prefix="/farms", tags=["farms"])


class FarmIn(BaseModel):
    farm_name: str = Field(min_length=1, max_length=120)
    area_value: float = Field(gt=0)
    area_unit: str
    state: str | None = None
    district: str | None = None


def _validate_area(payload: FarmIn, config) -> None:
    if not config.units.is_area_unit_available(payload.area_unit):
        raise ApiError(ErrorCode.VALIDATION_ERROR, 422, "Validation failed",
                       f"Area unit '{payload.area_unit}' is not available yet.")


@router.get("")
async def list_farms(farmer: FarmerContext = Depends(get_current_farmer),
                     store=Depends(get_store)):
    items, total = await store.list("farms", filters={"user_id": farmer.farmer_id},
                                    sort=[("created_at", "desc")],
                                    page=1, page_size=200)
    return {"items": items, "total": total}


@router.post("", status_code=201)
async def create_farm(payload: FarmIn,
                      farmer: FarmerContext = Depends(get_current_farmer),
                      store=Depends(get_store), config=Depends(get_config)):
    _validate_area(payload, config)
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "farm_id": f"farm_{uuid.uuid4().hex}",
        "user_id": farmer.farmer_id,
        "farm_name": payload.farm_name,
        "area": {"value": payload.area_value, "unit": payload.area_unit},
        "state": payload.state,
        "district": payload.district,
        "soil_report_ids": [],
        "created_at": now,
    }
    await store.write("farms", doc["farm_id"], doc)
    return doc


@router.get("/{farm_id}")
async def get_farm(farm_id: str,
                   farmer: FarmerContext = Depends(get_current_farmer),
                   store=Depends(get_store)):
    doc = await store.read("farms", farm_id)
    if doc is None or doc["user_id"] != farmer.farmer_id:
        raise not_found("Farm")
    return doc


@router.put("/{farm_id}")
async def update_farm(farm_id: str, payload: FarmIn,
                      farmer: FarmerContext = Depends(get_current_farmer),
                      store=Depends(get_store), config=Depends(get_config)):
    existing = await store.read("farms", farm_id)
    if existing is None or existing["user_id"] != farmer.farmer_id:
        raise not_found("Farm")
    _validate_area(payload, config)
    existing.update({
        "farm_name": payload.farm_name,
        "area": {"value": payload.area_value, "unit": payload.area_unit},
        "state": payload.state, "district": payload.district,
    })
    await store.write("farms", farm_id, existing)
    return existing


@router.delete("/{farm_id}", status_code=204)
async def delete_farm(farm_id: str,
                      farmer: FarmerContext = Depends(get_current_farmer),
                      store=Depends(get_store)):
    existing = await store.read("farms", farm_id)
    if existing is None or existing["user_id"] != farmer.farmer_id:
        raise not_found("Farm")
    await store.delete("farms", farm_id)
    return None
