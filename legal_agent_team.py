import streamlit as st
from agno.agent import Agent
from agno.models.openai import OpenAIChat
import tempfile
import os
from pypdf import PdfReader
import chromadb
from chromadb.config import Settings
import hashlib
from datetime import datetime
from typing import List, Dict
import re
import json
import requests

# Optional fallback (only used if Ollama isn't running)
_FALLBACK_ST_AVAILABLE = True
try:
    from sentence_transformers import SentenceTransformer
except Exception:
    _FALLBACK_ST_AVAILABLE = False

# ============================================================================
# CONFIGURATION
# ============================================================================
COLLECTION_NAME = "legal_documents"
CHUNK_SIZE = 800
CHUNK_OVERLAP = 200
MAX_CONTEXT_CHUNKS = 5
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
OLLAMA_EMBED_MODEL = os.environ.get("OLLAMA_EMBED_MODEL", "nomic-embed-text")
EMBED_DIM = 768  # nomic-embed-text outputs 768d

# ============================================================================
# SESSION STATE INITIALIZATION
# ============================================================================
def init_session_state():
    defaults = {
        'chroma_client': None,
        'collection': None,
        'legal_team': None,
        'document_metadata': {},
        'processed_files': {},
        'chat_history': [],
        'embedding_cache': {},
        'shared_openrouter_model': None,
        'openrouter_api_key': os.environ.get("OPENROUTER_API_KEY") or os.environ.get("OPENAI_API_KEY", "")
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v

# ============================================================================
# OPENROUTER SHARED MODEL
# ============================================================================
def set_openrouter_api_key(key: str):
    if not key:
        return
    os.environ["OPENAI_API_KEY"] = key
    os.environ["OPENROUTER_API_KEY"] = key
    st.session_state["openrouter_api_key"] = key
    st.session_state["shared_openrouter_model"] = None

def get_shared_openrouter_model():
    if st.session_state.shared_openrouter_model is not None:
        return st.session_state.shared_openrouter_model

    api_key = (
        os.environ.get('OPENAI_API_KEY')
        or os.environ.get('OPENROUTER_API_KEY')
        or st.session_state.get('openrouter_api_key')
    )
    if not api_key:
        st.error("OpenRouter API key not set. Add it in the sidebar or set OPENAI_API_KEY/OPENROUTER_API_KEY.")
        raise RuntimeError("Missing OpenRouter API key")

    shared_model = OpenAIChat(
        id="openai/gpt-oss-20b:free",
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
        max_tokens=1024,
        temperature=0.3,
    )
    st.session_state.shared_openrouter_model = shared_model
    return shared_model

# ============================================================================
# EMBEDDING: REPLACE BROKEN IMPORT WITH ROBUST LOCAL CLIENT
# ============================================================================
class OllamaLocalEmbedder:
    """
    Minimal client for Ollama embeddings API.
    POST {OLLAMA_URL}/api/embeddings
    Body: {"model": "...", "prompt": "text"}
    Returns: {"embedding": [floats]}
    """
    def __init__(self, url: str = OLLAMA_URL, model: str = OLLAMA_EMBED_MODEL, dim: int = EMBED_DIM):
        self.url = url.rstrip("/")
        self.model = model
        self.dim = dim
        self._fallback = None  # SentenceTransformer model if needed

    def _embed_ollama(self, text: str):
        resp = requests.post(
            f"{self.url}/api/embeddings",
            headers={"Content-Type": "application/json"},
            data=json.dumps({"model": self.model, "prompt": text})
        )
        resp.raise_for_status()
        data = resp.json()
        emb = data.get("embedding")
        if not emb or not isinstance(emb, list):
            raise ValueError("Invalid embedding response from Ollama")
        return emb

    def _ensure_fallback(self):
        if self._fallback is None:
            if not _FALLBACK_ST_AVAILABLE:
                raise RuntimeError(
                    "Ollama not reachable and sentence-transformers not installed. "
                    "Install 'sentence-transformers' or start Ollama."
                )
            self._fallback = SentenceTransformer("all-MiniLM-L6-v2")

    def get_embedding(self, text: str):
        text = (text or "").strip()
        if not text:
            return None
        try:
            return self._embed_ollama(text)
        except Exception:
            # Fallback to sentence-transformers if Ollama is down
            self._ensure_fallback()
            return self._fallback.encode(text).tolist()

# ============================================================================
# CHROMADB
# ============================================================================
def init_chromadb():
    try:
        db_path = os.path.join(tempfile.gettempdir(), "legal_agent_chromadb")
        os.makedirs(db_path, exist_ok=True)
        client = chromadb.PersistentClient(
            path=db_path,
            settings=Settings(anonymized_telemetry=False, allow_reset=True)
        )
        collection = client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"description": "Legal documents collection"}
        )
        st.session_state.chroma_client = client
        st.session_state.collection = collection
        return client, collection
    except Exception as e:
        st.error(f"ChromaDB initialization error: {str(e)}")
        return None, None

