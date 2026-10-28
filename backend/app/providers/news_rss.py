"""RSS news provider for PIB and The Hindu agri-business feeds."""

import hashlib
from datetime import datetime, timezone

import feedparser
import httpx


class NewsFeedError(RuntimeError):
    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code


class RSSNewsProvider:
    name = "rss"

    def __init__(self, *, feeds: list, timeout_s: float = 15.0):
        self._feeds = [f for f in feeds if f]
        self._client = httpx.AsyncClient(timeout=timeout_s,
                                         follow_redirects=True)

    async def aclose(self) -> None:
        await self._client.aclose()

    async def fetch(self) -> list:
        articles = []
        for url in self._feeds:
            try:
                response = await self._client.get(url)
                response.raise_for_status()
            except httpx.HTTPError as exc:
                raise NewsFeedError("NEWS_UNAVAILABLE",
                                    f"{url}: {exc}") from exc
            parsed = feedparser.parse(response.content)
            for entry in parsed.entries:
                link = (entry.get("link") or "").strip()
                if not link:
                    continue
                published = entry.get("published_parsed") or entry.get(
                    "updated_parsed")
                if published:
                    published_at = datetime(
                        *published[:6], tzinfo=timezone.utc).isoformat()
                else:
                    published_at = datetime.now(timezone.utc).isoformat()
                articles.append({
                    "news_id": "news_" + hashlib.sha256(
                        link.encode()).hexdigest()[:24],
                    "title": entry.get("title", "").strip(),
                    "summary": (entry.get("summary")
                                or entry.get("description") or "").strip(),
                    "publisher": (parsed.feed.get("title")
                                  or url.split("/")[2]),
                    "published_at": published_at,
                    "url": link,
                    "source": url,
                    "url_hash": hashlib.sha256(link.encode()).hexdigest(),
                })
        return articles
