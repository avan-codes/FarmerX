import uuid

from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/device")
async def issue_device_id():
    """MVP anonymous identity. Swap for JWT/OAuth2 later without touching
    any other router — they all depend on get_current_farmer only."""
    return {"farmer_id": f"dev_{uuid.uuid4().hex}", "scheme": "device"}
