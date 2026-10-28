from decimal import Decimal
from app.domain.snapshot import input_hash


def test_hash_is_key_order_independent():
    a = {"N": Decimal("100"), "crop": "wheat", "area": {"value": Decimal("2"), "unit": "acre"}}
    b = {"area": {"unit": "acre", "value": Decimal("2")}, "crop": "wheat", "N": Decimal("100")}
    assert input_hash(a) == input_hash(b)


def test_hash_distinguishes_values():
    assert input_hash({"N": Decimal("100")}) != input_hash({"N": Decimal("100.1")})


def test_float_and_decimal_strings_are_equivalent():
    assert input_hash({"v": 2.0}) == input_hash({"v": Decimal("2")})