# ============================================================================
# SMART CHUNKING
# ============================================================================
def smart_chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[Dict]:
    chunks = []
    paragraphs = text.split('\n\n')
    current_chunk, current_size, chunk_id = "", 0, 0

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        para_size = len(para)

        if para_size > chunk_size:
            if current_chunk:
                chunks.append({'text': current_chunk.strip(), 'chunk_id': chunk_id, 'size': current_size})
                chunk_id += 1
                current_chunk, current_size = "", 0

            sentences = re.split(r'(?<=[.!?])\s+', para)
            for sentence in sentences:
                if current_size + len(sentence) > chunk_size and current_chunk:
                    chunks.append({'text': current_chunk.strip(), 'chunk_id': chunk_id, 'size': current_size})
                    chunk_id += 1
                    overlap_text = current_chunk[-overlap:] if len(current_chunk) > overlap else current_chunk
                    current_chunk = (overlap_text + " " + sentence).strip()
                    current_size = len(current_chunk)
                else:
                    if current_chunk:
                        current_chunk += " " + sentence
                    else:
                        current_chunk = sentence
                    current_size = len(current_chunk)
        elif current_size + para_size > chunk_size:
            chunks.append({'text': current_chunk.strip(), 'chunk_id': chunk_id, 'size': current_size})
            chunk_id += 1
            overlap_text = current_chunk[-overlap:] if len(current_chunk) > overlap else current_chunk
            current_chunk = (overlap_text + "\n\n" + para).strip()
            current_size = len(current_chunk)
        else:
            if current_chunk:
                current_chunk += "\n\n" + para
            else:
                current_chunk = para
            current_size = len(current_chunk)

    if current_chunk.strip():
        chunks.append({'text': current_chunk.strip(), 'chunk_id': chunk_id, 'size': current_size})
    return chunks

# ============================================================================
# PDF EXTRACT
# ============================================================================
def extract_pdf_with_metadata(file_path: str) -> Dict:
    with open(file_path, 'rb') as f:
        reader = PdfReader(f)
        metadata = {
            'num_pages': len(reader.pages),
            'title': reader.metadata.get('/Title', 'Untitled') if reader.metadata else 'Untitled',
            'author': reader.metadata.get('/Author', 'Unknown') if reader.metadata else 'Unknown',
            'processed_date': datetime.now().isoformat()
        }
        pages_text = []
        for i, page in enumerate(reader.pages):
            try:
                text = page.extract_text() or ""
            except Exception as e:
                st.warning(f"Error extracting page {i+1}: {str(e)}")
                text = ""
            pages_text.append({'page_num': i + 1, 'text': text, 'char_count': len(text)})
        full_text = "\n\n".join([p['text'] for p in pages_text])
        return {'text': full_text, 'pages': pages_text, 'metadata': metadata}

# ============================================================================
# STORE DOC IN CHROMADB
# ============================================================================
def store_document_in_chromadb(file_name: str, document_data: Dict, collection) -> bool:
    try:
        doc_hash = hashlib.md5(document_data['text'].encode()).hexdigest()
        if file_name in st.session_state.processed_files and st.session_state.processed_files[file_name] == doc_hash:
            st.info("Document already processed with same content")
            return True

        chunks = smart_chunk_text(document_data['text'])
        if not chunks:
            st.error("No chunks created from document")
            return False

        chunk_ids, chunk_texts, chunk_metadatas = [], [], []
        for chunk in chunks:
            cid = f"{file_name}_{chunk['chunk_id']}"
            chunk_ids.append(cid)
            chunk_texts.append(chunk['text'])
            chunk_metadatas.append({
                'source': file_name,
                'chunk_id': chunk['chunk_id'],
                'char_count': chunk['size'],
                'doc_title': document_data['metadata']['title'],
                'doc_author': document_data['metadata']['author'],
                'num_pages': str(document_data['metadata']['num_pages']),
                'processed_date': document_data['metadata']['processed_date']
            })

        with st.spinner(f"Embedding {len(chunks)} chunks (Ollama: {OLLAMA_EMBED_MODEL})..."):
            embedder = OllamaLocalEmbedder()
            valid_ids, valid_docs, valid_metas, valid_embeddings = [], [], [], []
            for idx, text in enumerate(chunk_texts):
                emb = embedder.get_embedding(text)
                if emb:
                    valid_ids.append(chunk_ids[idx])
                    valid_docs.append(text)
                    valid_metas.append(chunk_metadatas[idx])
                    valid_embeddings.append(emb)

            if not valid_embeddings:
                st.error("Failed to generate embeddings. Start Ollama (or install sentence-transformers).")
                return False

            collection.add(
                ids=valid_ids,
                documents=valid_docs,
                embeddings=valid_embeddings,
                metadatas=valid_metas
            )

        st.session_state.processed_files[file_name] = doc_hash
        st.session_state.document_metadata[file_name] = document_data['metadata']
        st.success(f"✅ Stored {len(valid_docs)} chunks in ChromaDB")
        return True
    except Exception as e:
        st.error(f"Error storing in ChromaDB: {str(e)}")
        return False

