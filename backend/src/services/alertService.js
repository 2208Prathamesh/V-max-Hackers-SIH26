import Alert from '../models/Alert.js';

/**
 * Get all alerts
 * @returns {Promise<Array<object>>}
 */
const getAlerts = async () => {
  return await Alert.find().sort({ createdAt: -1 });
};

/**
 * Get alert by ID
 * @param {string} alertId 
 * @returns {Promise<object>}
 */
const getAlert = async (alertId) => {
  const alert = await Alert.findById(alertId);

  if (!alert) {
    const error = new Error('Alert not found');
    error.statusCode = 404;
    throw error;
  }

  return alert;
};

/**
 * Get active alerts
 * @returns {Promise<Array<object>>}
 */
const getActiveAlerts = async () => {
  const now = new Date();

  return await Alert.find({
    status: 'active',
    startTime: { $lte: now },
    endTime: { $gte: now }
  }).sort({
    severity: -1,
    startTime: 1
  });
};

/**
 * Create alert
 * @param {object} alertData 
 * @returns {Promise<object>}
 */
const createAlert = async (alertData) => {
  return await Alert.create(alertData);
};

/**
 * Update alert status
 * @param {string} alertId 
 * @param {string} status 
 * @returns {Promise<object>}
 */
const updateAlertStatus = async (alertId, status) => {
  return await Alert.findByIdAndUpdate(
    alertId,
    { status },
    {
      returnDocument: 'after',
      runValidators: true
    }
  );
};

export { getAlerts, getAlert, getActiveAlerts, createAlert, updateAlertStatus };

export default {
  getAlerts,
  getAlert,
  getActiveAlerts,
  createAlert,
  updateAlertStatus
};
