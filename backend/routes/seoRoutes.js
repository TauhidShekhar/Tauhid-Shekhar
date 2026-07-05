const express = require('express');
const router = express.Router();
const { getSEO, updateSEO } = require('../controllers/seoController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');

router.route('/')
  .get(getSEO)
  .put(requireAuth, requireAdmin, upload.single('ogImage'), updateSEO);

module.exports = router;
