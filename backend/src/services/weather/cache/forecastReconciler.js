import env from '../../../config/env.js'
import { parseAndValidateCoordinates } from '../../../utils/coordinates.js'

/**
 * Standardize timestamp to ISO UTC string
 * @param {string|Date} timestamp
 * @returns {string|null}
 */
export function normalizeTimestamp (timestamp) {
  if (!timestamp) return null
  let str = String(timestamp).trim()
  // If naive ISO string (e.g. '2026-09-09T10:00' or '2026-09-09T10:00:00'), append 'Z' for consistent UTC comparison
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(str)) {
    str += 'Z'
  }
  const date = new Date(str)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

/**
 * Standardize date string to YYYY-MM-DD
 * @param {string} dateStr
 * @returns {string|null}
 */
export function normalizeDate (dateStr) {
  if (!dateStr) return null
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr
  }
  const date = new Date(dateStr)
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10)
}

/**
 * Verify location compatibility between old and new data
 * Returns false if coordinates differ by more than ~0.05 degrees (~5.5km)
 * or if coordinate validation fails.
 */
export function areLocationsCompatible (locA, locB, tolerance = 0.05) {
  if (!locA || !locB) return true // Cannot disprove if missing
  try {
    const coordsA = parseAndValidateCoordinates(locA.latitude, locA.longitude)
    const coordsB = parseAndValidateCoordinates(locB.latitude, locB.longitude)
    const latDiff = Math.abs(coordsA.latitude - coordsB.latitude)
    const lonDiff = Math.abs(coordsA.longitude - coordsB.longitude)
    return latDiff <= tolerance && lonDiff <= tolerance
  } catch {
    return false
  }
}

/**
 * Reconcile hourly forecast points between old and new runs.
 *
 * @param {Array<object>} oldHourly
 * @param {Array<object>} newHourly
 * @param {object} options
 * @param {string} options.newSource
 * @param {string} [options.oldSource]
 * @param {string} options.nowIso
 * @param {number} [options.maxStaleAgeMs]
 * @param {number} [options.maxHours]
 * @returns {{ hourly: Array<object>, stats: { total: number, fresh: number, stale: number, mixedPoints: number } }}
 */
