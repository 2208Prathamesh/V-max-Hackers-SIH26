import express from 'express';
import { getLayers, getCycloneTracks } from '../controllers/satelliteController.js';

const router = express.Router();

router.get('/layers', getLayers);
router.get('/cyclone-tracks', getCycloneTracks);

export default router;
