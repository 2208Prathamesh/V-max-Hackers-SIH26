import rateLimit from 'express-rate-limit'

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 500 : 3000,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  }
})

/**
 * Authentication rate limiter
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.'
  }
})

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
    message: 'Too many messages. Please wait before sending another message.'
  }
})

/**
 * Strict user registration rate limiter
 * Limits account creation to prevent spam and bot signups
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: process.env.NODE_ENV === 'production' ? 5 : 25, // 5 per hour in prod, 25 in dev
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many account registrations from this IP address. Please try again after an hour.'
  }
})

export { apiLimiter, authLimiter, chatLimiter, registerLimiter }
