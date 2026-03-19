# Taskr — Django Task Manager

A full-stack task manager built with Django REST Framework backend and a dark-theme Kanban frontend. **Fully configured for Vercel deployment.**

## Features
- Kanban board (To Do / In Progress / Done)
- Categories with custom colors
- Priority levels: Urgent, High, Medium, Low
- Due dates with overdue detection
- Search & filter by status, priority, category
- Full REST API at `/api/`
- Django Admin at `/admin/`

## Local Development

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Copy env file and fill in values
cp .env.example .env

# 3. Run migrations
python manage.py migrate

# 4. (Optional) Create admin user
python manage.py createsuperuser

# 5. Start server
python manage.py runserver
```

Open http://localhost:8000

---

## Deploy to Vercel

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/taskr.git
git branch -M main
git push -u origin main
```

### Step 2 — Connect to Vercel
1. Go to https://vercel.com → New Project
2. Import your GitHub repo
3. Vercel will auto-detect the `vercel.json`
4. Click **Deploy**

### Step 3 — Set Environment Variables
In Vercel Dashboard → your project → **Settings → Environment Variables**, add:

| Key | Value |
|-----|-------|
| `SECRET_KEY` | A long random string (generate at https://djecrety.ir) |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `.vercel.app` |
| `DATABASE_URL` | Your PostgreSQL URL (see below) |

### Step 4 — Free PostgreSQL with Neon
1. Sign up at https://neon.tech (free)
2. Create a new project
3. Copy the **Connection string** (starts with `postgresql://`)
4. Paste it as the `DATABASE_URL` env var in Vercel

### Step 5 — Redeploy
After setting env vars, go to **Deployments → Redeploy** to apply them.

---

## Project Structure

```
taskmanager/
├── wsgi.py              ← Vercel entrypoint (app = get_wsgi_application())
├── vercel.json          ← Vercel config (functions + rewrites)
├── build_files.sh       ← Build script (collectstatic + migrate)
├── manage.py
├── requirements.txt
├── .env.example
├── .gitignore
├── taskmanager/
│   ├── settings.py      ← Production-ready settings
│   ├── urls.py
│   └── wsgi.py
├── tasks/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── admin.py
├── templates/
│   └── index.html
└── static/
    ├── css/main.css
    └── js/app.js
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/` | List tasks |
| POST | `/api/tasks/` | Create task |
| GET/PUT/DELETE | `/api/tasks/{id}/` | Get/update/delete task |
| PATCH | `/api/tasks/{id}/move/` | Move task to new status |
| GET | `/api/tasks/stats/` | Task statistics |
| GET | `/api/categories/` | List categories |
| POST | `/api/categories/` | Create category |
| PUT/DELETE | `/api/categories/{id}/` | Update/delete category |

### Query params for `/api/tasks/`
- `?status=todo|in_progress|done`
- `?priority=low|medium|high|urgent`
- `?category={id}`
- `?search={query}`
