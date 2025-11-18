import streamlit as st
from config import cfg
from pipeline import index_file_bytes
from db_store import chroma_client, list_all_documents, delete_document
import time

st.set_page_config(page_title="Admin Panel", page_icon="🔐", layout="wide")

def check_password():
    """Returns True if the user has entered the correct password."""
    def password_entered():
        if st.session_state["password"] == cfg.ADMIN_PASSWORD:
            st.session_state["password_correct"] = True
            del st.session_state["password"]
        else:
            st.session_state["password_correct"] = False

    if "password_correct" not in st.session_state:
        # First run, show input for password
        st.text_input("Password", type="password", on_change=password_entered, key="password")
        return False
    elif not st.session_state["password_correct"]:
        # Password incorrect, show input + error
        st.text_input("Password", type="password", on_change=password_entered, key="password")
        st.error("😕 Password incorrect")
        return False
    else:
        # Password correct
        return True

def init_state():
    if 'client' not in st.session_state:
        st.session_state.client = chroma_client()

def main():
    st.title('🔐 Admin Panel - Document Management')
    
    if not check_password():
        st.info('Please enter the admin password to access this panel.')
        return
    
    init_state()
    
    # Sidebar with admin info
    st.sidebar.success('✅ Logged in as Admin')
    if st.sidebar.button('🚪 Logout'):
        st.session_state["password_correct"] = False
        st.rerun()
    
    st.sidebar.markdown('---')
    st.sidebar.info(f'**Storage:** {cfg.CHROMA_DIR}')
    
    # Two column layout
    col1, col2 = st.columns([1, 1])
    
    # Upload section
    with col1:
        st.header('📤 Upload & Index Documents')
        uploaded_files = st.file_uploader(
            'Upload PDF documents',
            type=['pdf'],
            accept_multiple_files=True,
            help='Select one or more PDF files to index'
        )
        
        if uploaded_files:
            st.info(f'📁 {len(uploaded_files)} file(s) selected')
            
            if st.button('🚀 Index All Documents', type='primary', use_container_width=True):
                progress_bar = st.progress(0)
                status_text = st.empty()
                
                for idx, file in enumerate(uploaded_files):
                    status_text.text(f'Processing: {file.name}...')
                    try:
                        file_bytes = file.getvalue()
                        index_file_bytes(file_bytes, file.name)
                        st.success(f'✅ Indexed: {file.name}')
                        time.sleep(0.5)
                    except Exception as e:
                        st.error(f'❌ Error indexing {file.name}: {str(e)}')
                    
                    progress_bar.progress((idx + 1) / len(uploaded_files))
                
                status_text.text('✅ All documents processed!')
                time.sleep(1)
                st.rerun()
    
    # Document management section
    with col2:
        st.header('📚 Indexed Documents')
        
        try:
            docs = list_all_documents(st.session_state.client)
            
            if not docs:
                st.info('No documents indexed yet. Upload some documents to get started!')
            else:
                st.success(f'**Total Documents:** {len(docs)}')
                
                for doc in docs:
                    with st.expander(f"📄 {doc['display_name']}", expanded=False):
                        st.write(f"**Collection Name:** `{doc['collection_name']}`")
                        st.write(f"**Chunks:** {doc['chunk_count']}")
                        
                        if st.button(f"🗑️ Delete", key=f"del_{doc['collection_name']}", type='secondary'):
                            if delete_document(st.session_state.client, doc['collection_name']):
                                st.success(f'✅ Deleted: {doc["display_name"]}')
                                time.sleep(1)
                                st.rerun()
                            else:
                                st.error('❌ Failed to delete document')
        
        except Exception as e:
            st.error(f'Error loading documents: {str(e)}')
    
    # Statistics section
    st.markdown('---')
    st.header('📊 Statistics')
    try:
        docs = list_all_documents(st.session_state.client)
        total_chunks = sum(doc['chunk_count'] for doc in docs)
        
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric('Total Documents', len(docs))
        with col2:
            st.metric('Total Chunks', total_chunks)
        with col3:
            avg_chunks = total_chunks // len(docs) if docs else 0
            st.metric('Avg Chunks/Doc', avg_chunks)
    except Exception as e:
        st.error(f'Error loading statistics: {str(e)}')

if __name__ == '__main__':
    main()
