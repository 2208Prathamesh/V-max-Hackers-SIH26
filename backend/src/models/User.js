import mongoose from 'mongoose';

/**
 * User Schema
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    passwordHash: {
      type: String,
      required: true,
      select: false
    },

    profileImage: {
      type: String,
      default: null
    },

    language: {
      type: String,
      default: 'en'
    },

    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    passwordResetTokenHash: {
      type: String,
      default: null,
      select: false
    },

    passwordResetExpiresAt: {
      type: Date,
      default: null,
      select: false
    },

    role: {
      type: String,
      enum: ['user', 'farmer', 'authority', 'admin'],
      default: 'user'
    },

    authProvider: {
      type: String,
      enum: ['local', 'google', 'microsoft', 'apple'],
      default: 'local'
    },

    authProviderId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({ createdAt: -1 });

const User = mongoose.model('User', userSchema);

export default User;
