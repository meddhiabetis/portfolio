from __future__ import annotations

import os
from typing import List, Optional, Union
import httpx
import re

HF_API_URL_BASE = "https://api-inference.huggingface.co"

def _normalize(t: str) -> str:
    return re.sub(r"\s+", " ", (t or "")).strip()

def _mean_pool(matrix: List[List[float]]) -> List[float]:
    # Average over tokens (rows) to get a sentence embedding.
    if not matrix:
        return []
    rows = len(matrix)
    cols = len(matrix[0]) if rows else 0
    if cols == 0:
        return []
    sums = [0.0] * cols
    for row in matrix:
        # Guard against ragged responses
        if not row:
            continue
        if len(row) != cols:
            # Truncate/extend to match first row
            row = (row + [0.0] * cols)[:cols]
        for j, v in enumerate(row):
            sums[j] += float(v)
    return [s / max(1, rows) for s in sums]

class HFInferenceEmbeddings:
    """
    Hugging Face Inference API embeddings wrapper (no local model load).
    Tries the unified embeddings endpoint first; on 401/403, falls back to
    serverless feature-extraction and mean-pools token embeddings.

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
        # Auto-prefix common ST models if user provided bare name like "all-MiniLM-L6-v2"
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

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

    def _endpoint_embeddings(self) -> str:
        return f"{HF_API_URL_BASE}/embeddings/{self.model_name}"

    def _endpoint_feature_extraction(self) -> str:
        # Serverless pipeline endpoint
        return f"{HF_API_URL_BASE}/pipeline/feature-extraction/{self.model_name}"

    def _post_embeddings(self, inputs: List[str]) -> List[List[float]]:
        payload = {"inputs": inputs}
        with httpx.Client(timeout=self.timeout) as client:
            r = client.post(self._endpoint_embeddings(), headers=self._headers(), json=payload)
            if r.status_code in (401, 403):
                # Caller will trigger fallback
                raise PermissionError(
                    f"HF embeddings endpoint not permitted ({r.status_code}). "
                    "Falling back to feature-extraction."
                )
            r.raise_for_status()
            data = r.json()
        # Either {"embeddings":[...]} or list[list[float]]
        if isinstance(data, dict) and "embeddings" in data:
            return data["embeddings"]
        return data

    def _post_feature_extraction(self, inputs: List[str]) -> List[List[float]]:
        # For ST models, returns per-token vectors; we mean-pool.
        payload = {"inputs": inputs, "options": {"wait_for_model": True}}
        with httpx.Client(timeout=self.timeout) as client:
            r = client.post(self._endpoint_feature_extraction(), headers=self._headers(), json=payload)
            r.raise_for_status()
            data = r.json()

        # Possible shapes:
        # - Single input -> List[List[float]] (tokens x dim)
        # - Batch -> List[List[List[float]]]
        # - Rarely direct List[float] if provider returns already pooled
        if isinstance(data, list) and data and isinstance(data[0], list) and data and isinstance(data[0][0], list):
            # Batch of matrices
            return [_mean_pool(mat) for mat in data]  # type: ignore[arg-type]
        if isinstance(data, list) and data and isinstance(data[0], list) and isinstance(data[0][0], (int, float)):
            # Single matrix
            return [_mean_pool(data)]  # type: ignore[arg-type]
        if isinstance(data, list) and data and isinstance(data[0], (int, float)):
            # Already a vector
            return [list(map(float, data))]
        # Unknown format; raise helpful error
        raise RuntimeError(f"Unexpected HF feature-extraction response format for model '{self.model_name}'")

    def _batch(self, rows: List[str], prefix: str) -> List[List[float]]:
        out: List[List[float]] = []
        n = len(rows)
        i = 0
        while i < n:
            chunk = rows[i:i + self.batch_size]
            prepped = [prefix + _normalize(t) for t in chunk]
            try:
                vecs = self._post_embeddings(prepped)
            except PermissionError:
                vecs = self._post_feature_extraction(prepped)
            out.extend(vecs)
            i += self.batch_size
        return out

    # LangChain-compatible methods
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        return self._batch(texts, self.doc_prefix)

    def embed_query(self, text: str) -> List[float]:
        vecs = self._batch([text], self.query_prefix)
        return vecs[0] if vecs else []