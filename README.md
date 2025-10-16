# Binary Search Visualizer

Simple Flask app that visualizes binary search step-by-step.

Files added:
- `app.py` — Flask backend exposing `/` and `/search`.
- `templates/index.html` — Frontend UI.
- `static/script.js` — Client-side animation and AJAX calls.
- `static/style.css` — Styling for boxes and highlights.
- `BSA.py` — Contains `binary_search_steps` generator reused by the backend.

Run locally:

1. Create a virtual environment and install requirements:

   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt

2. Start the app:

   set FLASK_APP=app.py
   set FLASK_ENV=development
   flask run

Open http://127.0.0.1:5000
