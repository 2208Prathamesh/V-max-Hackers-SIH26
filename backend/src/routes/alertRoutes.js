import express from 'express'
import {
  getAlerts,
  getAlert,
  getActiveAlerts,
  markAlertRead,
  getMyAlerts
} from '../controllers/alertController.js'
import { generateCapXml, generateCapJson } from '../services/cap/capService.js'
import authMiddleware from '../middleware/authMiddleware.js'
import Alert from '../models/Alert.js'

const router = express.Router()

// Public alert endpoints
router.get('/', getAlerts)
router.get('/active', getActiveAlerts)

// CAP v1.2 Export Endpoints (NDMA SACHET / WIS 2.0 compatible)
router.get('/:id/cap-xml', async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id).lean()
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' })
    const xml = generateCapXml(alert)
    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="cap-alert-${req.params.id}.xml"`)
    return res.send(xml)
  } catch (err) { next(err) }
})

router.get('/:id/cap-json', async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id).lean()
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' })
    const capJson = generateCapJson(alert)
    return res.json({ success: true, data: capJson })
  } catch (err) { next(err) }
})

// User-authenticated alert endpoints
router.get('/my-alerts', authMiddleware, getMyAlerts)
router.get('/:id', getAlert)
router.patch('/:id/read', authMiddleware, markAlertRead)

export default router
