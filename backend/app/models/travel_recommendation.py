from sqlalchemy import Column, Integer, String, Float, Date, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.types import DateTime
from app.db.database import Base

class TravelRecommendation(Base):
    __tablename__ = "travel_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    zip_code = Column(String, nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    
    # Recommendation Details
    recommendation_level = Column(String, nullable=False)  # safe, moderate, caution, avoid
    risk_score = Column(Float, nullable=False)  # 0-100
    
    # Component Scores
    air_quality_score = Column(Float, nullable=True)  # CHRI score
    weather_score = Column(Float, nullable=True)
    pollen_score = Column(Float, nullable=True)
    
    # Messages and Advice
    overall_message = Column(Text, nullable=True)
    air_quality_message = Column(Text, nullable=True)
    weather_message = Column(Text, nullable=True)
    pollen_message = Column(Text, nullable=True)
    general_advice = Column(Text, nullable=True)
    best_time_of_day = Column(String, nullable=True)
    
    # Recommendations
    outdoor_activity_safe = Column(Boolean, nullable=False, default=True)
    exercise_recommendation = Column(String, nullable=True)  # safe, moderate, avoid
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

