"""
Script to seed NYC climate data and travel recommendations
Generates mock data for testing purposes
"""
import math
import random
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.nyc_climate import NYCClimateData
from app.models.travel_recommendation import TravelRecommendation

def generate_climate_data(zip_code: str, target_date: date) -> dict:
    """Generate mock climate data for a specific zip code and date"""
    baseAQI = 45 + (ord(zip_code[0]) % 30)
    
    return {
        "zip_code": zip_code,
        "date": target_date,
        "aqi": baseAQI,
        "pm25": 12.5 + (ord(zip_code[0]) % 10),
        "pm10": 25.0 + (ord(zip_code[0]) % 15),
        "o3": 0.045 + (ord(zip_code[0]) % 20) / 1000,
        "no2": 35 + (ord(zip_code[0]) % 15),
        "co": 0.8 + (ord(zip_code[0]) % 5) / 10,
        "temperature": 20 + (ord(zip_code[0]) % 5),
        "humidity": 60 + (ord(zip_code[0]) % 20),
        "wind_speed": 5 + (ord(zip_code[0]) % 10),
        "wind_direction": 180 + (ord(zip_code[0]) % 180),
        "pressure": 1013 + (ord(zip_code[0]) % 10),
        "visibility": 10 + (ord(zip_code[0]) % 5),
        "uv_index": 4 + (ord(zip_code[0]) % 6),
        "pollen_count": 50 + (ord(zip_code[0]) % 100),
        "asthma_index": 30 + (baseAQI - 30) + (ord(zip_code[0]) % 20)
    }

