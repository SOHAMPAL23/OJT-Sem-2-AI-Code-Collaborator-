import React, { useState } from 'react';
import './loginpage.css';
import backgroundImg from './assets/programming-concept-illustration_114360-1351-removebg-preview.png';

const App = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const handleAuth = () => {
    console.log(isLogin ? 'Logging in' : 'Signing up', { username, email, password });
  };

  const toggleTheme = () => setIsDarkTheme(!isDarkTheme);

  return (
    <div className={`app-container ${isDarkTheme ? 'dark' : 'light'}`}>
      <div className="main-flex">
        {/* Left Side */}
        <div className="left-side">
          <button
            onClick={toggleTheme}
            className={`theme-button ${isDarkTheme ? 'dark-theme-btn' : 'light-theme-btn'}`}
            aria-label="Toggle Theme"
          >
            <i className={`fas ${isDarkTheme ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
          
           <img src={backgroundImg} alt="Background" className="illustration" />
        </div>

        {/* Right Side */}
        <div className="right-side">
          <div className="form-container">
            <div className="rightSide-text">
              <h1 className="title">Code Crux</h1>
              <h2 className="subtitle">
                {isLogin ? 'Login to Your Account' : 'Create New Account'}
              </h2>
            </div>
            <form>
              {!isLogin && (
                <div className="form-group">
                  
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
                </div>
              )}
              <div className="form-group">
                
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              <button type="button" onClick={handleAuth}>
                {isLogin ? 'Login' : 'Sign Up'}
              </button>
            </form>
            <p className="switch-text">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <span
                className="switch-link"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setUsername('');
                }}
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
