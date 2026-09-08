import express from 'express';
import {
  getCurrentWeather,
  getForecast,
  getHourlyForecast,
  compareModels,
  searchLocations
} from '../controllers/weatherController.js';

const router = express.Router();

router.get('/current', getCurrentWeather);
router.get('/forecast', getForecast);
router.get('/hourly', getHourlyForecast);
router.get('/compare', compareModels);
router.get('/search', searchLocations);

export default router;
