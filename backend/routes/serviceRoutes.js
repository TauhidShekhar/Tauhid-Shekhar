const express = require('express');
const router = express.Router();
const {
  getServices,
  getServiceBySlug,
  getServiceById,
  createService,
  updateService,
  deleteService,
  duplicateService,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/serviceController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

// Categories routes
router.route('/categories')
  .get(getCategories)
  .post(protect, requireAdmin, createCategory);

router.route('/categories/:id')
  .put(protect, requireAdmin, updateCategory)
  .delete(protect, requireAdmin, deleteCategory);

// Service Slug lookup (must be before /:id)
router.route('/slug/:slug')
  .get(getServiceBySlug);

// Duplicate service
router.route('/:id/duplicate')
  .post(protect, requireAdmin, duplicateService);

// Base service routes
router.route('/')
  .get(getServices)
  .post(protect, requireAdmin, createService);

router.route('/:id')
  .get(getServiceById)
  .put(protect, requireAdmin, updateService)
  .delete(protect, requireAdmin, deleteService);

module.exports = router;
