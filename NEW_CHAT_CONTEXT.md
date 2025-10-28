# 🚀 Context for New AI Chat Session

**PASTE THIS AT THE START OF NEW CHAT TO GIVE AI FULL CONTEXT**

---

## Project: Ahmad Poultry Services

**Status**: ✅ **FULLY DEPLOYED & OPERATIONAL**

**Live URLs:**
- Frontend: https://ahmad-poultry-services.netlify.app
- Backend: https://ahmad-poultery-backend.onrender.com
- Admin: https://ahmad-poultery-backend.onrender.com/admin/ (admin / Admin@123)
- API Docs: https://ahmad-poultery-backend.onrender.com/api/docs/

**GitHub**: https://github.com/MuhammadTalha-12/ahmad-poultry-services

---

## Tech Stack

### Backend:
- Django 5.0.1 + Django REST Framework 3.14.0
- PostgreSQL (Neon.tech free tier)
- JWT authentication (djangorestframework-simplejwt)
- Deployed on Render (free tier)
- Auto-deploy on push to main

### Frontend:
- React 18 + Vite 7 + TypeScript 5
- Material-UI 6 + TailwindCSS 4
- Zustand (state), React Query (API), Axios
- Deployed on Netlify (free tier)
- Auto-deploy on push to main

---

## Repository Structure (Monorepo)

```
ahmad-poultry-services/
├── backend/              # Django REST API
│   ├── config/          # Settings, URLs
│   ├── accounts/        # Auth
│   ├── sales/           # Core models (Customer, Sale, Purchase, Payment, Expense, DailyRate)
│   ├── reports/         # Report endpoints
│   ├── build.sh         # Automated deployment script
│   └── requirements.txt
├── frontend/             # React SPA
│   ├── src/
│   │   ├── pages/       # Dashboard, Customers, Sales, Purchases, Payments, Expenses, Reports
│   │   ├── services/    # API client
│   │   └── stores/      # Auth store (Zustand)
│   └── package.json
└── netlify.toml
```

---

## Core Business Logic

### Models (Django):
1. **Customer**: name, phone, address, opening_balance, running_balance (computed)
2. **Purchase**: date, supplier, kg, cost_rate_per_kg, total_cost (computed)
3. **Sale**: date, customer, kg, sale_rate_per_kg, cost_rate_snapshot, amount_received, total_amount (computed), borrow_amount (computed), profit (computed)
4. **Payment**: date, customer, amount, method
5. **Expense**: date, category, amount
6. **DailyRate**: date, default_cost_rate, default_sale_rate

### Calculations:
- Sale total = kg × sale_rate_per_kg
- Borrow = total - amount_received
- Profit = kg × (sale_rate - cost_rate)
- Customer balance = opening_balance + Σ(sales.total) - Σ(payments.amount)
- Stock = Σ(purchases.kg) - Σ(sales.kg)

---

## API Endpoints

**Base**: https://ahmad-poultery-backend.onrender.com

- `POST /api/auth/login/` - JWT login (username + password)
- `POST /api/auth/refresh/` - Refresh token
- `/api/customers/` - CRUD + search/filter
- `/api/sales/` - CRUD + date filter
- `/api/purchases/` - CRUD
- `/api/payments/` - CRUD
- `/api/expenses/` - CRUD + category filter
- `/api/daily-rates/` - CRUD
- `/api/reports/daily/` - Daily summary
- `/api/reports/period/` - Period report with breakdown
- `/api/reports/expenses/` - Expense report
- `/api/customers/{id}/report/` - Customer statement

All support pagination, search, filters. See Swagger UI at `/api/docs/`

---

## Deployment Setup

### Backend (Render):
- **Service**: ahmad-poultry-backend
- **Root Dir**: backend
- **Build**: `chmod +x build.sh && ./build.sh`
- **Start**: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
- **Env Vars**: DATABASE_URL (Neon), ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS, DEBUG=False, TIME_ZONE=Asia/Karachi
- **Auto-deploy**: On push to main branch
- **Build Script**: Installs deps → Migrates → Creates superuser → Seeds data → Collects static

### Frontend (Netlify):
- **Site**: ahmad-poultry-services
- **Base Dir**: frontend
- **Build**: `npm run build`
- **Publish**: dist
- **Env Var**: `VITE_API_BASE_URL=https://ahmad-poultery-backend.onrender.com`
- **Auto-deploy**: On push to main branch

### Database (Neon.tech):
- PostgreSQL 15, free tier
- Connection string in Render's DATABASE_URL env var

### Uptime Monitor:
- **UptimeRobot** pings backend every 10 min to prevent Render free tier spin-down

---

## Local Development

