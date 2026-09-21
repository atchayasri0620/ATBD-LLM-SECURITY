from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.api.routes import router


# ============================================================
# ATBD APPLICATION
# ============================================================

app = FastAPI(
    title="ATBD — LLM Security",
    description=(
        "Adaptive Token-Level Behavioral Defense "
        "against Model Extraction Attacks in Large Language Models"
    ),
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:8000",
        "http://localhost:8000",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# API ROUTES
# ============================================================

app.include_router(router)


# ============================================================
# FRONTEND
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

print(f"Frontend directory: {FRONTEND_DIR}")
print(f"Frontend exists: {FRONTEND_DIR.exists()}")


app.mount(
    "/",
    StaticFiles(
        directory=str(FRONTEND_DIR),
        html=True,
    ),
    name="frontend",
)


# ============================================================
# STARTUP
# ============================================================

@app.on_event("startup")
async def startup_event():

    print("=" * 60)
    print("ATBD — LLM SECURITY SYSTEM")
    print("=" * 60)
    print("Backend      : FastAPI")
    print("Frontend     : Enabled")
    print("API          : /api")
    print("Swagger      : /docs")
    print("Model        : Llama 3.2")
    print("Frontend URL : http://127.0.0.1:8000")
    print("=" * 60)