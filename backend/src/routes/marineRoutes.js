import { Router } from 'express'
import { getForecast, getCoastalDistrict, listDistricts } from '../controllers/marineController.js'

const router = Router()

router.get('/districts', listDistricts)
router.get('/forecast', getForecast)
router.get('/coastal/:district', getCoastalDistrict)

export default router
