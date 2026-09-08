import express from 'express';
import {
  getCurrentWeather,
  getForecast,
  getHourlyForecast,
  compareModels,
  searchLocations,
  reverseGeocode
} from '../controllers/weatherController.js';
import { getNews } from '../controllers/newsController.js';

const router = express.Router();

router.get('/current', getCurrentWeather);
router.get('/forecast', getForecast);
router.get('/hourly', getHourlyForecast);
router.get('/compare', compareModels);
router.get('/search', searchLocations);
router.get('/reverse-geocode', reverseGeocode);
router.get('/news', getNews);

export default router;
