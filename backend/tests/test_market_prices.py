from datetime import date
from unittest.mock import MagicMock

import pytest

from app.services.market_service import MarketService


class _MockProvider:
    name = "mock"

    async def fetch_daily(self, *, price_date, limit=100):
        records = [
            {
                "commodity": "Potato",
                "state": "Punjab",
                "district": "Ludhiana",
                "market": "Ludhiana",
                "variety": "Local",
                "grade": "FAQ",
                "arrival_date": price_date.strftime("%d/%m/%Y"),
                "min_price": "1000",
                "max_price": "1500",
                "modal_price": "1200",
            },
            {
                "commodity": "Onion",
                "state": "Punjab",
                "district": "Ludhiana",
                "market": "Ludhiana",
                "variety": "Local",
                "grade": "FAQ",
                "arrival_date": price_date.strftime("%d/%m/%Y"),
                "min_price": "2000",
                "max_price": "2500",
                "modal_price": "2200",
            },
        ]
        import hashlib, json
        raw_hash = hashlib.sha256(
            json.dumps(records, sort_keys=True, ensure_ascii=False).encode()
        ).hexdigest()
        return records, raw_hash


@pytest.fixture
async def market_service_with_data(settings, store):
    provider = _MockProvider()
    svc = MarketService(provider=provider, store=store, settings=settings)
    await svc.ingest(price_date=date.today())
    return svc


async def test_empty_feed_returns_unavailable_not_fabricated(client,
                                                             farmer_headers):
    body = client.get("/api/v1/market-prices",
                      headers=farmer_headers).json()
    assert body["items"] == []
    assert body["reason"] == "MARKET_DATA_UNAVAILABLE"
    assert body["stale"] is True


async def test_ingest_and_query(client, farmer_headers, market_service_with_data):
    body = client.get("/api/v1/market-prices", headers=farmer_headers).json()
    assert body["total"] >= 1
    assert body["source"] == "mock"
    assert body["stale"] is False
    assert "modal_price" in body["items"][0]


async def test_feed_failure_serves_stale_snapshot(client, farmer_headers,
                                                   market_service_with_data):
    from app.services.market_service import MarketService as MS
    # Replace provider with None to simulate feed failure
    market_service_with_data.provider = None
    body = client.get("/api/v1/market-prices", headers=farmer_headers).json()
    assert body["total"] >= 1


async def test_dedupe_by_raw_hash(client, farmer_headers, market_service_with_data):
    # Second ingest of same date should return unchanged
    provider = market_service_with_data.provider
    result = await market_service_with_data.ingest(price_date=date.today())
    assert result.get("unchanged") is True
    assert result["ingested"] == 0


async def test_market_commodities(client, farmer_headers, market_service_with_data):
    body = client.get("/api/v1/market-prices/commodities",
                      headers=farmer_headers).json()
    assert "items" in body
    assert "Potato" in body["items"]


async def test_market_trend(client, farmer_headers, market_service_with_data):
    body = client.get("/api/v1/market-prices/trend?commodity=Potato",
                      headers=farmer_headers).json()
    assert body["commodity"] == "Potato"
    assert "points" in body
