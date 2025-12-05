"""
AI Summary API endpoint - Generates intelligent summaries of global air quality data.
Uses Hugging Face Inference API when HF_TOKEN is available, falls back to template-based generation.
"""
from fastapi import APIRouter
from pydantic import BaseModel
import os
import random
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/ai", tags=["AI"])

# Check if HF_TOKEN is available
HF_TOKEN = os.environ.get("HF_TOKEN")


class CitySummaryRequest(BaseModel):
    """Request model for AI summary generation."""
    avgAQI: float
    avgBreathability: float
    totalCities: int
    avgTemperature: float
    totalPopulation: float  # in millions
    percentGoodBreathability: float
    percentPoorBreathability: float
    mostPollutedCity: str
    mostPollutedAQI: int
    cleanestCity: str
    cleanestAQI: int


class AISummaryResponse(BaseModel):
    """Response model for AI summary."""
    summary: str
    highlights: list[str]
    recommendation: str
    dataTimestamp: str
    aiPowered: bool = False


class DashboardInsightsRequest(BaseModel):
    """Request for all dashboard AI insights."""
    avgAQI: float
    avgBreathability: float
    totalCities: int
    avgTemperature: float
    totalPopulation: float
    percentGood: float
    percentModerate: float
    percentPoor: float
    populationGood: float
    populationModerate: float
    populationPoor: float
    pollutedCities: list[dict]
    cleanestCities: list[dict]


class ForecastDay(BaseModel):
    """Single day forecast."""
    date: str
    dayName: str
    status: str
    statusClass: str
    aiInsight: str


class DashboardInsightsResponse(BaseModel):
    """Response with AI insights for all dashboard cards."""
    # Planetary Breath Score
    breathScoreAdvice: str
    healthStatus: str
    
    # Climate Vital Signs
    vitalSignsInsight: str
    trendAnalysis: str
    
    # Air Quality Forecast
    forecast: list[ForecastDay]
    forecastSummary: str
    
    # Global Extremes
    pollutedAnalysis: str
    cleanAnalysis: str
    
    # Population Impact
    populationInsight: str
    healthRecommendation: str
    
    aiPowered: bool = False
    timestamp: str


def get_aqi_category(aqi: float) -> tuple[str, str]:
    """Get AQI category and health implication."""
    if aqi <= 50:
        return "Good", "Air quality is satisfactory with little to no risk."
    elif aqi <= 100:
        return "Moderate", "Air quality is acceptable but may concern sensitive groups."
    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups", "People with respiratory issues should limit outdoor exposure."
    elif aqi <= 200:
        return "Unhealthy", "Everyone may experience health effects; sensitive groups more severely."
    elif aqi <= 300:
        return "Very Unhealthy", "Health warnings activated. Entire population affected."
    else:
        return "Hazardous", "Emergency conditions. Serious health effects for everyone."


def generate_forecast(avg_aqi: float) -> list[ForecastDay]:
    """Generate 5-day AI-enhanced forecast."""
    forecasts = []
    today = datetime.now()
    
    # Simulate realistic variations based on current AQI
    base_aqi = avg_aqi
    variations = [0, -5, +15, +8, -10]  # Daily variations
    
    for i in range(5):
        day = today + timedelta(days=i)
        day_name = day.strftime("%A")
        date_str = day.strftime("%b %d")
        
        # Calculate forecasted AQI with some variation
        forecast_aqi = base_aqi + variations[i] + random.randint(-5, 5)
        forecast_aqi = max(10, min(300, forecast_aqi))  # Clamp values
        
        # Determine status
        if forecast_aqi <= 50:
            status = "Good"
            status_class = "status-good"
            insights = [
                "🌿 Excellent for outdoor activities",
                "✨ Great day for exercise outdoors",
                "🏃 Perfect conditions for running/cycling"
            ]
        elif forecast_aqi <= 100:
            status = "Moderate"
            status_class = "status-moderate"
            insights = [
                "⚠️ Sensitive groups should take precautions",
                "🌤️ Generally acceptable but monitor conditions",
                "👀 Keep an eye on local air quality updates"
            ]
        else:
            status = "Unhealthy"
            status_class = "status-unhealthy"
            insights = [
                "🏠 Consider indoor activities",
                "😷 Masks recommended for outdoor exposure",
                "⚡ Limit prolonged outdoor exertion"
            ]
        
        forecasts.append(ForecastDay(
            date=date_str if i > 0 else "Today",
            dayName=day_name[:3] if i > 0 else "Today",
            status=status,
            statusClass=status_class,
            aiInsight=random.choice(insights)
        ))
    
    return forecasts


