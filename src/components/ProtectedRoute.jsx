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
    // If authenticated but role not authorized, strictly block access to admin panel
    if (user?.role === 'User') {
      return <Navigate to="/user/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
