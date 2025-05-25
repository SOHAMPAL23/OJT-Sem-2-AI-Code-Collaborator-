import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ isMenuOpen, toggleMenu, handleSettingsOpen }) => {
  const navigate = useNavigate();

  const navigateEditorPage = () => {
    navigate('/editor');
  };

  return (
    <div id="header">
      <div className="logo">
        <h1 className="logo-Code">Code</h1>
        <h1 className="logo-Crux">Crux</h1>
      </div>
      
      <button className="menu-toggle" onClick={toggleMenu}>
        <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
        <a href="#first-content" onClick={() => toggleMenu(false)}>Home</a>
        <a href="#features" onClick={() => toggleMenu(false)}>Features</a>
        <a href="#profile-section" onClick={() => toggleMenu(false)}>Profile</a>
        <a href="#footer" onClick={() => toggleMenu(false)}>About us</a>
      </div>
      
      <div className="header-buttons">
        <button className="code-Editor" onClick={navigateEditorPage}>Code Editor</button>
        <button className="setting" onClick={handleSettingsOpen}>Setting</button>
      </div>
    </div>
  );
};

export default Header; 