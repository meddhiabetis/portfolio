from __future__ import annotations

import os
import re
import shutil
from pathlib import Path
from typing import List, Tuple, Any, Dict, Optional

# Prefer modern import; fallback to community if not installed
try:
    from langchain_chroma import Chroma  # pip install langchain-chroma
except Exception:
    from langchain_community.vectorstores import Chroma  # fallback

from langchain_core.documents import Document

from .config import settings

# Local embeddings and optional cross-encoder reranker
try:
    from sentence_transformers import SentenceTransformer, CrossEncoder
except Exception:
    SentenceTransformer = None  # type: ignore
    CrossEncoder = None  # type: ignore

# Hugging Face Inference embeddings
try:
    from .hf_embeddings import HFInferenceEmbeddings
except Exception:
    HFInferenceEmbeddings = None  # type: ignore


# -------------------------------
# Hybrid chunking helpers
# -------------------------------

SEC_PATTERN = re.compile(r"(?m)^##\s+(.+?)\s*$")
SUBSEC_PATTERN = re.compile(r"(?m)^###\s+(.+?)\s*$")


def _read_text_files(docs_dir: Path) -> List[Tuple[str, str]]:
    """Return list of (relative_name, text) for .txt/.md files."""
    out: List[Tuple[str, str]] = []
    if not docs_dir.exists():
        return out
    for p in docs_dir.rglob("*"):
        if p.is_file() and p.suffix.lower() in {".txt", ".md"}:
            try:
                out.append((str(p.relative_to(docs_dir)), p.read_text(encoding="utf-8", errors="ignore")))
            except Exception:
                pass
    return out


def _split_sections(text: str) -> List[Tuple[str, int, int]]:
    """
    Split by '## ' headings. Returns a list of (section_title, start_idx, end_idx).
    If no '##', returns a single section 'General'.
    """
    matches = list(SEC_PATTERN.finditer(text))
    if not matches:
        return [("General", 0, len(text))]
    sections: List[Tuple[str, int, int]] = []
    for i, m in enumerate(matches):
        title = m.group(1).strip()
        start = m.end()
        end = matches[i + 1].start() if (i + 1) < len(matches) else len(text)
        sections.append((title or "General", start, end))
    return sections


def _sentences(text: str) -> List[str]:
    """
    Simple sentence splitter without external deps.
    Splits on punctuation followed by whitespace and a capital/number/bracket.
    """
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return []
    parts: List[str] = []
    last = 0
    for m in re.finditer(r"([\.!?])\s+(?=[A-Z0-9\[])", text):
        end = m.end()
        seg = text[last:end].strip()
        if seg:
            parts.append(seg)
        last = end
    tail = text[last:].strip()
    if tail:
        parts.append(tail)
    return parts if parts else [text]


def _chunk_long(text: str, target_chars: int, overlap: int) -> List[str]:
    """
    Sliding-window chunking by characters, trying to end on sentence boundary.
    """
    if len(text) <= target_chars * 1.2:
        return [text.strip()]
    sents = _sentences(text)
    chunks: List[str] = []
    buf: List[str] = []
    curr_len = 0
    for s in sents:
        if curr_len + len(s) + 1 <= target_chars or not buf:
            buf.append(s)
            curr_len += len(s) + 1
        else:
            chunks.append(" ".join(buf).strip())
            # overlap approx by characters
            if overlap > 0 and chunks[-1]:
                keep = chunks[-1][-overlap:]
                start_idx = max(0, len(keep) - overlap)
                buf = [keep[start_idx:]]
                curr_len = len(buf[0])
            else:
                buf = []
                curr_len = 0
            buf.append(s)
            curr_len += len(s) + 1
    if buf:
        chunks.append(" ".join(buf).strip())
    return [c for c in chunks if c]


