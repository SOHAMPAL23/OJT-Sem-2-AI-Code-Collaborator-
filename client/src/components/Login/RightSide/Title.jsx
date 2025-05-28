import React from 'react';
import '../../../loginpage.css';

const Title = ({ isLogin, needsVerification }) => {
  return (
    <div className="rightSide-text">
      <h1 className="title">
        <span>Code</span>
        <span>Crux</span>
      </h1>
      {needsVerification && (
        <h2 className="subtitle">
          Verify Your Email
        </h2>
      )}
    </div>
  );
};

export default Title; 