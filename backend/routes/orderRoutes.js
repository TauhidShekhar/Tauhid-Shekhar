const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  addOrderNote,
  deleteOrder,
  exportOrdersCsv
} = require('../controllers/orderController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');
const { validate, orderSchema } = require('../middleware/validators');

// Export CSV (must be before /:id)
router.route('/export/csv')
  .get(protect, requireAdmin, exportOrdersCsv);

// Base route: creation is public, listing is protected admin
router.route('/')
  .post(upload.single('attachment'), validate(orderSchema), createOrder)
  .get(protect, requireAdmin, getOrders);

// Single order operations
router.route('/:id/status')
  .patch(protect, requireAdmin, updateOrderStatus);

router.route('/:id/notes')
  .post(protect, requireAdmin, addOrderNote);

router.route('/:id')
  .get(protect, requireAdmin, getOrderById)
  .delete(protect, requireAdmin, deleteOrder);

module.exports = router;
