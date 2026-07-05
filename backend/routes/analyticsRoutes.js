const express = require('express');
const router = express.Router();
const { trackView, getStats } = require('../controllers/analyticsController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.post('/track', trackView);
router.get('/stats', requireAuth, requireAdmin, getStats);

module.exports = router;
