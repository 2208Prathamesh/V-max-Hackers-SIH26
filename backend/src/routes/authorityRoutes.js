import express from 'express'
import authMiddleware, { requireRole } from '../middleware/authMiddleware.js'
import {
  getMe,
  getAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  publishAlert,
  cancelAlert
} from '../controllers/authorityController.js'

const router = express.Router()

// Enforce authMiddleware and requireRole('authority') on all authority routes
router.use(authMiddleware)
router.use(requireRole('authority'))

router.get('/me', getMe)
router.get('/alerts', getAlerts)
router.get('/alerts/:id', getAlertById)
router.post('/alerts', createAlert)
router.put('/alerts/:id', updateAlert)
router.post('/alerts/:id/publish', publishAlert)
router.post('/alerts/:id/cancel', cancelAlert)

export default router
