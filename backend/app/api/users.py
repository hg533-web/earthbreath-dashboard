from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from app.db.database import get_db
from app.models.user import User
from app.api.auth import UserResponse, user_to_response
import json

router = APIRouter(prefix="/api/users", tags=["users"])

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    hasAsthma: Optional[str] = None
    asthmaSeverity: Optional[str] = None
    triggerFactors: Optional[List[str]] = None
    symptomFrequency: Optional[str] = None
    medicationUsage: Optional[str] = None
    asthmaControl: Optional[str] = None
    zipCode: Optional[str] = None
    selectedHospital: Optional[str] = None
    emergencyContact: Optional[str] = None
    emergencyPhone: Optional[str] = None

@router.get("/", response_model=List[UserResponse])
async def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all users (for admin/testing purposes)"""
    users = db.query(User).offset(skip).limit(limit).all()
    return [user_to_response(user) for user in users]

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user_to_response(user)

@router.get("/by-email/{email}", response_model=UserResponse)
async def get_user_by_email(email: str, db: Session = Depends(get_db)):
    """Get user by email"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user_to_response(user)

@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user_update: UserProfileUpdate, db: Session = Depends(get_db)):
    """Update user profile"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if email is being changed and if it's already taken
    if user_update.email and user_update.email != user.email:
        existing_user = db.query(User).filter(User.email == user_update.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Update fields
    update_data = user_update.model_dump(exclude_unset=True)
    
    if "name" in update_data and update_data["name"] is not None:
        user.name = update_data["name"]
    if "email" in update_data and update_data["email"] is not None:
        user.email = update_data["email"]
    if "hasAsthma" in update_data:
        user.has_asthma = update_data["hasAsthma"]
    if "asthmaSeverity" in update_data:
        user.asthma_severity = update_data["asthmaSeverity"]
    if "triggerFactors" in update_data:
        if update_data["triggerFactors"]:
            user.trigger_factors = json.dumps(update_data["triggerFactors"])
        else:
            user.trigger_factors = None
    if "symptomFrequency" in update_data:
        user.symptom_frequency = update_data["symptomFrequency"]
    if "medicationUsage" in update_data:
        user.medication_usage = update_data["medicationUsage"]
    if "asthmaControl" in update_data:
        user.asthma_control = update_data["asthmaControl"]
    if "zipCode" in update_data:
        user.zip_code = update_data["zipCode"]
    if "selectedHospital" in update_data:
        user.selected_hospital = update_data["selectedHospital"]
    if "emergencyContact" in update_data:
        user.emergency_contact = update_data["emergencyContact"]
    if "emergencyPhone" in update_data:
        user.emergency_phone = update_data["emergencyPhone"]
    
    db.commit()
    db.refresh(user)
    
    return user_to_response(user)





