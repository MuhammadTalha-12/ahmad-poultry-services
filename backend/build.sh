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
python manage.py collectstatic --noinput
echo "✅ Static files collected successfully"

echo ""
echo "========================================="
echo "🎉 Build completed successfully!"
echo "========================================="

