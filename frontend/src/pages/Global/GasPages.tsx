import { Link } from 'react-router-dom'
import './GasPages.css'

const gases = [
  { id: 'co2', name: 'Carbon Dioxide', symbol: 'CO₂', description: 'Carbon Dioxide' },
  { id: 'ch4', name: 'Methane', symbol: 'CH₄', description: 'Methane' },
  { id: 'n2o', name: 'Nitrous Oxide', symbol: 'N₂O', description: 'Nitrous Oxide' },
  { id: 'sf6', name: 'Sulfur Hexafluoride', symbol: 'SF₆', description: 'Sulfur Hexafluoride' },
]

export function GasPages() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Individual Gas Pages</h1>
        <p>Select a gas to view detailed time and regional dimension data analysis</p>
      </div>

      <section className="gases-grid">
        {gases.map((gas) => (
          <Link key={gas.id} to={`/global/gases/${gas.id}`} className="gas-card">
            <div className="gas-header">
              <span className="gas-symbol">{gas.symbol}</span>
              <h2>{gas.name}</h2>
            </div>
            <p className="gas-description">{gas.description}</p>
            <div className="gas-features">
              <span>Time Trends</span>
              <span>•</span>
              <span>Regional Comparison</span>
              <span>•</span>
              <span>Related Indicators</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}

