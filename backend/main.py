from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sys
import os

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import cfg
from db_store import chroma_client, list_all_documents

# Import routers
from backend.routes import auth, documents, chat

# Initialize FastAPI app
app = FastAPI(
    title="Legal RAG API",
    description="AI-Powered Legal Document Analysis System with Hugging Face + Groq",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(chat.router)

# Initialize ChromaDB client
client = chroma_client()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Legal RAG API",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        docs = list_all_documents(client)
        return {
            "status": "healthy",
            "database": "connected",
            "documents_count": len(docs),
            "api_configured": bool(cfg.GROQ_API_KEY)
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "error": str(e)}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
