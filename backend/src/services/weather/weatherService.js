import { getForecast as getOpenMeteoForecast } from './openMeteo/client.js'
import { getECMWFWeather } from './nwp/ecmwf/service.js'
import { getGFSWeather } from './nwp/noaaGfs/service.js'
import { getGFSForecast as getOpenMeteoGFS } from './openMeteo/gfs.js'
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
import { buildWeatherSynthesis } from './weatherSynthesis.js'
import { buildNWPModelComparison } from './nwp/modelComparisonService.js'
import { parseAndValidateCoordinates } from '../../utils/coordinates.js'
// In-memory LRU-like cache for weather data
const weatherCache = new Map()
const inflightRequests = new Map()
const forecastCache = new Map()
const inflightForecastRequests = new Map()
let ecmwfUnavailableUntil = 0
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

function getForecastCacheEntry (key) {
  return forecastCache.get(key) || null
}

function setForecastCache (key, data) {
  if (forecastCache.size >= MAX_CACHE_ENTRIES) {
    forecastCache.delete(forecastCache.keys().next().value)
  }

  forecastCache.set(key, {
    data,
    timestamp: Date.now()
  })
}

function withCacheMetadata (data, entry, isStale) {
  const ageMs = Date.now() - entry.timestamp
  return {
    ...data,
    cache: {
      isCached: true,
      isStale,
      cachedAt: new Date(entry.timestamp).toISOString(),
      ageMs
    },
    models: {
      ...data.models,
      openMeteo: {
        ...data.models.openMeteo,
        sourceType: isStale ? 'cached_stale' : 'cached',
        retrievedAt: data.models.openMeteo.retrievedAt
      }
    }
  }
}

function isValidNormalizedForecast (forecast) {
  return Boolean(
    forecast?.current &&
      Array.isArray(forecast.hourly) &&
      forecast.hourly.length > 0 &&
      Array.isArray(forecast.daily) &&
      forecast.daily.length > 0
  )
}

function isUsableModelForecast (forecast) {
  return isValidNormalizedForecast(forecast)
}

function isRateLimitedError (error) {
  return /\b429\b|rate limit/i.test(error?.message || '')
}

/**
 * Fetch native ECMWF weather. Open-Meteo remains a final forecast fallback,
 * rather than being reported as native ECMWF.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<object>}
 */
export async function fetchECMWFWithFallback (latitude, longitude, days = 7) {
  if (Date.now() < ecmwfUnavailableUntil) {
    return {
      error: 'ECMWF temporarily rate limited',
      source: 'ECMWF',
      sourceType: 'provider_unavailable',
      isFallback: true
    }
  }

  try {
    return await getECMWFWeather(latitude, longitude, days)
  } catch (err) {
    console.warn('Direct NWP ECMWF failed:', err.message)
    if (isRateLimitedError(err)) {
      ecmwfUnavailableUntil = Date.now() + 60 * 1000
    }

    return {
      error: `ECMWF unavailable: ${err.message}`,
      source: 'ECMWF-IFS',
      sourceType: 'provider_unavailable',
      isFallback: true
    }
  }
}

