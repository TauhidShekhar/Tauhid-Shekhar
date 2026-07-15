const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  trackShare,
  shareProfile,
  sharePost,
  shareDoubt
} = require('../controllers/shareController');

// Optional authentication middleware to log user ID if present during share
const optionalAuth = async (req, res, next) => {
  try {
    let accessToken = req.cookies?.accessToken;
    if (!accessToken && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      accessToken = req.headers.authorization.split(' ')[1];
    }
    if (accessToken) {
      const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
      if (decoded && decoded.id) {
        req.user = await User.findById(decoded.id);
      }
    }
  } catch (err) {
    // Silent fail for optional auth
  }
  next();
};

router.post('/track', optionalAuth, trackShare);
router.get('/profile/:username', shareProfile);
router.get('/post/:id', sharePost);
router.get('/doubt/:id', shareDoubt);

module.exports = router;
