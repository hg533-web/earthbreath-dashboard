from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from app.db.database import get_db
from app.models.user import User
import json

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# Pydantic models
class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirmPassword: str
    hasAsthma: str | None = None
    asthmaSeverity: str | None = None
    triggerFactors: list[str] | None = None
    symptomFrequency: str | None = None
    medicationUsage: str | None = None
    asthmaControl: str | None = None
    zipCode: str | None = None
    selectedHospital: str | None = None
    emergencyContact: str | None = None
    emergencyPhone: str | None = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    hasAsthma: str | None
    zipCode: str | None
    selectedHospital: str | None
    
    class Config:
        from_attributes = True

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate passwords match
    if user_data.password != user_data.confirmPassword:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    
    # Convert trigger factors list to JSON string
    trigger_factors_json = None
    if user_data.triggerFactors:
        trigger_factors_json = json.dumps(user_data.triggerFactors)
    
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_password,
        has_asthma=user_data.hasAsthma,
        asthma_severity=user_data.asthmaSeverity,
        trigger_factors=trigger_factors_json,
        symptom_frequency=user_data.symptomFrequency,
        medication_usage=user_data.medicationUsage,
        asthma_control=user_data.asthmaControl,
        zip_code=user_data.zipCode,
        selected_hospital=user_data.selectedHospital,
        emergency_contact=user_data.emergencyContact,
        emergency_phone=user_data.emergencyPhone,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=UserResponse)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    return user





