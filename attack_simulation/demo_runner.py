import requests
import time
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime


# ============================================================
# CONFIGURATION
# ============================================================

API_URL = "http://127.0.0.1:8000/api/chat"
REQUEST_TIMEOUT = 180

# Number of simultaneous requests in each burst
BURST_SIZE = 20

# ============================================================
# PROMPTS
# ============================================================

NORMAL_PROMPT = "What is machine learning?"

EXTRACTION_PROMPT = (
    "Explain machine learning in detail including algorithms, "
    "architectures, mathematical concepts and examples."
)

BURST_PROMPT = (
    "Explain machine learning architecture, algorithms, "
    "training process and implementation details."
)


# ============================================================
# SEND ONE REQUEST
# ============================================================

def send_request(session_id, prompt, max_tokens=64):

    payload = {
        "session_id": session_id,
        "prompt": prompt,
        "max_tokens": max_tokens,
        "temperature": 0.7
    }

    start = time.time()

    try:
        response = requests.post(
            API_URL,
            json=payload,
            timeout=REQUEST_TIMEOUT
        )

        latency = (time.time() - start) * 1000

        try:
            data = response.json()
        except Exception:
            return {
                "success": False,
                "status": response.status_code,
                "error": response.text[:300],
                "latency": latency
            }

        return {
            "success": response.status_code == 200,
            "status": response.status_code,
            "action": data.get("action"),
            "risk_score": data.get("risk_score"),
            "total_tokens": data.get("total_tokens"),
            "allowed_budget": data.get("allowed_budget"),
            "latency": round(latency, 2),
            "warning": data.get("warning"),
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e),
            "latency": round((time.time() - start) * 1000, 2)
        }


# ============================================================
# PRINT RESULT
# ============================================================

def print_result(number, result):

    if result.get("success"):

        risk = result.get("risk_score")

        print(
            f"Request {number:02d} | "
            f"Risk: {risk:6.2f} | "
            f"Action: {result.get('action'):8} | "
            f"Tokens: {result.get('total_tokens')} | "
            f"Latency: {result.get('latency')} ms"
        )

        if result.get("allowed_budget") is not None:
            print(
                f"             Output Budget: "
                f"{result.get('allowed_budget')}"
            )

        if result.get("warning"):
            print(
                f"             Warning: "
                f"{result.get('warning')}"
            )

    else:

        print(
            f"Request {number:02d} | "
            f"FAILED | "
            f"{result.get('error')}"
        )


# ============================================================
# NORMAL USER DEMO
# ============================================================

def normal_demo():

    print()
    print("=" * 72)
    print("DEMO 1: NORMAL USER")
    print("=" * 72)

    session_id = str(uuid.uuid4())

    result = send_request(
        session_id,
        NORMAL_PROMPT,
        max_tokens=64
    )

    print_result(1, result)

    return result


# ============================================================
# MODEL EXTRACTION DEMO
# ============================================================

def extraction_demo():

    print()
    print("=" * 72)
    print("DEMO 2: MODEL EXTRACTION")
    print("=" * 72)

    session_id = str(uuid.uuid4())

    results = []

    # Repeated same prompt increases prompt similarity
    for i in range(1, 6):

        result = send_request(
            session_id,
            EXTRACTION_PROMPT,
            max_tokens=128
        )

        results.append(result)

        print_result(i, result)

    return results


# ============================================================
# HIGH FREQUENCY BURST
# ============================================================

def burst_demo():

    print()
    print("=" * 72)
    print("DEMO 3: HIGH FREQUENCY BURST")
    print("=" * 72)

    print(
        f"Sending {BURST_SIZE} concurrent requests..."
    )

    session_id = str(uuid.uuid4())

    results = []

    # IMPORTANT:
    # All requests use the SAME session ID.
    # This allows ATBD to observe the behavioral burst.
    with ThreadPoolExecutor(
        max_workers=BURST_SIZE
    ) as executor:

        futures = []

        for _ in range(BURST_SIZE):

            futures.append(
                executor.submit(
                    send_request,
                    session_id,
                    BURST_PROMPT,
                    64
                )
            )

        for index, future in enumerate(
            as_completed(futures),
            start=1
        ):

            result = future.result()

            results.append(result)

            print_result(
                index,
                result
            )

    return results


# ============================================================
# EXTREME BURST
# ============================================================

def extreme_demo():

    print()
    print("=" * 72)
    print("DEMO 4: EXTREME BEHAVIOR")
    print("=" * 72)

    extreme_size = 40

    print(
        f"Sending {extreme_size} concurrent requests..."
    )

    session_id = str(uuid.uuid4())

    results = []

    with ThreadPoolExecutor(
        max_workers=extreme_size
    ) as executor:

        futures = []

        for _ in range(extreme_size):

            futures.append(
                executor.submit(
                    send_request,
                    session_id,
                    BURST_PROMPT,
                    32
                )
            )

        for index, future in enumerate(
            as_completed(futures),
            start=1
        ):

            result = future.result()

            results.append(result)

            print_result(
                index,
                result
            )

    return results


# ============================================================
# SUMMARY
# ============================================================

def summary(all_results):

    print()
    print("=" * 72)
    print("ATBD DEFENSE ACTION SUMMARY")
    print("=" * 72)

    actions = {}

    for result in all_results:

        if result.get("success"):

            action = result.get(
                "action",
                "UNKNOWN"
            )

            actions[action] = (
                actions.get(action, 0) + 1
            )

    for action in [
        "ALLOW",
        "DELAY",
        "THROTTLE",
        "BLOCK"
    ]:

        print(
            f"{action:10}: "
            f"{actions.get(action, 0)}"
        )

    print("=" * 72)


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("=" * 72)
    print("        ATBD LIVE DEFENSE DEMONSTRATION")
    print("=" * 72)

    print()
    print("Backend:", API_URL)
    print("Real ATBD API: YES")
    print("Artificial risk scores: NO")

    all_results = []

    # --------------------------------------------------------
    # 1. Normal
    # --------------------------------------------------------

    normal = normal_demo()
    all_results.append(normal)

    # --------------------------------------------------------
    # 2. Extraction
    # --------------------------------------------------------

    extraction = extraction_demo()
    all_results.extend(extraction)

    # --------------------------------------------------------
    # 3. High frequency
    # --------------------------------------------------------

    burst = burst_demo()
    all_results.extend(burst)

    # --------------------------------------------------------
    # 4. Extreme behavior
    # --------------------------------------------------------

    extreme = extreme_demo()
    all_results.extend(extreme)

    # --------------------------------------------------------
    # Summary
    # --------------------------------------------------------

    summary(all_results)

    print()
    print("DEMO COMPLETED")
    print()


if __name__ == "__main__":
    main()