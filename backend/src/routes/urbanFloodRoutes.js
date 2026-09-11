import { Router } from 'express'
import { getFloodIndex, listCities } from '../controllers/urbanFloodController.js'

const router = Router()

router.get('/cities', listCities)
router.get('/', getFloodIndex)

export default router
