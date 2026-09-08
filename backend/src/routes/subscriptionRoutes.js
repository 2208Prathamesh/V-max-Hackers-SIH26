import express from 'express';
import {
  getSubscriptions,
  toggleSubscription
} from '../controllers/subscriptionController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getSubscriptions);
router.patch('/:id', authMiddleware, toggleSubscription);

export default router;
