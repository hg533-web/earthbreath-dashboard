import { useState } from 'react'
import './Settings.css'

export function Settings() {
  const [settings, setSettings] = useState({
    language: 'English',
    timezone: 'UTC-5 (EST)',
    emailNotifications: true,
    darkMode: true,
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSavePreferences = () => {
    // Here you would save to backend/localStorage
    localStorage.setItem('userPreferences', JSON.stringify(settings))
    setSaveMessage({ type: 'success', text: 'Preferences saved successfully!' })
    setTimeout(() => setSaveMessage(null), 3000)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSaveMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setSaveMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    // Here you would call the backend API to change password
    setSaveMessage({ type: 'success', text: 'Password changed successfully!' })
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setTimeout(() => setSaveMessage(null), 3000)
  }

  return (
    <div className="page-container settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your application preferences and account settings</p>
      </div>

      {saveMessage && (
        <div className={`message ${saveMessage.type}`}>
          {saveMessage.text}
        </div>
      )}

      <section className="settings-sections">
        <div className="settings-section">
          <h2>Application Preferences</h2>
          <div className="settings-card">
            <div className="setting-item">
              <label>Language</label>
              <select 
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
              >
                <option>English</option>
                <option>中文</option>
                <option>Español</option>
                <option>Français</option>
              </select>
            </div>
            <div className="setting-item">
              <label>Timezone</label>
              <select 
                value={settings.timezone}
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
              >
                <option>UTC-5 (EST)</option>
                <option>UTC-4 (EDT)</option>
                <option>UTC+0 (GMT)</option>
                <option>UTC+8 (CST)</option>
                <option>UTC+9 (JST)</option>
              </select>
            </div>
            <div className="setting-item">
              <label className="checkbox-label">
                <input 
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                />
                <span>Enable email notifications</span>
              </label>
            </div>
            <div className="setting-item">
              <label className="checkbox-label">
                <input 
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                />
                <span>Dark mode</span>
              </label>
            </div>
            <button className="save-button" onClick={handleSavePreferences}>
              Save Preferences
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h2>Security Settings</h2>
          <div className="settings-card">
            <div className="setting-item">
              <label>Current Password</label>
              <input 
                type="password" 
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••" 
              />
            </div>
            <div className="setting-item">
              <label>New Password</label>
              <input 
                type="password" 
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••" 
              />
            </div>
            <div className="setting-item">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••" 
              />
            </div>
            <button className="save-button" onClick={handleChangePassword}>
              Change Password
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h2>Data Management</h2>
          <div className="settings-card">
            <div className="setting-item">
              <p className="setting-description">
                Export your personal data and preferences in JSON format.
              </p>
              <button className="secondary-button">
                Export Data
              </button>
            </div>
            <div className="setting-item">
              <p className="setting-description">
                Delete all your personal data and account. This action cannot be undone.
              </p>
              <button className="danger-button">
                Delete Account
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>About</h2>
          <div className="settings-card">
            <div className="setting-item">
              <p className="setting-description">
                <strong>EarthBreath</strong> - Climate & Health Insights Platform
              </p>
              <p className="setting-description">
                Version 1.0.0
              </p>
              <p className="setting-description">
                Monitor global climate indicators, NYC local climate data, and receive personalized health recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
