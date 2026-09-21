from typing import Optional, Dict, Any, List

from pydantic import BaseModel, Field


# ============================================================
# CHAT REQUEST
# ============================================================

class ChatRequest(BaseModel):

    session_id: Optional[str] = None

    user_id: Optional[str] = "user_default"

    prompt: str = Field(
        ...,
        min_length=1
    )

    max_tokens: Optional[int] = None

    temperature: Optional[float] = Field(
        default=0.7,
        ge=0.0,
        le=2.0
    )


# ============================================================
# RISK FEATURE BREAKDOWN
# ============================================================

class RiskFeatureBreakdown(BaseModel):

    # Token rate
    token_rate: float

    normalized_token_rate: float

    token_rate_contribution: float

    # Request frequency
    request_frequency: float

    normalized_request_frequency: float

    request_frequency_contribution: float

    # Prompt similarity
    prompt_similarity: float

    prompt_similarity_contribution: float

    # Session duration
    session_duration: float

    normalized_session_duration: float

    session_duration_contribution: float

    # Output size
    output_size: float

    normalized_output_size: float

    output_size_contribution: float

    # Behavioral indicators
    temporal_regularity: float = 0.0

    burstiness: float = 0.0


# ============================================================
# RISK ASSESSMENT
# ============================================================

class RiskAssessment(BaseModel):

    risk_score: float

    action: str

    applied_delay_seconds: float = 0.0

    allowed_output_tokens: int = 512

    features: RiskFeatureBreakdown

    explanation: str


# ============================================================
# CHAT RESPONSE
# ============================================================

class ChatResponse(BaseModel):

    session_id: str

    response: str

    action: str

    risk_score: float

    input_tokens: int

    output_tokens: int

    total_tokens: int

    latency_ms: float

    model: str

    explanation: Optional[str] = None

    warning: Optional[str] = None

    applied_delay: Optional[float] = None

    allowed_budget: Optional[int] = None

    # Detailed ATBD telemetry
    features: Optional[RiskFeatureBreakdown] = None


# ============================================================
# SECURITY EVENT
# ============================================================

class SecurityEventSchema(BaseModel):

    event_id: str

    session_id: str

    user_id: Optional[str] = None

    timestamp: float

    iso_time: Optional[str] = None

    risk_score: float

    action: str

    reason: str

    prompt_snippet: Optional[str] = None

    triggering_features: Optional[
        Dict[str, Any]
    ] = None


# ============================================================
# SESSION SUMMARY
# ============================================================

class SessionSummary(BaseModel):

    session_id: str

    user_id: Optional[str] = None

    created_at: Optional[float] = None

    last_activity: Optional[float] = None

    total_tokens: int = 0

    request_count: int = 0

    risk_score: float = 0.0

    current_action: str = "ALLOW"


# ============================================================
# ADMIN OVERVIEW
# ============================================================

class AdminOverviewResponse(BaseModel):

    total_requests: int = 0

    total_tokens: int = 0

    allowed_requests: int = 0

    delayed_requests: int = 0

    throttled_requests: int = 0

    blocked_requests: int = 0

    active_sessions: int = 0

    security_events: int = 0


# ============================================================
# SIMULATION REQUEST
# ============================================================

class SimulationRequest(BaseModel):

    scenario: str

    session_id: Optional[str] = None

    prompts: List[str] = []

    max_tokens: int = 64

    delay_between_requests: float = 0.0


# ============================================================
# HEALTH RESPONSE
# ============================================================

class HealthResponse(BaseModel):

    status: str

    service: str

    ollama_running: Optional[bool] = None

    model_available: Optional[bool] = None

    model: Optional[str] = None