"""
Travel Recommendation Service
Generates travel recommendations using prediction service and personalized risk calculation
"""
import math
import random
import logging
from typing import Dict, Any, Optional
from datetime import date
from app.services.climate_data_service import ClimateDataService
from app.services.personalized_risk import PersonalizedRiskCalculator
from app.models.user import User
from app.db.seed_nyc_data import generate_climate_data

logger = logging.getLogger(__name__)

class TravelRecommendationService:
    """Service for generating travel recommendations with predictions and personalization"""
    
    def __init__(self):
        self.climate_service = ClimateDataService()
        self.risk_calculator = PersonalizedRiskCalculator()
    
    async def generate_travel_recommendation(
        self,
        zip_code: str,
        target_date: date,
        day_offset: int,
        user: Optional[User] = None,
        use_prediction: bool = True  # Enabled - uses database historical data
    ) -> dict:
        """
        Generate travel recommendation using prediction data and personalized risk score
        
        Args:
            zip_code: ZIP code
            target_date: Target date for recommendation
            day_offset: Days from today
            user: Optional user for personalization
            use_prediction: Whether to use historical data-based prediction
        
        Returns:
            Travel recommendation dictionary
        """
        # Get climate data (with prediction for future dates)
        climate_data = await self.climate_service.get_nyc_climate_data_with_prediction(
            zip_code,
            target_date,
            use_prediction=use_prediction
        )
        
        # Calculate base risk score
        base_risk_score = self._calculate_base_risk_score(climate_data, day_offset, target_date)
        
        # Apply personalization if user is provided
        if user:
            personalized_risk_score = self.risk_calculator.calculate_personalized_risk_score(
                base_risk_score,
                user,
                climate_data
            )
            logger.info(f"Personalized risk score for user {user.id}: {base_risk_score} -> {personalized_risk_score}")
        else:
            personalized_risk_score = base_risk_score
        
        # Determine recommendation level based on personalized risk
        level, advice_text = self._get_recommendation_level(personalized_risk_score)
        
        # Calculate other scores (for display purposes)
        air_quality_score = max(0, min(100, 100 - (climate_data.get('aqi', 50) / 5)))
        weather_score = self._calculate_weather_score(climate_data)
        pollen_score = max(0, min(100, 100 - (climate_data.get('pollen_count', 50) / 2)))
        
        date_str = target_date.strftime('%B %d')
        time_options = ['morning', 'afternoon', 'evening', 'early morning']
        final_risk_score = round(personalized_risk_score)
        
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
            "weather_message": f"Temperature will be around {climate_data.get('temperature', 20):.1f}°C with {climate_data.get('humidity', 60):.0f}% humidity.",
            "general_advice": advice_text,
            "best_time_of_day": time_options[day_offset % 4],
            "outdoor_activity_safe": final_risk_score <= 70,
            "exercise_recommendation": "safe" if final_risk_score <= 40 else "moderate" if final_risk_score <= 70 else "avoid"
        }
    
    def _calculate_base_risk_score(
        self,
        climate_data: Dict[str, Any],
        day_offset: int,
        target_date: date
    ) -> float:
        """Calculate base risk score from climate data"""
        # Generate more varied data
        base_variation = math.sin(day_offset * 0.8) * 15 + math.cos(day_offset * 1.2) * 10
        random_variation = (random.random() - 0.5) * 25
        day_of_week = target_date.weekday()
        weekend_effect = -5 if day_of_week >= 5 else 3
        
        # Get climate metrics
        aqi = climate_data.get('aqi', 50)
        pm25 = climate_data.get('pm25', 15)
        temperature = climate_data.get('temperature', 20)
        humidity = climate_data.get('humidity', 60)
        pollen_count = climate_data.get('pollen_count', 50)
        asthma_index = climate_data.get('asthma_index', 30)
        
        # Calculate risk components
        air_quality_factor = aqi / 5  # Normalize AQI (0-500 -> 0-100)
        pollution_factor = pm25 * 2  # Normalize PM2.5
        weather_factor = abs(temperature - 20) * 0.5 + abs(humidity - 50) * 0.3  # Temperature and humidity deviation
        pollen_factor = pollen_count / 2  # Normalize pollen
        
        # Weighted combination
        comprehensive_risk = (
            (air_quality_factor * 0.35) +
            (pollution_factor * 0.25) +
            (weather_factor * 0.20) +
            (pollen_factor * 0.20) +
            base_variation * 0.1 +
            random_variation * 0.1 +
            weekend_effect
        )
        
        # Use asthma_index if available, otherwise use calculated risk
        if asthma_index:
            base_risk = (asthma_index + comprehensive_risk) / 2
        else:
            base_risk = comprehensive_risk
        
        # Ensure reasonable range
        base_risk = max(0, min(100, base_risk))
        
        return base_risk
    
    def _calculate_weather_score(self, climate_data: Dict[str, Any]) -> float:
        """Calculate weather score (higher is better)"""
        temperature = climate_data.get('temperature', 20)
        humidity = climate_data.get('humidity', 60)
        wind_speed = climate_data.get('wind_speed', 5)
        
        # Ideal conditions: 18-25°C, 40-60% humidity, moderate wind
        temp_score = 100 - abs(temperature - 21.5) * 4  # Optimal at 21.5°C
        humidity_score = 100 - abs(humidity - 50) * 1.5  # Optimal at 50%
        wind_score = 100 - abs(wind_speed - 5) * 5  # Optimal at 5 m/s
        
        return max(0, min(100, (temp_score + humidity_score + wind_score) / 3))
    
    def _get_recommendation_level(self, risk_score: float) -> tuple[str, str]:
        """Get recommendation level and advice text based on risk score"""
        if risk_score <= 30:
            return ('safe', "Excellent conditions for outdoor activities. Perfect day to enjoy fresh air and exercise safely.")
        elif risk_score <= 50:
            return ('moderate', "Good conditions for most outdoor activities. Monitor your symptoms and enjoy your day!")
        elif risk_score <= 70:
            return ('caution', "Moderate risk conditions. Consider limiting prolonged outdoor activities during peak hours. Monitor air quality and carry your inhaler.")
        else:
            return ('avoid', "High risk conditions. Limit outdoor activities, especially during peak hours. Stay indoors when possible and keep your inhaler close.")