def generate_travel_recommendation(zip_code: str, target_date: date, day_offset: int) -> dict:
    """Generate mock travel recommendation for a specific zip code and date"""
    # Generate more varied and irregular data
    base_variation = math.sin(day_offset * 0.8) * 15 + math.cos(day_offset * 1.2) * 10
    random_variation = (random.random() - 0.5) * 25
    day_of_week = target_date.weekday()
    weekend_effect = -5 if day_of_week >= 5 else 3
    
    # Comprehensive Health Risk Index (CHRI)
    base_chri = 35 + (ord(zip_code[0]) % 40) + (day_offset * 1.5) + base_variation + random_variation + weekend_effect
    air_quality_factor = 30 + (ord(zip_code[0]) % 35) + (day_offset * 1.2) + (math.sin(day_offset) * 10)
    weather_factor = 25 + (ord(zip_code[1]) % 30 if len(zip_code) > 1 else 20) + (math.cos(day_offset * 0.7) * 8)
    pollen_factor = 20 + (ord(zip_code[2]) % 25 if len(zip_code) > 2 else 15) + (math.sin(day_offset * 1.5) * 6)
    pollution_factor = 15 + (ord(zip_code[3]) % 20 if len(zip_code) > 3 else 10) + (math.cos(day_offset * 1.1) * 5)
    
    # Weighted combination
    comprehensive_health_risk_index = round(
        (air_quality_factor * 0.35) +
        (weather_factor * 0.25) +
        (pollen_factor * 0.20) +
        (pollution_factor * 0.20) +
        base_variation * 0.1
    )
    
    chri = max(0, min(150, comprehensive_health_risk_index))
    
    if chri <= 40:
        level = 'safe'
        risk_score = 15 + (ord(zip_code[0]) % 15) + random.random() * 10
    elif chri <= 70:
        level = 'moderate'
        risk_score = 35 + (ord(zip_code[0]) % 20) + random.random() * 15
    elif chri <= 100:
        level = 'caution'
        risk_score = 55 + (ord(zip_code[0]) % 25) + random.random() * 15
    else:
        level = 'avoid'
        risk_score = 75 + (ord(zip_code[0]) % 20) + random.random() * 10
    
    air_quality_score = max(0, min(100, 100 - air_quality_factor + (random.random() * 15 - 7.5)))
    weather_score = max(0, min(100, 75 + weather_factor * 0.3 + (random.random() * 10 - 5)))
    pollen_score = max(0, min(100, 70 + (ord(zip_code[0]) % 25) + (random.random() * 12 - 6)))
    
    temperature = 18 + (ord(zip_code[0]) % 8) + (math.sin(day_offset * 0.5) * 3) + (random.random() * 4 - 2)
    humidity = 55 + (ord(zip_code[1]) % 25 if len(zip_code) > 1 else 20) + (math.cos(day_offset * 0.6) * 8) + (random.random() * 6 - 3)
    
    date_str = target_date.strftime('%B %d')
    time_options = ['morning', 'afternoon', 'evening', 'early morning']
    final_risk_score = round(risk_score)
    
    # Generate advice based on risk_score instead of CHRI
    if final_risk_score <= 30:
        advice_text = "Excellent conditions for outdoor activities. Perfect day to enjoy fresh air and exercise safely."
    elif final_risk_score <= 50:
        advice_text = "Good conditions for most outdoor activities. Monitor your symptoms and enjoy your day!"
    elif final_risk_score <= 70:
        advice_text = "Moderate risk conditions. Consider limiting prolonged outdoor activities during peak hours. Monitor air quality and carry your inhaler."
    else:
        advice_text = "High risk conditions. Limit outdoor activities, especially during peak hours. Stay indoors when possible and keep your inhaler close."
    
    return {
        "zip_code": zip_code,
        "date": target_date,
        "recommendation_level": level,
        "risk_score": final_risk_score,
        "air_quality_score": round(air_quality_score),
        "weather_score": round(weather_score),
        "pollen_score": round(pollen_score),
        "overall_message": f"Risk assessment for {date_str} in zip code {zip_code} indicates {level} conditions with a risk score of {final_risk_score}/100.",
        "air_quality_message": f"Risk score of {final_risk_score}/100 indicates {'favorable' if level == 'safe' else level} conditions for asthma patients.",
        "weather_message": f"Temperature will be around {temperature:.1f}°C with {humidity:.0f}% humidity.",
        "general_advice": advice_text,
        "best_time_of_day": time_options[day_offset % 4],
        "outdoor_activity_safe": final_risk_score <= 70,
        "exercise_recommendation": "safe" if final_risk_score <= 40 else "moderate" if final_risk_score <= 70 else "avoid"
    }

def seed_nyc_data(zip_codes: list[str] = None, days: int = 7):
    """Seed NYC climate data and travel recommendations for specified zip codes"""
    if zip_codes is None:
        zip_codes = ['10001', '10002', '10003', '10004', '10005', '11201', '10451', '10301', '11101']
    
    db: Session = SessionLocal()
    
    try:
        # Delete existing data first
        db.query(NYCClimateData).delete()
        db.query(TravelRecommendation).delete()
        db.commit()
        print(f"Cleared existing NYC data")
        
        today = date.today()
        
        for zip_code in zip_codes:
            print(f"Seeding data for ZIP code {zip_code}...")
            
            # Generate climate data for today
            climate_data = generate_climate_data(zip_code, today)
            db_climate = NYCClimateData(**climate_data)
            db.add(db_climate)
            
            # Generate travel recommendations for next N days
            for i in range(days):
                target_date = today + timedelta(days=i)
                rec_data = generate_travel_recommendation(zip_code, target_date, i)
                db_rec = TravelRecommendation(**rec_data)
                db.add(db_rec)
            
            print(f"  - Added climate data and {days} days of recommendations")
        
        db.commit()
        print(f"\nSuccessfully seeded data for {len(zip_codes)} ZIP codes with {days} days of forecasts!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    # Seed data for common NYC zip codes
    seed_nyc_data(
        zip_codes=['10001', '10002', '10003', '10004', '10005', '11201', '10451', '10301', '11101'],
        days=7
    )

