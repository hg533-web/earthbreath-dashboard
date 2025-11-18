import './Dashboard.css'

export function NYCDashboard() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>NYC Climate & Health Dashboard</h1>
        <p>NYC local climate data, asthma cases, and hospital resources visualization</p>
      </div>

      <section className="nyc-tabs">
        <div className="tab-section active">
          <h2>Climate Data</h2>
          <div className="content-grid">
            <div className="content-card">
              <h3>Air Quality Index (AQI)</h3>
              <p>AQI data visualization placeholder area</p>
            </div>
            <div className="content-card">
              <h3>Temperature Trends</h3>
              <p>NYC temperature data placeholder area</p>
            </div>
            <div className="content-card">
              <h3>Humidity & Precipitation</h3>
              <p>Humidity and precipitation data placeholder area</p>
            </div>
          </div>
        </div>

        <div className="tab-section">
          <h2>Asthma Data</h2>
          <div className="content-grid">
            <div className="content-card">
              <h3>Asthma Case Rate</h3>
              <p>Asthma case rate visualization by region/time placeholder</p>
            </div>
            <div className="content-card">
              <h3>Asthma-Related Indicators</h3>
              <p>Asthma-related health indicator data placeholder</p>
            </div>
            <div className="content-card large">
              <h3>Regional Distribution</h3>
              <p>Map visualization placeholder for asthma data across NYC regions</p>
            </div>
          </div>
        </div>

        <div className="tab-section">
          <h2>Asthma Hospital Data</h2>
          <div className="content-grid">
            <div className="content-card large">
              <h3>Hospital Distribution Map</h3>
              <p>NYC asthma-related hospital locations map placeholder</p>
            </div>
            <div className="content-card">
              <h3>Hospital Resource Statistics</h3>
              <p>Resource statistics placeholder: beds, number of doctors, etc.</p>
            </div>
            <div className="content-card">
              <h3>Visit Data</h3>
              <p>Asthma-related visit data visualization placeholder</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

