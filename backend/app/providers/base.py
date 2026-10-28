from dataclasses import dataclass
from typing import Protocol, runtime_checkable


@dataclass(frozen=True)
class LLMMessage:
    role: str          # "system" | "user" | "assistant"
    content: str


@dataclass(frozen=True)
class LLMResult:
    text: str
    provider: str
    model: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    latency_ms: int = 0


class LLMError(RuntimeError):
    def __init__(self, code: str, message: str, *,
                 retryable: bool = False,
                 retry_after: float | None = None):
        super().__init__(message)
        self.code = code
        self.retryable = retryable
        self.retry_after = retry_after


@runtime_checkable
class LLMProvider(Protocol):
    name: str
    model: str

    async def complete(self, messages: list[LLMMessage], *,
                       max_tokens: int,
                       temperature: float = 0.0,
                       guided_json: dict | None = None) -> LLMResult: ...

    async def aclose(self) -> None: ...

    def health(self) -> dict: ...