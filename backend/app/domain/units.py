from decimal import Decimal, ROUND_HALF_UP


class UnitError(ValueError):
    pass


def dec(value) -> Decimal:
    return value if isinstance(value, Decimal) else Decimal(str(value))


def round_to_step(value: Decimal, step: Decimal) -> Decimal:
    if step <= 0:
        return value
    return (value / step).quantize(Decimal("1"), rounding=ROUND_HALF_UP) * step


class UnitRegistry:
    """Built from config/units.json. No conversion factor lives in code."""

    def __init__(self, doc: dict):
        self._area = {u["id"]: u for u in doc["area"]}
        self._quantity = {u["id"]: u for u in doc["quantity"]}
        self._basis = doc["basis"]
        self._area_base = doc["area_base_unit"]
        self._quantity_base = doc["quantity_base_unit"]

    # --- area -------------------------------------------------------------
    def _area_factor_to_base(self, unit_id: str) -> Decimal:
        unit = self._area.get(unit_id)
        if unit is None:
            raise UnitError(f"Unknown area unit '{unit_id}'.")
        if not unit.get("available", False):
            raise UnitError(f"Area unit '{unit_id}' is not available for this region yet.")
        return dec(unit["to_base_factor"])

    def area_to_base(self, value, unit_id: str) -> Decimal:
        return dec(value) * self._area_factor_to_base(unit_id)

    def area_factor(self, value, unit_id: str, basis: str) -> Decimal:
        """Multiplier that converts a per-basis dose into a total for this area."""
        if basis not in self._basis:
            raise UnitError(f"Unknown dose basis '{basis}'.")
        basis_unit = self._basis[basis]["unit"]
        return self.area_to_base(value, unit_id) / self._area_factor_to_base(basis_unit)

    # --- quantity ---------------------------------------------------------
    def quantity_factor_to_base(self, unit_id: str) -> Decimal:
        unit = self._quantity.get(unit_id)
        if unit is None:
            raise UnitError(f"Unknown quantity unit '{unit_id}'.")
        if not unit.get("available", False):
            raise UnitError(f"Quantity unit '{unit_id}' is not available yet.")
        return dec(unit["to_base_factor"])

    def convert_quantity(self, value, from_unit: str, to_unit: str) -> Decimal:
        base = dec(value) * self.quantity_factor_to_base(from_unit)
        return base / self.quantity_factor_to_base(to_unit)

    def is_area_unit_available(self, unit_id: str) -> bool:
        unit = self._area.get(unit_id)
        return bool(unit and unit.get("available", False))