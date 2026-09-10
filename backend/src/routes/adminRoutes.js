import express from 'express'
import authMiddleware, { requireRole } from '../middleware/authMiddleware.js'
import {
  listUsers,
  changeUserRole,
  deleteUser,
  resetUserPassword,
  getPlatformAnalytics,
  getSystemHealth
} from '../controllers/adminController.js'

const router = express.Router()

// All admin routes require valid JWT and admin role
router.use(authMiddleware)
router.use(requireRole('admin'))

// User Management
router.get('/users', listUsers)
router.patch('/users/:id/role', changeUserRole)
router.delete('/users/:id', deleteUser)
router.post('/users/:id/reset-password', resetUserPassword)

// Analytics & System
router.get('/analytics', getPlatformAnalytics)
router.get('/health', getSystemHealth)

export default router
