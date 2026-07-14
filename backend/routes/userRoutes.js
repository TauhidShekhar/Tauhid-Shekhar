const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, toggleUserStatus, deleteUser, updateUserGamification, adminUpdateUser } = require('../controllers/userController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.use(requireAuth, requireAdmin);

router.get('/', getUsers);
router.put('/:id/role', updateUserRole);
router.put('/:id/status', toggleUserStatus);
router.put('/:id/gamification', updateUserGamification);
router.put('/:id', adminUpdateUser);
router.delete('/:id', deleteUser);

module.exports = router;
