from fastapi import APIRouter, Depends, Query

from app.api.deps import get_market
from app.core.pagination import PageParams, envelope
from app.core.security import FarmerContext, get_current_farmer

router = APIRouter(prefix="/market-prices", tags=["market-prices"])


@router.get("")
async def prices(
    page: PageParams = Depends(),
    commodity: str | None = Query(None),
    state: str | None = Query(None),
    district: str | None = Query(None),
    market: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    farmer: FarmerContext = Depends(get_current_farmer),
    market_service=Depends(get_market),
):
    return await market_service.query(
        commodity=commodity, state=state, district=district, market=market,
        date_from=date_from, date_to=date_to,
        page=page.page, page_size=page.page_size)


@router.get("/commodities")
async def commodities(farmer: FarmerContext = Depends(get_current_farmer),
                      market_service=Depends(get_market)):
    return {"items": await market_service.commodities()}


@router.get("/trend")
async def trend(commodity: str = Query(...), market: str | None = Query(None),
                days: int = Query(30, ge=1, le=365),
                farmer: FarmerContext = Depends(get_current_farmer),
                market_service=Depends(get_market)):
    return await market_service.trend(commodity=commodity, market=market,
                                      days=days)
