import { Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Home } from './pages/Home'
import { GlobalOverview } from './pages/Global/Overview'
import { NYCPage } from './pages/NYC/Dashboard'
import { Login } from './pages/Auth/Login'
import { Signup } from './pages/Auth/Signup'
import { Profile } from './pages/Profile/Profile'
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
          <Route path="/nyc" element={<NYCPage />} />
          <Route path="/auth" element={<Login />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
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
