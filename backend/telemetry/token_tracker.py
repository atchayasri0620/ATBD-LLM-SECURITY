from typing import List, Dict, Any
from backend.config import settings


class TokenTracker:
    """Implements Equation (1), Equation (2), and Equation (11) from the ATBD paper."""

    @staticmethod
    def calculate_total_tokens(prompt_history: List[Dict[str, Any]], current_input_tokens: int = 0) -> int:
        """
        Equation (1): Total Token Consumption
        T_c = sum_{i=1}^n T_i
        """
        historical = sum(item.get("input_tokens", 0) + item.get("output_tokens", 0) for item in prompt_history)
        return historical + current_input_tokens

    @staticmethod
    def calculate_token_consumption_rate(
        total_tokens: int,
        observation_interval_seconds: float
    ) -> float:
        """
        Equation (2): Token Consumption Rate
        T_r = T_c / Delta_t (normalized to tokens per minute for intuitive velocity)
        """
        if observation_interval_seconds <= 0.0:
            return 0.0
        # Convert seconds to minutes for rate calculation
        minutes = max(observation_interval_seconds / 60.0, 1.0 / 60.0)
        return total_tokens / minutes

    @staticmethod
    def accumulate_session_tokens(current_session_tokens: int, input_tokens: int, output_tokens: int) -> int:
        """
        Equation (11): Session Token Accumulation
        T_s' = T_s + T_in + T_out
        """
        return current_session_tokens + input_tokens + output_tokens