def generate_template_dashboard_insights(data: DashboardInsightsRequest) -> DashboardInsightsResponse:
    """Generate AI-enhanced insights for all dashboard cards using templates."""
    
    aqi_category, _ = get_aqi_category(data.avgAQI)
    
    # Planetary Breath Score insights
    if data.avgBreathability >= 80:
        breath_advice = "🌟 Excellent global conditions! Most regions ideal for outdoor activities."
        health_status = "Thriving"
    elif data.avgBreathability >= 60:
        breath_advice = "⚡ Good overall, but monitor high-risk regions before outdoor plans."
        health_status = "Healthy"
    elif data.avgBreathability >= 40:
        breath_advice = "⚠️ Mixed conditions globally. Check local air quality before going out."
        health_status = "At Risk"
    else:
        breath_advice = "🚨 Critical attention needed. Many regions experiencing poor air quality."
        health_status = "Critical"
    
    # Climate Vital Signs insights
    vital_insights = [
        f"📈 Global average AQI of {data.avgAQI:.0f} indicates {aqi_category.lower()} conditions across {data.totalCities} monitored cities.",
        f"🌡️ Temperature averaging {data.avgTemperature:.1f}°C globally - {'higher than seasonal norms' if data.avgTemperature > 20 else 'within expected range'}.",
        f"🔬 Monitoring reveals {'improving trends' if data.avgAQI < 80 else 'areas of concern requiring attention'}.",
    ]
    
    trend_analysis = [
        "📉 CO₂ levels continue gradual rise; global initiatives showing limited impact",
        "📊 Sea level change +3.4mm/yr consistent with climate projections",
        "🌍 Urban areas showing mixed progress on emission reduction goals"
    ]
    
    # Global Extremes insights
    top_polluted = data.pollutedCities[0] if data.pollutedCities else {"name": "Unknown", "aqi": 0}
    top_clean = data.cleanestCities[0] if data.cleanestCities else {"name": "Unknown", "aqi": 0}
    
    polluted_insights = [
        f"🏭 {top_polluted.get('name', 'Unknown')} leads with AQI {top_polluted.get('aqi', 0)} - industrial emissions and traffic are primary factors",
        f"⚠️ Top 3 polluted cities show AQI 3-5x above safe thresholds - health warnings in effect",
        f"📍 Regional patterns suggest seasonal pollution buildup in South Asian cities"
    ]
    
    clean_insights = [
        f"🌿 {top_clean.get('name', 'Unknown')} exemplifies clean urban development with AQI of just {top_clean.get('aqi', 0)}",
        f"✅ Cleanest cities share: strong environmental policies, green zones, and clean energy adoption",
        f"🎯 These cities demonstrate achievable air quality goals for growing urban centers"
    ]
    
    # Population Impact insights
    pop_insights = [
        f"👥 {data.populationPoor:.0f}M people ({data.percentPoor:.0f}%) live in areas with poor breathability - urgent action needed",
        f"🏙️ Urban populations in developing regions disproportionately affected by air pollution",
        f"📈 {data.populationGood:.0f}M ({data.percentGood:.0f}%) enjoy healthy air - success models to replicate"
    ]
    
    health_recs = [
        "💡 Indoor air purifiers recommended for high-AQI regions. Monitor local forecasts daily.",
        "🏃 Schedule outdoor activities during low-AQI hours (typically early morning).",
        "🌱 Support local green initiatives - urban forestry reduces PM2.5 by up to 25%."
    ]
    
    # Generate forecast
    forecast = generate_forecast(data.avgAQI)
    
    forecast_summary = f"5-day outlook: {'Mostly favorable' if sum(1 for f in forecast if f.status == 'Good') >= 3 else 'Mixed conditions expected'}. {random.choice(['Best days:', 'Pack masks:'])} {', '.join([f.dayName for f in forecast if f.status == 'Good'][:2]) or 'Limited good days ahead'}."
    
    return DashboardInsightsResponse(
        breathScoreAdvice=breath_advice,
        healthStatus=health_status,
        vitalSignsInsight=random.choice(vital_insights),
        trendAnalysis=random.choice(trend_analysis),
        forecast=forecast,
        forecastSummary=forecast_summary,
        pollutedAnalysis=random.choice(polluted_insights),
        cleanAnalysis=random.choice(clean_insights),
        populationInsight=random.choice(pop_insights),
        healthRecommendation=random.choice(health_recs),
        aiPowered=False,
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M UTC")
    )


