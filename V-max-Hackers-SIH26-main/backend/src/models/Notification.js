import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    type: {
      type: String,
      enum: ['weather_alert', 'forecast', 'system', 'reminder', 'general'],
      required: true,
      default: 'general'
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    relatedAlertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert',
      default: null
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false
    }
  }
)

export default mongoose.model('Notification', notificationSchema)
