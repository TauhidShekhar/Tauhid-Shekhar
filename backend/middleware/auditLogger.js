const AuditLog = require('../models/AuditLog');

// ---------------------------------------------------------------------------
// Sensitive fields that must NEVER appear in audit logs
// ---------------------------------------------------------------------------
const SENSITIVE_KEYS = new Set([
  'password',
  'confirmPassword',
  'oldPassword',
  'newPassword',
  'currentPassword',
  'token',
  'refreshToken',
  'accessToken',
  'secret',
  'creditCard',
  'ssn',
]);

// ---------------------------------------------------------------------------
// sanitizeBody – deep-clones the body and redacts sensitive fields
// ---------------------------------------------------------------------------
const sanitizeBody = (body) => {
  if (!body || typeof body !== 'object') return {};

  try {
    const sanitized = JSON.parse(JSON.stringify(body));

    const redact = (obj) => {
      for (const key of Object.keys(obj)) {
        if (SENSITIVE_KEYS.has(key)) {
          obj[key] = '[REDACTED]';
        } else if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          redact(obj[key]);
        }
      }
    };

    redact(sanitized);
    return sanitized;
  } catch (_) {
    return {};
  }
};

// ---------------------------------------------------------------------------
// createAuditLog – middleware factory
// ---------------------------------------------------------------------------
// Usage:  router.post('/projects', requireAuth, createAuditLog('CREATE', 'Project'), controller);
//
// The actual database write happens asynchronously *after* the response has
// been sent (on the 'finish' event) so it never delays the response.
// ---------------------------------------------------------------------------
const createAuditLog = (action, resource) => {
  return async (req, res, next) => {
    res.on('finish', async () => {
      // Only log successful operations (2xx / 3xx)
      if (res.statusCode >= 400) return;

      try {
        await AuditLog.create({
          user: req.user?._id || null,
          action,
          resource,
          resourceId: req.params.id || null,
          details: {
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            body: sanitizeBody(req.body),
          },
          ip: req.ip || req.connection?.remoteAddress || null,
          userAgent: req.headers['user-agent'] || null,
        });
      } catch (err) {
        // Audit logging failures must never crash the application
        console.error('Audit log write failed:', err.message);
      }
    });

    next();
  };
};

module.exports = { createAuditLog, sanitizeBody };
