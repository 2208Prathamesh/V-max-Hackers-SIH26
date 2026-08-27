import authService from '../services/authService.js'
import { successResponse, errorResponse } from '../utils/response.js'

/**
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body)

    return successResponse(res, 201, 'User registered successfully', user)
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

    return successResponse(res, 200, 'Login successful', result)
  } catch (error) {
    next(error)
  }
}

/**
 * Logout user
 */
const logout = async (req, res, next) => {
  try {
    // If JWT is stateless, logout is normally handled
    // on the client by removing the token.
    // If using refresh tokens, invalidate them here.

    await authService.logout(req.user?._id)

    return successResponse(res, 200, 'Logout successful')
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

    return successResponse(
      res,
      200,
      'Current user retrieved successfully',
      user
    )
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

    // Avoid revealing whether an email exists
    return successResponse(
      res,
      200,
      'If the email exists, a password reset link has been sent'
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

    return successResponse(res, 200, 'Password reset successfully')
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
