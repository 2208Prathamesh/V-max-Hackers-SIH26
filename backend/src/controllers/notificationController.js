const Notification = require("../models/Notification");
const { successResponse } = require("../utils/response");

/**
 * Get all notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id,
    })
      .populate("relatedAlertId")
      .sort({ createdAt: -1 });

    return successResponse(
      res,
      200,
      "Notifications retrieved successfully",
      notifications
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    return successResponse(
      res,
      200,
      "Unread notification count retrieved successfully",
      {
        count,
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Mark one notification as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        userId: req.user._id,
      },
      {
        isRead: true,
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return successResponse(
      res,
      200,
      "Notification marked as read",
      notification
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      {
        userId: req.user._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    return successResponse(
      res,
      200,
      "All notifications marked as read",
      {
        modifiedCount: result.modifiedCount,
      }
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};