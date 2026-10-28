"""News ingestion service.

Category mapping is config-driven (config/news_categories.json), dedupe is
by url_hash, and the same stale/empty semantics as prices apply.
"""

import asyncio, logging
from datetime import datetime, timedelta, timezone

log = logging.getLogger("farmerx.news")


class NewsService:
    def __init__(self, *, provider, store, config, settings):
        self.provider = provider
        self.store = store
        self.config = config
        self.settings = settings
        self._task = None

    async def start(self) -> None:
        if not self.settings.news_ingest_enabled or self.provider is None:
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
                await self.ingest()
            except Exception:
                log.exception("news ingestion failed")
            await asyncio.sleep(self.settings.news_ingest_interval_minutes * 60)

    def _categorise(self, article: dict) -> str:
        haystack = f"{article['title']} {article['summary']}".lower()
        for category, keywords in self.config.news_categories.items():
            if any(keyword.lower() in haystack for keyword in keywords):
                return category
        return "general"

    async def ingest(self) -> dict:
        if self.provider is None:
            return {"ingested": 0, "reason": "NEWS_UNAVAILABLE"}
        articles = await self.provider.fetch()
        stored = 0
        max_items = self.settings.news_max_items_per_feed * len(self._feeds())
        for article in articles[:max_items]:
            existing = await self.store.read("news", article["news_id"])
            if existing:
                continue
            article["category"] = self._categorise(article)
            article["fetched_at"] = datetime.now(timezone.utc).isoformat()
            await self.store.write("news", article["news_id"], article)
            stored += 1
        await self.store.write("_state", "news", {
            "last_fetched_at": datetime.now(timezone.utc).isoformat(),
            "last_count": stored,
        })
        return {"ingested": stored}

    def _feeds(self):
        return self.settings.news_feeds or []

    def _stale(self, fetched_at) -> bool:
        if not fetched_at:
            return True
        try:
            fetched = datetime.fromisoformat(fetched_at)
        except ValueError:
            return True
        return (datetime.now(timezone.utc) - fetched
                > timedelta(hours=self.settings.news_stale_after_hours))

    async def list(self, *, category=None, page=1, page_size=20):
        state = await self.store.read("_state", "news")
        if not state:
            return {"items": [], "page": page, "page_size": page_size,
                    "total": 0, "source": None, "fetched_at": None,
                    "stale": True, "reason": "NEWS_UNAVAILABLE"}
        filters = {"category": category} if category else None
        items, total = await self.store.list(
            "news", filters=filters, sort=[("published_at", "desc")],
            page=page, page_size=page_size)
        return {
            "items": items, "page": page, "page_size": page_size,
            "total": total, "source": "rss",
            "fetched_at": state.get("last_fetched_at"),
            "stale": self._stale(state.get("last_fetched_at")),
        }

    async def get(self, news_id):
        return await self.store.read("news", news_id)
