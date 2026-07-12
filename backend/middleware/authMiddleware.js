const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  setTokenCookies,
  clearTokenCookies,
} = require('../utils/tokenUtils');

// ---------------------------------------------------------------------------
// requireAuth
// ---------------------------------------------------------------------------
// Extracts accessToken from HttpOnly cookies, verifies it, and populates
// req.user.  When the access token is expired but a valid refresh token is
// present the middleware transparently issues a new token pair and sets fresh
// cookies so the client never has to handle 401s caused by short-lived tokens.
// ---------------------------------------------------------------------------
const requireAuth = async (req, res, next) => {
  try {
    let accessToken = req.cookies?.accessToken;
    let refreshToken = req.cookies?.refreshToken;
    let decoded = null;

    if (!accessToken && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      accessToken = req.headers.authorization.split(' ')[1];
    }
    if (!refreshToken && req.headers['x-refresh-token']) {
      refreshToken = req.headers['x-refresh-token'];
    }

    // ---- 1. Try the access token first ----
    if (accessToken) {
      try {
        decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
      } catch (err) {
        // Only attempt refresh when the access token has *expired*; any
        // other verification error (e.g. tampered signature) is fatal.
        if (err.name !== 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Invalid access token',
          });
        }
        // Fall through – we will try the refresh flow below.
      }
    }

    // ---- 2. Refresh flow (no valid access token) ----
    if (!decoded) {
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required. Please log in.',
        });
      }

      try {
        const refreshDecoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET
        );

        // Find user and check that this refresh token exists in their session list
        const user = await User.findById(refreshDecoded.id);

        if (!user) {
          clearTokenCookies(res);
          return res.status(401).json({
            success: false,
            message: 'User not found. Please log in again.',
          });
        }

        // Check that refresh token exists in the user's refreshTokens array
        const tokenEntry = user.refreshTokens.find(rt => rt.token === refreshToken);

        if (!tokenEntry) {
          // Token not in the list – possible reuse attack; clear all sessions
          user.refreshTokens = [];
          await user.save({ validateBeforeSave: false });
          clearTokenCookies(res);
          return res.status(401).json({
            success: false,
            message: 'Session invalid. Please log in again.',
          });
        }

        // Check if this stored refresh token has expired
        if (tokenEntry.expiresAt && new Date(tokenEntry.expiresAt) < new Date()) {
          // Remove expired token
          user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
          await user.save({ validateBeforeSave: false });
          clearTokenCookies(res);
          return res.status(401).json({
            success: false,
            message: 'Session expired. Please log in again.',
          });
        }

        // Issue new token pair (Token Rotation)
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        // Replace old refresh token with new one in the array
        const tokenIndex = user.refreshTokens.findIndex(rt => rt.token === refreshToken);
        user.refreshTokens[tokenIndex] = {
          token: newRefreshToken,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        };
        await user.save({ validateBeforeSave: false });

        // Set fresh cookies on the response
        setTokenCookies(res, newAccessToken, newRefreshToken, true);

        // Use the refresh-decoded payload to continue
        decoded = { id: user._id };
      } catch (refreshErr) {
        console.error('Refresh token error:', refreshErr.message);
        clearTokenCookies(res);
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please log in again.',
        });
      }
    }

    // ---- 3. Populate req.user ----
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      clearTokenCookies(res);
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    if (!user.isActive) {
      clearTokenCookies(res);
      return res.status(401).json({
        success: false,
        message: 'This account has been deactivated.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Internal authentication error',
    });
  }
};

// ---------------------------------------------------------------------------
// requireAdmin – must be chained AFTER requireAuth
// ---------------------------------------------------------------------------
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Admin access required',
  });
};

// ---------------------------------------------------------------------------
// optionalAuth
// ---------------------------------------------------------------------------
// Attempts to authenticate the request but never blocks.  If a valid token is
// found req.user is populated; otherwise the request continues anonymously.
// ---------------------------------------------------------------------------
const optionalAuth = async (req, res, next) => {
  try {
    let accessToken = req.cookies?.accessToken;
    let refreshToken = req.cookies?.refreshToken;

    if (!accessToken && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      accessToken = req.headers.authorization.split(' ')[1];
    }
    if (!refreshToken && req.headers['x-refresh-token']) {
      refreshToken = req.headers['x-refresh-token'];
    }
    let decoded = null;

    if (accessToken) {
      try {
        decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
      } catch (_) {
        // Silently ignore – this is *optional* auth.
        decoded = null;
      }
    }

    // If the access token was missing / expired, try the refresh token once
    if (!decoded && refreshToken) {
      try {
        const refreshDecoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET
        );

        const user = await User.findById(refreshDecoded.id);

        if (user) {
          const tokenEntry = user.refreshTokens.find(rt => rt.token === refreshToken);

          if (tokenEntry && (!tokenEntry.expiresAt || new Date(tokenEntry.expiresAt) > new Date())) {
            const newAccessToken = generateAccessToken(user);
            const newRefreshToken = generateRefreshToken(user);

            // Rotate token in array
            const tokenIndex = user.refreshTokens.findIndex(rt => rt.token === refreshToken);
            user.refreshTokens[tokenIndex] = {
              token: newRefreshToken,
              createdAt: new Date(),
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            };
            await user.save({ validateBeforeSave: false });

            setTokenCookies(res, newAccessToken, newRefreshToken, true);
            decoded = { id: user._id };
          }
        }
      } catch (_) {
        // Silently ignore
      }
    }

    if (decoded) {
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (_) {
    // Never block the request
  }

  next();
};

module.exports = { requireAuth, requireAdmin, optionalAuth, protect: requireAuth };
