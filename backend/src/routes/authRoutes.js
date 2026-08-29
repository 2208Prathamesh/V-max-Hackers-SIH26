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
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../validators/authValidator.js'

const router = express.Router()

router.post('/register', validationMiddleware(registerSchema), register)
router.post('/login', validationMiddleware(loginSchema), login)
router.post('/logout', authMiddleware, logout)
router.get('/me', authMiddleware, getCurrentUser)
router.post('/forgot-password', validationMiddleware(forgotPasswordSchema), forgotPassword)
router.post('/reset-password/:token', validationMiddleware(resetPasswordSchema), resetPassword)

export default router
