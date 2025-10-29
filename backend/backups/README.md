# Backups Directory

This directory stores automated backups of the Ahmad Poultry Services database.

## Backup Files

Backup files are generated with timestamps in the format: `ahmad_poultry_backup_YYYYMMDD_HHMMSS`

### File Types

1. **Excel Files (`.xlsx`)** - Human-readable backup
   - Contains separate sheets for each model (Customers, Sales, Purchases, etc.)
   - Includes a Summary sheet with backup statistics
   - Perfect for viewing, analyzing, or manual data recovery

2. **JSON Files (`.json`)** - Machine-readable backup
   - Contains complete database structure
   - Used for automated data restoration
   - Preserves all relationships and metadata

## How to Create a Backup

### Method 1: Django Management Command (Recommended)
```bash
cd backend
python manage.py backup_data
```

### Method 2: Via API (Admin Only)
Make a POST request to `/api/backup/` endpoint with admin authentication.

### Method 3: Via Frontend UI
Click the "Download Backup" button on the Dashboard page (admin only).

## Automatic Backups

### Windows (Task Scheduler)
See `BACKUP_AUTOMATION.md` for detailed instructions.

### Linux/Mac (Cron Job)
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/backend && /path/to/python manage.py backup_data
```

## Backup Retention

- Keep at least 7 daily backups
- Keep at least 4 weekly backups (monthly)
- Backup before major updates or deployments
- Consider cloud storage for critical backups

## Data Restoration

For data restoration from JSON backup:
```bash
cd backend
python manage.py loaddata backups/ahmad_poultry_backup_YYYYMMDD_HHMMSS.json
```

## Security

- ⚠️ Backup files contain sensitive business data
- Keep this directory secure and private
- Never commit backup files to git (they're gitignored)
- Store backups in a secure location
- Consider encrypting backups for sensitive data

