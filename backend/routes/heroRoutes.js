const express = require('express');
const router = express.Router();
const { getHero, updateHero } = require('../controllers/heroController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getHero)
  .put(protect, updateHero);

module.exports = router;
