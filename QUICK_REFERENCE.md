# ⚡ Ahmad Poultry Services - Quick Reference Card

**Print/Save this for quick access!**

---

## 🌐 Live URLs

```
Frontend:  https://ahmad-poultry-services.netlify.app
Backend:   https://ahmad-poultery-backend.onrender.com
Admin:     https://ahmad-poultery-backend.onrender.com/admin/
API Docs:  https://ahmad-poultery-backend.onrender.com/api/docs/
GitHub:    https://github.com/MuhammadTalha-12/ahmad-poultry-services
```

---

## 🔑 Credentials

```
Username: admin
Password: Admin@123
```

---

## 💻 Local Development

### Start Backend:
```bash
cd backend
.\.venv\Scripts\Activate.ps1
python manage.py runserver
```
→ http://localhost:8000

### Start Frontend:
```bash
cd frontend
npm run dev
```
→ http://localhost:5173

---

## 🚀 Deploy Changes

```bash
# 1. Make changes & test locally
# 2. Commit & push:
git add .
git commit -m "Your message"
git push origin main

# 3. Wait ~7 minutes → LIVE!
```

---

## 📚 Key Documentation Files

| File | Purpose |
|------|---------|
| **NEW_CHAT_CONTEXT.md** | Give to new AI chat |
| **PROJECT_SUMMARY.md** | Complete technical doc |
| **QUICKSTART.md** | Local setup |
| **RENDER_TROUBLESHOOTING.md** | Fix errors |

---

## 🎯 Tech Stack

**Frontend**: React + Vite + TypeScript + Material-UI + TailwindCSS  
**Backend**: Django + DRF + PostgreSQL + JWT  
**Deploy**: Netlify + Render + Neon.tech  
**Cost**: $0/month (all free tier!)

---

## 📊 Database Models

- **Customer**: name, phone, balance
- **Sale**: date, customer, kg, rates, amounts
- **Purchase**: date, supplier, kg, cost
- **Payment**: date, customer, amount
- **Expense**: date, category, amount
- **DailyRate**: date, cost_rate, sale_rate

---

## 🔌 Main API Endpoints

```
POST   /api/auth/login/           # Login
POST   /api/auth/refresh/         # Refresh token

GET    /api/customers/            # List customers
POST   /api/customers/            # Create customer
GET    /api/customers/{id}/       # Get customer
PUT    /api/customers/{id}/       # Update customer

GET    /api/sales/                # List sales
POST   /api/sales/                # Create sale

GET    /api/purchases/            # List purchases
POST   /api/purchases/            # Create purchase

GET    /api/payments/             # List payments
POST   /api/payments/             # Create payment

GET    /api/expenses/             # List expenses
POST   /api/expenses/             # Create expense

GET    /api/reports/daily/        # Daily report
GET    /api/reports/period/       # Period report
```

All support: `?page=1&page_size=25&search=x&ordering=-date`

---

## 🛠️ Useful Commands

### Backend:
```bash
python manage.py migrate           # Run migrations
python manage.py makemigrations    # Create migrations
python manage.py createsuperuser   # Create admin user
python manage.py seed_data         # Load sample data
python manage.py shell             # Django shell
python manage.py test              # Run tests
```

### Frontend:
```bash
npm run dev          # Dev server
npm run build        # Production build
npm run preview      # Preview build
```

### Git:
```bash
git status           # Check changes
git add .            # Stage all
git commit -m "msg"  # Commit
git push origin main # Deploy
git log --oneline    # View history
```

---

## 🐛 Common Issues

### "Network Error" on login
→ Check VITE_API_BASE_URL on Netlify

### "Bad Gateway" on backend
→ Check DATABASE_URL on Render  
→ Check Render logs for errors

### Backend sleeping (15 min timeout)
→ Normal for free tier  
→ UptimeRobot configured to prevent

### CORS errors
→ Update CORS_ALLOWED_ORIGINS on Render

---

## ⚙️ Environment Variables

### Backend (Render):
```
PYTHON_VERSION=3.11.0
DJANGO_SECRET_KEY=(auto-generated)
DEBUG=False
ALLOWED_HOSTS=ahmad-poultery-backend.onrender.com,ahmad-poultry-services.netlify.app
DATABASE_URL=postgresql://...(from Neon)
CORS_ALLOWED_ORIGINS=https://ahmad-poultry-services.netlify.app,http://localhost:5173
TIME_ZONE=Asia/Karachi
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440
```

### Frontend (Netlify):
```
VITE_API_BASE_URL=https://ahmad-poultery-backend.onrender.com
NODE_VERSION=20
```

---

## 📈 Sample Data

**Included:**
- 25 customers (Ali Traders, Bismillah Store, etc.)
- 30 days of transactions (Sept 28 - Oct 27, 2025)
- ~90 sales, 30 purchases, ~60 payments, ~45 expenses

---

## 🎯 Feature Checklist

✅ Customer management  
✅ Sales tracking  
✅ Purchase tracking  
✅ Payment collection  
✅ Expense recording  
✅ Daily rates  
✅ Reports (daily, period, customer, expense)  
✅ Search & filter  
✅ Auto-calculations  
✅ Responsive UI  
✅ JWT auth  
✅ API docs  
✅ Auto-deploy  

---

## 🔄 Workflow

```
1. Code locally
2. git push origin main
3. Wait ~7 min
4. ✅ LIVE!
```

---

## 📞 Dashboard Links

| Service | Dashboard |
|---------|-----------|
| Netlify | https://app.netlify.com |
| Render | https://dashboard.render.com |
| Neon | https://neon.tech |
| UptimeRobot | https://uptimerobot.com |
| GitHub | https://github.com/MuhammadTalha-12/ahmad-poultry-services |

---

## 🆘 Need Help?

1. Check **RENDER_TROUBLESHOOTING.md** for common errors
2. Check Render/Netlify logs in dashboards
3. Read **PROJECT_SUMMARY.md** for full technical details
4. Use **NEW_CHAT_CONTEXT.md** to start new AI chat with full context

---

## 🎉 Status

**🟢 ALL SYSTEMS OPERATIONAL**

- Frontend: 🟢 Live
- Backend: 🟢 Live
- Database: 🟢 Live
- Auto-deploy: 🟢 Active
- Monitoring: 🟢 Active

---

**Version**: 1.0.0 | **Date**: Oct 28, 2025 | **Status**: Production-Ready ✅

