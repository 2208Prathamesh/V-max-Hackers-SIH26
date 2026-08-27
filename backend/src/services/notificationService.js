import Notification from '../models/Notification.js'

/**
 * Create notification
 */
const createNotification = async ({
  userId,
  type,
  title,
  message,
  relatedAlertId = null
}) => {
  return await Notification.create({
    userId,
    type,
    title,
    message,
    relatedAlertId,
    isRead: false
  })
}

/**
 * Get user notifications
 */
const getNotifications = async userId => {
  return await Notification.find({
    userId
  })
    .populate('relatedAlertId')
    .sort({ createdAt: -1 })
}

/**
 * Get unread count
 */
const getUnreadCount = async userId => {
  return await Notification.countDocuments({
    userId,
    isRead: false
  })
}

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      userId
    },
    {
      isRead: true
    },
    {
      new: true
    }
  )

  if (!notification) {
    const error = new Error('Notification not found')
    error.statusCode = 404
    throw error
  }

  return notification
}

/**
 * Mark all notifications as read
 */
const markAllAsRead = async userId => {
  return await Notification.updateMany(
    {
      userId,
      isRead: false
    },
    {
      $set: {
        isRead: true
      }
    }
  )
}

export {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
}

export default {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
}
