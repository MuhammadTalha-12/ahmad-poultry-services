# 🚀 Quick Start Guide

Get Ahmad Poultry Services running locally in 5 minutes!

## Prerequisites

- Python 3.11+ ([Download](https://www.python.org/downloads/))
- Node.js 18+ ([Download](https://nodejs.org/))
- Git ([Download](https://git-scm.com/downloads))

## One-Command Setup

### Windows (PowerShell)
```powershell
git clone https://github.com/MuhammadTalha-12/ahmad-poultry-services.git
cd ahmad-poultry-services
.\setup.ps1
```

### Linux/Mac (Bash)
```bash
git clone https://github.com/MuhammadTalha-12/ahmad-poultry-services.git
cd ahmad-poultry-services
chmod +x setup.sh
./setup.sh
```

## Manual Setup

If the setup script doesn't work, follow these steps:

### 1. Clone Repository
```bash
git clone https://github.com/MuhammadTalha-12/ahmad-poultry-services.git
cd ahmad-poultry-services
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.\.venv\Scripts\Activate.ps1
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements-dev.txt

# Setup environment
cp env.example .env

# Run migrations
python manage.py migrate

# Create sample data (25 customers + 30 days of transactions)
python manage.py seed_data

# Start backend server
python manage.py runserver
```

Backend will run at **http://localhost:8000**

### 3. Frontend Setup (New Terminal)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Setup environment
cp env.example .env

# Start development server
npm run dev
```

Frontend will run at **http://localhost:5173**

## Login Credentials

### Admin User
- **Email**: admin@example.com
- **Password**: Admin@123

### Regular User
- **Email**: user@example.com
- **Password**: User@123

## First Steps

1. **Login** at http://localhost:5173/login
2. **Explore Dashboard** - See today's sales, profit, and stock
3. **View Customers** - Browse 25 pre-loaded customers
4. **Check Sales** - 30 days of sample transaction data
5. **Generate Reports** - Try daily and period reports

## API Documentation

Once backend is running, visit:
- **Swagger UI**: http://localhost:8000/api/docs/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

## Project Structure

```
ahmad-poultry-services/
├── backend/              # Django REST API
│   ├── sales/           # Main app (models, views, serializers)
│   ├── reports/         # Reporting logic
│   ├── config/          # Django settings
│   └── manage.py
├── frontend/            # React + TypeScript
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable UI components
│   │   ├── services/   # API client
│   │   └── stores/     # State management
│   └── package.json
├── docs/                # Documentation
│   ├── ERD.md          # Database schema
│   ├── API.md          # API reference
│   ├── DEPLOYMENT.md   # Deployment guide
│   └── templates/      # CSV import templates
└── .github/workflows/  # CI/CD pipelines
```

## Common Tasks

### Add a New Customer
1. Navigate to **Customers** page
2. Click **"Add Customer"**
3. Fill in details and save

### Record a Sale
1. Navigate to **Sales** page
2. Click **"Add Sale"**
3. Select customer, enter kg, rates, and amount received
4. System auto-calculates total, profit, and borrow amount

### Generate Weekly Report
1. Navigate to **Reports** page
2. Set start/end dates (e.g., last 7 days)
3. Click **"Generate Report"**
4. View sales, profit, expenses breakdown

### Import Historical Data
1. Download CSV templates from `docs/templates/`
2. Fill with your data
3. Use API endpoint: `POST /api/import/csv/`
4. (UI for CSV import coming soon)

## Troubleshooting

### Backend won't start
- Ensure Python 3.11+ is installed: `python --version`
- Activate virtual environment first
- Check if port 8000 is available

### Frontend won't start
- Ensure Node.js 18+ is installed: `node --version`
- Delete `node_modules` and `package-lock.json`, then `npm install`
- Check if port 5173 is available

### Can't login
- Ensure backend is running
- Check browser console for errors
- Verify `VITE_API_BASE_URL` in `frontend/.env` is `http://localhost:8000`

### Database issues
- Delete `backend/db.sqlite3`
- Re-run `python manage.py migrate`
- Re-run `python manage.py seed_data`

## Next Steps

- 📖 Read the [README.md](README.md) for full documentation
- 🚀 Follow [DEPLOYMENT.md](docs/DEPLOYMENT.md) to deploy to production
- 📊 Check [ERD.md](docs/ERD.md) for database schema
- 🔌 Explore [API.md](docs/API.md) for API reference

## Need Help?

- GitHub Issues: https://github.com/MuhammadTalha-12/ahmad-poultry-services/issues
- Check logs: Backend terminal for Django errors, Browser console for React errors

---

Built with ❤️ for Ahmad Poultry Services

