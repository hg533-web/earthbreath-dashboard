# EarthBreath - Climate & Health Monitoring Dashboard

Unified global + NYC asthma-focused dashboard (React/Vite + FastAPI/SQLite).

## Prerequisites
- Node.js ≥ 18 (includes npm)
- Python ≥ 3.10
- SQLite (bundled with Python)

## Quick Start (fresh setup)

Backend (new terminal):
```bash
cd /Users/susi/Documents/Cornell/25Fall/SYSEN5151/project/earthbreath-dashboard/backend
conda create -n earthbreath python=3.11 -y
conda activate earthbreath
pip install -r requirements.txt
python -m app.db.init_db
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend (new terminal):
```bash
cd /Users/susi/Documents/Cornell/25Fall/SYSEN5151/project/earthbreath-dashboard/frontend
export VITE_API_BASE_URL="http://localhost:8000"
npm install
npm run dev -- --host --port 5173
```
Open `http://localhost:5173` (or the LAN host/port shown) and hard-refresh.

Optional AI token (Hugging Face) before starting backend:
```bash
export HF_TOKEN="your_huggingface_token"
```
API docs: http://localhost:8000/docs

## Project Structure
```
earthbreath-dashboard/
├── frontend/          # React + Vite + TS
└── backend/           # FastAPI + SQLite
```

## Features (snapshot of this commit)
- Global: interactive globe for 100 cities, AI insights (summary, forecast, extremes, population impact), CO₂/temperature/AQI/sea level highlights.
- NYC: local climate and travel recommendations, hospitals map/list.
- Auth/profile: signup/login, asthma questionnaire profile.

## API (high level)
- Auth: `POST /api/auth/signup`, `POST /api/auth/login`
- Users: `GET /api/users/{id}`, `PATCH /api/users/{id}`
- Gas data: `GET/POST /api/data/gas`, `GET /api/data/gas/types/list`, `GET /api/data/gas/regions/list`
- Hospitals: list/detail, boroughs/specialties lists
- NYC climate: `GET /api/nyc/climate`, `GET /api/nyc/climate/latest`
- NYC travel: `GET /api/nyc/travel/forecast`, `GET /api/nyc/travel/today`
- AI: `POST /api/ai/summary`, `POST /api/ai/dashboard-insights`, `GET /api/ai/health`

## Environment Notes
- Frontend must set `VITE_API_BASE_URL` (e.g., `http://localhost:8000`).
- Optional: `HF_TOKEN` for LLM summaries (falls back to templates without it).
- CORS allows localhost dev by default.
