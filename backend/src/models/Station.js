import mongoose from 'mongoose';

/**
 * Weather Observation Station Schema
 * Replaces the hardcoded METRO_STATIONS array that was inline in mapLayerService.js
 */
const stationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true
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

    state: {
      type: String,
      trim: true
    },

    country: {
      type: String,
      trim: true,
      default: 'India'
    },

    stationType: {
      type: String,
      enum: ['metro', 'district', 'rural', 'coastal', 'mountain'],
      default: 'metro'
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

stationSchema.index({ latitude: 1, longitude: 1 });

const Station = mongoose.model('Station', stationSchema);

export default Station;
