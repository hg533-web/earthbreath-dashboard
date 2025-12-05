from app.db.database import engine, Base
# Import models to register them with SQLAlchemy
from app.models.user import User
from app.models.gas_data import GasData
from app.models.hospital import Hospital
from app.models.nyc_climate import NYCClimateData
from app.models.travel_recommendation import TravelRecommendation

def init_db():
    """Initialize database - create all tables"""
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully!")

if __name__ == "__main__":
    init_db()





