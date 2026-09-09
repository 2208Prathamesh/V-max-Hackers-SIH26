import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'
import { hashPassword, comparePassword } from '../utils/password.js'
import crypto from 'node:crypto'
import env from '../config/env.js'
import { sendPasswordResetEmail, sendWelcomeEmail } from './emailService.js'

/**
 * Register user
 */
const register = async ({
  name,
  email,
  password,
  isFarmer = false,
  role: requestedRole,
  language = 'en'
}) => {
  const existingUser = await User.findOne({
    email: email.toLowerCase()
  })

  if (existingUser) {
    const error = new Error('Email is already registered')
    error.statusCode = 409
    throw error
  }

  // Determine role: If isFarmer is true, assign 'farmer'. Otherwise 'user'.
  const role = (isFarmer === true || isFarmer === 'true' || requestedRole === 'farmer') ? 'farmer' : 'user'

  const hashedPassword = await hashPassword(password)

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash: hashedPassword,
    role,
    language: language || 'en'
  })

  const token = generateToken(user._id)

  // Dispatch Welcome Email asynchronously
  sendWelcomeEmail({
    toEmail: user.email,
    userName: user.name,
    role: user.role
  }).catch(err => {
    console.warn(`⚠️ [AuthService] Welcome email dispatch warning for ${user.email}:`, err.message)
  })

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      language: user.language || 'en',
      role: user.role || 'user'
    },
    token
  }
}

/**
 * Login
 */
const login = async (email, password) => {
  let user = await User.findOne({
    email: email.toLowerCase()
  }).select('+passwordHash')

  // Auto-provision standard demo accounts if not yet present in database
  if (!user && password === 'password123') {
    const demoProfiles = {
      'sidpatil@gmail.com': { name: 'Sid Patil', role: 'user' },
      'ramesh.kisan@weathergpt.ai': { name: 'Ramesh Kisan (शेतकरी)', role: 'farmer' },
      'officer.pune@disaster.gov.in': { name: 'Dr. A. Sharma (Disaster Cell)', role: 'authority' },
      'admin@weathergpt.ai': { name: 'System Administrator', role: 'admin' }
    }
    const demo = demoProfiles[email.toLowerCase()]
    if (demo) {
      const hashedPassword = await hashPassword(password)
      user = await User.create({
        name: demo.name,
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        role: demo.role,
        isVerified: true
      })
    }
  }

  if (!user) {
    const error = new Error('Invalid email or password')
    error.statusCode = 401
    throw error
  }

  const isMatch = await comparePassword(password, user.passwordHash)

  if (!isMatch) {
    const error = new Error('Invalid email or password')
    error.statusCode = 401
    throw error
  }

  const token = generateToken(user._id)

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      language: user.language || 'en',
      role: user.role || 'user'
    },
    token
  }
}

/**
 * Get current user
 */
const getCurrentUser = async userId => {
  const user = await User.findById(userId)

  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  return user
}

/**
 * Logout
 */
const logout = async userId => {
  // With stateless JWT authentication,
  // logout is normally handled on the client.
  return true
}

/**
 * Forgot password
 */
const forgotPassword = async email => {
  const user = await User.findOne({
    email: email.toLowerCase()
  }).select('+passwordResetTokenHash +passwordResetExpiresAt')

  if (!user) {
    // Do not reveal whether an email exists.
    return
  }

  const resetToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')

  user.passwordResetTokenHash = tokenHash
  user.passwordResetExpiresAt = new Date(
    Date.now() + env.PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000
  )
  await user.save()

  // Send password reset email via SMTP (or console in dev)
  try {
    await sendPasswordResetEmail({
      toEmail: user.email,
      userName: user.name,
      resetToken
    })
  } catch (err) {
    console.warn('Could not dispatch password reset email:', err.message)
  }

  return {
    resetToken,
    expiresAt: user.passwordResetExpiresAt
  }
}

/**
 * Reset password
 */
const resetPassword = async (token, password) => {
  if (!token || !String(token).trim()) {
    const error = new Error('Reset token is required')
    error.statusCode = 400
    throw error
  }

  const tokenHash = crypto
    .createHash('sha256')
    .update(String(token).trim())
    .digest('hex')

  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() }
  }).select('+passwordHash +passwordResetTokenHash +passwordResetExpiresAt')

  if (!user) {
    const error = new Error('Reset token is invalid or has expired')
    error.statusCode = 400
    throw error
  }

  user.passwordHash = await hashPassword(password)
  user.passwordResetTokenHash = null
  user.passwordResetExpiresAt = null
  await user.save()

  return true
}

/**
 * Change password
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+passwordHash')

  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  const isMatch = await comparePassword(currentPassword, user.passwordHash)

  if (!isMatch) {
    const error = new Error('Current password is incorrect')
    error.statusCode = 401
    throw error
  }

  user.passwordHash = await hashPassword(newPassword)

  await user.save()

  return true
}

/**
 * Social OAuth Login (Google, Microsoft, Apple)
 */
const socialLogin = async ({ provider, providerId, email, name, avatar, isFarmer = false }) => {
  const prov = (provider || '').toLowerCase().trim()
  if (!['google', 'microsoft', 'apple'].includes(prov)) {
    const error = new Error('Unsupported social provider')
    error.statusCode = 400
    throw error
  }

  const normalizedEmail = email ? email.toLowerCase().trim() : null
  if (!normalizedEmail) {
    const error = new Error('Email is required for social login')
    error.statusCode = 400
    throw error
  }

  let user = await User.findOne({ email: normalizedEmail })

  if (user) {
    // Existing user logging in via social account
    if (!user.authProvider || user.authProvider === 'local') {
      user.authProvider = prov
      if (providerId) user.authProviderId = providerId
      if (avatar && !user.profileImage) user.profileImage = avatar
      await user.save()
    }
  } else {
    // New user signing up via social login
    const randomPassword = crypto.randomBytes(32).toString('hex')
    const passwordHash = await hashPassword(randomPassword)
    const role = (isFarmer === true || isFarmer === 'true') ? 'farmer' : 'user'

    user = await User.create({
      name: name || `${prov.charAt(0).toUpperCase() + prov.slice(1)} User`,
      email: normalizedEmail,
      passwordHash,
      role,
      authProvider: prov,
      authProviderId: providerId || null,
      profileImage: avatar || null,
      isVerified: true
    })
  }

  const token = generateToken(user._id)

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
      language: user.language || 'en',
      profileImage: user.profileImage || null,
      authProvider: user.authProvider || prov
    },
    token
  }
}

export {
  register,
  login,
  socialLogin,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  changePassword
}

export default {
  register,
  login,
  socialLogin,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  changePassword
}
