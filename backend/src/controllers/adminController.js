import User from '../models/User.js'
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import SavedLocation from '../models/SavedLocation.js'
import UserPreferences from '../models/UserPreferences.js'
import Notification from '../models/Notification.js'
import { successResponse } from '../utils/response.js'
import { sendPasswordResetEmail } from '../services/emailService.js'
import crypto from 'node:crypto'
import { hashPassword } from '../utils/password.js'

/**
 * GET /api/admin/users
 * Paginated, filterable list of all users (no password hashes returned).
 */
export const listUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
    const skip = (page - 1) * limit
    const roleFilter = req.query.role
    const search = req.query.search?.trim() || ''

    const filter = {}
    if (roleFilter && ['user', 'farmer', 'authority', 'admin'].includes(roleFilter)) {
      filter.role = roleFilter
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash -passwordResetTokenHash -passwordResetExpiresAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ])

    return successResponse(
      res,
      {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      },
      'Users retrieved successfully',
      200
    )
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/admin/users/:id/role
 * Change a user's role.
 */
export const changeUserRole = async (req, res, next) => {
  try {
    const { id } = req.params
    const { role } = req.body
    const validRoles = ['user', 'farmer', 'authority', 'admin']

    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      })
    }

    // Prevent admin from revoking their own admin role
    if (id === String(req.user._id) && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admins cannot change their own role.'
      })
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-passwordHash -passwordResetTokenHash -passwordResetExpiresAt')

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    return successResponse(res, user, `User role updated to '${role}'`, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /api/admin/users/:id
 * Hard delete a user and cascade all their data.
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params

    // Prevent self-deletion
    if (id === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Admins cannot delete their own account via the admin panel.'
      })
    }

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const conversations = await Conversation.find({ userId: id }).select('_id')
    const convIds = conversations.map(c => c._id)

    await Promise.all([
      User.findByIdAndDelete(id),
      UserPreferences.deleteMany({ userId: id }),
      SavedLocation.deleteMany({ userId: id }),
      Conversation.deleteMany({ userId: id }),
      Message.deleteMany({ conversationId: { $in: convIds } }),
      Notification.deleteMany({ userId: id })
    ])

    return successResponse(res, null, `User '${user.name}' (${user.email}) deleted successfully`, 200)
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/admin/users/:id/reset-password
 * Generate a password reset link and dispatch email to the user.
 */
export const resetUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // Generate a cryptographically secure reset token
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    user.passwordResetTokenHash = tokenHash
    user.passwordResetExpiresAt = expiresAt
    await user.save()

    // Dispatch password reset email
    sendPasswordResetEmail({
      toEmail: user.email,
      userName: user.name,
      resetToken: rawToken
    }).catch(err => {
      console.warn(`[AdminController] Password reset email dispatch warning: ${err.message}`)
    })

    return successResponse(
      res,
      { sent: true, email: user.email },
      'Password reset email dispatched successfully',
      200
    )
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/admin/analytics
 * Platform-wide aggregated statistics.
 */
export const getPlatformAnalytics = async (req, res, next) => {
  try {
    const [
      usersByRole,
      totalConversations,
      totalMessages,
      recentUsers
    ] = await Promise.all([
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Conversation.countDocuments(),
      Message.countDocuments(),
      User.find({})
        .select('name email role createdAt isVerified')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ])

    const totalUsers = usersByRole.reduce((sum, r) => sum + r.count, 0)

    const roleCounts = {
      user: 0,
      farmer: 0,
      authority: 0,
      admin: 0
    }
    usersByRole.forEach(r => {
      if (roleCounts.hasOwnProperty(r._id)) roleCounts[r._id] = r.count
    })

    return successResponse(
      res,
      {
        summary: {
          totalUsers,
          roleCounts,
          totalConversations,
          totalMessages
        },
        recentUsers
      },
      'Platform analytics retrieved successfully',
      200
    )
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/admin/health
 * System health — uptime, memory, service statuses.
 */
export const getSystemHealth = async (req, res, next) => {
  try {
    const memoryUsage = process.memoryUsage()
    const uptimeSeconds = process.uptime()

    // Ping MongoDB by running a simple command
    let mongoStatus = 'healthy'
    try {
      const { default: mongoose } = await import('mongoose')
      if (mongoose.connection.readyState !== 1) mongoStatus = 'degraded'
    } catch {
      mongoStatus = 'error'
    }

    // Redis health — attempt connection check
    let redisStatus = 'unknown'
    try {
      const { default: redisClient } = await import('../config/redis.js')
      if (redisClient && redisClient.isReady) {
        redisStatus = 'healthy'
      } else if (redisClient) {
        redisStatus = 'connecting'
      } else {
        redisStatus = 'disabled'
      }
    } catch {
      redisStatus = 'disabled'
    }

    const formatMB = bytes => `${(bytes / 1024 / 1024).toFixed(1)} MB`
    const formatUptime = secs => {
      const h = Math.floor(secs / 3600)
      const m = Math.floor((secs % 3600) / 60)
      const s = Math.floor(secs % 60)
      return `${h}h ${m}m ${s}s`
    }

    return successResponse(
      res,
      {
        status: 'operational',
        uptime: formatUptime(uptimeSeconds),
        uptimeSeconds,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        pid: process.pid,
        memory: {
          heapUsed: formatMB(memoryUsage.heapUsed),
          heapTotal: formatMB(memoryUsage.heapTotal),
          rss: formatMB(memoryUsage.rss),
          external: formatMB(memoryUsage.external),
          heapUsedBytes: memoryUsage.heapUsed,
          heapTotalBytes: memoryUsage.heapTotal
        },
        services: {
          api: 'healthy',
          mongodb: mongoStatus,
          redis: redisStatus
        }
      },
      'System health retrieved successfully',
      200
    )
  } catch (error) {
    next(error)
  }
}
