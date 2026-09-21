# 🛡️ ATBD – Adaptive Token-Level Behavioral Defense

ATBD is an LLM security framework designed to detect suspicious behavioral patterns associated with model extraction attacks.

It analyzes:
- Token consumption
- Request frequency
- Prompt similarity
- Session duration
- Output size

Based on the calculated risk score (0–100), the system dynamically applies:

| Risk | Action |
|---|---|
| < 30 | 🟢 ALLOW |
| 30–59 | 🟡 DELAY |
| 60–79 | 🟠 THROTTLE |
| ≥ 80 | 🔴 BLOCK |

## ✨ Features

- Behavioral risk scoring
- Model extraction detection
- Adaptive defense mechanisms
- Real-time security dashboard
- Redis-based session tracking
- Llama 3.2 integration
- Attack simulation and evaluation

## 🛠️ Tech Stack

**Frontend:** React, Vite, Redux Toolkit, Framer Motion  
**Backend:** Python, FastAPI, Redis  
**LLM:** Llama 3.2  
**Security:** Adaptive behavioral risk scoring

## 🚀 Run

### Backend

```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
