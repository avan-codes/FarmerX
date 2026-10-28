import asyncio, hashlib, logging, time, uuid
from collections import defaultdict, deque
from datetime import date, datetime, timedelta, timezone

from app.core.errors import ApiError, ErrorCode
from app.domain.guardrails import GuardrailResult, check_text
from app.providers.base import LLMError, LLMProvider
from app.services.prompts import (
    ANSWER_SCHEMA, PROMPT_VERSION, SUMMARY_SCHEMA,
    build_answer_messages, build_summary_messages,
)

log = logging.getLogger("farmerx.ai")

GUARDRAIL_BLOCKED_TRANSLATION = "ai.answer_guardrail_fallback"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _extract_text(raw: str) -> str:
    import json
    try:
        obj = json.loads(raw)
        if isinstance(obj, dict):
            for key in ("text", "answer", "summary"):
                value = obj.get(key)
                if isinstance(value, str):
                    return value.strip()
    except json.JSONDecodeError:
        pass
    return (raw or "").strip()


def build_safe_summary(recommendation: dict, language: str, config) -> str:
    if recommendation["status"] != "ok" or not recommendation.get("items"):
        return (recommendation.get("message")
                or config.translate(language, "ai.no_rule"))

    ctx = recommendation["context"]
    unit_label = config.translate(language, f"unit.{ctx['farm_area']['unit']}")
    area = f"{ctx['farm_area']['value']} {unit_label}"
    crop = config.translate(language, f"crop.{ctx['crop']}")
    stage = config.translate(language, f"stage.{ctx['stage']}")

    parts = [config.translate(language, "ai.fallback_intro",
                              crop=crop, stage=stage, area=area)]
    for item in recommendation["items"]:
        parts.append(config.translate(
            language, "ai.fallback_item",
            quantity=item["quantity"]["display"],
            fertilizer=item["fertilizer"]["name"],
            timing=item["timing_label"],
            method=item["method_label"],
        ))
    if recommendation.get("cautions"):
        parts.append(recommendation["cautions"][0])
    parts.append(recommendation["disclaimer"])
    return " ".join(parts)


