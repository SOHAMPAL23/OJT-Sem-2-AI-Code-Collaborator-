import React from 'react';
import darkImage from '../../../assets/Your paragraph text.png';
import lightImage from '../../../assets/lightThemeImage.png';

const MainContent = () => {
  const isLightTheme = document.body.classList.contains('light-theme');
  const currentImage = isLightTheme ? lightImage : darkImage;

  return (
    <>
      <div className="main-content" id='first-content'>
        <div className="main-image-container">
          <img src={currentImage} alt="code-crux" className="main-image" />
        </div>
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