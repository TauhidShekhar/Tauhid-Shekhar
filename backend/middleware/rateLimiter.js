const rateLimit = require('express-rate-limit');

// ---------------------------------------------------------------------------
// Helper – builds a rate limiter with a consistent JSON error shape
// ---------------------------------------------------------------------------
const createLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    skip: () => process.env.NODE_ENV === 'development', // Skip limiting in local development
    standardHeaders: true, // Return rate-limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        message,
      });
    },
  });

// ---------------------------------------------------------------------------
// Login API Limiter – 10 attempts per 15 minutes
// ---------------------------------------------------------------------------
const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many attempts. Please wait a few minutes before trying again.',
});

// ---------------------------------------------------------------------------
// Register API Limiter – 5 registrations per 1 hour
// ---------------------------------------------------------------------------
const registerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many attempts. Please wait a few minutes before trying again.',
});

// ---------------------------------------------------------------------------
// Forgot Password Limiter – 5 requests per 30 minutes
// ---------------------------------------------------------------------------
const forgotPasswordLimiter = createLimiter({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5,
  message: 'Too many attempts. Please wait a few minutes before trying again.',
});

// ---------------------------------------------------------------------------
// Contact Form Limiter – 20 requests per 1 hour
// ---------------------------------------------------------------------------
const contactLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'Too many attempts. Please wait a few minutes before trying again.',
});

// ---------------------------------------------------------------------------
// General API Limiter – 100 requests per 15 minutes
// ---------------------------------------------------------------------------
const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many attempts. Please wait a few minutes before trying again.',
});

// ---------------------------------------------------------------------------
// Upload Limiter – 20 requests per hour
// ---------------------------------------------------------------------------
const uploadLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'Upload limit reached. You can upload up to 20 files per hour.',
});

// ---------------------------------------------------------------------------
// Recovery API Limiter – 5 attempts per 15 minutes
// ---------------------------------------------------------------------------
const recoveryLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many recovery attempts. Please wait a few minutes before trying again.',
});

module.exports = {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  contactLimiter,
  uploadLimiter,
  apiLimiter,
  recoveryLimiter,
};

