from fastapi import APIRouter, HTTPException
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.schemas import ChatRequest, ChatResponse, ChatMessage
from db_store import chroma_client
from pipeline import run_rag

router = APIRouter(prefix="/chat", tags=["Chat"])

# Initialize client
client = chroma_client()

@router.post("/query", response_model=ChatResponse)
async def chat_query(request: ChatRequest):
    """
    Query the RAG system with a question
    Searches across all indexed documents
    Public endpoint - no auth required
    """
    try:
        # Convert chat history to expected format
        chat_history = [
            {"role": msg.role, "content": msg.content}
            for msg in request.chat_history
        ] if request.chat_history else []
        
        # Run RAG
        answer = run_rag(
            query=request.query,
            client=client,
            top_k=request.top_k,
            chat_history=chat_history
        )
        
        return ChatResponse(
            answer=answer,
            sources=[]  # Can be enhanced to return actual sources
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@router.post("/")
async def chat(request: ChatRequest):
    """
    Alternative chat endpoint (same as /query)
    """
    return await chat_query(request)

@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """
    Streaming chat endpoint for faster perceived response time
    """
    from fastapi.responses import StreamingResponse
    import json
    
    async def generate():
        try:
            # Convert chat history to expected format
            chat_history = [
                {"role": msg.role, "content": msg.content}
                for msg in request.chat_history
            ] if request.chat_history else []
            
            # Run RAG (this still takes time but we can stream the result)
            answer = run_rag(
                query=request.query,
                client=client,
                top_k=request.top_k,
                chat_history=chat_history
            )
            
            # Stream the answer word by word for better UX
            words = answer.split()
            for i, word in enumerate(words):
                chunk = word + (" " if i < len(words) - 1 else "")
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
            
            # Send done signal
            yield f"data: {json.dumps({'done': True})}\n\n"
            
        except Exception as e:
            error_msg = f"Error processing query: {str(e)}"
            yield f"data: {json.dumps({'error': error_msg})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

