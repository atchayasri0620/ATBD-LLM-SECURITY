import json
import os
from statistics import mean


# ============================================================
# CONFIGURATION
# ============================================================

RESULTS_DIR = "attack_simulation/results"

OUTPUT_FILE = "evaluation/evaluation_results.json"


SCENARIOS = {
    "NORMAL_USER": (
        "normal_user_results.json"
    ),

    "MODEL_EXTRACTION": (
        "model_extraction_results.json"
    ),

    "DENIAL_OF_WALLET": (
        "denial_of_wallet_results.json"
    )
}


# ============================================================
# LOAD JSON
# ============================================================

def load_results(filename):

    filepath = os.path.join(
        RESULTS_DIR,
        filename
    )

    if not os.path.exists(filepath):

        raise FileNotFoundError(
            f"Result file not found: {filepath}"
        )

    with open(
        filepath,
        "r",
        encoding="utf-8"
    ) as file:

        return json.load(file)


# ============================================================
# EXTRACT SUCCESSFUL RESULTS
# ============================================================

def successful_results(data):

    return [
        item
        for item in data.get("results", [])
        if item.get("success") is True
    ]


# ============================================================
# ACTION DISTRIBUTION
# ============================================================

def action_distribution(results):

    distribution = {
        "ALLOW": 0,
        "DELAY": 0,
        "THROTTLE": 0,
        "BLOCK": 0
    }

    for result in results:

        action = result.get(
            "action"
        )

        if action in distribution:

            distribution[action] += 1

    return distribution


# ============================================================
# BASIC METRICS
# ============================================================

def calculate_basic_metrics(results):

    if not results:

        return {
            "total_requests": 0,
            "successful_requests": 0,
            "average_risk_score": 0.0,
            "maximum_risk_score": 0.0,
            "minimum_risk_score": 0.0,
            "average_latency_ms": 0.0,
            "total_tokens": 0,
            "average_tokens_per_request": 0.0,
            "actions": {
                "ALLOW": 0,
                "DELAY": 0,
                "THROTTLE": 0,
                "BLOCK": 0
            }
        }

    risk_scores = [
        float(
            result.get(
                "risk_score",
                0
            )
        )
        for result in results
    ]

    latencies = [
        float(
            result.get(
                "latency_ms",
                0
            )
        )
        for result in results
    ]

    token_counts = [
        int(
            result.get(
                "total_tokens",
                0
            )
        )
        for result in results
    ]

    return {

        "total_requests": len(results),

        "successful_requests": len(results),

        "average_risk_score": round(
            mean(risk_scores),
            2
        ),

        "maximum_risk_score": round(
            max(risk_scores),
            2
        ),

        "minimum_risk_score": round(
            min(risk_scores),
            2
        ),

        "average_latency_ms": round(
            mean(latencies),
            2
        ),

        "total_tokens": sum(
            token_counts
        ),

        "average_tokens_per_request": round(
            mean(token_counts),
            2
        ),

        "actions": action_distribution(
            results
        )
    }


# ============================================================
# DETECTION RATE
# ============================================================

def calculate_detection_rate(
    attack_results
):

    if not attack_results:

        return 0.0

    detected = sum(

        1

        for result in attack_results

        if result.get("action")
        in {
            "DELAY",
            "THROTTLE",
            "BLOCK"
        }
    )

    return round(
        (
            detected
            / len(attack_results)
        ) * 100,
        2
    )


# ============================================================
# FALSE POSITIVE RATE
# ============================================================

def calculate_false_positive_rate(
    normal_results
):

    if not normal_results:

        return 0.0

    false_positives = sum(

        1

        for result in normal_results

        if result.get("action")
        in {
            "DELAY",
            "THROTTLE",
            "BLOCK"
        }
    )

    return round(
        (
            false_positives
            / len(normal_results)
        ) * 100,
        2
    )


# ============================================================
# ATTACK METRICS
# ============================================================

