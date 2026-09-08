import mongoose from 'mongoose';

/**
 * MOSDAC Satellite Product Schema
 * Replaces the hardcoded MOSDAC_SATELLITE_PRODUCTS array that was inline in mosdacService.js
 */
const satelliteProductSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    satellite: {
      type: String,
      required: true,
      trim: true
    },

    sensor: {
      type: String,
      required: true,
      trim: true
    },

    spectralBand: {
      type: String,
      required: true,
      trim: true
    },

    resolutionKm: {
      type: Number,
      required: true,
      min: 0
    },

    updateFrequency: {
      type: String,
      required: true,
      trim: true
    },

    coverage: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    latestImageUrl: {
      type: String,
      trim: true
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

const SatelliteProduct = mongoose.model('SatelliteProduct', satelliteProductSchema);

export default SatelliteProduct;
