# Start FastAPI Backend Server
Write-Host "🚀 Starting Legal RAG FastAPI Backend..." -ForegroundColor Green
Write-Host ""
Write-Host "📡 API will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 Swagger Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "📖 ReDoc: http://localhost:8000/redoc" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start uvicorn
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
