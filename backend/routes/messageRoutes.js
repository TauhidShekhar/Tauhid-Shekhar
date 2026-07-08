const express = require('express');
const router = express.Router();
const { getMessages, createMessage, markAsRead, deleteMessage, toggleArchive, replyMessage } = require('../controllers/messageController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const { contactLimiter } = require('../middleware/rateLimiter');

router.route('/')
  .get(protect, requireAdmin, getMessages)
  .post(contactLimiter, createMessage);

router.post('/:id/reply', protect, requireAdmin, replyMessage);
router.patch('/:id/read', protect, requireAdmin, markAsRead);
router.patch('/:id/archive', protect, requireAdmin, toggleArchive);
router.delete('/:id', protect, requireAdmin, deleteMessage);

module.exports = router;
