/**
 * Marine Safety Controller
 * Handles fishermen safety, Beaufort scale, and port danger signal requests.
 */

import { getMarineSafetyForecast, COASTAL_DISTRICTS } from '../services/marine/marineService.js'

/**
 * GET /api/marine/forecast?lat=...&lon=...&district=...
 * Full marine safety forecast with Beaufort, Port Signals, Fishermen Advisory
 */
export const getForecast = async (req, res, next) => {
  try {
    const { lat, lon, latitude, longitude, district } = req.query
    const result = await getMarineSafetyForecast(
      lat || latitude,
      lon || longitude,
      district
    )
    return res.json({ success: true, data: result })
  } catch (err) {
    if (err.statusCode === 400) return res.status(400).json({ success: false, message: err.message })
    next(err)
  }
}

/**
 * GET /api/marine/coastal/:district
 * Coastal safety for a specific named district
 */
export const getCoastalDistrict = async (req, res, next) => {
  try {
    const { district } = req.params
    const result = await getMarineSafetyForecast(null, null, district)
    return res.json({ success: true, data: result })
  } catch (err) {
    if (err.statusCode === 400) return res.status(400).json({ success: false, message: err.message })
    next(err)
  }
}

/**
 * GET /api/marine/districts
 * List all supported coastal districts
 */
export const listDistricts = async (req, res) => {
  const list = Object.entries(COASTAL_DISTRICTS).map(([key, info]) => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    state: info.state,
    coast: info.coast,
    lat: info.lat,
    lon: info.lon
  }))
  return res.json({ success: true, data: list })
}
