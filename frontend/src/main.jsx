import './services/fetchInterceptor';
import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import monitorWebVitals from './utils/webVitals';

// Initialize Core Web Vitals performance tracker
monitorWebVitals();

// Auth context and protection wrappers
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

import AppLoader from './components/common/AppLoader.jsx';

const LoadingScreen = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Dashboards / Profiles (Lazy Loaded)
const UserDashboard = lazy(() => import('./admin/UserDashboard.jsx'));

// Admin CMS Panel Layout & Dashboards (Lazy Loaded from admin workspace)
const AdminLayout = lazy(() => import('../../admin/src/admin/AdminLayout.jsx'));
const Dashboard = lazy(() => import('../../admin/src/admin/Dashboard.jsx'));
const HeroManager = lazy(() => import('../../admin/src/admin/HeroManager.jsx'));
const AboutManager = lazy(() => import('../../admin/src/admin/AboutManager.jsx'));
const SkillsManager = lazy(() => import('../../admin/src/admin/SkillsManager.jsx'));
const ProjectsManager = lazy(() => import('../../admin/src/admin/ProjectsManager.jsx'));
const ExperienceManager = lazy(() => import('../../admin/src/admin/ExperienceManager.jsx'));
const EducationManager = lazy(() => import('../../admin/src/admin/EducationManager.jsx'));
const AchievementsManager = lazy(() => import('../../admin/src/admin/AchievementsManager.jsx'));
const CertificatesManager = lazy(() => import('../../admin/src/admin/CertificatesManager.jsx'));
const ResumeManager = lazy(() => import('../../admin/src/admin/ResumeManager.jsx'));
const BlogManager = lazy(() => import('../../admin/src/admin/BlogManager.jsx'));
const TestimonialsManager = lazy(() => import('../../admin/src/admin/TestimonialsManager.jsx'));
const GalleryManager = lazy(() => import('../../admin/src/admin/GalleryManager.jsx'));
const MessagesInbox = lazy(() => import('../../admin/src/admin/MessagesInbox.jsx'));
const OrdersManager = lazy(() => import('../../admin/src/admin/OrdersManager.jsx'));
const ServicesManager = lazy(() => import('../../admin/src/admin/ServicesManager.jsx'));
const MediaLibrary = lazy(() => import('../../admin/src/admin/MediaLibrary.jsx'));
const DoubtsManager = lazy(() => import('../../admin/src/admin/DoubtsManager.jsx'));
const UsersManager = lazy(() => import('../../admin/src/admin/UsersManager.jsx'));
const AuditLogs = lazy(() => import('../../admin/src/admin/AuditLogs.jsx'));
const SettingsManager = lazy(() => import('../../admin/src/admin/SettingsManager.jsx'));
const SEOManager = lazy(() => import('../../admin/src/admin/SEOManager.jsx'));
const ThemeSettings = lazy(() => import('../../admin/src/admin/ThemeSettings.jsx'));
const AnalyticsManager = lazy(() => import('../../admin/src/admin/AnalyticsManager.jsx'));
const PerformanceManager = lazy(() => import('../../admin/src/admin/PerformanceManager.jsx'));
const BackupManager = lazy(() => import('../../admin/src/admin/BackupManager.jsx'));
const ProfileManager = lazy(() => import('../../admin/src/admin/ProfileManager.jsx'));
const SecurityManager = lazy(() => import('../../admin/src/admin/SecurityManager.jsx'));
const CommunityCMS = lazy(() => import('../../admin/src/admin/CommunityCMS.jsx'));
const FeatureManagement = lazy(() => import('../../admin/src/admin/FeatureManagement.jsx'));

// Community Platform Pages (Lazy Loaded)
const CommunityLayout = lazy(() => import('./components/CommunityLayout.jsx'));
const CommunityFeed = lazy(() => import('./components/CommunityFeed.jsx'));
const CommunityGroups = lazy(() => import('./components/CommunityGroups.jsx'));
const CommunityResources = lazy(() => import('./components/CommunityResources.jsx'));
const CommunityCareers = lazy(() => import('./components/CommunityCareers.jsx'));
const CommunityChat = lazy(() => import('./components/CommunityChat.jsx'));
const CommunityProfile = lazy(() => import('./components/CommunityProfile.jsx'));
const CommunityLeaderboard = lazy(() => import('./components/CommunityLeaderboard.jsx'));
const CommunityNotifications = lazy(() => import('./components/CommunityNotifications.jsx'));
const CommunityProjectDiscussions = lazy(() => import('./components/CommunityProjectDiscussions.jsx'));
const CommunityDoubts = lazy(() => import('./components/CommunityDoubts.jsx'));

