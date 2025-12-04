import './Overview.css'
import { InteractiveGlobe } from '../../components/InteractiveGlobe'
import citiesData from '../../data/mock_cities.json'

export function GlobalOverview() {
  // Calculate aggregates
  const avgAQI = Math.round(citiesData.reduce((acc, city) => acc + city.aqi, 0) / citiesData.length);
  const avgBreathability = Math.round((citiesData.reduce((acc, city) => acc + city.breathability_index, 0) / citiesData.length) * 100);
  const avgTemp = (citiesData.reduce((acc, city) => acc + city.metrics.temperature, 0) / citiesData.length).toFixed(1);

  // Get extremes
  const sortedByAQI = [...citiesData].sort((a, b) => a.aqi - b.aqi);
  const cleanest = sortedByAQI.slice(0, 3);
  const polluted = sortedByAQI.slice(-3).reverse();

  // Calculate population breathability impact
  const totalPopulation = citiesData.reduce((acc, city) => acc + city.population, 0);
  
  // Categorize cities by breathability
  const goodBreathability = citiesData.filter(city => city.breathability_index >= 0.75);
  const moderateBreathability = citiesData.filter(city => city.breathability_index >= 0.50 && city.breathability_index < 0.75);
  const poorBreathability = citiesData.filter(city => city.breathability_index < 0.50);
  
  const populationGood = goodBreathability.reduce((acc, city) => acc + city.population, 0);
  const populationModerate = moderateBreathability.reduce((acc, city) => acc + city.population, 0);
  const populationPoor = poorBreathability.reduce((acc, city) => acc + city.population, 0);
  
  const percentGood = Math.round((populationGood / totalPopulation) * 100);
  const percentModerate = Math.round((populationModerate / totalPopulation) * 100);
  const percentPoor = Math.round((populationPoor / totalPopulation) * 100);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Global Climate Dashboard</h1>
        <p>Overview and visualization of global climate indicators</p>
      </div>

      <section className="dashboard-grid">
        <div className="dashboard-card large" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Global Map Visualization</h2>
            <div style={{ fontSize: '0.9rem', color: '#8892b0' }}>
              <span style={{ marginRight: '15px' }}><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#00e676', marginRight: '5px' }}></span>Healthy</span>
              <span style={{ marginRight: '15px' }}><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#ffeb3b', marginRight: '5px' }}></span>Moderate</span>
              <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#f44336', marginRight: '5px' }}></span>Unhealthy</span>
            </div>
          </div>
          <InteractiveGlobe />
        </div>
        <div className="dashboard-card">
          <h2>Planetary Breath Score</h2>
          <div className="breath-score-container">
            <div className="gauge-circle">
              <span className="score-value">{avgBreathability}</span>
            </div>
            <span className="score-label">{avgBreathability > 70 ? 'Good Health' : 'Moderate Health'}</span>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Climate Vital Signs</h2>
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">CO₂ Levels</span>
              <span className="metric-value">421 <span className="trend-arrow trend-up">↑</span></span>
              <span style={{ fontSize: '0.8rem', color: '#8892b0' }}>ppm</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Global Avg Temp</span>
              <span className="metric-value">{avgTemp} <span className="trend-arrow trend-up">↑</span></span>
              <span style={{ fontSize: '0.8rem', color: '#8892b0' }}>°C</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Global Avg AQI</span>
              <span className="metric-value">{avgAQI} <span className="trend-arrow trend-down">↓</span></span>
              <span style={{ fontSize: '0.8rem', color: '#8892b0' }}>US AQI</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Sea Level</span>
              <span className="metric-value">+3.4 <span className="trend-arrow trend-up">↑</span></span>
              <span style={{ fontSize: '0.8rem', color: '#8892b0' }}>mm/yr</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Air Quality Forecast</h2>
          <div className="forecast-list">
            <div className="forecast-item">
              <span className="forecast-date">Today (Dec 5, Fri)</span>
              <span className={`forecast-status ${avgAQI <= 50 ? 'status-good' : 'status-moderate'}`}>
                {avgAQI <= 50 ? 'Good' : 'Moderate'}
              </span>
            </div>
            <div className="forecast-item">
              <span className="forecast-date">Tomorrow (Sat)</span>
              <span className="forecast-status status-good">Good</span>
            </div>
            <div className="forecast-item">
              <span className="forecast-date">Sun, Dec 7</span>
              <span className="forecast-status status-unhealthy">Unhealthy</span>
            </div>
            <div className="forecast-item">
              <span className="forecast-date">Mon, Dec 8</span>
              <span className="forecast-status status-moderate">Moderate</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Global Extremes</h2>
          <div className="extremes-container">
            <div className="extremes-column">
              <h4 style={{ color: '#f44336', margin: '0 0 10px 0' }}>Most Polluted</h4>
              {polluted.map(city => (
                <div key={city.id} className="extreme-item">
                  <span>{city.name}</span>
                  <span className="extreme-value bad">{city.aqi}</span>
                </div>
              ))}
            </div>
            <div className="extremes-column">
              <h4 style={{ color: '#00e676', margin: '0 0 10px 0' }}>Cleanest Air</h4>
              {cleanest.map(city => (
                <div key={city.id} className="extreme-item">
                  <span>{city.name}</span>
                  <span className="extreme-value good">{city.aqi}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Population Breathability Impact</h2>
          <div className="breathability-impact-container">
            <div className="impact-summary">
              <div className="impact-stat">
                <span className="impact-label">Total Monitored</span>
                <span className="impact-value">{(totalPopulation / 1000000).toFixed(1)}M</span>
                <span className="impact-unit">people</span>
              </div>
            </div>
            
            <div className="breathability-breakdown">
              <div className="breakdown-item good-breath">
                <div className="breakdown-header">
                  <span className="breakdown-label">Good Breathability</span>
                  <span className="breakdown-percent">{percentGood}%</span>
                </div>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill good-fill" 
                    style={{ width: `${percentGood}%` }}
                  ></div>
                </div>
                <div className="breakdown-population">
                  {(populationGood / 1000000).toFixed(1)}M people
                </div>
              </div>
              
              <div className="breakdown-item moderate-breath">
                <div className="breakdown-header">
                  <span className="breakdown-label">Moderate Breathability</span>
                  <span className="breakdown-percent">{percentModerate}%</span>
                </div>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill moderate-fill" 
                    style={{ width: `${percentModerate}%` }}
                  ></div>
                </div>
                <div className="breakdown-population">
                  {(populationModerate / 1000000).toFixed(1)}M people
                </div>
              </div>
              
              <div className="breakdown-item poor-breath">
                <div className="breakdown-header">
                  <span className="breakdown-label">Poor Breathability</span>
                  <span className="breakdown-percent">{percentPoor}%</span>
                </div>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill poor-fill" 
                    style={{ width: `${percentPoor}%` }}
                  ></div>
                </div>
                <div className="breakdown-population">
                  {(populationPoor / 1000000).toFixed(1)}M people
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

