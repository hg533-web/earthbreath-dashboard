from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, users, data, hospitals, nyc_climate, travel_recommendation, ai_summary
from app.db.init_db import init_db
from app.db.database import SessionLocal
from app.db.seed_nyc_data import seed_nyc_data
from app.db.seed_hospitals import seed_hospitals
from app.models.nyc_climate import NYCClimateData
from app.models.travel_recommendation import TravelRecommendation
from app.models.hospital import Hospital

app = FastAPI(
    title="EarthBreath API",
    description="Climate and Health Monitoring Dashboard API",
    version="1.0.0"
)

# CORS middleware - allow frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(data.router)
app.include_router(hospitals.router)
app.include_router(nyc_climate.router)
app.include_router(travel_recommendation.router)
app.include_router(ai_summary.router)

def seed_nyc_if_empty():
    """Seed NYC climate/travel data only when empty."""
    db = SessionLocal()
    try:
        climate_count = db.query(NYCClimateData).count()
        travel_count = db.query(TravelRecommendation).count()
    finally:
        db.close()
    if climate_count == 0 or travel_count == 0:
        seed_nyc_data()


def seed_hospitals_if_empty():
    """Seed sample hospitals; skips existing by name inside the seed script."""
    db = SessionLocal()
    try:
        count = db.query(Hospital).count()
    finally:
        db.close()
    if count == 0:
        seed_hospitals()


@app.on_event("startup")
def startup_seed():
    init_db()
    seed_nyc_if_empty()
    seed_hospitals_if_empty()

@app.get("/")
async def root():
    return {
        "message": "EarthBreath API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}



