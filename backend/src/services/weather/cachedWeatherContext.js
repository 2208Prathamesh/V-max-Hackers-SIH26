import { parseAndValidateCoordinates } from '../../utils/coordinates.js'
import weatherCacheService from './cache/weatherCacheService.js'

/**
 * Get unified cached weather context for a location.
 * Designed for consumption by Chat, offline assistants, and decision engines
 * without coupling them to Redis key structures or raw provider formats.
 *
 * @param {object} location - Coordinates object { latitude, longitude }
 * @param {object} [options]
 * @param {number} [options.days=5] - Forecast days to retrieve
 * @param {boolean} [options.includeAlerts=true] - Whether to include cached alerts
 * @returns {Promise<object>}
 */
export async function getCachedWeatherContext (location, options = {}) {
  const { latitude, longitude } = parseAndValidateCoordinates(
    location?.latitude,
    location?.longitude
  )

  const days = options.days || 5

  // Retrieve latest or retained forecast
  let forecastData = await weatherCacheService.getLatestForecast(
    latitude,
    longitude,
    days
  )
  let isFromRetained = false

  if (!forecastData) {
    forecastData = await weatherCacheService.getRetainedForecast(
      latitude,
      longitude,
      days
    )
    if (forecastData) {
      isFromRetained = true
    }
  }

  // Retrieve current weather
  let currentData = await weatherCacheService.getCurrentWeather(
    latitude,
    longitude,
    {
      includeNWP: false
    }
  )
  if (!currentData) {
    currentData = await weatherCacheService.getRetainedCurrentWeather(
      latitude,
      longitude
    )
  }

  // Retrieve alerts if requested
  const alertsData =
    options.includeAlerts !== false
      ? await weatherCacheService.getAlerts(latitude, longitude)
      : null

  // Extract metadata
  const cacheMeta = forecastData?.cache || currentData?.cache || {}
  const cacheStatus = isFromRetained
    ? 'stale'
    : cacheMeta.cacheStatus || (forecastData || currentData ? 'fresh' : 'empty')
  const isStale = isFromRetained || Boolean(cacheMeta.isStale)

  const distinctSources = new Set()
  if (cacheMeta.sources && Array.isArray(cacheMeta.sources)) {
    cacheMeta.sources.forEach(s => distinctSources.add(s))
  }
  if (forecastData?.models?.openMeteo?.source)
    distinctSources.add(forecastData.models.openMeteo.source)
  if (currentData?.forecast?.source)
    distinctSources.add(currentData.forecast.source)
  if (currentData?.observations?.imd?.source)
    distinctSources.add(currentData.observations.imd.source)

  return {
    location: {
      latitude,
      longitude
    },
    current:
      currentData?.forecast?.current ||
      currentData?.current ||
      forecastData?.models?.openMeteo?.current ||
      null,
    forecast:
      forecastData?.models?.openMeteo ||
      forecastData?.forecast ||
      forecastData ||
      null,
    alerts: alertsData || [],
    sources: Array.from(distinctSources),
    fetchedAt:
      forecastData?.retrievedAt ||
      currentData?.retrievedAt ||
      cacheMeta.cachedAt ||
      null,
    cacheStatus,
    isStale,
    hasUsableData: Boolean(currentData || forecastData)
  }
}

export default {
  getCachedWeatherContext
}
