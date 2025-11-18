from typing import List
import hashlib
from config import cfg

# lazy import to speed startup
_model = None
_cache = {}

# Available Hugging Face models for different use cases
AVAILABLE_MODELS = {
    'default': 'sentence-transformers/all-MiniLM-L6-v2',  # Fast, general purpose
    'legal': 'nlpaueb/legal-bert-base-uncased',  # Legal domain specific
    'multilingual': 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2',  # Multi-language
    'accurate': 'sentence-transformers/all-mpnet-base-v2',  # More accurate but slower
}

def _cache_key(texts: List[str]) -> str:
    return hashlib.sha256(("||".join(texts)).encode()).hexdigest()

def _get_model(model_name: str = None):
    global _model
    model_name = model_name or cfg.HUGGINGFACE_EMBED_MODEL
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer(model_name)
    return _model

def embed_texts(texts: List[str], batch_size: int = 32, model_name: str = None) -> List[List[float]]:
    """Embed texts using Hugging Face models. Supports multiple model types."""
    key = _cache_key(texts)
    if key in _cache: return _cache[key]
    model = _get_model(model_name)
    embs = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        e = model.encode(batch, show_progress_bar=False, convert_to_numpy=True)
        embs.extend(e.tolist())
    _cache[key] = embs
    return embs

def get_available_models():
    """Return list of available Hugging Face models"""
    return AVAILABLE_MODELS