export async function fetchGFSWithFallback (latitude, longitude, days = 7) {
  try {
    return await getGFSWeather(latitude, longitude, days)
  } catch (err) {
    console.warn('Native NOAA GFS failed:', err.message)
    try {
      const fallbackRaw = await getOpenMeteoGFS(latitude, longitude, days)
      return {
        ...normalizeForecast(fallbackRaw, 'Open-Meteo GFS fallback'),
        source: 'Open-Meteo',
        sourceType: 'final_fallback',
        isFallback: true,
        fallbackFor: 'NOAA-GFS'
      }
    } catch (fallbackErr) {
      return {
        error: `NOAA GFS unavailable: ${fallbackErr.message}`,
        source: 'NOAA-GFS',
        sourceType: 'provider_unavailable',
        isFallback: true
      }
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
        getOpenMeteoForecast(latNum, lonNum).catch(() => null),
        fetchECMWFWithFallback(latNum, lonNum, 1),
        fetchGFSWithFallback(latNum, lonNum, 1),
        getAirQuality(latNum, lonNum).catch(() => null),
        getElevation(latNum, lonNum).catch(() => null),
        getFloodForecast(latNum, lonNum).catch(() => null),
        getMarineForecast(latNum, lonNum).catch(() => null),
        getImdObservation(latNum, lonNum)
      ])

      const offlineAncillary = buildOfflineAncillaryData(latNum, lonNum)
      const modelComparison = buildNWPModelComparison({
        gfs: gfsRaw,
        ecmwf: ecmwfData
      })
      const synthesis = buildWeatherSynthesis({
        observation: imdObservation,
        gfs: gfsRaw,
        ecmwf: ecmwfData,
        modelComparison
      })

      const result = {
        location: {
          latitude: latNum,
          longitude: lonNum
        },
        forecast: openMeteoRaw
          ? normalizeForecast(openMeteoRaw, 'Open-Meteo')
          : {
              error: 'Open-Meteo unavailable',
              source: 'Open-Meteo',
              sourceType: 'provider_unavailable',
              current: null,
              hourly: [],
              daily: []
            },
        models: {
          ecmwf: ecmwfData,
          gfs: gfsRaw
        },
        observations: {
          imd: imdObservation
        },
        modelComparison,
        synthesis,
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
async function withTimeout(promise, ms, timeoutError = new Error('Request timed out')) {
  let timeoutId;
  const timeoutPromise = new Promise(resolve => {
    timeoutId = setTimeout(() => resolve({ timeout: true, error: timeoutError }), ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

export async function getForecast (latitude, longitude, days = 7) {
  const coordinates = parseAndValidateCoordinates(latitude, longitude)
  const latNum = coordinates.latitude
  const lonNum = coordinates.longitude
  const daysNum = Math.min(Math.max(Number(days) || 7, 1), 14)
  const cacheKey = `forecast_${latNum.toFixed(4)}_${lonNum.toFixed(
    4
  )}_${daysNum}`
  const cachedEntry = getForecastCacheEntry(cacheKey)

  if (
    cachedEntry &&
    Date.now() - cachedEntry.timestamp <= CACHE_TTL_MS.WEATHER_FORECAST
  ) {
    return withCacheMetadata(cachedEntry.data, cachedEntry, false)
  }

  if (inflightForecastRequests.has(cacheKey)) {
    return await inflightForecastRequests.get(cacheKey)
  }

  const forecastPromise = (async () => {
    try {
      // Fast path: fetch Open-Meteo and GFS in parallel
      const [openMeteoResult, gfsResult] = await Promise.allSettled([
        getOpenMeteoForecast(latNum, lonNum, daysNum),
        fetchGFSWithFallback(latNum, lonNum, daysNum)
      ])

      // Background path: Trigger ECMWF download without blocking the main response
      const ecmwfPromise = fetchECMWFWithFallback(latNum, lonNum, daysNum)
      const ecmwfTimedResult = await withTimeout(ecmwfPromise, 2500)

      const openMeteoRaw =
        openMeteoResult.status === 'fulfilled' ? openMeteoResult.value : null
      const openMeteo = openMeteoRaw
        ? normalizeForecast(openMeteoRaw, 'Open-Meteo')
        : {
            error: openMeteoResult.reason?.message || 'Open-Meteo unavailable',
            source: 'Open-Meteo',
            sourceType: 'provider_unavailable',
            isFallback: true
          }
      const cached = getForecastCacheEntry(cacheKey)

      if (
        openMeteo?.isFallback &&
        cached &&
        !cached.data.models.openMeteo?.isFallback
      ) {
        return withCacheMetadata(cached.data, cached, true)
      }

      if (!isValidNormalizedForecast(openMeteo) && cached) {
        return withCacheMetadata(cached.data, cached, true)
      }

      const gfsModel = gfsResult.status === 'fulfilled' ? gfsResult.value : null

      // Determine ECMWF result based on timeout
      let ecmwfModel = null
      if (ecmwfTimedResult && ecmwfTimedResult.timeout) {
        ecmwfModel = {
          error: 'ECMWF is still loading in background',
          source: 'ECMWF',
          sourceType: 'provider_loading',
          isFallback: true
        }
      } else if (ecmwfTimedResult && !ecmwfTimedResult.timeout) {
        ecmwfModel = ecmwfTimedResult
      } else {
        ecmwfModel = {
          error: 'ECMWF unavailable',
          source: 'ECMWF',
          sourceType: 'provider_unavailable',
          isFallback: true
        }
      }

      if (
        !isUsableModelForecast(openMeteo) &&
        !isUsableModelForecast(ecmwfModel) &&
        !isUsableModelForecast(gfsModel)
      ) {
        throw (
          openMeteoResult.reason ||
          new Error('All forecast providers unavailable')
        )
      }

      const result = {
        location: {
          latitude: latNum,
          longitude: lonNum
        },
        models: {
          openMeteo,
          ecmwf: ecmwfModel,
          gfs: gfsModel || {
            error: gfsResult.reason?.message || 'GFS unavailable',
            source: 'GFS',
            sourceType: 'provider_unavailable',
            isFallback: true
          }
        }
      }

      if (!openMeteo.isFallback) {
        setForecastCache(cacheKey, result)
      }

      return result
    } catch (error) {
      const cached = getForecastCacheEntry(cacheKey)
      if (cached) return withCacheMetadata(cached.data, cached, true)
      throw error
    } finally {
      inflightForecastRequests.delete(cacheKey)
    }
  })()

  inflightForecastRequests.set(cacheKey, forecastPromise)
  return await forecastPromise
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
  fetchECMWFWithFallback,
  fetchGFSWithFallback
}
