import asyncio, logging, random, time

import httpx

from app.providers.base import LLMError, LLMMessage, LLMResult

log = logging.getLogger("farmerx.ai.nim")


def _retry_after_seconds(response: httpx.Response) -> float | None:
    raw = response.headers.get("Retry-After")
    if not raw:
        return None
    try:
        return max(0.0, float(raw))
    except ValueError:
        return None


class NimProvider:
    """NVIDIA NIM, OpenAI-compatible chat completions.
    Endpoint: {base_url}/chat/completions.
    Structured output: top-level `nvext: {guided_json: <schema>}`.
    """

    name = "nim"

    def __init__(self, *, api_key: str, base_url: str, model: str,
                 fallback_models: list[str] | None = None,
                 timeout_s: float = 30.0, connect_timeout_s: float = 5.0,
                 guided_json: bool = True, max_retries: int = 1,
                 transport: httpx.AsyncBaseTransport | None = None):
        if not api_key:
            raise ValueError("NIM API key is required.")
        self.model = model
        self._fallback_models = [m for m in (fallback_models or []) if m and m != model]
        self._guided_json = guided_json
        self._max_retries = max_retries
        self._client = httpx.AsyncClient(
            base_url=base_url.rstrip("/"),
            timeout=httpx.Timeout(timeout_s, connect=connect_timeout_s),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            transport=transport,
        )

    async def aclose(self) -> None:
        await self._client.aclose()

    def health(self) -> dict:
        return {"provider": self.name, "model": self.model,
                "configured": True, "status": "configured",
                "fallback_models": self._fallback_models}

    async def complete(self, messages: list[LLMMessage], *,
                       max_tokens: int, temperature: float = 0.0,
                       guided_json: dict | None = None) -> LLMResult:
        models = [self.model, *self._fallback_models]
        last_error: LLMError | None = None
        for model in models:
            try:
                return await self._call(model, messages, max_tokens,
                                        temperature, guided_json)
            except LLMError as exc:
                last_error = exc
                if not exc.retryable:
                    raise
                log.warning("NIM model failed, trying next", extra={
                    "extra_fields": {"model": model, "code": exc.code}})
        raise last_error or LLMError("UNAVAILABLE", "No NIM model available.")

    async def _call(self, model: str, messages: list[LLMMessage],
                    max_tokens: int, temperature: float,
                    guided_json: dict | None,
                    allow_guided: bool = True) -> LLMResult:
        body: dict = {
            "model": model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False,
        }
        if temperature == 0.0:
            body["seed"] = 0
        if guided_json and self._guided_json and allow_guided:
            body["nvext"] = {"guided_json": guided_json}

        started = time.perf_counter()
        last_error: LLMError | None = None

        for attempt in range(self._max_retries + 1):
            try:
                response = await self._client.post("/chat/completions", json=body)
            except httpx.TimeoutException as exc:
                last_error = LLMError("TIMEOUT", "NIM request timed out.",
                                      retryable=True)
                if attempt < self._max_retries:
                    await asyncio.sleep(0.5 + random.random() * 0.5)
                    continue
                raise last_error from exc
            except httpx.HTTPError as exc:
                raise LLMError("TRANSPORT", f"NIM transport error: {exc}",
                               retryable=True) from exc

            # Some models do not support guided_json; retry once without it.
            if (response.status_code == 400 and guided_json and allow_guided
                    and self._guided_json):
                text = response.text.lower()
                if "guided" in text or "nvext" in text or "schema" in text:
                    log.info("NIM rejected guided_json; retrying without it",
                             extra={"extra_fields": {"model": model}})
                    return await self._call(model, messages, max_tokens,
                                            temperature, None,
                                            allow_guided=False)

            if response.status_code == 429:
                retry_after = _retry_after_seconds(response)
                last_error = LLMError("RATE_LIMITED", "NIM rate limit reached.",
                                      retryable=True, retry_after=retry_after)
                if attempt < self._max_retries:
                    await asyncio.sleep(min(retry_after or 1.0, 3.0)
                                        + random.random() * 0.5)
                    continue
                raise last_error

            if response.status_code in (500, 502, 503, 504):
                last_error = LLMError(
                    "UNAVAILABLE", f"NIM upstream returned {response.status_code}.",
                    retryable=True)
                if attempt < self._max_retries:
                    await asyncio.sleep(0.5 * (2 ** attempt)
                                        + random.random() * 0.5)
                    continue
                raise last_error

            if response.status_code in (401, 403):
                raise LLMError("AUTH", "NIM authentication failed.",
                               retryable=False)
            if response.status_code == 404:
                raise LLMError("MODEL_NOT_FOUND",
                               f"NIM model '{model}' was not found.",
                               retryable=False)
            if response.status_code >= 400:
                raise LLMError("BAD_REQUEST",
                               f"NIM returned {response.status_code}: "
                               f"{response.text[:300]}", retryable=False)

            try:
                data = response.json()
            except ValueError as exc:
                raise LLMError("BAD_RESPONSE", "NIM returned non-JSON.",
                               retryable=False) from exc

            choices = data.get("choices") or []
            if not choices:
                raise LLMError("BAD_RESPONSE", "NIM returned no choices.",
                               retryable=False)

            content = choices[0].get("message", {}).get("content")
            if isinstance(content, list):
                content = "".join(
                    part.get("text", "") for part in content
                    if isinstance(part, dict))
            usage = data.get("usage") or {}
            return LLMResult(
                text=(content or "").strip(),
                provider=self.name,
                model=data.get("model") or model,
                prompt_tokens=int(usage.get("prompt_tokens") or 0),
                completion_tokens=int(usage.get("completion_tokens") or 0),
                latency_ms=int((time.perf_counter() - started) * 1000),
            )

        raise last_error or LLMError("UNAVAILABLE", "NIM call failed.")