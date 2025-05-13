import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Loginpage from './loginpage.jsx';
import { BrowserRouter,Routes, Route } from 'react-router-dom';
import App from './App.jsx'
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Loginpage />} />
        <Route path="/dashboard" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
