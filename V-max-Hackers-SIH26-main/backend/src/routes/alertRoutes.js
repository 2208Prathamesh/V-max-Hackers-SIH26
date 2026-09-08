import express from 'express'

import {
  getAlerts,
  getAlert,
  getActiveAlerts,
  markAlertRead
} from '../controllers/alertController.js'

import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// All alert routes require authentication
router.use(authMiddleware)

router.get('/', getAlerts)

router.get('/active', getActiveAlerts)

router.get('/:id', getAlert)

router.patch('/:id/read', markAlertRead)

export default router
