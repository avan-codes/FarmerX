async def test_empty_news_is_unavailable(client, farmer_headers):
    body = client.get("/api/v1/news", headers=farmer_headers).json()
    assert body["items"] == []
    assert body["reason"] == "NEWS_UNAVAILABLE"


async def test_ingest_dedupes_by_url(client, farmer_headers, news_service):
    await news_service.ingest()
    first_total = (client.get("/api/v1/news",
                              headers=farmer_headers).json())["total"]
    await news_service.ingest()
    second_total = (client.get("/api/v1/news",
                               headers=farmer_headers).json())["total"]
    assert second_total == first_total


async def test_category_filter(client, farmer_headers, news_service):
    await news_service.ingest()
    body = client.get("/api/v1/news", params={"category": "markets"},
                      headers=farmer_headers).json()
    assert all(item["category"] == "markets" for item in body["items"])


async def test_news_get_item(client, farmer_headers, news_service):
    await news_service.ingest()
    body = client.get("/api/v1/news", headers=farmer_headers).json()
    if body["total"] > 0:
        news_id = body["items"][0]["news_id"]
        item = client.get(f"/api/v1/news/{news_id}",
                          headers=farmer_headers).json()
        assert item["news_id"] == news_id
