import logging
from fastapi import APIRouter, Depends

from app.api.deps import get_rules, get_store
from app.core.security import require_admin
from app.repositories.rule_repository import RuleValidationError

router = APIRouter(prefix="/admin", tags=["admin"])
log = logging.getLogger("farmerx.admin")


@router.get("/rule-sets", dependencies=[Depends(require_admin)])
async def list_rule_sets(rules=Depends(get_rules)):
    return {"items": [{
        "rule_set_id": s["rule_set_id"], "version": s["version"],
        "status": s["status"], "crop_id": s["crop_id"],
        "region_id": s["region_id"], "stage_id": s["stage_id"],
        "valid": s.get("_valid", False), "errors": s.get("_errors", []),
    } for s in rules.all_sets()], "total": len(rules.all_sets())}


@router.post("/rule-sets/reload", dependencies=[Depends(require_admin)])
async def reload_rule_sets(rules=Depends(get_rules)):
    try:
        rules.load()
    except (RuleValidationError, ValueError) as exc:
        log.warning("rule set reload rejected", extra={"extra_fields": {"error": str(exc)}})
        return {"reloaded": False, "kept_previous_cache": True, "error": str(exc)}
    return {"reloaded": True, "status": rules.status()}


@router.get("/audit/recommendations", dependencies=[Depends(require_admin)])
async def audit_recommendations(store=Depends(get_store)):
    items, total = await store.list("recommendations", page=1, page_size=10_000,
                                    sort=[("generated_at", "desc")])
    return {"items": [{
        "recommendation_id": i["recommendation_id"], "input_hash": i["input_hash"],
        "rule_set_id": i["rule_set_id"], "rule_set_version": i["rule_set_version"],
        "matched_rule_id": i["matched_rule_id"], "engine_version": i["engine_version"],
        "status": i["status"], "generated_at": i["generated_at"],
        "status": i["status"], "generated_at": i["generated_at"],
    } for i in items], "total": total}


@router.get("/audit/ai", dependencies=[Depends(require_admin)])
async def audit_ai(store=Depends(get_store)):
    items, total = await store.list("ai_events", page=1, page_size=10_000,
                                    sort=[("created_at", "desc")])
    return {"items": items, "total": total}