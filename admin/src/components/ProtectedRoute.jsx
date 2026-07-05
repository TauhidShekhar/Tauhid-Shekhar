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
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If authenticated but role not authorized, redirect to frontend homepage
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const isProductionPort = window.location.port !== '5173' && window.location.port !== '5174';
    const defaultClientPort = isProductionPort ? window.location.port : '5173';
    const clientUrl = (import.meta.env.VITE_CLIENT_URL && import.meta.env.VITE_CLIENT_URL !== 'undefined' && import.meta.env.VITE_CLIENT_URL !== 'null')
      ? import.meta.env.VITE_CLIENT_URL
      : `${protocol}//${hostname}${defaultClientPort ? `:${defaultClientPort}` : ''}`;
    window.location.href = clientUrl;
    return null;
  }

  return children;
};

export default ProtectedRoute;
