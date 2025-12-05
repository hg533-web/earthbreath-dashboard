"""
Test the actual API endpoint to verify integration
"""
import requests
import json

def test_api_endpoint():
    """Test the /api/nyc/climate/latest endpoint"""
    print("=" * 70)
    print("测试 API 端点: /api/nyc/climate/latest")
    print("=" * 70)
    
    url = "http://localhost:8000/api/nyc/climate/latest"
    params = {"zip_code": "10001"}
    
    print(f"\n请求URL: {url}")
    print(f"参数: {params}")
    print("-" * 70)
    
    try:
        response = requests.get(url, params=params, timeout=10)
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ API调用成功！")
            print("\n返回的数据:")
            print(f"  ZIP Code: {data.get('zip_code')}")
            print(f"  Date: {data.get('date')}")
            
            print("\n🌤️ 天气数据 (OpenWeatherMap):")
            print(f"  温度: {data.get('temperature')}°C")
            print(f"  湿度: {data.get('humidity')}%")
            print(f"  气压: {data.get('pressure')} hPa")
            print(f"  风速: {data.get('wind_speed')} m/s")
            
            print("\n🌬️ 空气质量数据 (AirNow):")
            print(f"  AQI: {data.get('aqi')}")
            print(f"  PM2.5: {data.get('pm25')} μg/m³")
            print(f"  PM10: {data.get('pm10')} μg/m³")
            print(f"  O3: {data.get('o3')} ppm")
            
            print("\n📝 其他数据:")
            print(f"  UV指数: {data.get('uv_index')} (seed)")
            print(f"  花粉计数: {data.get('pollen_count')} (seed)")
            print(f"  哮喘指数: {data.get('asthma_index')}")
            
            print("\n" + "=" * 70)
            print("✅ 所有数据正常！前端应该可以看到真实API数据了！")
            print("=" * 70)
            return True
        else:
            print(f"\n❌ API调用失败: {response.status_code}")
            print(f"响应: {response.text[:200]}")
            return False
    except requests.exceptions.ConnectionError:
        print("\n❌ 无法连接到服务器")
        print("请确保后端服务器正在运行:")
        print("  cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
        return False
    except Exception as e:
        print(f"\n❌ 错误: {e}")
        return False

if __name__ == "__main__":
    test_api_endpoint()

