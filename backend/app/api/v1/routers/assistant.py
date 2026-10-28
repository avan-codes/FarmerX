from fastapi import APIRouter, Depends, Query

from app.api.deps import get_ai, get_config, get_store
from app.core.errors import ApiError, ErrorCode, not_found
from app.core.security import FarmerContext, get_current_farmer
from app.schemas.assistant import AssistantMessageIn

router = APIRouter(prefix="/recommendations", tags=["assistant"])


async def _owned_recommendation(rec_id: str, farmer: FarmerContext, store):
    doc = await store.read("recommendations", rec_id)
    if doc is None or doc.get("user_id") != farmer.farmer_id:
        raise not_found("Recommendation")
    return doc


def _summary_view(doc: dict | None) -> dict | None:
    if not doc:
        return None
    return {key: doc.get(key) for key in
            ("text", "provider", "model", "prompt_version", "cached",
             "guardrails", "generated_at")}


@router.post("/{rec_id}/summary")
async def summarize(rec_id: str,
                    language: str | None = Query(None),
                    farmer: FarmerContext = Depends(get_current_farmer),
                    store=Depends(get_store),
                    config=Depends(get_config),
                    ai=Depends(get_ai)):
    recommendation = await _owned_recommendation(rec_id, farmer, store)
    lang = language or recommendation.get("language", "en")
    if lang not in config.languages:
        raise ApiError(ErrorCode.VALIDATION_ERROR, 422, "Validation failed",
                       "Unsupported language.",
                       [{"field": "language", "message": "Unsupported language."}])

    result = await ai.summarize(recommendation, language=lang,
                                farmer_id=farmer.farmer_id)
    summary = _summary_view(result) if result.get("text") else None
    return {
        "recommendation_id": rec_id,
        "language": lang,
        "ai_summary": summary,
        "ai_status": result.get("ai_status", "unavailable"),
        "message": result.get("message"),
    }


@router.get("/{rec_id}/assistant")
async def get_assistant(rec_id: str,
                        conversation_id: str | None = Query(None),
                        farmer: FarmerContext = Depends(get_current_farmer),
                        store=Depends(get_store),
                        ai=Depends(get_ai)):
    recommendation = await _owned_recommendation(rec_id, farmer, store)
    conversation = await ai.get_conversation(recommendation,
                                             conversation_id,
                                             farmer.farmer_id)
    if conversation is None:
        return {"recommendation_id": rec_id, "conversation_id": None,
                "messages": [], "ai_status": "not_requested"}
    return {
        "recommendation_id": rec_id,
        "conversation_id": conversation["conversation_id"],
        "messages": conversation.get("messages", []),
        "ai_status": "ok",
    }


@router.post("/{rec_id}/assistant")
async def ask_assistant(rec_id: str,
                        payload: AssistantMessageIn,
                        farmer: FarmerContext = Depends(get_current_farmer),
                        store=Depends(get_store),
                        ai=Depends(get_ai)):
    recommendation = await _owned_recommendation(rec_id, farmer, store)
    return await ai.answer(recommendation, message=payload.message,
                           conversation_id=payload.conversation_id,
                           farmer_id=farmer.farmer_id)
