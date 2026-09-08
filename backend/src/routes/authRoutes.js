import express from 'express'
import {
  register,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import validationMiddleware from '../middleware/validationMiddleware.js'
import { authLimiter } from '../middleware/rateLimitMiddleware.js'
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../validators/authValidator.js'

const router = express.Router()

router.post('/register', authLimiter, validationMiddleware(registerSchema), register)
router.post('/login', authLimiter, validationMiddleware(loginSchema), login)
router.post('/logout', authMiddleware, logout)
router.get('/me', authMiddleware, getCurrentUser)
router.post('/forgot-password', authLimiter, validationMiddleware(forgotPasswordSchema), forgotPassword)
router.post('/reset-password/:token', authLimiter, validationMiddleware(resetPasswordSchema), resetPassword)

export default router
