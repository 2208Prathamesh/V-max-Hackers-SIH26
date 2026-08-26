import mongoose from 'mongoose'

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      enum: [
        'rain',
        'thunderstorm',
        'cyclone',
        'flood',
        'heatwave',
        'coldwave',
        'strong_wind',
        'fog',
        'drought',
        'lightning',
        'other'
      ],
      required: true
    },

    severity: {
      type: String,
      enum: ['low', 'moderate', 'high', 'extreme'],
      required: true,
      default: 'low'
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },

    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },

    startTime: {
      type: Date,
      required: true
    },

    endTime: {
      type: Date,
      required: true
    },

    source: {
      type: String,
      required: true,
      trim: true
    },

    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active'
    }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false
    }
  }
)

export default mongoose.model('Alert', alertSchema)
