# Start Streamlit Frontend (if using with API)
Write-Host "🎨 Starting Legal RAG Streamlit Frontend..." -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend will be available at: http://localhost:8501" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Make sure FastAPI backend is running on port 8000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

streamlit run app.py
