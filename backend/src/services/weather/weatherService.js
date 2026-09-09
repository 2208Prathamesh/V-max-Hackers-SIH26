import { getForecast as getOpenMeteoForecast } from './openMeteo/client.js'
import { getECMWFForecast } from './openMeteo/ecmwf.js'
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
const MAX_CACHE_ENTRIES = 300 // Max entries cache

// Sequential queue for background NWP tasks to prevent parallel GRIB2 allocations from exhausting memory
let nwpQueue = Promise.resolve()
function enqueueNWP (task) {
  const run = () => task().catch(err => console.warn('Background NWP error:', err.message))
  nwpQueue = nwpQueue.then(run, run)
  return nwpQueue
}

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
  try {
    const raw = await getECMWFForecast(latitude, longitude, days)
    return {
      ...normalizeForecast(raw, 'ECMWF-IFS'),
      source: 'ECMWF-IFS',
      sourceType: 'live_api',
      isFallback: false
    }
  } catch (err) {
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
    const raw = await getOpenMeteoGFS(latitude, longitude, days)
    return {
      ...normalizeForecast(raw, 'NOAA-GFS'),
      source: 'NOAA-GFS',
      sourceType: 'live_api',
      isFallback: false
    }
  } catch (err) {
    return {
      error: `NOAA GFS unavailable: ${err.message}`,
      source: 'NOAA-GFS',
      sourceType: 'provider_unavailable',
      isFallback: true
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
export async function getWeather (latitude, longitude, options = {}) {
  const coordinates = parseAndValidateCoordinates(latitude, longitude)
  const latNum = coordinates.latitude
  const lonNum = coordinates.longitude
  // ECMWF/NOAA-GFS are only awaited when the caller needs NWP data (chat, advisory,
  // or the full service path). GET /api/weather/current opts out so the response
  // never blocks on NWP GRIB work; the models are returned as deferred placeholders.
  const includeNWP = options.includeNWP !== false
  const cacheKey = `${includeNWP ? 'weather' : 'fast_weather'}_${latNum.toFixed(4)}_${lonNum.toFixed(4)}`

  const cached = getCached(cacheKey)
  if (cached) return cached

  if (inflightRequests.has(cacheKey)) {
    return await inflightRequests.get(cacheKey)
  }

  const fetchPromise = (async () => {
    try {
      const ecmwfPromise = includeNWP
        ? fetchECMWFWithFallback(latNum, lonNum, 1)
        : Promise.resolve(
            buildBackgroundModelState(
              'ECMWF',
              'NWP models are not fetched for the current-weather response; available via /api/weather/forecast and /api/weather/compare'
            )
          )
      const gfsPromise = includeNWP
        ? fetchGFSWithFallback(latNum, lonNum, 1)
        : Promise.resolve(
            buildBackgroundModelState(
              'NOAA-GFS',
              'NWP models are not fetched for the current-weather response; available via /api/weather/forecast and /api/weather/compare'
            )
          )

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
        ecmwfPromise,
        gfsPromise,
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
            ecmwf: ecmwfData,
          })
        : null;

      const synthesis = includeNWP
        ? buildWeatherSynthesis({
            observation: imdObservation,
            gfs: gfsRaw,
            ecmwf: ecmwfData,
            modelComparison,
          })
        : null;

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
function buildBackgroundModelState (providerName, reason) {
  return {
    error: reason,
    source: providerName,
    sourceType: 'provider_loading',
    isFallback: true
  }
}

function updateForecastCacheWithBackgroundModel (cacheKey, providerName, modelData) {
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
      const openMeteoRaw = await getOpenMeteoForecast(latNum, lonNum, daysNum).catch(
        () => null
      )
      const openMeteo = openMeteoRaw
        ? normalizeForecast(openMeteoRaw, 'Open-Meteo')
        : {
            error: 'Open-Meteo unavailable',
            source: 'Open-Meteo',
            sourceType: 'provider_unavailable',
            isFallback: true
          }

      const warmCache = getForecastCacheEntry(cacheKey)
      if (
        openMeteo?.isFallback &&
        warmCache &&
        !warmCache.data.models.openMeteo?.isFallback
      ) {
        return withCacheMetadata(warmCache.data, warmCache, true)
      }

      if (!isValidNormalizedForecast(openMeteo) && warmCache) {
        return withCacheMetadata(warmCache.data, warmCache, true)
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

      const result = {
        location: {
          latitude: latNum,
          longitude: lonNum
        },
        models: {
          openMeteo,
          ...loadingModels
        }
      }

      // Background refresh: serialize NWP requests so multiple parallel requests never exhaust memory
      enqueueNWP(async () => {
        const [gfsResult, ecmwfResult] = await Promise.allSettled([
          fetchGFSWithFallback(latNum, lonNum, daysNum),
          fetchECMWFWithFallback(latNum, lonNum, daysNum)
        ])

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

        const currentEntry = getForecastCacheEntry(cacheKey)
        if (!currentEntry) {
          if (!openMeteo.isFallback) {
            setForecastCache(cacheKey, { ...result, models: { ...result.models, ...nextModels } })
          }
          return
        }

        updateForecastCacheWithBackgroundModel(cacheKey, 'gfs', nextModels.gfs)
        updateForecastCacheWithBackgroundModel(cacheKey, 'ecmwf', nextModels.ecmwf)
      })

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
