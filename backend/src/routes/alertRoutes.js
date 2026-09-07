import express from 'express'
import {
  getAlerts,
  getAlert,
  getActiveAlerts,
  markAlertRead,
  getMyAlerts
} from '../controllers/alertController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// Public alert endpoints
router.get('/', getAlerts)
router.get('/active', getActiveAlerts)

// User-authenticated alert endpoints
router.get('/my-alerts', authMiddleware, getMyAlerts)
router.get('/:id', getAlert)
router.patch('/:id/read', authMiddleware, markAlertRead)

export default router
