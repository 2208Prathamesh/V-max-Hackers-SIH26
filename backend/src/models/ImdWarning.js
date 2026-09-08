import mongoose from 'mongoose';

/**
 * IMD District Warning Schema
 * Replaces the hardcoded IMD_ACTIVE_DISTRICT_DATABASE array that was inline in imdService.js
 */
const imdWarningSchema = new mongoose.Schema(
  {
    district: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    state: {
      type: String,
      required: true,
      trim: true
    },

    warningLevel: {
      type: String,
      enum: ['Red', 'Orange', 'Yellow', 'Green'],
      required: true,
      default: 'Green',
      index: true
    },

    action: {
      type: String,
      required: true,
      trim: true
    },

    hazard: {
      type: String,
      required: true,
      trim: true
    },

    validFrom: {
      type: Date,
      required: true
    },

    validTo: {
      type: Date,
      required: true
    },

    advice: {
      type: String,
      trim: true
    },

    issuedBy: {
      type: String,
      trim: true,
      default: 'India Meteorological Department (IMD)'
    },

    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
      index: true
    }
  },
  {
    timestamps: true
  }
);

imdWarningSchema.index({ status: 1, validFrom: 1, validTo: 1 });
imdWarningSchema.index({ district: 1, status: 1 });

const ImdWarning = mongoose.model('ImdWarning', imdWarningSchema);

export default ImdWarning;
