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
    const rawAdminUrl = import.meta.env.VITE_ADMIN_URL;
    const adminUrl = (rawAdminUrl && rawAdminUrl !== 'undefined' && rawAdminUrl !== 'null')
      ? rawAdminUrl
      : (window.location.port === '5173' || window.location.port === '5174'
          ? `${window.location.protocol}//${window.location.hostname}:5174`
          : 'https://tauhidshekhar-admin.vercel.app');
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
