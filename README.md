# Better (Flask + React)

This repository contains a small Flask backend and a minimal React frontend used for a coding assessment.

Backend
- Location: `backend`
- Use Python 3.11+ (or your system Python)
- Create a venv, install dependencies, and run:

```powershell
cd backend
python -m venv .venv; .\.venv\Scripts\python -m pip install -r requirements.txt
.\.venv\Scripts\python app.py
```

Run backend tests:

```powershell
cd backend
.\.venv\Scripts\python -m pytest -q
```

Frontend
- Location: `frontend`

```powershell
cd frontend
npm install
npm start
```

The React dev server proxies API requests to the Flask backend at `http://localhost:5000`.
