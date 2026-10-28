from app.providers.base import LLMError, LLMResult


class FakeProvider:
    name = "fake"
    model = "fake-1"

    def __init__(self, responses):
        self.responses = list(responses)
        self.calls: list[dict] = []

    async def complete(self, messages, *, max_tokens, temperature=0.0,
                       guided_json=None):
        self.calls.append({"messages": messages, "guided_json": guided_json,
                           "max_tokens": max_tokens})
        if not self.responses:
            raise LLMError("UNAVAILABLE", "no scripted response")
        item = self.responses.pop(0)
        if isinstance(item, Exception):
            raise item
        return LLMResult(text=item, provider=self.name, model=self.model,
                         prompt_tokens=10, completion_tokens=5)

    async def aclose(self):
        return None

    def health(self):
        return {"provider": self.name, "model": self.model, "configured": True}
