import express from 'express';
import { getHistory, getTrends } from '../controllers/climateController.js';

const router = express.Router();

router.get('/history', getHistory);
router.get('/trends', getTrends);

export default router;
