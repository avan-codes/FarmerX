from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.api.deps import get_config, get_store
from app.core.errors import not_found
from app.core.security import FarmerContext, get_current_farmer

router = APIRouter(prefix="/profile", tags=["profile"])


class ProfileUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    phone: str | None = None
    preferred_language: str = "en"
    state: str | None = None
    district: str | None = None
    commonly_grown_crops: list = []


@router.get("")
async def get_profile(farmer: FarmerContext = Depends(get_current_farmer),
                      store=Depends(get_store)):
    doc = await store.read("users", farmer.farmer_id)
    if doc is None:
        return {"user_id": farmer.farmer_id, "profile": None}
    return doc


@router.put("")
async def upsert_profile(payload: ProfileUpdate,
                         farmer: FarmerContext = Depends(get_current_farmer),
                         store=Depends(get_store), config=Depends(get_config)):
    if payload.preferred_language not in config.languages:
        payload.preferred_language = "en"
    now = datetime.now(timezone.utc).isoformat()
    existing = await store.read("users", farmer.farmer_id) or {}
    doc = {
        "user_id": farmer.farmer_id,
        "name": payload.name,
        "phone": payload.phone,
        "preferred_language": payload.preferred_language,
        "state": payload.state,
        "district": payload.district,
        "commonly_grown_crops": payload.commonly_grown_crops,
        "created_at": existing.get("created_at", now),
        "updated_at": now,
    }
    await store.write("users", farmer.farmer_id, doc)
    return doc
