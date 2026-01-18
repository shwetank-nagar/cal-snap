# cal-snap

CalSnap is a full-stack nutrition tracker. The frontend lets users upload a meal photo, review the nutrition analysis, save the meal, and explore daily summaries and history. The backend provides a FastAPI API with a SQLite database for persistence. The current image analysis endpoint returns a static sample payload, which makes the UI fully testable without external ML services.

## What the app does
- Upload a food photo, run a mock analysis, and view calories/macros.
- Save the analyzed meal to the database with date and meal type.
- See a daily macro summary (calories, protein, carbs, fat).
- Browse the list of meals for a given date.

## Architecture
```mermaid
flowchart LR
  U[User] -->|Browser| FE[React + Vite SPA]
  FE -->|POST /api/analyze (image)| BE[FastAPI API]
  FE -->|POST /api/meals (JSON)| BE
  FE -->|GET /api/meals?date=YYYY-MM-DD| BE
  FE -->|GET /api/summary?date=YYYY-MM-DD| BE
  BE --> DB[(SQLite: meals.db)]
```

### Architecture explanation
- The React SPA is the single UI entry point. It is split into three tabs: Upload, Dashboard, and History.
- Upload sends a multipart image to `/api/analyze`, then sends the resulting nutrition data to `/api/meals` as JSON to persist the meal.
- Dashboard and History query the backend by date to show aggregated macros or per-meal details.
- The FastAPI app uses SQLAlchemy to read/write the `meals` table in a local SQLite database.
- CORS is enabled for the Vite dev origin at `http://localhost:5173` so the frontend can call the API in development.

## Backend
Location: `backend/main.py`

### Core components
- FastAPI app with CORS middleware.
- SQLAlchemy model `MealDB` for the `meals` table.
- Pydantic models `MealCreate` (request) and `MealResponse` (response).

### Data model
`meals` table fields:
- `id` (int, primary key)
- `date` (date)
- `meal_type` (string: breakfast/lunch/dinner/snack)
- `food` (string)
- `calories` (float)
- `protein` (float)
- `carbs` (float)
- `fat` (float)

### API endpoints
- `POST /api/analyze`  
  Accepts multipart file upload; returns a sample analysis payload:
  `{ food, calories, protein, carbs, fat, confidence }`

- `POST /api/meals`  
  Persists a meal in SQLite. Body matches `MealCreate`.

- `GET /api/meals?date=YYYY-MM-DD`  
  Returns all meals for the date (or all meals if no date is provided).

- `GET /api/summary?date=YYYY-MM-DD`  
  Returns macro totals and meal count for the date.

## Frontend
Location: `frontend/`

### Core screens
- `Upload` (`frontend/src/components/Upload.jsx`)
  - Uploads a photo, calls `/api/analyze`, shows nutrition results.
  - Saves a meal via `/api/meals` with selected date and meal type.
- `Dashboard` (`frontend/src/components/Dashboard.jsx`)
  - Fetches daily totals from `/api/summary`.
- `History` (`frontend/src/components/History.jsx`)
  - Fetches meals from `/api/meals` and lists them by date.

### App flow
- `frontend/src/App.jsx` handles tab navigation and renders the current screen.
- All API calls target `http://localhost:8000` (FastAPI dev server).

## Repo layout
```
backend/
  main.py
  requirements.txt
  meals.db
frontend/
  index.html
  package.json
  src/
    App.jsx
    components/
      Upload.jsx
      Dashboard.jsx
      History.jsx
README.md
```

## How to run locally
### Backend
```bash
cd backend
python -m venv .venv
./.venv/Scripts/activate  # Windows PowerShell
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Notes and limitations
- The `/api/analyze` endpoint is a mock; it returns a static response instead of real image analysis.
- The database is a local SQLite file (`backend/meals.db`), suitable for development and demos.
