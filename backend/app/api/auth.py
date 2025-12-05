from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import bcrypt
from app.db.database import get_db
from app.models.user import User
import json

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Password hashing using bcrypt directly
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt"""
    try:
        # Ensure password is not longer than 72 bytes (bcrypt limitation)
        password_bytes = password.encode('utf-8')
        if len(password_bytes) > 72:
            password = password_bytes[:72].decode('utf-8', errors='ignore')
        
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    except Exception as e:
        print(f"Password hashing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password hashing failed: {str(e)}"
        )

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
    
    class Config:
        from_attributes = True

def user_to_response(user: User) -> UserResponse:
    """Convert User model to UserResponse"""
    trigger_factors_list = None
    if user.trigger_factors:
        try:
            trigger_factors_list = json.loads(user.trigger_factors)
        except:
            trigger_factors_list = None
    
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        hasAsthma=user.has_asthma,
        asthmaSeverity=user.asthma_severity,
        triggerFactors=trigger_factors_list,
        symptomFrequency=user.symptom_frequency,
        medicationUsage=user.medication_usage,
        asthmaControl=user.asthma_control,
        zipCode=user.zip_code,
        selectedHospital=user.selected_hospital,
        emergencyContact=user.emergency_contact,
        emergencyPhone=user.emergency_phone,
    )

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    try:
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
        
        return user_to_response(new_user)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Signup error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=UserResponse)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    return user_to_response(user)





