import React from 'react';

const Settings = ({ onBack, settings, onSettingChange }) => {
  return (
    <div className="settings-panel">
      <div className="panel-header">
        <button className="back-btn" onClick={onBack}>
          <span>←</span> Back
        </button>
        <h3>Settings</h3>
      </div>
      
      <div className="settings-container">
        <div className="settings-group">
          <h4>General</h4>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => onSettingChange('notifications', e.target.checked)}
              />
              Enable Notifications
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => onSettingChange('soundEnabled', e.target.checked)}
              />
              Enable Sound
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => onSettingChange('autoSave', e.target.checked)}
              />
              Auto Save
            </label>
          </div>
        </div>

        <div className="settings-group">
          <h4>Editor</h4>
          <div className="setting-item">
            <label>Code Theme</label>
            <select
              value={settings.codeTheme}
              onChange={(e) => onSettingChange('codeTheme', e.target.value)}
            >
              <option value="vs-dark">Dark</option>
              <option value="vs-light">Light</option>
              <option value="hc-black">High Contrast</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Font Size</label>
            <input
              type="number"
              value={settings.fontSize}
              onChange={(e) => onSettingChange('fontSize', parseInt(e.target.value))}
              min="8"
              max="24"
            />
          </div>
          <div className="setting-item">
            <label>Tab Size</label>
            <input
              type="number"
              value={settings.tabSize}
              onChange={(e) => onSettingChange('tabSize', parseInt(e.target.value))}
              min="2"
              max="8"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 