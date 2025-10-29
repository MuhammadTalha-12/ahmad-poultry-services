# Automated Data Backup System

## 🎯 Overview

The Ahmad Poultry Services application now includes a comprehensive automated backup system to protect your valuable business data. This system creates backups in both Excel (for human viewing) and JSON (for automated restoration) formats.

## 📋 Backup Contents

Each backup includes complete data from all models:

- **Customers** - All customer information, balances, and status
- **Daily Rates** - Historical cost and sale rates
- **Purchases** - All purchase transactions
- **Sales** - All sales records with customer details
- **Payments** - Payment history for all customers
- **Expenses** - All business expenses

## 🚀 How to Create Backups

### Method 1: Frontend UI (Easiest)

1. Login to the application: https://ahmad-poultry-services.netlify.app
2. Go to the **Dashboard** page
3. Scroll to the **Data Backup** section
4. Click the **"Download Backup"** button
5. Your backup will download as an Excel file with a timestamp

**Benefits:**
- ✅ No technical knowledge required
- ✅ Works from anywhere
- ✅ Instant download
- ✅ Shows database statistics

### Method 2: Django Management Command

**Local Development:**
```bash
cd backend
.\.venv\Scripts\Activate.ps1  # Windows
python manage.py backup_data
```

**Production Server:**
```bash
cd /path/to/backend
source venv/bin/activate  # Linux/Mac
python manage.py backup_data
```

**Custom Output Directory:**
```bash
python manage.py backup_data --output-dir=/path/to/backups
```

**Benefits:**
- ✅ Can be automated with schedulers
- ✅ Creates both Excel and JSON files
- ✅ Can run on server without frontend
- ✅ Detailed console output

### Method 3: API Endpoint

**Using cURL:**
```bash
curl -X POST https://ahmad-poultery-backend.onrender.com/api/backup/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -o backup.xlsx
```

**Using Python:**
```python
import requests

url = "https://ahmad-poultery-backend.onrender.com/api/backup/"
headers = {"Authorization": "Bearer YOUR_ACCESS_TOKEN"}

response = requests.post(url, headers=headers)
with open("backup.xlsx", "wb") as f:
    f.write(response.content)
```

## ⏰ Automated Backup Scheduling

### Windows - Task Scheduler

1. **Create Backup Script (`backup.bat`):**
```batch
@echo off
cd "D:\Ahmad Poultry Services\backend"
call .\.venv\Scripts\Activate.ps1
python manage.py backup_data
echo Backup completed at %date% %time% >> backup_log.txt
```

2. **Open Task Scheduler:**
   - Press `Win + R`, type `taskschd.msc`, press Enter

3. **Create Basic Task:**
   - Click "Create Basic Task"
   - Name: "Ahmad Poultry Backup"
   - Description: "Daily backup of database"
   - Trigger: Daily at 2:00 AM
   - Action: Start a program
   - Program: `C:\Windows\System32\cmd.exe`
   - Arguments: `/c "D:\Ahmad Poultry Services\backend\backup.bat"`

4. **Advanced Settings:**
   - Run whether user is logged on or not
   - Run with highest privileges
   - Configure for: Windows 10

### Linux/Mac - Cron Job

1. **Create Backup Script (`backup.sh`):**
```bash
#!/bin/bash
cd /path/to/backend
source venv/bin/activate
python manage.py backup_data
echo "Backup completed at $(date)" >> backup_log.txt
```

2. **Make Script Executable:**
```bash
chmod +x backup.sh
```

3. **Edit Crontab:**
```bash
crontab -e
```

4. **Add Cron Job:**
```bash
# Daily backup at 2:00 AM
0 2 * * * /path/to/backend/backup.sh

# Every 6 hours
0 */6 * * * /path/to/backend/backup.sh

# Every Monday at 3:00 AM
0 3 * * 1 /path/to/backend/backup.sh

# First day of every month at 1:00 AM
0 1 1 * * /path/to/backend/backup.sh
```

### Production (Render.com)

For the deployed backend on Render:

1. **Option A - Render Cron Jobs (Paid Plans):**
   - Go to Render Dashboard
   - Create a new Cron Job
   - Command: `python manage.py backup_data`
   - Schedule: `0 2 * * *` (Daily at 2 AM)

