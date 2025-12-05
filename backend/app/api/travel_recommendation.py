from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, timedelta
from pydantic import BaseModel
from app.db.database import get_db
from app.models.travel_recommendation import TravelRecommendation
from app.models.user import User
from app.db.seed_nyc_data import generate_travel_recommendation
from app.services.travel_recommendation_service import TravelRecommendationService

router = APIRouter(prefix="/api/nyc/travel", tags=["nyc-travel"])

# Initialize service
travel_service = TravelRecommendationService()

# Pydantic models
class TravelRecommendationCreate(BaseModel):
    zip_code: str
    date: date
    recommendation_level: str
    risk_score: float
    air_quality_score: Optional[float] = None
    weather_score: Optional[float] = None
    pollen_score: Optional[float] = None
    overall_message: Optional[str] = None
    air_quality_message: Optional[str] = None
    weather_message: Optional[str] = None
    pollen_message: Optional[str] = None
    general_advice: Optional[str] = None
    best_time_of_day: Optional[str] = None
    outdoor_activity_safe: bool = True
    exercise_recommendation: Optional[str] = None

class TravelRecommendationResponse(BaseModel):
    id: int
    zip_code: str
    date: date
    recommendation_level: str
    risk_score: float
    air_quality_score: Optional[float] = None
    weather_score: Optional[float] = None
    pollen_score: Optional[float] = None
    overall_message: Optional[str] = None
    air_quality_message: Optional[str] = None
    weather_message: Optional[str] = None
    pollen_message: Optional[str] = None
    general_advice: Optional[str] = None
    best_time_of_day: Optional[str] = None
    outdoor_activity_safe: bool
    exercise_recommendation: Optional[str] = None
    
    class Config:
        from_attributes = True

@router.post("/", response_model=TravelRecommendationResponse, status_code=201)
async def create_travel_recommendation(data: TravelRecommendationCreate, db: Session = Depends(get_db)):
    """Create new travel recommendation entry"""
    new_rec = TravelRecommendation(**data.dict())
    db.add(new_rec)
    db.commit()
    db.refresh(new_rec)
    return new_rec

@router.get("/", response_model=List[TravelRecommendationResponse])
async def get_travel_recommendations(
    zip_code: Optional[str] = Query(None, description="Filter by ZIP code"),
    start_date: Optional[date] = Query(None, description="Start date filter"),
    end_date: Optional[date] = Query(None, description="End date filter"),
    days: Optional[int] = Query(None, description="Number of days from today"),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get travel recommendations with optional filters"""
    query = db.query(TravelRecommendation)
    
    if zip_code:
        query = query.filter(TravelRecommendation.zip_code == zip_code)
    if start_date:
        query = query.filter(TravelRecommendation.date >= start_date)
    if end_date:
        query = query.filter(TravelRecommendation.date <= end_date)
    if days:
        from datetime import date, timedelta
        today = date.today()
        future_date = today + timedelta(days=days - 1)
        query = query.filter(
            TravelRecommendation.date >= today,
            TravelRecommendation.date <= future_date
        )
    
    data = query.order_by(TravelRecommendation.date.asc()).limit(limit).all()
    return data

@router.get("/today", response_model=List[TravelRecommendationResponse])
async def get_today_recommendations(
    zip_code: str = Query(..., description="ZIP code to get today's recommendations for"),
    user_id: Optional[int] = Query(None, description="Optional user ID for personalized recommendations"),
    db: Session = Depends(get_db)
):
    """Get today's travel recommendations for a specific ZIP code. Generates data if not found. Supports personalization."""
    today = date.today()
    
    # Try to get user for personalization
    user = None
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
    
    # Check if we have existing data
    data = db.query(TravelRecommendation)\
        .filter(
            TravelRecommendation.zip_code == zip_code,
            TravelRecommendation.date == today
        )\
        .all()
    
    # If no data exists for today, or if we need personalized data, generate it
    if not data or user:
        # Use new service for personalized recommendations if user is provided
        if user:
            rec_data = await travel_service.generate_travel_recommendation(
                zip_code, today, 0, user=user, use_prediction=True
            )
        else:
            rec_data = generate_travel_recommendation(zip_code, today, 0)
        
        # If we have existing data but need to personalize, update it
        if data and user:
            existing_rec = data[0]
            # Update with personalized risk_score
            existing_rec.risk_score = rec_data['risk_score']
            existing_rec.recommendation_level = rec_data['recommendation_level']
            existing_rec.general_advice = rec_data['general_advice']
            existing_rec.overall_message = rec_data['overall_message']
            db.commit()
            db.refresh(existing_rec)
            return [existing_rec]
        elif not data:
            # Create new record
            new_rec = TravelRecommendation(**rec_data)
            db.add(new_rec)
            db.commit()
            db.refresh(new_rec)
            return [new_rec]
    
    return data

@router.get("/forecast", response_model=List[TravelRecommendationResponse])
async def get_forecast_recommendations(
    zip_code: str = Query(..., description="ZIP code to get forecast for"),
    days: int = Query(7, ge=1, le=30, description="Number of days to forecast"),
    user_id: Optional[int] = Query(None, description="Optional user ID for personalized recommendations"),
    db: Session = Depends(get_db)
):
    """
    Get forecast travel recommendations for a specific ZIP code. 
    Generates data if not found. Supports personalization based on historical data predictions.
    """
    today = date.today()
    future_date = today + timedelta(days=days - 1)
    
    # Try to get user for personalization
    user = None
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
    
    # Get existing data
    existing_data = db.query(TravelRecommendation)\
        .filter(
            TravelRecommendation.zip_code == zip_code,
            TravelRecommendation.date >= today,
            TravelRecommendation.date <= future_date
        )\
        .order_by(TravelRecommendation.date.asc())\
        .all()
    
    # If we have all the data we need and no personalization, return it
    existing_dates = {rec.date for rec in existing_data}
    required_dates = {today + timedelta(days=i) for i in range(days)}
    missing_dates = required_dates - existing_dates
    
    # Generate missing data or regenerate for personalization
    if missing_dates or user:
        # Use new service for personalized recommendations
        for target_date in sorted(required_dates):
            day_offset = (target_date - today).days
            
            # Check if we need to generate/update this date
            needs_generation = target_date in missing_dates
            needs_personalization = user and target_date in existing_dates
            
            if needs_generation or needs_personalization:
                # Use new service with prediction (from database) and personalization
                rec_data = await travel_service.generate_travel_recommendation(
                    zip_code, target_date, day_offset, user=user, use_prediction=True
                )
                
                if needs_generation:
                    # Create new record
                    new_rec = TravelRecommendation(**rec_data)
                    db.add(new_rec)
                elif needs_personalization:
                    # Update existing record with personalized data
                    existing_rec = next(rec for rec in existing_data if rec.date == target_date)
                    existing_rec.risk_score = rec_data['risk_score']
                    existing_rec.recommendation_level = rec_data['recommendation_level']
                    existing_rec.general_advice = rec_data['general_advice']
                    existing_rec.overall_message = rec_data['overall_message']
                    existing_rec.air_quality_message = rec_data['air_quality_message']
                    existing_rec.weather_message = rec_data['weather_message']
        
        db.commit()
        
        # Fetch all data again (including newly generated/updated)
        data = db.query(TravelRecommendation)\
            .filter(
                TravelRecommendation.zip_code == zip_code,
                TravelRecommendation.date >= today,
                TravelRecommendation.date <= future_date
            )\
            .order_by(TravelRecommendation.date.asc())\
            .all()
        return data
    
    return existing_data

