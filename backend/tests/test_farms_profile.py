def test_farm_crud_and_isolation(client, farmer_headers,
                                 other_farmer_headers):
    farm = client.post("/api/v1/farms", headers=farmer_headers, json={
        "farm_name": "North field", "area_value": 2, "area_unit": "acre",
        "state": "Punjab", "district": "Ludhiana"}).json()
    assert farm["farm_id"].startswith("farm_")
    assert client.get(f"/api/v1/farms/{farm['farm_id']}",
                      headers=other_farmer_headers).status_code == 404


def test_bigha_farm_rejected(client, farmer_headers):
    response = client.post("/api/v1/farms", headers=farmer_headers, json={
        "farm_name": "X", "area_value": 1, "area_unit": "bigha"})
    assert response.status_code == 422


def test_profile_upsert(client, farmer_headers):
    body = client.put("/api/v1/profile", headers=farmer_headers, json={
        "name": "Asha", "preferred_language": "hi",
        "commonly_grown_crops": ["wheat"]}).json()
    assert body["preferred_language"] == "hi"
    assert client.get("/api/v1/profile",
                      headers=farmer_headers).json()["name"] == "Asha"


def test_device_auth_issues_farmer_id(client):
    body = client.post("/api/v1/auth/device").json()
    assert body["farmer_id"].startswith("dev_")
    assert body["scheme"] == "device"
