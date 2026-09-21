from fastapi import APIRouter, HTTPException

from backend.llm.ollama_client import ollama_client
from backend.models.schemas import ChatRequest, ChatResponse


router = APIRouter(prefix="/api", tags=["Chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Basic FastAPI gateway endpoint.

    ATBD behavioral security will be inserted before
    LLM inference in the next phases.
    """

    prompt = request.prompt.strip()

    if not prompt:
        raise HTTPException(
            status_code=400,
            detail="Prompt cannot be empty.",
        )

    result = await ollama_client.generate(
        prompt=prompt,
        max_tokens=request.max_tokens,
        temperature=request.temperature,
    )

    return ChatResponse(
        response=result["text"],
        input_tokens=result["input_tokens"],
        output_tokens=result["output_tokens"],
        total_tokens=result["total_tokens"],
        latency_ms=result["latency_ms"],
        model=result["model"],
        is_mock=result["is_mock"],
    )