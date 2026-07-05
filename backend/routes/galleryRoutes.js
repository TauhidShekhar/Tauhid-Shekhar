const express = require('express');
const router = express.Router();
const { getGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem } = require('../controllers/galleryController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');

router.route('/')
  .get(getGallery)
  .post(requireAuth, requireAdmin, upload.single('image'), createGalleryItem);

router.route('/:id')
  .put(requireAuth, requireAdmin, upload.single('image'), updateGalleryItem)
  .delete(requireAuth, requireAdmin, deleteGalleryItem);

module.exports = router;
