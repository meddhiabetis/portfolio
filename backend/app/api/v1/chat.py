from __future__ import annotations

import json
import logging
import os
import re
import traceback
from typing import List, Literal, Optional, Tuple, Set, Dict, Any

import requests
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from ...core.rag import get_rag

logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(name)s:%(message)s")

router = APIRouter(prefix="/api/v1", tags=["chat"])
log = logging.getLogger("app.chat")
log.setLevel(logging.INFO)

CHAT_HANDLER_VERSION = "chat-v12-hybrid-chunks-mpnet-rerank-2025-09-13"
REFUSAL_PHRASE = "i don't know based on the provided context."


class Msg(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    top_k: int = Field(6, ge=1, le=16)
    model: Optional[str] = Field(None, examples=[None, "openai/gpt-oss-20b:free"])
    messages: Optional[List[Msg]] = None  # last 3 messages are used as memory
    debug: bool = Field(False, description="Include debug info in responses (success and error)")
    min_grounding_coverage: Optional[float] = Field(None, description="Default 0.20; 0..1")


class ChatResponse(BaseModel):
    answer: str
    context_sources: List[str]
    debug_meta: Optional[Dict[str, Any]] = None  # included only if debug=true


def _unique_snippets(snips: List[str], max_chars: int = 3500) -> List[str]:
    seen: Set[str] = set()
    out: List[str] = []
    total = 0
    for s in snips:
        s2 = s.strip()
        if not s2 or s2 in seen:
            continue
        if total + len(s2) > max_chars:
            break
        seen.add(s2)
        out.append(s2)
        total += len(s2)
    return out


def _extract_subject_from_history(history: List[Msg]) -> Optional[str]:
    if not history:
        return None
    for m in reversed(history[-3:]):
        text = (m.content or "").strip()
        if not text:
            continue
        m1 = re.search(r"\bwho\s+is\s+([a-z][a-z\s\.\-']{2,100})\??$", text, flags=re.I)
        if m1:
            return m1.group(1).strip()
        if re.search(r"\bmohamed\s+dhia\s+betis\b", text, flags=re.I):
            return "Mohamed Dhia Betis"
    return None


def _build_search_queries(user_message: str, history: List[Msg]) -> List[str]:
    base = user_message.strip()
    subject = _extract_subject_from_history(history) or "Mohamed Dhia Betis"
    queries: List[str] = []

    # Base/coref expansions
    queries.append(base)
    queries.append(f"{base} about {subject}")
    queries.append(f"{subject}: {base}")

    low = base.lower()

    # Certifications synonyms
    if "certif" in low or "credential" in low:
        exp = ["certifications", "certificates", "credentials", "professional certificates"]
        for e in exp:
            queries.append(f"{e} of {subject}")
            queries.append(f"{subject} {e}")

    # Education/before synonyms
    if "before" in low or "study" in low or "education" in low or "school" in low:
        edu_exp = [
            "education history",
            "prior education",
            "previous studies",
            "preparatory course",
            "IPEIN",
            "Institut Préparatoire aux Études d’Ingénieur de Nabeul",
        ]
        for e in edu_exp:
            queries.append(f"{subject} {e}")
            queries.append(f"{e} {subject}")

    # Projects/experience bias
    if "project" in low or "experience" in low:
        queries.append(f"{subject} projects")
        queries.append(f"{subject} professional experience")

    # Dedup preserving order
    seen: Set[str] = set()
    out: List[str] = []
    for q in queries:
        q2 = q.strip()
        if q2 and q2 not in seen:
            seen.add(q2)
            out.append(q2)
    return out


def build_messages(user_message: str, context_docs: List[str], history: List[Msg]) -> List[dict]:
    """
    Build prompt messages. If the user asks for a list (certifications, skills, projects, organizations),
    switch into 'list mode' where the assistant must enumerate ALL matching items found in the Context.
    Otherwise use the standard synthesis instructions.
    """
    # Helper: is this a list request?
    def _is_list_intent(text: str) -> bool:
        return bool(re.search(r"\b(certif|certificate|certifications|skills?|projects?|experience|organizations?)\b", text, flags=re.I))

    list_intent = _is_list_intent(user_message)

    if list_intent:
        guide = (
            "You are a portfolio assistant. Use ONLY the facts in the provided Context.\n"
            "Rules (LIST MODE):\n"
            "1) Find ALL items in the Context that directly answer the user's question (e.g., a list of certifications, skills, projects).\n"
            "2) Return the items as a short bullet list or a semicolon-separated list (single line). If items have issuer/date/credential_id, include them compactly after the item in parentheses.\n"
            "3) Do NOT invent or add items that are not present in the Context. If nothing relevant is found, reply exactly: \"I don't know based on the provided context.\""
        )
    else:
        guide = (
            "You are a portfolio assistant.\n"
            "Rules:\n"
            "1) Use ONLY the facts in the provided Context.\n"
            "2) Synthesize and paraphrase; do NOT copy long phrases verbatim from the Context.\n"
            "3) Write a coherent, natural paragraph (1–3 sentences) answering the user's question.\n"
            "4) If there are truly no relevant facts in the Context, reply exactly: \"I don't know based on the provided context.\""
        )

    snippets = _unique_snippets(context_docs, max_chars=3500)
    context_block = "\n\n".join(f"- {c}" for c in snippets)

    if list_intent:
        user_prompt = (
            "Use ONLY this Context to answer. List all matching items exactly and compactly.\n"
            "<CONTEXT>\n"
            f"{context_block}\n"
            "</CONTEXT>\n\n"
            f"Question: {user_message}\n"
            "Answer (provide an exhaustive list; use bullets or semicolons; include issuer/date if available):"
        )
    else:
        user_prompt = (
            "Use ONLY this Context to answer. Paraphrase into a short, natural paragraph.\n"
            "<CONTEXT>\n"
            f"{context_block}\n"
            "</CONTEXT>\n\n"
            f"Question: {user_message}\n"
            "Answer:"
        )

    msgs: List[dict] = [{"role": "system", "content": guide}]
    if history:
        for m in history[-3:]:
            msgs.append({"role": m.role, "content": m.content})
    msgs.append({"role": "user", "content": user_prompt})
    # small internal flag for caller to adjust temperature
    msgs.append({"role": "system", "content": f"<LIST_INTENT={str(list_intent)}>"})
    return msgs


def _content_words(text: str) -> Set[str]:
    return {w for w in re.findall(r"[a-z0-9\-]+", text.lower()) if len(w) >= 4}


def validate_grounding(answer: str, context_docs: List[str], min_coverage: float) -> Tuple[bool, float, List[str]]:
    context = " ".join(context_docs).lower()
    words = list(_content_words(answer))
    if not words:
        return True, 1.0, []
    covered = sum(1 for w in words if w in context)
    coverage = covered / max(1, len(words))
    missing = [w for w in words if w not in context][:12]
    return (coverage >= min_coverage), coverage, missing


def call_openrouter(
    *,
    messages: List[dict],
    model: str,
    base_url: str,
    api_key: str,
    site_url: str,
    site_title: str,
    temperature: float = 0.2,
    top_p: float = 0.9,
    timeout: float = 20.0,
) -> Tuple[Optional[str], Optional[Dict[str, Any]], Dict[str, Any]]:
    url = base_url.rstrip("/") + "/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": site_url,
        "X-Title": site_title,
    }
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "top_p": top_p,
    }

    log.info("OpenRouter call -> url=%s model=%s msgs=%d", url, model, len(messages))
    http_meta: Dict[str, Any] = {"url": url, "model": model, "payload_preview": {"messages_len": len(messages)}}
    try:
        resp = requests.post(url, headers=headers, data=json.dumps(payload), timeout=timeout)
        http_meta["status"] = resp.status_code
        http_meta["content_type"] = resp.headers.get("content-type", "")
        http_meta["body_preview"] = (resp.text or "")[:600]
    except Exception as e:
        err = {"error": "request_error", "detail": str(e)}
        log.error("OpenRouter request failed: %s\n%s", e, traceback.format_exc())
        return None, err, http_meta

    log.info("OpenRouter resp: status=%s ctype=%s body[:200]=%s",
             http_meta["status"], http_meta["content_type"], http_meta["body_preview"][:200])

    if resp.status_code // 100 != 2:
        return None, {"error": f"http_{resp.status_code}"}, http_meta

    try:
        data = resp.json()
    except Exception as je:
        log.error("OpenRouter JSON parse failed: %s; body[:400]=%s", je, http_meta["body_preview"][:400])
        return None, {"error": "json_parse_error", "detail": str(je)}, http_meta

    content = (data.get("choices") or [{}])[0].get("message", {}).get("content")
    if not content:
        return None, {"error": "empty_content"}, http_meta
    return content, None, http_meta


