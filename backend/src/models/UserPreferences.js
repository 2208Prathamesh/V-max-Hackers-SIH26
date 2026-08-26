import mongoose from 'mongoose'

const userPreferencesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },

    temperatureUnit: {
      type: String,
      enum: ['C', 'F'],
      default: 'C'
    },

    windUnit: {
      type: String,
      enum: ['km/h', 'm/s', 'mph', 'knots'],
      default: 'km/h'
    },

    pressureUnit: {
      type: String,
      enum: ['hPa', 'mb', 'inHg', 'mmHg'],
      default: 'hPa'
    },

    precipitationUnit: {
      type: String,
      enum: ['mm', 'in'],
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
      enum: ['en', 'hi', 'mr', 'bn', 'ta', 'te', 'gu', 'kn', 'ml', 'pa'],
      default: 'en'
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model('UserPreferences', userPreferencesSchema)