class AIService:
    def __init__(self, *, provider: LLMProvider, store, config, settings):
        self.provider = provider
        self.store = store
        self.config = config
        self.settings = settings
        self._budget_lock = asyncio.Lock()
        self._user_windows: dict[str, deque[float]] = defaultdict(deque)
        self._last_error: str | None = None
        self._last_success_at: str | None = None

    # --- lifecycle / health ------------------------------------------------
    async def aclose(self) -> None:
        await self.provider.aclose()

    def health(self) -> dict:
        base = self.provider.health()
        base.update({"last_success_at": self._last_success_at,
                     "last_error": self._last_error,
                     "prompt_version": PROMPT_VERSION})
        return base

    # --- caching -----------------------------------------------------------
    def _cache_key(self, recommendation: dict, language: str) -> str:
        raw = "|".join([
            recommendation["recommendation_id"],
            recommendation["input_hash"],
            PROMPT_VERSION,
            language,
        ])
        return "sum_" + hashlib.sha256(raw.encode("utf-8")).hexdigest()

    async def get_cached_summary(self, recommendation: dict,
                                 language: str) -> dict | None:
        doc = await self.store.read("ai_summaries",
                                    self._cache_key(recommendation, language))
        if not doc:
            return None
        try:
            created = datetime.fromisoformat(doc.get("created_at") or doc["generated_at"])
        except (KeyError, ValueError):
            return None
        if datetime.now(timezone.utc) - created > timedelta(
                hours=self.settings.ai_cache_ttl_hours):
            return None
        return doc

    async def _put_cache(self, recommendation: dict, language: str,
                         doc: dict) -> None:
        await self.store.write("ai_summaries",
                               self._cache_key(recommendation, language), doc)

    # --- rate & budget -----------------------------------------------------
    def _check_user_rate(self, farmer_id: str) -> None:
        now = time.monotonic()
        window = self._user_windows[farmer_id]
        while window and now - window[0] > 60:
            window.popleft()
        if len(window) >= self.settings.ai_user_requests_per_minute:
            retry_after = max(1, int(60 - (now - window[0])) if window else 1)
            raise ApiError(
                ErrorCode.RATE_LIMITED, 429, "Rate limited",
                "Too many AI requests. Try again shortly.",
                headers={"Retry-After": str(retry_after)})
        window.append(now)

    async def _budget_ok(self) -> bool:
        usage = await self.store.read("ai_usage", date.today().isoformat()) or {
            "requests": 0, "tokens": 0}
        return (int(usage.get("requests", 0)) < self.settings.ai_daily_request_budget
                and int(usage.get("tokens", 0)) < self.settings.ai_daily_token_budget)

    async def _record_usage(self, result) -> None:
        today = date.today().isoformat()
        cost = (
            result.prompt_tokens / 1000 * self.settings.nim_cost_per_1k_input_usd
            + result.completion_tokens / 1000 * self.settings.nim_cost_per_1k_output_usd
        )
        async with self._budget_lock:
            usage = await self.store.read("ai_usage", today) or {
                "date": today, "requests": 0, "tokens": 0, "cost_usd": 0.0}
            usage["requests"] = int(usage.get("requests", 0)) + 1
            usage["tokens"] = (int(usage.get("tokens", 0))
                               + result.prompt_tokens + result.completion_tokens)
            usage["cost_usd"] = round(float(usage.get("cost_usd", 0.0)) + cost, 6)
            await self.store.write("ai_usage", today, usage)
        self._last_success_at = _now()
        self._last_error = None

    def _record_error(self, exc: LLMError) -> None:
        self._last_error = f"{exc.code}: {exc}"
        log.warning("AI provider error", extra={"extra_fields": {
            "code": exc.code, "message": str(exc)}})

    async def _record_guardrail_event(self, recommendation: dict, language: str,
                                      surface: str, guard, farmer_id: str) -> None:
        await self.store.write("ai_events", f"evt_{uuid.uuid4().hex}", {
            "event_id": f"evt_{uuid.uuid4().hex}",
            "recommendation_id": recommendation["recommendation_id"],
            "farmer_id": farmer_id,
            "surface": surface,                 # "summary" | "answer"
            "language": language,
            "prompt_version": PROMPT_VERSION,
            "violations": guard.violations,
            "created_at": _now(),
        })

    # --- unavailable shape ------------------------------------------------
    def _unavailable(self, language: str, reason: str) -> dict:
        return {
            "text": "",
            "provider": self.provider.name,
            "model": self.provider.model,
            "prompt_version": PROMPT_VERSION,
            "cached": False,
            "guardrails": None,
            "generated_at": _now(),
            "ai_status": "unavailable",
            "message": self.config.translate(language, "ai.unavailable"),
            "reason": reason,
        }

    def _summary_doc(self, recommendation: dict, language: str, result,
                     text: str, guard: GuardrailResult,
                     status: str) -> dict:
        return {
            "recommendation_id": recommendation["recommendation_id"],
            "input_hash": recommendation["input_hash"],
            "language": language,
            "text": text,
            "provider": result.provider,
            "model": result.model,
            "prompt_version": PROMPT_VERSION,
            "cached": False,
            "guardrails": guard.as_dict(),
            "generated_at": _now(),
            "ai_status": status,
        }

    # --- summarize ---------------------------------------------------------
    async def summarize(self, recommendation: dict, *, language: str,
                        farmer_id: str) -> dict:
        cached = await self.get_cached_summary(recommendation, language)
        if cached:
            return {**cached, "cached": True,
                    "ai_status": ("ok" if cached["guardrails"]["passed"]
                                  else "guardrail_blocked")}

        self._check_user_rate(farmer_id)
        if not await self._budget_ok():
            return self._unavailable(language, "budget")

        language_name = self.config.language_names.get(language, language)
        messages = build_summary_messages(
            recommendation, language, language_name,
            self.config.ai.get("summary_max_sentences", 5))

        try:
            result = await self.provider.complete(
                messages, max_tokens=self.settings.ai_max_tokens,
                temperature=0.0, guided_json=SUMMARY_SCHEMA)
        except LLMError as exc:
            self._record_error(exc)
            return self._unavailable(language, exc.code)

        await self._record_usage(result)
        text = _extract_text(result.text)
        guard = check_text(text, recommendation, self.config)

        if not guard.passed:
            fallback = build_safe_summary(recommendation, language, self.config)
            doc = self._summary_doc(recommendation, language, result,
                                    fallback, guard, "guardrail_blocked")
            await self._put_cache(recommendation, language, doc)
            await self._record_guardrail_event(recommendation, language,
                                               "summary", guard, farmer_id)
            log.warning("AI summary blocked by guardrails", extra={
                "extra_fields": {"recommendation_id":
                                 recommendation["recommendation_id"],
                                 "violations": guard.violations}})
            return doc

        doc = self._summary_doc(recommendation, language, result, text,
                                guard, "ok")
        await self._put_cache(recommendation, language, doc)
        return doc

    # --- conversations -----------------------------------------------------
    async def get_conversation(self, recommendation: dict,
                               conversation_id: str | None,
                               farmer_id: str) -> dict | None:
        if conversation_id:
            conv = await self.store.read("ai_conversations", conversation_id)
            if (not conv
                    or conv.get("recommendation_id")
                    != recommendation["recommendation_id"]
                    or conv.get("user_id") != farmer_id):
                return None
            return conv
        items, _ = await self.store.list(
            "ai_conversations",
            filters={"recommendation_id": recommendation["recommendation_id"],
                     "user_id": farmer_id},
            sort=[("updated_at", "desc")], page=1, page_size=1)
        return items[0] if items else None

    async def _get_or_create_conversation(self, recommendation: dict,
                                          conversation_id: str | None,
                                          farmer_id: str) -> dict:
        existing = await self.get_conversation(recommendation,
                                               conversation_id, farmer_id)
        if existing:
            existing.setdefault("messages", [])
            return existing
        if conversation_id:
            raise ApiError(ErrorCode.NOT_FOUND, 404, "Not found",
                           "Conversation was not found.")
        import uuid
        now = _now()
        return {
            "conversation_id": f"conv_{uuid.uuid4().hex}",
            "recommendation_id": recommendation["recommendation_id"],
            "user_id": farmer_id,
            "provider": self.provider.name,
            "model": self.provider.model,
            "prompt_version": PROMPT_VERSION,
            "created_at": now,
            "updated_at": now,
            "messages": [],
            "tokens": {"prompt": 0, "completion": 0},
        }

    def _reject_prompt_injection(self, message: str) -> None:
        upper = message.upper()
        if ("<RECOMMENDATION_GROUND_TRUTH>" in upper
                or "</RECOMMENDATION_GROUND_TRUTH>" in upper):
            raise ApiError(
                ErrorCode.VALIDATION_ERROR, 422, "Validation failed",
                "Message contains a reserved delimiter.",
                [{"field": "message",
                  "message": "Reserved ground-truth delimiter is not allowed."}])

    async def _persist_unavailable_answer(self, conversation: dict,
                                          language: str,
                                          reason: str) -> dict:
        now = _now()
        conversation["messages"].append({
            "role": "assistant",
            "content": self.config.translate(language, "ai.unavailable"),
            "at": now,
            "ai_status": "unavailable",
            "reason": reason,
        })
        conversation["updated_at"] = now
        await self.store.write("ai_conversations",
                               conversation["conversation_id"], conversation)
        return {
            "conversation_id": conversation["conversation_id"],
            "recommendation_id": conversation["recommendation_id"],
            "messages": conversation["messages"],
            "ai_status": "unavailable",
            "message": self.config.translate(language, "ai.unavailable"),
        }

    # --- answer ------------------------------------------------------------
    async def answer(self, recommendation: dict, *, message: str,
                     conversation_id: str | None,
                     farmer_id: str) -> dict:
        self._reject_prompt_injection(message)
        self._check_user_rate(farmer_id)

        conversation = await self._get_or_create_conversation(
            recommendation, conversation_id, farmer_id)
        language = recommendation.get("language", "en")
        if language not in self.config.languages:
            language = "en"

        conversation["messages"].append({
            "role": "user", "content": message, "at": _now()})

        if not await self._budget_ok():
            return await self._persist_unavailable_answer(
                conversation, language, "budget")

        language_name = self.config.language_names.get(language, language)
        messages = build_answer_messages(
            recommendation, conversation["messages"], language, language_name,
            self.settings.ai_max_history_messages,
            self.settings.ai_max_message_chars)

        try:
            result = await self.provider.complete(
                messages, max_tokens=self.settings.ai_max_tokens,
                temperature=0.0, guided_json=ANSWER_SCHEMA)
        except LLMError as exc:
            self._record_error(exc)
            return await self._persist_unavailable_answer(
                conversation, language, exc.code)

        await self._record_usage(result)
        text = _extract_text(result.text)
        guard = check_text(text, recommendation, self.config)

        if not guard.passed:
            safe_summary = build_safe_summary(recommendation, language,
                                              self.config)
            text = (self.config.translate(language,
                                          GUARDRAIL_BLOCKED_TRANSLATION)
                    + " " + safe_summary)
            status = "guardrail_blocked"
            await self._record_guardrail_event(recommendation, language,
                                               "answer", guard, farmer_id)
            log.warning("AI answer blocked by guardrails", extra={
                "extra_fields": {"recommendation_id":
                                 recommendation["recommendation_id"],
                                 "violations": guard.violations}})
        else:
            status = "ok"

        conversation["messages"].append({
            "role": "assistant",
            "content": text,
            "at": _now(),
            "ai_status": status,
            "guardrails": guard.as_dict(),
        })
        conversation["updated_at"] = _now()
        conversation["tokens"]["prompt"] += result.prompt_tokens
        conversation["tokens"]["completion"] += result.completion_tokens
        await self.store.write("ai_conversations",
                               conversation["conversation_id"], conversation)

        return {
            "conversation_id": conversation["conversation_id"],
            "recommendation_id": conversation["recommendation_id"],
            "messages": conversation["messages"],
            "ai_status": status,
        }