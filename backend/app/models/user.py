from sqlalchemy import Column, Integer, String, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.types import DateTime
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    
    # Asthma-related information
    has_asthma = Column(String, nullable=True)  # 'yes' or 'no'
    asthma_severity = Column(String, nullable=True)  # 'mild', 'moderate', 'severe'
    trigger_factors = Column(Text, nullable=True)  # JSON string of list
    symptom_frequency = Column(String, nullable=True)  # 'daily', 'weekly', 'monthly', 'rarely'
    medication_usage = Column(String, nullable=True)  # 'daily', 'as-needed', 'emergency-only', 'none'
    asthma_control = Column(String, nullable=True)  # 'well-controlled', 'partially-controlled', 'poorly-controlled'
    
    # Location and hospital information
    zip_code = Column(String, nullable=True)
    selected_hospital = Column(String, nullable=True)
    emergency_contact = Column(String, nullable=True)
    emergency_phone = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