# ============================================================================
# RETRIEVE CONTEXT
# ============================================================================
def retrieve_relevant_context(query: str, collection, n_results: int = MAX_CONTEXT_CHUNKS) -> str:
    try:
        if not collection:
            return ""
        embedder = OllamaLocalEmbedder()

        expanded = [
            query,
            f"legal analysis of {query}",
            f"contract terms regarding {query}",
        ]
        all_docs = []
        for q in expanded[:2]:
            q_emb = embedder.get_embedding(q)
            results = collection.query(query_embeddings=[q_emb], n_results=n_results)
            if results and results.get('documents'):
                all_docs.extend(results['documents'][0])

        # Deduplicate
        seen = set()
        unique = []
        for d in all_docs:
            if d not in seen:
                unique.append(d)
                seen.add(d)

        return "\n\n---\n\n".join(unique[:n_results])
    except Exception as e:
        st.warning(f"Context retrieval error: {str(e)}")
        return ""

# ============================================================================
# LEGAL AGENT
# ============================================================================
def initialize_legal_team():
    return Agent(
        name="Legal Team Coordinator",
        role="Senior legal strategist and coordinator",
        model=get_shared_openrouter_model(),
        instructions=[
            "Provide comprehensive legal analysis including research, contract analysis, and risk assessment",
            "Synthesize insights and provide actionable recommendations with clear structure",
            "Cite or reference document sections when applicable",
        ],
        markdown=True
    )

