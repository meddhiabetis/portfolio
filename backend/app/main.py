from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.v1.chat import router as chat_router
from .api.v1.debug_rag import router as debug_rag_router

app = FastAPI(title="Portfolio Backend")

# Adjust to match your webapp origin(s)
origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(chat_router)
app.include_router(debug_rag_router)