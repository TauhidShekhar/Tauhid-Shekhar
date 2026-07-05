const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// ---------------------------------------------------------------------------
// JWT Token Generation
// ---------------------------------------------------------------------------

/**
 * Generate a short-lived access token for the given user.
 *
 * @param {object} user – Mongoose User document (or any object with ._id).
 * @returns {string}      – Signed JWT access token.
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '1h' }
  );
};

/**
 * Generate a long-lived refresh token for the given user.
 *
 * @param {object} user – Mongoose User document (or any object with ._id).
 * @returns {string}      – Signed JWT refresh token.
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '30d' }
  );
};

// ---------------------------------------------------------------------------
// Cookie Helpers
// ---------------------------------------------------------------------------

/**
 * Set access & refresh tokens as HttpOnly cookies on the response.
 *
 * @param {import('express').Response} res
 * @param {string} accessToken
 * @param {string} refreshToken
 * @param {boolean} rememberMe – If true use a 30-day refresh cookie, else 24h
 */
const setTokenCookies = (res, accessToken, refreshToken, rememberMe = false) => {
  const isProduction = process.env.NODE_ENV === 'production';

  const commonOptions = {
    httpOnly: true,
    secure: isProduction,
    // 'Lax' allows cookies to be sent when user navigates to a page (GET),
    // unlike 'Strict' which blocks cookies on many cross-site navigations.
    sameSite: isProduction ? 'None' : 'Lax',
    path: '/',
  };

  // Access token cookie lifetime: 1 hour (matches JWT expiry)
  const accessMaxAge = 60 * 60 * 1000; // 1 hour in ms

  // Refresh token cookie lifetime
  const refreshMaxAge = rememberMe
    ? 30 * 24 * 60 * 60 * 1000   // 30 days if rememberMe
    : 7 * 24 * 60 * 60 * 1000;   // 7 days by default

  res.cookie('accessToken', accessToken, {
    ...commonOptions,
    maxAge: accessMaxAge,
  });

  res.cookie('refreshToken', refreshToken, {
    ...commonOptions,
    maxAge: refreshMaxAge,
  });
};

/**
 * Clear both token cookies from the response.
 *
 * @param {import('express').Response} res
 */
const clearTokenCookies = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  const commonOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
    path: '/',
  };

  res.clearCookie('accessToken', commonOptions);
  res.clearCookie('refreshToken', commonOptions);
};

// ---------------------------------------------------------------------------
// OTP & Random Token Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a 6-digit one-time password and its expiry timestamp.
 *
 * @returns {{ otp: string, otpExpires: Date }}
 */
const generateOTP = () => {
  // crypto.randomInt is CSPRNG-backed — safe for security-sensitive codes
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return { otp, otpExpires };
};

/**
 * Generate a cryptographically secure random hex token (256 bits).
 *
 * @returns {string} – 64-char hex string.
 */
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  setTokenCookies,
  clearTokenCookies,
  generateOTP,
  generateRandomToken,
};
