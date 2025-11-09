# ✅ Correct URLs Reference - Ahmad Poultry Services

## 🎯 EXACT PRODUCTION URLS

### **Frontend (Netlify)**
```
https://ahmad-poultery-services.netlify.app
```
- Note: Uses "poultery" spelling (with typo)
- This is the correct Netlify deployment URL
- Used in CORS_ALLOWED_ORIGINS

### **Backend (Render)**
```
https://ahmad-poultry-services.onrender.com
```
- Note: Uses "poultry" spelling (correct)
- This is the correct Render deployment URL
- Used in VITE_API_BASE_URL on Netlify

---

## 📋 WHERE THESE URLS ARE CONFIGURED

### **Backend Configuration:**

**File:** `backend/config/settings.py`  
**Line:** 143

```python
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:5173,http://127.0.0.1:5173,https://ahmad-poultery-services.netlify.app'
)
```

### **Frontend Configuration:**

**Location:** Netlify Environment Variables  
**Variable:** `VITE_API_BASE_URL`  
**Value:** `https://ahmad-poultry-services.onrender.com`

---

## 🔗 COMPLETE URL MAPPING

```
User visits:
https://ahmad-poultery-services.netlify.app
    ↓
    Loads React app
    ↓
    Reads: VITE_API_BASE_URL
    ↓
    Makes API calls to:
https://ahmad-poultry-services.onrender.com/api/*
    ↓
    Backend checks CORS:
    - Origin: https://ahmad-poultery-services.netlify.app
    - Is it in CORS_ALLOWED_ORIGINS? ✅ YES
    ↓
    Returns data
```

---

## ⚠️ IMPORTANT NOTES

### **Spelling Difference:**

- **Frontend URL:** `poultery` (typo spelling)
- **Backend URL:** `poultry` (correct spelling)
- **This is intentional** - these are the actual deployed URLs

### **No Trailing Slashes:**

Both URLs should be used **WITHOUT trailing slashes** in configuration:

```bash
# ✅ CORRECT:
https://ahmad-poultery-services.netlify.app
https://ahmad-poultry-services.onrender.com

# ❌ WRONG:
https://ahmad-poultery-services.netlify.app/
https://ahmad-poultry-services.onrender.com/
```

---

## 🧪 TESTING URLS

### **Test Frontend:**
```bash
https://ahmad-poultery-services.netlify.app/
```
Should load React app with login page

### **Test Backend Root:**
```bash
https://ahmad-poultry-services.onrender.com/
```
Should return JSON with API endpoints

### **Test Backend API:**
```bash
https://ahmad-poultry-services.onrender.com/api/suppliers/
```
Should return JSON supplier list (requires auth)

### **Test Admin:**
```bash
https://ahmad-poultry-services.onrender.com/admin/
```
Should show Django admin login

---

## 📦 DEPLOYMENT CHECKLIST

Before deploying, verify:

- [ ] Backend CORS includes: `https://ahmad-poultery-services.netlify.app`
- [ ] Netlify env var: `VITE_API_BASE_URL=https://ahmad-poultry-services.onrender.com`
- [ ] No trailing slashes in either URL
- [ ] Both URLs use `https://` (not `http://`)

---

## 🎉 CURRENT STATUS

**Last Updated:** November 10, 2025  
**Commit:** 79bc101  
**Status:** ✅ **CORRECTLY CONFIGURED**

Both URLs are now properly configured in the codebase and will work together after deployment.

---

**Frontend:** https://ahmad-poultery-services.netlify.app  
**Backend:** https://ahmad-poultry-services.onrender.com

