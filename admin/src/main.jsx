import './services/fetchInterceptor';
import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Auth context and protection wrappers
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import AppLoader from './components/common/AppLoader.jsx';

// Loading Screen Fallback Spinner
const LoadingScreen = () => (
  <AppLoader isLoading={true} />
);

// Auth Pages (Lazy Loaded)
const Auth = lazy(() => import('./admin/Auth.jsx'));
const ForgotPassword = lazy(() => import('./admin/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./admin/ResetPassword.jsx'));
const VerifyEmail = lazy(() => import('./admin/VerifyEmail.jsx'));
const RecoverAccount = lazy(() => import('./admin/RecoverAccount.jsx'));

// Admin CMS Panel Layout & Dashboards
import AdminLayout from './admin/AdminLayout.jsx';
import Dashboard from './admin/Dashboard.jsx';

// Core CMS Managers (Lazy Loaded)
const HeroManager = lazy(() => import('./admin/HeroManager.jsx'));
const AboutManager = lazy(() => import('./admin/AboutManager.jsx'));
const SkillsManager = lazy(() => import('./admin/SkillsManager.jsx'));
const ProjectsManager = lazy(() => import('./admin/ProjectsManager.jsx'));
const ExperienceManager = lazy(() => import('./admin/ExperienceManager.jsx'));
const EducationManager = lazy(() => import('./admin/EducationManager.jsx'));
const AchievementsManager = lazy(() => import('./admin/AchievementsManager.jsx'));
const CertificatesManager = lazy(() => import('./admin/CertificatesManager.jsx'));
const ResumeManager = lazy(() => import('./admin/ResumeManager.jsx'));
const BlogManager = lazy(() => import('./admin/BlogManager.jsx'));
const TestimonialsManager = lazy(() => import('./admin/TestimonialsManager.jsx'));
const GalleryManager = lazy(() => import('./admin/GalleryManager.jsx'));
const MessagesInbox = lazy(() => import('./admin/MessagesInbox.jsx'));
const OrdersManager = lazy(() => import('./admin/OrdersManager.jsx'));
const ServicesManager = lazy(() => import('./admin/ServicesManager.jsx'));

// Utility & System Configuration Panels (Lazy Loaded)
const MediaLibrary = lazy(() => import('./admin/MediaLibrary.jsx'));
const DoubtsManager = lazy(() => import('./admin/DoubtsManager.jsx'));
const UsersManager = lazy(() => import('./admin/UsersManager.jsx'));
const AuditLogs = lazy(() => import('./admin/AuditLogs.jsx'));
const SettingsManager = lazy(() => import('./admin/SettingsManager.jsx'));
const SEOManager = lazy(() => import('./admin/SEOManager.jsx'));
const ThemeSettings = lazy(() => import('./admin/ThemeSettings.jsx'));
const AnalyticsManager = lazy(() => import('./admin/AnalyticsManager.jsx'));
const PerformanceManager = lazy(() => import('./admin/PerformanceManager.jsx'));
const BackupManager = lazy(() => import('./admin/BackupManager.jsx'));
const ProfileManager = lazy(() => import('./admin/ProfileManager.jsx'));
const SecurityManager = lazy(() => import('./admin/SecurityManager.jsx'));
const CommunityCMS = lazy(() => import('./admin/CommunityCMS.jsx'));
const FeatureManagement = lazy(() => import('./admin/FeatureManagement.jsx'));
const FormsManager = lazy(() => import('./admin/FormsManager.jsx'));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
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
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="cms" element={<HeroManager />} />
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
              <Route path="doubts" element={<DoubtsManager />} />
              <Route path="users" element={<UsersManager />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="settings" element={<SettingsManager />} />
              <Route path="seo" element={<SEOManager />} />
              <Route path="theme" element={<ThemeSettings />} />
              <Route path="analytics" element={<AnalyticsManager />} />
              <Route path="performance" element={<PerformanceManager />} />
              <Route path="backup" element={<BackupManager />} />
              <Route path="profile" element={<ProfileManager />} />
              <Route path="security" element={<SecurityManager />} />
              <Route path="community" element={<CommunityCMS />} />
              <Route path="features" element={<FeatureManagement />} />
              <Route path="forms" element={<FormsManager />} />
            </Route>

            {/* Fallback to Admin Dashboard */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
