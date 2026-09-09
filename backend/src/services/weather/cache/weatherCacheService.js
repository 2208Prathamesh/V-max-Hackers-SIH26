import env from '../../../config/env.js'
import { parseAndValidateCoordinates } from '../../../utils/coordinates.js'
import {
  redisGet,
  redisSet,
  redisDel,
  redisKeys
} from '../../cache/redisClient.js'

/**
 * Deterministically normalize coordinates into a location cache key
 * @param {number|string} latitude
 * @param {number|string} longitude
 * @param {number} [precision]
 * @returns {string} e.g. "18.52_73.86"
 */
export function formatLocationKey (
  latitude,
  longitude,
  precision = env.CACHE_COORDINATE_PRECISION
) {
  const coords = parseAndValidateCoordinates(latitude, longitude)
  const prec = Math.max(0, Math.min(Number(precision) || 2, 6))
  return `${coords.latitude.toFixed(prec)}_${coords.longitude.toFixed(prec)}`
}

/**
 * Key Builders
 */
export const CacheKeys = {
  currentLatest: (locKey, includeNWP = false) =>
    `weather:current:${locKey}:${includeNWP ? 'full' : 'fast'}`,
  currentRetained: locKey => `weather:current:${locKey}:retained`,
  forecastLatest: (locKey, days = 7) =>
    `weather:forecast:${locKey}:${days}:latest`,
  forecastRetained: (locKey, days = 7) =>
    `weather:forecast:${locKey}:${days}:retained`,
  forecastRun: (locKey, provider, runTimestamp) =>
    `weather:forecast:${locKey}:run:${provider.toLowerCase()}:${runTimestamp}`,
  forecastRunPattern: (locKey, provider = '*') =>
    `weather:forecast:${locKey}:run:${provider.toLowerCase()}:*`,
  alerts: locKey => `weather:alerts:${locKey}`
}

/**
 * Safe JSON parser
 */
function parseJson (str) {
  if (!str) return null
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}

/**
 * Safe JSON stringifier
 */
function stringifyJson (obj) {
  try {
    return JSON.stringify(obj)
  } catch {
    return null
  }
}

/**
 * Weather Cache Service
 */
