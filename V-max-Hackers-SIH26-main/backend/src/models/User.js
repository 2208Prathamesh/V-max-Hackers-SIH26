import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
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

    role: {
      type: String,
      enum: ['user', 'authority', 'admin'],
      default: 'user'
    },

    department: {
      type: String,
      default: null
    },

    state: {
      type: String,
      default: null
    },

    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

const User = mongoose.model('User', userSchema)

export default User
