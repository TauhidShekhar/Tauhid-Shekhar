const express = require('express');
const router = express.Router();
const { getMessages, createMessage, markAsRead, deleteMessage, toggleArchive } = require('../controllers/messageController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const { contactLimiter } = require('../middleware/rateLimiter');
const { validate, contactSchema } = require('../middleware/validators');

router.route('/')
  .get(protect, requireAdmin, getMessages)
  .post(contactLimiter, validate(contactSchema), createMessage);

router.patch('/:id/read', protect, requireAdmin, markAsRead);
router.patch('/:id/archive', protect, requireAdmin, toggleArchive);
router.delete('/:id', protect, requireAdmin, deleteMessage);

module.exports = router;
