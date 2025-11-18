from sqlalchemy import Column, Integer, String, Float, Date
from sqlalchemy.sql import func
from sqlalchemy.types import DateTime
from app.db.database import Base

class GasData(Base):
    __tablename__ = "gas_data"

    id = Column(Integer, primary_key=True, index=True)
    gas_type = Column(String, nullable=False, index=True)  # 'CO2', 'CH4', 'N2O', 'SF6'
    region = Column(String, nullable=False, index=True)  # Country or region name
    date = Column(Date, nullable=False, index=True)
    value = Column(Float, nullable=False)  # Gas concentration or emission value
    unit = Column(String, nullable=False)  # Unit of measurement (e.g., 'ppm', 'ppb', 'kt')
    
    # Additional metadata
    source = Column(String, nullable=True)  # Data source
    notes = Column(String, nullable=True)  # Additional notes
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

