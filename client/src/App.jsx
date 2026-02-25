import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignUpPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'

/**
 * App.jsx is the main component/container of the React application. 
 * This is where the routes are defined.
 * @returns the main component of the React application
 */
function App() {

  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN PAGE ROUTE */}
        <Route path="/" element={<LoginPage />} />    
        <Route path="/login" element={<LoginPage />} />
        
        {/* SIGN UP PAGE ROUTE */}
        <Route path="/signup" element={<SignupPage />} />   

        <Route path="/dashboard" element={<DashboardPage />} />


      </Routes>
    </BrowserRouter>
  )
}

export default App