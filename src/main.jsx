import './services/fetchInterceptor';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

// Auth context and protection wrappers
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Auth Pages
import Auth from './admin/Auth.jsx';
import ForgotPassword from './admin/ForgotPassword.jsx';
import ResetPassword from './admin/ResetPassword.jsx';
import VerifyEmail from './admin/VerifyEmail.jsx';

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
import UserDashboard from './admin/UserDashboard.jsx';

// Community Platform Pages
import CommunityLayout from './components/CommunityLayout.jsx';
import CommunityFeed from './components/CommunityFeed.jsx';
import CommunityGroups from './components/CommunityGroups.jsx';
import CommunityResources from './components/CommunityResources.jsx';
import CommunityCareers from './components/CommunityCareers.jsx';
import CommunityChat from './components/CommunityChat.jsx';
import CommunityProfile from './components/CommunityProfile.jsx';
import CommunityLeaderboard from './components/CommunityLeaderboard.jsx';
import CommunityNotifications from './components/CommunityNotifications.jsx';
import CommunityCMS from './admin/CommunityCMS.jsx';
import CommunityProjectDiscussions from './components/CommunityProjectDiscussions.jsx';
import CommunityDoubts from './components/CommunityDoubts.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Website Route */}
          <Route path="/" element={<App />} />

          {/* Public Auth Routes */}
          <Route path="/admin/login" element={<Auth />} />
          <Route path="/admin/register" element={<Auth />} />
          <Route path="/admin/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/reset-password/:token" element={<ResetPassword />} />
          <Route path="/admin/verify-email/:token" element={<VerifyEmail />} />

          {/* Protected User Dashboard Route */}
          <Route 
            path="/user/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['User', 'Admin']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin CMS Dashboard Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
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
          </Route>

          {/* Community Module Routes */}
          <Route 
            path="/community" 
            element={
              <ProtectedRoute allowedRoles={['User', 'Admin']}>
                <CommunityLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CommunityFeed />} />
            <Route path="chat" element={<CommunityChat />} />
            <Route path="groups" element={<CommunityGroups />} />
            <Route path="projects" element={<CommunityProjectDiscussions />} />
            <Route path="doubts" element={<CommunityDoubts />} />
            <Route path="resources" element={<CommunityResources />} />
            <Route path="jobs" element={<CommunityCareers />} />
            <Route path="leaderboard" element={<CommunityLeaderboard />} />
            <Route path="profile/:id" element={<CommunityProfile />} />
            <Route path="notifications" element={<CommunityNotifications />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
