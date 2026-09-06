import User from '../models/User.js';
import UserPreferences from '../models/UserPreferences.js';
import authService from '../services/authService.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Get current user settings and preferences
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getSettings = async (req, res, next) => {
  try {
    let settings = await UserPreferences.findOne({
      userId: req.user._id
    });

    if (!settings) {
      settings = await UserPreferences.create({
        userId: req.user._id
      });
    }

    return successResponse(
      res,
      settings,
      'Settings retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update user preferences and settings
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const updateSettings = async (req, res, next) => {
  try {
    const allowedFields = [
      'temperatureUnit',
      'windUnit',
      'pressureUnit',
      'precipitationUnit',
      'appearance',
      'language'
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (req.body.notifications) {
      const { weatherAlerts, dailyForecast, weeklySummary, breakingNews } =
        req.body.notifications;

      if (weatherAlerts !== undefined) {
        updateData['notifications.weatherAlerts'] = weatherAlerts;
      }
      if (dailyForecast !== undefined) {
        updateData['notifications.dailyForecast'] = dailyForecast;
      }
      if (weeklySummary !== undefined) {
        updateData['notifications.weeklySummary'] = weeklySummary;
      }
      if (breakingNews !== undefined) {
        updateData['notifications.breakingNews'] = breakingNews;
      }
    }

    const settings = await UserPreferences.findOneAndUpdate(
      {
        userId: req.user._id
      },
      {
        $set: updateData
      },
      {
        returnDocument: 'after',
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    if (updateData.language) {
      await User.findByIdAndUpdate(req.user._id, { language: updateData.language });
    }

    return successResponse(res, settings, 'Settings updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Change user password
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password, new password and confirm password are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    await authService.changePassword(req.user._id, currentPassword, newPassword);

    return successResponse(res, null, 'Password changed successfully', 200);
  } catch (error) {
    next(error);
  }
};

export { getSettings, updateSettings, changePassword };
export default { getSettings, updateSettings, changePassword };
