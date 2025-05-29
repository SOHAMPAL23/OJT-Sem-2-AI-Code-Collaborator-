import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ isMenuOpen, toggleMenu, handleSettingsOpen }) => {
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState('home');

  const navigateEditorPage = () => {
    navigate('/editor');
  };

  const handleLinkClick = (link) => {
    setActiveLink(link);
    toggleMenu(false);
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
        <a
          href="#first-content"
          onClick={() => handleLinkClick('home')}
          className={activeLink === 'home' ? 'active' : ''}
        >
          Home
        </a>
        <a
          href="#features"
          onClick={() => handleLinkClick('features')}
          className={activeLink === 'features' ? 'active' : ''}
        >
          Features
        </a>
        <a
          href="#profile-section"
          onClick={() => handleLinkClick('profile')}
          className={activeLink === 'profile' ? 'active' : ''}
        >
          Profile
        </a>
        <a
          href="#footer"
          onClick={() => handleLinkClick('about')}
          className={activeLink === 'about' ? 'active' : ''}
        >
          About us
        </a>
      </div>
      
      <div className="header-buttons">
        <button className="code-Editor" onClick={navigateEditorPage}>Code Editor</button>
        <button className="setting" onClick={handleSettingsOpen}>Setting</button>
      </div>
    </div>
  );
};

export default Header;
