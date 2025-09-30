from __future__ import annotations

import json
import os

import requests
from fastapi import APIRouter, HTTPException, Query

from ...core.rag import get_rag
from .chat import build_messages  # reuse same builder

router = APIRouter(prefix="/api/v1/debug/openrouter", tags=["debug-openrouter"])


@router.get("/models")
def list_models():
    key = os.getenv("OPENROUTER_API_KEY", "")
    base = (os.getenv("OPENROUTER_API_BASE") or "https://openrouter.ai/api/v1").rstrip("/")
    if not key:
        raise HTTPException(status_code=400, detail="Missing OPENROUTER_API_KEY")
    try:
        r = requests.get(base + "/models", headers={"Authorization": f"Bearer {key}"}, timeout=15)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"request_error: {e}")
    try:
        data = r.json()
        return {"status": r.status_code, "json_keys": list(data.keys()), "models_count": len(data.get("data", []))}
    except Exception:
        return {"status": r.status_code, "content_type": r.headers.get("content-type", ""), "body_preview": (r.text or "")[:1000]}


@router.post("/ping")
def ping_model(model: str = "openai/gpt-oss-20b:free"):
    key = os.getenv("OPENROUTER_API_KEY", "")
    base = (os.getenv("OPENROUTER_API_BASE") or "https://openrouter.ai/api/v1").rstrip("/")
    if not key:
        raise HTTPException(status_code=400, detail="Missing OPENROUTER_API_KEY")
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": "Reply with the single word: pong"}],
        "temperature": 0.0,
    }
    try:
        r = requests.post(
            base + "/chat/completions",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            data=json.dumps(payload),
            timeout=20,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"request_error: {e}")
    try:
        data = r.json()
        content = (data.get("choices") or [{}])[0].get("message", {}).get("content", "")
    except Exception:
        content = None
    return {
        "status": r.status_code,
        "ok": r.ok,
        "content_type": r.headers.get("content-type", ""),
        "content_preview": (content or (r.text or ""))[:300],
    }


@router.get("/build_messages")
def build_payload_preview(
    question: str = Query(..., description="User question"),
    top_k: int = Query(6, ge=1, le=16),
):
    """
    Builds the exact messages array we will send to OpenRouter for a given question
    using the same retrieval as /chat. Helps verify context and prompt.
    """
    rag = get_rag()
    if hasattr(rag, "retrieve"):
        docs = rag.retrieve(question, k=top_k)
    else:
        raise HTTPException(status_code=500, detail="RAG not initialized")
    snippets = [d.page_content[:600] for d in docs]
    messages = build_messages(question, snippets, [])
    return {
        "messages": messages,
        "sources": [str(d.metadata.get("source", "")) for d in docs],
        "first_snippet_head": (snippets[0][:200] if snippets else ""),
    }