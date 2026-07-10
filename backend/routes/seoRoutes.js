const express = require('express');
const router = express.Router();
const { getSEO, updateSEO } = require('../controllers/seoController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');

router.route('/')
  .get(getSEO)
  .put(
    requireAuth,
    requireAdmin,
    upload.fields([
      { name: 'ogImage', maxCount: 1 },
      { name: 'favicon', maxCount: 1 },
      { name: 'logo', maxCount: 1 }
    ]),
    updateSEO
  );

module.exports = router;