async def generate_llm_summary(data: CitySummaryRequest) -> AISummaryResponse | None:
    """Generate summary using Hugging Face LLM API."""
    if not HF_TOKEN:
        return None
    
    try:
        from openai import OpenAI
        
        client = OpenAI(
            base_url="https://router.huggingface.co/v1",
            api_key=HF_TOKEN,
        )
        
        prompt = f"""You are an environmental data analyst. Based on the following global air quality data, provide a concise analysis:

Data Summary:
- Monitoring {data.totalCities} cities with {data.totalPopulation:.1f} million people
- Average AQI: {data.avgAQI:.0f}
- Average Breathability Index: {data.avgBreathability:.0f}%
- Average Temperature: {data.avgTemperature:.1f}°C
- {data.percentGoodBreathability}% of population has good air quality
- {data.percentPoorBreathability}% of population has poor air quality
- Cleanest city: {data.cleanestCity} (AQI: {data.cleanestAQI})
- Most polluted city: {data.mostPollutedCity} (AQI: {data.mostPollutedAQI})

Provide your response in this exact JSON format:
{{
  "summary": "A 2-3 sentence overview of global air quality conditions",
  "highlights": ["Key insight 1 with emoji", "Key insight 2 with emoji", "Key insight 3 with emoji"],
  "recommendation": "One actionable recommendation for the general public"
}}

Keep the response concise and data-driven."""

        completion = client.chat.completions.create(
            model="moonshotai/Kimi-K2-Instruct-0905",
            messages=[
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7,
        )
        
        response_text = completion.choices[0].message.content
        
        # Parse JSON from response
        import json
        # Try to extract JSON from the response
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1
        if start_idx != -1 and end_idx > start_idx:
            json_str = response_text[start_idx:end_idx]
            parsed = json.loads(json_str)
            
            return AISummaryResponse(
                summary=parsed.get("summary", "Analysis unavailable"),
                highlights=parsed.get("highlights", [])[:4],
                recommendation=parsed.get("recommendation", "Monitor local conditions"),
                dataTimestamp=datetime.now().strftime("%Y-%m-%d %H:%M UTC"),
                aiPowered=True
            )
    except Exception as e:
        print(f"LLM API error: {e}")
        return None
    
    return None


def generate_template_summary(data: CitySummaryRequest) -> AISummaryResponse:
    """Generate summary using templates (fallback)."""
    
    aqi_category, health_note = get_aqi_category(data.avgAQI)
    
    # Build contextual insights
    insights = []
    
    if data.percentPoorBreathability > 30:
        insights.append(f"⚠️ {data.percentPoorBreathability}% of monitored population lives in areas with poor air quality")
    elif data.percentGoodBreathability > 60:
        insights.append(f"✅ {data.percentGoodBreathability}% of monitored population enjoys good breathability")
    
    aqi_diff = data.mostPollutedAQI - data.cleanestAQI
    insights.append(f"📊 AQI disparity of {aqi_diff} points between {data.cleanestCity} ({data.cleanestAQI}) and {data.mostPollutedCity} ({data.mostPollutedAQI})")
    
    if data.avgTemperature > 25:
        insights.append(f"🌡️ Warm global average of {data.avgTemperature}°C may amplify ozone formation")
    elif data.avgTemperature < 10:
        insights.append(f"❄️ Cool conditions ({data.avgTemperature}°C) may increase particulate matter from heating")
    
    summary_templates = [
        f"Based on analysis of {data.totalCities} global cities representing {data.totalPopulation:.1f}M people, the current global air quality index averages {data.avgAQI:.0f} ({aqi_category}). {health_note}",
        f"Monitoring {data.totalCities} cities worldwide with a combined population of {data.totalPopulation:.1f}M, the average AQI of {data.avgAQI:.0f} indicates {aqi_category.lower()} conditions. The global breathability score stands at {data.avgBreathability:.0f}%.",
    ]
    
    if data.avgAQI <= 50:
        recommendation = "Current conditions are favorable for outdoor activities worldwide. Continue monitoring for localized variations."
    elif data.avgAQI <= 100:
        recommendation = "Sensitive individuals should monitor local conditions before prolonged outdoor activities."
    else:
        recommendation = "Consider limiting outdoor exposure in high-AQI regions. Check local forecasts before outdoor plans."
    
    return AISummaryResponse(
        summary=random.choice(summary_templates),
        highlights=insights[:4],
        recommendation=recommendation,
        dataTimestamp=datetime.now().strftime("%Y-%m-%d %H:%M UTC"),
        aiPowered=False
    )


@router.post("/summary", response_model=AISummaryResponse)
async def get_ai_summary(request: CitySummaryRequest):
    """
    Generate an AI-powered summary of global air quality data.
    
    Uses Hugging Face LLM when HF_TOKEN is set, otherwise uses template-based generation.
    """
    # Try LLM first
    llm_result = await generate_llm_summary(request)
    if llm_result:
        return llm_result
    
    # Fallback to template
    return generate_template_summary(request)


@router.post("/dashboard-insights", response_model=DashboardInsightsResponse)
async def get_dashboard_insights(request: DashboardInsightsRequest):
    """
    Generate AI insights for all dashboard cards.
    
    Provides intelligent analysis for:
    - Planetary Breath Score recommendations
    - Climate Vital Signs trend analysis
    - Air Quality Forecast with daily insights
    - Global Extremes city analysis
    - Population Breathability Impact assessment
    """
    return generate_template_dashboard_insights(request)


@router.get("/health")
async def ai_health_check():
    """Health check for AI service."""
    return {
        "status": "healthy", 
        "mode": "llm" if HF_TOKEN else "template-based",
        "hf_token_set": bool(HF_TOKEN)
    }

