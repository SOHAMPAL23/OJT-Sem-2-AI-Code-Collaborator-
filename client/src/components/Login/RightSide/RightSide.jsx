import React, { useState } from 'react';
import LoginForm from './LoginForm';
import Title from './Title';
import '../../../loginpage.css';

const RightSide = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);

  return (
    <div className="right-side">
      <div className="form-container">
        <Title isLogin={isLogin} needsVerification={needsVerification} />
        <LoginForm 
          isLogin={isLogin} 
          setIsLogin={setIsLogin}
          needsVerification={needsVerification}
          setNeedsVerification={setNeedsVerification}
        />
      </div>
    </div>
  );
};

export default RightSide; 