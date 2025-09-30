from __future__ import annotations

from typing import List

try:
    from sentence_transformers import SentenceTransformer
except Exception as e:
    raise RuntimeError(
        "sentence-transformers is required. Install with: pip install sentence-transformers"
    ) from e


class LocalEmbeddings:
    """
    Minimal embeddings wrapper compatible with Chroma/langchain usage.
    """
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        vectors = self.model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
        return [v.tolist() for v in vectors]

    def embed_query(self, text: str) -> List[float]:
        v = self.model.encode([text], convert_to_numpy=True)[0]
        return v.tolist()


def get_local_embeddings(model_name: str = "all-MiniLM-L6-v2") -> LocalEmbeddings:
    return LocalEmbeddings(model_name=model_name)