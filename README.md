# Ahmad Poultry Services 🐔

A comprehensive, production-ready poultry business management system built with Django REST Framework and React + TypeScript.

## 🚀 Features

- **Customer Management**: Track 25+ customers with complete transaction history
- **Sales Tracking**: Daily sales entry with automatic profit calculation
- **Purchase Management**: Record daily poultry purchases from farms
- **Payment Records**: Track customer payments and outstanding balances
- **Expense Tracking**: Categorized expense management (van repair, feed, salary, petrol, etc.)
- **Advanced Reports**: Daily, weekly, monthly, and custom date range reports
- **CSV Import/Export**: Bulk data import and export to CSV/PDF
- **Customer Statements**: Generate detailed customer ledger statements
- **Inventory Management**: Real-time stock tracking
- **Responsive Design**: Works on desktop, tablet, and mobile

## 📋 Tech Stack

### Backend
- Django 5 + Django REST Framework
- PostgreSQL database
- JWT authentication (djangorestframework-simplejwt)
- drf-spectacular for API documentation
- Gunicorn for production server

### Frontend
- React 18 + TypeScript
- Vite for build tooling
- TailwindCSS + Material-UI
- React Query for data fetching
- Zustand for state management
- React Hook Form + Zod for validation
- Recharts for data visualization

### DevOps
- GitHub Actions CI/CD
- Netlify (Frontend hosting)
- Render (Backend hosting + PostgreSQL)

## 🛠️ Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ and pnpm
- PostgreSQL 15+ (or use SQLite for development)
- Git

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load seed data (25 customers + 30 days of transactions)
python manage.py seed_data

# Run development server
python manage.py runserver
```

Backend will be available at http://localhost:8000
API docs at http://localhost:8000/api/docs

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
pnpm install

# Create .env file
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:8000

# Run development server
pnpm dev
```

Frontend will be available at http://localhost:5173

### Default Credentials
- **Admin**: admin@example.com / Admin@123
- **User**: user@example.com / User@123

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with JWT
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/register` - Register new user (admin only)

### Customers
- `GET /api/customers/` - List all customers
- `POST /api/customers/` - Create customer
- `GET /api/customers/{id}/` - Get customer details
- `PATCH /api/customers/{id}/` - Update customer
- `GET /api/customers/{id}/statement/` - Get customer statement

### Sales
- `GET /api/sales/` - List all sales
- `POST /api/sales/` - Create sale
- `GET /api/sales/{id}/` - Get sale details
- `PATCH /api/sales/{id}/` - Update sale

### Purchases
- `GET /api/purchases/` - List all purchases
- `POST /api/purchases/` - Create purchase
- `GET /api/purchases/{id}/` - Get purchase details
- `PATCH /api/purchases/{id}/` - Update purchase

### Payments
- `GET /api/payments/` - List all payments
- `POST /api/payments/` - Create payment
- `GET /api/payments/{id}/` - Get payment details
- `PATCH /api/payments/{id}/` - Update payment

### Expenses
- `GET /api/expenses/` - List all expenses
- `POST /api/expenses/` - Create expense
- `GET /api/expenses/{id}/` - Get expense details
- `PATCH /api/expenses/{id}/` - Update expense

### Reports
- `GET /api/reports/daily/?date=YYYY-MM-DD` - Daily report
- `GET /api/reports/period/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` - Period report
- `GET /api/reports/expenses/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` - Expense report

### Import/Export
- `POST /api/import/csv/` - Bulk CSV import
- `GET /api/customers/{id}/statement/?format=csv` - Export to CSV
- `GET /api/customers/{id}/statement/?format=pdf` - Export to PDF

## 🚢 Deployment

### Backend (Render)
1. Create new Web Service on Render
2. Connect GitHub repository
3. Configure:
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && gunicorn config.wsgi:application`
   - **Environment Variables**: Set all variables from `.env.example`
4. Create PostgreSQL database and link to web service

### Frontend (Netlify)
1. Connect GitHub repository to Netlify
2. Configure:
   - **Base Directory**: `frontend`
   - **Build Command**: `pnpm run build`
   - **Publish Directory**: `frontend/dist`
   - **Environment Variables**: `VITE_API_BASE_URL=<your-render-backend-url>`

### CI/CD
Push to `main` branch triggers automatic deployment via GitHub Actions.

## 📁 Project Structure

```
ahmad-poultry-services/
├── backend/
│   ├── config/              # Django settings
│   ├── apps/
│   │   ├── accounts/        # User authentication
│   │   ├── core/            # Shared utilities
│   │   ├── sales/           # Sales, customers, purchases
│   │   └── reports/         # Reporting logic
│   ├── requirements.txt
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── stores/          # Zustand stores
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Helper functions
│   ├── package.json
│   └── vite.config.ts
├── .github/
│   └── workflows/           # CI/CD pipelines
├── docs/
│   ├── ERD.md              # Database schema
│   ├── API.md              # API documentation
│   └── templates/          # CSV import templates
└── README.md
```

## 📝 CSV Import Templates

Download templates from `/docs/templates/`:
- `customers.csv` - Customer import template
- `sales.csv` - Sales import template
- `payments.csv` - Payments import template
- `purchases.csv` - Purchases import template
- `expenses.csv` - Expenses import template

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
# or
python manage.py test
```

### Frontend Tests
```bash
cd frontend
pnpm test
```

## 📄 License

MIT License - Feel free to use for your business needs.

## 🤝 Support

For issues and questions, please create an issue on GitHub.

---

Built with ❤️ for Ahmad Poultry Services

