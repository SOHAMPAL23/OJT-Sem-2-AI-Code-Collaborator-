import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children }) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return <Navigate to="/" replace />;
    }

    const decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();
    
    if (isExpired) {
      localStorage.removeItem('token');
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (err) {
    console.error('Auth error:', err);
    localStorage.removeItem('token');
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute; 