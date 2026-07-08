const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');

// Portfolio Admin CV controllers
const { getResumes, uploadResume, deleteResume, getActiveResume } = require('../controllers/resumeController');

// ATS Analyzer controllers
const {
  uploadAndAnalyzeResume,
  matchJobDescription,
  rewriteSection,
  getAnalysisHistory,
  deleteAnalysis,
  getReportDetails
} = require('../controllers/atsResumeController');

// Community Hub controllers
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

// ─── 1. Portfolio Admin Resume Uploads (Existing) ───────────────────
router.get('/active', getActiveResume);
router.route('/')
  .get(getResumes)
  .post(requireAuth, requireAdmin, upload.single('resume'), uploadResume);

router.route('/:id')
  .delete(requireAuth, requireAdmin, deleteResume);

// ─── 2. ATS Resume Analyzer Endpoints ─────────────────────────────────
router.post('/upload/analyze', requireAuth, upload.single('resume'), uploadAndAnalyzeResume);
router.post('/job-match/:id', requireAuth, matchJobDescription);
router.post('/rewrite/:id', requireAuth, rewriteSection);
router.get('/history/logs', requireAuth, getAnalysisHistory);
router.delete('/history/logs/:id', requireAuth, deleteAnalysis);
router.get('/report/details/:id', requireAuth, getReportDetails);

// ─── 3. Community Resume Hub Endpoints ───────────────────────────────
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
