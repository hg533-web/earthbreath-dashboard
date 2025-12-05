from sqlalchemy import Column, Integer, String, Float, Date
from sqlalchemy.sql import func
from sqlalchemy.types import DateTime
from app.db.database import Base

class NYCClimateData(Base):
    __tablename__ = "nyc_climate_data"

    id = Column(Integer, primary_key=True, index=True)
    zip_code = Column(String, nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    
    # Air Quality Metrics
    aqi = Column(Float, nullable=True)
    pm25 = Column(Float, nullable=True)
    pm10 = Column(Float, nullable=True)
    o3 = Column(Float, nullable=True)
    no2 = Column(Float, nullable=True)
    co = Column(Float, nullable=True)
    
    # Weather Metrics
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    wind_speed = Column(Float, nullable=True)
    wind_direction = Column(Float, nullable=True)
    pressure = Column(Float, nullable=True)
    visibility = Column(Float, nullable=True)
    uv_index = Column(Float, nullable=True)
    
    # Additional Indicators
    pollen_count = Column(Integer, nullable=True)
    asthma_index = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

