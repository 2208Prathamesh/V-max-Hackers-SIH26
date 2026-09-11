/**
 * Aviation Weather Controller
 * Handles METAR/TAF briefing requests.
 */

import { getAviationBriefing, AIRPORTS, fetchLiveMetar, parseMetar } from '../services/aviation/aviationService.js'

/**
 * GET /api/aviation/briefing/:icao
 * Full aviation weather briefing (decoded METAR + flight rules + crosswind analysis)
 */
export const getBriefing = async (req, res, next) => {
  try {
    const { icao } = req.params
    const briefing = await getAviationBriefing(icao)
    return res.json({ success: true, data: briefing })
  } catch (err) {
    if (err.statusCode === 400) return res.status(400).json({ success: false, message: err.message })
    next(err)
  }
}

/**
 * GET /api/aviation/metar/:icao
 * Raw + decoded METAR only
 */
export const getMetar = async (req, res, next) => {
  try {
    const { icao } = req.params
    const live = await fetchLiveMetar(icao)
    const decoded = live.raw ? parseMetar(live.raw) : null
    return res.json({ success: true, data: { source: live.source, raw: live.raw, decoded, isFallback: live.isFallback || false } })
  } catch (err) {
    if (err.statusCode === 400) return res.status(400).json({ success: false, message: err.message })
    next(err)
  }
}

/**
 * GET /api/aviation/airports
 * List all supported airports
 */
export const listAirports = async (req, res) => {
  const list = Object.entries(AIRPORTS).map(([icao, info]) => ({
    icao,
    name: info.name,
    city: info.city,
    runways: info.runways.length
  }))
  return res.json({ success: true, data: list })
}
