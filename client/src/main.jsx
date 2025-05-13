<<<<<<< Updated upstream
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import Loginpage from './loginpage.jsx';
=======
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Loginpage from './loginpage.jsx'
import App from './App.jsx'
>>>>>>> Stashed changes

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Loginpage />
    </BrowserRouter>
  </StrictMode>
);
