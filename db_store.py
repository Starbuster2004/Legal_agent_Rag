import chromadb
from typing import List, Dict, Any
from config import cfg
import re

def chroma_client(path: str = None):
    path = path or cfg.CHROMA_DIR
    return chromadb.PersistentClient(path=path)

def sanitize_collection_name(filename: str) -> str:
    """Convert filename to valid collection name (alphanumeric, underscore, hyphen only)"""
    # Remove extension and sanitize
    name = filename.rsplit('.', 1)[0]
    name = re.sub(r'[^a-zA-Z0-9_-]', '_', name)
    # Ensure it starts with alphanumeric
    if name and not name[0].isalnum():
        name = 'doc_' + name
    return name[:63]  # ChromaDB has 63 char limit

def get_or_create_collection(client, filename: str):
    """Get or create a collection for a specific document"""
    collection_name = sanitize_collection_name(filename)
    try:
        return client.get_collection(collection_name)
    except Exception:
        return client.create_collection(collection_name)

def list_all_documents(client) -> List[Dict[str, Any]]:
    """List all indexed documents (collections)"""
    collections = client.list_collections()
    documents = []
    for col in collections:
        try:
            data = col.get(limit=1)
            if data and data.get('metadatas') and len(data['metadatas']) > 0:
                source_file = data['metadatas'][0].get('source_file', col.name)
            else:
                source_file = col.name
            
            count = col.count()
            documents.append({
                'collection_name': col.name,
                'display_name': source_file,
                'chunk_count': count
            })
        except Exception:
            continue
    return documents

def delete_document(client, collection_name: str) -> bool:
    """Delete a document collection"""
    try:
        client.delete_collection(collection_name)
        return True
    except Exception as e:
        print(f"Error deleting collection {collection_name}: {e}")
        return False

def add_documents(collection, docs: List[str], ids: List[str], embeddings: List[List[float]], filename: str = None):
    metas = [{'chunk_id': i, 'source_file': filename or 'unknown', 'chunk_index': idx} for idx, i in enumerate(ids)]
    collection.add(documents=docs, metadatas=metas, ids=ids, embeddings=embeddings)

def query_collection(collection, query_emb, k=5):
    res = collection.query(query_embeddings=[query_emb], n_results=k, include=['documents','metadatas','distances'])
    docs = res['documents'][0]; metas = res['metadatas'][0]; dists = res['distances'][0]
    return [{'text':d,'meta':m,'score':float(s)} for d,m,s in zip(docs,metas,dists)]

def query_all_collections(client, query_emb, k=5) -> List[Dict[str, Any]]:
    """Query across all document collections"""
    all_results = []
    collections = client.list_collections()
    
    for col in collections:
        try:
            results = query_collection(col, query_emb, k=k)
            all_results.extend(results)
        except Exception:
            continue
    
    # Sort by score and return top k
    all_results.sort(key=lambda x: x['score'])
    return all_results[:k]
