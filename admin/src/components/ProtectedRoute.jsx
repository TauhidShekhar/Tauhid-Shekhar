import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = ['Admin'] }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page, preserving path to redirect back later
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If authenticated but role not authorized, redirect to frontend homepage
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const clientUrl = (import.meta.env.VITE_CLIENT_URL && import.meta.env.VITE_CLIENT_URL !== 'undefined' && import.meta.env.VITE_CLIENT_URL !== 'null')
      ? import.meta.env.VITE_CLIENT_URL
      : (isLocal ? 'http://localhost:5173' : 'https://tauhidshekhar.vercel.app');
    window.location.href = clientUrl;
    return null;
  }

  return children;
};

export default ProtectedRoute;
