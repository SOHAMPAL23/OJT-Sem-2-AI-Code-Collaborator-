import React from 'react';
import backgroundImg from '../../../assets/Untitled design-Photoroom.png';
import '../../../loginpage.css';

const LeftSide = () => {
  return (
    <div className="left-side">
      <img
        src={backgroundImg}
        alt="Login Illustration"
        className="illustration"
      />
    </div>
  );
};

export default LeftSide; 