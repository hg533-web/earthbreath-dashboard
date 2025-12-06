# EarthBreath - a daily, personalized snapshot of the air factors that matters most for respiratory health
Respiratory diseases such as asthma are highly sensitive to environmental fluctuations. A small increases in pollutants like PM2.5 or NO₂ can rapidly worsen symptoms, triggering coughing, wheezing, reduced lung function, or even acute asthma attacks. Thus monitoring environmental data, especially air polluents, can significantly reduce health risks for people with respiratory diseases. While environmental and air-quality data are available across various public websites, this information is scattered, inconsistent, and often presented in complex scientific formats that makes it difficult to interpret. This makes it challenging for users to gain meaningful insights from environmental data or use it to make decisions such as daily outdoor activity planning or travel planning.

EarthBreath Dashboard provides a one-stop, personalized solution that helps users transform environmental data into clear insights and actionable recommendations tailored to their health needs.

# Client and Usecase
EarthBreath serves individuals and organizations who rely on clear and reliable environmental insights to support daily health and activity decisions. Our primary clients include people with respiratory conditions such as asthma, as well as their caregivers. The pilot is running in New York City, with insights and personalized functionalities available on the NYC Climate Health Dashboard page.

A typical use case would be a patient with severe asthma in New York City who creates an account on EarthBreath and receives daily and weekly air pollution details along with personalized travel advice to support daily outdoor activity planning and short-trip planning. Using EarthBreath help client to reduce the risk of acute asthma attacks triggered by environmental conditions in this case.

With additional functionalities on the Global Climate Tracker page, EarthBreath also helps users incorporate global climate information into life decisions such as relocation. Clinics and healthcare providers can benefit from EarthBreath by using it to guide patients in incorporating environmental factors, such as pollution levels, into their daily activity planning. Public health agencies, educators, students, and environmental organizations use the dashboard as an accessible resource for researching and understanding the relationship between climate factors and health.


## Prerequisites
- Node.js ≥ 18 (includes npm)
- Python ≥ 3.10
- SQLite (bundled with Python)

## Quick Start (fresh setup)

Backend (before running this step, ensure go to the folder where this git repo is cloned first):
```bash
conda create -n earthbreath python=3.11 -y
conda activate earthbreath
pip install -r requirements.txt
python -m app.db.init_db
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend (before running this step, ensure go to the folder where this git repo is cloned first):
```bash
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

## Debugging Step
Depending on the system configuration, it is rare but possible for an issue to occur that prevents the database from loading correctly. If this happens, you can follow the steps below for a quick fix to ensure the dashboard continues running smoothly.

lsof -ti tcp:8000 | xargs kill -9 2>/dev/null
python -m app.db.init_db
python -m app.db.seed_nyc_data
conda activate earthbreath

python -m app.db.init_db         
python -m app.db.seed_hospitals
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000


If the above step stil not enable hospital data being populated corrected, consider this quick fix below just for viewing the functionalitiy of the hospital map at the bottom of the NYC Climate Health Dashboard page:

python - <<'PY'
from app.db.database import SessionLocal
from app.models.hospital import Hospital

hospitals = [
    {"name":"Mount Sinai Hospital","borough":"Manhattan","latitude":40.7892,"longitude":-73.9530,"address":"1468 Madison Ave, New York, NY 10029","zip_code":"10029","phone":"212-241-6500","specialty":"Pulmonology"},
    {"name":"NYU Langone - Cobble Hill","borough":"Brooklyn","latitude":40.6863,"longitude":-73.9951,"address":"83 Amity St, Brooklyn, NY 11201","zip_code":"11201","phone":"929-455-5000","specialty":"Emergency Care"},
    {"name":"BronxCare Health System","borough":"Bronx","latitude":40.8429,"longitude":-73.9117,"address":"1650 Grand Concourse, Bronx, NY 10457","zip_code":"10457","phone":"718-590-1800","specialty":"Asthma & Allergy"},
]

db = SessionLocal()
try:
    inserted = 0
    for h in hospitals:
        if db.query(Hospital).filter_by(name=h["name"]).first():
            continue
        db.add(Hospital(**h)); inserted += 1
    db.commit()
    print(f"Inserted {inserted} hospital(s)")
finally:
    db.close()
PY


