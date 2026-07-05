const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');

// Analyzer controllers
const {
  uploadAndAnalyzeResume,
  matchJobDescription,
  rewriteSection,
  getAnalysisHistory,
  deleteAnalysis,
  getReportDetails
} = require('../controllers/atsResumeController');

// Community hub controllers
const {
  getCommunityResumeHub,
  toggleShareResume,
  submitCommunityReview,
  postComment,
  getComments,
  toggleLike,
  toggleBookmark,
  reportResume,
  getResumeLeaderboard,
  getResumeAnalytics
} = require('../controllers/atsCommunityController');

// ─── Core ATS Analyzer Routes ──────────────────────────────────────────
router.post('/upload', requireAuth, upload.single('resume'), uploadAndAnalyzeResume);
router.post('/job-match/:id', requireAuth, matchJobDescription);
router.post('/rewrite/:id', requireAuth, rewriteSection);
router.get('/history', requireAuth, getAnalysisHistory);
router.delete('/history/:id', requireAuth, deleteAnalysis);
router.get('/report/:id', requireAuth, getReportDetails);

// ─── Community Resume Hub Routes ───────────────────────────────────────
router.get('/community/hub', requireAuth, getCommunityResumeHub);
router.post('/community/share/:id', requireAuth, toggleShareResume);
router.post('/community/review/:id', requireAuth, submitCommunityReview);
router.post('/community/comment/:id', requireAuth, postComment);
router.get('/community/comments/:id', requireAuth, getComments);
router.post('/community/like/:id', requireAuth, toggleLike);
router.post('/community/bookmark/:id', requireAuth, toggleBookmark);
router.post('/community/report/:id', requireAuth, reportResume);
router.get('/community/leaderboard', requireAuth, getResumeLeaderboard);
router.get('/community/analytics', requireAuth, getResumeAnalytics);

module.exports = router;
