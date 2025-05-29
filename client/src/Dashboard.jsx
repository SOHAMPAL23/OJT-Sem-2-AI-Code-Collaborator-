import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import Header from './components/Dashboard/Header/Header';
import MainContent from './components/Dashboard/Content/MainContent';
import Features from './components/Dashboard/Features/Features';
import ProfileModel from './components/Dashboard/Profile/Profile';
import Footer from './components/Dashboard/Footer/Footer';
import SettingsModal from './components/Dashboard/Modals/SettingsModal';

function DashboardPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settings, setSettings] = useState({
    notifications: localStorage.getItem('notifications') !== 'false'
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

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
    if (!settings.notifications) return; // Don't show if notifications are disabled
    
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

  const handleThemeChange = (newTheme) => {
    toggleTheme();
    showNotification(`${newTheme === 'light' ? 'Light' : 'Dark'} theme activated!`);
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
    setIsEditing(!isEditing);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleProfileSave = (updatedData) => {
    console.log('Updated profile:', updatedData);
  };

  // Menu toggle handler
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className='main-head-container'>
      <Header 
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        handleSettingsOpen={handleSettingsOpen}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleSettingsClose}
        settings={{ ...settings, theme }}
        onThemeChange={handleThemeChange}
        onNotificationToggle={handleNotificationToggle}
        onLogout={handleLogout}
      />

      <MainContent />
      <Features />
      
      <ProfileModel
        isEditing={isEditing}
        onEdit={handleProfileEdit}
        onSave={handleProfileSave}
        onClose={() => setIsEditing(false)}
        profileData={profileData}
        onChange={handleProfileChange}
      />

      <Footer />
    </div>
  );
}

export default DashboardPage;
