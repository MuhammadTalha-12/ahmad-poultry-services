#!/bin/bash
# Setup script for Ahmad Poultry Services (Linux/Mac)

echo "🐔 Setting up Ahmad Poultry Services..."

# Backend setup
echo "\n📦 Setting up backend..."
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cp env.example .env
python manage.py migrate
python manage.py seed_data
echo "✅ Backend setup complete!"
echo "👤 Admin credentials: admin@example.com / Admin@123"
cd ..

# Frontend setup
echo "\n🎨 Setting up frontend..."
cd frontend
npm install
cp env.example .env
echo "✅ Frontend setup complete!"
cd ..

echo "\n🎉 Setup complete!"
echo "\n📝 To start development:"
echo "  Backend:  cd backend && source .venv/bin/activate && python manage.py runserver"
echo "  Frontend: cd frontend && npm run dev"

