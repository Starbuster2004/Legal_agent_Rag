from embeddings import embed_texts
from db_store import query_collection
from llm import chat
from typing import List, Dict, Any
import json

# Lazy load reranking model
_rerank_model = None

def _get_rerank_model():
    global _rerank_model
    if _rerank_model is None:
        from sentence_transformers import CrossEncoder
        # Using a cross-encoder model for better reranking
        _rerank_model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
    return _rerank_model

def retrieve(collection, query: str, k=5):
    q_emb = embed_texts([query])[0]
    return query_collection(collection, q_emb, k=k)

def expand_query(query: str) -> str:
    """Expand query with synonyms and related terms using embeddings"""
    # Simple query expansion - just return original for now
    # Could use a local model here for query expansion in future
    return query

def rerank(query: str, candidates: List[Dict[str,Any]], top_k: int = 3):
    """Rerank candidates using Hugging Face cross-encoder model"""
    if not candidates:
        return []
    
    try:
        model = _get_rerank_model()
        # Prepare pairs for cross-encoder
        pairs = [[query, c['text']] for c in candidates]
        # Get scores
        scores = model.predict(pairs)
        # Sort by scores
        ranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)
        return [c for c, _ in ranked[:top_k]]
    except Exception as e:
        # Fallback to distance-based sorting
        print(f"Reranking failed: {e}, falling back to distance sorting")
        return sorted(candidates, key=lambda x: x['score'])[:top_k]

def build_context(cands):
    context_parts = []
    for i, c in enumerate(cands):
        source_file = c.get('meta', {}).get('source_file', 'unknown')
        context_parts.append(f"[src:{i}] (from: {source_file})\n{c['text']}")
    return '\n\n'.join(context_parts)

def verify_citations(answer: str, cands: List[Dict[str,Any]]):
    missing = []
    for idx,c in enumerate(cands):
        snippet_tag = f"[src:{idx}]"
        if snippet_tag in answer and c['text'] not in answer:
            missing.append(idx)
    return missing
