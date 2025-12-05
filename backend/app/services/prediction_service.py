"""
Prediction Service
Uses historical data from database to predict future air quality
"""
import math
from typing import List, Dict, Any, Optional
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.services.weather_api import WeatherAPIService
from app.models.nyc_climate import NYCClimateData
from app.db.database import SessionLocal
import logging

logger = logging.getLogger(__name__)

class PredictionService:
    """Service for predicting future climate and air quality based on historical data"""
    
    def __init__(self):
        self.weather_api_service = WeatherAPIService()
    
    def fetch_historical_data_from_db(
        self,
        zip_code: str,
        days: int = 30,
        db: Optional[Session] = None
    ) -> List[Dict[str, Any]]:
        """
        Fetch historical data from database
        
        Args:
            zip_code: ZIP code
            days: Number of days of history to fetch
            db: Database session (if None, creates new session)
        
        Returns:
            List of historical data points from database
        """
        should_close_db = False
        if db is None:
            db = SessionLocal()
            should_close_db = True
        
        try:
            today = date.today()
            start_date = today - timedelta(days=days)
            
            # Query database for historical data
            records = db.query(NYCClimateData)\
                .filter(
                    NYCClimateData.zip_code == zip_code,
                    NYCClimateData.date >= start_date,
                    NYCClimateData.date < today
                )\
                .order_by(NYCClimateData.date.asc())\
                .all()
            
            # Convert to dictionary format
            historical_data = []
            for record in records:
                historical_data.append({
                    'date': record.date,
                    'aqi': record.aqi,
                    'pm25': record.pm25,
                    'pm10': record.pm10,
                    'o3': record.o3,
                    'no2': record.no2,
                    'co': record.co,
                    'temperature': record.temperature,
                    'humidity': record.humidity,
                    'wind_speed': record.wind_speed,
                    'wind_direction': record.wind_direction,
                    'pressure': record.pressure,
                    'visibility': record.visibility,
                    'uv_index': record.uv_index,
                    'pollen_count': record.pollen_count,
                    'asthma_index': record.asthma_index
                })
            
            logger.info(f"Fetched {len(historical_data)} historical records from database for {zip_code}")
            return historical_data
            
        finally:
            if should_close_db:
                db.close()
    
    async def fetch_historical_air_quality(self, zip_code: str, days: int = 30) -> List[Dict[str, Any]]:
        """
        Fetch historical air quality data (from database, fallback to API if needed)
        
        Args:
            zip_code: ZIP code
            days: Number of days of history to fetch
        
        Returns:
            List of historical air quality data points
        """
        # First, try to get from database
        db_data = self.fetch_historical_data_from_db(zip_code, days)
        
        if len(db_data) >= 7:  # If we have at least 7 days of data, use it
            logger.info(f"Using {len(db_data)} records from database for prediction")
            return db_data
        
        # Fallback: try to get from API (with rate limiting protection)
        logger.warning(f"Insufficient database records ({len(db_data)}), attempting API fallback (limited to 7 days)")
        import asyncio
        historical_data = []
        today = date.today()
        
        # Limit to 7 days to avoid API rate limiting
        days_to_fetch = min(days, 7)
        
        for i in range(days_to_fetch):
            target_date = today - timedelta(days=i)
            try:
                data = await self.weather_api_service.get_air_quality_data(zip_code, target_date)
                if data:
                    data['date'] = target_date
                    historical_data.append(data)
                
                # Add small delay between requests to avoid rate limiting
                if i < days_to_fetch - 1:
                    await asyncio.sleep(0.5)
            except Exception as e:
                logger.warning(f"Failed to fetch historical data for {target_date}: {e}")
                if "429" in str(e) or "rate limit" in str(e).lower():
                    logger.warning(f"Rate limit detected, stopping historical data fetch")
                    break
                continue
        
        return db_data + historical_data  # Combine database and API data
    
    def analyze_trend(self, historical_data: List[Dict[str, Any]], metric: str = 'aqi') -> float:
        """
        Analyze trend in historical data using linear regression
        
        Args:
            historical_data: List of historical data points
            metric: Metric to analyze (e.g., 'aqi', 'pm25')
        
        Returns:
            Trend slope (positive = increasing, negative = decreasing)
        """
        if len(historical_data) < 2:
            return 0.0
        
        # Simple linear regression to find trend
        values = []
        for data in historical_data:  # Already sorted by date
            value = data.get(metric)
            if value is not None:
                values.append(float(value))
        
        if len(values) < 2:
            return 0.0
        
        # Calculate trend (simple slope)
        n = len(values)
        x_mean = (n - 1) / 2
        y_mean = sum(values) / n
        
        numerator = sum((i - x_mean) * (values[i] - y_mean) for i in range(n))
        denominator = sum((i - x_mean) ** 2 for i in range(n))
        
        if denominator == 0:
            return 0.0
        
        trend = numerator / denominator
        return trend
    
    def detect_seasonality(self, historical_data: List[Dict[str, Any]], metric: str = 'aqi') -> Dict[int, float]:
        """
        Detect weekly seasonal pattern
        
        Args:
            historical_data: List of historical data points
            metric: Metric to analyze
        
        Returns:
            Dictionary mapping day of week (0-6) to average value
        """
        weekday_averages = {i: [] for i in range(7)}
        
        for data in historical_data:
            target_date = data.get('date')
            if target_date:
                weekday = target_date.weekday()
                value = data.get(metric)
                if value is not None:
                    weekday_averages[weekday].append(float(value))
        
        # Calculate average for each weekday
        seasonal_pattern = {}
        for weekday in range(7):
            if weekday_averages[weekday]:
                avg_value = sum(weekday_averages[weekday]) / len(weekday_averages[weekday])
                seasonal_pattern[weekday] = avg_value if avg_value is not None else 0.0
            else:
                seasonal_pattern[weekday] = 0.0
        
        return seasonal_pattern
    
    async def predict_air_quality(self, zip_code: str, days_ahead: int = 7) -> List[Dict[str, Any]]:
        """
        Predict future air quality based on historical data from database
        
        Args:
            zip_code: ZIP code
            days_ahead: Number of days to predict
        
        Returns:
            List of predicted air quality data
        """
        # Fetch historical data (prefer database, fallback to API)
        historical_data = await self.fetch_historical_air_quality(zip_code, days=30)
        
        # If we don't have enough historical data (less than 3 days), return empty
        # to fallback to seed data generation
        if len(historical_data) < 3:
            logger.warning(f"Insufficient historical data available for {zip_code} ({len(historical_data)} days), using fallback")
            return []
        
        # Get latest data point (most recent)
        if not historical_data:
            logger.warning(f"No historical data available for {zip_code}")
            return []
        
        latest = historical_data[-1]  # Last record (most recent)
        
        # Analyze trends for different metrics
        aqi_trend = self.analyze_trend(historical_data, 'aqi')
        pm25_trend = self.analyze_trend(historical_data, 'pm25')
        
        # Detect seasonal patterns
        aqi_seasonal = self.detect_seasonality(historical_data, 'aqi')
        pm25_seasonal = self.detect_seasonality(historical_data, 'pm25')
        
        # Generate predictions
        predictions = []
        today = date.today()
        
        for day_offset in range(1, days_ahead + 1):
            future_date = today + timedelta(days=day_offset)
            weekday = future_date.weekday()
            
            # Base value from latest data (handle None values)
            base_aqi = latest.get('aqi')
            base_pm25 = latest.get('pm25')
            
            # Ensure base values are numeric
            base_aqi = float(base_aqi) if base_aqi is not None else 50.0
            base_pm25 = float(base_pm25) if base_pm25 is not None else 15.0
            
            # Trend component
            aqi_trend_component = aqi_trend * day_offset
            pm25_trend_component = pm25_trend * day_offset
            
            # Seasonal component (handle None values)
            aqi_seasonal_avg = aqi_seasonal.get(weekday, base_aqi) or base_aqi
            pm25_seasonal_avg = pm25_seasonal.get(weekday, base_pm25) or base_pm25
            aqi_seasonal_avg = float(aqi_seasonal_avg) if aqi_seasonal_avg is not None else base_aqi
            pm25_seasonal_avg = float(pm25_seasonal_avg) if pm25_seasonal_avg is not None else base_pm25
            aqi_seasonal_component = aqi_seasonal_avg - base_aqi
            pm25_seasonal_component = pm25_seasonal_avg - base_pm25
            
            # Weekly cycle variation
            weekly_variation = math.sin(day_offset * 2 * math.pi / 7) * 5
            
            # Combine components
            predicted_aqi = base_aqi + aqi_trend_component + aqi_seasonal_component * 0.3 + weekly_variation
            predicted_pm25 = base_pm25 + pm25_trend_component + pm25_seasonal_component * 0.3 + weekly_variation * 0.5
            
            # Ensure reasonable bounds
            predicted_aqi = max(0, min(500, predicted_aqi))
            predicted_pm25 = max(0, min(500, predicted_pm25))
            
            predictions.append({
                'date': future_date,
                'aqi': round(predicted_aqi, 1),
                'pm25': round(predicted_pm25, 2),
                'prediction_method': 'database_historical_analysis'
            })
        
        return predictions
