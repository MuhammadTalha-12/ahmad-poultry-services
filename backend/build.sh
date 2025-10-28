#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Create superuser automatically (only if doesn't exist)
python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'Admin@123')
    print('Superuser created successfully')
else:
    print('Superuser already exists')
END

# Load seed data (sample customers and transactions)
python manage.py seed_data

# Collect static files
python manage.py collectstatic --noinput

echo "Build completed successfully!"

