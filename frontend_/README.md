# Frontend (React)

This is a minimal React app that talks to the Flask backend (expects it on http://localhost:5000).

Run locally (PowerShell):

```powershell
cd frontend
npm install
npm start
```

The dev server uses a proxy (configured in `package.json`) to forward /tasks and /comments requests to the backend.
