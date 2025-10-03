from __future__ import annotations

import os
from typing import List, Optional
import httpx
import re

HF_API_URL_BASE = "https://api-inference.huggingface.co/embeddings"

def _normalize(t: str) -> str:
    return re.sub(r"\s+", " ", (t or "")).strip()

class HFInferenceEmbeddings:
    """
    Hugging Face Inference API embeddings wrapper (no local model load).
    Env:
      - HUGGINGFACE_API_KEY
      - RAG_EMBEDDING_MODEL (default: sentence-transformers/all-MiniLM-L6-v2)
      - RAG_EMB_DOC_PREFIX / RAG_EMB_QUERY_PREFIX (optional)
    """
    def __init__(self, model_name: Optional[str] = None, *, timeout: float = 30.0, batch_size: int = 32):
        self.token = os.getenv("HUGGINGFACE_API_KEY", "").strip()
        if not self.token:
            raise RuntimeError("Missing HUGGINGFACE_API_KEY")

        m = (model_name or os.getenv("RAG_EMBEDDING_MODEL") or "sentence-transformers/all-MiniLM-L6-v2").strip()
        # Auto-prefix common ST models if user provided bare name like "all-mpnet-base-v2"
        if "/" not in m:
            m = f"sentence-transformers/{m}"
        self.model_name = m

        self.timeout = timeout
        self.batch_size = max(1, int(batch_size))

        low = self.model_name.lower()
        if "e5" in low or "bge" in low:
            self.doc_prefix = os.getenv("RAG_EMB_DOC_PREFIX", "passage: ")
            self.query_prefix = os.getenv("RAG_EMB_QUERY_PREFIX", "query: ")
        else:
            self.doc_prefix = os.getenv("RAG_EMB_DOC_PREFIX", "")
            self.query_prefix = os.getenv("RAG_EMB_QUERY_PREFIX", "")

    def _endpoint(self) -> str:
        return f"{HF_API_URL_BASE}/{self.model_name}"

    def _post(self, inputs: List[str]) -> List[List[float]]:
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }
        payload = {"inputs": inputs}
        with httpx.Client(timeout=self.timeout) as client:
            r = client.post(self._endpoint(), headers=headers, json=payload)
            # Provide clearer guidance on common 4xx
            if r.status_code in (401, 403):
                detail = (r.text or "").strip()[:300]
                raise RuntimeError(
                    f"Hugging Face API auth/permissions error ({r.status_code}). "
                    f"Check HUGGINGFACE_API_KEY and model repo id '{self.model_name}'. Detail: {detail}"
                )
            r.raise_for_status()
            data = r.json()
        if isinstance(data, dict) and "embeddings" in data:
            return data["embeddings"]
        return data  # assume list[list[float]]

    def _batch(self, rows: List[str], prefix: str) -> List[List[float]]:
        out: List[List[float]] = []
        n = len(rows)
        i = 0
        while i < n:
            chunk = rows[i:i + self.batch_size]
            prepped = [prefix + _normalize(t) for t in chunk]
            vecs = self._post(prepped)
            out.extend(vecs)
            i += self.batch_size
        return out

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        return self._batch(texts, self.doc_prefix)

    def embed_query(self, text: str) -> List[float]:
        vecs = self._batch([text], self.query_prefix)
        return vecs[0] if vecs else []