2. **Option B - External Scheduler:**
   - Use a service like [cron-job.org](https://cron-job.org)
   - Create a job that calls your backup API endpoint
   - Set authentication headers
   - Schedule as needed

3. **Option C - GitHub Actions:**

Create `.github/workflows/backup.yml`:

```yaml
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Backup
        run: |
          curl -X POST ${{ secrets.BACKEND_URL }}/api/backup/ \
            -H "Authorization: Bearer ${{ secrets.API_TOKEN }}" \
            -o backup_$(date +%Y%m%d_%H%M%S).xlsx
      
      - name: Upload to Artifacts
        uses: actions/upload-artifact@v3
        with:
          name: database-backup
          path: backup_*.xlsx
          retention-days: 30
```

## 📊 Backup File Format

### Excel File Structure

The Excel file contains multiple sheets:

1. **Backup Summary** (First Sheet)
   - Backup date and time
   - Record counts for each model
   - Notes and instructions

2. **Customers**
   - All customer data
   - Running balances calculated at backup time

3. **Daily Rates**
   - Historical rate data

4. **Purchases**
   - All purchase transactions
   - Calculated total costs

5. **Sales**
   - All sales with customer names
   - Calculated amounts, borrows, and profits

6. **Payments**
   - All payment records with customer names
   - Payment methods

7. **Expenses**
   - All expenses by category

**Features:**
- ✅ Professional styling with colored headers
- ✅ Auto-adjusted column widths
- ✅ Human-readable format
- ✅ Can be opened in Excel, Google Sheets, etc.

### JSON File Structure

```json
{
  "backup_timestamp": "20251029_143022",
  "backup_datetime": "2025-10-29T14:30:22.123456+00:00",
  "data": {
    "customers": [...],
    "daily_rates": [...],
    "purchases": [...],
    "sales": [...],
    "payments": [...],
    "expenses": [...]
  },
  "counts": {
    "customers": 26,
    "sales": 150,
    ...
  }
}
```

**Features:**
- ✅ Complete database structure
- ✅ Preserves all relationships
- ✅ Can be used for automated restoration
- ✅ Machine-readable format

## 🔄 Data Restoration

### From Excel (Manual)
- Open Excel file
- Review and manually re-enter data if needed
- Useful for spot-checking specific records

### From JSON (Automated)

**⚠️ Warning:** This will overwrite existing data. Use with caution!

```bash
cd backend
python manage.py loaddata backups/ahmad_poultry_backup_YYYYMMDD_HHMMSS.json
```

**Better Approach - Selective Restoration:**

```python
# Create a custom management command for safe restoration
import json
from django.core.management.base import BaseCommand
from sales.models import Customer, Sale, Purchase, Payment, Expense

class Command(BaseCommand):
    def handle(self, *args, **options):
        with open('backup.json', 'r') as f:
            data = json.load(f)
        
        # Restore only specific models or records
        # Add your custom restoration logic here
```

## 📅 Backup Retention Strategy

### Recommended Schedule

1. **Daily Backups** - Keep for 7 days
   ```bash
   0 2 * * * /path/to/backup.sh
   ```

2. **Weekly Backups** - Keep for 4 weeks
   ```bash
   0 3 * * 0 /path/to/backup.sh && cp backup.xlsx weekly_backup_$(date +%Y%m%d).xlsx
   ```

3. **Monthly Backups** - Keep for 12 months
   ```bash
   0 4 1 * * /path/to/backup.sh && cp backup.xlsx monthly_backup_$(date +%Y%m).xlsx
   ```

### Automatic Cleanup Script

**cleanup_old_backups.sh:**
```bash
#!/bin/bash
cd /path/to/backups

# Delete backups older than 7 days (except weekly and monthly)
find . -name "ahmad_poultry_backup_*.xlsx" -mtime +7 ! -name "weekly_*" ! -name "monthly_*" -delete

# Delete weekly backups older than 28 days
find . -name "weekly_backup_*.xlsx" -mtime +28 -delete

# Delete monthly backups older than 365 days
find . -name "monthly_backup_*.xlsx" -mtime +365 -delete

echo "Cleanup completed at $(date)"
```

**Schedule cleanup:**
```bash
# Run cleanup daily at 3:00 AM
0 3 * * * /path/to/cleanup_old_backups.sh
```

## 🔒 Security Best Practices

1. **Protect Backup Files:**
   ```bash
   chmod 600 backups/*.xlsx  # Read/write for owner only
   chmod 600 backups/*.json
   ```

2. **Never Commit Backups to Git:**
   - Backups are already gitignored
   - Double-check `.gitignore` includes `backups/`

3. **Encrypt Sensitive Backups:**
   ```bash
   # Using GPG
   gpg --encrypt --recipient your@email.com backup.xlsx
   
   # Using 7-Zip with password
   7z a -p backup.7z backup.xlsx
   ```

4. **Store Offsite:**
   - Upload to Google Drive (encrypted)
   - Use Dropbox with encryption
   - Store on external drive in different location
   - Use cloud storage with versioning

5. **Access Control:**
   - Only admin users can create backups via API
   - Restrict access to backup directory on server
   - Use strong passwords for encrypted backups

## ☁️ Cloud Backup Solutions

### Google Drive Sync

**Install rclone:**
```bash
# Linux
curl https://rclone.org/install.sh | sudo bash

# Windows (PowerShell)
choco install rclone
```

**Configure Google Drive:**
```bash
rclone config
# Follow prompts to add Google Drive
```

**Sync backups:**
```bash
rclone copy backups/ gdrive:AhmadPoultryBackups/
```

### Dropbox Sync

```bash
rclone copy backups/ dropbox:AhmadPoultryBackups/
```

### Automated Cloud Backup Script

**cloud_backup.sh:**
```bash
#!/bin/bash
cd /path/to/backend

# Create backup
python manage.py backup_data

# Upload to multiple cloud services
rclone copy backups/ gdrive:AhmadPoultryBackups/
rclone copy backups/ dropbox:AhmadPoultryBackups/

# Send notification
echo "Backup uploaded to cloud at $(date)" | mail -s "Backup Success" your@email.com
```

## 📧 Backup Notifications

### Email Notifications (Linux)

**Install mail utility:**
```bash
sudo apt install mailutils
```

**Add to backup script:**
```bash
#!/bin/bash
python manage.py backup_data

if [ $? -eq 0 ]; then
    echo "Backup completed successfully at $(date)" | mail -s "Backup Success" your@email.com
else
    echo "Backup failed at $(date)" | mail -s "Backup FAILED" your@email.com
fi
```

## 🧪 Testing Your Backup System

### Test Manual Backup
```bash
cd backend
python manage.py backup_data
ls -lh backups/  # Verify files created
```

### Test Scheduled Backup

**Windows:**
```bash
# Run task manually
schtasks /run /tn "Ahmad Poultry Backup"
```

**Linux:**
```bash
# Test cron job
./backup.sh
```

### Verify Backup Contents

1. Open Excel file
2. Check all sheets are present
3. Verify data looks correct
4. Check record counts match dashboard

## 📞 Troubleshooting

### Backup Command Fails

**Error:** `ModuleNotFoundError: No module named 'openpyxl'`

**Solution:**
```bash
cd backend
pip install openpyxl
# Or
pip install -r requirements.txt
```

### Permission Denied

**Error:** `PermissionError: [Errno 13] Permission denied: 'backups'`

**Solution:**
```bash
mkdir -p backups
chmod 755 backups
```

### API Returns 403 Forbidden

**Cause:** Only admin users can access backup endpoints

**Solution:** Login with admin account (`admin` / `Admin@123`)

### Backup File Empty or Corrupted

**Solutions:**
1. Check database has data
2. Verify sufficient disk space
3. Check file permissions
4. Try creating backup again

## 🎯 Quick Reference

### Create Backup (Local)
```bash
cd backend && python manage.py backup_data
```

### Download via UI
Dashboard → Data Backup → Download Backup

### Schedule Daily Backup (Windows)
```batch
schtasks /create /tn "Ahmad Poultry Backup" /tr "cmd /c D:\path\to\backup.bat" /sc daily /st 02:00
```

### Schedule Daily Backup (Linux)
```bash
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

### View Backup Files
```bash
ls -lh backend/backups/
```

---

## 🎉 Summary

You now have a complete backup system that:

- ✅ Creates backups in Excel and JSON formats
- ✅ Can be triggered from UI, command line, or API
- ✅ Supports automated scheduling
- ✅ Includes all database tables
- ✅ Has professional formatting
- ✅ Provides security through admin-only access
- ✅ Supports cloud storage integration
- ✅ Includes retention and cleanup strategies

**Your data is now safe!** 🔒

---

**Last Updated:** October 29, 2025  
**Version:** 1.0

