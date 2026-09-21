import requests
import time
import uuid
import json
import os
from datetime import datetime


# ============================================================
# CONFIGURATION
# ============================================================

API_URL = "http://127.0.0.1:8000/api/chat"

OUTPUT_DIR = "attack_simulation/results"

REQUEST_TIMEOUT = 180


# ============================================================
# NORMAL USER WORKLOAD
# ============================================================

NORMAL_PROMPTS = [
    "What is artificial intelligence?",
    "How does photosynthesis work?",
    "What are the benefits of exercise?",
    "Explain the water cycle.",
    "What is cloud computing?",
    "How does a database work?",
    "What is cybersecurity?",
    "Explain object oriented programming.",
    "What is an operating system?",
    "How does the internet work?"
]


# ============================================================
# MODEL EXTRACTION WORKLOAD
# ============================================================

EXTRACTION_PROMPTS = [
    "Explain machine learning in detail.",
    "Explain machine learning in detail.",
    "Explain machine learning in detail.",
    "Explain machine learning in detail.",
    "Explain machine learning in detail.",
    "Explain machine learning in detail.",
    "Explain machine learning in detail.",
    "Explain machine learning in detail.",
    "Explain machine learning in detail.",
    "Explain machine learning in detail.",
    "Explain machine learning in detail.",
    "Explain machine learning in detail.",
    "Explain machine learning in detail.",
    "Explain machine learning in detail.",
    "Explain machine learning in detail."
]


# ============================================================
# DENIAL-OF-WALLET WORKLOAD
# ============================================================

WALLET_PROMPTS = [
    "Provide a very detailed explanation of machine learning including algorithms, architectures, mathematical concepts, applications, advantages, disadvantages, and examples.",
    "Provide a very detailed explanation of deep learning including neural networks, training, optimization, architectures, applications, advantages, disadvantages, and examples.",
    "Provide a very detailed explanation of artificial intelligence including its history, techniques, algorithms, applications, limitations, risks, and future directions.",
    "Provide a very detailed explanation of natural language processing including tokenization, embeddings, transformers, attention, training, applications, and limitations.",
    "Provide a very detailed explanation of computer vision including image processing, convolutional neural networks, object detection, segmentation, applications, and limitations.",
    "Provide a very detailed explanation of reinforcement learning including agents, environments, rewards, policies, value functions, exploration, exploitation, and applications.",
    "Provide a very detailed explanation of neural networks including perceptrons, activation functions, backpropagation, optimization, architectures, and applications.",
    "Provide a very detailed explanation of large language models including tokenization, transformers, training, inference, context windows, and applications.",
    "Provide a very detailed explanation of generative AI including language models, image generation, training, inference, applications, risks, and limitations.",
    "Provide a very detailed explanation of machine learning security including adversarial attacks, model extraction, data poisoning, privacy, and defenses."
]


# ============================================================
# SEND REQUEST
# ============================================================

def send_request(
    session_id,
    prompt,
    max_tokens=64
):

    payload = {
        "session_id": session_id,
        "prompt": prompt,
        "max_tokens": max_tokens,
        "temperature": 0.7
    }

    client_start = time.time()

    try:

        response = requests.post(
            API_URL,
            json=payload,
            timeout=REQUEST_TIMEOUT
        )

        client_latency = (
            time.time() - client_start
        ) * 1000

        if response.status_code == 200:

            data = response.json()

            return {

                "success": True,

                "timestamp": (
                    datetime.now().isoformat()
                ),

                "session_id": session_id,

                "prompt": prompt,

                "http_status": (
                    response.status_code
                ),

                "action": data.get(
                    "action"
                ),

                "risk_score": data.get(
                    "risk_score"
                ),

                "input_tokens": data.get(
                    "input_tokens"
                ),

                "output_tokens": data.get(
                    "output_tokens"
                ),

                "total_tokens": data.get(
                    "total_tokens"
                ),

                "latency_ms": data.get(
                    "latency_ms"
                ),

                "model": data.get(
                    "model"
                ),

                "explanation": data.get(
                    "explanation"
                ),

                "warning": data.get(
                    "warning"
                ),

                "allowed_budget": data.get(
                    "allowed_budget"
                ),

                "client_latency_ms": round(
                    client_latency,
                    2
                )
            }

        return {

            "success": False,

            "timestamp": (
                datetime.now().isoformat()
            ),

            "session_id": session_id,

            "prompt": prompt,

            "http_status": (
                response.status_code
            ),

            "error": response.text,

            "client_latency_ms": round(
                client_latency,
                2
            )
        }

    except requests.exceptions.RequestException as error:

        return {

            "success": False,

            "timestamp": (
                datetime.now().isoformat()
            ),

            "session_id": session_id,

            "prompt": prompt,

            "error": str(error)
        }


# ============================================================
# RUN WORKLOAD
# ============================================================

