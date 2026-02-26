import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/citizen/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import CoordinatorDashboard from './pages/coordinator/Dashboard';
import ManagerDashboard from './pages/manager/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/coordinator/dashboard" element={<CoordinatorDashboard />} />
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
