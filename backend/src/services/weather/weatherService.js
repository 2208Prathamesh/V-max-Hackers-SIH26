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
import { buildOfflineAncillaryData, buildOfflineForecastPayload } from './offlineWeather.js'
import { buildWeatherSynthesis } from './weatherSynthesis.js'
import { buildNWPModelComparison } from './nwp/modelComparisonService.js'
import { parseAndValidateCoordinates } from '../../utils/coordinates.js'
import weatherCacheService from './cache/weatherCacheService.js'
import { mergeForecastData } from './cache/forecastReconciler.js'
import { enqueueNWP, getNWPQueueStats } from './nwp/nwpQueue.js'
export { enqueueNWP, getNWPQueueStats }

// In-memory LRU-like cache for weather data
const weatherCache = new Map()
const inflightRequests = new Map()
const forecastCache = new Map()
const inflightForecastRequests = new Map()
let ecmwfUnavailableUntil = 0
const MAX_CACHE_ENTRIES = 300 // Max entries cache

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

  const start = Date.now()
  console.log(`[NWP] ECMWF REQUEST START - ${latitude},${longitude}`)
  try {
    const result = await getECMWFWeather(latitude, longitude, days)
    console.log(`[NWP] ECMWF REQUEST END - ${Date.now() - start}ms`)
    return result
  } catch (err) {
    console.log(`[NWP] ECMWF REQUEST END (FAILED) - ${Date.now() - start}ms`)
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
  const start = Date.now()
  console.log(`[NWP] GFS REQUEST START - ${latitude},${longitude}`)
  try {
    const result = await getGFSWeather(latitude, longitude, days)
    console.log(`[NWP] GFS REQUEST END - ${Date.now() - start}ms`)
    return result
  } catch (err) {
    console.log(`[NWP] GFS REQUEST END (FAILED) - ${Date.now() - start}ms`)
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
    if (process.env.DEBUG_WEATHER === 'true') {
      console.warn('IMD observation fetch notice:', error.message)
    }

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
export async function getWeather (latitude, longitude, options = {}) {
  const coordinates = parseAndValidateCoordinates(latitude, longitude)
  const latNum = coordinates.latitude
  const lonNum = coordinates.longitude
  // ECMWF/NOAA-GFS are only awaited when the caller explicitly needs NWP data (includeNWP: true).
  // Current weather endpoints (/api/weather/current, /api/locations, chat, advisory) default to
  // false so current-weather responses are fast, non-blocking, and never trigger GRIB downloads.
  const includeNWP = options.includeNWP === true
  const cacheKey = `${includeNWP ? 'weather' : 'fast_weather'}_${latNum.toFixed(
    2
  )}_${lonNum.toFixed(2)}`

  const cached = getCached(cacheKey)
  if (cached) return cached

  // L2 Distributed Redis Cache lookup
  try {
    const redisHot = await weatherCacheService.getCurrentWeather(
      latNum,
      lonNum,
      { includeNWP }
    )
    if (redisHot) {
      setCache(cacheKey, redisHot)
      return redisHot
    }
  } catch (err) {
    console.warn('[WeatherCache] Redis current lookup error:', err.message)
  }

  if (inflightRequests.has(cacheKey)) {
    return await inflightRequests.get(cacheKey)
  }

  const fetchPromise = (async () => {
    try {
      let ecmwfData = buildBackgroundModelState(
        'ECMWF',
        'NWP models are not fetched for the current-weather response; available via /api/weather/forecast and /api/weather/compare'
      )
      let gfsRaw = buildBackgroundModelState(
        'NOAA-GFS',
        'NWP models are not fetched for the current-weather response; available via /api/weather/forecast and /api/weather/compare'
      )

      if (includeNWP) {
        const locKey = `${latNum.toFixed(2)}_${lonNum.toFixed(2)}`
        try {
          const nwpResult = await enqueueNWP(locKey, async () => {
            const gfs = await fetchGFSWithFallback(latNum, lonNum, 1).catch(
              () => null
            )
            await new Promise(r => setImmediate(r))
            if (global.gc) global.gc()
            const ecmwf = await fetchECMWFWithFallback(latNum, lonNum, 1).catch(
              () => null
            )
            return { gfs, ecmwf }
          })
          if (nwpResult?.gfs) gfsRaw = nwpResult.gfs
          if (nwpResult?.ecmwf) ecmwfData = nwpResult.ecmwf
        } catch (err) {
          console.warn('[NWP] getWeather NWP fetch error:', err.message)
        }
      }

      const [
        openMeteoRaw,
        airQuality,
        elevation,
        flood,
        marine,
        imdObservation
      ] = await Promise.all([
        getOpenMeteoForecast(latNum, lonNum).catch(() => null),
        getAirQuality(latNum, lonNum).catch(() => null),
        getElevation(latNum, lonNum).catch(() => null),
        getFloodForecast(latNum, lonNum).catch(() => null),
        getMarineForecast(latNum, lonNum).catch(() => null),
        getImdObservation(latNum, lonNum)
      ])

      const offlineAncillary = buildOfflineAncillaryData(latNum, lonNum)
      const modelComparison = includeNWP
        ? buildNWPModelComparison({
            gfs: gfsRaw,
            ecmwf: ecmwfData
          })
        : null

      const synthesis = includeNWP
        ? buildWeatherSynthesis({
            observation: imdObservation,
            gfs: gfsRaw,
            ecmwf: ecmwfData,
            modelComparison
          })
        : null

      const result = {
        location: {
          latitude: latNum,
          longitude: lonNum
        },
        forecast: openMeteoRaw
          ? normalizeForecast(openMeteoRaw, 'Open-Meteo')
          : normalizeForecast(
              buildOfflineForecastPayload(latNum, lonNum, { days: 7 }),
              'WeatherGPT-Synoptic'
            ),
        models: {
          ecmwf: ecmwfData,
          gfs: gfsRaw
        },
        observations: {
          imd: imdObservation
        },
        modelComparison,
        synthesis,
        airQuality: airQuality ? {
          ...airQuality,
          aqi: Math.round(airQuality.current?.us_aqi ?? airQuality.current?.usAqi ?? airQuality.current?.european_aqi ?? 55),
          current: {
            ...airQuality.current,
            aqi: Math.round(airQuality.current?.us_aqi ?? airQuality.current?.usAqi ?? airQuality.current?.european_aqi ?? 55),
            usAqi: airQuality.current?.us_aqi ?? airQuality.current?.usAqi,
            europeanAqi: airQuality.current?.european_aqi ?? airQuality.current?.europeanAqi,
            pm2_5: airQuality.current?.pm2_5 ?? airQuality.current?.pm25 ?? 15,
            pm10: airQuality.current?.pm10 ?? 25,
            no2: airQuality.current?.nitrogen_dioxide ?? airQuality.current?.no2 ?? 10,
            so2: airQuality.current?.sulphur_dioxide ?? airQuality.current?.so2 ?? 5,
            o3: airQuality.current?.ozone ?? airQuality.current?.o3 ?? 30,
            co: airQuality.current?.carbon_monoxide ?? airQuality.current?.co ?? 150
          }
        } : {
          ...offlineAncillary.airQuality,
          aqi: offlineAncillary.airQuality?.current?.usAqi ?? 55
        },
        elevation: elevation || offlineAncillary.elevation,
        flood: flood || offlineAncillary.flood,
        marine: marine || offlineAncillary.marine
      }

      setCache(cacheKey, result)
      weatherCacheService
        .setCurrentWeather(latNum, lonNum, result, { includeNWP })
        .catch(err => {
          console.warn(
            '[WeatherCache] Redis setCurrentWeather warning:',
            err.message
          )
        })

      return result
    } catch (fetchErr) {
      // Graceful provider fallback: attempt to retrieve retained current weather
      try {
        const retained = await weatherCacheService.getRetainedCurrentWeather(
          latNum,
          lonNum
        )
        if (retained) {
          return {
            ...retained,
            cache: {
              ...(retained.cache || {}),
              isCached: true,
              cacheStatus: 'stale',
              isStale: true
            }
          }
        }
      } catch {}
      throw fetchErr
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
function buildBackgroundModelState (providerName, reason) {
  return {
    error: reason,
    source: providerName,
    sourceType: 'provider_loading',
    isFallback: true
  }
}

function updateForecastCacheWithBackgroundModel (
  cacheKey,
  providerName,
  modelData
) {
  const cachedEntry = getForecastCacheEntry(cacheKey)
  if (!cachedEntry) return null

  const nextData = {
    ...cachedEntry.data,
    models: {
      ...cachedEntry.data.models,
      [providerName]: modelData
    }
  }

  setForecastCache(cacheKey, nextData)
  return nextData
}

export async function getForecast (latitude, longitude, days = 7) {
  const coordinates = parseAndValidateCoordinates(latitude, longitude)
  const latNum = coordinates.latitude
  const lonNum = coordinates.longitude
  const daysNum = Math.min(Math.max(Number(days) || 7, 1), 14)
  const cacheKey = `forecast_${latNum.toFixed(2)}_${lonNum.toFixed(
    2
  )}_${daysNum}`

  // 1. Check L1 in-memory cache
  const cachedEntry = getForecastCacheEntry(cacheKey)
  if (
    cachedEntry &&
    Date.now() - cachedEntry.timestamp <= CACHE_TTL_MS.WEATHER_FORECAST
  ) {
    return withCacheMetadata(cachedEntry.data, cachedEntry, false)
  }

  // 2. Check L2 Distributed Redis latest cache
  try {
    const redisLatest = await weatherCacheService.getLatestForecast(
      latNum,
      lonNum,
      daysNum
    )
    if (redisLatest) {
      setForecastCache(cacheKey, redisLatest)
      return redisLatest
    }
  } catch (err) {
    console.warn(
      '[WeatherCache] Redis latest forecast lookup error:',
      err.message
    )
  }

  // 3. In-flight request deduplication
  if (inflightForecastRequests.has(cacheKey)) {
    return await inflightForecastRequests.get(cacheKey)
  }

  const forecastPromise = (async () => {
    try {
      const openMeteoRaw = await getOpenMeteoForecast(
        latNum,
        lonNum,
        daysNum
      ).catch(() => null)
      let openMeteo = openMeteoRaw
        ? normalizeForecast(openMeteoRaw, 'Open-Meteo')
        : null

      if (!openMeteo || !isValidNormalizedForecast(openMeteo)) {
        const offPayload = buildOfflineForecastPayload(latNum, lonNum, {
          days: daysNum,
          hours: Math.max(daysNum * 24, 72)
        })
        openMeteo = normalizeForecast(offPayload, 'WeatherGPT-Synoptic')
        openMeteo.isFallback = true
      }

      // Check retained forecast from Redis for fallback and reconciliation
      let retainedData = null
      try {
        retainedData = await weatherCacheService.getRetainedForecast(
          latNum,
          lonNum,
          daysNum
        )
      } catch (err) {
        console.warn(
          '[WeatherCache] Retained forecast fetch error:',
          err.message
        )
      }

      const warmCache = getForecastCacheEntry(cacheKey)
      const fallbackSource = retainedData || warmCache?.data

      if (openMeteo?.isFallback && fallbackSource) {
        if (retainedData) {
          return {
            ...retainedData,
            cache: {
              ...(retainedData.cache || {}),
              isCached: true,
              cacheStatus: 'stale',
              isStale: true
            }
          }
        }
        if (warmCache && !warmCache.data.models?.openMeteo?.isFallback) {
          return withCacheMetadata(warmCache.data, warmCache, true)
        }
      }

      if (!isValidNormalizedForecast(openMeteo) && fallbackSource) {
        if (retainedData) {
          return {
            ...retainedData,
            cache: {
              ...(retainedData.cache || {}),
              isCached: true,
              cacheStatus: 'stale',
              isStale: true
            }
          }
        }
        if (warmCache) {
          return withCacheMetadata(warmCache.data, warmCache, true)
        }
      }

      const loadingModels = {
        ecmwf: buildBackgroundModelState(
          'ECMWF',
          'ECMWF is still loading in background'
        ),
        gfs: buildBackgroundModelState(
          'GFS',
          'NOAA GFS is still loading in background'
        )
      }

      // Reconcile new provider forecast with previous retained forecast
      let reconciledOpenMeteo = openMeteo
      let overallCacheStatus = 'fresh'
      let isMixed = false

      if (retainedData && isValidNormalizedForecast(openMeteo)) {
        const merged = mergeForecastData(
          retainedData.models?.openMeteo || retainedData,
          openMeteo,
          { nowIso: new Date().toISOString() }
        )
        reconciledOpenMeteo =
          merged.forecast || merged.models?.openMeteo || merged
        overallCacheStatus = merged.cache?.cacheStatus || 'fresh'
        isMixed = overallCacheStatus === 'mixed'
      }

      const result = {
        location: {
          latitude: latNum,
          longitude: lonNum
        },
        models: {
          openMeteo: reconciledOpenMeteo,
          ...loadingModels
        },
        cache: {
          isCached: false,
          cacheStatus: overallCacheStatus,
          isStale: overallCacheStatus === 'stale',
          isMixed,
          cachedAt: new Date().toISOString()
        }
      }

      // Save raw Open-Meteo forecast run as immutable history
      if (!openMeteo.isFallback && openMeteoRaw) {
        weatherCacheService
          .saveForecastRun(
            latNum,
            lonNum,
            'open-meteo',
            openMeteo,
            openMeteo.retrievedAt
          )
          .catch(err =>
            console.warn('[WeatherCache] Save run error:', err.message)
          )
      }

      // Save in L1 and L2 (latest and retained)
      if (!openMeteo.isFallback) {
        setForecastCache(cacheKey, result)
        weatherCacheService
          .setForecast(latNum, lonNum, daysNum, result)
          .catch(err =>
            console.warn('[WeatherCache] Set forecast error:', err.message)
          )
      }

      // Background refresh: serialize NWP requests so multiple parallel requests never exhaust memory
      const locKey = `${latNum.toFixed(2)}_${lonNum.toFixed(2)}`
      enqueueNWP(locKey, async () => {
        let gfsResult
        try {
          const val = await fetchGFSWithFallback(latNum, lonNum, daysNum)
          gfsResult = { status: 'fulfilled', value: val }
        } catch (err) {
          gfsResult = { status: 'rejected', reason: err }
        }

        // Allow memory to become collectible and yield to event loop before starting ECMWF
        await new Promise(resolve => setImmediate(resolve))
        if (global.gc) global.gc()

        let ecmwfResult
        try {
          const val = await fetchECMWFWithFallback(latNum, lonNum, daysNum)
          ecmwfResult = { status: 'fulfilled', value: val }
        } catch (err) {
          ecmwfResult = { status: 'rejected', reason: err }
        }

        const nextModels = {
          ...loadingModels,
          gfs:
            gfsResult.status === 'fulfilled'
              ? gfsResult.value
              : {
                  error: gfsResult.reason?.message || 'GFS unavailable',
                  source: 'GFS',
                  sourceType: 'provider_unavailable',
                  isFallback: true
                },
          ecmwf:
            ecmwfResult.status === 'fulfilled'
              ? ecmwfResult.value
              : {
                  error: ecmwfResult.reason?.message || 'ECMWF unavailable',
                  source: 'ECMWF',
                  sourceType: 'provider_unavailable',
                  isFallback: true
                }
        }

        // Save GFS and ECMWF runs to Redis if valid
        if (gfsResult.status === 'fulfilled' && !gfsResult.value.isFallback) {
          weatherCacheService
            .saveForecastRun(
              latNum,
              lonNum,
              'gfs',
              gfsResult.value,
              gfsResult.value.retrievedAt
            )
            .catch(() => {})
        }
        if (
          ecmwfResult.status === 'fulfilled' &&
          !ecmwfResult.value.isFallback
        ) {
          weatherCacheService
            .saveForecastRun(
              latNum,
              lonNum,
              'ecmwf',
              ecmwfResult.value,
              ecmwfResult.value.retrievedAt
            )
            .catch(() => {})
        }

        const currentEntry = getForecastCacheEntry(cacheKey)
        if (!currentEntry) {
          if (!openMeteo.isFallback) {
            const updated = {
              ...result,
              models: { ...result.models, ...nextModels }
            }
            setForecastCache(cacheKey, updated)
            weatherCacheService
              .setForecast(latNum, lonNum, daysNum, updated)
              .catch(() => {})
          }
          return
        }

        updateForecastCacheWithBackgroundModel(cacheKey, 'gfs', nextModels.gfs)
        const updatedResult = updateForecastCacheWithBackgroundModel(
          cacheKey,
          'ecmwf',
          nextModels.ecmwf
        )
        if (updatedResult) {
          weatherCacheService
            .setForecast(latNum, lonNum, daysNum, updatedResult)
            .catch(() => {})
        }
      })

      return result
    } catch (error) {
      // Fallback to retained Redis forecast or L1 warm cache
      try {
        const retained = await weatherCacheService.getRetainedForecast(
          latNum,
          lonNum,
          daysNum
        )
        if (retained) {
          return {
            ...retained,
            cache: {
              ...(retained.cache || {}),
              isCached: true,
              cacheStatus: 'stale',
              isStale: true
            }
          }
        }
      } catch {}
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
  const days = Math.max(2, Math.ceil(hours / 24))

  const fullForecast = await getForecast(latNum, lonNum, days)
  let openMeteo =
    fullForecast?.models?.openMeteo || fullForecast?.forecast || fullForecast

  let hourly = openMeteo?.hourly || []
  if (!Array.isArray(hourly) || hourly.length === 0) {
    const offPayload = buildOfflineForecastPayload(latNum, lonNum, {
      days,
      hours: Math.max(hours, 48)
    })
    const normalized = normalizeForecast(offPayload, 'WeatherGPT-Synoptic')
    hourly = normalized.hourly || []
  }

  return {
    location: {
      latitude: latNum,
      longitude: lonNum
    },
    hourly: hourly.slice(0, hours),
    cache: fullForecast?.cache
  }
}

export default {
  getWeather,
  getForecast,
  getHourlyForecast,
  fetchECMWFWithFallback,
  fetchGFSWithFallback,
  enqueueNWP,
  getNWPQueueStats
}
