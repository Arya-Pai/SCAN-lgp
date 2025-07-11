import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/Authorization_Authentication/Login';
import Signup from '../components/Authorization_Authentication/Signup';
import Navbar from '../components/Navbar/Navbar';
import AdminDashboard from '../components/AdminDashboard/AdminDashboard';
import Events from '../components/Events/Events';
import Notices from '../components/Notices/Notices';
import Homepage from '../components/Homepage/Homepage';
import './App.css';

function App() {
  // Initialize state from local storage or default values
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  );
  const [userRole, setUserRole] = useState(
    localStorage.getItem('userRole') || 'no'
  );

  // Update local storage whenever isLoggedIn or userRole changes
  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
    localStorage.setItem('userRole', userRole);
  }, [isLoggedIn, userRole]);

  // Handle login by receiving the role from the Login component
  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('no');
    // Clear local storage on logout
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
  };

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} userRole={userRole} />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/admin/dashboard" 
          element={
            isLoggedIn && userRole === 'yes' ? 
              <AdminDashboard /> : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/events" 
          element={
            isLoggedIn ? 
              <Events /> : 
              <Navigate to="/login" />
          } 
        />
        <Route path="/notices" element={<Notices />} />
      </Routes>
    </Router>
  );
}

export default App;