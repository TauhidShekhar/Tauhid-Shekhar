const express = require('express');
const router = express.Router();
const { 
  getDraft, 
  saveDraft, 
  publishDraft, 
  getVersions, 
  restoreVersion 
} = require('../controllers/cmsController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// All CMS draft/publish/version operations require Admin authentication
router.use(requireAuth, requireAdmin);

router.get('/draft/:model/:id', getDraft);
router.get('/draft/:model', getDraft);

router.post('/draft/:model/:id', saveDraft);
router.post('/draft/:model', saveDraft);

router.post('/publish/:model/:id', publishDraft);
router.post('/publish/:model', publishDraft);

router.get('/versions/:model/:id', getVersions);
router.post('/restore/:versionId', restoreVersion);

module.exports = router;