export const weatherCacheService = {
  /**
   * Get fresh current weather from cache
   */
  async getCurrentWeather (latitude, longitude, options = {}) {
    const locKey = formatLocationKey(latitude, longitude)
    const key = CacheKeys.currentLatest(locKey, options.includeNWP)
    const raw = await redisGet(key)
    return parseJson(raw)
  },

  /**
   * Get retained (fallback) current weather
   */
  async getRetainedCurrentWeather (latitude, longitude) {
    const locKey = formatLocationKey(latitude, longitude)
    const key = CacheKeys.currentRetained(locKey)
    const raw = await redisGet(key)
    return parseJson(raw)
  },

  /**
   * Set current weather in cache (hot + retained)
   */
  async setCurrentWeather (latitude, longitude, data, options = {}) {
    if (!data) return false
    const locKey = formatLocationKey(latitude, longitude)
    const serialized = stringifyJson(data)
    if (!serialized) return false

    const hotKey = CacheKeys.currentLatest(locKey, options.includeNWP)
    const retainedKey = CacheKeys.currentRetained(locKey)

    // Save hot copy with short fresh TTL
    await redisSet(hotKey, serialized, { EX: env.REDIS_TTL_CURRENT_FRESH_S })
    // Save retained copy with long retention TTL
    await redisSet(retainedKey, serialized, {
      EX: env.REDIS_TTL_CURRENT_RETENTION_S
    })

    return true
  },

  /**
   * Get fresh latest merged forecast
   */
  async getLatestForecast (latitude, longitude, days = 7) {
    const locKey = formatLocationKey(latitude, longitude)
    const key = CacheKeys.forecastLatest(locKey, days)
    const raw = await redisGet(key)
    return parseJson(raw)
  },

  /**
   * Get retained merged forecast (for stale fallback & reconciliation)
   */
  async getRetainedForecast (latitude, longitude, days = 7) {
    const locKey = formatLocationKey(latitude, longitude)
    const key = CacheKeys.forecastRetained(locKey, days)
    const raw = await redisGet(key)
    return parseJson(raw)
  },

  /**
   * Set merged forecast (writes latest + retained)
   */
  async setForecast (latitude, longitude, days = 7, forecastData) {
    if (!forecastData) return false
    const locKey = formatLocationKey(latitude, longitude)
    const serialized = stringifyJson(forecastData)
    if (!serialized) return false

    const latestKey = CacheKeys.forecastLatest(locKey, days)
    const retainedKey = CacheKeys.forecastRetained(locKey, days)

    // Latest fresh cache
    await redisSet(latestKey, serialized, {
      EX: env.REDIS_TTL_FORECAST_FRESH_S
    })
    // Long-lived retained cache
    await redisSet(retainedKey, serialized, {
      EX: env.REDIS_TTL_FORECAST_RETENTION_S
    })

    return true
  },

  /**
   * Save individual provider forecast run (immutable historical run)
   */
  async saveForecastRun (
    latitude,
    longitude,
    provider,
    runData,
    runTimestamp = null
  ) {
    if (!runData || !provider) return false
    const locKey = formatLocationKey(latitude, longitude)
    const ts = runTimestamp || runData.retrievedAt || new Date().toISOString()
    const sanitizedTs = ts.replace(/[:.]/g, '-')
    const key = CacheKeys.forecastRun(locKey, provider, sanitizedTs)

    const serialized = stringifyJson({
      provider,
      location: { latitude, longitude },
      runTimestamp: ts,
      savedAt: new Date().toISOString(),
      data: runData
    })

    if (!serialized) return false
    return await redisSet(key, serialized, {
      EX: env.REDIS_TTL_RUN_RETENTION_S
    })
  },

  /**
   * Retrieve historical provider forecast runs for a location
   */
  async getForecastRuns (latitude, longitude, provider = '*', limit = 5) {
    const locKey = formatLocationKey(latitude, longitude)
    const pattern = CacheKeys.forecastRunPattern(locKey, provider)
    const keys = await redisKeys(pattern)
    if (!keys || keys.length === 0) return []

    // Sort newest keys first
    const sortedKeys = keys.sort().reverse().slice(0, limit)
    const runs = []
    for (const k of sortedKeys) {
      const raw = await redisGet(k)
      const parsed = parseJson(raw)
      if (parsed) runs.push(parsed)
    }
    return runs
  },

  /**
   * Get cached alerts for location
   */
  async getAlerts (latitude, longitude) {
    const locKey = formatLocationKey(latitude, longitude)
    const key = CacheKeys.alerts(locKey)
    const raw = await redisGet(key)
    return parseJson(raw)
  },

  /**
   * Set cached alerts for location
   */
  async setAlerts (latitude, longitude, alerts) {
    if (!alerts) return false
    const locKey = formatLocationKey(latitude, longitude)
    const serialized = stringifyJson(alerts)
    if (!serialized) return false

    const key = CacheKeys.alerts(locKey)
    return await redisSet(key, serialized, { EX: env.REDIS_TTL_ALERTS_FRESH_S })
  },

  /**
   * Invalidate all cached data for a specific location
   */
  async invalidateLocation (latitude, longitude) {
    const locKey = formatLocationKey(latitude, longitude)
    const patterns = [
      `weather:current:${locKey}:*`,
      `weather:forecast:${locKey}:*`,
      `weather:alerts:${locKey}`
    ]
    for (const pattern of patterns) {
      const keys = await redisKeys(pattern)
      if (keys && keys.length > 0) {
        await redisDel(keys)
      }
    }
    return true
  }
}

export default weatherCacheService
