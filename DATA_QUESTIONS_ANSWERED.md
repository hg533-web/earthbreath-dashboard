# 三个问题的详细回答

## 问题1: 预测数据是怎么得到的？

### 答案：**预测数据是通过算法生成的模拟数据，不是来自真实API**

#### 预测数据的两个来源：

1. **出行建议（Travel Recommendations）的7天预测**
   - **位置**: `backend/app/db/seed_nyc_data.py` → `generate_travel_recommendation()`
   - **生成方法**: 
     - 使用数学函数（sin/cos）模拟周期性变化
     - 基于zip code的字符码生成基础值
     - 加入随机数和周末效应
     - 通过`day_offset`参数控制未来天数
   - **时间**: 未来7天

2. **气候图表的未来7天预测**
   - **位置**: `frontend/src/pages/NYC/ClimateCharts.tsx` → `generateFutureData()`
   - **生成方法**:
     - 基于当前真实数据 + 数学变化
     - 使用sin/cos函数生成variation
     - 在当前值基础上加减变化
   - **时间**: 未来7天

#### 关键点：
- ❌ **不是从OpenWeatherMap或AirNow API获取预测**
- ✅ **完全基于算法生成**
- 📝 **用于演示和展示目的**

---

## 问题2: 两个API抓取到的数据时间维度是什么？

### 答案：**两个API都只能获取当前实时数据，不能获取未来预测**

### OpenWeatherMap API:

**端点**: `https://api.openweathermap.org/data/2.5/weather`

**时间维度**:
- ✅ **当前实时数据** (Current Weather)
- ❌ **不能获取未来预测**
- ❌ **不能获取历史数据**（需要使用其他端点）

**代码位置**: `backend/app/services/weather_api.py` 第38行

**说明**: `/weather`端点返回的是调用时的当前天气，不是预测

### AirNow API:

**端点**: `https://www.airnowapi.org/aq/observation/zipCode/current/`

**时间维度**:
- ✅ **当前实时数据** (Current Observations) - 默认今天
- ✅ **可以获取历史数据** - 通过`date`参数传入历史日期（如`2025-12-01`）
- ❌ **不能获取未来预测**

**代码位置**: `backend/app/services/weather_api.py` 第85行

**说明**: 可以查询历史某一天的数据，但不支持未来日期

### 总结对比表：

```
┌──────────────────┬─────────────┬─────────────┬─────────────┐
│   API            │  当前数据   │  历史数据   │  未来预测   │
├──────────────────┼─────────────┼─────────────┼─────────────┤
│ OpenWeatherMap   │     ✅      │     ❌      │     ❌      │
│ AirNow           │     ✅      │     ✅      │     ❌      │
└──────────────────┴─────────────┴─────────────┴─────────────┘
```

---

## 问题3: risk_score是怎么计算的？

### 答案：**risk_score是基于算法计算的综合健康风险指数，使用数学模型生成**

### 完整计算流程：

#### 步骤1: 计算基础变化
```python
base_variation = sin(day_offset * 0.8) * 15 + cos(day_offset * 1.2) * 10
random_variation = (random() - 0.5) * 25  # -12.5 到 +12.5
weekend_effect = -5 if weekend else 3
```

#### 步骤2: 计算各项因子
```python
air_quality_factor = 30 + (zip_code[0] % 35) + (day_offset * 1.2) + sin(day_offset) * 10
weather_factor = 25 + (zip_code[1] % 30) + cos(day_offset * 0.7) * 8
pollen_factor = 20 + (zip_code[2] % 25) + sin(day_offset * 1.5) * 6
pollution_factor = 15 + (zip_code[3] % 20) + cos(day_offset * 1.1) * 5
```

#### 步骤3: 计算综合健康风险指数（CHRI）
```python
CHRI = (air_quality_factor * 0.35) +    # 35%权重
       (weather_factor * 0.25) +          # 25%权重
       (pollen_factor * 0.20) +           # 20%权重
       (pollution_factor * 0.20) +        # 20%权重
       base_variation * 0.1               # 10%权重

chri = max(0, min(150, CHRI))  # 限制在0-150
```

#### 步骤4: 根据CHRI确定风险等级
```python
if chri <= 40:
    level = 'safe'
elif chri <= 70:
    level = 'moderate'
elif chri <= 100:
    level = 'caution'
else:
    level = 'avoid'
```

#### 步骤5: 根据level计算risk_score
```python
if level == 'safe':      # chri <= 40
    risk_score = 15 + (zip_code[0] % 15) + random() * 10
    # 结果范围: 约 15-40

elif level == 'moderate':  # 40 < chri <= 70
    risk_score = 35 + (zip_code[0] % 20) + random() * 15
    # 结果范围: 约 35-70

elif level == 'caution':   # 70 < chri <= 100
    risk_score = 55 + (zip_code[0] % 25) + random() * 15
    # 结果范围: 约 55-95

else:  # level == 'avoid', chri > 100
    risk_score = 75 + (zip_code[0] % 20) + random() * 10
    # 结果范围: 约 75-100
```

### 关键特点：

1. ✅ **基于算法计算**，不依赖真实API预测数据
2. ✅ **使用数学函数**（sin/cos）模拟变化趋势
3. ✅ **考虑多个因素**：空气质量、天气、花粉、污染
4. ✅ **加权组合**：不同因素有不同的权重
5. ✅ **加入随机性**：使数据更真实
6. ✅ **考虑周末效应**：周末风险稍低

### risk_score范围：

- **Safe**: 15-40分
- **Moderate**: 35-70分
- **Caution**: 55-95分
- **Avoid**: 75-100分

---

## 📊 完整数据流程图

```
真实API数据（当前时刻）:
  OpenWeatherMap (/weather) 
    → 当前实时天气数据
    → 保存到数据库
  
  AirNow (/current/)
    → 当前实时空气质量数据
    → 保存到数据库

预测数据（算法生成）:
  出行建议预测:
    generate_travel_recommendation()
    → 基于算法生成7天预测
    → 保存到数据库
  
  气候图表预测:
    generateFutureData() (前端)
    → 基于当前数据+算法生成7天预测
    → 直接在前端显示
```

---

## ⚠️ 重要总结

| 数据类型 | 来源 | 时间维度 |
|---------|------|---------|
| **当前天气数据** | OpenWeatherMap API | 实时/当前 |
| **当前空气质量** | AirNow API | 实时/当前或历史 |
| **未来7天出行建议** | 算法生成 | 未来预测（模拟） |
| **未来7天气候图表** | 算法生成 | 未来预测（模拟） |
| **risk_score** | 算法计算 | 基于CHRI算法 |

---

## 💡 关键发现

1. ✅ **当前数据使用真实API** - OpenWeatherMap + AirNow
2. ❌ **预测数据是算法生成** - 不是真实API预测
3. ❌ **API不提供未来预测** - 只能获取当前和历史数据
4. ✅ **risk_score是算法计算** - 基于数学模型，不是真实数据