def is_refusal(answer: str) -> bool:
    return answer.strip().lower() == REFUSAL_PHRASE


@router.get("/chat/_version")
def chat_version():
    return {"version": CHAT_HANDLER_VERSION}


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    dbg: Dict[str, Any] = {"handler": CHAT_HANDLER_VERSION}

    # Env
    api_key = os.getenv("OPENROUTER_API_KEY", "").strip()
    if not api_key:
        return JSONResponse(status_code=502, content={"error": "missing_api_key", "env": "OPENROUTER_API_KEY"})
    base_url = (os.getenv("OPENROUTER_API_BASE") or "https://openrouter.ai/api/v1").rstrip("/")
    site_url = os.getenv("PUBLIC_SITE_URL") or os.getenv("NEXT_PUBLIC_SITE_URL") or os.getenv("SITE_URL") or "http://localhost:3000"
    site_title = os.getenv("SITE_TITLE") or "Portfolio"
    req_model = (req.model or "").strip()
    if req_model.lower() == "string":
        req_model = ""
    model = req_model or os.getenv("OPENROUTER_MODEL", "openai/gpt-oss-20b:free")
    dbg.update({"base_url": base_url, "model": model})

    log.info("Chat handler=%s model=%s top_k=%d debug=%s", CHAT_HANDLER_VERSION, model, req.top_k, req.debug)

    # RETRIEVAL: coref-aware, synonym-expanded; MMR for diversity; cross-encoder rerank
    rag = get_rag()
    history = req.messages or []
    queries = _build_search_queries(req.message, history)
    all_docs: List[Any] = []

    # Larger fetch_k for better recall with hybrid chunks
    FETCH_K = max(96, req.top_k * 12)
    TOP_K = min(max(8, req.top_k), 12)

    for q in queries:
        try:
            docs_q = rag.retrieve_mmr(q, k=min(TOP_K, 8), fetch_k=FETCH_K, lambda_mult=0.5)
        except Exception:
            docs_q = rag.retrieve(q, k=min(TOP_K, 8))
        all_docs.extend(docs_q)

    # Deduplicate by (source, head-80)
    seen_keys: Set[str] = set()
    dedup_docs: List[Any] = []
    for d in all_docs:
        src = str(d.metadata.get("source", ""))
        head = (d.page_content or "")[:80]
        key = f"{src}|{head}"
        if key not in seen_keys:
            seen_keys.add(key)
            dedup_docs.append(d)

    # Optional rerank with cross-encoder (if available)
    rerank_query = queries[0]
    docs_ranked = rag.rerank_cross_encoder(rerank_query, dedup_docs, top_n=max(TOP_K, 8)) or dedup_docs
    docs = docs_ranked[: max(6, TOP_K)]
    context_snippets = [d.page_content[:1500] for d in docs]
    ctx_sources = [str(d.metadata.get("source", "")) for d in docs]

    dbg["retrieval"] = {
        "q_count": len(queries),
        "queries": queries,
        "docs_count": len(docs),
        "sources": list(dict.fromkeys(ctx_sources)),
        "first_snippet_head": (context_snippets[0][:200] if context_snippets else ""),
        "reranker": rag.reranker_name(),
    }
    log.info("Retrieved %d doc(s). Sources=%s", len(ctx_sources), dbg["retrieval"]["sources"])

    # Build messages (which includes a LIST_INTENT marker)
    messages = build_messages(req.message, context_snippets, history)

    # Determine temperature: if list intent then deterministic
    list_intent = bool(re.search(r"\b(certif|certificate|certifications|skills?|projects?|experience|organizations?)\b", req.message, flags=re.I))
    temperature = 0.0 if list_intent else 0.2

    # LLM call (NO PROVIDER FALLBACK)
    answer, err, http_meta = call_openrouter(
        messages=messages,
        model=model,
        base_url=base_url,
        api_key=api_key,
        site_url=site_url,
        site_title=site_title,
        temperature=temperature,
        top_p=0.9,
    )
    dbg["openrouter"] = http_meta
    if err:
        detail = {"LLMError": err}
        if req.debug:
            detail["debug_meta"] = dbg
        return JSONResponse(status_code=502, content=detail)

    if is_refusal(answer or ""):
        safe = "I couldn’t find that information in the provided documents."
        resp_debug = {"reason": "model_refusal", **dbg} if req.debug else None
        return ChatResponse(answer=safe, context_sources=ctx_sources, debug_meta=resp_debug)

    # Grounding validation
    threshold = req.min_grounding_coverage if (req.min_grounding_coverage is not None) else 0.20
    grounded, coverage, missing = validate_grounding(answer or "", context_snippets, min_coverage=threshold)
    log.info("Grounding coverage=%.2f grounded=%s missing=%s", coverage, grounded, missing)

    if not grounded:
        safe = "I couldn’t find that information in the provided documents."
        resp_debug = {
            "reason": "low_coverage",
            "coverage": round(coverage, 3),
            "threshold": threshold,
            **dbg,
        } if req.debug else None
        return ChatResponse(answer=safe, context_sources=ctx_sources, debug_meta=resp_debug)

    # Success — return answer and sources
    resp_debug: Optional[Dict[str, Any]] = None
    if req.debug:
        resp_debug = {
            "coverage": round(coverage, 3),
            "missing_terms_sample": missing,
            "llm_answer_preview": (answer or "")[:300],
            "retrieval": dbg["retrieval"],
            "openrouter": {
                "status": http_meta.get("status"),
                "content_type": http_meta.get("content_type"),
            },
        }

    return ChatResponse(answer=(answer or ""), context_sources=ctx_sources, debug_meta=resp_debug)