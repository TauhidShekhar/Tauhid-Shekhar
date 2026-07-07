import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

// Auth context and protection wrappers
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Loading Screen Fallback Spinner
const LoadingScreen = () => (
  <div className="min-h-screen bg-[#09090c] flex items-center justify-center flex-col gap-4">
    <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Platform...</span>
  </div>
);

// Dashboards / Profiles (Lazy Loaded)
const UserDashboard = lazy(() => import('./admin/UserDashboard.jsx'));

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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
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
    </AuthProvider>
  </StrictMode>
);
