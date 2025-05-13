import React, { useEffect } from 'react';

const GoogleLoginButton = () => {
  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID, // Access the Google Client ID from the .env file
      callback: handleCredentialResponse,
    });

    google.accounts.id.renderButton(
      document.getElementById('google-login'),
      { theme: 'outline', size: 'large' }
    );
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (data.token) {
        // Store JWT token in local storage
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard'; // Redirect to the dashboard
      } else {
        alert('Google login failed');
      }
    } catch (error) {
      console.error('Error during Google login:', error);
      alert('Google login failed');
    }
  };

  return <div id="google-login"></div>;
};

export default GoogleLoginButton;
