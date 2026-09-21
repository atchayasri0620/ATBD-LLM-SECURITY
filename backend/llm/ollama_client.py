import time
import logging
from typing import Dict, Any, Optional

import httpx
import tiktoken

from backend.config import settings


logger = logging.getLogger("atbd.llm")


# ============================================================
# TOKENIZER
# ============================================================

try:
    _tokenizer = tiktoken.get_encoding("cl100k_base")
except Exception:
    _tokenizer = None


def count_tokens(text: str) -> int:
    """
    Count tokens using the local tokenizer.

    Ollama's actual prompt_eval_count and eval_count are used
    whenever an actual Llama 3.2 response is received.
    """

    if not text or not text.strip():
        return 0

    if _tokenizer:
        try:
            return len(_tokenizer.encode(text))
        except Exception:
            pass

    # Approximate fallback
    return max(1, len(text.strip()) // 4)


# ============================================================
# OLLAMA CLIENT
# ============================================================

class OllamaClient:
    """
    Client for the local Ollama runtime serving Llama 3.2.

    ATBD uses this client after the behavioral defense decision.
    """

    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL.rstrip("/")
        self.model = settings.LLAMA_MODEL

        # Keep timeout bounded so a failed request does not hang
        # the FastAPI endpoint indefinitely.
        self.timeout = min(
            float(settings.LLM_TIMEOUT_SECONDS),
            30.0
        )

        self.allow_mock = settings.LLM_FALLBACK_MOCK

    # ========================================================
    # HEALTH CHECK
    # ========================================================

    async def check_health(self) -> Dict[str, Any]:
        """
        Check whether Ollama is reachable and Llama 3.2 exists.
        """

        url = f"{self.base_url}/api/tags"

        try:
            timeout_config = httpx.Timeout(
                connect=2.0,
                read=5.0,
                write=5.0,
                pool=5.0
            )

            async with httpx.AsyncClient(
                timeout=timeout_config
            ) as client:

                response = await client.get(url)

                if response.status_code == 200:

                    data = response.json()

                    models = [
                        model.get("name", "")
                        for model in data.get("models", [])
                    ]

                    model_found = any(
                        self.model == model_name
                        or self.model in model_name
                        for model_name in models
                    )

                    return {
                        "status": (
                            "healthy"
                            if model_found
                            else "model_missing"
                        ),
                        "ollama_running": True,
                        "model": self.model,
                        "model_available": model_found,
                        "available_models": models
                    }

        except Exception as exc:

            logger.warning(
                "Ollama health check failed: %s",
                exc
            )

        return {
            "status": (
                "fallback_mock"
                if self.allow_mock
                else "unreachable"
            ),
            "ollama_running": False,
            "model": self.model,
            "model_available": False,
            "fallback_mode": self.allow_mock
        }

    # ========================================================
    # GENERATE
    # ========================================================

    async def generate(
        self,
        prompt: str,
        max_tokens: Optional[int] = None,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """
        Generate a response using the local Ollama Llama 3.2 model.

        max_tokens is mapped to Ollama's num_predict parameter.
        This allows ATBD THROTTLE to reduce the output budget.
        """

        start_time = time.perf_counter()

        input_token_count = count_tokens(prompt)

        payload: Dict[str, Any] = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature
            }
        }

        if max_tokens is not None:

            payload["options"]["num_predict"] = int(
                max_tokens
            )

        url = f"{self.base_url}/api/generate"

        try:

            # ------------------------------------------------
            # Ollama can take several seconds to load/generate.
            # Use a generous read timeout but do not hang forever.
            # ------------------------------------------------

            timeout_config = httpx.Timeout(
                connect=2.0,
                read=self.timeout,
                write=5.0,
                pool=5.0
            )

            logger.info(
                "Sending request to Ollama: model=%s, "
                "max_tokens=%s",
                self.model,
                max_tokens
            )

            async with httpx.AsyncClient(
                timeout=timeout_config
            ) as client:

                response = await client.post(
                    url,
                    json=payload
                )

            # ------------------------------------------------
            # Successful Ollama response
            # ------------------------------------------------

            if response.status_code == 200:

                data = response.json()

                response_text = data.get(
                    "response",
                    ""
                )

                # IMPORTANT:
                # Use Ollama's real token telemetry.
                prompt_eval_count = int(
                    data.get(
                        "prompt_eval_count",
                        input_token_count
                    )
                )

                eval_count = int(
                    data.get(
                        "eval_count",
                        count_tokens(response_text)
                    )
                )

                latency_ms = (
                    time.perf_counter() - start_time
                ) * 1000.0

                logger.info(
                    "Ollama response received: "
                    "input_tokens=%s, output_tokens=%s, "
                    "latency_ms=%.2f",
                    prompt_eval_count,
                    eval_count,
                    latency_ms
                )

                return {
                    "text": response_text,
                    "input_tokens": prompt_eval_count,
                    "output_tokens": eval_count,
                    "total_tokens": (
                        prompt_eval_count + eval_count
                    ),
                    "latency_ms": round(
                        latency_ms,
                        2
                    ),
                    "model": self.model,
                    "is_mock": False
                }

            # ------------------------------------------------
            # Ollama returned an HTTP error
            # ------------------------------------------------

            logger.error(
                "Ollama API returned HTTP %s: %s",
                response.status_code,
                response.text[:500]
            )

        except httpx.TimeoutException as exc:

            logger.error(
                "Ollama request timed out after %.2f seconds: %s",
                self.timeout,
                exc
            )

        except httpx.ConnectError as exc:

            logger.error(
                "Could not connect to Ollama at %s: %s",
                self.base_url,
                exc
            )

        except Exception as exc:

            logger.exception(
                "Unexpected Ollama error: %s",
                exc
            )

        # ====================================================
        # MOCK FALLBACK
        # ====================================================

        if not self.allow_mock:

            raise ConnectionError(
                f"Ollama service at {self.base_url} "
                "is unavailable and mock fallback is disabled."
            )

        logger.warning(
            "Using mock fallback response."
        )

        return self._generate_mock_response(
            prompt=prompt,
            max_tokens=max_tokens,
            input_token_count=input_token_count,
            start_time=start_time
        )

    # ========================================================
    # MOCK RESPONSE
    # ========================================================

    def _generate_mock_response(
        self,
        prompt: str,
        max_tokens: Optional[int],
        input_token_count: int,
        start_time: float
    ) -> Dict[str, Any]:
        """
        Development fallback only.

        This is not used when Ollama responds successfully.
        """

        p_lower = prompt.lower().strip()

        if "capital of france" in p_lower:

            text = (
                "The capital of France is Paris. "
                "It is the country's most populous city "
                "and its political, cultural, and economic center."
            )

        elif (
            "machine learning" in p_lower
            or "model" in p_lower
        ):

            text = (
                "Machine learning is a subset of "
                "artificial intelligence focused on "
                "training computational algorithms to "
                "learn patterns from data and improve "
                "their performance on a specific task."
            )

        elif "summarize" in p_lower:

            text = (
                "Here is an executive summary of the "
                "provided text, outlining the primary "
                "findings, key methodology, and core "
                "operational conclusions."
            )

        elif (
            "python" in p_lower
            or "code" in p_lower
        ):

            text = (
                "```python\n"
                "def solution():\n"
                "    return 'Clean implementation.'\n"
                "```"
            )

        else:

            text = (
                f"Thank you for your inquiry regarding "
                f"'{prompt[:45]}...'. "
                "As an AI assistant powered by Llama 3.2, "
                "I provide concise and structured answers."
            )

        output_tokens = count_tokens(text)

        # Apply output budget when throttling
        if (
            max_tokens is not None
            and output_tokens > max_tokens
        ):

            if _tokenizer:

                tokens = _tokenizer.encode(text)

                truncated_tokens = tokens[:max_tokens]

                text = (
                    _tokenizer.decode(
                        truncated_tokens
                    )
                    + " ..."
                )

            else:

                tokens = text.split()

                text = (
                    " ".join(tokens[:max_tokens])
                    + " ..."
                )

            output_tokens = max_tokens

        latency_ms = (
            time.perf_counter() - start_time
        ) * 1000.0

        return {
            "text": text,
            "input_tokens": input_token_count,
            "output_tokens": output_tokens,
            "total_tokens": (
                input_token_count + output_tokens
            ),
            "latency_ms": round(
                latency_ms,
                2
            ),
            "model": f"{self.model} (mock-fallback)",
            "is_mock": True
        }


# ============================================================
# SINGLE CLIENT INSTANCE
# ============================================================

ollama_client = OllamaClient()