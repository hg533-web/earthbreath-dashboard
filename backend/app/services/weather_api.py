"""
External Weather API Service
Supports multiple weather/climate data providers
"""
import os
import httpx
from typing import Optional, Dict, Any
from datetime import date
import logging

logger = logging.getLogger(__name__)

class WeatherAPIService:
    """Service for fetching weather and climate data from external APIs"""
    
    def __init__(self):
        # API Keys - check environment variables first, then use defaults
        self.openweather_api_key = os.getenv("OPENWEATHER_API_KEY", "8aa8e9ecdd268cc60f0fe062b9de4edb")
        self.airnow_api_key = os.getenv("AIRNOW_API_KEY", "80DC146D-BC72-4B4E-8650-4F512C2D682C")
        self.weatherapi_key = os.getenv("WEATHERAPI_KEY")
        
    async def get_weather_data(self, zip_code: str, country_code: str = "US") -> Optional[Dict[str, Any]]:
        """
        Fetch weather data for a ZIP code from OpenWeatherMap API
        
        Args:
            zip_code: ZIP code
            country_code: Country code (default: US)
        
        Returns:
            Dict containing weather data or None if API unavailable
        """
        if not self.openweather_api_key:
            logger.warning("OpenWeatherMap API key not configured")
            return None
        
        try:
            url = "https://api.openweathermap.org/data/2.5/weather"
            params = {
                "zip": f"{zip_code},{country_code}",
                "appid": self.openweather_api_key,
                "units": "metric"
            }
            
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                return {
                    "temperature": data.get("main", {}).get("temp"),
                    "humidity": data.get("main", {}).get("humidity"),
                    "pressure": data.get("main", {}).get("pressure"),
                    "wind_speed": data.get("wind", {}).get("speed"),
                    "wind_direction": data.get("wind", {}).get("deg"),
                    "visibility": data.get("visibility") / 1000 if data.get("visibility") else None,  # Convert to km
                    "uv_index": None,  # Not in current weather API
                    "description": data.get("weather", [{}])[0].get("description", ""),
                    "icon": data.get("weather", [{}])[0].get("icon", ""),
                }
        except httpx.HTTPError as e:
            logger.error(f"OpenWeatherMap API error: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching weather data: {e}")
            return None
    
    async def get_air_quality_data(self, zip_code: str, date: Optional[date] = None) -> Optional[Dict[str, Any]]:
        """
        Fetch air quality data from AirNow API
        
        Args:
            zip_code: ZIP code
            date: Date for historical data (default: today)
        
        Returns:
            Dict containing air quality data or None if API unavailable
        """
        if not self.airnow_api_key:
            logger.warning("AirNow API key not configured")
            return None
        
        try:
            # AirNow API endpoint
            url = "https://www.airnowapi.org/aq/observation/zipCode/current/"
            
            target_date = date or date.today()
            params = {
                "format": "application/json",
                "zipCode": zip_code,
                "date": target_date.strftime("%Y-%m-%d"),
                "distance": 25,
                "API_KEY": self.airnow_api_key
            }
            
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data_list = response.json()
                
                if not data_list:
                    return None
                
                # Aggregate data from multiple parameters
                aqi_data = {}
                for item in data_list:
                    parameter = item.get("ParameterName", "")
                    aqi = item.get("AQI", None)
                    
                    if parameter == "PM2.5":
                        # AirNow returns concentration in ug/m3
                        aqi_data["pm25"] = item.get("Concentration", None)
                        aqi_data["aqi_pm25"] = aqi
                    elif parameter == "PM10":
                        aqi_data["pm10"] = item.get("Concentration", None)
                        aqi_data["aqi_pm10"] = aqi
                    elif parameter == "O3":
                        # O3 is in ppm, convert if needed
                        o3_value = item.get("Concentration", None)
                        if o3_value:
                            # If in ppb, convert to ppm
                            aqi_data["o3"] = o3_value / 1000 if o3_value > 1 else o3_value
                        aqi_data["aqi_o3"] = aqi
                    elif parameter == "NO2":
                        # NO2 in ppb
                        aqi_data["no2"] = item.get("Concentration", None)
                        aqi_data["aqi_no2"] = aqi
                    elif parameter == "CO":
                        # CO in ppm
                        aqi_data["co"] = item.get("Concentration", None)
                        aqi_data["aqi_co"] = aqi
                    
                    # Use overall AQI (typically from PM2.5 or O3)
                    if "aqi" not in aqi_data or (aqi and aqi > aqi_data.get("aqi", 0)):
                        aqi_data["aqi"] = aqi
                
                return aqi_data
        except httpx.HTTPError as e:
            logger.error(f"AirNow API error: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching air quality data: {e}")
            return None
    
    async def get_comprehensive_climate_data(self, zip_code: str, target_date: Optional[date] = None) -> Optional[Dict[str, Any]]:
        """
        Fetch comprehensive climate data combining weather and air quality
        
        Args:
            zip_code: ZIP code
            target_date: Date for data (default: today)
        
        Returns:
            Combined climate data dict or None if unavailable
        """
        target_date = target_date or date.today()
        
        # Fetch weather and air quality data in parallel
        weather_data = await self.get_weather_data(zip_code)
        air_quality_data = await self.get_air_quality_data(zip_code, target_date)
        
        # Combine data
        combined_data = {
            "zip_code": zip_code,
            "date": target_date,
        }
        
        if weather_data:
            combined_data.update(weather_data)
        
        if air_quality_data:
            combined_data.update(air_quality_data)
        
        # Calculate asthma index if we have AQI
        if "aqi" in combined_data and combined_data["aqi"]:
            # Simple asthma risk calculation based on AQI
            aqi = combined_data["aqi"]
            if aqi <= 50:
                combined_data["asthma_index"] = aqi * 0.6  # Low risk
            elif aqi <= 100:
                combined_data["asthma_index"] = 30 + (aqi - 50) * 0.8  # Moderate risk
            elif aqi <= 150:
                combined_data["asthma_index"] = 70 + (aqi - 100) * 0.6  # High risk
            else:
                combined_data["asthma_index"] = 100  # Very high risk
        
        return combined_data if combined_data.get("temperature") or combined_data.get("aqi") else None

