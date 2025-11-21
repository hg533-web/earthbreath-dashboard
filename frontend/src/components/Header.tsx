import { Link, useLocation } from 'react-router-dom'
import './Header.css'

const navLinks = [
  { label: 'Global Overview', path: '/global' },
  { label: 'Gas Pages', path: '/global/gases' },
  { label: 'NYC Dashboard', path: '/nyc' },
  { label: 'Auth', path: '/auth' },
  { label: 'Settings', path: '/settings' },
]

export function Header() {
  const location = useLocation()

  return (
    <header className="app-header">
      <Link to="/" className="brand">
        <span className="brand-mark" />
        <div>
          <p className="brand-title">EarthBreath</p>
          <p className="brand-subtitle">Climate & Health Insights</p>
        </div>
      </Link>

      <nav className="main-nav">
        {navLinks.map((link) => {
          const isActive = location.pathname.startsWith(link.path)
          return (
            <Link
              key={link.label}
              to={link.path}
              className={isActive ? 'nav-link active' : 'nav-link'}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      <Link to="/auth" className="cta-button">
        Get Started
      </Link>
    </header>
  )
}





