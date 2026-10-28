import logging
from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any

from app.domain.units import UnitError, dec, round_to_step

log = logging.getLogger("farmerx.rule_engine")

OPS = {"lt", "lte", "gt", "gte", "between", "eq", "in", "not_in", "category_is"}


@dataclass(frozen=True)
class EngineItem:
    action_id: str
    fertilizer_id: str
    quantity_value: str
    quantity_unit: str
    quantity_breakdown: dict[str, Any]
    timing: str
    method: str
    reason_key: str
    cautions: tuple[str, ...]
    rule_id: str


@dataclass(frozen=True)
class EngineResult:
    status: str                                  # "ok" | "no_validated_rule"
    items: tuple[EngineItem, ...] = ()
    matched_rule_id: str | None = None
    cautions: tuple[str, ...] = ()
    missing: dict[str, Any] | None = None
    dose_generated: bool = False


class RuleEngine:
    def __init__(self, config_repo, engine_config: dict):
        self.config = config_repo
        self.units = config_repo.units
        self.thresholds = config_repo.thresholds
        self.step = dec(engine_config["rounding"]["quantity_step"])
        cap = engine_config["limits"]["max_dose_per_action"]
        self.cap_value = dec(cap["value"])
        self.cap_unit = cap["unit"]
        self.engine_version = engine_config["engine_version"]

    # --- public -----------------------------------------------------------
    def evaluate(self, *, soil_values: dict[str, Any], crop_id: str, region_id: str,
                 stage_id: str, area_value, area_unit: str, rule_set: dict | None) -> EngineResult:

        if rule_set is None:
            return EngineResult(
                status="no_validated_rule",
                missing={"crop_id": crop_id, "region_id": region_id,
                         "stage_id": stage_id, "reason": "no_approved_rule_set"},
            )

        matched = None
        for rule in rule_set["rules"]:
            if self._eval_when(rule.get("when", {}), soil_values, region_id):
                matched = rule
                break

        if matched is None:
            return EngineResult(
                status="no_validated_rule",
                missing={"crop_id": crop_id, "region_id": region_id, "stage_id": stage_id,
                         "rule_set_id": rule_set["rule_set_id"],
                         "reason": "no_rule_condition_matched"},
            )

        items, cautions = [], []
        for action in matched["then"]:
            item, item_cautions = self._build_item(action, matched, rule_set,
                                                   area_value, area_unit)
            items.append(item)
            cautions.extend(item_cautions)

        log.info("rule matched", extra={"extra_fields": {
            "rule_set_id": rule_set["rule_set_id"],
            "rule_set_version": rule_set["version"],
            "rule_id": matched["rule_id"],
            "actions": len(items),
        }})

        return EngineResult(status="ok", items=tuple(items),
                            matched_rule_id=matched["rule_id"],
                            cautions=tuple(dict.fromkeys(cautions)),
                            dose_generated=bool(items))

    # --- condition evaluation --------------------------------------------
    def _eval_when(self, node: dict, soil_values, region_id: str) -> bool:
        if "all" in node:
            return all(self._eval_when(n, soil_values, region_id) for n in node["all"])
        if "any" in node:
            return any(self._eval_when(n, soil_values, region_id) for n in node["any"])
        if "not" in node:
            return not self._eval_when(node["not"], soil_values, region_id)
        return self._eval_condition(node, soil_values, region_id)

    def _eval_condition(self, cond: dict, soil_values, region_id: str) -> bool:
        op = cond["op"]
        if op not in OPS:
            raise ValueError(f"Unsupported operator '{op}'.")
        param = cond["param"]
        raw = soil_values.get(param)
        if raw is None:
            return False                                   # absent input never matches
        value = dec(raw)

        if op == "category_is":
            return self.thresholds.classify(region_id, param, value) == cond["value"]

        if op == "between":
            return dec(cond["min"]) <= value <= dec(cond["max"])

        if op in ("in", "not_in"):
            values = [dec(v) for v in cond["values"]]
            contained = value in values
            return contained if op == "in" else not contained

        target = self._resolve_operand(cond, region_id)
        return {
            "lt": value < target, "lte": value <= target,
            "gt": value > target, "gte": value >= target,
            "eq": value == target,
        }[op]

    def _resolve_operand(self, cond: dict, region_id: str) -> Decimal:
        if "value_ref" in cond:
            return self.thresholds.resolve_ref(region_id, cond["value_ref"])
        return dec(cond["value"])

    # --- action materialisation ------------------------------------------
    def _build_item(self, action: dict, rule: dict, rule_set: dict,
                    area_value, area_unit: str) -> tuple[EngineItem, list[str]]:
        cautions = list(action.get("cautions", []))
        dose = action["dose"]
        dose_value = dec(dose["value"])
        dose_unit = dose["unit"]
        basis = dose["basis"]

        area_factor = self.units.area_factor(area_value, area_unit, basis)
        raw_quantity = dose_value * area_factor

        capped = False
        if dose_unit == self.cap_unit and raw_quantity > self.cap_value:
            raw_quantity, capped = self.cap_value, True
            cautions.append("caution.dose_capped")

        rounded = round_to_step(raw_quantity, self.step)

        breakdown = {
            "dose_per_basis": format(dose_value.normalize(), "f"),
            "basis": basis,
            "area": {"value": format(dec(area_value).normalize(), "f"), "unit": area_unit},
            "area_factor": format(area_factor.normalize(), "f"),
            "raw_quantity": format(raw_quantity.normalize(), "f"),
            "rounded_to": format(self.step.normalize(), "f"),
            "cap_applied": capped,
            "unit": dose_unit,
        }

        return EngineItem(
            action_id=action["action_id"],
            fertilizer_id=action["fertilizer_id"],
            quantity_value=format(rounded.normalize(), "f"),
            quantity_unit=dose_unit,
            quantity_breakdown=breakdown,
            timing=action.get("timing", ""),
            method=action.get("method", ""),
            reason_key=action.get("reason_key", ""),
            cautions=tuple(cautions),
            rule_id=rule["rule_id"],
        ), cautions