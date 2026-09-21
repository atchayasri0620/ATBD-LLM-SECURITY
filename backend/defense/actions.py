import asyncio


class DefenseEngine:
    """
    Applies the defense action selected from the ATBD risk score.
    """

    async def apply_delay(self, risk_score: float) -> float:
        """
        Apply an adaptive delay between 1 and 5 seconds.
        Higher risk = longer delay.
        """
        delay_seconds = 1.0 + (risk_score / 100.0) * 4.0
        delay_seconds = min(5.0, max(1.0, delay_seconds))

        await asyncio.sleep(delay_seconds)

        return round(delay_seconds, 2)

    def calculate_output_budget(
        self,
        risk_score: float,
        normal_budget: int = 512,
        minimum_budget: int = 96,
    ) -> int:
        """
        Reduce output-token budget as risk increases.

        Risk 60  -> close to normal budget
        Risk 80+ -> progressively reduced budget
        """
        risk_score = min(100.0, max(0.0, risk_score))

        reduction = (risk_score - 60.0) / 40.0
        reduction = max(0.0, min(1.0, reduction))

        budget = normal_budget - (
            reduction * (normal_budget - minimum_budget)
        )

        return max(minimum_budget, int(budget))

    async def execute(self, action: str, risk_score: float) -> dict:
        """
        Execute the selected ATBD defense action.
        """

        if action == "ALLOW":
            return {
                "action": "ALLOW",
                "allowed": True,
                "delay_seconds": 0.0,
                "output_budget": 512,
            }

        if action == "DELAY":
            delay = await self.apply_delay(risk_score)

            return {
                "action": "DELAY",
                "allowed": True,
                "delay_seconds": delay,
                "output_budget": 512,
            }

        if action == "THROTTLE":
            budget = self.calculate_output_budget(risk_score)

            return {
                "action": "THROTTLE",
                "allowed": True,
                "delay_seconds": 0.0,
                "output_budget": budget,
            }

        if action == "BLOCK":
            return {
                "action": "BLOCK",
                "allowed": False,
                "delay_seconds": 0.0,
                "output_budget": 0,
            }

        raise ValueError(f"Unknown defense action: {action}")


defense_engine = DefenseEngine()
