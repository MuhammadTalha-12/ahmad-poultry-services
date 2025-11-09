#!/usr/bin/env bash
# exit on error
set -o errexit

echo "========================================="
echo "🚀 Starting Ahmad Poultry Backend Build"
echo "========================================="

echo ""
echo "📦 Step 1: Installing Python dependencies..."
pip install -r requirements.txt
echo "✅ Dependencies installed successfully"

echo ""
echo "🗄️  Step 2: Running database migrations..."
python manage.py migrate --noinput
echo "✅ Migrations completed successfully"

echo ""
echo "👤 Step 3: Creating superuser..."
python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'Admin@123')
    print('✅ Superuser "admin" created successfully')
else:
    print('ℹ️  Superuser "admin" already exists')
END

echo ""
echo "🌱 Step 4: Loading seed data..."
python manage.py seed_data
echo "✅ Seed data loaded successfully"

echo ""
echo "📁 Step 5: Collecting static files..."
# Create staticfiles directory if it doesn't exist
mkdir -p staticfiles
echo "Directory check: staticfiles directory created/verified"
# Collect static files with verbose output
python manage.py collectstatic --noinput --clear --verbosity 2
echo "✅ Static files collected successfully"
# Verify static files were collected
if [ -d "staticfiles" ] && [ "$(ls -A staticfiles)" ]; then
    echo "✓ Static files directory exists and contains files"
    ls -la staticfiles/ | head -20
else
    echo "⚠️  Warning: Static files directory is empty or doesn't exist"
    exit 1
fi

echo ""
echo "========================================="
echo "🎉 Build completed successfully!"
echo "========================================="

