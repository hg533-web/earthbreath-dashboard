from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.db.database import get_db
from app.models.hospital import Hospital

router = APIRouter(prefix="/api/hospitals", tags=["hospitals"])

# Pydantic models
class HospitalCreate(BaseModel):
    name: str
    borough: str
    latitude: float
    longitude: float
    address: str
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    specialty: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    emergency_department: Optional[str] = None
    beds: Optional[int] = None
    asthma_specialists: Optional[int] = None

class HospitalResponse(BaseModel):
    id: int
    name: str
    borough: str
    latitude: float
    longitude: float
    address: str
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    specialty: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    emergency_department: Optional[str] = None
    beds: Optional[int] = None
    asthma_specialists: Optional[int] = None
    
    class Config:
        from_attributes = True

@router.post("/", response_model=HospitalResponse, status_code=201)
async def create_hospital(hospital: HospitalCreate, db: Session = Depends(get_db)):
    """Create a new hospital entry"""
    new_hospital = Hospital(**hospital.dict())
    db.add(new_hospital)
    db.commit()
    db.refresh(new_hospital)
    return new_hospital

@router.get("/", response_model=List[HospitalResponse])
async def get_hospitals(
    borough: Optional[str] = Query(None, description="Filter by borough (Manhattan, Brooklyn, Queens, Bronx, Staten Island)"),
    specialty: Optional[str] = Query(None, description="Filter by specialty"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get hospitals with optional filters"""
    query = db.query(Hospital)
    
    if borough:
        query = query.filter(Hospital.borough == borough)
    if specialty:
        query = query.filter(Hospital.specialty.contains(specialty))
    
    hospitals = query.offset(skip).limit(limit).all()
    return hospitals

@router.get("/{hospital_id}", response_model=HospitalResponse)
async def get_hospital(hospital_id: int, db: Session = Depends(get_db)):
    """Get hospital by ID"""
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hospital

@router.get("/boroughs/list", response_model=List[str])
async def get_boroughs(db: Session = Depends(get_db)):
    """Get list of available boroughs"""
    boroughs = db.query(Hospital.borough).distinct().all()
    return [b[0] for b in boroughs]

@router.get("/specialties/list", response_model=List[str])
async def get_specialties(db: Session = Depends(get_db)):
    """Get list of available specialties"""
    specialties = db.query(Hospital.specialty).filter(Hospital.specialty.isnot(None)).distinct().all()
    return [s[0] for s in specialties if s[0]]