export function reconcileHourlyPoints (
  oldHourly = [],
  newHourly = [],
  options = {}
) {
  const nowIso = options.nowIso || new Date().toISOString()
  const nowMs = new Date(nowIso).getTime()
  const maxStaleAgeMs =
    options.maxStaleAgeMs || env.MAX_STALE_AGE_HOURLY_HOURS * 3600 * 1000
  const newSource = options.newSource || 'provider'
  const oldSource = options.oldSource || 'retained'

  // Map old hourly points by normalized ISO timestamp
  const oldMap = new Map()
  for (const pt of oldHourly || []) {
    const normTs = normalizeTimestamp(pt.time || pt.timestamp)
    if (!normTs) continue

    // Check maximum usable age for stale data
    const ptFetchedMs = pt.fetchedAt ? new Date(pt.fetchedAt).getTime() : 0
    if (ptFetchedMs && nowMs - ptFetchedMs > maxStaleAgeMs) {
      continue // Discard points older than maximum usable stale age
    }

    oldMap.set(normTs, pt)
  }

  // Map new hourly points
  const newMap = new Map()
  for (const pt of newHourly || []) {
    const normTs = normalizeTimestamp(pt.time || pt.timestamp)
    if (!normTs) continue
    newMap.set(normTs, pt)
  }

  // Combine distinct sorted timestamps
  const allTimestamps = Array.from(
    new Set([...oldMap.keys(), ...newMap.keys()])
  ).sort()

  const mergedHourly = []
  let freshCount = 0
  let staleCount = 0
  let mixedPointsCount = 0

  for (const ts of allTimestamps) {
    const newPt = newMap.get(ts)
    const oldPt = oldMap.get(ts)

    if (newPt && !oldPt) {
      // Pure fresh point
      mergedHourly.push({
        ...newPt,
        time: newPt.time || ts,
        timestamp: newPt.timestamp || ts,
        source: newPt.source || newSource,
        fetchedAt: newPt.fetchedAt || nowIso,
        isStale: false
      })
      freshCount++
    } else if (!newPt && oldPt) {
      // Pure stale point (gap filling missing timestamp)
      mergedHourly.push({
        ...oldPt,
        time: oldPt.time || ts,
        timestamp: oldPt.timestamp || ts,
        source: oldPt.source || oldSource,
        fetchedAt: oldPt.fetchedAt || nowIso,
        isStale: true,
        staleSince: oldPt.staleSince || nowIso
      })
      staleCount++
    } else {
      // Both exist: new point overrides old point, but missing/null fields are gap-filled
      const mergedPt = { ...newPt }
      let hasFilledField = false
      const fieldProvenance = {}

      const candidateFields = [
        'temperature',
        'humidity',
        'dewPoint',
        'apparentTemperature',
        'precipitation',
        'precipitationProbability',
        'rain',
        'weatherCode',
        'weatherDescription',
        'condition',
        'windSpeed',
        'windDirection',
        'windGust',
        'pressure',
        'cloudCover',
        'visibility',
        'uvIndex',
        'soilTemperature',
        'soilMoisture'
      ]

      for (const field of candidateFields) {
        const newVal = newPt[field]
        const oldVal = oldPt[field]

        if (newVal !== null && newVal !== undefined) {
          mergedPt[field] = newVal
        } else if (oldVal !== null && oldVal !== undefined) {
          // Field-level gap fill from old data
          mergedPt[field] = oldVal
          hasFilledField = true
          fieldProvenance[field] = {
            source: oldPt.source || oldSource,
            fetchedAt: oldPt.fetchedAt || oldPt.retrievedAt || null,
            isStale: true
          }
        }
      }

      mergedPt.time = newPt.time || oldPt.time || ts
      mergedPt.timestamp = newPt.timestamp || oldPt.timestamp || ts
      mergedPt.source = newPt.source || newSource
      mergedPt.fetchedAt = newPt.fetchedAt || nowIso
      mergedPt.isStale = false

      if (hasFilledField) {
        mergedPt.isPartiallyStale = true
        mergedPt.fieldProvenance = fieldProvenance
        mixedPointsCount++
      } else {
        freshCount++
      }

      mergedHourly.push(mergedPt)
    }
  }

  // Filter or limit to maxHours if requested
  const result =
    options.maxHours && options.maxHours > 0
      ? mergedHourly.slice(0, options.maxHours)
      : mergedHourly

  return {
    hourly: result,
    stats: {
      total: result.length,
      fresh: freshCount,
      stale: staleCount,
      mixedPoints: mixedPointsCount
    }
  }
}

/**
 * Reconcile daily forecast points between old and new runs.
 *
 * @param {Array<object>} oldDaily
 * @param {Array<object>} newDaily
 * @param {object} options
 * @returns {{ daily: Array<object>, stats: { total: number, fresh: number, stale: number } }}
 */
