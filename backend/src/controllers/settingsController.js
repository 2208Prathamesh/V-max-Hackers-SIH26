const UserPreferences = require("../models/UserPreferences");
const authService = require("../services/authService");
const { successResponse } = require("../utils/response");

/**
 * Get user settings
 */
const getSettings = async (req, res, next) => {
  try {
    let settings = await UserPreferences.findOne({
      userId: req.user._id,
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await UserPreferences.create({
        userId: req.user._id,
      });
    }

    return successResponse(
      res,
      200,
      "Settings retrieved successfully",
      settings
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update user settings
 */
const updateSettings = async (req, res, next) => {
  try {
    const allowedFields = [
      "temperatureUnit",
      "windUnit",
      "pressureUnit",
      "precipitationUnit",
      "appearance",
      "language",
    ];

    const updateData = {};

    // Update normal preference fields
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Update notification preferences
    if (req.body.notifications) {
      const {
        weatherAlerts,
        dailyForecast,
        weeklySummary,
        breakingNews,
      } = req.body.notifications;

      if (weatherAlerts !== undefined) {
        updateData["notifications.weatherAlerts"] = weatherAlerts;
      }

      if (dailyForecast !== undefined) {
        updateData["notifications.dailyForecast"] = dailyForecast;
      }

      if (weeklySummary !== undefined) {
        updateData["notifications.weeklySummary"] = weeklySummary;
      }

      if (breakingNews !== undefined) {
        updateData["notifications.breakingNews"] = breakingNews;
      }
    }

    const settings = await UserPreferences.findOneAndUpdate(
      {
        userId: req.user._id,
      },
      {
        $set: updateData,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return successResponse(
      res,
      200,
      "Settings updated successfully",
      settings
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Change user password
 */
const changePassword = async (req, res, next) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password, new password and confirm password are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 8 characters long",
      });
    }

    await authService.changePassword(
      req.user._id,
      currentPassword,
      newPassword
    );

    return successResponse(
      res,
      200,
      "Password changed successfully"
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  changePassword,
};