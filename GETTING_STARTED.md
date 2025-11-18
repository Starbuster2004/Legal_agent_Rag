# 🚀 Getting Started with Legal RAG System

## Choose Your Deployment Mode

### 🎯 Mode 1: Streamlit Only (Simplest)
**Best for:** Quick demos, local use, single-user scenarios

**Start:**
```powershell
pip install -r requirements.txt
streamlit run app.py
```

**Access:** http://localhost:8501

---

### 🎯 Mode 2: FastAPI + Streamlit (Production Ready)
**Best for:** Multiple clients, mobile apps, scalable deployments

**Start:**
```powershell
pip install -r requirements.txt
.\start_all.ps1
```

**Access:**
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Streamlit UI: http://localhost:8501

---

## 📋 Prerequisites

- Python 3.9 or higher
- Windows PowerShell
- Groq API key (get from https://console.groq.com)
- 4GB+ RAM recommended
- Internet connection for initial model downloads

---

## 🔧 Installation Steps

### 1. Clone or Download
```powershell
cd "c:\Legal Agent"
```

### 2. Create Virtual Environment (Recommended)
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 3. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 4. Configure Environment
```powershell
# Option A: Set environment variables
$env:GROQ_API_KEY="your-groq-api-key"
$env:ADMIN_PASSWORD="your-secure-password"

# Option B: Edit config.py directly
# Open config.py and update the values
```

### 5. First Run
```powershell
# Clear any old database
python clear_database.py

# Start the application
streamlit run app.py
```

---

## 📖 User Guide

### For End Users (Chat Interface)

1. **Access the Chat Page**
   - Navigate to http://localhost:8501
   - Click on "💬 Chat" in the sidebar

2. **Ask Questions**
   - Type your question in the input box
   - Click "Send" or press Enter
   - View the AI-generated answer

3. **Continue Conversation**
   - Ask follow-up questions
   - The system remembers context
   - Use "Clear Chat" to start fresh

### For Administrators (Document Management)

1. **Access Admin Panel**
   - Click on "🔐 Admin" in the sidebar
   - Enter password (default: `admin123`)

2. **Upload Documents**
   - Click "Browse files"
   - Select one or more PDFs
   - Click "Index All Documents"
   - Wait for automatic indexing

3. **Manage Documents**
   - View list of indexed documents
   - See chunk counts and stats
   - Delete documents if needed

---

## 🔌 API Usage (Mode 2)

### Step 1: Get Authentication Token
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"admin123"}'
```

Response:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### Step 2: Upload Document
```bash
curl -X POST http://localhost:8000/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@contract.pdf"
```

### Step 3: Query Documents
```bash
curl -X POST http://localhost:8000/chat/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the payment terms?",
    "top_k": 5
  }'
```

---

## 🏃 Quick Start Cheat Sheet

### Streamlit Only
```powershell
streamlit run app.py
```

### Backend Only
```powershell
.\start_backend.ps1
# OR
python -m uvicorn backend.main:app --reload
```

### Both Servers
```powershell
.\start_all.ps1
```

### Stop Servers
- Press `Ctrl+C` in terminal
- Or close PowerShell windows

---

## 🗂️ First Time Setup Checklist

- [ ] Python 3.9+ installed
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Groq API key obtained
- [ ] Environment variables set or config.py updated
- [ ] Old database cleared (if upgrading)
- [ ] Application started successfully
- [ ] Can access home page
- [ ] Admin password works
- [ ] Can upload and index a test PDF
- [ ] Can query documents via chat

---

## 🎥 Workflow Example

### Scenario: Analyzing Legal Contracts

1. **Admin uploads contracts**
   ```
   Admin Panel → Upload Files → Select multiple PDFs → Index All
   ```

2. **System processes documents**
   ```
   - Extracts text from PDFs
   - Creates chunks with overlap
   - Generates embeddings (local HF model)
   - Stores in ChromaDB collections
   ```

3. **Users ask questions**
   ```
   Chat → "What are the liability clauses?" → Get Answer
   ```

4. **System provides answers**
   ```
   - Retrieves relevant chunks across all documents
   - Reranks using cross-encoder
   - Generates answer using Groq LLM
   - Cites sources
   ```

---

## 🐛 Troubleshooting

### Issue: Port already in use
```powershell
# Find process using port
netstat -ano | findstr :8000
# Kill it
taskkill /PID <PID> /F
```

### Issue: Module not found
```powershell
# Make sure you're in the right directory
cd "c:\Legal Agent"
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Issue: Groq API errors
- Check API key is correct
- Verify internet connection
- Confirm API key has credits/access

### Issue: ChromaDB errors
```powershell
# Clear and recreate database
python clear_database.py
```

### Issue: Out of memory
- Process smaller documents
- Reduce chunk size in pipeline.py
- Close other applications

---

## 📞 Getting Help

### Resources
1. **Documentation**
   - [README.md](README.md) - Overview
   - [BACKEND_API.md](BACKEND_API.md) - API reference
   - [MIGRATION.md](MIGRATION.md) - Upgrade guide
   - [FASTAPI_COMPLETE.md](FASTAPI_COMPLETE.md) - Backend details

2. **Interactive Docs**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

3. **Testing Tools**
   - Postman collection: `postman_collection.json`

### Common Questions

**Q: Can I use without Groq API?**
A: No, Groq API is required for LLM responses. Get free key at https://console.groq.com

**Q: Can I process Word documents?**
A: Currently only PDFs. Can be extended to support DOCX.

**Q: How many documents can I index?**
A: Limited by disk space. Each document gets its own collection.

**Q: Is data stored securely?**
A: All processing is local. Only LLM requests go to Groq API.

**Q: Can multiple users access simultaneously?**
A: Yes with FastAPI backend. Streamlit-only mode is single-session.

---

## 🎓 Next Steps

1. **Upload Your Documents**
   - Gather PDF files
   - Use admin panel to upload
   - Wait for indexing

2. **Test Queries**
   - Try different question types
   - Check source citations
   - Verify accuracy

3. **Customize**
   - Adjust models in config.py
   - Modify prompts in pipeline.py
   - Change UI in pages/

4. **Integrate**
   - Build mobile app using API
   - Create custom frontend
   - Integrate with existing systems

5. **Deploy**
   - Set up on server
   - Configure production settings
   - Add monitoring

---

## 🎉 You're Ready!

The Legal RAG system is now set up and ready to use. Start uploading documents and asking questions!

**Happy Analyzing! ⚖️🤖**
