# 外部API集成指南

## 概述

本指南将帮助你集成真实的外部API来获取NYC气候数据和空气质量数据，替代当前的mock数据生成。

## 支持的API服务

### 1. OpenWeatherMap API
- **用途**: 获取天气数据（温度、湿度、风速、气压等）
- **免费层**: 60 calls/minute
- **注册地址**: https://openweathermap.org/api
- **所需Key**: `OPENWEATHER_API_KEY`

### 2. AirNow API (推荐用于空气质量)
- **用途**: 获取美国空气质量数据（AQI、PM2.5、PM10、O3等）
- **免费**: 需要注册获取API key
- **注册地址**: https://www.airnow.gov/air-now-api/
- **所需Key**: `AIRNOW_API_KEY`

### 3. WeatherAPI.com (可选)
- **用途**: 备用天气数据源
- **免费层**: 1 million calls/month
- **注册地址**: https://www.weatherapi.com/
- **所需Key**: `WEATHERAPI_KEY`

## 集成步骤

### 第一步：获取API Keys

你需要：
1. 访问上述API服务网站并注册账号
2. 获取API key
3. 将API key添加到环境变量

### 第二步：配置环境变量

创建 `.env` 文件在 `backend/` 目录下：

```bash
# OpenWeatherMap API Key
OPENWEATHER_API_KEY=your_openweather_api_key_here

# AirNow API Key
AIRNOW_API_KEY=your_airnow_api_key_here

# Optional: WeatherAPI.com Key
WEATHERAPI_KEY=your_weatherapi_key_here
```

或者直接在系统环境变量中设置。

### 第三步：安装依赖

```bash
cd backend
pip install httpx python-dotenv
```

### 第四步：使用真实API数据

我已经创建了API服务层 (`app/services/weather_api.py`)，接下来需要：

1. 更新 `requirements.txt` 添加依赖
2. 修改 `nyc_climate.py` API端点，优先使用真实API
3. 如果API不可用，自动回退到mock数据

## 需要你提供的信息

请告诉我：

1. **你已经注册了哪些API服务？**
   - [ ] OpenWeatherMap
   - [ ] AirNow
   - [ ] WeatherAPI.com
   - [ ] 其他（请说明）

2. **你已经有API keys了吗？**
   - 如果有，请告诉我你想如何配置（.env文件或直接告诉我）

3. **你希望何时集成？**
   - 现在立即集成
   - 稍后手动配置

## 当前状态

- ✅ API服务层代码已创建 (`app/services/weather_api.py`)
- ⏳ 等待API keys配置
- ⏳ 等待更新API端点以使用真实数据

## 下一步

一旦你提供了API keys，我将：
1. 安装必要的依赖包
2. 更新后端API端点以优先使用真实API
3. 实现自动回退机制（如果API失败，使用mock数据）
4. 测试API集成

