const rateLimit = require("express-rate-limit");

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many requests. Please try again later.",
  },
});

/**
 * Authentication rate limiter
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many authentication attempts. Please try again later.",
  },
});

/**
 * AI chat rate limiter
 */
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many messages. Please wait before sending another message.",
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  chatLimiter,
};