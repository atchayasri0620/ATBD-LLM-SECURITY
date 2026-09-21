from typing import List, Dict, Any


class RequestTracker:
    """Implements Equation (3) from the ATBD paper."""

    @staticmethod
    def calculate_request_frequency(
        request_count: int,
        observation_interval_seconds: float
    ) -> float:
        """
        Equation (3): Request Frequency
        R_f = N_r / Delta_t (calculated as requests per minute)
        """
        if observation_interval_seconds <= 0.0 or request_count <= 0:
            return 0.0
        minutes = max(observation_interval_seconds / 60.0, 1.0 / 60.0)
        return request_count / minutes

    @staticmethod
    def extract_inter_request_intervals(timestamps: List[float]) -> List[float]:
        """Calculates intervals between sequential requests in seconds."""
        if len(timestamps) < 2:
            return []
        sorted_ts = sorted(timestamps)
        return [sorted_ts[i] - sorted_ts[i - 1] for i in range(1, len(sorted_ts))]