export function reconcileDailyPoints (
  oldDaily = [],
  newDaily = [],
  options = {}
) {
  const nowIso = options.nowIso || new Date().toISOString()
  const nowMs = new Date(nowIso).getTime()
  const maxStaleAgeMs =
    options.maxStaleAgeMs || env.MAX_STALE_AGE_DAILY_DAYS * 86400 * 1000
  const newSource = options.newSource || 'provider'
  const oldSource = options.oldSource || 'retained'

  const oldMap = new Map()
  for (const pt of oldDaily || []) {
    const normDate = normalizeDate(pt.date || pt.time)
    if (!normDate) continue

    const ptFetchedMs = pt.fetchedAt ? new Date(pt.fetchedAt).getTime() : 0
    if (ptFetchedMs && nowMs - ptFetchedMs > maxStaleAgeMs) {
      continue
    }
    oldMap.set(normDate, pt)
  }

  const newMap = new Map()
  for (const pt of newDaily || []) {
    const normDate = normalizeDate(pt.date || pt.time)
    if (!normDate) continue
    newMap.set(normDate, pt)
  }

  const allDates = Array.from(
    new Set([...oldMap.keys(), ...newMap.keys()])
  ).sort()

  const mergedDaily = []
  let freshCount = 0
  let staleCount = 0

  for (const d of allDates) {
    const newPt = newMap.get(d)
    const oldPt = oldMap.get(d)

    if (newPt && !oldPt) {
      mergedDaily.push({
        ...newPt,
        date: d,
        source: newPt.source || newSource,
        fetchedAt: newPt.fetchedAt || nowIso,
        isStale: false
      })
      freshCount++
    } else if (!newPt && oldPt) {
      mergedDaily.push({
        ...oldPt,
        date: d,
        source: oldPt.source || oldSource,
        fetchedAt: oldPt.fetchedAt || nowIso,
        isStale: true,
        staleSince: oldPt.staleSince || nowIso
      })
      staleCount++
    } else {
      const mergedPt = { ...newPt }
      const candidateFields = [
        'maxTemperature',
        'minTemperature',
        'apparentTemperatureMax',
        'apparentTemperatureMin',
        'precipitation',
        'precipitationSum',
        'rainSum',
        'precipitationProbability',
        'maxWindSpeed',
        'windGust',
        'weatherCode',
        'weatherDescription',
        'condition',
        'sunrise',
        'sunset',
        'uvIndexMax',
        'evapotranspiration'
      ]

      for (const f of candidateFields) {
        if (newPt[f] === null || newPt[f] === undefined) {
          if (oldPt[f] !== null && oldPt[f] !== undefined) {
            mergedPt[f] = oldPt[f]
          }
        }
      }

      mergedPt.date = d
      mergedPt.source = newPt.source || newSource
      mergedPt.fetchedAt = newPt.fetchedAt || nowIso
      mergedPt.isStale = false
      mergedDaily.push(mergedPt)
      freshCount++
    }
  }

  return {
    daily: mergedDaily,
    stats: {
      total: mergedDaily.length,
      fresh: freshCount,
      stale: staleCount
    }
  }
}

/**
 * Reconcile current weather condition object.
 */
export function reconcileCurrentConditions (
  oldCurrent,
  newCurrent,
  options = {}
) {
  if (!newCurrent && !oldCurrent) return null
  if (!oldCurrent) return { ...newCurrent, isStale: false }
  if (!newCurrent) {
    return {
      ...oldCurrent,
      isStale: true,
      staleSince: options.nowIso || new Date().toISOString()
    }
  }

  const merged = { ...newCurrent }
  for (const [k, v] of Object.entries(oldCurrent)) {
    if (merged[k] === null || merged[k] === undefined) {
      if (v !== null && v !== undefined) {
        merged[k] = v
      }
    }
  }
  merged.isStale = false
  return merged
}

/**
 * Compute overall cacheStatus based on composition of fresh vs stale points
 */
export function computeCacheStatus (stats) {
  const { fresh = 0, stale = 0, mixedPoints = 0, total = 0 } = stats || {}
  if (total === 0) return 'empty'
  if (stale === 0 && mixedPoints === 0) return 'fresh'
  if (fresh === 0 && mixedPoints === 0) return 'stale'
  return 'mixed'
}

/**
 * Main forecast reconciliation entry point.
 * Safely merges old retained forecast with new provider forecast.
 *
 * @param {object} oldData - Previous retained forecast
 * @param {object} newData - Newly fetched provider forecast
 * @param {object} [options]
 * @returns {object} Merged forecast preserving schema and additive cache metadata
 */
