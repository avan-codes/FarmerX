import re
from dataclasses import dataclass, field
from decimal import Decimal, InvalidOperation

NUMBER_RE = re.compile(
    r"(?<![\w.])(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)(?:\s*([^\s,.;:!?()]+))?",
    re.UNICODE)
SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?।])\s+")

AREA_UNITS = {
    "acre", "acres", "hectare", "hectares", "ha",
    "bigha", "bighas", "एकड़", "हेक्टेयर", "एकर", "हेक्टर",
}
QUANTITY_UNITS = {
    "kg": Decimal("1"), "kgs": Decimal("1"),
    "kilogram": Decimal("1"), "kilograms": Decimal("1"), "किग्रा": Decimal("1"),
    "g": Decimal("0.001"), "gm": Decimal("0.001"),
    "gram": Decimal("0.001"), "grams": Decimal("0.001"), "ग्राम": Decimal("0.001"),
    "quintal": Decimal("100"), "quintals": Decimal("100"), "q": Decimal("100"),
    "क्विंटल": Decimal("100"),
    "ton": Decimal("1000"), "tons": Decimal("1000"),
    "tonne": Decimal("1000"), "tonnes": Decimal("1000"), "टन": Decimal("1000"),
}
UNSUPPORTED_QUANTITY_UNITS = {
    "l", "litre", "litres", "liter", "liters", "ml",
    "लीटर", "मिलीलीटर",
}
IMPERATIVE_VERBS = (
    "apply", "use", "spray", "add", "mix", "broadcast", "drill", "band",
    "place", "drench", "डालें", "दें", "छिड़कें", "उपयोग करें", "मिलाएं",
)
RATE_MARKERS_PER_ACRE = ("per acre", "/acre", "प्रति एकड़")
RATE_MARKERS_PER_HECTARE = ("per hectare", "/hectare", "/ha",
                            "per ha", "प्रति हेक्टेयर")


@dataclass(frozen=True)
class AllowedNumbers:
    totals_kg: frozenset[Decimal]
    per_acre_kg: frozenset[Decimal]
    per_hectare_kg: frozenset[Decimal]
    soil_by_unit: dict[str, frozenset[Decimal]]

    def scalar_candidates(self) -> frozenset[Decimal]:
        return self.totals_kg | self.per_acre_kg | self.per_hectare_kg


@dataclass
class GuardrailResult:
    passed: bool
    redacted: bool
    safe_text: str
    violations: list[dict] = field(default_factory=list)

    def as_dict(self) -> dict:
        return {"passed": self.passed, "redacted": self.redacted,
                "violations": self.violations}


