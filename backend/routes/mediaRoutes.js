const express = require('express');
const router = express.Router();
const { getMedia, uploadMedia, deleteMedia } = require('../controllers/mediaController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

router.route('/')
  .get(requireAuth, requireAdmin, getMedia)
  .post(requireAuth, requireAdmin, uploadLimiter, upload.single('file'), uploadMedia);

router.route('/:id')
  .delete(requireAuth, requireAdmin, deleteMedia);

module.exports = router;
