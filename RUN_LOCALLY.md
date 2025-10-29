# 🚀 Quick Start - Run Locally

## For Windows PowerShell

### Step 1: Open TWO PowerShell Terminals

---

## Terminal 1: Backend (Django)

```powershell
# Navigate to project
cd "D:\Ahmad Poultry Services\backend"

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# If virtual environment doesn't exist, create it first:
# python -m venv .venv
# .\.venv\Scripts\Activate.ps1
# pip install -r requirements.txt
# python manage.py migrate
# python manage.py createsuperuser

# Run server
python manage.py runserver
```

**Backend will run on:** http://localhost:8000

**You should see:**
```
Django version X.X.X
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

---

## Terminal 2: Frontend (React + Vite)

```powershell
# Navigate to project
cd "D:\Ahmad Poultry Services\frontend"

# If dependencies not installed:
# npm install

# Run dev server
npm run dev
```

**Frontend will run on:** http://localhost:5173

**You should see:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

---

## Step 2: Open Browser

Go to: **http://localhost:5173**

**Login:**
- Username: `admin`
- Password: `Admin@123`

---

## 🛠️ Troubleshooting

### Backend Won't Start

**Problem:** Virtual environment not found
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Problem:** Port 8000 already in use
```powershell
# Find process using port 8000
netstat -ano | findstr :8000
# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
# Or use a different port
python manage.py runserver 8001
```

### Frontend Won't Start

**Problem:** Dependencies not installed
```powershell
cd frontend
npm install
npm run dev
```

**Problem:** Port 5173 already in use
```powershell
# Kill the process or Vite will automatically use next available port
```

### Backend and Frontend Can't Communicate

**Check `.env` files exist:**

**backend/.env:**
```env
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DATABASE_URL=sqlite:///db.sqlite3
TIME_ZONE=Asia/Karachi
```

**frontend/.env:**
```env
VITE_API_BASE_URL=http://localhost:8000
```

If files don't exist:
```powershell
# Backend
cd backend
Copy-Item env.example .env

# Frontend
cd frontend
Copy-Item env.example .env
```

---

## 🧪 Testing the New Features

### 1. Test Customer CRUD
- ✅ Create a customer
- ✅ Edit the customer (click pencil icon)
- ✅ Try to delete (click trash icon)

### 2. Test Sales with Filtering
- ✅ Create a sale
- ✅ Click "Filter" button
- ✅ Set date range
- ✅ See filtered results
- ✅ Edit a sale
- ✅ Delete a sale

### 3. Test Report PDF
- ✅ Go to Reports page
- ✅ Select date range
- ✅ Click "Generate Report"
- ✅ Click "Download PDF"
- ✅ Print dialog should open
- ✅ Choose "Save as PDF"

---

## 📊 Sample Test Data

Create these to test:

### Customers:
1. **Ali Traders** - Opening: 5,000 PKR
2. **Bismillah Store** - Opening: 10,000 PKR
3. **Rahmat Shop** - Opening: 0 PKR

### Sales:
1. Customer: Ali Traders, KG: 50, Rate: 350, Cost: 320, Received: 10,000
2. Customer: Bismillah Store, KG: 100, Rate: 350, Cost: 320, Received: 25,000

### Payments:
1. Ali Traders: 5,000 PKR (Cash)
2. Bismillah Store: 10,000 PKR (Bank)

### Verify:
- Ali Traders closing balance should show correctly
- Sales should appear in date filter
- Reports should calculate totals properly

---

## 🔄 Restart Servers

If you make code changes:

**Backend:**
- Press `CTRL + C` in backend terminal
- Run `python manage.py runserver` again

**Frontend:**
- Vite auto-reloads (usually no restart needed)
- If needed: Press `CTRL + C` and run `npm run dev` again

---

## ✅ Ready to Deploy?

After testing locally:

```powershell
# Navigate to project root
cd "D:\Ahmad Poultry Services"

# Add all changes
git add .

# Commit
git commit -m "Add full CRUD, filtering, and PDF reports"

# Push to GitHub (auto-deploys to Netlify + Render)
git push origin main
```

Wait 5-7 minutes, then check:
- Frontend: https://ahmad-poultry-services.netlify.app
- Backend: https://ahmad-poultery-backend.onrender.com

---

## 📞 Need Help?

Check:
1. Browser Console (F12) - for frontend errors
2. Backend Terminal - for Django errors
3. Frontend Terminal - for build errors
4. CHANGES_SUMMARY.md - detailed documentation

---

**Happy Testing! 🎉**