def _hybrid_chunk(
    text: str,
    filename: str,
    chunk_chars: int = 600,
    overlap: int = 120,
) -> List[Tuple[str, Dict[str, Any]]]:
    """
    Hybrid chunking with section awareness and overlap.
    """
    results: List[Tuple[str, Dict[str, Any]]] = []
    sections = _split_sections(text)
    for si, (title, start, end) in enumerate(sections):
        raw = text[start:end].strip()
        if not raw:
            continue
        chunks = _chunk_long(raw, target_chars=chunk_chars, overlap=overlap)
        for ci, chunk in enumerate(chunks):
            content = chunk if ci > 0 else f"[Section: {title}]\n{chunk}"
            meta: Dict[str, Any] = {
                "source": filename,
                "section": title,
                "section_index": si,
                "chunk_index": ci,
            }
            results.append((content, meta))
    return results


# -------------------------------
# Embeddings providers
# -------------------------------

class LocalEmbeddings:
    """
    SentenceTransformer wrapper with model-specific instructions:
    - E5/BGE families expect 'query: ' and 'passage: ' prefixes
    """
    def __init__(self, model_name: Optional[str] = None):
        if SentenceTransformer is None:
            raise RuntimeError("sentence-transformers not installed. pip install sentence-transformers")
        model_name = model_name or os.getenv("RAG_EMBEDDING_MODEL", "all-mpnet-base-v2")
        self.model_name = model_name
        self.model = SentenceTransformer(model_name)

        low = model_name.lower()
        if "e5" in low or "bge" in low:
            self.doc_prefix = os.getenv("RAG_EMB_DOC_PREFIX", "passage: ")
            self.query_prefix = os.getenv("RAG_EMB_QUERY_PREFIX", "query: ")
        else:
            self.doc_prefix = os.getenv("RAG_EMB_DOC_PREFIX", "")
            self.query_prefix = os.getenv("RAG_EMB_QUERY_PREFIX", "")

    @staticmethod
    def _normalize(t: str) -> str:
        return re.sub(r"\s+", " ", (t or "")).strip()

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        prepped = [(self.doc_prefix + self._normalize(t)) for t in texts]
        vecs = self.model.encode(prepped, show_progress_bar=False, convert_to_numpy=True)
        return [v.tolist() for v in vecs]

    def embed_query(self, text: str) -> List[float]:
        prepped = self.query_prefix + self._normalize(text)
        return self.model.encode([prepped], convert_to_numpy=True)[0].tolist()


# -------------------------------
# RAG store
# -------------------------------

