import express from 'express'
import {
  getWarnings,
  getDistrictWarning,
  getBulletin
} from '../controllers/imdController.js'

const router = express.Router()

router.get('/warnings', getWarnings)
router.get('/warnings/district', getDistrictWarning)
router.get('/bulletin', getBulletin)

export default router
