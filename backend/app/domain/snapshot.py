import hashlib, json
from decimal import Decimal


def _canonical(value):
    if isinstance(value, dict):
        return {str(k): _canonical(v) for k, v in sorted(value.items(), key=lambda kv: str(kv[0]))}
    if isinstance(value, (list, tuple)):
        return [_canonical(v) for v in value]
    if isinstance(value, Decimal):
        return format(value.normalize(), "f")
    if isinstance(value, float):
        return format(Decimal(str(value)).normalize(), "f")
    if isinstance(value, bool) or value is None or isinstance(value, (int, str)):
        return value
    return str(value)


def canonical_json(payload: dict) -> str:
    return json.dumps(_canonical(payload), ensure_ascii=False,
                      sort_keys=True, separators=(",", ":"))


def input_hash(payload: dict) -> str:
    return "sha256:" + hashlib.sha256(canonical_json(payload).encode("utf-8")).hexdigest()