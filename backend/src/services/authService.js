import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'
import { hashPassword, comparePassword } from '../utils/password.js'
import crypto from 'node:crypto'
import env from '../config/env.js'

/**
 * Register user
 */
const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({
    email: email.toLowerCase()
  })

  if (existingUser) {
    const error = new Error('Email is already registered')
    error.statusCode = 409
    throw error
  }

  const hashedPassword = await hashPassword(password)

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash: hashedPassword
  })

  const token = generateToken(user._id)

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  }
}

/**
 * Login
 */
const login = async (email, password) => {
  const user = await User.findOne({
    email: email.toLowerCase()
  }).select('+passwordHash')

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
      role: user.role
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

export {
  register,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  changePassword
}

export default {
  register,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  changePassword
}