export function mergeForecastData (oldData, newData, options = {}) {
  const nowIso = options.nowIso || new Date().toISOString()

  // If no new data, return old data with stale status if available
  if (!newData) {
    if (!oldData) return null
    return {
      ...oldData,
      cache: {
        isCached: true,
        cacheStatus: 'stale',
        isStale: true,
        cachedAt: oldData.retrievedAt || oldData.cache?.cachedAt || nowIso,
        mergedAt: nowIso,
        sources: [oldData.source || 'retained']
      }
    }
  }

  // If no old data, return new data with fresh metadata
  if (!oldData) {
    return {
      ...newData,
      cache: {
        isCached: false,
        cacheStatus: 'fresh',
        isStale: false,
        cachedAt: nowIso,
        mergedAt: nowIso,
        sources: [newData.source || 'provider']
      }
    }
  }

  // SAFETY REQUIREMENT: Verify old and new forecasts refer to compatible locations
  const oldLoc = oldData.location || oldData.models?.openMeteo?.location
  const newLoc = newData.location || newData.models?.openMeteo?.location

  if (!areLocationsCompatible(oldLoc, newLoc)) {
    console.warn(
      '[Reconciler] Incompatible locations detected; skipping old data merge'
    )
    return {
      ...newData,
      cache: {
        isCached: false,
        cacheStatus: 'fresh',
        isStale: false,
        cachedAt: nowIso,
        mergedAt: nowIso,
        sources: [newData.source || 'provider']
      }
    }
  }

  // Identify forecast sub-objects (e.g. models.openMeteo or top-level forecast)
  const isMultiModel = Boolean(newData.models?.openMeteo)
  const newForecastObj = isMultiModel
    ? newData.models.openMeteo
    : newData.forecast || newData
  const oldForecastObj = isMultiModel
    ? oldData.models?.openMeteo || oldData.forecast || oldData
    : oldData.forecast || oldData

  const newSource = newForecastObj.source || newData.source || 'Open-Meteo'
  const oldSource = oldForecastObj.source || oldData.source || 'retained'

  const hourlyRes = reconcileHourlyPoints(
    oldForecastObj.hourly || [],
    newForecastObj.hourly || [],
    {
      newSource,
      oldSource,
      nowIso,
      maxHours: options.maxHours
    }
  )

  const dailyRes = reconcileDailyPoints(
    oldForecastObj.daily || [],
    newForecastObj.daily || [],
    {
      newSource,
      oldSource,
      nowIso
    }
  )

  const currentRes = reconcileCurrentConditions(
    oldForecastObj.current,
    newForecastObj.current,
    { nowIso }
  )

  const combinedStats = {
    total: hourlyRes.stats.total + dailyRes.stats.total,
    fresh: hourlyRes.stats.fresh + dailyRes.stats.fresh,
    stale: hourlyRes.stats.stale + dailyRes.stats.stale,
    mixedPoints: hourlyRes.stats.mixedPoints
  }

  const cacheStatus = computeCacheStatus(combinedStats)

  const reconciledForecast = {
    ...newForecastObj,
    current: currentRes,
    hourly: hourlyRes.hourly,
    daily: dailyRes.daily,
    location:
      newForecastObj.location || oldForecastObj.location || newData.location,
    retrievedAt: nowIso,
    source: newSource,
    isFallback: Boolean(newForecastObj.isFallback)
  }

  const distinctSources = Array.from(
    new Set([newSource, ...(hourlyRes.stats.stale > 0 ? [oldSource] : [])])
  )

  const additiveCache = {
    isCached: false,
    cacheStatus,
    isStale: cacheStatus === 'stale',
    isMixed: cacheStatus === 'mixed',
    cachedAt: nowIso,
    mergedAt: nowIso,
    sources: distinctSources,
    stats: combinedStats
  }

  if (isMultiModel) {
    return {
      ...newData,
      models: {
        ...newData.models,
        openMeteo: reconciledForecast
      },
      cache: additiveCache
    }
  }

  if (newData.forecast) {
    return {
      ...newData,
      forecast: reconciledForecast,
      cache: additiveCache
    }
  }

  return {
    ...reconciledForecast,
    cache: additiveCache
  }
}

export default {
  normalizeTimestamp,
  normalizeDate,
  areLocationsCompatible,
  reconcileHourlyPoints,
  reconcileDailyPoints,
  reconcileCurrentConditions,
  computeCacheStatus,
  mergeForecastData
}
