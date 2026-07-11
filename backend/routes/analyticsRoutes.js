const express = require('express');
const router = express.Router();
const { trackView, getStats, getSystemPerformance } = require('../controllers/analyticsController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.post('/track', trackView);
router.get('/stats', requireAuth, requireAdmin, getStats);
router.get('/system-metrics', requireAuth, requireAdmin, getSystemPerformance);

module.exports = router;
