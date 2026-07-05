const express = require('express');
const router = express.Router();
const {
  getFeatures,
  getAllFeatures,
  createFeature,
  updateFeature,
  deleteFeature,
  completeOnboarding,
  resetOnboarding,
  viewFeature,
  getWhatsNew
} = require('../controllers/featureController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getFeatures);

// Private routes (Authenticated users)
router.post('/onboarding/complete', requireAuth, completeOnboarding);
router.post('/onboarding/reset', requireAuth, resetOnboarding);
router.get('/whats-new', requireAuth, getWhatsNew);
router.post('/view/:id', requireAuth, viewFeature);

// Admin-only routes
router.get('/all', requireAuth, requireAdmin, getAllFeatures);
router.post('/', requireAuth, requireAdmin, createFeature);
router.put('/:id', requireAuth, requireAdmin, updateFeature);
router.delete('/:id', requireAuth, requireAdmin, deleteFeature);

module.exports = router;
