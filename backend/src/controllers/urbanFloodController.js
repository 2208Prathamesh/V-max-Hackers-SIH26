/**
 * Urban Flood Controller
 * Handles flash flood vulnerability index requests.
 */

import { calculateFloodIndex, CITY_PROFILES, fetchLiveCityRainfall } from '../services/urban/urbanFloodService.js'

/**
 * GET /api/urban-flood?city=mumbai&mode=live
 * Calculate urban flash flood vulnerability index from live telemetry or forecast peak
 */
export const getFloodIndex = async (req, res, next) => {
  try {
    const { city, rainfall, mode } = req.query
    const cityKey = (city || 'mumbai').toLowerCase().trim()
    
    // Fetch live telemetry for the city
    const telemetry = await fetchLiveCityRainfall(cityKey)

    let rainfallMmh
    let activeMode = mode || 'live'
    let activeSource = telemetry.source

    if (rainfall !== undefined && rainfall !== null && rainfall !== '' && !isNaN(parseFloat(rainfall))) {
      rainfallMmh = Math.max(0, parseFloat(rainfall))
      activeMode = 'custom'
      activeSource = 'Manual Evaluation Threshold'
    } else if (activeMode === 'forecast') {
      rainfallMmh = telemetry.peak6h
      activeSource = 'Next 6-Hour Forecast Peak Telemetry'
    } else if (activeMode === 'monsoon_surge') {
      rainfallMmh = 55 // Monsoonal cloudburst baseline
      activeSource = 'Monsoon Emergency Cloudburst Baseline (55 mm/hr)'
    } else {
      rainfallMmh = telemetry.current
      activeMode = 'live'
      activeSource = 'Live Atmospheric Telemetry'
    }

    const result = calculateFloodIndex(rainfallMmh, cityKey)
    result.telemetry = telemetry
    result.activeMode = activeMode
    result.activeSource = activeSource

    return res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/urban-flood/cities
 * List all profiled cities
 */
export const listCities = async (req, res) => {
  const list = Object.entries(CITY_PROFILES).map(([key, info]) => ({
    id: key,
    name: info.name,
    state: info.state,
    population: info.population,
    runoffCoefficient: info.runoffCoefficient,
    drainageCapacityMmh: info.drainageCapacityMmh,
    hotspotsCount: info.hotspots.length
  }))
  return res.json({ success: true, data: list })
}
