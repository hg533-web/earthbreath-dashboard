import './Settings.css'

export function Settings() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account and preferences</p>
      </div>

      <section className="settings-sections">
        <div className="settings-section">
          <h2>Personal Information</h2>
          <div className="settings-card">
            <div className="setting-item">
              <label>Name</label>
              <input type="text" placeholder="John Doe" />
            </div>
            <div className="setting-item">
              <label>Email</label>
              <input type="email" placeholder="your.email@example.com" />
            </div>
            <div className="setting-item">
              <label>Phone</label>
              <input type="tel" placeholder="+1 (555) 000-0000" />
            </div>
            <button className="save-button">Save Changes</button>
          </div>
        </div>

        <div className="settings-section">
          <h2>Preferences</h2>
          <div className="settings-card">
            <div className="setting-item">
              <label>Language</label>
              <select>
                <option>English</option>
                <option>中文</option>
              </select>
            </div>
            <div className="setting-item">
              <label>Timezone</label>
              <select>
                <option>UTC-5 (EST)</option>
                <option>UTC+8 (CST)</option>
              </select>
            </div>
            <div className="setting-item">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Enable email notifications</span>
              </label>
            </div>
            <div className="setting-item">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Dark mode</span>
              </label>
            </div>
            <button className="save-button">Save Preferences</button>
          </div>
        </div>

        <div className="settings-section">
          <h2>Security Settings</h2>
          <div className="settings-card">
            <div className="setting-item">
              <label>Current Password</label>
              <input type="password" placeholder="••••••••" />
            </div>
            <div className="setting-item">
              <label>New Password</label>
              <input type="password" placeholder="••••••••" />
            </div>
            <div className="setting-item">
              <label>Confirm New Password</label>
              <input type="password" placeholder="••••••••" />
            </div>
            <button className="save-button">Change Password</button>
          </div>
        </div>
      </section>
    </div>
  )
}

