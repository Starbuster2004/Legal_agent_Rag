from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class LoginRequest(BaseModel):
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    query: str
    chat_history: Optional[List[ChatMessage]] = []
    top_k: Optional[int] = 5

class ChatResponse(BaseModel):
    answer: str
    sources: Optional[List[Dict[str, Any]]] = []

class DocumentInfo(BaseModel):
    collection_name: str
    display_name: str
    chunk_count: int

class DocumentListResponse(BaseModel):
    documents: List[DocumentInfo]
    total: int

class DeleteResponse(BaseModel):
    success: bool
    message: str

class UploadResponse(BaseModel):
    success: bool
    filename: str
    message: str
    chunk_count: Optional[int] = 0

class SystemStats(BaseModel):
    total_documents: int
    total_chunks: int
    embedding_model: str
    rerank_model: str
    llm_model: str
