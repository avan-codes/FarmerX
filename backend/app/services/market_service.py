"""Market price service.

One file per price date, raw payload hash kept for dedupe, and
_state/market_prices.json holds the cursor. Every read response carries
source, price_date, fetched_at, stale; on feed failure the last snapshot is
served with stale: true; with no snapshot the response is 200 + items: []
+ reason: MARKET_DATA_UNAVAILABLE — never synthesized.
"""

import asyncio, json, logging
from datetime import date, datetime, timedelta, timezone

log = logging.getLogger("farmerx.market")


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(value: datetime) -> str:
    return value.isoformat()


class MarketService:
    def __init__(self, *, provider, store, settings):
        self.provider = provider
        self.store = store
        self.settings = settings
        self._task = None
        self._lock = asyncio.Lock()

    # --- lifecycle --------------------------------------------------------
    async def start(self) -> None:
        if not self.settings.market_ingest_enabled or self.provider is None:
            return
        self._task = asyncio.create_task(self._loop())

    async def stop(self) -> None:
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

    async def _loop(self) -> None:
        while True:
            try:
                await self.ingest(price_date=date.today())
            except Exception:
                log.exception("market ingestion failed")
            await asyncio.sleep(self.settings.market_ingest_interval_minutes * 60)

    # --- ingestion --------------------------------------------------------
    async def ingest(self, *, price_date: date) -> dict:
        if self.provider is None:
            return {"ingested": 0, "reason": "MARKET_DATA_UNAVAILABLE"}
        async with self._lock:
            records, raw_hash = await self.provider.fetch_daily(
                price_date=price_date)
            key = price_date.isoformat()
            existing = await self.store.read("market_prices", key)
            if existing and existing.get("raw_hash") == raw_hash:
                log.info("market snapshot unchanged",
                         extra={"extra_fields": {"price_date": key}})
                return {"ingested": 0, "unchanged": True}

            doc = {
                "price_date": key,
                "source": self.provider.name,
                "fetched_at": _iso(_now()),
                "raw_hash": raw_hash,
                "items": records,
            }
            await self.store.write("market_prices", key, doc)
            await self.store.write("_state", "market_prices", {
                "last_fetched_at": doc["fetched_at"],
                "last_price_date": key,
                "last_raw_hash": raw_hash,
            })
            log.info("market snapshot stored",
                     extra={"extra_fields": {"price_date": key,
                                             "records": len(records)}})
            return {"ingested": len(records), "price_date": key}

    # --- reads ------------------------------------------------------------
    async def _load_day(self, day: str):
        return await self.store.read("market_prices", day)

    async def _latest(self):
        state = await self.store.read("_state", "market_prices")
        if not state:
            return None
        return await self._load_day(state["last_price_date"])

    def _stale(self, fetched_at) -> bool:
        if not fetched_at:
            return True
        try:
            fetched = datetime.fromisoformat(fetched_at)
        except ValueError:
            return True
        return _now() - fetched > timedelta(
            hours=self.settings.market_stale_after_hours)

    async def query(self, *, commodity=None, state=None, district=None,
                    market=None, date_from=None, date_to=None,
                    page=1, page_size=20):
        if date_from or date_to:
            days = [d for d in await self._available_days()
                    if (not date_from or d >= date_from)
                    and (not date_to or d <= date_to)]
        else:
            latest = await self._latest()
            days = [latest["price_date"]] if latest else []

        rows = []
        fetched_at = None
        source = None
        for day in sorted(days, reverse=True):
            doc = await self._load_day(day)
            if not doc:
                continue
            fetched_at = fetched_at or doc["fetched_at"]
            source = source or doc["source"]
            for row in doc["items"]:
                if commodity and row["commodity"].lower() != commodity.lower():
                    continue
                if state and row["state"].lower() != state.lower():
                    continue
                if district and row["district"].lower() != district.lower():
                    continue
                if market and row["market"].lower() != market.lower():
                    continue
                rows.append(row)

        if not days:
            return {
                "items": [], "page": page, "page_size": page_size, "total": 0,
                "source": None, "price_date": None, "fetched_at": None,
                "stale": True, "reason": "MARKET_DATA_UNAVAILABLE",
            }

        total = len(rows)
        start = (page - 1) * page_size
        return {
            "items": rows[start:start + page_size],
            "page": page, "page_size": page_size, "total": total,
            "source": source,
            "price_date": days[0],
            "fetched_at": fetched_at,
            "stale": self._stale(fetched_at),
        }

    async def _available_days(self):
        items, _ = await self.store.list("market_prices", page=1,
                                         page_size=10_000,
                                         sort=[("price_date", "desc")])
        return [item["price_date"] for item in items]

    async def commodities(self):
        latest = await self._latest()
        if not latest:
            return []
        return sorted({row["commodity"] for row in latest["items"]})

    async def trend(self, *, commodity, market=None, days=30):
        cutoff = (date.today() - timedelta(days=days)).isoformat()
        points = []
        fetched_at = None
        source = None
        for day in sorted(await self._available_days()):
            if day < cutoff:
                continue
            doc = await self._load_day(day)
            if not doc:
                continue
            fetched_at = doc["fetched_at"]
            source = doc["source"]
            matching = [r for r in doc["items"]
                        if r["commodity"].lower() == commodity.lower()
                        and (not market or r["market"].lower() == market.lower())]
            if matching:
                points.append({
                    "price_date": day,
                    "modal_price": (sum(float(r["modal_price"]) for r in matching)
                                    / len(matching)),
                    "min_price": min(float(r["min_price"]) for r in matching),
                    "max_price": max(float(r["max_price"]) for r in matching),
                    "markets": len({r["market"] for r in matching}),
                })
        return {
            "commodity": commodity, "market": market, "days": days,
            "points": points, "source": source, "fetched_at": fetched_at,
            "stale": self._stale(fetched_at),
        }
