import { STORES, withStore } from './db.js'
import { formatLocationKey, isLocationCompatible } from './locationKey.js'

export const MAX_STALE_MS = {
  CURRENT: 12 * 60 * 60 * 1000, // 12 hours
  HOURLY: 72 * 60 * 60 * 1000, // 72 hours
  DAILY: 7 * 24 * 60 * 60 * 1000 // 7 days
}

/**
 * Save current weather to IndexedDB
 *
 * @param {number|string} latitude
 * @param {number|string} longitude
 * @param {object} data
 * @returns {Promise<boolean>}
 */
export const saveCurrentWeather = async (latitude, longitude, data) => {
  if (!data || typeof data !== 'object') return false

  try {
    const locationKey = formatLocationKey(latitude, longitude)
    const now = Date.now()

    // Preserve upstream metadata without mutation
    const record = {
      locationKey,
      latitude: Number(latitude),
      longitude: Number(longitude),
      timezone: data.location?.timezone || data.timezone || null,
      source: data.metadata?.source || data.source || null,
      fetchedAt:
        data.metadata?.fetchedAt ||
        data.fetchedAt ||
        new Date(now).toISOString(),
      cachedAt: now,
      data
    }

    const result = await withStore(
      STORES.CURRENT_WEATHER,
      'readwrite',
      async store => {
        await store.put(record)
        return true
      }
    )

    return Boolean(result)
  } catch (err) {
    console.warn(
      'WeatherCache: Error saving current weather:',
      err?.message || err
    )
    return false
  }
}

/**
 * Get current weather from IndexedDB
 * Returns null if not found, expired (> 12 hours), canonical key mismatch, or coordinates incompatible
 *
 * @param {number|string} latitude
 * @param {number|string} longitude
 * @returns {Promise<object|null>}
 */
export const getCurrentWeather = async (latitude, longitude) => {
  try {
    const locationKey = formatLocationKey(latitude, longitude)
    const record = await withStore(
      STORES.CURRENT_WEATHER,
      'readonly',
      async store => {
        return store.get(locationKey)
      }
    )

    if (!record || !record.data) return null

    // Verify stored locationKey strictly matches the requested canonical key
    if (record.locationKey !== locationKey) {
      return null
    }

    // Verify coordinate compatibility to prevent cross-location contamination
    if (
      !isLocationCompatible(
        latitude,
        longitude,
        record.latitude,
        record.longitude
      )
    ) {
      return null
    }

    // Check maximum usable age
    const now = Date.now()
    const age = now - (record.cachedAt || 0)
    if (age > MAX_STALE_MS.CURRENT) {
      return null
    }

    // Return data enriched with separate _offlineMeta without mutating original provider fields
    return {
      ...record.data,
      _offlineMeta: {
        isOffline: true,
        isStale: true,
        cachedAt: record.cachedAt,
        fetchedAt: record.fetchedAt,
        source: record.source,
        timezone: record.timezone,
        latitude: record.latitude,
        longitude: record.longitude,
        locationKey: record.locationKey
      }
    }
  } catch (err) {
    console.warn(
      'WeatherCache: Error retrieving current weather:',
      err?.message || err
    )
    return null
  }
}

/**
 * Save multi-day or hourly forecast to IndexedDB
 *
 * @param {number|string} latitude
 * @param {number|string} longitude
 * @param {object} data
 * @returns {Promise<boolean>}
 */
export const saveForecast = async (latitude, longitude, data) => {
  if (!data || typeof data !== 'object') return false

  try {
    const locationKey = formatLocationKey(latitude, longitude)
    const now = Date.now()

    const record = {
      locationKey,
      latitude: Number(latitude),
      longitude: Number(longitude),
      timezone: data.location?.timezone || data.timezone || null,
      source: data.metadata?.source || data.source || null,
      fetchedAt:
        data.metadata?.fetchedAt ||
        data.fetchedAt ||
        new Date(now).toISOString(),
      cachedAt: now,
      data
    }

    const result = await withStore(
      STORES.FORECASTS,
      'readwrite',
      async store => {
        await store.put(record)
        return true
      }
    )

    return Boolean(result)
  } catch (err) {
    console.warn('WeatherCache: Error saving forecast:', err?.message || err)
    return false
  }
}

/**
 * Get forecast from IndexedDB
 * Returns null if not found, expired (> 7 days), canonical key mismatch, or coordinates incompatible
 *
 * @param {number|string} latitude
 * @param {number|string} longitude
 * @returns {Promise<object|null>}
 */
export const getForecast = async (latitude, longitude) => {
  try {
    const locationKey = formatLocationKey(latitude, longitude)
    const record = await withStore(
      STORES.FORECASTS,
      'readonly',
      async store => {
        return store.get(locationKey)
      }
    )

    if (!record || !record.data) return null

    // Verify stored locationKey strictly matches the requested canonical key
    if (record.locationKey !== locationKey) {
      return null
    }

    // Verify coordinate compatibility
    if (
      !isLocationCompatible(
        latitude,
        longitude,
        record.latitude,
        record.longitude
      )
    ) {
      return null
    }

    // Check maximum usable age (forecast retains daily data up to 7 days)
    const now = Date.now()
    const age = now - (record.cachedAt || 0)
    if (age > MAX_STALE_MS.DAILY) {
      return null
    }

    return {
      ...record.data,
      _offlineMeta: {
        isOffline: true,
        isStale: true,
        cachedAt: record.cachedAt,
        fetchedAt: record.fetchedAt,
        source: record.source,
        timezone: record.timezone,
        latitude: record.latitude,
        longitude: record.longitude,
        locationKey: record.locationKey
      }
    }
  } catch (err) {
    console.warn(
      'WeatherCache: Error retrieving forecast:',
      err?.message || err
    )
    return null
  }
}

/**
 * Clean up expired weather records older than their respective max stale ages
 */
export const cleanExpiredWeather = async () => {
  const now = Date.now()

  // Clean current weather
  await withStore(STORES.CURRENT_WEATHER, 'readwrite', async store => {
    let cursor = await store.openCursor()
    while (cursor) {
      const record = cursor.value
      if (now - (record.cachedAt || 0) > MAX_STALE_MS.CURRENT) {
        await cursor.delete()
      }
      cursor = await cursor.continue()
    }
  }).catch(() => {})

  // Clean forecasts
  await withStore(STORES.FORECASTS, 'readwrite', async store => {
    let cursor = await store.openCursor()
    while (cursor) {
      const record = cursor.value
      if (now - (record.cachedAt || 0) > MAX_STALE_MS.DAILY) {
        await cursor.delete()
      }
      cursor = await cursor.continue()
    }
  }).catch(() => {})
}

export const weatherCache = {
  saveCurrentWeather,
  getCurrentWeather,
  saveForecast,
  getForecast,
  cleanExpiredWeather,
  MAX_STALE_MS
}

export default weatherCache
