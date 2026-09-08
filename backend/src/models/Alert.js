import mongoose from 'mongoose'
import { ALERT_TYPES, SEVERITY_LEVELS } from '../config/constants.js'

/**
 * Weather Alert Schema
 */
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
      enum: ALERT_TYPES,
      required: true
    },

    severity: {
      type: String,
      enum: Object.values(SEVERITY_LEVELS),
      required: true,
      default: SEVERITY_LEVELS.LOW
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

    region: {
      type: String,
      trim: true
    },

    probability: {
      type: String,
      trim: true
    },

    action: {
      type: String,
      trim: true
    },

    source: {
      type: String,
      required: true,
      trim: true
    },

    sourceType: {
      type: String,
      default: 'provider',
      trim: true
    },

    externalId: {
      type: String,
      default: null,
      index: true
    },

    isOfficial: {
      type: Boolean,
      default: false
    },

    affectedAreas: {
      type: [String],
      default: []
    },

    rawSourceUrl: {
      type: String,
      default: null
    },

    issuedAt: {
      type: Date,
      default: null
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    status: {
      type: String,
      enum: ['draft', 'active', 'expired', 'cancelled'],
      default: 'active',
      index: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },

    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    publishedAt: {
      type: Date,
      default: null
    },

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    cancelledAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

alertSchema.index({ status: 1, startTime: 1, endTime: 1 })
alertSchema.index({ severity: 1, createdAt: -1 })

const Alert = mongoose.model('Alert', alertSchema)

export default Alert
