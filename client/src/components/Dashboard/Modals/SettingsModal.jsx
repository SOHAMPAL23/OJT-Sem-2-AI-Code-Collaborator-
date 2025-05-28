import React from 'react';

const SettingsModal = ({ 
  isOpen, 
  onClose, 
  settings, 
  onThemeChange, 
  onNotificationToggle,
  onLogout 
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="settings-modal" id="settingsModal">
        <div className="settings-content">
          <div className="settings-header">
            <h2>Settings</h2>
            <button className="close-settings" onClick={onClose}>&times;</button>
          </div>
          
          <div className="settings-body">
            <div className="settings-section">
              <h3>Theme</h3>
              <div className="theme-switcher">
                <button 
                  className={`theme-btn ${settings.theme === 'dark' ? 'active' : ''}`}
                  onClick={() => onThemeChange('dark')}
                >
                  <i className="fas fa-moon"></i> Dark
                </button>
                <button 
                  className={`theme-btn ${settings.theme === 'light' ? 'active' : ''}`}
                  onClick={() => onThemeChange('light')}
                >
                  <i className="fas fa-sun"></i> Light
                </button>
              </div>
            </div>

            <div className="settings-section">
              <h3>Notifications</h3>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.notifications}
                  onChange={(e) => onNotificationToggle(e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Enable Notifications</span>
              </label>
            </div>

            <div className="logout-section">
              <button className="logout-btn" onClick={onLogout}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="overlay" onClick={onClose}></div>
    </>
  );
};

export default SettingsModal; 