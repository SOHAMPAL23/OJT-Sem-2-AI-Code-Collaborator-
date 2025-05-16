import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import mainImage from './assets/Your paragraph text.png';

function DashboardPage() {
  // State management
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settings, setSettings] = useState({
    theme: localStorage.getItem('theme') || 'dark',
    notifications: localStorage.getItem('notifications') !== 'false'
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    languages: '',
    field: '',
    experience: '',
    bio: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  // Apply theme effect
  useEffect(() => {
    document.body.classList.toggle('light-theme', settings.theme === 'light');
  }, [settings.theme]);

  // Add Font Awesome CSS
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Notification handlers
  const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  // Settings handlers
  const handleThemeChange = (theme) => {
    setSettings(prev => ({ ...prev, theme }));
    localStorage.setItem('theme', theme);
    showNotification('Theme updated!');
  };

  const handleNotificationToggle = (checked) => {
    setSettings(prev => ({ ...prev, notifications: checked }));
    localStorage.setItem('notifications', checked);
    showNotification(checked ? 'Notifications enabled!' : 'Notifications disabled!');
  };

  const handleSettingsOpen = () => {
    setIsSettingsOpen(true);
    document.body.classList.add('modal-open');
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
    document.body.classList.remove('modal-open');
  };

  // Profile handlers
  const handleProfileEdit = () => {
    if (isEditing) {
      setIsEditing(false);
      showNotification('Profile updated successfully!');
    } else {
      setIsEditing(true);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      showNotification('Logging out...');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    }
  };

  // Add menu toggle handler
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className='main-head-container'>
        <div id="header">
          <div className="logo">
            <h1 className="logo-Code">Code</h1>
            <h1 className="logo-Crux">Crux</h1>
          </div>
          
          {/* Add hamburger menu button */}
          <button className="menu-toggle" onClick={toggleMenu}>
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>

          {/* Add isMenuOpen class to nav-links */}
          <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
            <a href="#header" onClick={() => setIsMenuOpen(false)}>Home</a>
            <a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#profile-section" onClick={() => setIsMenuOpen(false)}>Profile</a>
            <a href="#footer" onClick={() => setIsMenuOpen(false)}>About us</a>
          </div>
          
          <div className="header-buttons">
            <button className="code-Editor">Code Editor</button>
            <button className="setting" onClick={handleSettingsOpen}>Setting</button>
          </div>
        </div>

        {/* Settings Modal */}
        {isSettingsOpen && (
          <>
            <div className="settings-modal" id="settingsModal">
              <div className="settings-content">
                <div className="settings-header">
                  <h2>Settings</h2>
                  <button className="close-settings" onClick={handleSettingsClose}>&times;</button>
                </div>
                
                <div className="settings-body">
                  <div className="settings-section">
                    <h3>Theme</h3>
                    <div className="theme-switcher">
                      <button 
                        className={`theme-btn ${settings.theme === 'dark' ? 'active' : ''}`}
                        onClick={() => handleThemeChange('dark')}
                      >
                        <i className="fas fa-moon"></i> Dark
                      </button>
                      <button 
                        className={`theme-btn ${settings.theme === 'light' ? 'active' : ''}`}
                        onClick={() => handleThemeChange('light')}
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
                        onChange={(e) => handleNotificationToggle(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">Enable Notifications</span>
                    </label>
                  </div>

                  <div className="logout-section">
                    <button className="logout-btn" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="overlay" onClick={handleSettingsClose}></div>
          </>
        )}

        <div className="main-content">
          <img src={mainImage} alt="code-crux" className="main-image" />
        </div>

      <div className="info-box">
        <h1 className="line1">Welcome to Code Crux </h1>
        <h1 className="line2">Code Crux lets developers collaborate in real-time with powerful editing tools</h1>
        <h1 className="line3">Create private rooms, join public ones, and build amazing code together seamlessly</h1>
      </div>

      <div id="features">
        <div className="features-headline">
          <h2 className="features-title">Features </h2>
          <h2 className="features-subtitle">We Provide</h2>
        </div>

        <div className="feature-box-container">
          <div className="feature-box1">
            <h3>Pair Programming</h3>
            <p>With integrated debugging tools, developers can collaborate to identify and fix issues in the codebase in real time. This feature allows teams to collaborate to debug together, share insights, and see the results of their changes instantly. Developers can also run tests, analyze outputs, and troubleshoot errors with ease, ensuring smoother development cycles. Additionally, pair programming, a practice where two developers work together on the same problem, is facilitated directly within the platform. One developer writes code while the other reviews it, making the process more efficient and reducing the chances of bugs.</p>
          </div>

          <div className="feature-box2">
            <h3>Real-Time Collaborative </h3>
            <p>This feature allows multiple developers to work on the same file or project simultaneously, with instant updates visible to all users. As each person types or modifies the code, everyone in the collaboration session sees the changes in real time. This eliminates the need for manually syncing changes, dramatically speeding up teamwork. Whether you're building a new feature or troubleshooting a bug, real-time collaborative editing ensures that all contributors are always working with the most current version of the code. It also eliminates the confusion and delays often caused by separate work sessions.</p>
          </div>

          <div className="feature-box1">
            <h3>File History & Code Export</h3>
            <p>The file tracking feature allows users to efficiently manage and download their project files in a compressed ZIP format, making it easier to share or back up their work. This feature enables developers to package their entire codebase, including all files, configurations, and assets, into a single ZIP file, which can be easily shared with teammates or transferred to other systems. By downloading the project as a ZIP, developers avoid the hassle of downloading files individually, saving time and ensuring that the entire project is bundled in one neatly compressed file.</p>
          </div>
        </div>
      </div>

      <div id="profile-section">
        <div className="profile-container">
          <h2 className="profile-title">Profile</h2>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={profileData.username}
              onChange={handleProfileChange}
              placeholder="Enter your username"
              readOnly={!isEditing}
            />
          </div>

          <div className="input-group">
            <label htmlFor="languages">Expertise Languages</label>
            <input
              type="text"
              id="languages"
              name="languages"
              value={profileData.languages}
              onChange={handleProfileChange}
              placeholder="e.g., JavaScript, Python, Java, C++"
              readOnly={!isEditing}
            />
          </div>

          <div className="input-group">
            <label htmlFor="field">Expertise Field</label>
            <input
              type="text"
              id="field"
              name="field"
              value={profileData.field}
              onChange={handleProfileChange}
              placeholder="e.g., Frontend Development, Backend Development"
              readOnly={!isEditing}
            />
          </div>

          <div className="input-group">
            <label htmlFor="experience">Experience (years)</label>
            <input
              type="number"
              id="experience"
              name="experience"
              value={profileData.experience}
              onChange={handleProfileChange}
              placeholder="Years of experience"
              readOnly={!isEditing}
            />
          </div>

          <div className="input-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={profileData.bio}
              onChange={handleProfileChange}
              placeholder="Tell us about yourself, your journey, and your passion for coding..."
              rows="5"
              readOnly={!isEditing}
            />
          </div>

          <button className="edit-profile" onClick={handleProfileEdit}>
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <footer id="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About Code Crux</h3>
            <p>Code Crux is a collaborative coding platform designed to make programming accessible and enjoyable. We provide real-time collaboration tools, helping developers work together seamlessly from anywhere in the world.</p>
          </div>

          <div className="footer-section">
            <h3>Contact & Support</h3>
            <ul>
              <li><i className="far fa-envelope"></i> support@codecrux.com</li>
              <li><i className="far fa-clock"></i> 24/7 Technical Support</li>
              <li><i className="far fa-comment"></i> Live Chat Available</li>
              <li><i className="far fa-question-circle"></i> FAQ & Help Center</li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Connect With Us</h3>
            <div className="social-links">
              <a href="https://github.com/SOHAMPAL23/OJT-Sem-2-AI-Code-Collaborator-" className="social-link">
                <i className="fab fa-github"></i>
              </a>
              <a href="#" className="social-link"><i className="fab fa-linkedin"></i></a>
              <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
              <a href="#" className="social-link"><i className="fab fa-discord"></i></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Code Crux. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default DashboardPage;