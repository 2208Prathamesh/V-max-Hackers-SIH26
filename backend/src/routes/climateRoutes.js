import express from 'express';
import { getHistory, getTrends, getFullClimateData } from '../controllers/climateController.js';

const router = express.Router();

router.get('/history', getHistory);
router.get('/trends', getTrends);
router.get('/full', getFullClimateData);

export default router;