def _round(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"))


def _to_decimal(raw: str) -> Decimal:
    return Decimal(raw.replace(",", ""))


def _kg(value: Decimal, unit: str) -> Decimal | None:
    factor = QUANTITY_UNITS.get(unit.lower())
    return _round(value * factor) if factor is not None else None


def build_allowed(recommendation: dict) -> AllowedNumbers:
    totals, per_acre, per_hectare = set(), set(), set()
    soil_by_unit: dict[str, set[Decimal]] = {}

    for item in recommendation.get("items", []):
        unit = str(item["quantity"]["unit"])
        try:
            total = _kg(Decimal(str(item["quantity"]["value"])), unit)
        except (InvalidOperation, KeyError):
            total = None
        if total is not None:
            totals.add(total)

        breakdown = item.get("quantity_breakdown", {})
        dose_raw = breakdown.get("dose_per_basis")
        basis = breakdown.get("basis")
        if dose_raw is not None:
            try:
                dose = _kg(Decimal(str(dose_raw)), unit)
            except InvalidOperation:
                dose = None
            if dose is not None:
                if basis == "per_acre":
                    per_acre.add(dose)
                elif basis == "per_hectare":
                    per_hectare.add(dose)

        raw = breakdown.get("raw_quantity")
        if raw is not None:
            try:
                raw_kg = _kg(Decimal(str(raw)), unit)
            except InvalidOperation:
                raw_kg = None
            if raw_kg is not None:
                totals.add(raw_kg)

    for param in recommendation.get("soil_parameters", []):
        try:
            value = _round(Decimal(str(param["value"])))
        except (InvalidOperation, KeyError):
            continue
        soil_by_unit.setdefault(str(param.get("unit", "")), set()).add(value)

    return AllowedNumbers(
        totals_kg=frozenset(totals),
        per_acre_kg=frozenset(per_acre),
        per_hectare_kg=frozenset(per_hectare),
        soil_by_unit={unit: frozenset(vals)
                      for unit, vals in soil_by_unit.items()},
    )


def _fertilizer_aliases(config) -> dict[str, set[str]]:
    aliases: dict[str, set[str]] = {}
    for fid, fert in config.fertilizers.items():
        names = {fid.lower(), str(fert.get("label_key", fid)).lower()}
        for table in config.translations.values():
            label = table.get(fert.get("label_key", fid))
            if label:
                names.add(str(label).lower())
        aliases[fid] = {name for name in names if len(name) >= 3}
    return aliases


def _mentioned_fertilizers(text: str, aliases: dict[str, set[str]]) -> set[str]:
    lowered = text.lower()
    found = set()
    for fid, names in aliases.items():
        if any(name in lowered for name in names):
            found.add(fid)
    return found


def _has_imperative(text: str) -> bool:
    lowered = text.lower()
    return any(verb in lowered for verb in IMPERATIVE_VERBS)


def _check_sentence(sentence: str, allowed: AllowedNumbers,
                    item_fids: set[str], aliases: dict[str, set[str]],
                    mention_any: bool) -> list[dict]:
    violations: list[dict] = []
    mentioned = _mentioned_fertilizers(sentence, aliases)
    unknown = mentioned - item_fids
    if unknown:
        violations.append({
            "code": "UNKNOWN_FERTILIZER",
            "sentence": sentence,
            "detail": f"Fertilizer(s) not in recommendation: {sorted(unknown)}",
        })

    imperative = _has_imperative(sentence)
    scalar_candidates = allowed.scalar_candidates()

    for match in NUMBER_RE.finditer(sentence):
        raw_number = match.group(1)
        unit_token = (match.group(2) or "").lower().strip(".,;:!?")
        start, end = match.span()
        window = sentence[max(0, start - 50):min(len(sentence), end + 70)].lower()

        try:
            number = _round(_to_decimal(raw_number))
        except InvalidOperation:
            continue

        # Area values are context, never doses.
        if unit_token in AREA_UNITS:
            continue

        rate_per_acre = any(marker in window
                            for marker in RATE_MARKERS_PER_ACRE)
        rate_per_hectare = any(marker in window
                               for marker in RATE_MARKERS_PER_HECTARE)
        has_quantity_unit = unit_token in QUANTITY_UNITS
        unsupported_unit = unit_token in UNSUPPORTED_QUANTITY_UNITS
        dose_context = bool(mentioned) or imperative or has_quantity_unit \
            or unsupported_unit or rate_per_acre or rate_per_hectare

        if not dose_context:
            continue

        if unsupported_unit:
            if mentioned or imperative:
                violations.append({
                    "code": "UNSUPPORTED_UNIT",
                    "sentence": sentence,
                    "detail": f"Unsupported quantity unit '{unit_token}'.",
                })
            continue

        # kg/ha, kg/hectare, kg/acre are rates; compare to soil values or
        # per-basis doses, not to total quantities.
        if unit_token in ("kg/ha", "kg/hectare"):
            if number in allowed.soil_by_unit.get("kg/ha", frozenset()) \
                    or number in allowed.per_hectare_kg:
                continue
            violations.append({
                "code": "UNGROUNDED_QUANTITY",
                "sentence": sentence,
                "detail": f"Ungrounded rate {raw_number} {unit_token}.",
            })
            continue
        if unit_token in ("kg/acre",):
            if number in allowed.per_acre_kg:
                continue
            violations.append({
                "code": "UNGROUNDED_QUANTITY",
                "sentence": sentence,
                "detail": f"Ungrounded rate {raw_number} {unit_token}.",
            })
            continue

        if has_quantity_unit:
            kg_value = _kg(number, unit_token)
            if kg_value is None:
                continue
            if rate_per_acre:
                if kg_value in allowed.per_acre_kg:
                    continue
                violations.append({
                    "code": "UNGROUNDED_QUANTITY",
                    "sentence": sentence,
                    "detail": f"Ungrounded per-acre dose {raw_number} {unit_token}.",
                })
                continue
            if rate_per_hectare:
                if kg_value in allowed.per_hectare_kg:
                    continue
                violations.append({
                    "code": "UNGROUNDED_QUANTITY",
                    "sentence": sentence,
                    "detail": f"Ungrounded per-hectare dose {raw_number} {unit_token}.",
                })
                continue
            if kg_value in scalar_candidates:
                continue
            violations.append({
                "code": "UNGROUNDED_QUANTITY",
                "sentence": sentence,
                "detail": f"Ungrounded quantity {raw_number} {unit_token}.",
            })
            continue

        # Bare number in a dose sentence: allow if it matches any scalar
        # candidate; otherwise flag.
        if number in scalar_candidates:
            continue
        if mentioned or imperative:
            violations.append({
                "code": "UNGROUNDED_QUANTITY",
                "sentence": sentence,
                "detail": f"Ungrounded number '{raw_number}' in dose context.",
            })

    return violations


def check_text(text: str, recommendation: dict, config) -> GuardrailResult:
    """Run on every LLM output before it reaches a farmer.
    Any violation => passed=False and the caller must use a safe fallback.
    """
    if not text or not text.strip():
        return GuardrailResult(passed=False, redacted=True, safe_text="",
                               violations=[{"code": "EMPTY_OUTPUT"}])

    aliases = _fertilizer_aliases(config)
    item_fids = {item["fertilizer"]["id"] for item in recommendation.get("items", [])}
    allowed = build_allowed(recommendation)

    sentences = [s.strip() for s in SENTENCE_SPLIT_RE.split(text.strip())
                 if s.strip()]
    if not sentences:
        return GuardrailResult(passed=False, redacted=True, safe_text="",
                               violations=[{"code": "EMPTY_OUTPUT"}])

    all_violations: list[dict] = []
    kept: list[str] = []
    for sentence in sentences:
        violations = _check_sentence(sentence, allowed, item_fids,
                                     aliases, bool(item_fids))
        if violations:
            all_violations.extend(violations)
        else:
            kept.append(sentence)

    passed = not all_violations
    return GuardrailResult(
        passed=passed,
        redacted=not passed,
        safe_text=" ".join(kept).strip(),
        violations=all_violations,
    )