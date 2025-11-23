import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass
class Config:
    OPENROUTER_API_KEY: str = os.getenv('OPENROUTER_API_KEY')
    LLM_MODEL: str = os.getenv('LLM_MODEL','google/gemma-3-27b-it:free')
    CHROMA_DIR: str = os.getenv('CHROMA_DIR','./chromadb_persist')
    # Hugging Face models - using local models to reduce API calls
    HUGGINGFACE_EMBED_MODEL: str = os.getenv('HUGGINGFACE_EMBED_MODEL','sentence-transformers/all-MiniLM-L6-v2')
    RERANK_MODEL: str = os.getenv('RERANK_MODEL','cross-encoder/ms-marco-MiniLM-L-6-v2')
    # Admin credentials
    ADMIN_PASSWORD: str = os.getenv('ADMIN_PASSWORD', 'admin123')

cfg = Config()
