import SavedLocation from '../models/SavedLocation.js';
import { successResponse } from '../utils/response.js';

/**
 * Get all saved locations and their notification preferences for the user
 */
export const getSubscriptions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const locations = await SavedLocation.find({ userId }).select('name city state country notificationsEnabled');
    return successResponse(res, locations, 'Subscriptions retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle notification preference for a specific location
 */
export const toggleSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'The "enabled" field must be a boolean'
      });
    }

    const location = await SavedLocation.findOne({ _id: id, userId: req.user._id });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found or not owned by user'
      });
    }

    location.notificationsEnabled = enabled;
    await location.save();

    return successResponse(res, location, 'Subscription preference updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

export default {
  getSubscriptions,
  toggleSubscription
};
