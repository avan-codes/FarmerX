from dataclasses import dataclass
from fastapi import Header

from app.core.errors import ApiError, ErrorCode


@dataclass(frozen=True)
class FarmerContext:
    farmer_id: str


async def get_current_farmer(
    x_farmer_id: str | None = Header(default=None, alias="X-Farmer-Id"),
) -> FarmerContext:
    """Pluggable auth seam. Phase 1 = device/farmer header.
    Swap this body for JWT/OAuth2 later; routers never change."""
    if not x_farmer_id or not x_farmer_id.strip():
        raise ApiError(ErrorCode.UNAUTHORIZED, 401, "Unauthorized",
                       "X-Farmer-Id header is required.")
    return FarmerContext(farmer_id=x_farmer_id.strip())


async def require_admin(x_admin_key: str | None = Header(default=None, alias="X-Admin-Key")):
    from app.core.settings import get_settings
    if not x_admin_key or x_admin_key != get_settings().admin_api_key:
        raise ApiError(ErrorCode.FORBIDDEN, 403, "Forbidden", "Admin key required.")