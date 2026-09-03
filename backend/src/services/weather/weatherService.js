import { getForecast as getOpenMeteoForecast } from './openMeteo/client.js'
import { getECMWFWeather } from './nwp/ecmwf/service.js'
import { getECMWFForecast as getOpenMeteoECMWF } from './openMeteo/ecmwf.js'
import { getGFSForecast } from './openMeteo/gfs.js'
import { getAirQuality } from './openMeteo/airQuality.js'
import { getElevation } from './openMeteo/elevation.js'
import { getFloodForecast } from './openMeteo/flood.js'
import { getMarineForecast } from './openMeteo/marine.js'
import { normalizeForecast } from './normalizers/weatherNormalizer.js'
import { CACHE_TTL_MS } from '../../config/constants.js'
import { getStationObservations } from './imd/imdClient.js'
import { findNearestImdStation } from './imd/imdStationLocator.js'
import { normalizeImdObservation } from './imd/imdNormalizer.js'
import { buildOfflineAncillaryData } from './offlineWeather.js'
import { parseAndValidateCoordinates } from '../../utils/coordinates.js'
// In-memory LRU-like cache for weather data
const weatherCache = new Map()
const inflightRequests = new Map()
const MAX_CACHE_ENTRIES = 300

/**
 * Retrieve cached weather data if not expired
 * @param {string} key
 * @returns {object|null}
 */
function getCached (key) {
  const entry = weatherCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL_MS.WEATHER_CURRENT) {
    weatherCache.delete(key)
    return null
  }
  return entry.data
}

/**
 * Store weather data in cache with bounded size
 * @param {string} key
 * @param {object} data
 */
function setCache (key, data) {
  if (weatherCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = weatherCache.keys().next().value
    weatherCache.delete(oldestKey)
  }
  weatherCache.set(key, { timestamp: Date.now(), data })
}

/**
 * Fetch ECMWF weather with automatic fallback to Open-Meteo ECMWF
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<object>}
 */
export async function fetchECMWFWithFallback (latitude, longitude) {
  try {
    return await getECMWFWeather(latitude, longitude)
  } catch (err) {
    console.warn(
      'Direct NWP ECMWF failed, falling back to Open-Meteo ECMWF:',
      err.message
    )
    try {
      const fallbackRaw = await getOpenMeteoECMWF(latitude, longitude)
      return normalizeForecast(fallbackRaw, 'ECMWF (Open-Meteo)')
    } catch (fallbackErr) {
      console.warn('Fallback ECMWF also failed:', fallbackErr.message)
      return normalizeForecast(
        await getOpenMeteoECMWF(latitude, longitude),
        'WeatherGPT Offline ECMWF'
      )
    }
  }
}

async function getImdObservation (latitude, longitude) {
  try {
    const station = await findNearestImdStation(latitude, longitude)

    const data = await getStationObservations(station.stationId)

    const observation = normalizeImdObservation(data?.features || [])

    if (!observation) {
      return {
        error: 'No IMD observation available',
        station
      }
    }

    return {
      ...observation,
      station: {
        id: station.stationId,
        name: station.name,
        distanceKm: station.distanceKm
      },
      retrievedAt: new Date().toISOString()
    }
  } catch (error) {
    console.warn('IMD observation failed:', error.message)

    return {
      error: 'IMD observation temporarily unavailable'
    }
  }
}
/**
 * Get comprehensive weather details for coordinates with in-flight deduplication
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<object>}
 */
export async function getWeather (latitude, longitude) {
  const coordinates = parseAndValidateCoordinates(latitude, longitude)
  const latNum = coordinates.latitude
  const lonNum = coordinates.longitude
  const cacheKey = `weather_${latNum.toFixed(4)}_${lonNum.toFixed(4)}`

  const cached = getCached(cacheKey)
  if (cached) return cached

  if (inflightRequests.has(cacheKey)) {
    return await inflightRequests.get(cacheKey)
  }

  const fetchPromise = (async () => {
    try {
      const [
        openMeteoRaw,
        ecmwfData,
        gfsRaw,
        airQuality,
        elevation,
        flood,
        marine,
        imdObservation
      ] = await Promise.all([
        getOpenMeteoForecast(latNum, lonNum),
        fetchECMWFWithFallback(latNum, lonNum),
        getGFSForecast(latNum, lonNum).catch(err => ({ error: err.message })),
        getAirQuality(latNum, lonNum).catch(() => null),
        getElevation(latNum, lonNum).catch(() => null),
        getFloodForecast(latNum, lonNum).catch(() => null),
        getMarineForecast(latNum, lonNum).catch(() => null),
        getImdObservation(latNum, lonNum)
      ])

      const offlineAncillary = buildOfflineAncillaryData(latNum, lonNum)

      const result = {
        location: {
          latitude: latNum,
          longitude: lonNum
        },
        forecast: normalizeForecast(openMeteoRaw, 'Open-Meteo'),
        models: {
          ecmwf: ecmwfData,
          gfs: gfsRaw?.error ? gfsRaw : normalizeForecast(gfsRaw, 'GFS')
        },
        observations: {
          imd: imdObservation
        },
        airQuality: airQuality || offlineAncillary.airQuality,
        elevation: elevation || offlineAncillary.elevation,
        flood: flood || offlineAncillary.flood,
        marine: marine || offlineAncillary.marine
      }

      setCache(cacheKey, result)
      return result
    } finally {
      inflightRequests.delete(cacheKey)
    }
  })()

  inflightRequests.set(cacheKey, fetchPromise)
  return await fetchPromise
}

/**
 * Get multi-model forecast
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} days
 * @returns {Promise<object>}
 */
export async function getForecast (latitude, longitude, days = 7) {
  const coordinates = parseAndValidateCoordinates(latitude, longitude)
  const latNum = coordinates.latitude
  const lonNum = coordinates.longitude

  const [openMeteoRaw, ecmwfData, gfsRaw] = await Promise.all([
    getOpenMeteoForecast(latNum, lonNum, days),
    fetchECMWFWithFallback(latNum, lonNum),
    getGFSForecast(latNum, lonNum, days).catch(err => ({ error: err.message }))
  ])

  return {
    location: {
      latitude: latNum,
      longitude: lonNum
    },
    models: {
      openMeteo: normalizeForecast(openMeteoRaw, 'Open-Meteo'),
      ecmwf: ecmwfData,
      gfs: gfsRaw?.error ? gfsRaw : normalizeForecast(gfsRaw, 'GFS')
    }
  }
}

/**
 * Get hourly forecast
 * @param {object} param0
 * @param {number} param0.latitude
 * @param {number} param0.longitude
 * @param {number} param0.hours
 * @returns {Promise<object>}
 */
export async function getHourlyForecast ({ latitude, longitude, hours = 24 }) {
  const coordinates = parseAndValidateCoordinates(latitude, longitude)
  const latNum = coordinates.latitude
  const lonNum = coordinates.longitude

  const forecastRaw = await getOpenMeteoForecast(
    latNum,
    lonNum,
    Math.max(2, Math.ceil(hours / 24))
  )
  const normalized = normalizeForecast(forecastRaw, 'Open-Meteo')

  return {
    location: {
      latitude: latNum,
      longitude: lonNum
    },
    hourly: (normalized.hourly || []).slice(0, hours)
  }
}

export default {
  getWeather,
  getForecast,
  getHourlyForecast,
  fetchECMWFWithFallback
}
