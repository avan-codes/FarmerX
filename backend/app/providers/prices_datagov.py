"""data.gov.in daily mandi price provider.

The daily mandi price resource exposes state, district, market, commodity,
variety, grade, arrival_date, min_price, max_price, modal_price.
Pagination uses offset and limit (max 100 per request) with format=json.
"""

import hashlib, json
from datetime import date

import httpx


class MarketFeedError(RuntimeError):
    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code


class DataGovMarketProvider:
    name = "data.gov.in"

    def __init__(self, *, api_key: str, resource_id: str, base_url: str,
                 timeout_s: float = 20.0):
        if not api_key:
            raise ValueError("DATA_GOV_API_KEY is required for market ingestion.")
        self._api_key = api_key
        self._resource_id = resource_id
        self._client = httpx.AsyncClient(base_url=base_url.rstrip("/"),
                                         timeout=timeout_s)

    async def aclose(self) -> None:
        await self._client.aclose()

    async def fetch_daily(self, *, price_date: date,
                          limit: int = 100) -> tuple:
        records = []
        offset = 0
        total = None
        while True:
            response = await self._client.get(
                f"/resource/{self._resource_id}",
                params={
                    "api-key": self._api_key,
                    "format": "json",
                    "limit": limit,
                    "offset": offset,
                    "filters[arrival_date]": price_date.strftime("%d/%m/%Y"),
                })
            if response.status_code != 200:
                raise MarketFeedError(
                    "MARKET_DATA_UNAVAILABLE",
                    f"data.gov.in returned {response.status_code}.")
            payload = response.json()
            if total is None:
                total = int(payload.get("total") or 0)
            batch = payload.get("records") or []
            records.extend(batch)
            if not batch or len(records) >= total:
                break
            offset += limit

        raw_hash = hashlib.sha256(
            json.dumps(records, sort_keys=True, ensure_ascii=False)
            .encode("utf-8")).hexdigest()
        return records, raw_hash
