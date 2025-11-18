# FastAPI Backend for Legal RAG System

## 🚀 Quick Start

### Option 1: Using PowerShell Scripts (Recommended)
```powershell
# Install dependencies first
pip install -r requirements.txt

# Start backend only
.\start_backend.ps1

# OR start both backend and frontend
.\start_all.ps1
```

### Option 2: Manual Start
```powershell
# 1. Install Dependencies
pip install -r requirements.txt

# 2. Start the FastAPI Backend
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# 3. Start Streamlit Frontend (optional, in new terminal)
streamlit run app.py
```

### Option 3: Direct Python Module
```powershell
cd "c:\Legal Agent"
python -m backend.main
```

## 📡 API Endpoints

### Base URL
```
http://localhost:8000
```

### Documentation
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 🔐 Authentication Endpoints

### POST /auth/login
Login and get JWT token

**Request:**
```json
{
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### GET /auth/verify
Verify token validity

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "valid": true,
  "user": "admin",
  "role": "admin"
}
```

---

## 📄 Document Management Endpoints

### GET /documents/list
Get all indexed documents (Public - no auth)

**Response:**
```json
{
  "documents": [
    {
      "collection_name": "contract_2024",
      "display_name": "contract_2024.pdf",
      "chunk_count": 45
    }
  ],
  "total": 1
}
```

### POST /documents/upload
Upload and index a single PDF (Requires auth)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: PDF file

**Response:**
```json
{
  "success": true,
  "filename": "contract.pdf",
  "message": "Successfully indexed contract.pdf",
  "chunk_count": 45
}
```

### POST /documents/upload-multiple
Upload multiple PDFs (Requires auth)

**Response:**
```json
{
  "total_files": 3,
  "successful": 3,
  "failed": 0,
  "results": [...],
  "errors": []
}
```

### DELETE /documents/{collection_name}
Delete a document (Requires auth)

**Response:**
```json
{
  "success": true,
  "message": "Document contract_2024 deleted successfully"
}
```

### GET /documents/stats
Get system statistics

**Response:**
```json
{
  "total_documents": 5,
  "total_chunks": 234,
  "average_chunks": 46
}
```

---

## 💬 Chat Endpoints

### POST /chat/query
Query the RAG system

**Request:**
```json
{
  "query": "What are the key terms?",
  "chat_history": [
    {"role": "user", "content": "Previous question"},
    {"role": "assistant", "content": "Previous answer"}
  ],
  "top_k": 5
}
```

**Response:**
```json
{
  "answer": "Based on the documents, the key terms are...",
  "sources": []
}
```

### POST /chat/
Alternative endpoint (same as /chat/query)

---

## 🏥 Health Check Endpoints

### GET /
Basic health check

**Response:**
```json
{
  "status": "online",
  "service": "Legal RAG API",
  "version": "1.0.0"
}
```

### GET /health
Detailed health check

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "documents_count": 5,
  "api_configured": true
}
```

---

## 🔒 Authentication Flow

1. **Login:**
   ```bash
   curl -X POST http://localhost:8000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"password":"admin123"}'
   ```

2. **Get Token:**
   ```json
   {
     "access_token": "eyJhbG...",
     "token_type": "bearer"
   }
   ```

3. **Use Token:**
   ```bash
   curl -X POST http://localhost:8000/documents/upload \
     -H "Authorization: Bearer eyJhbG..." \
     -F "file=@contract.pdf"
   ```

---

## 📁 Project Structure

```
backend/
├── main.py              # FastAPI application
├── auth.py              # JWT authentication
├── schemas.py           # Pydantic models
└── routes/
    ├── auth.py          # Auth endpoints
    ├── documents.py     # Document management
    └── chat.py          # Chat endpoints
```

---

## 🛠️ Configuration

### Environment Variables
```powershell
$env:GROQ_API_KEY="your-groq-key"
$env:ADMIN_PASSWORD="your-password"
$env:CHROMA_DIR="./chromadb_persist"
```

### Default Values (in config.py)
- `ADMIN_PASSWORD`: "admin123"
- `CHROMA_DIR`: "./chromadb_persist"
- `LLM_MODEL`: "llama-3.3-70b-versatile"

---

## 🧪 Testing with cURL

### Upload Document
```bash
curl -X POST "http://localhost:8000/documents/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@contract.pdf"
```

### Query Chat
```bash
curl -X POST "http://localhost:8000/chat/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the payment terms?",
    "top_k": 5
  }'
```

### List Documents
```bash
curl -X GET "http://localhost:8000/documents/list"
```

---

## 🚀 Production Deployment

### Using Uvicorn
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Using Docker
```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 📊 Features

✅ JWT Authentication
✅ Multi-document RAG
✅ Automatic indexing
✅ Document management
✅ Conversational chat
✅ CORS enabled
✅ Swagger documentation
✅ Health checks
✅ Error handling

---

## 🔧 Troubleshooting

### Port already in use
```powershell
# Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Import errors
```powershell
# Ensure you're in the correct directory
cd "c:\Legal Agent"
python -m uvicorn backend.main:app --reload
```

### CORS issues
The API allows all origins by default. For production, update in `backend/main.py`:
```python
allow_origins=["http://localhost:8501"]  # Specific origins
```
