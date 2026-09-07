import Alert from '../models/Alert.js';
import Notification from '../models/Notification.js';
import SavedLocation from '../models/SavedLocation.js';
import { successResponse } from '../utils/response.js';
import alertService from '../services/alertService.js';

/**
 * Get all alerts
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    return successResponse(res, alerts, 'Alerts retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single alert by ID
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findById(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    return successResponse(res, alert, 'Alert retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get currently active alerts
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getActiveAlerts = async (req, res, next) => {
  try {
    const now = new Date();

    const alerts = await Alert.find({
      status: 'active',
      startTime: { $lte: now },
      endTime: { $gte: now }
    }).sort({
      severity: -1,
      startTime: 1
    });

    return successResponse(
      res,
      alerts,
      'Active alerts retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Mark an alert notification as read
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const markAlertRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      {
        userId: req.user._id,
        relatedAlertId: id
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
        message: 'Alert notification not found'
      });
    }

    return successResponse(res, notification, 'Alert marked as read', 200);
  } catch (error) {
    next(error);
  }
};

const getMyAlerts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const alerts = await alertService.getAlertsForUser(userId);
    return successResponse(res, alerts, 'Your relevant alerts retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

export { getAlerts, getAlert, getActiveAlerts, markAlertRead, getMyAlerts };
export default { getAlerts, getAlert, getActiveAlerts, markAlertRead, getMyAlerts };
