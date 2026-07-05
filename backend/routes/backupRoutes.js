const express = require('express');
const router = express.Router();
const { exportBackup, restoreBackup } = require('../controllers/backupController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer();

router.get('/export', requireAuth, requireAdmin, exportBackup);
router.post('/restore', requireAuth, requireAdmin, upload.single('backup'), restoreBackup);

module.exports = router;
