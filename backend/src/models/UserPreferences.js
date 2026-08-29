import mongoose from 'mongoose';
import { UNITS, SUPPORTED_LANGUAGES } from '../config/constants.js';

/**
 * User Preferences Schema
 */
const userPreferencesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },

    temperatureUnit: {
      type: String,
      enum: UNITS.TEMPERATURE,
      default: 'C'
    },

    windUnit: {
      type: String,
      enum: UNITS.WIND,
      default: 'km/h'
    },

    pressureUnit: {
      type: String,
      enum: UNITS.PRESSURE,
      default: 'hPa'
    },

    precipitationUnit: {
      type: String,
      enum: UNITS.PRECIPITATION,
      default: 'mm'
    },

    notifications: {
      weatherAlerts: {
        type: Boolean,
        default: true
      },

      dailyForecast: {
        type: Boolean,
        default: true
      },

      weeklySummary: {
        type: Boolean,
        default: true
      },

      breakingNews: {
        type: Boolean,
        default: false
      }
    },

    appearance: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },

    language: {
      type: String,
      enum: SUPPORTED_LANGUAGES,
      default: 'en'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('UserPreferences', userPreferencesSchema);
