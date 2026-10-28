def test_health_includes_all_subsystems(client):
    body = client.get("/api/v1/health").json()
    for key in ("store", "rule_sets", "engine_version", "ai",
                "market_prices", "news"):
        assert key in body


def test_request_id_header(client):
    response = client.get("/api/v1/config/crops")
    assert response.headers["X-Request-Id"]
    assert response.headers["X-Elapsed-Ms"].isdigit()


def test_admin_ai_audit_endpoint(client):
    # Non-admin should fail (no X-Admin-Key header)
    response = client.get("/api/v1/admin/audit/ai")
    assert response.status_code == 403


def test_admin_ai_audit_endpoint_with_key(client):
    response = client.get("/api/v1/admin/audit/ai",
                          headers={"X-Admin-Key": "dev-admin-key"})
    assert response.status_code == 200
    body = response.json()
    assert "items" in body
    assert "total" in body
