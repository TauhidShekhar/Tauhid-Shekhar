const express = require('express');
const router = express.Router();
const {
  getServices,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getServices)
  .post(protect, createService);

router.route('/:id')
  .put(protect, updateService)
  .delete(protect, deleteService);

module.exports = router;
