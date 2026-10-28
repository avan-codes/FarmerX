import json
from datetime import date
from decimal import Decimal
from pathlib import Path

import pytest

from app.domain.rule_engine import RuleEngine
from app.repositories.config_repository import ConfigRepository

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.fixture(scope="module")
def config():
    repo = ConfigRepository(FIXTURES / "config")
    repo.load()
    return repo


@pytest.fixture(scope="module")
def engine(config):
    return RuleEngine(config, json.loads((FIXTURES / "config" / "rule_engine.json").read_text()))


@pytest.fixture(scope="module")
def rule_set():
    return json.loads(
        (FIXTURES / "rule_sets" / "rs_testregion_testcrop_basal_v1.json").read_text())


def _run(engine, rule_set, n="100", area="2", unit="acre"):
    return engine.evaluate(
        soil_values={"N": Decimal(n)}, crop_id="testcrop", region_id="TESTREGION",
        stage_id="basal", area_value=Decimal(area), area_unit=unit, rule_set=rule_set)


def test_golden_low_nitrogen(engine, rule_set):
    result = _run(engine, rule_set)
    assert result.status == "ok" and result.dose_generated
    assert result.matched_rule_id == "r_fixture_n_low"
    assert len(result.items) == 1
    item = result.items[0]
    assert item.fertilizer_id == "urea"
    assert item.quantity_value == "100"              # 50 kg/acre × 2 acres
    assert item.quantity_breakdown == {
        "dose_per_basis": "50", "basis": "per_acre",
        "area": {"value": "2", "unit": "acre"},
        "area_factor": "2", "raw_quantity": "100",
        "rounded_to": "0.1", "cap_applied": False, "unit": "kg",
    }


def test_golden_hectare_scaling(engine, rule_set):
    result = _run(engine, rule_set, area="1", unit="hectare")
    # 1 ha / 1 acre = 2.4710538147 → 50 × 2.4710538147 ≈ 123.55 → 123.6
    assert result.items[0].quantity_value == "123.6"


def test_determinism_100_runs(engine, rule_set):
    first = _run(engine, rule_set)
    for _ in range(99):
        again = _run(engine, rule_set)
        assert again == first


def test_high_nitrogen_does_not_match(engine, rule_set):
    result = _run(engine, rule_set, n="900")
    assert result.status == "no_validated_rule"
    assert result.items == ()
    assert result.dose_generated is False
    assert result.missing["reason"] == "no_rule_condition_matched"


def test_missing_rule_set_never_falls_back(engine):
    result = engine.evaluate(
        soil_values={"N": Decimal("100")}, crop_id="testcrop",
        region_id="TESTREGION", stage_id="basal", area_value=Decimal("2"),
        area_unit="acre", rule_set=None)
    assert result.status == "no_validated_rule"
    assert result.items == () and result.dose_generated is False


def test_dose_cap_is_applied(engine, rule_set, config):
    capped = json.loads(json.dumps(rule_set))
    capped["rules"][0]["then"][0]["dose"]["value"] = "900"   # × 2 acres = 1800 > 500 cap
    result = engine.evaluate(
        soil_values={"N": Decimal("100")}, crop_id="testcrop",
        region_id="TESTREGION", stage_id="basal", area_value=Decimal("2"),
        area_unit="acre", rule_set=capped)
    assert result.items[0].quantity_value == "500"
    assert result.items[0].quantity_breakdown["cap_applied"] is True
    assert "caution.dose_capped" in result.cautions