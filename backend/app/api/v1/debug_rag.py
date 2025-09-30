from __future__ import annotations

from pathlib import Path
from typing import List, Dict, Any, Optional

from fastapi import APIRouter, Query

from ...core.rag import get_rag
from ...core.config import settings

router = APIRouter(prefix="/api/v1/debug/rag", tags=["debug-rag"])


@router.get("/info")
def rag_info() -> Dict[str, Any]:
    rag = get_rag()
    docs_dir = Path(settings.DOCUMENTS_PATH).expanduser().resolve()
    file_count = 0
    sample_files: List[str] = []
    if docs_dir.exists():
        files = [p for p in docs_dir.rglob("*") if p.is_file() and p.suffix.lower() in {".txt", ".md"}]
        file_count = len(files)
        sample_files = [str(p.name) for p in files[:10]]
    stats = rag.stats()
    return {
        "documents_path": str(docs_dir),
        "docs_file_count": file_count,
        "docs_sample": sample_files,
        "vectorstore_stats": stats,
    }


@router.post("/reindex")
def rag_reindex(
    # Back-compat: accept chunk_size, but prefer chunk_chars
    chunk_size: int = Query(600, ge=200, le=4000, description="Deprecated, use chunk_chars"),
    overlap: int = Query(120, ge=0, le=1000),
    chunk_chars: Optional[int] = Query(None, ge=200, le=4000),
):
    rag = get_rag()
    size = int(chunk_chars or chunk_size)
    result = rag.reindex(settings.DOCUMENTS_PATH, chunk_chars=size, overlap=overlap)
    return {"status": "ok", **result}


@router.get("/search")
def rag_search(
    query: str = Query(..., min_length=1),
    top_k: int = Query(8, ge=1, le=64),
    fetch_k: int = Query(64, ge=1, le=256),
    use_mmr: bool = Query(True),
) -> Dict[str, Any]:
    """
    Debug endpoint: run retrieval queries and return raw chunks/snippets.
    """
    rag = get_rag()
    try:
        if use_mmr:
            docs = rag.retrieve_mmr(query, k=top_k, fetch_k=fetch_k, lambda_mult=0.5)
        else:
            docs = rag.retrieve(query, k=top_k)
    except Exception:
        docs = rag.retrieve(query, k=top_k)
    out = []
    for i, d in enumerate(docs):
        out.append({
            "rank": i + 1,
            "source": str(d.metadata.get("source", "")),
            "section": d.metadata.get("section", ""),
            "snippet_head": (d.page_content or "")[:400].replace("\n", " "),
        })
    return {
        "query": query,
        "top_k": top_k,
        "fetch_k": fetch_k,
        "use_mmr": use_mmr,
        "results": out,
        "reranker": rag.reranker_name(),
    }