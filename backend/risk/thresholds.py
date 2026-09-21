from typing import Literal

from backend.config import settings


DefenseAction = Literal["ALLOW", "DELAY", "THROTTLE", "BLOCK"]


def determine_action(risk_score: float) -> DefenseAction:
    """
    Map the dynamic risk score to the ATBD defense action.

    R < 30       -> ALLOW
    30 <= R < 60 -> DELAY
    60 <= R < 80 -> THROTTLE
    R >= 80      -> BLOCK
    """

    risk_score = min(100.0, max(0.0, risk_score))

    if risk_score < settings.ALLOW_THRESHOLD_MAX:
        return "ALLOW"

    if risk_score < settings.DELAY_THRESHOLD_MAX:
        return "DELAY"

    if risk_score < settings.THROTTLE_THRESHOLD_MAX:
        return "THROTTLE"

    return "BLOCK"