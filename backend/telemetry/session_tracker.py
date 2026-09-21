import time
from typing import List, Dict, Any
from backend.config import settings


class SessionTracker:
    """Tracks session lifecycle, elapsed duration S_d, and recent output size O_s."""

    @staticmethod
    def calculate_session_duration(created_at: float, current_time: float) -> float:
        """Returns elapsed session time in seconds."""
        return max(0.0, current_time - created_at)

    @staticmethod
    def calculate_average_output_size(prompt_history: List[Dict[str, Any]]) -> float:
        """Calculates the average generated tokens across recent completed requests in session."""
        outputs = [item.get("output_tokens", 0) for item in prompt_history if item.get("output_tokens", 0) > 0]
        if not outputs:
            return float(settings.NORMAL_MAX_OUTPUT_TOKENS // 2)  # Default neutral baseline
        return float(sum(outputs) / len(outputs))
