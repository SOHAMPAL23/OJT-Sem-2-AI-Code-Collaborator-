import { jwtDecode } from 'jwt-decode';

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateForm = ({ isLogin, username, email, password }) => {
  const errors = {};

  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!validateEmail(email)) {
    errors.email = 'Invalid email format.';
  }

  if (!password.trim()) {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  if (!isLogin && !username.trim()) {
    errors.username = 'Username is required.';
  }

  return errors;
};

export const checkToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch (err) {
    return false;
  }
};

export const setAuthData = (data) => {
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  if (data.username) {
    localStorage.setItem('username', data.username);
  }
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
}; 