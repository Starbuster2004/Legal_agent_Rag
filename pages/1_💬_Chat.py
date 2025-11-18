import streamlit as st
from config import cfg
from pipeline import run_rag
from db_store import chroma_client, list_all_documents

st.set_page_config(page_title="Legal RAG Chat", page_icon="💬", layout="wide")

def init_state():
    if 'client' not in st.session_state:
        st.session_state.client = chroma_client()
    if 'chat_history' not in st.session_state:
        st.session_state.chat_history = []

def sidebar_info():
    st.sidebar.header('🤗 AI Models')
    st.sidebar.info(f'Embedding: {cfg.HUGGINGFACE_EMBED_MODEL.split("/")[-1]}')
    st.sidebar.info(f'Reranking: {cfg.RERANK_MODEL.split("/")[-1]}')
    st.sidebar.caption('💡 Local HF models for retrieval\n⚡ Groq LLM for answers')
    
    # Show available documents
    st.sidebar.header('📚 Available Documents')
    try:
        docs = list_all_documents(st.session_state.client)
        if docs:
            st.sidebar.write(f"**Total Documents:** {len(docs)}")
            for doc in docs:
                st.sidebar.text(f"📄 {doc['display_name']}")
                st.sidebar.caption(f"   {doc['chunk_count']} chunks")
        else:
            st.sidebar.warning('No documents indexed yet')
            st.sidebar.caption('Contact admin to upload documents')
    except Exception as e:
        st.sidebar.error(f'Error loading documents: {str(e)}')

def main():
    st.title('💬 Legal Document Chat')
    st.caption('Ask questions about your legal documents')
    
    init_state()
    sidebar_info()
    
    # Check if API key is set
    if not cfg.GROQ_API_KEY:
        st.error('⚠️ GROQ_API_KEY not configured. Please contact administrator.')
        return
    
    # Check if documents exist
    docs = list_all_documents(st.session_state.client)
    if not docs:
        st.warning('📭 No documents available yet. Please contact your administrator to upload documents.')
        return
    
    # Chat interface
    st.markdown('---')
    
    # Display chat history
    chat_container = st.container(height=400)
    with chat_container:
        if not st.session_state.chat_history:
            st.info('👋 Welcome! Ask me anything about the indexed legal documents.')
        else:
            for msg in st.session_state.chat_history:
                if msg['role'] == 'user':
                    st.markdown(f"""
                    <div style="background-color: #e3f2fd; padding: 10px; border-radius: 10px; margin: 5px 0;">
                        <b>🧑 You:</b><br>{msg['content']}
                    </div>
                    """, unsafe_allow_html=True)
                else:
                    st.markdown(f"""
                    <div style="background-color: #f5f5f5; padding: 10px; border-radius: 10px; margin: 5px 0;">
                        <b>🤖 Assistant:</b><br>{msg['content']}
                    </div>
                    """, unsafe_allow_html=True)
    
    # Chat input
    with st.form(key='chat_form', clear_on_submit=True):
        user_input = st.text_input('Your question:', placeholder='e.g., What are the main clauses in the contract?', key='user_input')
        col1, col2 = st.columns([1, 5])
        with col1:
            submit = st.form_submit_button('🔍 Send', use_container_width=True)
        with col2:
            clear = st.form_submit_button('🗑️ Clear Chat', use_container_width=True)
    
    if clear:
        st.session_state.chat_history = []
        st.rerun()
    
    if submit and user_input:
        st.session_state.chat_history.append({'role': 'user', 'content': user_input})
        
        with st.spinner('🤔 Thinking...'):
            answer = run_rag(user_input, st.session_state.client, chat_history=st.session_state.chat_history)
            st.session_state.chat_history.append({'role': 'assistant', 'content': answer})
        
        st.rerun()

if __name__ == '__main__':
    main()
