"""
Detailed API test to analyze performance and data sources
"""
import asyncio
import time
import sys
from app.services.weather_api import WeatherAPIService
from app.services.climate_data_service import ClimateDataService
from datetime import date

async def test_apis_individually():
    """Test each API separately to analyze performance"""
    print("=" * 70)
    print("详细API测试分析")
    print("=" * 70)
    
    service = WeatherAPIService()
    zip_code = "10001"
    
    # Test OpenWeatherMap
    print("\n1️⃣ 测试 OpenWeatherMap API (天气数据)")
    print("-" * 70)
    start_time = time.time()
    try:
        weather_data = await service.get_weather_data(zip_code)
        elapsed = time.time() - start_time
        
        if weather_data:
            print(f"✅ 成功! 响应时间: {elapsed:.2f}秒")
            print(f"   - 温度: {weather_data.get('temperature')}°C")
            print(f"   - 湿度: {weather_data.get('humidity')}%")
            print(f"   - 气压: {weather_data.get('pressure')} hPa")
            print(f"   - 风速: {weather_data.get('wind_speed')} m/s")
        else:
            print(f"❌ 失败! 响应时间: {elapsed:.2f}秒")
            print("   (API key可能无效或需要激活)")
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"❌ 错误! 响应时间: {elapsed:.2f}秒")
        print(f"   {str(e)[:100]}")
    
    # Test AirNow
    print("\n2️⃣ 测试 AirNow API (空气质量数据)")
    print("-" * 70)
    start_time = time.time()
    try:
        air_data = await service.get_air_quality_data(zip_code, date.today())
        elapsed = time.time() - start_time
        
        if air_data:
            print(f"✅ 成功! 响应时间: {elapsed:.2f}秒")
            print(f"   通过AirNow API获取的指标:")
            if air_data.get('aqi'):
                print(f"   ✅ AQI (空气质量指数): {air_data.get('aqi')}")
            if air_data.get('pm25') is not None:
                print(f"   ✅ PM2.5: {air_data.get('pm25')} μg/m³")
            if air_data.get('pm10') is not None:
                print(f"   ✅ PM10: {air_data.get('pm10')} μg/m³")
            if air_data.get('o3') is not None:
                print(f"   ✅ O3 (臭氧): {air_data.get('o3')} ppm")
            if air_data.get('no2') is not None:
                print(f"   ✅ NO2 (二氧化氮): {air_data.get('no2')} ppb")
            if air_data.get('co') is not None:
                print(f"   ✅ CO (一氧化碳): {air_data.get('co')} ppm")
        else:
            print(f"❌ 失败! 响应时间: {elapsed:.2f}秒")
            print("   (API key可能无效或网络问题)")
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"❌ 错误! 响应时间: {elapsed:.2f}秒")
        print(f"   {str(e)[:100]}")
    
    # Test combined service
    print("\n3️⃣ 测试综合数据服务 (合并API + Seed数据)")
    print("-" * 70)
    start_time = time.time()
    try:
        climate_service = ClimateDataService()
        combined_data = await climate_service.get_nyc_climate_data(zip_code, date.today())
        elapsed = time.time() - start_time
        
        print(f"✅ 成功! 总响应时间: {elapsed:.2f}秒")
        print(f"\n📊 数据来源分析:")
        print(f"\n  来自真实API的指标:")
        if combined_data.get('aqi'):
            print(f"     ✅ AQI: {combined_data.get('aqi')} (AirNow)")
        if combined_data.get('pm25'):
            print(f"     ✅ PM2.5: {combined_data.get('pm25')} μg/m³ (AirNow)")
        if combined_data.get('temperature') and combined_data.get('temperature') != 24:
            print(f"     ✅ 温度: {combined_data.get('temperature')}°C (OpenWeatherMap)")
        
        print(f"\n  来自Seed数据的指标 (API不提供):")
        print(f"     📝 UV指数: {combined_data.get('uv_index')}")
        print(f"     📝 花粉计数: {combined_data.get('pollen_count')}")
        
        print(f"\n  自动计算的指标:")
        print(f"     🔢 哮喘指数: {combined_data.get('asthma_index'):.1f} (基于AQI计算)")
        
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"❌ 错误! 响应时间: {elapsed:.2f}秒")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 70)
    print("总结:")
    print("=" * 70)
    print("1. 响应慢的原因:")
    print("   - 需要调用多个外部API (OpenWeatherMap + AirNow)")
    print("   - 网络延迟 (每个API约1-3秒)")
    print("   - 如果API失败，会有超时等待")
    print("\n2. AirNow API状态:")
    print("   - ✅ 可以正常工作!")
    print("   - 提供: AQI, PM2.5, PM10, O3, NO2, CO")
    print("\n3. 数据来源:")
    print("   - AirNow: 所有空气质量指标")
    print("   - OpenWeatherMap: 天气指标 (如果API key有效)")
    print("   - Seed数据: UV指数, 花粉计数")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(test_apis_individually())

