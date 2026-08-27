import Alert from '../models/Alert.js'
import Notification from '../models/Notification.js'
import { successResponse } from '../utils/response.js'

/**
 * Get all alerts
 */
const getAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 })

    return successResponse(res, 200, 'Alerts retrieved successfully', alerts)
  } catch (error) {
    next(error)
  }
}

/**
 * Get a single alert
 */
const getAlert = async (req, res, next) => {
  try {
    const { id } = req.params

    const alert = await Alert.findById(id)

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      })
    }

    return successResponse(res, 200, 'Alert retrieved successfully', alert)
  } catch (error) {
    next(error)
  }
}

/**
 * Get currently active alerts
 */
const getActiveAlerts = async (req, res, next) => {
  try {
    const now = new Date()

    const alerts = await Alert.find({
      status: 'active',
      startTime: { $lte: now },
      endTime: { $gte: now }
    }).sort({
      severity: -1,
      startTime: 1
    })

    return successResponse(
      res,
      200,
      'Active alerts retrieved successfully',
      alerts
    )
  } catch (error) {
    next(error)
  }
}

/**
 * Mark an alert notification as read
 */
const markAlertRead = async (req, res, next) => {
  try {
    const { id } = req.params

    // Find the notification belonging to the logged-in user
    // and related to this alert.
    const notification = await Notification.findOneAndUpdate(
      {
        userId: req.user._id,
        relatedAlertId: id
      },
      {
        isRead: true
      },
      {
        new: true
      }
    )

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Alert notification not found'
      })
    }

    return successResponse(res, 200, 'Alert marked as read', notification)
  } catch (error) {
    next(error)
  }
}

export { getAlerts, getAlert, getActiveAlerts, markAlertRead }
