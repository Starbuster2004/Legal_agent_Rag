import pypdf
from io import BytesIO
from db_store import chroma_client, get_or_create_collection, add_documents, query_all_collections
from embeddings import embed_texts
from retriever import retrieve, rerank, build_context, verify_citations
from llm import chat

def index_file_bytes(file_bytes: bytes, filename: str, client_path: str = None):
    client = chroma_client(client_path)
    col = get_or_create_collection(client, filename)
    reader = pypdf.PdfReader(stream=BytesIO(file_bytes))
    
    # Extract text with page numbers
    pages_text = [(i+1, p.extract_text() or '') for i, p in enumerate(reader.pages)]
    text = '\n'.join([f"[Page {num}] {txt}" for num, txt in pages_text])
    
    # Create chunks with overlap for better context
    chunk_size = 1000
    overlap = 200
    chunks = []
    for i in range(0, len(text), chunk_size - overlap):
        chunk = text[i:i+chunk_size]
        if chunk.strip():
            chunks.append(chunk)
    
    ids = [f"{filename}_chunk_{i}" for i in range(len(chunks))]
    embs = embed_texts(chunks)
    add_documents(col, chunks, ids, embs, filename=filename)
    return col

def run_rag(query: str, client=None, top_k: int = 5, chat_history: list = None):
    """Run RAG across all documents with optional chat history for conversational context"""
    if client is None:
        client = chroma_client()
    
    # Get query embedding
    from embeddings import embed_texts
    query_emb = embed_texts([query])[0]
    
    # Query across all collections (optimized: reduced candidates for speed)
    cands = query_all_collections(client, query_emb, k=top_k)
    if not cands: return 'No relevant documents found in the database. Please ask an administrator to upload and index documents first.'
    # Skip reranking for faster responses - use direct retrieval results
    # top = rerank(query, cands, top_k=top_k)
    ctx = build_context(cands)
    
    # Build prompt with chat history if available
    history_context = ""
    if chat_history and len(chat_history) > 1:
        recent_history = chat_history[-6:]  # Last 3 exchanges (user + assistant)
        history_text = "\n".join([f"{msg['role'].upper()}: {msg['content'][:200]}" for msg in recent_history[:-1]])
        history_context = f"\n\nPREVIOUS CONVERSATION:\n{history_text}\n"
    
    prompt = f"""You are a helpful legal assistant chatbot. Use the CONTEXT from the documents to answer questions accurately.

CONTEXT FROM DOCUMENTS:
{ctx}{history_context}

CURRENT QUESTION: {query}

Provide a detailed, conversational answer based on the context. Cite sources using [src:i] format. Be helpful and natural in your responses. If referring to previous questions, acknowledge them. Include relevant legal disclaimers when appropriate."""
    
    # Reduced max_tokens for faster responses
    ans = chat(prompt, max_tokens=1024)
    # Citation verification removed to keep responses clean
    # missing = verify_citations(ans, top)
    # if missing:
    #     ans += f"\n\n[Note] Some cited snippets may not match retrieved text: {missing}"
    return ans
