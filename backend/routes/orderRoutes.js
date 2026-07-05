const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/orderController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');
const { validate, orderSchema } = require('../middleware/validators');

router.route('/')
  .post(upload.single('attachment'), validate(orderSchema), createOrder)
  .get(protect, requireAdmin, getOrders);

router.route('/:id/status')
  .patch(protect, requireAdmin, updateOrderStatus);

router.route('/:id')
  .delete(protect, requireAdmin, deleteOrder);

module.exports = router;
