import express from 'express'

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} from '../controllers/notificationController.js'

import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// All notification routes require authentication
router.use(authMiddleware)

router.get('/', getNotifications)

router.get('/unread-count', getUnreadCount)

router.patch('/read-all', markAllAsRead)

router.patch('/:id/read', markAsRead)

export default router
