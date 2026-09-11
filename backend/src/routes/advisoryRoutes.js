import express from 'express';
import { getAgroAdvisory, getDisasterAdvisory } from '../controllers/advisoryController.js';
import { getDecisionBrief } from '../controllers/decisionController.js';

const router = express.Router();

router.get('/agriculture', getAgroAdvisory);
router.get('/disaster', getDisasterAdvisory);

// Decision Intelligence Engine — structured actionable brief
router.get('/decision', getDecisionBrief);

export default router;

