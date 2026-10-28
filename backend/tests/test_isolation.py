def test_cross_farmer_access_is_404(client, farmer_headers, other_farmer_headers, valid_payload):
    rec = client.post("/api/v1/recommendations", json=valid_payload,
                      headers=farmer_headers).json()
    r = client.get(f"/api/v1/recommendations/{rec['recommendation_id']}",
                   headers=other_farmer_headers)
    assert r.status_code == 404


def test_soil_report_isolation(client, farmer_headers, other_farmer_headers, valid_payload):
    report = client.post("/api/v1/soil-reports",
                         json={"values": valid_payload["soil_values"]},
                         headers=farmer_headers).json()
    r = client.get(f"/api/v1/soil-reports/{report['report_id']}",
                   headers=other_farmer_headers)
    assert r.status_code == 404


def test_history_is_scoped(client, farmer_headers, other_farmer_headers, valid_payload):
    client.post("/api/v1/recommendations", json=valid_payload, headers=farmer_headers)
    other = client.get("/api/v1/recommendations", headers=other_farmer_headers).json()
    assert other["total"] == 0


def test_missing_farmer_header_is_401(client, valid_payload):
    assert client.post("/api/v1/recommendations", json=valid_payload).status_code == 401