class RAGStore:
    def __init__(self, persist_dir: str | None = None):
        self.persist_dir = str(Path(persist_dir or settings.CHROMA_DB_PATH).expanduser().resolve())

        # Prefer HF Inference when available (no local model load)
        if HFInferenceEmbeddings and os.getenv("HUGGINGFACE_API_KEY"):
            model_name = os.getenv("RAG_EMBEDDING_MODEL") or "sentence-transformers/all-MiniLM-L6-v2"
            self.embeddings = HFInferenceEmbeddings(model_name=model_name)
        else:
            self.embeddings = LocalEmbeddings()

        self._init_vs()

        # Optional cross-encoder reranker (disable via env: RAG_RERANKER_MODEL=disabled)
        self._reranker_name = os.getenv("RAG_RERANKER_MODEL", "cross-encoder/ms-marco-MiniLM-L-6-v2")
        self._reranker: Optional[Any] = None
        self._reranker_loaded: bool = False

    def _init_vs(self):
        self.vs = Chroma(
            persist_directory=self.persist_dir,
            embedding_function=self.embeddings,
        )

    def _reset_vs(self):
        try:
            if Path(self.persist_dir).exists():
                shutil.rmtree(self.persist_dir, ignore_errors=True)
        except Exception:
            pass
        self._init_vs()

    def _ensure_reranker(self):
        if self._reranker_loaded:
            return
        self._reranker_loaded = True
        name = (self._reranker_name or "").strip().lower()
        if not name or name in {"none", "disabled", "off"}:
            self._reranker = None
            return
        if CrossEncoder is None:
            self._reranker = None
            return
        try:
            self._reranker = CrossEncoder(self._reranker_name)
        except Exception:
            self._reranker = None

    def reranker_name(self) -> str:
        self._ensure_reranker()
        return self._reranker_name if self._reranker is not None else "disabled"

    # Retrieval
    def retrieve(self, query: str, k: int = 6) -> List[Document]:
        return self.vs.similarity_search(query, k=k)

    def retrieve_mmr(self, query: str, k: int = 6, fetch_k: int = 20, lambda_mult: float = 0.5) -> List[Document]:
        return self.vs.maximal_marginal_relevance_search(query, k=k, fetch_k=fetch_k, lambda_mult=lambda_mult)

    def retrieve_with_scores(self, query: str, k: int = 6) -> List[Tuple[Document, float | None]]:
        try:
            return self.vs.similarity_search_with_relevance_scores(query, k=k)
        except Exception:
            docs = self.vs.similarity_search(query, k=k)
            return [(d, None) for d in docs]

    def rerank_cross_encoder(self, query: str, docs: List[Document], top_n: int = 8) -> Optional[List[Document]]:
        self._ensure_reranker()
        if not self._reranker or not docs:
            return None
        pairs = [(query, d.page_content) for d in docs]
        try:
            scores = self._reranker.predict(pairs)  # higher is better
        except Exception:
            return None
        ranked = sorted(zip(docs, scores), key=lambda x: float(x[1]), reverse=True)
        return [d for d, _ in ranked[:top_n]]

    # Indexing with hybrid chunking
    def reindex(
        self,
        docs_path: Optional[str] = None,
        chunk_chars: int = 600,
        overlap: int = 120,
    ) -> Dict[str, Any]:
        docs_dir = Path(docs_path or settings.DOCUMENTS_PATH).expanduser().resolve()
        files = _read_text_files(docs_dir)

        texts: List[str] = []
        metas: List[Dict[str, Any]] = []

        for fname, raw in files:
            pieces = _hybrid_chunk(
                raw,
                filename=fname,
                chunk_chars=chunk_chars,
                overlap=overlap,
            )
            for content, meta in pieces:
                texts.append(content)
                metas.append(meta)

        # Reset and add
        self._reset_vs()
        if texts:
            try:
                self.vs.add_texts(texts=texts, metadatas=metas)
            except Exception:
                # some chroma variants accept Document objects only
                docs = [Document(page_content=t, metadata=m) for t, m in zip(texts, metas)]
                try:
                    self.vs.add_documents(docs)
                except Exception:
                    pass
            try:
                self.vs.persist()
            except Exception:
                pass

        return {
            "docs_path": str(docs_dir),
            "files_indexed": len(files),
            "chunks_indexed": len(texts),
            "embedding_model": getattr(self.embeddings, "model_name", "unknown"),
            "doc_prefix": getattr(self.embeddings, "doc_prefix", ""),
            "query_prefix": getattr(self.embeddings, "query_prefix", ""),
            "chunk_chars": chunk_chars,
            "overlap": overlap,
        }

    def stats(self) -> Dict[str, Any]:
        info: Dict[str, Any] = {
            "persist_dir": self.persist_dir,
            "embedding_impl": type(self.embeddings).__name__,
            "embedding_model": getattr(self.embeddings, "model_name", "unknown"),
            "doc_prefix": getattr(self.embeddings, "doc_prefix", ""),
            "query_prefix": getattr(self.embeddings, "query_prefix", ""),
        }
        try:
            coll = getattr(self.vs, "_collection", None)
            if coll:
                info["collection_name"] = getattr(coll, "name", None)
                try:
                    info["vector_count"] = coll.count()
                except Exception:
                    info["vector_count"] = None
        except Exception:
            pass
        return info


_rag: RAGStore | None = None

def get_rag() -> RAGStore:
    global _rag
    if _rag is None:
        _rag = RAGStore(persist_dir=settings.CHROMA_DB_PATH)
    return _rag