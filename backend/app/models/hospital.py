from sqlalchemy import Column, Integer, String, Float, Text
from sqlalchemy.sql import func
from sqlalchemy.types import DateTime
from app.db.database import Base

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    borough = Column(String, nullable=False, index=True)  # Manhattan, Brooklyn, Queens, Bronx, Staten Island
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String, nullable=False)
    zip_code = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    specialty = Column(String, nullable=True)  # Asthma & Allergy, Pulmonology, Emergency Care, etc.
    
    # Additional hospital information
    description = Column(Text, nullable=True)
    website = Column(String, nullable=True)
    emergency_department = Column(String, nullable=True)  # Yes/No
    beds = Column(Integer, nullable=True)
    asthma_specialists = Column(Integer, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

