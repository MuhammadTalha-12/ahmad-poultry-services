#!/usr/bin/env bash
# Startup script for Render - ensures static files exist

echo "==> Checking for static files..."

# Check if staticfiles directory exists and has files
if [ ! -d "staticfiles" ] || [ -z "$(ls -A staticfiles 2>/dev/null)" ]; then
    echo "⚠️  Static files missing, collecting now..."
    python manage.py collectstatic --noinput --clear
    echo "✅ Static files collected on startup"
else
    echo "✅ Static files directory exists"
fi

echo "==> Starting Gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-10000}

