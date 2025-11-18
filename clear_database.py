# Script to clear old ChromaDB database
import shutil
import os

db_path = "./chromadb_persist"

if os.path.exists(db_path):
    print(f"🗑️ Removing old database at: {db_path}")
    shutil.rmtree(db_path)
    print("✅ Old database removed successfully!")
    print("📁 New database will be created automatically when you upload documents.")
else:
    print(f"ℹ️ No existing database found at: {db_path}")
    print("📁 Database will be created automatically when you upload documents.")
