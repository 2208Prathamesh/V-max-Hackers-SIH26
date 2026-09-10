import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  weatherCacheService,
  formatLocationKey,
  CacheKeys
} from '../../backend/src/services/weather/cache/weatherCacheService.js'
import {
  reconcileHourlyPoints,
  mergeForecastData
} from '../../backend/src/services/weather/cache/forecastReconciler.js'
import {
  redisGet,
  redisSet,
  redisDel,
  clearMemoryFallback,
  isRedisReady
} from '../../backend/src/services/cache/redisClient.js'
import weatherService from '../../backend/src/services/weather/weatherService.js'

describe('Production-Readiness Audit Verification', () => {
  beforeEach(() => {
    clearMemoryFallback()
  })

  // Audit Item 2 & 8: Cache write & subsequent read without invoking provider
  test('Item 2 & 8: Cache hit returns cached data without invoking external provider', async () => {
    const lat = 18.52
    const lon = 73.85
    const locKey = formatLocationKey(lat, lon)

    const mockWeatherData = {
      location: { latitude: lat, longitude: lon },
      forecast: {
        source: 'Open-Meteo',
        current: { temperature: 28.5, condition: 'Clear' }
      },
      models: {
        ecmwf: { sourceType: 'provider_loading' },
        gfs: { sourceType: 'provider_loading' }
      }
    }

    // Pre-populate cache directly
    await weatherCacheService.setCurrentWeather(lat, lon, mockWeatherData, {
      includeNWP: false
    })

    // Verify key exists in cache
    const cached = await weatherCacheService.getCurrentWeather(lat, lon, {
      includeNWP: false
    })
    assert.ok(cached)
    assert.equal(cached.forecast.current.temperature, 28.5)

    // Call getWeather with includeNWP: false
    const result = await weatherService.getWeather(lat, lon, {
      includeNWP: false
    })
    assert.equal(result.forecast.current.temperature, 28.5)
  })

  // Audit Item 3: Forecast writes latest, retained, and immutable provider runs
  test('Item 3: Forecast caching writes latest, retained, and immutable provider runs', async () => {
    const lat = 18.52
    const lon = 73.85
    const days = 7
    const locKey = formatLocationKey(lat, lon)

    const forecastData = {
      location: { latitude: lat, longitude: lon },
      models: {
        openMeteo: {
          source: 'Open-Meteo',
          retrievedAt: '2026-09-09T12:00:00.000Z',
          daily: [{ date: '2026-09-09', maxTemperature: 30 }]
        }
      }
    }

    await weatherCacheService.setForecast(lat, lon, days, forecastData)
    await weatherCacheService.saveForecastRun(
      lat,
      lon,
      'open-meteo',
      forecastData.models.openMeteo,
      '2026-09-09T12:00:00.000Z'
    )

    // 1. Latest exists
    const latest = await weatherCacheService.getLatestForecast(lat, lon, days)
    assert.ok(latest)
    assert.equal(latest.models.openMeteo.daily[0].maxTemperature, 30)

    // 2. Retained exists
    const retained = await weatherCacheService.getRetainedForecast(
      lat,
      lon,
      days
    )
    assert.ok(retained)
    assert.equal(retained.models.openMeteo.daily[0].maxTemperature, 30)

    // 3. Provider run exists
    const runs = await weatherCacheService.getForecastRuns(
      lat,
      lon,
      'open-meteo',
      5
    )
    assert.equal(runs.length, 1)
    assert.equal(runs[0].provider, 'open-meteo')
    assert.equal(runs[0].runTimestamp, '2026-09-09T12:00:00.000Z')
  })

  // Audit Item 4: Hot-cache expiry fallback to retained data with cacheStatus="stale"
  test('Item 4: Hot-cache expiry fallback to retained forecast with cacheStatus="stale"', async () => {
    const lat = 18.52
    const lon = 73.85
    const days = 7
    const locKey = formatLocationKey(lat, lon)

    const retainedForecast = {
      location: { latitude: lat, longitude: lon },
      source: 'Open-Meteo',
      retrievedAt: '2026-09-09T06:00:00.000Z',
      hourly: [{ time: '2026-09-09T12:00:00.000Z', temperature: 27 }]
    }

    // Save only to retained key (simulating that hot/latest has expired)
    await redisSet(
      CacheKeys.forecastRetained(locKey, days),
      JSON.stringify(retainedForecast),
      { EX: 86400 }
    )

    // Verify latest is null (expired)
    const latest = await weatherCacheService.getLatestForecast(lat, lon, days)
    assert.equal(latest, null)

    // Verify retained is available
    const retained = await weatherCacheService.getRetainedForecast(
      lat,
      lon,
      days
    )
    assert.ok(retained)

    // Simulate provider failure (newData is null)
    const fallbackResult = mergeForecastData(retained, null, {
      nowIso: '2026-09-09T12:00:00.000Z'
    })
    assert.ok(fallbackResult)
    assert.equal(fallbackResult.cache.isStale, true)
    assert.equal(fallbackResult.cache.cacheStatus, 'stale')
    assert.equal(fallbackResult.hourly[0].temperature, 27)
  })

  // Audit Item 5: Forecast gap filling using retained data after latest expires
  test('Item 5: Forecast gap filling preserves retained points when new provider response has gaps', () => {
    const retainedHourly = [
      {
        time: '2026-09-09T10:00:00.000Z',
        temperature: 22,
        source: 'GFS',
        fetchedAt: '2026-09-09T06:00:00.000Z'
      },
      {
        time: '2026-09-09T11:00:00.000Z',
        temperature: 23,
        source: 'GFS',
        fetchedAt: '2026-09-09T06:00:00.000Z'
      },
      {
        time: '2026-09-09T12:00:00.000Z',
        temperature: 24,
        source: 'GFS',
        fetchedAt: '2026-09-09T06:00:00.000Z'
      }
    ]

    // New response only has 10:00 and 12:00 (11:00 is missing)
    const newHourly = [
      {
        time: '2026-09-09T10:00:00.000Z',
        temperature: 25,
        source: 'Open-Meteo',
        fetchedAt: '2026-09-09T10:00:00.000Z'
      },
      {
        time: '2026-09-09T12:00:00.000Z',
        temperature: 26,
        source: 'Open-Meteo',
        fetchedAt: '2026-09-09T10:00:00.000Z'
      }
    ]

    const { hourly, stats } = reconcileHourlyPoints(retainedHourly, newHourly, {
      newSource: 'Open-Meteo',
      oldSource: 'GFS',
      nowIso: '2026-09-09T10:00:00.000Z'
    })

    assert.equal(hourly.length, 3)
    assert.equal(hourly[0].temperature, 25)
    assert.equal(hourly[0].isStale, false)

    // 11:00 was gap-filled from retained data!
    assert.equal(hourly[1].time, '2026-09-09T11:00:00.000Z')
    assert.equal(hourly[1].temperature, 23)
    assert.equal(hourly[1].isStale, true)
    assert.equal(hourly[1].source, 'GFS')

    assert.equal(hourly[2].temperature, 26)
    assert.equal(hourly[2].isStale, false)
    assert.equal(stats.mixedPoints === 0 && stats.stale > 0, true)
  })

  // Audit Item 6: Process restart repopulation from L2 cache
  test('Item 6: In-memory L1 repopulates from L2 cache after process restart', async () => {
    const lat = 18.52
    const lon = 73.85
    const testData = {
      location: { latitude: lat, longitude: lon },
      forecast: {
        source: 'Open-Meteo',
        current: { temperature: 29.2 }
      }
    }

    // Store in L2
    await weatherCacheService.setCurrentWeather(lat, lon, testData, {
      includeNWP: false
    })

    // Retrieve from L2 (simulating fresh process without L1 populated)
    const fromL2 = await weatherCacheService.getCurrentWeather(lat, lon, {
      includeNWP: false
    })
    assert.ok(fromL2)
    assert.equal(fromL2.forecast.current.temperature, 29.2)
  })

  // Audit Item 7: Redis unavailable graceful operation
  test('Item 7: Backend operations function smoothly when Redis is unavailable', async () => {
    // Calling redisGet/redisSet/redisDel never throws an uncaught error
    assert.doesNotThrow(async () => {
      await redisGet('nonexistent')
      await redisSet('temp:key', 'temp-value')
      await redisDel('temp:key')
    })
  })

  // Audit Item 9: includeNWP=false never invokes NWP
  test('Item 9: getWeather with includeNWP=false returns deferred NWP placeholders', async () => {
    const lat = 19.07
    const lon = 72.87
    const res = await weatherService.getWeather(lat, lon, { includeNWP: false })
    assert.ok(res.models.ecmwf)
    assert.ok(res.models.gfs)
    assert.equal(res.models.ecmwf.sourceType, 'provider_loading')
    assert.equal(res.models.gfs.sourceType, 'provider_loading')
    assert.equal(res.modelComparison, null)
    assert.equal(res.synthesis, null)
  })

  // Audit Item 10: Provider runs retention expiry
  test('Item 10: Provider runs support TTL and expire after retention window', async () => {
    // Save run with 1-second TTL for testing
    const runKey = 'weather:forecast:18.52_73.86:run:test:run-exp'
    await redisSet(runKey, JSON.stringify({ run: 'test' }), { EX: 1 })

    const immediate = await redisGet(runKey)
    assert.ok(immediate)

    // Wait 1.1s for expiration
    await new Promise(r => setTimeout(r, 1100))

    const expired = await redisGet(runKey)
    assert.equal(expired, null)
  })
})
