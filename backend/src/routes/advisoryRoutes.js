import express from 'express';
import { getAgroAdvisory, getDisasterAdvisory } from '../controllers/advisoryController.js';

const router = express.Router();

router.get('/agriculture', getAgroAdvisory);
router.get('/disaster', getDisasterAdvisory);

export default router;
