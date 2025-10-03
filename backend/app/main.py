from __future__ import annotations

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.v1.chat import router as chat_router
from .api.v1.debug_rag import router as debug_rag_router
# If you have the /health router file, you can import and include it as well:
# from .api.v1.health import router as health_router

app = FastAPI(title="Portfolio Backend")

# CORS configuration
# Comma-separated list of allowed origins (exact matches)
# Example value to set on Render:
#   CORS_ALLOW_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,https://your-project-name.vercel.app,https://your-custom-domain.com"
origins_env = os.getenv(
    "CORS_ALLOW_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
)
allow_origins = [o.strip() for o in origins_env.split(",") if o.strip()]

# Optional regex to allow Vercel previews automatically, e.g. https://<branch>-<proj>.vercel.app
# You can override this via CORS_ALLOW_ORIGIN_REGEX if you want to restrict further or disable.
allow_origin_regex = os.getenv("CORS_ALLOW_ORIGIN_REGEX", r"https://.*\.vercel\.app$")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=allow_origin_regex,  # used in addition to allow_origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

# If your Render health check is /healthz (keep if you configured that)
@app.get("/healthz")
def healthz():
    return {"status": "ok"}

# Optional: avoid 404 on "/"
@app.get("/")
def root():
    return {"message": "Backend up"}

app.include_router(chat_router)
app.include_router(debug_rag_router)
# app.include_router(health_router)