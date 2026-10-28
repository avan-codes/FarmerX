from app.providers.base import LLMError, LLMMessage, LLMResult


class NullProvider:
    """Used when LLM_PROVIDER=none or when NIM is unconfigured.
    Every call fails cleanly; AIService degrades to deterministic output."""

    name = "none"
    model = "none"

    async def complete(self, messages: list[LLMMessage], *,
                       max_tokens: int, temperature: float = 0.0,
                       guided_json: dict | None = None) -> LLMResult:
        raise LLMError("AI_DISABLED", "AI provider is disabled.", retryable=False)

    async def aclose(self) -> None:
        return None

    def health(self) -> dict:
        return {"provider": self.name, "model": self.model,
                "configured": False, "status": "disabled"}