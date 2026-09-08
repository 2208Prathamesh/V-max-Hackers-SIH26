import mongoose from 'mongoose';

/**
 * Cyclone Track Schema
 * Replaces the hardcoded ACTIVE_CYCLONE_TRACKS array that was inline in mosdacService.js
 */
const trackPointSchema = new mongoose.Schema(
  {
    step: {
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

    intensity: {
      type: String,
      required: true,
      trim: true
    },

    windKmh: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const cycloneTrackSchema = new mongoose.Schema(
  {
    systemName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    basin: {
      type: String,
      required: true,
      trim: true
    },

    currentIntensity: {
      type: String,
      required: true,
      trim: true
    },

    estimatedCentralPressureHpa: {
      type: Number,
      required: true
    },

    maximumSustainedWindKmh: {
      type: Number,
      required: true,
      min: 0
    },

    gustsKmh: {
      type: Number,
      min: 0
    },

    movementDirection: {
      type: String,
      trim: true
    },

    movementSpeedKmh: {
      type: Number,
      min: 0
    },

    trackPoints: {
      type: [trackPointSchema],
      default: []
    },

    status: {
      type: String,
      enum: ['active', 'dissipated', 'landfall'],
      default: 'active',
      index: true
    }
  },
  {
    timestamps: true
  }
);

const CycloneTrack = mongoose.model('CycloneTrack', cycloneTrackSchema);

export default CycloneTrack;
