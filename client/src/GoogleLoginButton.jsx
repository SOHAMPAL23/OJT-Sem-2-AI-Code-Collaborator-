import React, { useEffect } from 'react';

const GoogleLoginButton = () => {
  const handleCredentialResponse = async (response) => {
    try {
      const res = await fetch('http://localhost:5001/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard';
      } else {
        alert('Google login failed');
      }
    } catch (error) {
      console.error('Error during Google login:', error);
      alert('Google login failed');
    }
  };

  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-login'),
          {   theme: "filled_black",
            size: "large",
            type: "standard",
            }
        );
      } else {
        console.error('Google API not loaded');
      }
    };

    const interval = setInterval(() => {
      if (window.google && window.google.accounts) {
        clearInterval(interval);
        initializeGoogle();
      }
    }, 100);

    setTimeout(() => clearInterval(interval), 5001);
  }, []);

  return <div id="google-login"></div>;
};

export default GoogleLoginButton;
