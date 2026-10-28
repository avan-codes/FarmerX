from decimal import Decimal
import pytest
from app.domain.units import UnitRegistry, UnitError, round_to_step

DOC = {
    "area_base_unit": "hectare", "quantity_base_unit": "kg",
    "area": [
        {"id": "hectare", "to_base_factor": "1", "available": True},
        {"id": "acre", "to_base_factor": "0.40468564224", "available": True},
        {"id": "bigha", "available": False},
    ],
    "quantity": [
        {"id": "kg", "to_base_factor": "1", "available": True},
        {"id": "g", "to_base_factor": "0.001", "available": True},
        {"id": "l", "available": False},
    ],
    "basis": {"per_acre": {"unit": "acre"}, "per_hectare": {"unit": "hectare"}},
}


def test_per_acre_factor_for_two_acres():
    reg = UnitRegistry(DOC)
    assert reg.area_factor(Decimal("2"), "acre", "per_acre") == Decimal("2")


def test_per_hectare_basis_converts_acres():
    reg = UnitRegistry(DOC)
    factor = reg.area_factor(Decimal("2"), "acre", "per_hectare")
    assert round(float(factor), 8) == round(2 * 0.40468564224, 8)


def test_unavailable_unit_raises():
    with pytest.raises(UnitError):
        UnitRegistry(DOC).area_factor(Decimal("1"), "bigha", "per_acre")


def test_round_to_step():
    assert round_to_step(Decimal("101.24"), Decimal("0.1")) == Decimal("101.2")
    assert round_to_step(Decimal("101.25"), Decimal("0.1")) == Decimal("101.3")