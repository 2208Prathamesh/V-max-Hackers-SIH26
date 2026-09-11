import env from '../config/env.js';

/**
 * Global centralized error handling middleware
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const errorMiddleware = (err, req, res, next) => {
  // Only log unexpected internal server errors or in development mode
  if (!err.statusCode || err.statusCode >= 500) {
    console.error('Unhandled Error:', err);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error) => error.message);

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Invalid MongoDB ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // Duplicate MongoDB field (E11000)
  if (err.code === 11000) {
    const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : 'field';

    return res.status(409).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication token has expired'
    });
  }

  // Malformed JSON payload from body-parser
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload in request body'
    });
  }

  // Custom application error
  const statusCode = err.statusCode || 500;
  const safeMessage =
    env.IS_PRODUCTION && statusCode >= 500
      ? 'Internal server error'
      : (err.message || 'Internal server error');

  return res.status(statusCode).json({
    success: false,
    message: safeMessage,
    ...(env.IS_DEVELOPMENT && err.stack ? { stack: err.stack } : {})
  });
};

export default errorMiddleware;
