from fastapi import APIRouter, Depends, Query

from app.api.deps import get_news
from app.core.errors import not_found
from app.core.pagination import PageParams
from app.core.security import FarmerContext, get_current_farmer

router = APIRouter(prefix="/news", tags=["news"])


@router.get("")
async def list_news(page: PageParams = Depends(),
                    category: str | None = Query(None),
                    farmer: FarmerContext = Depends(get_current_farmer),
                    news_service=Depends(get_news)):
    return await news_service.list(category=category, page=page.page,
                                   page_size=page.page_size)


@router.get("/{news_id}")
async def get_news_item(news_id: str,
                        farmer: FarmerContext = Depends(get_current_farmer),
                        news_service=Depends(get_news)):
    doc = await news_service.get(news_id)
    if doc is None:
        raise not_found("News item")
    return doc
