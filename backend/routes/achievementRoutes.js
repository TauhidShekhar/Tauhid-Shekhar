const express = require('express');
const router = express.Router();
const { getAchievements, createAchievement, updateAchievement, deleteAchievement } = require('../controllers/achievementController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAchievements)
  .post(requireAuth, requireAdmin, createAchievement);

router.route('/:id')
  .put(requireAuth, requireAdmin, updateAchievement)
  .delete(requireAuth, requireAdmin, deleteAchievement);

module.exports = router;
