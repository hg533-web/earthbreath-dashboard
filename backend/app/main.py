from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, users, data, hospitals, nyc_climate, travel_recommendation, ai_summary

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





