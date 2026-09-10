import express from 'express'
import {
  register,
  login,
  socialLogin,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  getEmailPreview
} from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import validationMiddleware from '../middleware/validationMiddleware.js'
import { authLimiter, registerLimiter } from '../middleware/rateLimitMiddleware.js'
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../validators/authValidator.js'

const router = express.Router()

router.post('/register', registerLimiter, validationMiddleware(registerSchema), register)
router.post('/login', authLimiter, login)
router.post('/social-login', authLimiter, socialLogin)
router.post('/logout', authMiddleware, logout)
router.get('/me', authMiddleware, getCurrentUser)
router.post('/forgot-password', authLimiter, validationMiddleware(forgotPasswordSchema), forgotPassword)
router.post('/reset-password', authLimiter, validationMiddleware(resetPasswordSchema), resetPassword)
router.post('/reset-password/:token', authLimiter, validationMiddleware(resetPasswordSchema), resetPassword)
router.get('/email-preview', getEmailPreview)

export default router
