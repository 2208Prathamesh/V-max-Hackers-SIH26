import express from 'express';
import { getWeatherMapLayer, getAlertsMapLayer, getFloodRiskMapLayer } from '../controllers/mapController.js';

const router = express.Router();

router.get('/layers/weather', getWeatherMapLayer);
router.get('/layers/alerts', getAlertsMapLayer);
router.get('/layers/flood-risk', getFloodRiskMapLayer);

export default router;
