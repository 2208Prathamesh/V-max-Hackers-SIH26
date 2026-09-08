import express from 'express'

import {
  getCurrentWeather,
  getForecast,
  getHourlyForecast
} from '../controllers/weatherController.js'

const router = express.Router()

router.get('/current', getCurrentWeather)

router.get('/forecast', getForecast)

router.get('/hourly', getHourlyForecast)

export default router
