import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Transactions from './pages/Transactions';
import GameNumberPredictor from './pages/GameNumberPredictor';
import GamePlinko from './pages/GamePlinko';
import ProtectedRoute from './components/ProtectedRoute';
import AdminManualDeposits from './pages/AdminManualDeposits';
import AdminManualWithdraws from './pages/AdminManualWithdraws';
import Wallet from './pages/Wallet';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/games/number-predictor" 
        element={
          <ProtectedRoute>
            <GameNumberPredictor />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/games/plinko" 
        element={
          <ProtectedRoute>
            <GamePlinko />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/transactions" 
        element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/wallet" 
        element={
          <ProtectedRoute>
            <Wallet />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/manual-deposits" 
        element={
          <ProtectedRoute>
            <AdminManualDeposits />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/manual-withdraws" 
        element={
          <ProtectedRoute>
            <AdminManualWithdraws />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
