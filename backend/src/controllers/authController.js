import authService from '../services/authService.js'
import { successResponse } from '../utils/response.js'

/**
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body)
    return successResponse(res, user, 'User registered successfully', 201)
  } catch (error) {
    next(error)
  }
}

/**
 * Login existing user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const result = await authService.login(email, password)
    return successResponse(res, result, 'Login successful', 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Logout user
 */
const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user?._id)
    return successResponse(res, null, 'Logout successful', 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Get currently authenticated user
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user._id)
    return successResponse(res, user, 'Current user retrieved successfully', 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Request password reset
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    await authService.forgotPassword(email)
    return successResponse(
      res,
      null,
      'If the email exists, a password reset link has been sent',
      200
    )
  } catch (error) {
    next(error)
  }
}

/**
 * Reset password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params
    const { password } = req.body
    await authService.resetPassword(token, password)
    return successResponse(res, null, 'Password reset successfully', 200)
  } catch (error) {
    next(error)
  }
}

export {
  register,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword
}

export default {
  register,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword
}