# ============================================================================
# MAIN APP
# ============================================================================
def main():
    st.set_page_config(page_title="AI Legal Agent Team", page_icon="⚖️", layout="wide")
    init_session_state()

    st.title("⚖️ AI Legal Agent Team")
    st.markdown("*Powered by local Ollama embeddings + ChromaDB (free) + OpenRouter for reasoning*")

    with st.sidebar:
        st.header("📊 System Status")
        with st.expander("🔐 OpenRouter API Key", expanded=False):
            key_input = st.text_input("Enter OpenRouter API Key", type="password", value=st.session_state.get("openrouter_api_key", ""))
            if st.button("Save API Key"):
                set_openrouter_api_key(key_input.strip())
                st.success("API key saved")

        if not st.session_state.chroma_client:
            with st.spinner("Initializing ChromaDB..."):
                client, collection = init_chromadb()
                if client:
                    st.success("✅ ChromaDB Ready (Local Storage)")
                else:
                    st.error("❌ ChromaDB initialization failed")

        if st.session_state.collection:
            try:
                count = st.session_state.collection.count()
                st.metric("Stored Chunks", count)
            except Exception:
                st.metric("Stored Chunks", "N/A")

        st.divider()

        st.header("📄 Document Upload")
        uploaded_file = st.file_uploader("Upload Legal Document (PDF)", type=['pdf'],
                                         help="Upload contracts, legal documents, agreements, etc.")
        if uploaded_file:
            file_name = uploaded_file.name
            if file_name not in st.session_state.processed_files:
                with st.spinner(f"Processing {file_name}..."):
                    try:
                        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
                            tmp.write(uploaded_file.getvalue())
                            tmp_path = tmp.name

                        doc_data = extract_pdf_with_metadata(tmp_path)
                        st.info(f"📑 Pages: {doc_data['metadata']['num_pages']}")
                        st.info(f"📝 Characters: {len(doc_data['text']):,}")

                        if st.session_state.collection:
                            success = store_document_in_chromadb(file_name, doc_data, st.session_state.collection)
                            if success and not st.session_state.legal_team:
                                st.session_state.legal_team = initialize_legal_team()
                                st.success("✅ Document processed!")

                        os.unlink(tmp_path)
                    except Exception as e:
                        st.error(f"Error: {str(e)}")
            else:
                st.success(f"✅ {file_name} already loaded")

        st.divider()
        with st.expander("⚙️ Advanced Settings"):
            st.slider("Context Chunks to Retrieve", min_value=3, max_value=10, value=5, key="n_chunks")
            if st.button("🗑️ Clear Database"):
                if st.session_state.chroma_client:
                    try:
                        st.session_state.chroma_client.delete_collection(COLLECTION_NAME)
                    except Exception:
                        pass
                    st.session_state.collection = None
                    st.session_state.processed_files = {}
                    st.rerun()

    if not uploaded_file:
        st.info("👈 Please upload a legal document to begin")
        col1, col2, col3 = st.columns(3)
        with col1:
            st.markdown("### 🔍 Smart Analysis")
            st.markdown("Focused single-agent analysis for stability")
        with col2:
            st.markdown("### 🆓 100% Free")
            st.markdown("Local embeddings + ChromaDB")
        with col3:
            st.markdown("### 🚀 Enhanced RAG")
            st.markdown("Smart chunking & retrieval")
        return

    if not st.session_state.legal_team:
        st.warning("Model not initialized. Set your OpenRouter key.")
        return

    st.header("📋 Analysis Type")
    analysis_options = {
        "📑 Contract Review": "Comprehensive contract analysis including terms, obligations, and potential issues",
        "🔍 Legal Research": "Research relevant cases, statutes, and legal precedents",
        "⚠️ Risk Assessment": "Identify and evaluate legal risks and compliance issues",
        "✅ Compliance Check": "Review regulatory compliance and legal requirements",
        "💭 Custom Query": "Ask specific questions about the document"
    }
    analysis_type = st.selectbox("Select Analysis Type", list(analysis_options.keys()))
    st.info(analysis_options[analysis_type])

    if analysis_type == "💭 Custom Query":
        user_query = st.text_area("Your Question:", placeholder="e.g., What are the termination clauses in this contract?", height=100)
    else:
        user_query = None

    if st.button("🚀 Analyze Document", type="primary", use_container_width=True):
        if analysis_type == "💭 Custom Query" and not user_query:
            st.warning("Please enter a question")
            return

        with st.spinner("🤖 Analyzing document..."):
            try:
                query_templates = {
                    "📑 Contract Review": "Provide a comprehensive review of this contract. Analyze all key terms, obligations, rights, payment terms, termination clauses, and identify any concerning provisions.",
                    "🔍 Legal Research": "Research and identify relevant legal cases, statutes, regulations, and precedents that apply to this document. Provide citations and explain their relevance.",
                    "⚠️ Risk Assessment": "Conduct a thorough risk assessment of this document. Identify all potential legal risks, compliance issues, liabilities, and provide risk ratings and mitigation strategies.",
                    "✅ Compliance Check": "Review this document for compliance with applicable laws, regulations, and industry standards. Flag any compliance issues or gaps.",
                    "💭 Custom Query": user_query or ""
                }
                base_query = query_templates[analysis_type]

                context = retrieve_relevant_context(
                    base_query,
                    st.session_state.collection,
                    n_results=st.session_state.get('n_chunks', MAX_CONTEXT_CHUNKS)
                )

                enhanced_query = f"""Document Context:
{context}

Analysis Request:
{base_query}

Please provide a detailed, well-structured analysis based on the document content above.
Include specific references to relevant sections when applicable.
"""

                response = st.session_state.legal_team.run(enhanced_query)

                st.success("✅ Analysis Complete")
                tabs = st.tabs(["📄 Full Analysis", "🔑 Key Points", "💡 Recommendations"])

                with tabs[0]:
                    st.markdown("### Detailed Analysis")
                    if getattr(response, "content", None):
                        st.markdown(response.content)
                    else:
                        for msg in getattr(response, "messages", []):
                            if getattr(msg, "role", "") == "assistant" and getattr(msg, "content", ""):
                                st.markdown(msg.content)

                with tabs[1]:
                    st.markdown("### Key Points Summary")
                    summary_query = f"Based on this analysis:\n\n{getattr(response, 'content', '')}\n\nProvide a concise bullet-point summary of the most important findings."
                    summary_response = st.session_state.legal_team.run(summary_query)
                    if getattr(summary_response, "content", None):
                        st.markdown(summary_response.content)

                with tabs[2]:
                    st.markdown("### Action Items & Recommendations")
                    rec_query = f"Based on this analysis:\n\n{getattr(response, 'content', '')}\n\nProvide specific, actionable recommendations and next steps."
                    rec_response = st.session_state.legal_team.run(rec_query)
                    if getattr(rec_response, "content", None):
                        st.markdown(rec_response.content)

            except Exception as e:
                st.error(f"Analysis error: {str(e)}")
                st.exception(e)

if __name__ == "__main__":
    main()
