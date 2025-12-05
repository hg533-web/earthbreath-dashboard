import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './ClimateCharts.css';

interface ClimateChartsProps {
  zipcode: string;
  currentData: {
    aqi?: number | null;
    pm25?: number | null;
    pm10?: number | null;
    o3?: number | null;
    no2?: number | null;
    temperature?: number | null;
    humidity?: number | null;
    wind_speed?: number | null;
    pressure?: number | null;
  };
}

// Generate mock future forecast data for the next 7 days
const generateFutureData = (zipcode: string, currentData: ClimateChartsProps['currentData']) => {
  const data = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    // Generate forecast data with some variation (future prediction pattern)
    const variation = (Math.sin(i * 0.5) * 8) + (Math.cos(i * 0.3) * 5) + (zipcode.charCodeAt(0) % 5);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date.toISOString().split('T')[0],
      aqi: currentData.aqi ? Math.max(0, Math.min(300, currentData.aqi + variation)) : 45 + variation,
      temperature: currentData.temperature ? currentData.temperature + (variation * 0.5) : 20 + variation,
      humidity: currentData.humidity ? Math.max(0, Math.min(100, currentData.humidity + variation)) : 65 + variation,
      windSpeed: currentData.wind_speed ? Math.max(0, currentData.wind_speed + variation * 0.2) : 5 + variation,
      pm25: currentData.pm25 ? Math.max(0, currentData.pm25 + variation) : 15 + variation,
      pm10: currentData.pm10 ? Math.max(0, currentData.pm10 + variation) : 25 + variation,
      o3: currentData.o3 ? Math.max(0, currentData.o3 + variation) : 50 + variation,
      no2: currentData.no2 ? Math.max(0, currentData.no2 + variation) : 30 + variation,
    });
  }
  
  return data;
};

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return '#00e676';
  if (aqi <= 100) return '#ffeb3b';
  if (aqi <= 150) return '#ff9800';
  if (aqi <= 200) return '#f44336';
  return '#9c27b0';
};

const getBarColor = (value: number, max: number) => {
  const ratio = value / max;
  if (ratio <= 0.3) return '#00e676';
  if (ratio <= 0.6) return '#ffeb3b';
  if (ratio <= 0.8) return '#ff9800';
  return '#f44336';
};

export function ClimateCharts({ zipcode, currentData }: ClimateChartsProps) {
  const futureData = generateFutureData(zipcode, currentData);
  
  const maxPollutant = Math.max(
    ...futureData.map(d => Math.max(d.pm25, d.pm10, d.o3, d.no2))
  );

  return (
    <div className="climate-charts-container">
      <h2 className="charts-title">Climate Data Overview - Future Forecast</h2>
      <p className="charts-description">
        7-day future forecast for zip code {zipcode}
      </p>
      
      <div className="charts-grid">
        {/* 7-Day Air Quality Forecast */}
        <div className="chart-section">
          <h3>7-Day Air Quality Index (AQI) Forecast</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={futureData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  color: '#f0fdfa'
                }}
              />
              <Legend 
                wrapperStyle={{ color: '#a7f3d0' }}
              />
              <Line 
                type="monotone" 
                dataKey="aqi" 
                name="AQI"
                stroke={getAQIColor(futureData[futureData.length - 1]?.aqi || 50)}
                strokeWidth={2}
                dot={{ fill: getAQIColor(futureData[futureData.length - 1]?.aqi || 50), r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weather Parameters Forecast */}
        <div className="chart-section">
          <h3>Weather Parameters Forecast (7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={futureData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  color: '#f0fdfa'
                }}
              />
              <Legend 
                wrapperStyle={{ color: '#a7f3d0' }}
              />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                name="Temperature (°C)"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ fill: '#38bdf8', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="humidity" 
                name="Humidity (%)"
                stroke="#34d399"
                strokeWidth={2}
                dot={{ fill: '#34d399', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="windSpeed" 
                name="Wind Speed (m/s)"
                stroke="#fbbf24"
                strokeWidth={2}
                dot={{ fill: '#fbbf24', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pollutant Levels Forecast */}
        <div className="chart-section">
          <h3>Pollutant Levels Forecast (Day 1)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[futureData[0]]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  color: '#f0fdfa'
                }}
              />
              <Legend 
                wrapperStyle={{ color: '#a7f3d0' }}
              />
              <Bar 
                dataKey="pm25" 
                name="PM2.5 (μg/m³)"
                fill={getBarColor(futureData[0]?.pm25 || 0, maxPollutant)}
              />
              <Bar 
                dataKey="pm10" 
                name="PM10 (μg/m³)"
                fill={getBarColor(futureData[0]?.pm10 || 0, maxPollutant)}
              />
              <Bar 
                dataKey="o3" 
                name="O₃ (ppb)"
                fill={getBarColor(futureData[0]?.o3 || 0, maxPollutant)}
              />
              <Bar 
                dataKey="no2" 
                name="NO₂ (ppb)"
                fill={getBarColor(futureData[0]?.no2 || 0, maxPollutant)}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

