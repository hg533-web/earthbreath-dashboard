"""
Test script to verify API integration
"""
import asyncio
import sys
from app.services.climate_data_service import ClimateDataService
from datetime import date

async def test_climate_data_service():
    """Test the climate data service with real API integration"""
    print("=" * 60)
    print("Testing Climate Data Service with Real APIs")
    print("=" * 60)
    
    service = ClimateDataService()
    zip_code = "10001"
    
    print(f"\nFetching climate data for ZIP code: {zip_code}")
    print("-" * 60)
    
    try:
        data = await service.get_nyc_climate_data(zip_code, date.today())
        
        print("\n✅ Successfully fetched climate data!")
        print("\nData fields:")
        print(f"  - ZIP Code: {data.get('zip_code')}")
        print(f"  - Date: {data.get('date')}")
        print(f"\nWeather Data (from OpenWeatherMap):")
        print(f"  - Temperature: {data.get('temperature')}°C")
        print(f"  - Humidity: {data.get('humidity')}%")
        print(f"  - Pressure: {data.get('pressure')} hPa")
        print(f"  - Wind Speed: {data.get('wind_speed')} m/s")
        print(f"  - Wind Direction: {data.get('wind_direction')}°")
        print(f"  - Visibility: {data.get('visibility')} km")
        
        print(f"\nAir Quality Data (from AirNow):")
        print(f"  - AQI: {data.get('aqi')}")
        print(f"  - PM2.5: {data.get('pm25')} μg/m³")
        print(f"  - PM10: {data.get('pm10')} μg/m³")
        print(f"  - O3: {data.get('o3')} ppm")
        print(f"  - NO2: {data.get('no2')} ppb")
        print(f"  - CO: {data.get('co')} ppm")
        
        print(f"\nAdditional Data (from seed if API doesn't provide):")
        print(f"  - UV Index: {data.get('uv_index')}")
        print(f"  - Pollen Count: {data.get('pollen_count')}")
        print(f"  - Asthma Index: {data.get('asthma_index')}")
        
        print("\n" + "=" * 60)
        print("✅ API Integration Test PASSED")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_climate_data_service())
    sys.exit(0 if success else 1)

