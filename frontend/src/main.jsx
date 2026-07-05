import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

// Auth context and protection wrappers
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Dashboards / Profiles
import UserDashboard from './admin/UserDashboard.jsx'; // Keep user dashboard in frontend

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
import CommunityProjectDiscussions from './components/CommunityProjectDiscussions.jsx';
import CommunityDoubts from './components/CommunityDoubts.jsx';

// Ecosystem Pages
import RewardsDashboard from './components/RewardsDashboard.jsx';
import CodingChallenges from './components/CodingChallenges.jsx';
import CommunityStore from './components/CommunityStore.jsx';
import AIConsultant from './components/AIConsultant.jsx';

// Resume Analyzer and Hub Pages
import ResumeAnalyzer from './components/ResumeAnalyzer.jsx';
import CommunityResumeHub from './components/CommunityResumeHub.jsx';
import CareerHub from './components/CareerHub.jsx';

import FeatureDiscoveryTour from './components/FeatureDiscoveryTour.jsx';
import FeaturesPage from './components/FeaturesPage.jsx';
import Legal from './components/Legal.jsx';
import Terms from './components/Terms.jsx';
import Privacy from './components/Privacy.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <FeatureDiscoveryTour />
        <Routes>
          {/* Main Website Route */}
          <Route path="/" element={<App />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Protected User Dashboard Route */}
          <Route 
            path="/user/dashboard" 
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
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
