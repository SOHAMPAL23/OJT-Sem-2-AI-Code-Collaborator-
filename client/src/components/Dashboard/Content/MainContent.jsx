import React from 'react';
import mainImage from '../../../assets/Your paragraph text.png';

const MainContent = () => {
  return (
    <>
      <div className="main-content" id='first-content'>
        <img src={mainImage} alt="code-crux" className="main-image" />
      </div>

      <div className="info-box">
        <h1 className="line1">Welcome to Code Crux </h1>
        <h1 className="line2">Code Crux lets developers collaborate in real-time with powerful editing tools</h1>
        <h1 className="line3">Create private rooms, join public ones, and build amazing code together seamlessly</h1>
      </div>
    </>
  );
};

export default MainContent; 