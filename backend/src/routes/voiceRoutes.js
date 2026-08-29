import express from 'express';
import { transcribe, synthesize } from '../controllers/voiceController.js';

const router = express.Router();

router.post('/transcribe', transcribe);
router.post('/synthesize', synthesize);
router.get('/synthesize', synthesize);

export default router;
