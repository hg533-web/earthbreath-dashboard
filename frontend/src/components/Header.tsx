import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './Header.css'

const navLinks = [
  { label: 'Global Overview', path: '/global' },
  { label: 'NYC Dashboard', path: '/nyc' },
  { label: 'Profile', path: '/profile' },
  { label: 'Settings', path: '/settings' },
]

export function Header() {
  const location = useLocation()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Error loading user:', e)
    }
  }, [])

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

      {user ? (
        <button 
          className="cta-button"
          onClick={() => {
            localStorage.removeItem('user');
            window.location.href = '/auth/login';
          }}
        >
          Logout
        </button>
      ) : (
        <Link to="/auth/login" className="cta-button">
          Get Started
        </Link>
      )}
    </header>
  )
}





