import mongoose from 'mongoose';

/**
 * Saved Location Schema
 */
const savedLocationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    city: {
      type: String,
      required: true,
      trim: true
    },

    state: {
      type: String,
      trim: true,
      default: ''
    },

    country: {
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

    isFavorite: {
      type: Boolean,
      default: false
    },
    notificationsEnabled: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false
    }
  }
);

savedLocationSchema.index({ userId: 1, isFavorite: -1, createdAt: -1 });
savedLocationSchema.index({ userId: 1, latitude: 1, longitude: 1 });

const SavedLocation = mongoose.model('SavedLocation', savedLocationSchema);

export default SavedLocation;
