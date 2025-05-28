import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, signupUser } from '../../../services/api';
import GoogleLoginButton from '../../../GoogleLoginButton';
import '../../../loginpage.css';

const LoginForm = ({ isLogin, setIsLogin, needsVerification, setNeedsVerification }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [verificationCode, setVerificationCode] = useState('');
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
        if (response.data.username) {
          localStorage.setItem('username', response.data.username);
        }
        navigate('/dashboard');
      } else if (response.data && response.data.needsVerification) {
        setNeedsVerification(true);
        if (response.data.username) {
          setUsername(response.data.username);
          localStorage.setItem('username', response.data.username);
        }
        setErrors({ auth: 'Please check your email for the verification code' });
      } else {
        setErrors({ auth: response.data.msg || 'Success' });
      }
    } catch (err) {
      console.error('Authentication failed:', err);
      if (err.response?.data?.needsVerification) {
        setNeedsVerification(true);
        if (err.response.data.username) {
          setUsername(err.response.data.username);
          localStorage.setItem('username', err.response.data.username);
        }
        setErrors({ auth: 'Please check your email for the verification code' });
      } else {
        const errorMessage = err.response?.data?.msg || 'Authentication failed.';
        setErrors(prev => ({
          ...prev,
          auth: errorMessage
        }));
      }
    }
  };

  const handleVerification = async () => {
    if (!verificationCode.trim()) {
      setErrors({ verificationCode: 'Verification code is required' });
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode, username, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        if (data.username) {
          localStorage.setItem('username', data.username);
        }
        navigate('/dashboard');
      } else {
        setErrors({ verificationCode: data.msg || 'Verification failed' });
      }
    } catch (err) {
      console.error('Verification failed:', err);
      setErrors({ verificationCode: 'Verification failed. Please try again.' });
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      alert(data.msg || 'Verification code sent');
    } catch (err) {
      console.error('Resend failed:', err);
      alert('Failed to resend verification code');
    }
  };

  return (
    <>
      {needsVerification ? (
        <form onSubmit={(e) => e.preventDefault()}>
          {errors.auth && <p className="error-text">{errors.auth}</p>}
          <div className="form-group">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter verification code"
            />
            {errors.verificationCode && (
              <p className="error-text">{errors.verificationCode}</p>
            )}
          </div>
          <button type="button" onClick={handleVerification}>
            Verify Email
          </button>
          <button 
            type="button" 
            onClick={handleResendCode}
            className="resend-button"
          >
            Resend Code
          </button>
        </form>
      ) : (
        <>
          <form onSubmit={(e) => e.preventDefault()}>
            {errors.auth && <p className="error-text">{errors.auth}</p>}
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

            <div className="switch-text">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <span
                className="switch-link"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setUsername('');
                  setEmail('');
                  setPassword('');
                  setErrors({});
                }}
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </span>
            </div>
          </form>

          {!needsVerification && (
            <div id="google-login">
              <GoogleLoginButton />
            </div>
          )}
        </>
      )}
    </>
  );
};

export default LoginForm; 