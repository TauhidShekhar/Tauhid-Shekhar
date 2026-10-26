const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, testEmailNotification } = require('../controllers/settingsController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');

router.post('/test-email', requireAuth, requireAdmin, testEmailNotification);

router.route('/')
  .get(getSettings)
  .put(
    requireAuth,
    requireAdmin,
    upload.fields([
      { name: 'logo', maxCount: 1 },
      { name: 'favicon', maxCount: 1 },
      { name: 'heroImage', maxCount: 1 },
      { name: 'profilePicture', maxCount: 1 },
      { name: 'heroBackground', maxCount: 1 }
    ]),
    updateSettings
  );

module.exports = router;
