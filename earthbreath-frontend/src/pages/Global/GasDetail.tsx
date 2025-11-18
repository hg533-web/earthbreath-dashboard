import { useParams, Link } from 'react-router-dom'
import './GasDetail.css'

const gasInfo: Record<string, { name: string; symbol: string; description: string }> = {
  co2: { name: 'Carbon Dioxide', symbol: 'CO₂', description: 'Carbon Dioxide' },
  ch4: { name: 'Methane', symbol: 'CH₄', description: 'Methane' },
  n2o: { name: 'Nitrous Oxide', symbol: 'N₂O', description: 'Nitrous Oxide' },
  sf6: { name: 'Sulfur Hexafluoride', symbol: 'SF₆', description: 'Sulfur Hexafluoride' },
}

export function GasDetail() {
  const { gasId } = useParams<{ gasId: string }>()
  const gas = gasId ? gasInfo[gasId] : null

  if (!gas) {
    return (
      <div className="page-container">
        <div className="error-message">
          <h2>Gas type not found</h2>
          <Link to="/global/gases">Return to gas list</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <Link to="/global/gases" className="back-link">← Return to gas list</Link>
        <h1>{gas.name} ({gas.symbol})</h1>
        <p>{gas.description} - Detailed analysis of time and regional dimensions</p>
      </div>

      <section className="filters-section">
        <div className="filter-card">
          <h3>Time Filter</h3>
          <p>Select time range (year/month/day)</p>
        </div>
        <div className="filter-card">
          <h3>Region Filter</h3>
          <p>Select countries/regions for comparison</p>
        </div>
      </section>

      <section className="gas-dashboard">
        <div className="gas-section">
          <h2>Time Trend Analysis</h2>
          <div className="visualization-placeholder">
            <p>Time series chart placeholder area</p>
            <p>Display historical trends and forecast data for {gas.symbol}</p>
          </div>
        </div>

        <div className="gas-section">
          <h2>Regional Comparison Analysis</h2>
          <div className="visualization-placeholder">
            <p>Regional comparison chart placeholder area</p>
            <p>Display {gas.symbol} emission data comparison across different countries/regions</p>
          </div>
        </div>

        <div className="gas-section">
          <h2>Related Indicators</h2>
          <div className="visualization-placeholder">
            <p>Related indicators visualization placeholder area</p>
            <p>Display other climate indicators related to {gas.symbol}</p>
          </div>
        </div>
      </section>
    </div>
  )
}

