import React, { useState } from 'react';
import './loginpage.css';
import backgroundImg from './assets/programming-concept-illustration_114360-1351-removebg-preview.png';
import { loginUser, signupUser } from './services/api';
import { useNavigate } from 'react-router-dom';

const Loginpage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleAuth = async () => {
    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) newErrors.email = 'Email is required.';
    else if (!emailRegex.test(email)) newErrors.email = 'Invalid email format.';

    if (!password.trim()) newErrors.password = 'Password is required.';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.';

    if (!isLogin && !username.trim()) newErrors.username = 'Username is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const response = isLogin
        ? await loginUser({ email, password })
        : await signupUser({ username, email, password });

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard');
      } else {
        alert(response.data.msg || 'Success');
      }
    } catch (err) {
      console.error('Authentication failed:', err);
      alert(err.response?.data?.msg || 'Authentication failed.');
    }
  };

  const toggleTheme = () => setIsDarkTheme(!isDarkTheme);

  return (
    <div className={`app-container ${isDarkTheme ? 'dark' : 'light'}`}>
      <div className="main-flex">
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

        <div className="right-side">
          <div className="form-container">
            <div className="rightSide-text">
              <h1 className="title">Code Crux</h1>
              <h2 className="subtitle">{isLogin ? 'Login to Your Account' : 'Create New Account'}</h2>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
              {!isLogin && (
                <div className="form-group">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
                  {errors.username && <p className="error-text">{errors.username}</p>}
                </div>
              )}
              <div className="form-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="error-text">{errors.email}</p>}
              </div>
              <div className="form-group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
                {errors.password && <p className="error-text">{errors.password}</p>}
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
                  setEmail('');
                  setErrors({});
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

export default Loginpage;
