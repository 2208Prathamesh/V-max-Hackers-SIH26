import express from 'express'
import {
  getAlerts,
  getAlert,
  getActiveAlerts,
  markAlertRead
} from '../controllers/alertController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// Public alert endpoints
router.get('/', getAlerts)
router.get('/active', getActiveAlerts)
router.get('/:id', getAlert)

// User-authenticated alert endpoints
router.patch('/:id/read', authMiddleware, markAlertRead)

export default router
