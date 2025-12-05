# 改进方案：基于历史数据的预测 + 个性化risk_score

## 🎯 改进方向

### 方向1: 基于AirNow历史数据的预测算法
- 收集过去几个月的历史数据
- 分析趋势和模式
- 设计基于历史数据的预测算法

### 方向2: 个性化risk_score计算
- 考虑用户问卷内容（哮喘严重程度、触发因素等）
- 使risk_score更加个性化
- 不同用户看到不同的风险评估

## 📋 实现计划

### 阶段1: 历史数据收集与分析

1. **收集历史数据**
   - 从AirNow API获取过去30-90天的历史数据
   - 存储到数据库
   - 分析数据模式和趋势

2. **设计预测算法**
   - 基于历史数据的时间序列分析
   - 考虑季节性变化
   - 考虑周期性模式（日、周、月）

### 阶段2: 个性化risk_score

1. **获取用户问卷数据**
   - 从数据库读取用户信息
   - 提取哮喘严重程度、触发因素等

2. **个性化权重调整**
   - 根据用户敏感性调整各项因子权重
   - 考虑用户特定的触发因素

## 💡 具体实现思路

### 预测算法设计：

```python
# 伪代码
def predict_future_air_quality(zip_code, days_ahead):
    # 1. 获取历史数据（过去90天）
    historical_data = fetch_historical_data(zip_code, days=90)
    
    # 2. 分析趋势
    trend = analyze_trend(historical_data)
    
    # 3. 检测周期性
    seasonal_pattern = detect_seasonality(historical_data)
    
    # 4. 预测未来
    predictions = []
    for day in range(days_ahead):
        base_value = historical_data[-1]  # 最近的值
        trend_component = trend * day
        seasonal_component = seasonal_pattern[day % 7]  # 周周期
        prediction = base_value + trend_component + seasonal_component
        predictions.append(prediction)
    
    return predictions
```

### 个性化risk_score：

```python
# 伪代码
def calculate_personalized_risk_score(user_profile, climate_data, day_offset):
    # 基础risk_score计算
    base_risk = calculate_base_risk(climate_data, day_offset)
    
    # 获取用户信息
    severity = user_profile.asthma_severity  # mild, moderate, severe
    triggers = user_profile.trigger_factors  # 触发因素列表
    control = user_profile.asthma_control
    
    # 个性化调整
    severity_multiplier = {
        'mild': 0.8,      # 轻微哮喘，风险降低20%
        'moderate': 1.0,  # 中等，不调整
        'severe': 1.5     # 严重，风险增加50%
    }
    
    # 触发因素敏感性
    trigger_sensitivity = calculate_trigger_sensitivity(triggers, climate_data)
    
    # 个性化risk_score
    personalized_risk = base_risk * severity_multiplier[severity] * trigger_sensitivity
    
    return personalized_risk
```

## 🚀 下一步

我可以开始实现：
1. 历史数据收集服务
2. 预测算法设计
3. 个性化risk_score计算

你希望我先实现哪个部分？

