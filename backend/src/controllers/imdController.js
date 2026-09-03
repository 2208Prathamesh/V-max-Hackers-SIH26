import imdService from '../services/weather/imd/imdService.js'
import { successResponse } from '../utils/response.js'

/**
 * Get all active IMD warnings
 */
export const getWarnings = async (req, res, next) => {
  try {
    const warnings = await imdService.getAllIMDWarnings()
    return successResponse(
      res,
      warnings,
      'IMD warnings retrieved successfully',
      200
    )
  } catch (error) {
    next(error)
  }
}

/**
 * Get district-level warning
 */
export const getDistrictWarning = async (req, res, next) => {
  try {
    const districtName = req.query.name || req.query.district || 'Pune'
    const warning = await imdService.getDistrictWarning(districtName)
    return successResponse(
      res,
      warning,
      `IMD warning for ${districtName} retrieved`,
      200
    )
  } catch (error) {
    next(error)
  }
}

/**
 * Get IMD weather summary bulletin
 */
export const getBulletin = async (req, res, next) => {
  try {
    const bulletin = await imdService.getIMDBulletin()
    return successResponse(
      res,
      bulletin,
      'IMD meteorological bulletin retrieved successfully',
      200
    )
  } catch (error) {
    next(error)
  }
}

export default {
  getWarnings,
  getDistrictWarning,
  getBulletin
}
