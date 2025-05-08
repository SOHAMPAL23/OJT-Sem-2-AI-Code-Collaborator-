import React, { useState } from 'react';
import './loginPage.css';
import backgroundImg from './assets/dark-theme-background-81dcsdpd3515z7k3.jpg';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail || !trimmedPassword) {
      alert('Please enter both email and password.');
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (trimmedPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    if (isLogin) {
      alert(`Logged in as ${trimmedEmail}`);
      // window.location.href = 'teacherHomePage.html'; // Uncomment for redirect
    } else {
      alert(`Account created for ${trimmedEmail}`);
      setIsLogin(true);
    }
  };

  return (
    <div className="form-container">
      <img src={backgroundImg} alt="Background" className="background-image" />
      <div className="container">
        <div className="form">
          <h1> Code Crux</h1>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleAuth}>
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
          <p>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <span
              onClick={() => setIsLogin(!isLogin)}
              style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
