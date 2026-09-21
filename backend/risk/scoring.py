from typing import Dict, Any

from backend.config import settings


class RiskScorer:
    """
    Dynamic risk scoring for ATBD.

    R = w1*Tr' + w2*Rf' + w3*Ss + w4*Sd' + w5*Os'
    """

    @staticmethod
    def normalize_token_rate(token_rate: float) -> float:
        return min(
            100.0,
            max(
                0.0,
                (token_rate / settings.REFERENCE_MAX_TOKEN_RATE) * 100.0,
            ),
        )

    @staticmethod
    def normalize_request_frequency(request_frequency: float) -> float:
        return min(
            100.0,
            max(
                0.0,
                (request_frequency / settings.REFERENCE_MAX_REQUEST_FREQ) * 100.0,
            ),
        )

    @staticmethod
    def normalize_session_duration(duration_seconds: float) -> float:
        return min(
            100.0,
            max(
                0.0,
                (duration_seconds / settings.REFERENCE_MAX_SESSION_DUR) * 100.0,
            ),
        )

    @staticmethod
    def normalize_output_size(output_size: float) -> float:
        return min(
            100.0,
            max(
                0.0,
                (output_size / settings.REFERENCE_MAX_OUTPUT_SIZE) * 100.0,
            ),
        )

    @staticmethod
    def calculate(
        token_rate: float,
        request_frequency: float,
        prompt_similarity: float,
        session_duration: float,
        output_size: float,
    ) -> Dict[str, Any]:

        normalized_token_rate = RiskScorer.normalize_token_rate(token_rate)
        normalized_request_frequency = RiskScorer.normalize_request_frequency(
            request_frequency
        )
        normalized_session_duration = RiskScorer.normalize_session_duration(
            session_duration
        )
        normalized_output_size = RiskScorer.normalize_output_size(output_size)

        token_contribution = (
            settings.WEIGHT_TOKEN_RATE * normalized_token_rate
        )
        request_contribution = (
            settings.WEIGHT_REQUEST_FREQ * normalized_request_frequency
        )
        similarity_contribution = (
            settings.WEIGHT_PROMPT_SIM * prompt_similarity
        )
        session_contribution = (
            settings.WEIGHT_SESSION_DUR * normalized_session_duration
        )
        output_contribution = (
            settings.WEIGHT_OUTPUT_SIZE * normalized_output_size
        )

        risk_score = (
            token_contribution
            + request_contribution
            + similarity_contribution
            + session_contribution
            + output_contribution
        )

        risk_score = min(100.0, max(0.0, risk_score))

        return {
            "risk_score": round(risk_score, 2),
            "normalized_token_rate": round(normalized_token_rate, 2),
            "normalized_request_frequency": round(
                normalized_request_frequency, 2
            ),
            "normalized_session_duration": round(
                normalized_session_duration, 2
            ),
            "normalized_output_size": round(normalized_output_size, 2),
            "token_rate_contribution": round(token_contribution, 2),
            "request_frequency_contribution": round(
                request_contribution, 2
            ),
            "prompt_similarity_contribution": round(
                similarity_contribution, 2
            ),
            "session_duration_contribution": round(
                session_contribution, 2
            ),
            "output_size_contribution": round(output_contribution, 2),
        }


risk_scorer = RiskScorer()