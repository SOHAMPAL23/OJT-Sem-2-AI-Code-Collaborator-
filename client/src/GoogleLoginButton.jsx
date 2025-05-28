import React, { useEffect } from 'react';
import axios from 'axios';

const GoogleLoginButton = ({ onSuccess, onError }) => {
  useEffect(() => {
    // Load the Google Sign-In script
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      return script;
    };

    const script = loadGoogleScript();

    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "454613848457-l15i54840fb0b9356ca9f4ifqjvuqab7.apps.googleusercontent.com",
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'rectangular',
            text: 'continue_with',
            width: 'auto'
          }
        );
      }
    };

    // Wait for the script to load
    script.onload = initializeGoogleSignIn;

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      console.log("Google response:", response);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/google-login`,
        {
          credential: response.credential,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (res.data.user) {
        if (typeof onSuccess === 'function') {
          onSuccess(res.data);
        } else {
          console.log('Login successful:', res.data);
        }
      }
    } catch (error) {
      console.error('Error during Google login:', error);
      if (typeof onError === 'function') {
        onError(error);
      }
    }
  };

  return (
    <div 
      id="google-signin-button"
      className="google-login-button"
      style={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center',
        minHeight: '40px'
      }}
    />
  );
};

export default GoogleLoginButton;
