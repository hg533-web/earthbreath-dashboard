import { Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Home } from './pages/Home'
import { GlobalOverview } from './pages/Global/Overview'
import { GasPages } from './pages/Global/GasPages'
import { GasDetail } from './pages/Global/GasDetail'
import { NYCPage } from './pages/NYC/Dashboard'
import { Login } from './pages/Auth/Login'
import { Signup } from './pages/Auth/Signup'
import { Settings } from './pages/Settings/Settings'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Header />
      
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/global" element={<GlobalOverview />} />
          <Route path="/global/gases" element={<GasPages />} />
          <Route path="/global/gases/:gasId" element={<GasDetail />} />
          <Route path="/nyc" element={<NYCPage />} />
          <Route path="/auth" element={<Login />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      <footer className="app-footer">
        © {new Date().getFullYear()} EarthBreath Coursework Dashboard
      </footer>
    </div>
  )
}

export default App
