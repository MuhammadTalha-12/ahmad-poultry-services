# Setup script for Ahmad Poultry Services (Windows PowerShell)

Write-Host "🐔 Setting up Ahmad Poultry Services..." -ForegroundColor Green

# Backend setup
Write-Host "`n📦 Setting up backend..." -ForegroundColor Cyan
Set-Location backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
Copy-Item env.example .env
python manage.py migrate
python manage.py seed_data
Write-Host "✅ Backend setup complete!" -ForegroundColor Green
Write-Host "👤 Admin credentials: admin@example.com / Admin@123" -ForegroundColor Yellow
Set-Location ..

# Frontend setup
Write-Host "`n🎨 Setting up frontend..." -ForegroundColor Cyan
Set-Location frontend
npm install
Copy-Item env.example .env
Write-Host "✅ Frontend setup complete!" -ForegroundColor Green
Set-Location ..

Write-Host "`n🎉 Setup complete!" -ForegroundColor Green
Write-Host "`n📝 To start development:" -ForegroundColor Yellow
Write-Host "  Backend:  cd backend; .\.venv\Scripts\Activate.ps1; python manage.py runserver" -ForegroundColor White
Write-Host "  Frontend: cd frontend; npm run dev" -ForegroundColor White

