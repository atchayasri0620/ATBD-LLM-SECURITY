import time
import uuid
import logging
from typing import Dict, Any

from fastapi import APIRouter, HTTPException

from backend.models.schemas import (
    ChatRequest,
    ChatResponse,
    RiskFeatureBreakdown
)

from backend.database.redis_client import redis_client

from backend.llm.ollama_client import (
    ollama_client,
    count_tokens
)

from backend.telemetry.token_tracker import (
    TokenTracker
)

from backend.telemetry.request_tracker import (
    RequestTracker
)

from backend.telemetry.session_tracker import (
    SessionTracker
)

from backend.behavior.similarity import (
    PromptSimilarityEngine
)

from backend.risk.scoring import (
    risk_scorer
)

from backend.risk.thresholds import (
    determine_action
)

from backend.defense.actions import (
    defense_engine
)


logger = logging.getLogger(
    "atbd.api"
)


router = APIRouter(
    prefix="/api",
    tags=["ATBD Security"]
)


# ============================================================
# HEALTH CHECK
# ============================================================

@router.get("/health")
async def health_check():

    return {
        "status": "healthy",
        "service": "ATBD LLM Security API"
    }


# ============================================================
# CHAT ENDPOINT
# ============================================================

@router.post(
    "/chat",
    response_model=ChatResponse
)
async def chat(
    request: ChatRequest
):

    request_start = time.time()

    try:

        # ====================================================
        # 1. SESSION MANAGEMENT
        # ====================================================

        session_id = (
            request.session_id
            if request.session_id
            else str(uuid.uuid4())
        )

        user_id = (
            request.user_id
            if request.user_id
            else "user_default"
        )

        session = (
            redis_client.get_or_create_session(
                session_id=session_id,
                user_id=user_id
            )
        )

        current_time = time.time()

        # ====================================================
        # 2. GET SESSION HISTORY
        # ====================================================

        prompt_history = (
            redis_client.get_session_prompts(
                session_id
            )
        )

        previous_prompts = [
            item.get("prompt", "")
            for item in prompt_history
            if item.get("prompt")
        ]

        # ====================================================
        # 3. RECENT 60 SECOND WINDOW
        # ====================================================

        observation_window = 60.0

        recent_history = []

        for item in prompt_history:

            timestamp = item.get(
                "timestamp"
            )

            if timestamp is None:
                continue

            try:

                timestamp = float(
                    timestamp
                )

            except (
                TypeError,
                ValueError
            ):

                continue

            if (
                current_time - timestamp
                <= observation_window
            ):

                recent_history.append(
                    item
                )

        # ====================================================
        # 4. RECENT TIMESTAMPS
        # ====================================================

        recent_timestamps = [

            float(
                item.get(
                    "timestamp"
                )
            )

            for item in recent_history

            if item.get(
                "timestamp"
            ) is not None
        ]

        # Include current request
        recent_timestamps.append(
            current_time
        )

        # ====================================================
        # 5. OBSERVATION INTERVAL
        # ====================================================

        # Use the complete 60-second observation window
        # to calculate request and token rates.
        observation_interval = observation_window
        # ====================================================
        # 6. INPUT TOKEN COUNT
        # ====================================================

        current_input_tokens = (
            count_tokens(
                request.prompt
            )
        )

        # ====================================================
        # 7. PROMPT SIMILARITY
        # ====================================================

        prompt_similarity = (

            PromptSimilarityEngine
            .calculate_prompt_similarity(

                current_prompt=request.prompt,

                previous_prompts=previous_prompts
            )
        )

        # ====================================================
        # 8. SESSION DURATION
        # ====================================================

        created_at = float(

            session.get(
                "created_at",
                current_time
            )
        )

        session_duration = (

            SessionTracker
            .calculate_session_duration(

                created_at=created_at,

                current_time=current_time
            )
        )

        # ====================================================
        # 9. TOTAL REQUEST COUNT
        # ====================================================

        request_count = (

            int(
                session.get(
                    "request_count",
                    0
                )
            )
            + 1
        )

        # ====================================================
        # 10. RECENT REQUEST COUNT
        # ====================================================

        recent_request_count = (

            len(recent_history)
            + 1
        )

        # ====================================================
        # 11. REQUEST FREQUENCY
        # ====================================================

        request_frequency = (

            RequestTracker
            .calculate_request_frequency(

                request_count=(
                    recent_request_count
                ),

                observation_interval_seconds=(
                    observation_interval
                )
            )
        )

        # ====================================================
        # 12. RECENT TOKEN CONSUMPTION
        # ====================================================

        recent_tokens = 0

        for item in recent_history:

            recent_tokens += int(

                item.get(
                    "input_tokens",
                    0
                )
            )

            recent_tokens += int(

                item.get(
                    "output_tokens",
                    0
                )
            )

        recent_tokens += (
            current_input_tokens
        )

        # ====================================================
        # 13. TOKEN CONSUMPTION RATE
        # ====================================================

        token_rate = (

            TokenTracker
            .calculate_token_consumption_rate(

                total_tokens=recent_tokens,

                observation_interval_seconds=(
                    observation_interval
                )
            )
        )

        # ====================================================
        # 14. AVERAGE OUTPUT SIZE
        # ====================================================

        average_output_size = (

            SessionTracker
            .calculate_average_output_size(

                prompt_history=prompt_history
            )
        )

        # ====================================================
        # 15. RISK SCORING
        # ====================================================

        risk_result = (

            risk_scorer.calculate(

                token_rate=token_rate,

                request_frequency=(
                    request_frequency
                ),

                prompt_similarity=(
                    prompt_similarity
                ),

                session_duration=(
                    session_duration
                ),

                output_size=(
                    average_output_size
                )
            )
        )

        risk_score = float(

            risk_result[
                "risk_score"
            ]
        )

        # ====================================================
        # 16. DEFENSE ACTION
        # ====================================================

        action = determine_action(
            risk_score
        )

        # ====================================================
        # 17. RISK FEATURE BREAKDOWN
        # ====================================================

        risk_features = (
            RiskFeatureBreakdown(

                token_rate=round(
                    token_rate,
                    2
                ),

                normalized_token_rate=round(
                    risk_result[
                        "normalized_token_rate"
                    ],
                    2
                ),

                token_rate_contribution=round(
                    risk_result[
                        "token_rate_contribution"
                    ],
                    2
                ),

                request_frequency=round(
                    request_frequency,
                    2
                ),

                normalized_request_frequency=round(
                    risk_result[
                        "normalized_request_frequency"
                    ],
                    2
                ),

                request_frequency_contribution=round(
                    risk_result[
                        "request_frequency_contribution"
                    ],
                    2
                ),

                prompt_similarity=round(
                    prompt_similarity,
                    2
                ),

                prompt_similarity_contribution=round(
                    risk_result[
                        "prompt_similarity_contribution"
                    ],
                    2
                ),

                session_duration=round(
                    session_duration,
                    2
                ),

                normalized_session_duration=round(
                    risk_result[
                        "normalized_session_duration"
                    ],
                    2
                ),

                session_duration_contribution=round(
                    risk_result[
                        "session_duration_contribution"
                    ],
                    2
                ),

                output_size=round(
                    average_output_size,
                    2
                ),

                normalized_output_size=round(
                    risk_result[
                        "normalized_output_size"
                    ],
                    2
                ),

                output_size_contribution=round(
                    risk_result[
                        "output_size_contribution"
                    ],
                    2
                ),

                temporal_regularity=0.0,

                burstiness=0.0
            )
        )

        # ====================================================
        # 18. DEFENSE EXECUTION
        # ====================================================

        defense_result = (

            await defense_engine.execute(

                action=action,

                risk_score=risk_score
            )
        )

        allowed = bool(

            defense_result.get(
                "allowed",
                False
            )
        )

        applied_delay = float(

            defense_result.get(
                "delay_seconds",
                0.0
            )
        )

        output_budget = int(

            defense_result.get(
                "output_budget",
                512
            )
        )

        # ====================================================
        # 19. BLOCK
        # ====================================================

        if not allowed:

            reason = (

                f"Request blocked by ATBD. "

                f"Risk score="
                f"{risk_score:.2f}. "

                f"Token rate="
                f"{token_rate:.2f} tokens/min, "

                f"request frequency="
                f"{request_frequency:.2f} req/min, "

                f"prompt similarity="
                f"{prompt_similarity:.2f}/100."
            )

            event_data: Dict[str, Any] = {

                "event_id": str(
                    uuid.uuid4()
                ),

                "session_id": session_id,

                "user_id": user_id,

                "timestamp": time.time(),

                "iso_time": time.strftime(
                    "%Y-%m-%dT%H:%M:%SZ",
                    time.gmtime()
                ),

                "risk_score": risk_score,

                "action": "BLOCK",

                "reason": reason,

                "prompt_snippet": (
                    request.prompt[:120]
                ),

                "triggering_features": {

                    "token_rate": (
                        token_rate
                    ),

                    "request_frequency": (
                        request_frequency
                    ),

                    "prompt_similarity": (
                        prompt_similarity
                    ),

                    "session_duration": (
                        session_duration
                    ),

                    "output_size": (
                        average_output_size
                    )
                }
            }

            redis_client.log_security_event(
                event_data
            )

            redis_client.increment_metric(
                "total_requests"
            )

            redis_client.increment_metric(
                "blocked_requests"
            )

            redis_client.update_session(

                session_id,

                {
                    "last_activity": (
                        time.time()
                    ),

                    "request_count": (
                        request_count
                    ),

                    "risk_score": (
                        risk_score
                    ),

                    "current_action": (
                        "BLOCK"
                    )
                }
            )

            return ChatResponse(

                session_id=session_id,

                response=(
                    "Request blocked by the "
                    "adaptive security system."
                ),

                action="BLOCK",

                risk_score=risk_score,

                input_tokens=(
                    current_input_tokens
                ),

                output_tokens=0,

                total_tokens=(
                    current_input_tokens
                ),

                latency_ms=round(

                    (
                        time.time()
                        - request_start
                    ) * 1000,

                    2
                ),

                model="llama3.2",

                explanation=reason,

                warning=(
                    "High-risk behavioral "
                    "pattern detected."
                ),

                applied_delay=0.0,

                allowed_budget=0,

                features=risk_features
            )

        # ====================================================
        # 20. STORE PROMPT
        # ====================================================

        redis_client.add_prompt_event(

            session_id=session_id,

            prompt=request.prompt,

            input_tokens=current_input_tokens,

            timestamp=current_time
        )

        # ====================================================
        # 21. OUTPUT BUDGET
        # ====================================================

        requested_budget = (

            request.max_tokens

            if request.max_tokens
            is not None

            else 512
        )

        requested_budget = max(

            1,

            min(
                requested_budget,
                512
            )
        )

        actual_budget = min(

            requested_budget,

            output_budget
        )

        # ====================================================
        # 22. LLAMA 3.2
        # ====================================================

        llm_result = (

            await ollama_client.generate(

                prompt=request.prompt,

                max_tokens=actual_budget,

                temperature=(

                    request.temperature

                    if request.temperature
                    is not None

                    else 0.7
                )
            )
        )

        response_text = llm_result.get(
            "text",
            ""
        )

        output_tokens = int(

            llm_result.get(
                "output_tokens",
                0
            )
        )

        actual_input_tokens = int(

            llm_result.get(
                "input_tokens",
                current_input_tokens
            )
        )

        total_tokens = int(

            llm_result.get(

                "total_tokens",

                actual_input_tokens
                + output_tokens
            )
        )

        model_name = llm_result.get(
            "model",
            "llama3.2"
        )

        # ====================================================
        # 23. UPDATE OUTPUT
        # ====================================================

        redis_client.update_last_prompt_output(

            session_id=session_id,

            output_tokens=output_tokens
        )

        # ====================================================
        # 24. SESSION TOKEN ACCUMULATION
        # ====================================================

        previous_session_tokens = int(

            session.get(
                "total_tokens",
                0
            )
        )

        new_session_tokens = (

            TokenTracker
            .accumulate_session_tokens(

                current_session_tokens=(
                    previous_session_tokens
                ),

                input_tokens=(
                    actual_input_tokens
                ),

                output_tokens=(
                    output_tokens
                )
            )
        )

        # ====================================================
        # 25. UPDATE SESSION
        # ====================================================

        redis_client.update_session(

            session_id,

            {
                "last_activity": (
                    time.time()
                ),

                "total_tokens": (
                    new_session_tokens
                ),

                "request_count": (
                    request_count
                ),

                "risk_score": (
                    risk_score
                ),

                "current_action": (
                    action
                )
            }
        )

        # ====================================================
        # 26. GLOBAL METRICS
        # ====================================================

        redis_client.increment_metric(
            "total_requests"
        )

        redis_client.increment_metric(

            "total_tokens",

            total_tokens
        )

        if action == "ALLOW":

            redis_client.increment_metric(
                "allowed_requests"
            )

        elif action == "DELAY":

            redis_client.increment_metric(
                "delayed_requests"
            )

        elif action == "THROTTLE":

            redis_client.increment_metric(
                "throttled_requests"
            )

        # ====================================================
        # 27. EXPLANATION
        # ====================================================

        explanation = (

            f"Risk score "
            f"{risk_score:.2f}/100. "

            f"Token rate="
            f"{token_rate:.2f} tokens/min, "

            f"request frequency="
            f"{request_frequency:.2f} req/min, "

            f"prompt similarity="
            f"{prompt_similarity:.2f}/100, "

            f"session duration="
            f"{session_duration:.2f}s, "

            f"average output size="
            f"{average_output_size:.2f} tokens. "

            f"Defense action={action}."
        )

        warning = None

        if action == "DELAY":

            warning = (

                f"Request delayed by "
                f"{applied_delay:.2f} seconds "
                f"due to elevated risk."
            )

        elif action == "THROTTLE":

            warning = (

                f"Output token budget reduced "
                f"to {actual_budget} tokens "
                f"due to elevated risk."
            )

        # ====================================================
        # 28. FINAL RESPONSE
        # ====================================================

        total_latency = (

            time.time()
            - request_start

        ) * 1000

        return ChatResponse(

            session_id=session_id,

            response=response_text,

            action=action,

            risk_score=risk_score,

            input_tokens=actual_input_tokens,

            output_tokens=output_tokens,

            total_tokens=total_tokens,

            latency_ms=round(
                total_latency,
                2
            ),

            model=model_name,

            explanation=explanation,

            warning=warning,

            applied_delay=applied_delay,

            allowed_budget=actual_budget,

            features=risk_features
        )

    except Exception as e:

        logger.exception(
            "ATBD chat request failed"
        )

        raise HTTPException(

            status_code=500,

            detail=(
                f"ATBD chat processing failed: "
                f"{str(e)}"
            )
        )