import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Login from './components/Login/Login';
import './loginpage.css';

const Loginpage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const isExpired = decoded.exp * 1000 < Date.now();
          if (!isExpired) {
            navigate('/dashboard');
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error('Token decode error:', err);
          localStorage.removeItem('token');
        }
      }
    } catch (err) {
      console.error('localStorage access error:', err);
    }
  }, [navigate]);

  return <Login />;
};

export default Loginpage;
