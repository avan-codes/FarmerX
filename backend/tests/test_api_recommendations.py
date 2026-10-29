def test_health(client):
    body = client.get("/api/v1/health").json()
    assert body["status"] == "ok"
    assert body["rule_sets"]["approved"] >= 1
    assert body["ai"]["status"] == "configured"
    assert body["ai"]["provider"] == "nim"


def test_config_endpoints_are_config_driven(client):
    crops = client.get("/api/v1/config/crops").json()
    assert crops["total"] >= 1
    assert {c["id"] for c in crops["items"]} >= {"wheat", "rice"}
    assert client.get("/api/v1/config/soil-parameters").json()["total"] == 5


def test_create_recommendation_ok(client, farmer_headers, valid_payload):
    r = client.post("/api/v1/recommendations", json=valid_payload, headers=farmer_headers)
    assert r.status_code == 201
    body = r.json()
    assert body["status"] == "ok" and body["dose_generated"] is True
    assert body["input_hash"].startswith("sha256:")
    assert body["engine_version"] == "1.0.0"
    assert body["rule_set_id"] == "rs_in-pb_wheat_basal_v1"
    assert body["items"][0]["source"]["rule_set_version"] == "1.0.0"
    assert body["ai_summary"] is None


def test_input_hash_ignores_language(client, farmer_headers, valid_payload):
    a = client.post("/api/v1/recommendations", json=valid_payload, headers=farmer_headers).json()
    hindi = {**valid_payload, "language": "hi"}
    b = client.post("/api/v1/recommendations", json=hindi, headers=farmer_headers).json()
    assert a["input_hash"] == b["input_hash"]
    assert b["items"][0]["fertilizer"]["name"] == "यूरिया"


def test_all_sufficient_returns_soil_adequate(client, farmer_headers, valid_payload):
    # All nutrients sufficient -> adequacy rule matches -> no chemical fertilizer needed.
    payload = {**valid_payload,
               "soil_values": {"N": 400, "P": 50, "K": 400, "pH": 6.8, "OC": 1.0}}
    r = client.post("/api/v1/recommendations", json=payload, headers=farmer_headers)
    assert r.status_code == 201
    body = r.json()
    assert body["status"] == "ok"
    assert body["dose_generated"] is True
    assert body["message"] is None
    assert body["matched_rule_id"].endswith("_soil_adequate")
    item = body["items"][0]
    assert item["fertilizer"]["id"] == "vermicompost"
    assert item["quantity"]["value"] == "0"
    assert "adequate" in item["reason"].lower()


def test_missing_soil_value_returns_no_validated_rule(client, farmer_headers,
                                                      valid_payload):
    # Missing K -> no rule can match (adequacy needs all three nutrients) -> no dose.
    payload = {**valid_payload, "soil_values": {"N": 400, "P": 50}}
    r = client.post("/api/v1/recommendations", json=payload, headers=farmer_headers)
    assert r.status_code == 201
    body = r.json()
    assert body["status"] == "no_validated_rule"
    assert body["items"] == [] and body["dose_generated"] is False
    assert body["rule_set_version"] is not None
    assert body["matched_rule_id"] is None


def test_unknown_crop_is_rejected(client, farmer_headers, valid_payload):
    r = client.post("/api/v1/recommendations",
                    json={**valid_payload, "crop_id": "nope"}, headers=farmer_headers)
    assert r.status_code == 422
    assert r.json()["code"] == "VALIDATION_ERROR"


def test_bigha_is_unavailable(client, farmer_headers, valid_payload):
    r = client.post("/api/v1/recommendations",
                    json={**valid_payload, "area": {"value": 1, "unit": "bigha"}},
                    headers=farmer_headers)
    assert r.status_code == 422


def test_soil_value_out_of_range_rejected(client, farmer_headers, valid_payload):
    bad = {**valid_payload, "soil_values": {**valid_payload["soil_values"], "pH": 22}}
    r = client.post("/api/v1/recommendations", json=bad, headers=farmer_headers)
    assert r.status_code == 422


def test_idempotency_key_returns_same_recommendation(client, farmer_headers, valid_payload):
    headers = {**farmer_headers, "Idempotency-Key": "abc"}
    a = client.post("/api/v1/recommendations", json=valid_payload, headers=headers).json()
    b = client.post("/api/v1/recommendations", json=valid_payload, headers=headers).json()
    assert a["recommendation_id"] == b["recommendation_id"]


def test_report_flow_and_history(client, farmer_headers, valid_payload):
    report = client.post("/api/v1/soil-reports",
                         json={"values": valid_payload["soil_values"]},
                         headers=farmer_headers).json()
    assert report["display_ref"] == "SR-0001"

    payload = {k: v for k, v in valid_payload.items() if k != "soil_values"}
    payload["report_id"] = report["report_id"]
    rec = client.post("/api/v1/recommendations", json=payload, headers=farmer_headers).json()
    assert rec["report_id"] == report["report_id"]

    history = client.get("/api/v1/recommendations?q=urea", headers=farmer_headers).json()
    assert history["total"] >= 1


def test_draft_rule_set_is_never_eligible(settings, farmer_headers, valid_payload):
    """The shipped template is draft + <TBD>; it must never produce a dose.

    All crop/region/stage combinations now have approved rule sets, so the
    draft template must never be the source of a dose.
    """
    from fastapi.testclient import TestClient
    from app.main import create_app
    import shutil
    shutil.copy("data/rule_sets/rs_template_v0.json",
                settings.rules_dir / "rs_template_v0.json")
    with TestClient(create_app(settings)) as c:
        # Missing K -> adequacy needs all three nutrients -> no match,
        # draft template or not.
        missing = {**valid_payload, "soil_values": {"N": 400, "P": 50}}
        body = c.post("/api/v1/recommendations", json=missing, headers=farmer_headers).json()
        assert body["status"] == "no_validated_rule"
        assert body["items"] == [] and body["dose_generated"] is False
        assert body["matched_rule_id"] is None
        assert body["matched_rule_id"] != "r_template_n_low"

        # Basal is covered by the approved rule set, not the draft template.
        covered = {**valid_payload,
                   "soil_values": {**valid_payload["soil_values"], "N": 40}}
        body = c.post("/api/v1/recommendations", json=covered, headers=farmer_headers).json()
        assert body["status"] == "ok"
        assert body["dose_generated"] is True
        assert body["rule_set_id"] == "rs_in-pb_wheat_basal_v1"
        assert body["matched_rule_id"] == "r_wheat_IN-PB_basal_n_low"
        assert body["items"][0]["source"]["rule_id"] != "r_template_n_low"