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

/**
 * Get operational dashboard stats for authority
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await alertService.getAuthorityStats()
    return successResponse(res, stats, 'Authority statistics retrieved successfully', 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Get live weather & hazard profiles for state districts
 */
const getDistricts = async (req, res, next) => {
  try {
    const districts = await alertService.getAuthorityDistricts()
    return successResponse(res, districts, 'District weather and risk profiles retrieved', 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Get emergency relief resources (shelters, response teams)
 */
const getResources = async (req, res, next) => {
  try {
    const resources = await alertService.getAuthorityResources()
    return successResponse(res, resources, 'Disaster relief resources retrieved', 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Get time-series analytics and risk rankings
 */
const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await alertService.getAuthorityAnalytics(req.query.timeRange)
    return successResponse(res, analytics, 'Authority analytics retrieved', 200)
  } catch (error) {
    next(error)
  }
}

/**
 * Export official State Disaster Incident Log report as downloadable CSV
 */
const exportReport = async (req, res, next) => {
  try {
    const csvContent = await alertService.generateAuthorityExportReport()
    const filename = `State_Disaster_Incident_Report_${new Date().toISOString().slice(0, 10)}.csv`
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return res.status(200).send(csvContent)
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
  cancelAlert,
  getStats,
  getDistricts,
  getResources,
  getAnalytics,
  exportReport
}

export default {
  getMe,
  getAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  publishAlert,
  cancelAlert,
  getStats,
  getDistricts,
  getResources,
  getAnalytics,
  exportReport
}
