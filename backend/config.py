from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True

    # Ollama & LLM Settings
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    LLAMA_MODEL: str = "llama3.2"
    LLM_TIMEOUT_SECONDS: float = 60.0
    LLM_FALLBACK_MOCK: bool = True

    # Redis Settings
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None
    REDIS_AUTO_FALLBACK: bool = True

    # ATBD Feature Weights (Eq. 7 from Research Paper)
    # R = 0.25*Tr' + 0.20*Rf' + 0.20*Ss + 0.15*Sd' + 0.20*Os'
    WEIGHT_TOKEN_RATE: float = 0.25
    WEIGHT_REQUEST_FREQ: float = 0.20
    WEIGHT_PROMPT_SIM: float = 0.20
    WEIGHT_SESSION_DUR: float = 0.15
    WEIGHT_OUTPUT_SIZE: float = 0.20

    # ATBD Normalization & Reference Constants (Eq. 5, 6)
    REFERENCE_MAX_TOKEN_RATE: float = 2000.0  # Eq. 5
    REFERENCE_MAX_REQUEST_FREQ: float = 30.0   # Eq. 6 (requests/minute)
    REFERENCE_MAX_SESSION_DUR: float = 1800.0  # 30 minutes in seconds
    REFERENCE_MAX_OUTPUT_SIZE: float = 1024.0  # tokens

    # Fixed Defense Thresholds (Eq. 8)
    ALLOW_THRESHOLD_MAX: float = 30.0    # 0 <= R < 30
    DELAY_THRESHOLD_MAX: float = 60.0    # 30 <= R < 60
    THROTTLE_THRESHOLD_MAX: float = 80.0 # 60 <= R < 80
    # R >= 80 -> BLOCK

    # Adaptive Defense Constants (Eq. 9, 10)
    MIN_DELAY_SECONDS: float = 1.0       # Eq. 9
    MAX_DELAY_SECONDS: float = 5.0       # Eq. 9
    NORMAL_MAX_OUTPUT_TOKENS: int = 512  # Eq. 10
    MIN_THROTTLED_OUTPUT_TOKENS: int = 96 # Eq. 10


settings = Settings()
