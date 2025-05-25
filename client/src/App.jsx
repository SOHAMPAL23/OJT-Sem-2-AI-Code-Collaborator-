import Loginpage from './loginpage.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
const App = () => {
  return (
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
          <Route path='/editor' element={<EditorPage/>} />
        </Routes>
  )
}

export default App;