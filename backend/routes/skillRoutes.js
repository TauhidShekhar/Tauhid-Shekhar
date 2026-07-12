const express = require('express');
const router = express.Router();
const { getSkills, createSkill, updateSkill, deleteSkill, reorderSkills } = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getSkills)
  .post(protect, createSkill);

router.post('/reorder', protect, reorderSkills);

router.route('/:id')
  .put(protect, updateSkill)
  .delete(protect, deleteSkill);

module.exports = router;
