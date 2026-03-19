import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'taskmanager.settings')

app = get_wsgi_application()  # must be named 'app' for Vercel
