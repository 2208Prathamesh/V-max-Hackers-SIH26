import User from '../models/User.js'
import UserPreferences from '../models/UserPreferences.js'
import SavedLocation from '../models/SavedLocation.js'
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import Notification from '../models/Notification.js'
import { successResponse } from '../utils/response.js'

// GET /api/users/me
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    return successResponse(res, user, 'Profile retrieved successfully', 200)
  } catch (error) {
    next(error)
  }
}

// PATCH /api/users/me
export const updateProfile = async (req, res, next) => {
  try {
    const { name, language, timezone, profileImage } = req.body

    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (name !== undefined) user.name = name.trim()
    if (language !== undefined) user.language = language
    if (timezone !== undefined) user.timezone = timezone
    if (profileImage !== undefined) user.profileImage = profileImage

    await user.save()

    return successResponse(
      res,
      {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        language: user.language,
        timezone: user.timezone,
        isVerified: user.isVerified
      },
      'Profile updated successfully',
      200
    )
  } catch (error) {
    next(error)
  }
}

// POST /api/users/profile/image
export const uploadProfileImage = async (req, res, next) => {
  try {
    const profileImagePath = req.file ? req.file.path : req.body?.profileImage

    if (!profileImagePath) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded or provided'
      })
    }

    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    user.profileImage = profileImagePath
    await user.save()

    return successResponse(
      res,
      { profileImage: user.profileImage },
      'Profile image updated successfully',
      200
    )
  } catch (error) {
    next(error)
  }
}

// DELETE /api/users/me
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Cascading deletion of user's conversations and messages
    const userConversations = await Conversation.find({ userId }).select('_id')
    const convIds = userConversations.map(c => c._id)

    await Promise.all([
      User.findByIdAndDelete(userId),
      UserPreferences.deleteMany({ userId }),
      SavedLocation.deleteMany({ userId }),
      Conversation.deleteMany({ userId }),
      Message.deleteMany({ conversationId: { $in: convIds } }),
      Notification.deleteMany({ userId })
    ])

    return successResponse(res, null, 'Account deleted successfully', 200)
  } catch (error) {
    next(error)
  }
}

export default {
  getProfile,
  updateProfile,
  uploadProfileImage,
  deleteAccount
}
