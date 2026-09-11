import { Router } from 'express'
import { getBriefing, getMetar, listAirports } from '../controllers/aviationController.js'

const router = Router()

router.get('/airports', listAirports)
router.get('/metar/:icao', getMetar)
router.get('/briefing/:icao', getBriefing)

export default router
