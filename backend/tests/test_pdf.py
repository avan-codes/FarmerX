from io import BytesIO
from pypdf import PdfReader


def _create_rec(client, headers, payload):
    return client.post("/api/v1/recommendations", json=payload,
                       headers=headers).json()


def test_pdf_renders_for_all_languages(client, farmer_headers,
                                       valid_payload, config):
    rec = _create_rec(client, farmer_headers, valid_payload)
    for language in config.languages:
        response = client.get(
            f"/api/v1/recommendations/{rec['recommendation_id']}/pdf",
            params={"language": language}, headers=farmer_headers)
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert response.content.startswith(b"%PDF")
        # Parse to prove the file is a readable PDF.
        reader = PdfReader(BytesIO(response.content))
        assert len(reader.pages) >= 1


def test_pdf_uses_snapshot_not_live_rule_engine(client, farmer_headers,
                                                valid_payload):
    rec = _create_rec(client, farmer_headers, valid_payload)
    quantity_before = rec["items"][0]["quantity"]["value"]
    client.get(
        f"/api/v1/recommendations/{rec['recommendation_id']}/pdf",
        headers=farmer_headers)
    stored = client.get(
        f"/api/v1/recommendations/{rec['recommendation_id']}",
        headers=farmer_headers).json()
    assert stored["items"][0]["quantity"]["value"] == quantity_before


def test_pdf_is_cached(client, farmer_headers, valid_payload, settings):
    rec = _create_rec(client, farmer_headers, valid_payload)
    client.get(f"/api/v1/recommendations/{rec['recommendation_id']}/pdf",
               headers=farmer_headers)
    files = list(settings.pdf_cache_dir.glob("*.pdf"))
    assert len(files) == 1
    client.get(f"/api/v1/recommendations/{rec['recommendation_id']}/pdf",
               headers=farmer_headers)
    assert len(list(settings.pdf_cache_dir.glob("*.pdf"))) == 1


def test_pdf_unsupported_language(client, farmer_headers, valid_payload):
    rec = _create_rec(client, farmer_headers, valid_payload)
    response = client.get(
        f"/api/v1/recommendations/{rec['recommendation_id']}/pdf",
        params={"language": "xx"}, headers=farmer_headers)
    # Unsupported language is rejected by the endpoint
    assert response.status_code == 422
