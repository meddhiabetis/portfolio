from __future__ import annotations

import os
import socket
from pathlib import Path
from typing import List
import sys

# Vectorstore / text splitter / documents
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

# Prefer langchain_openai provider package for embeddings
try:
    from langchain_openai import OpenAIEmbeddings
except Exception:
    # Fallback - may work depending on your installed packages
    from langchain_community.embeddings import OpenAIEmbeddings  # type: ignore

# Local embedding fallback
try:
    from sentence_transformers import SentenceTransformer
    import numpy as np
except Exception:
    SentenceTransformer = None  # type: ignore

import openai
import httpx

from .core.config import settings


class LocalEmbeddings:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        if SentenceTransformer is None:
            raise RuntimeError("sentence-transformers not installed. Install with: pip install sentence-transformers")
        self.model = SentenceTransformer(model_name)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        arr = self.model.encode(texts, show_progress_bar=True, convert_to_numpy=True)
        return [list(map(float, v)) for v in arr]

    def embed_query(self, text: str) -> List[float]:
        v = self.model.encode([text], convert_to_numpy=True)[0]
        return list(map(float, v))


def load_documents(doc_dir: str | Path | None = None) -> List[Document]:
    base = Path(doc_dir or settings.DOCUMENTS_PATH).expanduser().resolve()
    if not base.exists():
        raise FileNotFoundError(f"DOCUMENTS_PATH does not exist: {base}")

    docs: List[Document] = []
    for path in sorted(base.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix.lower() not in {".txt", ".md"}:
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        if not text.strip():
            continue
        docs.append(Document(page_content=text, metadata={"source": str(path.relative_to(base)), "filename": path.name}))
    return docs


def split_documents(docs: List[Document], chunk_size: int = 600, chunk_overlap: int = 150) -> List[Document]:
    splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=150, separators=["\n\n", "\n", " ", ""])
    return splitter.split_documents(docs)


def configure_embedding_client() -> tuple[str | None, str | None]:
    """
    Configure openai client only for embeddings if OPENAI_EMBEDDING_API_KEY is provided.
    Returns (api_key, api_base) used for embeddings; if no key provided, returns (None, None)
    """
    emb_key = settings.OPENAI_EMBEDDING_API_KEY or None
    emb_base = settings.OPENAI_EMBEDDING_API_BASE or None

    if not emb_key:
        return None, None

    openai.api_key = emb_key
    if emb_base:
        openai.api_base = emb_base.rstrip("/")
        print(f"Configured embedding client API base: {openai.api_base}")
    else:
        # ensure no leftover custom base (do not use OpenRouter base for embeddings)
        openai.api_base = None
        print("Using default OpenAI API base for embeddings.")

    return emb_key, emb_base


def check_connectivity_to_base(base: str, timeout: float = 6.0) -> None:
    if not base:
        return
    try:
        host = base.split("://", 1)[1].split("/", 1)[0]
    except Exception:
        host = base
    try:
        _ = socket.getaddrinfo(host, 443, proto=socket.IPPROTO_TCP)
    except Exception as e:
        print(f"DNS resolution failed for host '{host}': {e}")
        raise
    try:
        resp = httpx.get(base.rstrip("/"), timeout=timeout)
        print(f"HTTP test status to embedding base: {resp.status_code}")
    except Exception as e:
        print(f"HTTP connectivity test failed for {base}: {e}")
        raise


def ingest_documents() -> None:
    # load docs
    raw_docs = load_documents()
    if not raw_docs:
        print("No documents found to ingest (after filtering).")
        return
    docs = split_documents(raw_docs)
    if not docs:
        print("No chunks produced from documents; nothing to ingest.")
        return
    print(f"Ingesting {len(docs)} chunks from {len(raw_docs)} source document(s).")

    # Try to configure embeddings using explicit embedding key/base only
    emb_key, emb_base = configure_embedding_client()

    persist_dir = Path(settings.CHROMA_DB_PATH).expanduser().resolve()
    persist_dir.mkdir(parents=True, exist_ok=True)

    if emb_key:
        # Check connectivity to embedding base (if set)
        if emb_base:
            try:
                check_connectivity_to_base(emb_base)
            except Exception:
                print("Embedding host connectivity failed. You can set OPENAI_EMBEDDING_API_BASE or use local embeddings.")
                raise

        # Create OpenAIEmbeddings instance (uses openai client configured above)
        try:
            embeddings = OpenAIEmbeddings(model=settings.EMBEDDING_MODEL)
        except TypeError:
            # older constructor signatures
            embeddings = OpenAIEmbeddings(openai_api_key=emb_key, model=settings.EMBEDDING_MODEL)

        vectordb = Chroma.from_documents(documents=docs, embedding=embeddings, persist_directory=str(persist_dir))
        vectordb.persist()
        print(f"Done. Persisted to: {persist_dir}")
        return

    # No embedding API key provided -> fallback to local embeddings
    print("No OPENAI_EMBEDDING_API_KEY provided. Falling back to local sentence-transformers embeddings.")
    if SentenceTransformer is None:
        raise RuntimeError("sentence-transformers not installed. Install it: pip install sentence-transformers numpy")
    embeddings = LocalEmbeddings()
    vectordb = Chroma.from_documents(documents=docs, embedding=embeddings, persist_directory=str(persist_dir))
    vectordb.persist()
    print(f"Done with local embeddings. Persisted to: {persist_dir}")


if __name__ == "__main__":
    ingest_documents()