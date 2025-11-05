# Backend (Flask)

This folder contains a minimal Flask backend that implements Tasks and Comments.

APIs implemented (JSON):

- GET /tasks
- POST /tasks {"title":"...","description":"..."}
- GET /tasks/<task_id>/comments
- POST /tasks/<task_id>/comments {"author":"...","body":"..."}
- PUT /comments/<comment_id> {"author":"...","body":"..."}
- DELETE /comments/<comment_id>

Run locally (Windows PowerShell):

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Run tests:

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pytest -q
```
