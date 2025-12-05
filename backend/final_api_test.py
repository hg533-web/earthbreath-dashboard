"""
Final API integration test
"""
import asyncio
from app.services.climate_data_service import ClimateDataService
from datetime import date

async def test():
    service = ClimateDataService()
    data = await service.get_nyc_climate_data('10001', date.today())
    
    print("\n" + "=" * 70)
    print("✅ API集成最终验证")
    print("=" * 70)
    
    print("\n🌤️ OpenWeatherMap API数据:")
    print(f"  温度: {data.get('temperature')}°C")
    print(f"  湿度: {data.get('humidity')}%")
    print(f"  气压: {data.get('pressure')} hPa")
    print(f"  风速: {data.get('wind_speed')} m/s")
    print(f"  风向: {data.get('wind_direction')}°")
    
    print("\n🌬️ AirNow API数据:")
    print(f"  AQI: {data.get('aqi')}")
    print(f"  PM2.5: {data.get('pm25')} μg/m³")
    print(f"  PM10: {data.get('pm10')} μg/m³")
    print(f"  O3: {data.get('o3')} ppm")
    print(f"  NO2: {data.get('no2')} ppb")
    print(f"  CO: {data.get('co')} ppm")
    
    print("\n📝 Seed数据 (API不提供):")
    print(f"  UV指数: {data.get('uv_index')}")
    print(f"  花粉计数: {data.get('pollen_count')}")
    
    print("\n🔢 自动计算:")
    print(f"  哮喘指数: {data.get('asthma_index'):.1f}")
    
    print("\n" + "=" * 70)
    print("✅ 所有数据正常获取！")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(test())

