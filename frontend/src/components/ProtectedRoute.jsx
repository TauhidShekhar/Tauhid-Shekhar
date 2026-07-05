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
    // Redirect to external admin login on port 5174, passing the callback url
    const callbackUrl = window.location.origin + location.pathname + location.search;
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const isProductionPort = window.location.port !== '5173' && window.location.port !== '5174';
    const defaultAdminPort = isProductionPort ? window.location.port : '5174';
    const adminUrl = (import.meta.env.VITE_ADMIN_URL && import.meta.env.VITE_ADMIN_URL !== 'undefined' && import.meta.env.VITE_ADMIN_URL !== 'null')
      ? import.meta.env.VITE_ADMIN_URL
      : `${protocol}//${hostname}${defaultAdminPort ? `:${defaultAdminPort}` : ''}`;
    window.location.href = `${adminUrl}/admin/login?redirect=${encodeURIComponent(callbackUrl)}`;
    return (
      <div className="min-h-screen bg-[#09090c] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If authenticated but role not authorized, redirect to homepage
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
