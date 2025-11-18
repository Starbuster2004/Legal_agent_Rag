# Legal RAG (Retrieval-Augmented Generation) — Hugging Face + Groq

This is a Legal RAG system with **separate user and admin interfaces** using **Hugging Face models** for embeddings and reranking (running locally) and **Groq** for final answer generation.

## 🚀 Quick Start

### Installation
```powershell
pip install -r requirements.txt
```

### Running the Application

#### Option A: Streamlit Only (Standalone)
```powershell
# Clear old database if upgrading
python clear_database.py

# Run Streamlit app
streamlit run app.py
```

#### Option B: FastAPI Backend + Streamlit Frontend
```powershell
# Start both servers with one command
.\start_all.ps1

# OR start individually:
.\start_backend.ps1   # FastAPI backend on port 8000
.\start_frontend.ps1  # Streamlit frontend on port 8501
```

### Access Points
- **Streamlit Home:** http://localhost:8501
- **💬 Chat Page:** http://localhost:8501/1_💬_Chat
- **🔐 Admin Panel:** http://localhost:8501/2_🔐_Admin (password: `admin123`)
- **FastAPI Backend:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## 📁 Project Structure

### Frontend (Streamlit)
```
app.py                           # Home page
pages/
├── 1_💬_Chat.py                # Public chat interface
└── 2_🔐_Admin.py               # Admin panel
```

### Backend (FastAPI) - NEW!
```
backend/
├── main.py                      # FastAPI application
├── auth.py                      # JWT authentication
├── schemas.py                   # Pydantic models
└── routes/
    ├── auth.py                  # Authentication endpoints
    ├── documents.py             # Document management
    └── chat.py                  # Chat/RAG endpoints
```

### Core Components
```
config.py                        # Configuration
db_store.py                      # ChromaDB operations
pipeline.py                      # RAG pipeline
embeddings.py                    # HuggingFace models
retriever.py                     # Retrieval & reranking
llm.py                          # Groq LLM integration
```

### Database Structure
- Each document gets its **own ChromaDB collection**
- Collections are named after sanitized filenames
- Easy to manage, delete, and track individual documents
- Queries search across **all collections** automatically

### Utilities
```
start_backend.ps1               # Start FastAPI server
start_frontend.ps1              # Start Streamlit UI
start_all.ps1                   # Start both servers
clear_database.py               # Reset database
postman_collection.json         # API testing collection
```

## ✨ Key Features

### User Interface (💬 Chat)
- ✅ **No login required** - Public access to chat
- ✅ **Conversational AI** - Maintains chat history
- ✅ **Multi-document search** - Searches all indexed documents
- ✅ **Source citations** - Shows which document the answer came from
- ✅ **Clean UI** - Styled chat bubbles with scroll

### Admin Interface (🔐 Admin)
- ✅ **Password protected** - Secure document management
- ✅ **Bulk upload** - Upload multiple PDFs at once
- ✅ **Automatic indexing** - No manual button clicks needed
- ✅ **Document deletion** - Remove documents from database
- ✅ **Statistics dashboard** - View system metrics

### ChromaDB Structure
- ✅ **Per-document collections** - Each PDF gets its own collection
- ✅ **Easy management** - Delete individual documents without affecting others
- ✅ **Source tracking** - Full metadata with filenames and chunk info
- ✅ **Cross-collection search** - RAG searches all documents automatically

## 🤗 Technology Stack

### Hugging Face Models (Local)
- **Embedding**: `sentence-transformers/all-MiniLM-L6-v2`
- **Reranking**: `cross-encoder/ms-marco-MiniLM-L-6-v2`
- **Privacy-focused** - All document processing happens locally

### Groq LLM (API)
- **Model**: Llama 3.3 70B Versatile
- **Ultra-fast inference** - 2048 token responses
- **Only used for final answers** - Not for retrieval/reranking

### ChromaDB
- **Vector database** - Persistent storage
- **Collection-per-document** - Better organization
- **Full metadata** - Track source files and chunks

### FastAPI Backend (NEW!)
- **RESTful API** - Standard HTTP endpoints
- **JWT Authentication** - Secure admin access
- **Swagger/OpenAPI** - Auto-generated documentation
- **CORS enabled** - Frontend-backend separation
- **Async operations** - Better performance

---

## 🔌 API Integration

The system now includes a **FastAPI backend** that can be used independently:

### API Features
✅ **Authentication:** JWT-based login system
✅ **Document Upload:** Single or bulk PDF upload
✅ **Document Management:** List and delete documents
✅ **Chat API:** Query documents via REST
✅ **Health Checks:** Monitor system status
✅ **OpenAPI Docs:** Interactive API documentation

### Example API Usage

#### 1. Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"admin123"}'
```

#### 2. Upload Document
```bash
curl -X POST http://localhost:8000/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@contract.pdf"
```

#### 3. Query Chat
```bash
curl -X POST http://localhost:8000/chat/query \
  -H "Content-Type: application/json" \
  -d '{"query":"What are the key terms?","top_k":5}'
```

### Documentation
- **Full API Docs:** See [BACKEND_API.md](BACKEND_API.md)
- **Postman Collection:** Import `postman_collection.json`
- **Interactive Docs:** http://localhost:8000/docs

## ⚙️ Configuration

### Environment Variables (Optional)
```powershell
$env:GROQ_API_KEY="your-groq-api-key"
$env:ADMIN_PASSWORD="your-secure-password"
$env:CHROMA_DIR="./chromadb_persist"
```

### Default Admin Password
**Default:** `admin123`
**Change in:** `config.py` or set `ADMIN_PASSWORD` environment variable

---

## 🗂️ Quick steps to run locally (Windows PowerShell):

1. Create & activate a virtual environment (you already created `.venv`):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies for the backend (from the `backend/requirements.txt`):

```powershell
pip install -r .\backend\requirements.txt
pip install streamlit requests
```

3. Start the FastAPI backend:

```powershell
# from repository root
uvicorn backend.app:app --host 0.0.0.0 --port 8000 --reload
```

4. Start the Streamlit test UI (in another terminal):

```powershell
streamlit run .\streamlit_test_ui.py
```

Configuration
- Use environment variables or edit `backend/config.py` defaults:
  - `OPENROUTER_API_KEY` — OpenRouter API key
  - `CHROMA_PERSIST_DIR` — ChromaDB persistent directory
  - `ADMIN_PASSWORD` — Admin password for the simple JWT flow

Notes & caveats
- This is an initial scaffold implementing the core RAG pipeline and an integration test UI.
- The LLM integration calls the OpenRouter-compatible `/chat/completions` endpoint. Set `OPENROUTER_API_KEY`.
- The admin authentication is intentionally simple (password -> signed token). For production, use a proper user store and TLS.

Next steps you can ask me to do:
- Harden input validation and error handling
- Add unit tests for document processing & vector store
- Improve query relevance classifier (LLM-based)
- Implement frontend React/Tailwind UI
