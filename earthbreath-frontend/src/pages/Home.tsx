import './Home.css'

export function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <p className="eyebrow">Dashboard Preview</p>
        <h1>Global & NYC Climate Health Monitoring Platform</h1>
        <p>
          This project includes global climate indicators, individual greenhouse gas pages,
          NYC local climate and asthma data, as well as user authentication and settings.
          Currently, we're building the layout and navigation framework.
        </p>
      </section>

      <section className="grid">
        <article className="card">
          <h2>Global Dashboard</h2>
          <p>Overview cards, global map, and placeholder areas for time and region filters.</p>
        </article>
        <article className="card">
          <h2>Individual Gas Pages</h2>
          <p>Trend and regional comparison for each gas type, placeholder modules await data.</p>
        </article>
        <article className="card">
          <h2>NYC Dashboard</h2>
          <p>Visualization layout for NYC climate, asthma cases, and hospital resources.</p>
        </article>
        <article className="card">
          <h2>Auth & Settings</h2>
          <p>Login, registration, and personal preference settings placeholder forms.</p>
        </article>
      </section>
    </div>
  )
}

