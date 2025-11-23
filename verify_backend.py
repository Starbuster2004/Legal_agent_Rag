import sys
import os

print("Checking Python environment...")
print(f"Python version: {sys.version}")

try:
    import sentence_transformers
    print("✅ sentence-transformers is installed")
except ImportError:
    print("❌ sentence-transformers is NOT installed")

try:
    import chromadb
    print("✅ chromadb is installed")
except ImportError:
    print("❌ chromadb is NOT installed")

try:
    import fastapi
    print("✅ fastapi is installed")
except ImportError:
    print("❌ fastapi is NOT installed")

print("\nChecking Config...")
try:
    from config import cfg
    print(f"OPENROUTER_API_KEY present: {bool(cfg.OPENROUTER_API_KEY)}")
    if cfg.OPENROUTER_API_KEY:
        print(f"OPENROUTER_API_KEY length: {len(cfg.OPENROUTER_API_KEY)}")
        print(f"OPENROUTER_API_KEY prefix: {cfg.OPENROUTER_API_KEY[:4]}...")
except Exception as e:
    print(f"❌ Error loading config: {e}")

print("\nChecking Embeddings Model (this might download the model)...")
try:
    from embeddings import embed_texts
    print("Loading model...")
    embs = embed_texts(["test"])
    print(f"✅ Model loaded and embedding generated. Shape: {len(embs)}x{len(embs[0])}")
except Exception as e:
    print(f"❌ Error loading embeddings model: {e}")
