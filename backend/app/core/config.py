from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    # Chroma persistence path
    CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./data/chroma_db")

    # Embeddings provider (recommended: OpenAI). These keys are used by ingestion.py
    OPENAI_EMBEDDING_API_KEY = os.getenv("OPENAI_EMBEDDING_API_KEY", "")
    OPENAI_EMBEDDING_API_BASE = os.getenv("OPENAI_EMBEDDING_API_BASE", "")  # leave empty for OpenAI

    # LLM provider key (OpenRouter or OpenAI) used elsewhere in your app for the LLM only
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")  # use for the LLM/chat provider only
    OPENROUTER_API_BASE = os.getenv("OPENROUTER_API_BASE", "https://api.openrouter.ai/v1")

    # Embedding model name you want to use when using OpenAI embeddings
    EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")

    # Where your source docs live (txt / md)
    DOCUMENTS_PATH = os.getenv("DOCUMENTS_PATH", "app/docs")

settings = Settings()