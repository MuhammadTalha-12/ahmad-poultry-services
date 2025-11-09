# 🔧 Fix Netlify Environment Variable for Backend API

## ❌ THE PROBLEM

Frontend shows **"Not Found" (404 error)** when creating suppliers because:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

**What's happening:**
- Frontend is trying to call: `http://localhost:8000/api/suppliers/`
- But your backend is at: `https://ahmad-poultry-services.onrender.com`
- Result: 404 Not Found (localhost doesn't have your API!)

---

## ✅ SOLUTION: Add Environment Variable to Netlify

### **Step 1: Go to Netlify Dashboard**

1. Visit: **https://app.netlify.com/**
2. Click on your site: **ahmad-poultry-services**
3. Click **"Site configuration"** (or "Site settings")
4. In the left sidebar, click **"Environment variables"**

### **Step 2: Add VITE_API_BASE_URL**

1. Click **"Add a variable"** or **"Add environment variable"**
2. Set the values:

```
Key: VITE_API_BASE_URL
Value: https://ahmad-poultry-services.onrender.com
```

**IMPORTANT:** 
- Use `https://` (not `http://`)
- Do NOT add trailing slash
- Use the `.onrender.com` URL (not `onrender.com`)

3. Click **"Save"** or **"Create variable"**

### **Step 3: Trigger Redeploy**

1. Go to **"Deploys"** tab
2. Click **"Trigger deploy"**
3. Select **"Deploy site"**
4. Wait 2-3 minutes

---

## 📋 VERIFICATION CHECKLIST

After setting environment variable:

- [ ] Logged into Netlify dashboard
- [ ] Found site: ahmad-poultry-services
- [ ] Went to Site configuration → Environment variables
- [ ] Added variable: VITE_API_BASE_URL
- [ ] Value: https://ahmad-poultry-services.onrender.com
- [ ] Saved variable
- [ ] Triggered redeploy
- [ ] Waited for deployment to complete

---

## 🧪 TESTING AFTER DEPLOYMENT

### **Test 1: Check Environment Variable**

Open browser console (F12) on your Netlify site and type:
```javascript
console.log(import.meta.env.VITE_API_BASE_URL)
```

Should show: `https://ahmad-poultry-services.onrender.com`

### **Test 2: Create Supplier**

1. Go to: https://ahmad-poultry-services.netlify.app
2. Login
3. Go to "Suppliers" page
4. Click "Add Supplier"
5. Fill in:
   - Name: Test Supplier
   - Phone: 1234567890
   - Opening Balance: 0
6. Click "Create"

**Expected:** ✅ "Supplier created successfully!"  
**Not:** ❌ "Not Found" or 404 error

### **Test 3: Check Network Tab**

1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Try creating a supplier
4. Look for the POST request
5. Should call: `https://ahmad-poultry-services.onrender.com/api/suppliers/`
6. Should NOT call: `http://localhost:8000/api/suppliers/`

---

## 🔍 COMMON MISTAKES

### ❌ Wrong URL Format

```
# BAD:
http://ahmad-poultry-services.onrender.com  (http instead of https)
https://ahmad-poultry-services.onrender.com/  (trailing slash)
ahmad-poultry-services.onrender.com  (missing https://)

# GOOD:
https://ahmad-poultry-services.onrender.com
```

### ❌ Wrong Variable Name

```
# BAD:
API_BASE_URL  (missing VITE_ prefix)
VITE_API_URL  (wrong name)

# GOOD:
VITE_API_BASE_URL  (exactly this!)
```

### ❌ Not Redeploying

- Environment variables only take effect AFTER redeploy
- Clearing cache won't work
- Must trigger new deploy from Netlify dashboard

---

## 📸 SCREENSHOT GUIDE

### **Where to Find Environment Variables:**

```
Netlify Dashboard
  → Select Your Site (ahmad-poultry-services)
    → Site configuration
      → Environment variables
        → Add a variable
          → Key: VITE_API_BASE_URL
          → Value: https://ahmad-poultry-services.onrender.com
          → Save
```

---

## 🎯 AFTER FIXING

Once you add the environment variable and redeploy:

### **What Will Work:**

1. ✅ Create suppliers from frontend
2. ✅ Edit suppliers
3. ✅ Delete suppliers
4. ✅ View supplier list
5. ✅ All other API calls (Sales, Purchases, etc.)

### **What You'll See:**

```
Frontend: https://ahmad-poultry-services.netlify.app
    ↓ calls
Backend: https://ahmad-poultry-services.onrender.com/api/suppliers/
    ↓ returns
Success: 201 Created
```

---

## 💡 WHY THIS HAPPENED

**Development vs Production:**

| Environment | API URL | Works? |
|-------------|---------|--------|
| **Local Development** | `http://localhost:8000` | ✅ (your local backend) |
| **Production (before fix)** | `http://localhost:8000` | ❌ (no backend at localhost!) |
| **Production (after fix)** | `https://...onrender.com` | ✅ (your actual backend) |

---

## ⚡ QUICK COPY/PASTE

**For Netlify Environment Variables:**

```
Variable Key:
VITE_API_BASE_URL

Variable Value:
https://ahmad-poultry-services.onrender.com
```

---

**After you add this environment variable and redeploy, everything will work! 🚀**

