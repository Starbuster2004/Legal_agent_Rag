import streamlit as st
from config import cfg
from db_store import chroma_client, list_all_documents

st.set_page_config(
    page_title="Legal RAG System",
    page_icon="⚖️",
    layout="wide"
)

def init_state():
    if 'client' not in st.session_state:
        st.session_state.client = chroma_client()

def main():
    st.title('⚖️ Legal RAG System')
    st.markdown('### AI-Powered Legal Document Analysis')
    
    init_state()
    
    # Welcome section
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("""
        ## 💬 Chat Interface
        
        Ask questions about indexed legal documents using our intelligent RAG system.
        
        **Features:**
        - 🤖 Conversational AI chatbot
        - 📚 Search across all documents
        - 🔍 Accurate source citations
        - ⚡ Fast responses with Groq
        
        👉 **[Go to Chat →](./1_💬_Chat)**
        """)
    
    with col2:
        st.markdown("""
        ## 🔐 Admin Panel
        
        Manage your document database with full control.
        
        **Features:**
        - 📤 Upload multiple PDFs
        - 🗂️ Automatic indexing
        - 📊 View statistics
        - 🗑️ Delete documents
        
        👉 **[Go to Admin Panel →](./2_🔐_Admin)**
        """)
    
    st.markdown('---')
    
    # Statistics
    st.header('📊 System Overview')
    try:
        docs = list_all_documents(st.session_state.client)
        total_chunks = sum(doc['chunk_count'] for doc in docs) if docs else 0
        
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric('📚 Indexed Documents', len(docs))
        with col2:
            st.metric('🧩 Total Chunks', total_chunks)
        with col3:
            st.metric('🤗 Embedding Model', cfg.HUGGINGFACE_EMBED_MODEL.split('/')[-1])
    except Exception as e:
        st.error(f'Error loading statistics: {str(e)}')
    
    # Technology stack
    st.markdown('---')
    st.header('🛠️ Technology Stack')
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown("""
        **🤗 Hugging Face**
        - Embeddings: Local models
        - Reranking: Cross-encoder
        - Privacy-focused
        """)
    with col2:
        st.markdown("""
        **⚡ Groq**
        - LLM: Llama 3.3 70B
        - Ultra-fast inference
        - High quality answers
        """)
    with col3:
        st.markdown("""
        **💾 ChromaDB**
        - Vector database
        - Persistent storage
        - Per-document collections
        """)

if __name__ == '__main__':
    main()
