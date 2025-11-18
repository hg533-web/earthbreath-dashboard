from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from pydantic import BaseModel
from app.db.database import get_db
from app.models.gas_data import GasData

router = APIRouter(prefix="/api/data", tags=["data"])

# Pydantic models
class GasDataCreate(BaseModel):
    gas_type: str
    region: str
    date: date
    value: float
    unit: str
    source: Optional[str] = None
    notes: Optional[str] = None

class GasDataResponse(BaseModel):
    id: int
    gas_type: str
    region: str
    date: date
    value: float
    unit: str
    source: Optional[str] = None
    notes: Optional[str] = None
    
    class Config:
        from_attributes = True

@router.post("/gas", response_model=GasDataResponse, status_code=201)
async def create_gas_data(data: GasDataCreate, db: Session = Depends(get_db)):
    """Create new gas data entry"""
    new_data = GasData(**data.dict())
    db.add(new_data)
    db.commit()
    db.refresh(new_data)
    return new_data

@router.get("/gas", response_model=List[GasDataResponse])
async def get_gas_data(
    gas_type: Optional[str] = Query(None, description="Filter by gas type (CO2, CH4, N2O, SF6)"),
    region: Optional[str] = Query(None, description="Filter by region"),
    start_date: Optional[date] = Query(None, description="Start date filter"),
    end_date: Optional[date] = Query(None, description="End date filter"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get gas data with optional filters"""
    query = db.query(GasData)
    
    if gas_type:
        query = query.filter(GasData.gas_type == gas_type.upper())
    if region:
        query = query.filter(GasData.region == region)
    if start_date:
        query = query.filter(GasData.date >= start_date)
    if end_date:
        query = query.filter(GasData.date <= end_date)
    
    data = query.order_by(GasData.date.desc()).offset(skip).limit(limit).all()
    return data

@router.get("/gas/{data_id}", response_model=GasDataResponse)
async def get_gas_data_by_id(data_id: int, db: Session = Depends(get_db)):
    """Get gas data by ID"""
    data = db.query(GasData).filter(GasData.id == data_id).first()
    if not data:
        raise HTTPException(status_code=404, detail="Gas data not found")
    return data

@router.get("/gas/types/list", response_model=List[str])
async def get_gas_types(db: Session = Depends(get_db)):
    """Get list of available gas types"""
    types = db.query(GasData.gas_type).distinct().all()
    return [t[0] for t in types]

@router.get("/gas/regions/list", response_model=List[str])
async def get_regions(
    gas_type: Optional[str] = Query(None, description="Filter regions by gas type"),
    db: Session = Depends(get_db)
):
    """Get list of available regions"""
    query = db.query(GasData.region).distinct()
    if gas_type:
        query = query.filter(GasData.gas_type == gas_type.upper())
    regions = query.all()
    return [r[0] for r in regions]

