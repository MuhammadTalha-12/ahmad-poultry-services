#!/usr/bin/env bash
# Startup script for Render - ensures migrations and static files are ready
# Exit on any error
set -e

echo "==> Running database migrations..."
python manage.py migrate --noinput
echo "✅ Migrations completed"

echo "==> Checking for static files..."
# Check if staticfiles directory exists and has files
if [ ! -d "staticfiles" ] || [ -z "$(ls -A staticfiles 2>/dev/null)" ]; then
    echo "⚠️  Static files missing, collecting now..."
    python manage.py collectstatic --noinput --clear
    echo "✅ Static files collected on startup"
else
    echo "✅ Static files directory exists"
fi

echo "==> Creating superuser if not exists..."
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'Admin@123')" 2>/dev/null || echo "Superuser already exists or error occurred"

echo "==> Starting Gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-10000}