def calculate_attack_metrics(
    results
):

    detection_rate = (
        calculate_detection_rate(
            results
        )
    )

    return {

        "detection_rate_percent": (
            detection_rate
        ),

        "average_risk_score": round(
            mean(
                [
                    float(
                        item.get(
                            "risk_score",
                            0
                        )
                    )
                    for item in results
                ]
            ),
            2
        )
        if results
        else 0.0,

        "maximum_risk_score": max(
            [
                float(
                    item.get(
                        "risk_score",
                        0
                    )
                )
                for item in results
            ],
            default=0.0
        ),

        "average_latency_ms": round(
            mean(
                [
                    float(
                        item.get(
                            "latency_ms",
                            0
                        )
                    )
                    for item in results
                ]
            ),
            2
        )
        if results
        else 0.0,

        "total_tokens": sum(
            int(
                item.get(
                    "total_tokens",
                    0
                )
            )
            for item in results
        )
    }


# ============================================================
# OVERALL EVALUATION
# ============================================================

def evaluate():

    print()
    print("=" * 72)
    print(
        "ATBD SECURITY EVALUATION"
    )
    print("=" * 72)
    print()

    loaded = {}

    # ========================================================
    # LOAD ALL SCENARIOS
    # ========================================================

    for scenario, filename in SCENARIOS.items():

        print(
            f"Loading {scenario}..."
        )

        data = load_results(
            filename
        )

        results = successful_results(
            data
        )

        loaded[scenario] = results

        print(
            f"  Requests loaded: "
            f"{len(results)}"
        )

    # ========================================================
    # BASIC METRICS
    # ========================================================

    basic_metrics = {}

    for scenario, results in loaded.items():

        basic_metrics[scenario] = (
            calculate_basic_metrics(
                results
            )
        )

    # ========================================================
    # NORMAL USER METRICS
    # ========================================================

    normal_results = loaded[
        "NORMAL_USER"
    ]

    false_positive_rate = (
        calculate_false_positive_rate(
            normal_results
        )
    )

    # ========================================================
    # ATTACK METRICS
    # ========================================================

    extraction_results = loaded[
        "MODEL_EXTRACTION"
    ]

    wallet_results = loaded[
        "DENIAL_OF_WALLET"
    ]

    extraction_metrics = (
        calculate_attack_metrics(
            extraction_results
        )
    )

    wallet_metrics = (
        calculate_attack_metrics(
            wallet_results
        )
    )

    # ========================================================
    # FINAL EVALUATION
    # ========================================================

    evaluation = {

        "experiment": {
            "name": (
                "Adaptive Token-Level "
                "Behavioral Defense Evaluation"
            ),

            "timestamp": (
                __import__(
                    "datetime"
                ).datetime.now().isoformat()
            ),

            "api": (
                "FastAPI /api/chat"
            ),

            "model": "llama3.2",

            "data_source": (
                "Real ATBD API simulation results"
            )
        },

        "scenarios": basic_metrics,

        "security_metrics": {

            "false_positive_rate_percent": (
                false_positive_rate
            ),

            "model_extraction": (
                extraction_metrics
            ),

            "denial_of_wallet": (
                wallet_metrics
            )
        }
    }

    # ========================================================
    # SAVE
    # ========================================================

    os.makedirs(
        "evaluation",
        exist_ok=True
    )

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            evaluation,
            file,
            indent=4
        )

    # ========================================================
    # DISPLAY RESULTS
    # ========================================================

    print()
    print("=" * 72)
    print("EVALUATION RESULTS")
    print("=" * 72)

    print()

    for scenario, metrics in basic_metrics.items():

        print(
            f"{scenario}"
        )

        print(
            f"  Average Risk     : "
            f"{metrics['average_risk_score']}"
        )

        print(
            f"  Maximum Risk     : "
            f"{metrics['maximum_risk_score']}"
        )

        print(
            f"  Average Latency  : "
            f"{metrics['average_latency_ms']} ms"
        )

        print(
            f"  Total Tokens     : "
            f"{metrics['total_tokens']}"
        )

        print(
            f"  Actions          : "
            f"{metrics['actions']}"
        )

        print()

    print(
        f"False Positive Rate : "
        f"{false_positive_rate}%"
    )

    print()

    print(
        "MODEL EXTRACTION"
    )

    print(
        f"  Detection Rate : "
        f"{extraction_metrics['detection_rate_percent']}%"
    )

    print()

    print(
        "DENIAL OF WALLET"
    )

    print(
        f"  Detection Rate : "
        f"{wallet_metrics['detection_rate_percent']}%"
    )

    print()

    print(
        f"Evaluation saved to:"
    )

    print(
        f"{OUTPUT_FILE}"
    )

    print()
    print("=" * 72)


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    evaluate()