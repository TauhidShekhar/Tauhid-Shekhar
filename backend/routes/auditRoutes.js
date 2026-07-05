const express = require('express');
const router = Router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', requireAuth, requireAdmin, getAuditLogs);

module.exports = router;
