import { successResponse } from '../utils/response.js'
import alertService from '../services/alertService.js'

/**
 * Get current authenticated authority user
 */
const getMe = async (req, res, next) => {
  try {
    const user = req.user

    return successResponse(
      res,
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      'Authority authenticated',
      200
    )
  } catch (error) {
    next(error)
  }
}

/**
 * Get all authority alerts (filtered by status)
 */
const getAlerts = async (req, res, next) => {
  try {
    const alerts = await alertService.getAuthorityAlerts(req.query)
    return successResponse(
      res,
      alerts,
      'Authority alerts retrieved successfully',
      200
    )
  } catch (error) {
    next(error)
  }
}

/**
 * Get single authority alert by ID
 */
const getAlertById = async (req, res, next) => {
  try {
    const alert = await alertService.getAuthorityAlertById(req.params.id)
    return successResponse(
      res,
      alert,
      'Authority alert retrieved successfully',
      200
    )
  } catch (error) {
    next(error)
  }
}

/**
 * Create a draft authority alert
 */
const createAlert = async (req, res, next) => {
  try {
    const alert = await alertService.createAuthorityAlert(req.body, req.user)
    return successResponse(
      res,
      alert,
      'Authority draft alert created successfully',
      201
    )
  } catch (error) {
    next(error)
  }
}

/**
 * Update an existing authority alert
 */
const updateAlert = async (req, res, next) => {
  try {
    const alert = await alertService.updateAuthorityAlert(
      req.params.id,
      req.body,
      req.user
    )
    return successResponse(
      res,
      alert,
      'Authority alert updated successfully',
      200
    )
  } catch (error) {
    next(error)
  }
}

/**
 * Publish a draft authority alert
 */
const publishAlert = async (req, res, next) => {
  try {
    const alert = await alertService.publishAuthorityAlert(
      req.params.id,
      req.user
    )
    return successResponse(
      res,
      alert,
      'Authority alert published successfully',
      200
    )
  } catch (error) {
    next(error)
  }
}

/**
 * Cancel an authority alert
 */
const cancelAlert = async (req, res, next) => {
  try {
    const alert = await alertService.cancelAuthorityAlert(
      req.params.id,
      req.user
    )
    return successResponse(
      res,
      alert,
      'Authority alert cancelled successfully',
      200
    )
  } catch (error) {
    next(error)
  }
}

export {
  getMe,
  getAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  publishAlert,
  cancelAlert
}

export default {
  getMe,
  getAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  publishAlert,
  cancelAlert
}
