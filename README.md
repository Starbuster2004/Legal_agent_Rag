# Legal RAG Agent ⚖️

A powerful **Retrieval-Augmented Generation (RAG)** system designed for legal document analysis. This application combines a **FastAPI** backend with a modern **React** frontend to provide an intelligent assistant capable of answering questions based on uploaded legal PDF documents.

![Legal RAG Screenshot](https://via.placeholder.com/800x400?text=Legal+RAG+Dashboard)

## 🚀 Key Features

*   **📄 Document Analysis**: Upload and index PDF legal documents automatically.
*   **💬 Intelligent Chat**: Ask questions about your documents using advanced LLMs via OpenRouter.
*   **🔍 RAG Pipeline**: Uses local Hugging Face embeddings and ChromaDB for accurate retrieval.
*   **⚡ Fast Responses**: Optimized pipeline with streaming support (optional) and efficient retrieval.
*   **🎨 Modern UI**: Sleek React-based interface with Dark Mode support.
*   **🔐 Admin & Security**: Basic authentication for document management.

## 🛠️ Tech Stack

### Backend
*   **Framework**: FastAPI (Python)
*   **Vector DB**: ChromaDB (Persistent storage)
*   **Embeddings**: `sentence-transformers/all-MiniLM-L6-v2` (Local)
*   **LLM Integration**: OpenRouter API (Access to Gemma, Llama, etc.)
*   **PDF Processing**: `pypdf`

### Frontend
*   **Framework**: React (Vite)
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **HTTP Client**: Axios

## 📋 Prerequisites

*   **Python** 3.10+
*   **Node.js** 16+
*   **OpenRouter API Key** (Get one at [openrouter.ai](https://openrouter.ai))

## 📦 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/legal-rag-agent.git
cd legal-rag-agent
```

### 2. Backend Setup
```bash
# Navigate to root directory
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.\.venv\Scripts\Activate.ps1
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

## ⚙️ Configuration

1.  Copy `.env.example` to `.env` (or set environment variables directly):
    ```bash
    cp .env.example .env
    ```
2.  Edit `.env` and add your **OpenRouter API Key**:
    ```ini
    OPENROUTER_API_KEY=sk-or-v1-your-key-here
    ```
3.  (Optional) Adjust other settings like `LLM_MODEL` or `ADMIN_PASSWORD`.

> **⚠️ Security Note:** Never commit your `.env` file or hardcode API keys in `config.py` if you plan to push to a public repository.

## 🏃‍♂️ Running the Application

### Start Backend
Open a terminal in the root directory:
```bash
# Windows
.\start_backend.ps1

# Or manually:
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend
Open a new terminal in the `frontend` directory:
```bash
npm run dev
```

*   **Frontend**: http://localhost:3000
*   **Backend API Docs**: http://localhost:8000/docs

## 📖 Usage Guide

1.  **Upload Documents**: Go to the chat interface or use the API to upload PDF documents (e.g., Case files, Acts).
2.  **Ask Questions**: Use the chat interface to ask questions like "What are the key points in the contract?" or "Explain the liability clause."
3.  **View Sources**: The AI will provide answers with citations linking back to the source documents.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
