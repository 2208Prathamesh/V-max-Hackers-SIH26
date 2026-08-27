import Notification from '../models/Notification.js';

/**
 * Create a new notification
 * @param {object} param0
 * @param {string} param0.userId
 * @param {string} param0.type
 * @param {string} param0.title
 * @param {string} param0.message
 * @param {string|null} [param0.relatedAlertId]
 * @returns {Promise<object>}
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
  });
};

/**
 * Get all notifications for user
 * @param {string} userId 
 * @returns {Promise<Array<object>>}
 */
const getNotifications = async (userId) => {
  return await Notification.find({
    userId
  })
    .populate('relatedAlertId')
    .sort({ createdAt: -1 });
};

/**
 * Get unread notification count
 * @param {string} userId 
 * @returns {Promise<number>}
 */
const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({
    userId,
    isRead: false
  });
};

/**
 * Mark a single notification as read
 * @param {string} notificationId 
 * @param {string} userId 
 * @returns {Promise<object>}
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
      returnDocument: 'after'
    }
  );

  if (!notification) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }

  return notification;
};

/**
 * Mark all notifications as read for user
 * @param {string} userId 
 * @returns {Promise<object>}
 */
const markAllAsRead = async (userId) => {
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
  );
};

export {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};

export default {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};
