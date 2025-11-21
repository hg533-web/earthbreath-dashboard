import './Overview.css'

export function GlobalOverview() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Global Climate Dashboard</h1>
        <p>Overview and visualization of global climate indicators</p>
      </div>

      <section className="filters-section">
        <div className="filter-card">
          <h3>Time Filter</h3>
          <p>Time dimension filter placeholder (date range picker, etc.)</p>
        </div>
        <div className="filter-card">
          <h3>Region Filter</h3>
          <p>Region dimension filter placeholder (country/region selector, etc.)</p>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-card large">
          <h2>Global Map Visualization</h2>
          <p>Map component placeholder area showing global climate data distribution</p>
        </div>
        <div className="dashboard-card">
          <h2>Greenhouse Gas Overview</h2>
          <p>Overall data for main greenhouse gases: CO₂, CH₄, N₂O, etc.</p>
        </div>
        <div className="dashboard-card">
          <h2>Temperature Indicators</h2>
          <p>Global average temperature trend data</p>
        </div>
        <div className="dashboard-card">
          <h2>Other Key Indicators</h2>
          <p>Sea level, extreme weather, and other data placeholders</p>
        </div>
      </section>
    </div>
  )
}

