from dataclasses import dataclass
from decimal import Decimal

from app.domain.units import dec

LOW, MEDIUM, HIGH = "low", "medium", "high"


@dataclass(frozen=True)
class ParamThresholds:
    low_below: Decimal
    high_from: Decimal


class ThresholdRegistry:
    """Built from config/soil_thresholds.json. Unset entries stay `None`
    and are treated as *unvalidated* — never guessed."""

    def __init__(self, doc: dict):
        self._by_region: dict[str, dict[str, ParamThresholds | None]] = {}
        for region_id, payload in doc.get("regions", {}).items():
            params = {}
            for param_id, entry in payload.get("parameters", {}).items():
                if not entry or not entry.get("validated", False):
                    params[param_id] = None
                    continue
                params[param_id] = ParamThresholds(
                    low_below=dec(entry["low_below"]),
                    high_from=dec(entry["high_from"]),
                )
            self._by_region[region_id] = params

    def get(self, region_id: str, param_id: str) -> ParamThresholds | None:
        return self._by_region.get(region_id, {}).get(param_id)

    def classify(self, region_id: str, param_id: str, value) -> str | None:
        thresholds = self.get(region_id, param_id)
        if thresholds is None:
            return None
        v = dec(value)
        if v < thresholds.low_below:
            return LOW
        if v >= thresholds.high_from:
            return HIGH
        return MEDIUM

    def resolve_ref(self, region_id: str, ref: str) -> Decimal:
        """`thresholds.N.low` -> low_below for N in this region."""
        parts = ref.split(".")
        if len(parts) != 3 or parts[0] != "thresholds":
            raise ValueError(f"Unsupported value_ref '{ref}'.")
        _, param_id, bound = parts
        thresholds = self.get(region_id, param_id)
        if thresholds is None:
            raise ValueError(
                f"Threshold for '{param_id}' in region '{region_id}' is not validated.")
        if bound == "low":
            return thresholds.low_below
        if bound == "high":
            return thresholds.high_from
        raise ValueError(f"Unsupported threshold bound '{bound}'.")

    def ref_is_resolvable(self, region_id: str, ref: str) -> bool:
        try:
            self.resolve_ref(region_id, ref)
            return True
        except ValueError:
            return False