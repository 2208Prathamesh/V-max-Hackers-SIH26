import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/authMiddleware.js';
import { getMe } from '../controllers/authorityController.js';

const router = express.Router();

router.get('/me', authMiddleware, requireRole('authority'), getMe);

export default router;
