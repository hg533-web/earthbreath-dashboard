"""
Climate Data Service
Combines real API data with fallback seed data for NYC Dashboard
Supports historical data-based predictions for future dates
"""
import logging
from typing import Dict, Any, Optional
from datetime import date
from app.services.weather_api import WeatherAPIService
from app.services.prediction_service import PredictionService
from app.db.seed_nyc_data import generate_climate_data

logger = logging.getLogger(__name__)

class ClimateDataService:
    """Service to fetch and combine climate data from APIs with seed data fallback"""
    
    def __init__(self):
        self.weather_api_service = WeatherAPIService()
        self.prediction_service = PredictionService()
    
    async def get_nyc_climate_data(self, zip_code: str, target_date: Optional[date] = None) -> Dict[str, Any]:
        """
        Get comprehensive NYC climate data for a ZIP code.
        Uses real API data when available, falls back to seed data for missing fields.
        
        Args:
            zip_code: ZIP code
            target_date: Target date (default: today)
        
        Returns:
            Complete climate data dictionary with all required fields
        """
        target_date = target_date or date.today()
        
        # Get seed data as baseline (always available)
        seed_data = generate_climate_data(zip_code, target_date)
        
        # Try to get real API data
        api_data = await self.weather_api_service.get_comprehensive_climate_data(zip_code, target_date)
        
        # Merge API data with seed data
        # Priority: API data > seed data
        merged_data = seed_data.copy()  # Start with seed data
        
        if api_data:
            # Merge real API data, keeping seed values for missing fields
            if api_data.get("temperature") is not None:
                merged_data["temperature"] = api_data["temperature"]
            if api_data.get("humidity") is not None:
                merged_data["humidity"] = api_data["humidity"]
            if api_data.get("pressure") is not None:
                merged_data["pressure"] = api_data["pressure"]
            if api_data.get("wind_speed") is not None:
                merged_data["wind_speed"] = api_data["wind_speed"]
            if api_data.get("wind_direction") is not None:
                merged_data["wind_direction"] = api_data["wind_direction"]
            if api_data.get("visibility") is not None:
                merged_data["visibility"] = api_data["visibility"]
            
            # Air quality data from AirNow
            if api_data.get("aqi") is not None:
                merged_data["aqi"] = api_data["aqi"]
            if api_data.get("pm25") is not None:
                merged_data["pm25"] = api_data["pm25"]
            if api_data.get("pm10") is not None:
                merged_data["pm10"] = api_data["pm10"]
            if api_data.get("o3") is not None:
                merged_data["o3"] = api_data["o3"]
            if api_data.get("no2") is not None:
                merged_data["no2"] = api_data["no2"]
            if api_data.get("co") is not None:
                merged_data["co"] = api_data["co"]
            
            # Update asthma_index if we have real AQI
            if api_data.get("asthma_index") is not None:
                merged_data["asthma_index"] = api_data["asthma_index"]
            elif api_data.get("aqi") is not None:
                # Calculate asthma_index from real AQI
                aqi = api_data["aqi"]
                if aqi <= 50:
                    merged_data["asthma_index"] = aqi * 0.6
                elif aqi <= 100:
                    merged_data["asthma_index"] = 30 + (aqi - 50) * 0.8
                elif aqi <= 150:
                    merged_data["asthma_index"] = 70 + (aqi - 100) * 0.6
                else:
                    merged_data["asthma_index"] = 100
            
            logger.info(f"Successfully merged API data for ZIP {zip_code}")
        else:
            logger.info(f"Using seed data for ZIP {zip_code} (API unavailable)")
        
        # Fields that APIs typically don't provide - keep seed values:
        # - uv_index (from seed)
        # - pollen_count (from seed)
        # - Other fields already in seed_data
        
        return merged_data
    
    async def get_nyc_climate_data_with_prediction(
        self, 
        zip_code: str, 
        target_date: Optional[date] = None,
        use_prediction: bool = True
    ) -> Dict[str, Any]:
        """
        Get NYC climate data, with optional prediction for future dates based on historical data.
        
        Args:
            zip_code: ZIP code
            target_date: Target date (default: today)
            use_prediction: If True and target_date is in the future, use prediction service
        
        Returns:
            Complete climate data dictionary
        """
        target_date = target_date or date.today()
        today = date.today()
        
        # If target date is in the future and prediction is enabled, use prediction
        if use_prediction and target_date > today:
            days_ahead = (target_date - today).days
            
            # Get predictions based on historical data from database
            predictions = await self.prediction_service.predict_air_quality(zip_code, days_ahead=days_ahead)
            
            if predictions:
                # Find the prediction for our target date
                target_prediction = None
                for pred in predictions:
                    if pred.get('date') == target_date:
                        target_prediction = pred
                        break
                
                if target_prediction:
                    # Use prediction data as base
                    seed_data = generate_climate_data(zip_code, target_date)
                    
                    # Override with predicted values
                    if target_prediction.get('aqi') is not None:
                        seed_data['aqi'] = target_prediction['aqi']
                    if target_prediction.get('pm25') is not None:
                        seed_data['pm25'] = target_prediction['pm25']
                    
                    logger.info(f"Using prediction-based data for {target_date} (ZIP {zip_code}) from database")
                    return seed_data
        
        # For today or past dates, use standard method
        return await self.get_nyc_climate_data(zip_code, target_date)

