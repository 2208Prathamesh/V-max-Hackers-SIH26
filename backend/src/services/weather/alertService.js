const Alert = require("../models/Alert");

/**
 * Get all alerts
 */
const getAlerts = async () => {
  return await Alert.find()
    .sort({ createdAt: -1 });
};

/**
 * Get alert by ID
 */
const getAlert = async (alertId) => {
  const alert = await Alert.findById(alertId);

  if (!alert) {
    const error = new Error("Alert not found");
    error.statusCode = 404;
    throw error;
  }

  return alert;
};

/**
 * Get active alerts
 */
const getActiveAlerts = async () => {
  const now = new Date();

  return await Alert.find({
    status: "active",
    startTime: { $lte: now },
    endTime: { $gte: now },
  }).sort({
    severity: -1,
    startTime: 1,
  });
};

/**
 * Create alert
 */
const createAlert = async (alertData) => {
  return await Alert.create(alertData);
};

/**
 * Update alert status
 */
const updateAlertStatus = async (
  alertId,
  status
) => {
  return await Alert.findByIdAndUpdate(
    alertId,
    { status },
    {
      new: true,
      runValidators: true,
    }
  );
};

module.exports = {
  getAlerts,
  getAlert,
  getActiveAlerts,
  createAlert,
  updateAlertStatus,
};