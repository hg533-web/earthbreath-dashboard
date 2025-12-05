from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel
from app.db.database import get_db
from app.models.nyc_climate import NYCClimateData
from app.db.seed_nyc_data import generate_climate_data

router = APIRouter(prefix="/api/nyc/climate", tags=["nyc-climate"])

# Pydantic models
class NYCClimateDataCreate(BaseModel):
    zip_code: str
    date: date
    aqi: Optional[float] = None
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    o3: Optional[float] = None
    no2: Optional[float] = None
    co: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    wind_speed: Optional[float] = None
    wind_direction: Optional[float] = None
    pressure: Optional[float] = None
    visibility: Optional[float] = None
    uv_index: Optional[float] = None
    pollen_count: Optional[int] = None
    asthma_index: Optional[float] = None

class NYCClimateDataResponse(BaseModel):
    id: int
    zip_code: str
    date: date
    aqi: Optional[float] = None
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    o3: Optional[float] = None
    no2: Optional[float] = None
    co: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    wind_speed: Optional[float] = None
    wind_direction: Optional[float] = None
    pressure: Optional[float] = None
    visibility: Optional[float] = None
    uv_index: Optional[float] = None
    pollen_count: Optional[int] = None
    asthma_index: Optional[float] = None
    
    class Config:
        from_attributes = True

@router.post("/", response_model=NYCClimateDataResponse, status_code=201)
async def create_climate_data(data: NYCClimateDataCreate, db: Session = Depends(get_db)):
    """Create new NYC climate data entry"""
    new_data = NYCClimateData(**data.dict())
    db.add(new_data)
    db.commit()
    db.refresh(new_data)
    return new_data

@router.get("/", response_model=List[NYCClimateDataResponse])
async def get_climate_data(
    zip_code: Optional[str] = Query(None, description="Filter by ZIP code"),
    start_date: Optional[date] = Query(None, description="Start date filter"),
    end_date: Optional[date] = Query(None, description="End date filter"),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get NYC climate data with optional filters"""
    query = db.query(NYCClimateData)
    
    if zip_code:
        query = query.filter(NYCClimateData.zip_code == zip_code)
    if start_date:
        query = query.filter(NYCClimateData.date >= start_date)
    if end_date:
        query = query.filter(NYCClimateData.date <= end_date)
    
    data = query.order_by(NYCClimateData.date.desc()).limit(limit).all()
    return data

@router.get("/latest", response_model=NYCClimateDataResponse)
async def get_latest_climate_data(
    zip_code: str = Query(..., description="ZIP code to get latest data for"),
    db: Session = Depends(get_db)
):
    """Get latest climate data for a specific ZIP code. If not found, generates and saves new data."""
    # Check if data exists
    data = db.query(NYCClimateData)\
        .filter(NYCClimateData.zip_code == zip_code)\
        .order_by(NYCClimateData.date.desc())\
        .first()
    
    # If data doesn't exist, generate it on the fly
    if not data:
        today = date.today()
        climate_data_dict = generate_climate_data(zip_code, today)
        new_data = NYCClimateData(**climate_data_dict)
        db.add(new_data)
        db.commit()
        db.refresh(new_data)
        return new_data
    
    return data

@router.get("/zipcodes", response_model=List[str])
async def get_zipcodes(db: Session = Depends(get_db)):
    """Get list of available ZIP codes"""
    zipcodes = db.query(NYCClimateData.zip_code).distinct().all()
    return [z[0] for z in zipcodes]

