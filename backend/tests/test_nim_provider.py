import json
import httpx
import pytest

from app.providers.base import LLMError, LLMMessage
from app.providers.nim import NimProvider


def _provider(handler, **kwargs):
    return NimProvider(api_key="test-key",
                       base_url="https://example.test/v1",
                       model="meta/llama-3.1-8b-instruct",
                       transport=httpx.MockTransport(handler),
                       max_retries=0, **kwargs)


async def test_body_includes_guided_json_and_seed():
    captured = {}

    def handler(request):
        captured["body"] = json.loads(request.content)
        captured["auth"] = request.headers["authorization"]
        return httpx.Response(200, json={
            "model": "meta/llama-3.1-8b-instruct",
            "choices": [{"message": {"content": '{"text":"ok"}'}}],
            "usage": {"prompt_tokens": 10, "completion_tokens": 2},
        })

    provider = _provider(handler)
    result = await provider.complete(
        [LLMMessage("user", "hi")], max_tokens=100,
        guided_json={"type": "object"})
    assert captured["auth"] == "Bearer test-key"
    assert captured["body"]["nvext"]["guided_json"] == {"type": "object"}
    assert captured["body"]["seed"] == 0
    assert result.text == '{"text":"ok"}'
    assert result.prompt_tokens == 10


async def test_429_raises_rate_limited():
    def handler(request):
        return httpx.Response(429, headers={"Retry-After": "1"},
                              json={"error": {"message": "rate"}})

    provider = _provider(handler)
    with pytest.raises(LLMError) as exc:
        await provider.complete([LLMMessage("user", "hi")], max_tokens=10)
    assert exc.value.code == "RATE_LIMITED"
    assert exc.value.retry_after == 1.0


async def test_guided_json_400_retries_without_it():
    bodies = []

    def handler(request):
        body = json.loads(request.content)
        bodies.append(body)
        if "nvext" in body:
            return httpx.Response(400, text="guided_json unsupported")
        return httpx.Response(200, json={
            "choices": [{"message": {"content": "plain"}}]})

    provider = _provider(handler)
    result = await provider.complete(
        [LLMMessage("user", "hi")], max_tokens=10,
        guided_json={"type": "object"})
    assert len(bodies) == 2
    assert "nvext" not in bodies[1]
    assert result.text == "plain"
