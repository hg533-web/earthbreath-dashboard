"""
Historical Data Collector Service
Collects historical climate data from APIs and stores in database for prediction
"""
import asyncio
import logging
from typing import List, Dict, Any, Optional
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.services.weather_api import WeatherAPIService
from app.services.climate_data_service import ClimateDataService
from app.models.nyc_climate import NYCClimateData
from app.db.database import SessionLocal

logger = logging.getLogger(__name__)

class HistoricalDataCollector:
    """Service to collect and store historical climate data in database"""
    
    def __init__(self):
        self.weather_api_service = WeatherAPIService()
        self.climate_service = ClimateDataService()
    
    async def collect_and_store_historical_data(
        self,
        zip_code: str,
        days: int = 30,
        db: Optional[Session] = None
    ) -> int:
        """
        Collect historical data from APIs and store in database
        
        Args:
            zip_code: ZIP code
            days: Number of days of history to collect
            db: Database session (if None, creates new session)
        
        Returns:
            Number of records stored
        """
        should_close_db = False
        if db is None:
            db = SessionLocal()
            should_close_db = True
        
        try:
            stored_count = 0
            today = date.today()
            
            for i in range(days):
                target_date = today - timedelta(days=i)
                
                # Check if data already exists
                existing = db.query(NYCClimateData)\
                    .filter(
                        NYCClimateData.zip_code == zip_code,
                        NYCClimateData.date == target_date
                    )\
                    .first()
                
                if existing:
                    logger.debug(f"Data already exists for {zip_code} on {target_date}, skipping")
                    continue
                
                try:
                    # Get comprehensive climate data (tries API first, falls back to seed)
                    climate_data = await self.climate_service.get_nyc_climate_data(zip_code, target_date)
                    
                    # Create database record
                    db_record = NYCClimateData(
                        zip_code=zip_code,
                        date=target_date,
                        aqi=climate_data.get('aqi'),
                        pm25=climate_data.get('pm25'),
                        pm10=climate_data.get('pm10'),
                        o3=climate_data.get('o3'),
                        no2=climate_data.get('no2'),
                        co=climate_data.get('co'),
                        temperature=climate_data.get('temperature'),
                        humidity=climate_data.get('humidity'),
                        wind_speed=climate_data.get('wind_speed'),
                        wind_direction=climate_data.get('wind_direction'),
                        pressure=climate_data.get('pressure'),
                        visibility=climate_data.get('visibility'),
                        uv_index=climate_data.get('uv_index'),
                        pollen_count=climate_data.get('pollen_count'),
                        asthma_index=climate_data.get('asthma_index')
                    )
                    
                    db.add(db_record)
                    stored_count += 1
                    
                    # Add delay to avoid API rate limiting
                    if i < days - 1:
                        await asyncio.sleep(0.5)
                    
                    logger.info(f"Collected data for {zip_code} on {target_date}")
                    
                except Exception as e:
                    logger.warning(f"Failed to collect data for {zip_code} on {target_date}: {e}")
                    continue
            
            db.commit()
            logger.info(f"Stored {stored_count} new records for {zip_code} (out of {days} days)")
            return stored_count
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error collecting historical data: {e}")
            raise
        finally:
            if should_close_db:
                db.close()
    
    async def collect_for_multiple_zipcodes(
        self,
        zip_codes: List[str],
        days: int = 30
    ) -> Dict[str, int]:
        """
        Collect historical data for multiple ZIP codes
        
        Args:
            zip_codes: List of ZIP codes
            days: Number of days of history to collect
        
        Returns:
            Dictionary mapping ZIP codes to number of records stored
        """
        results = {}
        
        for zip_code in zip_codes:
            try:
                count = await self.collect_and_store_historical_data(zip_code, days)
                results[zip_code] = count
                # Add delay between ZIP codes to avoid rate limiting
                await asyncio.sleep(2)
            except Exception as e:
                logger.error(f"Failed to collect data for {zip_code}: {e}")
                results[zip_code] = 0
        
        return results

