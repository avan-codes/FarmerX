import pytest
from app.domain.guardrails import check_text


@pytest.fixture
def rec(config):
    return {
        "recommendation_id": "rec_test",
        "user_id": "farmer_A",
        "status": "ok",
        "input_hash": "sha256:abc",
        "context": {"crop": "testcrop", "region": "TESTREGION",
                    "stage": "basal",
                    "farm_area": {"value": "2", "unit": "acre"},
                    "language": "en"},
        "soil_parameters": [{"param": "N", "value": "100", "unit": "kg/ha",
                             "category": "low"}],
        "items": [{
            "fertilizer": {"id": "urea", "name": "Urea"},
            "quantity": {"value": "100", "unit": "kg", "display": "100 kg"},
            "quantity_breakdown": {"dose_per_basis": "50", "basis": "per_acre",
                                   "raw_quantity": "100", "unit": "kg"},
            "timing": "basal", "timing_label": "Basal",
            "method": "broadcast", "method_label": "Broadcast",
            "reason": "N is low.", "cautions": [], "source": {},
        }],
        "cautions": [],
        "disclaimer": "Calculated from validated rules.",
        "message": None,
    }


def test_allows_exact_total(rec, config):
    result = check_text("Apply 100 kg of urea at sowing.", rec, config)
    assert result.passed and not result.redacted


def test_allows_per_acre_breakdown(rec, config):
    result = check_text("Apply 50 kg urea per acre at sowing.", rec, config)
    assert result.passed


def test_blocks_fabricated_dose(rec, config):
    result = check_text("Apply 500 kg of urea at sowing.", rec, config)
    assert not result.passed
    assert result.violations[0]["code"] == "UNGROUNDED_QUANTITY"
    assert "500" not in result.safe_text


def test_blocks_unknown_fertilizer(rec, config):
    result = check_text("Apply 100 kg DAP at sowing.", rec, config)
    assert not result.passed
    assert any(v["code"] == "UNKNOWN_FERTILIZER" for v in result.violations)


def test_allows_area_context(rec, config):
    result = check_text("For your 2 acres, apply 100 kg urea.", rec, config)
    assert result.passed


def test_ignores_soil_values(rec, config):
    result = check_text("Your nitrogen is 100 kg/ha. Apply 100 kg urea.",
                        rec, config)
    assert result.passed


def test_blocks_hindi_fabrication(rec, config):
    result = check_text("यूरिया 500 किग्रा डालें।", rec, config)
    assert not result.passed
    assert "500" not in result.safe_text


def test_blocks_unsupported_litre(rec, config):
    result = check_text("Spray 2 litres of urea.", rec, config)
    assert not result.passed
    assert any(v["code"] == "UNSUPPORTED_UNIT" for v in result.violations)
