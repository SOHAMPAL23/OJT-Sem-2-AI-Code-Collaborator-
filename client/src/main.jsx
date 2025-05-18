import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Loginpage from './loginpage.jsx';
import { BrowserRouter,Routes, Route } from 'react-router-dom';
import Dashboard from './dashboard.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Loginpage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
