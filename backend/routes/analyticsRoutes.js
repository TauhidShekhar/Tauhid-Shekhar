const express = require('express');
const router = express.Router();
const { trackView, getStats, getSystemPerformance, getShareStats, exportShareCSV } = require('../controllers/analyticsController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.post('/track', trackView);
router.get('/stats', requireAuth, requireAdmin, getStats);
router.get('/system-metrics', requireAuth, requireAdmin, getSystemPerformance);
router.get('/shares', requireAuth, requireAdmin, getShareStats);
router.get('/shares/export', requireAuth, requireAdmin, exportShareCSV);

module.exports = router;

