import pytest
import asyncio
from backend.llm.ollama_client import ollama_client, count_tokens


def test_token_counter():
    text = "Hello world, this is a test prompt for token counting."
    count = count_tokens(text)
    assert count > 0
    assert count_tokens("") == 0
    assert count_tokens("   ") == 0


@pytest.mark.asyncio
async def test_ollama_health():
    health = await ollama_client.check_health()
    assert "status" in health
    assert "model" in health
    assert health["model"] == "llama3.2"


@pytest.mark.asyncio
async def test_ollama_generation():
    prompt = "What is machine learning?"
    res = await ollama_client.generate(prompt=prompt)
    assert "text" in res
    assert len(res["text"]) > 0
    assert res["input_tokens"] > 0
    assert res["output_tokens"] > 0
    assert res["total_tokens"] == res["input_tokens"] + res["output_tokens"]
    assert res["latency_ms"] >= 0


@pytest.mark.asyncio
async def test_ollama_throttled_generation():
    prompt = "Explain in great detail the principles of neural networks and deep learning architectures."
    max_tokens = 20
    res = await ollama_client.generate(prompt=prompt, max_tokens=max_tokens)
    assert res["output_tokens"] <= max_tokens
