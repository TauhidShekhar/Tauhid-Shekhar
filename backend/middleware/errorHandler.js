// ---------------------------------------------------------------------------
// Centralised Error Handler Middleware
// ---------------------------------------------------------------------------
// Catches every error that reaches Express and normalises the response shape
// to { success, message, errors?, stack? }.  Handles Mongoose validation,
// cast, and duplicate-key errors as well as JWT verification failures.
// ---------------------------------------------------------------------------

const isDev = () => process.env.NODE_ENV !== 'production';

// ---------------------------------------------------------------------------
// Custom application error class (throw from controllers / services)
// ---------------------------------------------------------------------------
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguishes expected vs. programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

// ---------------------------------------------------------------------------
// Handler helpers
// ---------------------------------------------------------------------------

/** Mongoose ValidationError – field-level messages */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));

  return {
    statusCode: 400,
    message: 'Validation failed',
    errors,
  };
};

/** Mongoose CastError – typically an invalid ObjectId */
const handleCastError = (err) => ({
  statusCode: 400,
  message: `Invalid ${err.path}: ${err.value}`,
});

/** Mongoose duplicate key error (code 11000) */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const value = err.keyValue ? err.keyValue[field] : 'unknown';

  return {
    statusCode: 409,
    message: `Duplicate value for "${field}": "${value}". Please use a different value.`,
  };
};

/** jsonwebtoken errors */
const handleJWTError = () => ({
  statusCode: 401,
  message: 'Invalid token. Please log in again.',
});

const handleJWTExpiredError = () => ({
  statusCode: 401,
  message: 'Your session has expired. Please log in again.',
});

// ---------------------------------------------------------------------------
// Main error-handling middleware
// ---------------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // Clone so we don't mutate the original error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // ---- Mongoose: Validation ----
  if (err.name === 'ValidationError') {
    const parsed = handleValidationError(err);
    statusCode = parsed.statusCode;
    message = parsed.message;
    errors = parsed.errors;
  }

  // ---- Mongoose: CastError ----
  if (err.name === 'CastError') {
    const parsed = handleCastError(err);
    statusCode = parsed.statusCode;
    message = parsed.message;
  }

  // ---- Mongoose: Duplicate key ----
  if (err.code === 11000 || err.code === 11001) {
    const parsed = handleDuplicateKeyError(err);
    statusCode = parsed.statusCode;
    message = parsed.message;
  }

  // ---- JWT errors ----
  if (err.name === 'JsonWebTokenError') {
    const parsed = handleJWTError();
    statusCode = parsed.statusCode;
    message = parsed.message;
  }

  if (err.name === 'TokenExpiredError') {
    const parsed = handleJWTExpiredError();
    statusCode = parsed.statusCode;
    message = parsed.message;
  }

  // ---- Multer file-size error ----
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File is too large. Please upload a smaller file.';
  }

  // ---- Logging ----
  if (isDev()) {
    console.error('──── ERROR ────');
    console.error('Status :', statusCode);
    console.error('Message:', message);
    console.error('Stack  :', err.stack);
    console.error('───────────────');
  } else if (statusCode >= 500) {
    // In production only log genuine server errors
    console.error(`[${new Date().toISOString()}] ${statusCode} - ${message}`);
  }

  // ---- Response ----
  if (!isDev() && statusCode === 500) {
    message = 'Something went wrong. Please try again later.';
  }

  const response = { success: false, message };

  if (errors) {
    response.errors = errors;
  }

  // Expose stack trace only in development
  if (isDev() && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = { errorHandler, AppError };
