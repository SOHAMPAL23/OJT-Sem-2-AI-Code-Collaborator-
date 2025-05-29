import Loginpage from './loginpage.jsx';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';

import DashboardPage from './Dashboard.jsx';
import EditorPage from './EditorPage.jsx';

const App = () => {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/login" element={<Loginpage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>

          } 
        />
        <Route path='/editor' element={<EditorPage/>} />
        
      </Routes>
    </ThemeProvider>
  )
}

export default App;