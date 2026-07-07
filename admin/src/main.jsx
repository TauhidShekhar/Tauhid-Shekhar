import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Auth context and protection wrappers
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Auth Pages
import Auth from './admin/Auth.jsx';
import ForgotPassword from './admin/ForgotPassword.jsx';
import ResetPassword from './admin/ResetPassword.jsx';
import VerifyEmail from './admin/VerifyEmail.jsx';
import RecoverAccount from './admin/RecoverAccount.jsx';

// Admin CMS Panel Layout & Dashboards
import AdminLayout from './admin/AdminLayout.jsx';
import Dashboard from './admin/Dashboard.jsx';

// Core CMS Managers
import HeroManager from './admin/HeroManager.jsx';
import AboutManager from './admin/AboutManager.jsx';
import SkillsManager from './admin/SkillsManager.jsx';
import ProjectsManager from './admin/ProjectsManager.jsx';
import ExperienceManager from './admin/ExperienceManager.jsx';
import EducationManager from './admin/EducationManager.jsx';
import AchievementsManager from './admin/AchievementsManager.jsx';
import CertificatesManager from './admin/CertificatesManager.jsx';
import ResumeManager from './admin/ResumeManager.jsx';
import BlogManager from './admin/BlogManager.jsx';
import TestimonialsManager from './admin/TestimonialsManager.jsx';
import GalleryManager from './admin/GalleryManager.jsx';
import MessagesInbox from './admin/MessagesInbox.jsx';
import OrdersManager from './admin/OrdersManager.jsx';
import ServicesManager from './admin/ServicesManager.jsx';

// Utility & System Configuration Panels
import MediaLibrary from './admin/MediaLibrary.jsx';
import UsersManager from './admin/UsersManager.jsx';
import AuditLogs from './admin/AuditLogs.jsx';
import SettingsManager from './admin/SettingsManager.jsx';
import SEOManager from './admin/SEOManager.jsx';
import ThemeSettings from './admin/ThemeSettings.jsx';
import AnalyticsManager from './admin/AnalyticsManager.jsx';
import BackupManager from './admin/BackupManager.jsx';
import ProfileManager from './admin/ProfileManager.jsx';
import SecurityManager from './admin/SecurityManager.jsx';
import CommunityCMS from './admin/CommunityCMS.jsx';
import FeatureManagement from './admin/FeatureManagement.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Automatic Redirect from Root to Admin Panel */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/recover-account" element={<RecoverAccount />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          {/* Protected Admin CMS Dashboard Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="hero" element={<HeroManager />} />
            <Route path="about" element={<AboutManager />} />
            <Route path="skills" element={<SkillsManager />} />
            <Route path="projects" element={<ProjectsManager />} />
            <Route path="experience" element={<ExperienceManager />} />
            <Route path="education" element={<EducationManager />} />
            <Route path="achievements" element={<AchievementsManager />} />
            <Route path="certificates" element={<CertificatesManager />} />
            <Route path="resume" element={<ResumeManager />} />
            <Route path="blogs" element={<BlogManager />} />
            <Route path="testimonials" element={<TestimonialsManager />} />
            <Route path="gallery" element={<GalleryManager />} />
            <Route path="messages" element={<MessagesInbox />} />
            <Route path="orders" element={<OrdersManager />} />
            <Route path="services" element={<ServicesManager />} />
            <Route path="media" element={<MediaLibrary />} />
            <Route path="users" element={<UsersManager />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="settings" element={<SettingsManager />} />
            <Route path="seo" element={<SEOManager />} />
            <Route path="theme" element={<ThemeSettings />} />
            <Route path="analytics" element={<AnalyticsManager />} />
            <Route path="backup" element={<BackupManager />} />
            <Route path="profile" element={<ProfileManager />} />
            <Route path="security" element={<SecurityManager />} />
            <Route path="community" element={<CommunityCMS />} />
            <Route path="features" element={<FeatureManagement />} />
          </Route>

          {/* Fallback to Admin Dashboard */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
