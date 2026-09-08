import mongoose from 'mongoose';

/**
 * Flood Risk Zone Schema
 * Replaces the hardcoded floodZones array that was inline in mapLayerService.js
 */
const floodZoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
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

    riskLevel: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'EXTREME'],
      required: true,
      index: true
    },

    estimatedFloodDepthM: {
      type: Number,
      required: true,
      min: 0
    },

    advisory: {
      type: String,
      trim: true,
      default: 'Low-lying riparian zones. Maintain high alert and avoid crossing waterlogged causeways.'
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

const FloodZone = mongoose.model('FloodZone', floodZoneSchema);

export default FloodZone;