// Ecosystem Pages (Lazy Loaded)
const RewardsDashboard = lazy(() => import('./components/RewardsDashboard.jsx'));
const CodingChallenges = lazy(() => import('./components/CodingChallenges.jsx'));
const CommunityStore = lazy(() => import('./components/CommunityStore.jsx'));
const AIConsultant = lazy(() => import('./components/AIConsultant.jsx'));

// Resume Analyzer and Hub Pages (Lazy Loaded)
const ResumeAnalyzer = lazy(() => import('./components/ResumeAnalyzer.jsx'));
const CommunityResumeHub = lazy(() => import('./components/CommunityResumeHub.jsx'));
const CareerHub = lazy(() => import('./components/CareerHub.jsx'));

import FeatureDiscoveryTour from './components/FeatureDiscoveryTour.jsx';
const FeaturesPage = lazy(() => import('./components/FeaturesPage.jsx'));
const Legal = lazy(() => import('./components/Legal.jsx'));
const Terms = lazy(() => import('./components/Terms.jsx'));
const Privacy = lazy(() => import('./components/Privacy.jsx'));

// Auth Pages (Lazy Loaded)
const Auth = lazy(() => import('./admin/Auth.jsx'));
const ForgotPassword = lazy(() => import('./admin/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./admin/ResetPassword.jsx'));
const VerifyEmail = lazy(() => import('./admin/VerifyEmail.jsx'));
const RecoverAccount = lazy(() => import('./admin/RecoverAccount.jsx'));

import DynamicSEOHelper from './components/DynamicSEOHelper.jsx';

import { LoadingProvider } from './contexts/LoadingContext.jsx';
import GlobalLoader from './components/ui/GlobalLoader.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <LoadingProvider>
        <BrowserRouter>
          <DynamicSEOHelper />
          <FeatureDiscoveryTour />
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
            {/* Main Website Route */}
            <Route path="/" element={<App />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* Public Auth Routes */}
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/recover-account" element={<RecoverAccount />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />

            {/* Protected User Dashboard Route */}
            <Route 
              path="/user/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['User', 'Admin']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/dashboard" 
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
            </Route>

            {/* Community Module Routes */}
            <Route 
              path="/community" 
              element={
                <ErrorBoundary>
                  <CommunityLayout />
                </ErrorBoundary>
              }
            >
              <Route index element={<CommunityFeed />} />
              <Route 
                path="chat" 
                element={
                  <ProtectedRoute allowedRoles={['User', 'Admin']}>
                    <CommunityChat />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="groups" 
                element={
                  <ProtectedRoute allowedRoles={['User', 'Admin']}>
                    <CommunityGroups />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="groups/:groupId" 
                element={
                  <ProtectedRoute allowedRoles={['User', 'Admin']}>
                    <CommunityGroups />
                  </ProtectedRoute>
                } 
              />
              <Route path="projects" element={<CommunityProjectDiscussions />} />
              <Route path="doubts" element={<CommunityDoubts />} />
              <Route path="resources" element={<CommunityResources />} />
              <Route path="jobs" element={<CommunityCareers />} />
              <Route path="leaderboard" element={<CommunityLeaderboard />} />
              <Route path="profile/:id" element={<CommunityProfile />} />
              <Route 
                path="notifications" 
                element={
                  <ProtectedRoute allowedRoles={['User', 'Admin']}>
                    <CommunityNotifications />
                  </ProtectedRoute>
                } 
              />
              
              {/* New Ecosystem Routes */}
              <Route 
                path="rewards" 
                element={
                  <ProtectedRoute allowedRoles={['User', 'Admin']}>
                    <RewardsDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="challenges" 
                element={
                  <ProtectedRoute allowedRoles={['User', 'Admin']}>
                    <CodingChallenges />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="store" 
                element={
                  <ProtectedRoute allowedRoles={['User', 'Admin']}>
                    <CommunityStore />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="ai-assistant" 
                element={
                  <ProtectedRoute allowedRoles={['User', 'Admin']}>
                    <AIConsultant />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="resumes-hub" 
                element={
                  <ProtectedRoute allowedRoles={['User', 'Admin']}>
                    <CommunityResumeHub />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="career-hub" 
                element={
                  <ProtectedRoute allowedRoles={['User', 'Admin']}>
                    <CareerHub />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
      </LoadingProvider>
    </AuthProvider>
  </StrictMode>
);
