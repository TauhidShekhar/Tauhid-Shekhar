const express = require('express');
const router = express.Router();
const { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } = require('../controllers/testimonialController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');

router.route('/')
  .get(getTestimonials)
  .post(requireAuth, requireAdmin, upload.single('avatar'), createTestimonial);

router.route('/:id')
  .put(requireAuth, requireAdmin, upload.single('avatar'), updateTestimonial)
  .delete(requireAuth, requireAdmin, deleteTestimonial);

module.exports = router;
