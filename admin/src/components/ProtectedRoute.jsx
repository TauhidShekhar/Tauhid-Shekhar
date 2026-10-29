import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppLoader from './common/AppLoader';

const ProtectedRoute = ({ children, allowedRoles = ['Admin'] }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AppLoader isLoading={isLoading} />;
  }

  if (!isAuthenticated) {
    // Redirect to login page, preserving path to redirect back later
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If authenticated but role not authorized, redirect standard user to their user dashboard
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const clientUrl = (import.meta.env.VITE_CLIENT_URL && import.meta.env.VITE_CLIENT_URL !== 'undefined' && import.meta.env.VITE_CLIENT_URL !== 'null')
      ? import.meta.env.VITE_CLIENT_URL
      : (isLocal ? 'http://localhost:5173' : 'https://tauhidshekhar.com');
    window.location.href = `${clientUrl}/user/dashboard`;
    return null;
  }

  return children;
};

export default ProtectedRoute;