### Backend:
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # admin / Admin@123
python manage.py seed_data
python manage.py runserver  # http://localhost:8000
```

### Frontend:
```bash
cd frontend
npm install
# Create .env: VITE_API_BASE_URL=http://localhost:8000
npm run dev  # http://localhost:5173
```

---

## Current State

### ✅ Completed:
- Full CRUD for all entities
- Authentication (JWT)
- All reports (daily, period, customer, expense)
- Auto-calculations (totals, borrow, profit, balance)
- Responsive UI with Material-UI
- Auto-deploy CI/CD (GitHub → Render/Netlify)
- Seed data: 25 customers, 30 days transactions
- Comprehensive documentation (10+ guide files)

### 🎯 Pending (Future Work):
- PDF export (currently CSV only)
- CSV import (templates exist, API not yet implemented)
- User roles/permissions (currently admin only)
- Email/SMS notifications
- Mobile app
- Advanced search
- Audit log
- Unit/E2E tests
- GitHub Actions CI/CD

---

## Key Files to Know

### Backend:
- `backend/config/settings.py` - Django settings
- `backend/config/urls.py` - URL routing
- `backend/sales/models.py` - Core business models
- `backend/sales/views.py` - API ViewSets
- `backend/sales/serializers.py` - DRF serializers
- `backend/reports/views.py` - Report endpoints
- `backend/build.sh` - Deployment automation

### Frontend:
- `frontend/src/App.tsx` - React Router setup
- `frontend/src/stores/authStore.ts` - Auth state (Zustand)
- `frontend/src/services/api.ts` - Axios client with JWT interceptor
- `frontend/src/pages/Login.tsx` - Login page
- `frontend/src/pages/Dashboard.tsx` - Main dashboard
- `frontend/src/pages/Customers.tsx` - Customer management
- `frontend/src/pages/Sales.tsx` - Sales entry & list
- `frontend/src/components/Layout.tsx` - Global layout

---

## Known Issues & Solutions

### Issue: Render free tier spins down after 15 min
**Solution**: ✅ UptimeRobot configured to ping every 10 min

### Issue: First load takes 30-60 sec (cold start)
**Solution**: ✅ Normal for free tier, subsequent requests are fast

### Issue: CORS errors
**Solution**: ✅ CORS_ALLOWED_ORIGINS includes Netlify domain

### Issue: Login network error
**Solution**: ✅ VITE_API_BASE_URL set correctly on Netlify

### Issue: TypeScript type import errors (MUI)
**Solution**: ✅ Use `import { type GridColDef }` or `verbatimModuleSyntax: false`

---

## Workflow

### To Add New Feature:
1. Make changes locally (test with localhost:8000 + localhost:5173)
2. `git add . && git commit -m "Add feature X" && git push origin main`
3. Wait ~5-7 minutes
4. ✅ Changes auto-deploy to live site!

### No Manual Steps Required:
- ❌ Don't need to manually deploy
- ❌ Don't need to run migrations on server (build.sh does it)
- ❌ Don't need to click "Deploy" buttons
- ✅ Just push to GitHub, everything else is automatic!

---

## Documentation Files (all in repo root)

- **README.md** - Project overview
- **PROJECT_SUMMARY.md** - Complete detailed summary (THIS IS THE MASTER DOC)
- **QUICKSTART.md** - Fast local setup
- **DEPLOYMENT_COMPLETE_GUIDE.md** - Full deployment walkthrough
- **RENDER_FREE_TIER_SETUP.md** - Render automated setup
- **RENDER_TROUBLESHOOTING.md** - Common errors & fixes
- **LOGIN_INSTRUCTIONS.md** - Login guide
- **DEVELOPMENT_NOTES.md** - Dev tips
- And more...

---

## What to Tell New AI Session

**Copy/paste this:**

> I have a fully deployed full-stack app (Ahmad Poultry Services) with React+Vite frontend on Netlify, Django+DRF backend on Render, and PostgreSQL on Neon.tech. It manages chicken supply operations with customers, sales, purchases, payments, expenses, and reports. Everything auto-deploys on push to GitHub main branch. The app is live and working. I have comprehensive documentation in PROJECT_SUMMARY.md. [Then describe what you want to add/fix/improve]

---

## Quick Reference

**Login**: admin / Admin@123  
**Local Backend**: http://localhost:8000  
**Local Frontend**: http://localhost:5173  
**Live Frontend**: https://ahmad-poultry-services.netlify.app  
**Live Backend**: https://ahmad-poultery-backend.onrender.com  
**API Docs**: https://ahmad-poultery-backend.onrender.com/api/docs/  
**Repo**: https://github.com/MuhammadTalha-12/ahmad-poultry-services

---

**Status**: ✅ PRODUCTION-READY | All systems operational | Auto-deploy working | Uptime monitoring active

**Read PROJECT_SUMMARY.md for complete detailed documentation of everything!**

