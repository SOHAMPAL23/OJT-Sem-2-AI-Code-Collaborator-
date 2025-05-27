import React from 'react';
import LeftSide from './LeftSide/LeftSide';
import RightSide from './RightSide/RightSide';
import '../../loginpage.css';

const Login = () => {
  return (
    <div className="app-container dark">
      <div className="main-flex">
        <LeftSide />
        <RightSide />
      </div>
    </div>
  );
};

export default Login; 