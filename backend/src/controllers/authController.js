import authService from '../services/authService.js'
import emailService from '../services/emailService.js'
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
    const result = await authService.forgotPassword(email)
    return successResponse(
      res,
      result ? { resetToken: result.resetToken, expiresAt: result.expiresAt } : null,
      'Password reset instructions processed',
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
    const token = req.params.token || req.body.token
    const { password } = req.body
    await authService.resetPassword(token, password)
    return successResponse(res, null, 'Password reset successfully', 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Social OAuth Login (Google, Microsoft, Apple)
 */
const socialLogin = async (req, res, next) => {
  try {
    const result = await authService.socialLogin(req.body)
    return successResponse(res, result, 'Social login successful', 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Email template preview endpoint (allows visual inspection and testing)
 */
const getEmailPreview = async (req, res, next) => {
  try {
    const { type = 'reset' } = req.query
    if (type === 'alert') {
      const html = emailService.generateSevereWeatherAlertHtml({
        userName: 'Smt. Priya Sharma',
        alert: {
          title: '🚨 Severe Convective Thunderstorm & Squall Warning',
          description: 'High-intensity convective cloud cells detected across Pune & Western Maharashtra Corridor with squally winds exceeding 65 km/h, intense cloud-to-ground lightning, and localized inundation.',
          location: 'Pune & Western Ghats District Zone',
          severity: 'extreme',
          type: 'thunderstorm_lightning',
          duration: 'Valid for next 18 Hours (Until 18:00 IST)'
        }
      })
      res.setHeader('Content-Type', 'text/html')
      return res.send(html)
    } else if (type === 'welcome') {
      const html = emailService.generateWelcomeHtml({
        userName: 'Shri Ramesh Patil',
        role: req.query.role || 'farmer',
        dashboardLink: 'http://localhost:5173'
      })
      res.setHeader('Content-Type', 'text/html')
      return res.send(html)
    } else {
      const html = emailService.generatePasswordResetHtml({
        userName: 'Dr. Aarav Mehta',
        resetToken: 'WG-9842-SECURE',
        resetLink: 'http://localhost:5173?token=WG-9842-SECURE&action=reset-password',
        ttlMinutes: 30
      })
      res.setHeader('Content-Type', 'text/html')
      return res.send(html)
    }
  } catch (error) {
    next(error)
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
  getEmailPreview
}

export default {
  register,
  login,
  socialLogin,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  getEmailPreview
}

