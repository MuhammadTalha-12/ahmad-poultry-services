# Deployment Guide

## Prerequisites

1. GitHub account with repository: `https://github.com/MuhammadTalha-12/ahmad-poultry-services`
2. Netlify account (sign up with GitHub)
3. Render account (sign up with GitHub)

---

## Backend Deployment (Render)

### Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `ahmad-poultry-db`
   - **Database**: `ahmad_poultry`
   - **User**: `ahmad_poultry_user`
   - **Region**: Choose closest to you
   - **Plan**: **Free**
4. Click **"Create Database"**
5. Copy the **Internal Database URL** for next step

### Step 2: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `MuhammadTalha-12/ahmad-poultry-services`
3. Configure:
   - **Name**: `ahmad-poultry-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: **Python 3**
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn config.wsgi:application`
   - **Plan**: **Free**

4. Add Environment Variables:
   ```
   PYTHON_VERSION=3.11.0
   DJANGO_SECRET_KEY=<generate-a-random-50-char-string>
   DEBUG=False
   ALLOWED_HOSTS=ahmad-poultry-backend.onrender.com
   CORS_ALLOWED_ORIGINS=https://ahmad-poultry-services.netlify.app
   DATABASE_URL=<paste-internal-database-url-from-step-1>
   TIME_ZONE=Asia/Karachi
   JWT_ACCESS_TOKEN_LIFETIME=60
   JWT_REFRESH_TOKEN_LIFETIME=1440
   ```

5. Click **"Create Web Service"**

### Step 3: Run Migrations & Seed Data

1. Once deployed, go to **Shell** tab
2. Run:
   ```bash
   python manage.py migrate
   python manage.py seed_data
   python manage.py collectstatic --noinput
   ```

3. Note your backend URL: `https://ahmad-poultry-backend.onrender.com`

---

## Frontend Deployment (Netlify)

### Step 1: Connect Repository

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize
4. Select repository: `MuhammadTalha-12/ahmad-poultry-services`

### Step 2: Configure Build Settings

1. Configure:
   - **Branch**: `main`
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

2. Add Environment Variable:
   ```
   VITE_API_BASE_URL=https://ahmad-poultry-backend.onrender.com
   ```

3. Click **"Deploy site"**

### Step 3: Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Add custom domain or note your Netlify subdomain
3. Update backend `CORS_ALLOWED_ORIGINS` and `ALLOWED_HOSTS` if needed

### Step 4: Update Backend CORS

1. Go back to Render backend service
2. Update environment variables:
   ```
   ALLOWED_HOSTS=ahmad-poultry-backend.onrender.com,<your-netlify-domain>
   CORS_ALLOWED_ORIGINS=https://<your-netlify-domain>
   ```
3. Save changes (service will redeploy)

---

## GitHub Actions CI/CD Setup

### Step 1: Add GitHub Secrets

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:

   **For Frontend:**
   - `NETLIFY_AUTH_TOKEN`: Get from [Netlify User Settings](https://app.netlify.com/user/applications#personal-access-tokens)
   - `NETLIFY_SITE_ID`: Found in Site settings → Site details → Site ID
   - `VITE_API_BASE_URL`: Your Render backend URL

   **For Backend:**
   - `RENDER_DEPLOY_HOOK_URL`: Get from Render service → Settings → Deploy Hook

### Step 2: Enable Workflows

Workflows are already configured in `.github/workflows/`. They will auto-run on:
- Push to `main` branch
- Pull requests to `main` branch

---

## Post-Deployment Checklist

- [ ] Backend is accessible at Render URL
- [ ] Frontend is accessible at Netlify URL
- [ ] Login works with demo credentials
- [ ] Dashboard loads with today's data
- [ ] Can create customers, sales, purchases, payments, expenses
- [ ] Reports generate correctly
- [ ] API docs accessible at `/api/docs/`
- [ ] GitHub Actions workflows passing
- [ ] Auto-deployment works when pushing to `main`

---

## Maintenance

### Update Backend
1. Push changes to `main` branch
2. GitHub Actions will test and trigger Render deployment
3. Monitor deployment in Render dashboard

### Update Frontend
1. Push changes to `main` branch
2. GitHub Actions will build and deploy to Netlify
3. New version live in ~2 minutes

### Database Backups
1. Render Free PostgreSQL includes automatic backups
2. Download manual backup: Render Dashboard → Database → Backup

### Monitoring
- **Backend**: Render provides logs and metrics
- **Frontend**: Netlify provides analytics and deploy logs
- **Uptime**: Consider using [UptimeRobot](https://uptimerobot.com/) (free tier)

---

## Troubleshooting

### Backend 500 Error
- Check Render logs for Python errors
- Verify all environment variables are set
- Ensure migrations ran successfully

### Frontend Can't Connect to Backend
- Check `VITE_API_BASE_URL` in Netlify environment variables
- Verify CORS settings in backend
- Check browser console for errors

### Database Connection Error
- Verify `DATABASE_URL` in backend environment
- Check database is running in Render
- Ensure database and web service are in same region

---

## Free Tier Limitations

### Render Free
- Spins down after 15 min of inactivity
- Takes ~1 min to wake up on first request
- 750 hours/month (sufficient for solo project)

### Netlify Free
- 100 GB bandwidth/month
- 300 build minutes/month
- Instant deploys, no spin-down

**Solution**: First request may be slow as backend wakes up. Consider upgrading to paid tier ($7/mo) for production use.

