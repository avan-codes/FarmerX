from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Request
from app.api.deps import get_ai, get_market, get_news, get_rules, get_engine, get_store

router = APIRouter(tags=["health"])


@router.get("/health")
async def health(request: Request,
                 rules=Depends(get_rules), engine=Depends(get_engine),
                 ai=Depends(get_ai), market_service=Depends(get_market),
                 news_service=Depends(get_news), store=Depends(get_store)):
    market_state = await store.read("_state", "market_prices")
    news_state = await store.read("_state", "news")
    return {
        "status": "ok",
        "time": datetime.now(timezone.utc).isoformat(),
        "store": {"backend": "json", "status": "ok"},
        "rule_sets": rules.status(),
        "engine_version": engine.engine_version,
        "ai": ai.health(),
        "market_prices": {
            "last_fetched_at": (market_state or {}).get("last_fetched_at"),
            "status": "ok" if market_state else "unavailable",
        },
        "news": {
            "last_fetched_at": (news_state or {}).get("last_fetched_at"),
            "status": "ok" if news_state else "unavailable",
        },
    }
