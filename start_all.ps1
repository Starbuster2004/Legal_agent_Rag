# Start both Backend and Frontend
Write-Host "🚀 Starting Legal RAG Full Stack..." -ForegroundColor Green
Write-Host ""

# Start backend in background
Start-Process powershell -ArgumentList "-NoExit", "-File", ".\start_backend.ps1"
Start-Sleep -Seconds 3

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-File", ".\start_frontend.ps1"

Write-Host "✅ Both servers starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:8501" -ForegroundColor Cyan
Write-Host ""
Write-Host "Close both PowerShell windows to stop the servers" -ForegroundColor Yellow
