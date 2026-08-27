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

const router = express.Router()

router.post('/register', register)

router.post('/login', login)

router.post('/logout', authMiddleware, logout)

router.get('/me', authMiddleware, getCurrentUser)

router.post('/forgot-password', forgotPassword)

router.post('/reset-password/:token', resetPassword)

export default router
