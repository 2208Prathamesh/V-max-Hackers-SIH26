import weatherService from '../services/weather/weatherService.js'
import imdService from '../services/weather/imd/imdService.js'
import { buildDecisionBrief } from '../services/decision/decisionEngine.js'
import { parseAndValidateCoordinates } from '../utils/coordinates.js'
import { searchLocation } from '../services/weather/openMeteo/geocoding.js'

/**
 * GET /api/advisories/decision
 * Returns a structured decision intelligence brief for the given location and role
 */
export async function getDecisionBrief (req, res, next) {
  try {
    let { latitude, longitude, lat, lon, city, role } = req.query
    latitude = latitude || lat
    longitude = longitude || lon
    const userRole = role || req.user?.role || 'user'

    // Resolve city to coordinates if provided
    if (city && (!latitude || !longitude)) {
      try {
        const geo = await searchLocation(city)
        if (geo?.results?.length) {
          const match = geo.results[0]
          latitude = match.latitude
          longitude = match.longitude
          city = `${match.name}${match.admin1 ? ', ' + match.admin1 : ''}, ${match.country}`
        }
      } catch (_) {}
    }

    if (!latitude || !longitude) {
      if (city) {
        return res.status(404).json({
          success: false,
          message: `Location not found for "${city}". Please check spelling or provide coordinates.`
        })
      }
      return res.status(400).json({
        success: false,
        message: 'latitude and longitude (or valid city name) are required'
      })
    }

    const coordinates = parseAndValidateCoordinates(latitude, longitude)

    // Fetch weather + IMD data concurrently with timeouts
    const [weatherData, imdWarning] = await Promise.all([
      weatherService.getWeather(coordinates.latitude, coordinates.longitude, { includeNWP: false })
        .catch(() => null),
      imdService.getDistrictWarning(city || '').catch(() => null)
    ])

    const locationLabel = city || `${coordinates.latitude.toFixed(2)}, ${coordinates.longitude.toFixed(2)}`

    const brief = buildDecisionBrief({
      weatherData,
      imdWarning,
      role: userRole,
      location: locationLabel
    })

    return res.json({
      success: true,
      data: brief
    })
  } catch (err) {
    next(err)
  }
}

export default { getDecisionBrief }
