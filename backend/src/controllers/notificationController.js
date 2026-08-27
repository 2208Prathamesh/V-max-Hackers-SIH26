import Notification from '../models/Notification.js';
import { successResponse } from '../utils/response.js';

/**
 * Get all notifications for the authenticated user
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id
    })
      .populate('relatedAlertId')
      .sort({ createdAt: -1 });

    return successResponse(
      res,
      notifications,
      'Notifications retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread notification count
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });

    return successResponse(
      res,
      { count },
      'Unread notification count retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Mark one notification as read
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        userId: req.user._id
      },
      {
        isRead: true
      },
      {
        returnDocument: 'after'
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    return successResponse(
      res,
      notification,
      'Notification marked as read',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      {
        userId: req.user._id,
        isRead: false
      },
      {
        $set: {
          isRead: true
        }
      }
    );

    return successResponse(
      res,
      { modifiedCount: result.modifiedCount },
      'All notifications marked as read',
      200
    );
  } catch (error) {
    next(error);
  }
};

export { getNotifications, getUnreadCount, markAsRead, markAllAsRead };
export default { getNotifications, getUnreadCount, markAsRead, markAllAsRead };
