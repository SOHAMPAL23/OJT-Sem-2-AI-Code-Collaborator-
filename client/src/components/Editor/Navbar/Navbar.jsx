import React from 'react';
import { useNavigate } from 'react-router-dom';
import backImage from '../../../assets/icons8-back-button-48.png';

const Navbar = ({ handleRoomClick, handleProfileClick }) => {
  const navigate = useNavigate();

  const goBackToDashboardPge = () => {
    navigate('/dashboard');
  };

  return (
    <nav className="header">
      <div className="header-container">
      <div className="logo">
        <img src={backImage} onClick={goBackToDashboardPge} alt="Back" />
        
          <h1>Code Crux</h1>
        </div>
        <div className="nav">
          <button className="nav-link">Home</button>
          <button className="nav-link" onClick={handleRoomClick}>Room</button>
          <button className="nav-link" onClick={handleProfileClick}>Profile</button>
        </div>
        <button className="share-btn">Share</button>
      </div>
    </nav>
  );
};

export default Navbar; 