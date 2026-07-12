const express = require('express');
const router = express.Router();
const {
  checkUsername,
  register,
  verifyEmail,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyResetToken,
  recoverAccount,
  verifyRecoveryOtp,
  sendOTP,
  verifyOTP,
  getProfile,
  updateProfile,
  changePassword,
  toggleSaveProject,
  getSavedProjects,
  deleteAccount,
  getUserOrders,
  googleLogin,
  googleCallback,
  githubLogin,
  githubCallback
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  recoveryLimiter
} = require('../middleware/rateLimiter');
const { upload } = require('../middleware/upload');
const {
  validate,
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  recoverAccountSchema,
  verifyRecoveryOtpSchema
} = require('../middleware/validators');

// Public auth endpoints
router.post('/register', registerLimiter, validate(registerSchema), register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.get('/check-username', checkUsername);
router.post('/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/verify-reset-token', recoveryLimiter, verifyResetToken);
router.post('/reset-password/:token', validate(resetPasswordSchema), resetPassword);
router.post('/recover-account', recoveryLimiter, validate(recoverAccountSchema), recoverAccount);
router.post('/verify-recovery-otp', recoveryLimiter, validate(verifyRecoveryOtpSchema), verifyRecoveryOtp);

// Social OAuth endpoints
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);
router.get('/github', githubLogin);
router.get('/github/callback', githubCallback);

// Protected endpoints
router.get('/me', requireAuth, getProfile);
router.put('/update-profile', requireAuth, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }, { name: 'resume', maxCount: 1 }]), updateProfile);
router.put('/change-password', requireAuth, validate(changePasswordSchema), changePassword);
router.post('/send-otp', requireAuth, sendOTP);
router.post('/verify-otp', requireAuth, verifyOTP);
router.post('/saved-projects/:projectId', requireAuth, toggleSaveProject);
router.get('/saved-projects', requireAuth, getSavedProjects);
router.delete('/delete-account', requireAuth, deleteAccount);
router.get('/my-orders', requireAuth, getUserOrders);

module.exports = router;
