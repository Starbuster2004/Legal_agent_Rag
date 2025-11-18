# 🔄 Migration Guide - Old to New Structure

## What Changed?

### Old Structure ❌
- Single shared collection for all documents
- Manual indexing button required
- Upload in main UI
- Mixed user/admin functions

### New Structure ✅
- **Separate collection per document**
- **Automatic indexing** on upload
- **Separate pages:**
  - Home: System overview
  - Chat: Public interface (no auth)
  - Admin: Document management (password protected)

## Migration Steps

### 1. Clear Old Database
```powershell
python clear_database.py
```

This will delete the old `chromadb_persist` directory. Don't worry - it will be recreated with the new structure.

### 2. Re-upload Your Documents
1. Run the app: `streamlit run app.py`
2. Navigate to **🔐 Admin** page
3. Enter password (default: `admin123`)
4. Upload all your PDFs (supports multiple files)
5. Click "🚀 Index All Documents"
6. Documents are automatically indexed!

### 3. Start Using
- Go to **💬 Chat** page
- Start asking questions
- No login required for chat!

## Key Benefits of Migration

✅ **Better Organization** - Each document in its own collection
✅ **Easier Management** - Delete individual documents
✅ **No Manual Indexing** - Automatic on upload
✅ **User-Friendly** - Separate user and admin interfaces
✅ **Secure** - Admin panel is password protected

## Troubleshooting

### Issue: Can't see old documents
**Solution:** You need to re-upload them through the admin panel. The database structure changed.

### Issue: Admin password doesn't work
**Solution:** Check `config.py` or set environment variable:
```powershell
$env:ADMIN_PASSWORD="your-password"
```

### Issue: Chat says "no documents"
**Solution:** Upload documents through the admin panel first.

## New Workflow

### For Administrators:
1. Access Admin panel (🔐)
2. Upload PDFs (multiple at once)
3. Automatic indexing happens
4. View statistics
5. Delete unwanted documents

### For Users:
1. Open Chat page (💬)
2. See list of available documents
3. Ask questions
4. Get answers with sources
5. Maintain conversation history

---

**Questions?** The new structure is more flexible and easier to maintain!
