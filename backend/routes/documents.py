from fastapi import APIRouter, HTTPException, UploadFile, File, Header, Depends
from typing import List, Optional
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.schemas import DocumentInfo, DocumentListResponse, DeleteResponse, UploadResponse
from backend.auth import verify_token
from db_store import chroma_client, list_all_documents, delete_document
from pipeline import index_file_bytes

router = APIRouter(prefix="/documents", tags=["Documents"])

# Initialize client
client = chroma_client()

def require_auth(authorization: Optional[str] = Header(None)):
    """Dependency to require authentication"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization required")
    
    token = authorization.replace("Bearer ", "")
    return verify_token(token)

@router.get("/list", response_model=DocumentListResponse)
async def list_documents():
    """
    Get list of all indexed documents
    Public endpoint - no auth required
    """
    try:
        docs = list_all_documents(client)
        doc_list = [
            DocumentInfo(
                collection_name=doc['collection_name'],
                display_name=doc['display_name'],
                chunk_count=doc['chunk_count']
            )
            for doc in docs
        ]
        
        return DocumentListResponse(
            documents=doc_list,
            total=len(doc_list)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing documents: {str(e)}")

@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    user: dict = Depends(require_auth)
):
    """
    Upload and index a PDF document
    Requires admin authentication
    """
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        # Read file bytes
        file_bytes = await file.read()
        
        # Index the document
        collection = index_file_bytes(file_bytes, file.filename)
        chunk_count = collection.count()
        
        return UploadResponse(
            success=True,
            filename=file.filename,
            message=f"Successfully indexed {file.filename}",
            chunk_count=chunk_count
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error indexing document: {str(e)}")

@router.post("/upload-multiple")
async def upload_multiple_documents(
    files: List[UploadFile] = File(...),
    user: dict = Depends(require_auth)
):
    """
    Upload and index multiple PDF documents
    Requires admin authentication
    """
    results = []
    errors = []
    
    for file in files:
        if not file.filename.endswith('.pdf'):
            errors.append({"filename": file.filename, "error": "Not a PDF file"})
            continue
        
        try:
            file_bytes = await file.read()
            collection = index_file_bytes(file_bytes, file.filename)
            chunk_count = collection.count()
            
            results.append({
                "success": True,
                "filename": file.filename,
                "chunk_count": chunk_count
            })
        except Exception as e:
            errors.append({"filename": file.filename, "error": str(e)})
    
    return {
        "total_files": len(files),
        "successful": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors
    }

@router.delete("/{collection_name}", response_model=DeleteResponse)
async def delete_doc(
    collection_name: str,
    user: dict = Depends(require_auth)
):
    """
    Delete a document from the database
    Requires admin authentication
    """
    try:
        success = delete_document(client, collection_name)
        
        if success:
            return DeleteResponse(
                success=True,
                message=f"Document {collection_name} deleted successfully"
            )
        else:
            raise HTTPException(status_code=404, detail="Document not found or could not be deleted")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}")

@router.get("/stats")
async def get_stats():
    """Get system statistics"""
    try:
        docs = list_all_documents(client)
        total_chunks = sum(doc['chunk_count'] for doc in docs)
        
        return {
            "total_documents": len(docs),
            "total_chunks": total_chunks,
            "average_chunks": total_chunks // len(docs) if docs else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting stats: {str(e)}")
