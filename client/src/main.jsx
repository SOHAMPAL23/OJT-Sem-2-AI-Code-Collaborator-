import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Loginpage from './loginpage.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import DashboardPage from './Dashboard.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Loginpage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route path='/editor' element={<App/>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