def run_workload(
    scenario_name,
    prompts,
    max_tokens,
    delay_between_requests
):

    print()
    print("=" * 72)
    print(
        f"SCENARIO: {scenario_name}"
    )
    print("=" * 72)

    session_id = str(
        uuid.uuid4()
    )

    print(
        f"Session ID: {session_id}"
    )

    print()

    results = []

    for index, prompt in enumerate(
        prompts,
        start=1
    ):

        print(
            f"[{scenario_name}] "
            f"Request {index}/{len(prompts)}"
        )

        print(
            f"Prompt: {prompt[:100]}"
        )

        result = send_request(
            session_id=session_id,
            prompt=prompt,
            max_tokens=max_tokens
        )

        results.append(
            result
        )

        if result.get("success"):

            print(
                f"Risk   : "
                f"{result.get('risk_score'):.2f}"
            )

            print(
                f"Action : "
                f"{result.get('action')}"
            )

            print(
                f"Tokens : "
                f"{result.get('total_tokens')}"
            )

            print(
                f"Latency: "
                f"{result.get('latency_ms')} ms"
            )

            if result.get("warning"):

                print(
                    f"Warning: "
                    f"{result.get('warning')}"
                )

        else:

            print(
                f"ERROR: "
                f"{result.get('error')}"
            )

        print("-" * 72)

        if delay_between_requests > 0:

            time.sleep(
                delay_between_requests
            )

    return session_id, results


# ============================================================
# SAVE RESULTS
# ============================================================

def save_results(
    scenario_name,
    session_id,
    results
):

    os.makedirs(
        OUTPUT_DIR,
        exist_ok=True
    )

    filename = (
        scenario_name.lower()
        .replace(" ", "_")
        + "_results.json"
    )

    filepath = os.path.join(
        OUTPUT_DIR,
        filename
    )

    data = {

        "scenario": scenario_name,

        "session_id": session_id,

        "generated_at": (
            datetime.now().isoformat()
        ),

        "total_requests": len(
            results
        ),

        "successful_requests": sum(
            1
            for item in results
            if item.get("success")
        ),

        "results": results
    }

    with open(
        filepath,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            data,
            file,
            indent=4,
            ensure_ascii=False
        )

    return filepath


# ============================================================
# PRINT SUMMARY
# ============================================================

def print_summary(
    scenario_name,
    results
):

    successful = [
        item
        for item in results
        if item.get("success")
    ]

    print()
    print(
        "=" * 72
    )

    print(
        f"{scenario_name} SUMMARY"
    )

    print(
        "=" * 72
    )

    print(
        f"Total Requests : "
        f"{len(results)}"
    )

    print(
        f"Successful     : "
        f"{len(successful)}"
    )

    if not successful:

        return

    print()

    print(
        "Request | Risk  | Action"
    )

    print(
        "-" * 38
    )

    for index, result in enumerate(
        successful,
        start=1
    ):

        risk = float(
            result.get(
                "risk_score",
                0
            )
        )

        action = result.get(
            "action",
            "UNKNOWN"
        )

        print(
            f"{index:7} | "
            f"{risk:5.2f} | "
            f"{action}"
        )

    print()

    action_counts = {}

    for result in successful:

        action = result.get(
            "action",
            "UNKNOWN"
        )

        action_counts[action] = (
            action_counts.get(
                action,
                0
            ) + 1
        )

    print(
        "Defense Action Distribution:"
    )

    for action, count in (
        action_counts.items()
    ):

        print(
            f"  {action}: {count}"
        )


# ============================================================
# MAIN SIMULATION
# ============================================================

def main():

    print()
    print("=" * 72)
    print(
        "ATBD MODEL EXTRACTION & "
        "DENIAL-OF-WALLET SIMULATOR"
    )
    print("=" * 72)

    print()
    print(
        "All results are obtained from the "
        "real ATBD API."
    )

    print(
        "No artificial risk scores are generated."
    )

    # ========================================================
    # NORMAL USER
    # ========================================================

    normal_session, normal_results = (
        run_workload(

            scenario_name="NORMAL_USER",

            prompts=NORMAL_PROMPTS,

            max_tokens=64,

            delay_between_requests=2.0
        )
    )

    normal_file = save_results(
        "NORMAL_USER",
        normal_session,
        normal_results
    )

    print_summary(
        "NORMAL_USER",
        normal_results
    )

    print(
        f"\nSaved: {normal_file}"
    )

    # ========================================================
    # MODEL EXTRACTION
    # ========================================================

    extraction_session, extraction_results = (
        run_workload(

            scenario_name="MODEL_EXTRACTION",

            prompts=EXTRACTION_PROMPTS,

            max_tokens=512,

            delay_between_requests=0.2
        )
    )

    extraction_file = save_results(
        "MODEL_EXTRACTION",
        extraction_session,
        extraction_results
    )

    print_summary(
        "MODEL_EXTRACTION",
        extraction_results
    )

    print(
        f"\nSaved: {extraction_file}"
    )

    # ========================================================
    # DENIAL OF WALLET
    # ========================================================

    wallet_session, wallet_results = (
        run_workload(

            scenario_name="DENIAL_OF_WALLET",

            prompts=WALLET_PROMPTS,

            max_tokens=512,

            delay_between_requests=0.1
        )
    )

    wallet_file = save_results(
        "DENIAL_OF_WALLET",
        wallet_session,
        wallet_results
    )

    print_summary(
        "DENIAL_OF_WALLET",
        wallet_results
    )

    print(
        f"\nSaved: {wallet_file}"
    )

    # ========================================================
    # FINAL
    # ========================================================

    print()
    print("=" * 72)
    print("ALL SIMULATIONS COMPLETED")
    print("=" * 72)

    print()
    print(
        "Result files:"
    )

    print(
        f"1. {normal_file}"
    )

    print(
        f"2. {extraction_file}"
    )

    print(
        f"3. {wallet_file}"
    )

    print()


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()