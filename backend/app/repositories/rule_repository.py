import json, logging
from datetime import date
from pathlib import Path

from app.core.errors import ApiError, ErrorCode

log = logging.getLogger("farmerx.rules")

_REQUIRED = {"rule_set_id", "version", "status", "crop_id", "region_id",
             "stage_id", "effective_from", "rules"}
_VALID_STATUS = {"draft", "approved", "deprecated"}
_TBD = "<TBD>"


def _version_key(version: str) -> tuple:
    try:
        return tuple(int(part) for part in version.split("."))
    except ValueError:
        return (0,)


def _contains_tbd(node) -> bool:
    if isinstance(node, str):
        return _TBD in node
    if isinstance(node, dict):
        return any(_contains_tbd(v) for v in node.values())
    if isinstance(node, list):
        return any(_contains_tbd(v) for v in node)
    return False


class RuleValidationError(ValueError):
    pass


class RuleRepository:
    def __init__(self, rules_dir: Path, config_repo):
        self.rules_dir = Path(rules_dir)
        self.config = config_repo
        self._by_key: dict[tuple, list[dict]] = {}
        self._all: dict[str, dict] = {}

    # --- loading ----------------------------------------------------------
    def load(self) -> None:
        """Atomic reload: on ANY failure the previous cache is kept."""
        all_sets: dict[str, dict] = {}
        by_key: dict[tuple, list[dict]] = {}

        for path in sorted(self.rules_dir.glob("*.json")):
            doc = json.loads(path.read_text(encoding="utf-8"))
            errors = self._validate(doc)
            rs_id = doc.get("rule_set_id") or path.stem
            if errors and doc.get("status") == "approved":
                raise RuleValidationError(
                    f"Approved rule set '{rs_id}' is invalid: {errors}")
            doc["_valid"] = not errors
            doc["_errors"] = errors
            all_sets[rs_id] = doc
            if doc["_valid"] and doc.get("status") == "approved":
                key = (doc["crop_id"], doc["region_id"], doc["stage_id"])
                by_key.setdefault(key, []).append(doc)

        for sets in by_key.values():
            sets.sort(key=lambda r: _version_key(r["version"]), reverse=True)

        self._all, self._by_key = all_sets, by_key
        log.info("rule sets loaded", extra={"extra_fields": {
            "total": len(all_sets),
            "approved_keys": len(by_key),
            "approved_sets": sum(len(v) for v in by_key.values()),
        }})

    def _validate(self, doc: dict) -> list[str]:
        errors = []
        missing = _REQUIRED - doc.keys()
        if missing:
            return [f"missing fields: {sorted(missing)}"]
        if doc["status"] not in _VALID_STATUS:
            errors.append(f"invalid status '{doc['status']}'")
        if doc["crop_id"] not in self.config.crops:
            errors.append(f"unknown crop_id '{doc['crop_id']}'")
        if doc["region_id"] not in self.config.regions:
            errors.append(f"unknown region_id '{doc['region_id']}'")
        if self.config.stage_for(doc["stage_id"], doc["crop_id"], doc["region_id"]) is None:
            errors.append("stage is not valid for this crop/region")
        try:
            date.fromisoformat(doc["effective_from"])
        except (TypeError, ValueError):
            errors.append("effective_from is not an ISO date")
        if not isinstance(doc["rules"], list):
            return errors + ["rules must be a list"]

        for idx, rule in enumerate(doc["rules"]):
            where = f"rules[{idx}]"
            if not rule.get("rule_id"):
                errors.append(f"{where}: missing rule_id")
            if not rule.get("then"):
                errors.append(f"{where}: 'then' must not be empty")
            errors.extend(self._validate_when(rule.get("when", {}), doc["region_id"],
                                              f"{where}.when"))
            for a_idx, action in enumerate(rule.get("then", [])):
                errors.extend(self._validate_action(action, doc["region_id"],
                                                    f"{where}.then[{a_idx}]"))

        # An approved rule set may never contain unresolved placeholders.
        if doc["status"] == "approved" and _contains_tbd(doc):
            errors.append("approved rule set contains unresolved <TBD> placeholders")
        return errors

    def _validate_when(self, node: dict, region_id: str, where: str) -> list[str]:
        errors = []
        if not isinstance(node, dict) or not node:
            return [f"{where}: condition must be a non-empty object"]
        for combinator in ("all", "any"):
            if combinator in node:
                for i, child in enumerate(node[combinator]):
                    errors.extend(self._validate_when(child, region_id,
                                                      f"{where}.{combinator}[{i}]"))
                return errors
        if "not" in node:
            return self._validate_when(node["not"], region_id, f"{where}.not")

        if node.get("param") not in self.config.soil_parameters:
            errors.append(f"{where}: unknown param '{node.get('param')}'")
        if "value_ref" in node and not self.config.thresholds.ref_is_resolvable(
                region_id, node["value_ref"]):
            errors.append(f"{where}: unresolvable value_ref '{node['value_ref']}'")
        return errors

    def _validate_action(self, action: dict, region_id: str, where: str) -> list[str]:
        errors = []
        if action.get("fertilizer_id") not in self.config.fertilizers:
            errors.append(f"{where}: unknown fertilizer_id '{action.get('fertilizer_id')}'")
        dose = action.get("dose") or {}
        if dose.get("basis") not in self.config.engine_config["limits"] and \
                dose.get("basis") not in ("per_acre", "per_hectare"):
            errors.append(f"{where}: invalid dose basis '{dose.get('basis')}'")
        if "value" not in dose:
            errors.append(f"{where}: dose.value missing")
        if not action.get("action_id"):
            errors.append(f"{where}: missing action_id")
        return errors

    # --- resolution -------------------------------------------------------
    def resolve(self, crop_id: str, region_id: str, stage_id: str,
                today: date | None = None) -> dict | None:
        today = today or date.today()
        candidates = self._by_key.get((crop_id, region_id, stage_id), [])
        for candidate in candidates:                      # already version-desc
            if date.fromisoformat(candidate["effective_from"]) <= today:
                return candidate
        return None

    def all_sets(self) -> list[dict]:
        return list(self._all.values())

    def status(self) -> dict:
        return {
            "total": len(self._all),
            "approved": sum(1 for s in self._all.values()
                            if s.get("status") == "approved" and s.get("_valid")),
            "invalid": [s["rule_set_id"] for s in self._all.values()
                        if not s.get("_valid")],
        }