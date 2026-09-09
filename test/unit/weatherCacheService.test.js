import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  formatLocationKey,
  CacheKeys,
  weatherCacheService
} from '../../backend/src/services/weather/cache/weatherCacheService.js'
import { clearMemoryFallback } from '../../backend/src/services/cache/redisClient.js'

describe('Unit: Weather Cache Service Tests', () => {
  beforeEach(() => {
    clearMemoryFallback()
  })

  test('formatLocationKey normalizes coordinates with configurable precision', () => {
    // Default precision 2
    assert.equal(formatLocationKey(18.52043, 73.85674, 2), '18.52_73.86')
    // Precision 3
    assert.equal(formatLocationKey(18.52043, 73.85674, 3), '18.520_73.857')
    // Negative coordinates
    assert.equal(formatLocationKey(-33.8688, 151.2093, 2), '-33.87_151.21')
  })

  test('CacheKeys generates deterministic three-tier keys', () => {
    const locKey = '18.52_73.86'
    assert.equal(
      CacheKeys.currentLatest(locKey, false),
      'weather:current:18.52_73.86:fast'
    )
    assert.equal(
      CacheKeys.currentLatest(locKey, true),
      'weather:current:18.52_73.86:full'
    )
    assert.equal(
      CacheKeys.currentRetained(locKey),
      'weather:current:18.52_73.86:retained'
    )
    assert.equal(
      CacheKeys.forecastLatest(locKey, 7),
      'weather:forecast:18.52_73.86:7:latest'
    )
    assert.equal(
      CacheKeys.forecastRetained(locKey, 7),
      'weather:forecast:18.52_73.86:7:retained'
    )
    assert.equal(
      CacheKeys.forecastRun(locKey, 'GFS', '2026-09-09T00-00-00Z'),
      'weather:forecast:18.52_73.86:run:gfs:2026-09-09T00-00-00Z'
    )
    assert.equal(CacheKeys.alerts(locKey), 'weather:alerts:18.52_73.86')
  })

  test('sets and gets current weather for both fast and full modes', async () => {
    const dataFast = { temperature: 28, mode: 'fast' }
    const dataFull = { temperature: 28, mode: 'full', nwp: true }

    await weatherCacheService.setCurrentWeather(18.52, 73.85, dataFast, {
      includeNWP: false
    })
    await weatherCacheService.setCurrentWeather(18.52, 73.85, dataFull, {
      includeNWP: true
    })

    const fetchedFast = await weatherCacheService.getCurrentWeather(
      18.52,
      73.85,
      { includeNWP: false }
    )
    const fetchedFull = await weatherCacheService.getCurrentWeather(
      18.52,
      73.85,
      { includeNWP: true }
    )

    assert.equal(fetchedFast.mode, 'fast')
    assert.equal(fetchedFull.mode, 'full')

    // Retained copy is also available
    const retained = await weatherCacheService.getRetainedCurrentWeather(
      18.52,
      73.85
    )
    assert.ok(retained)
  })

  test('stores latest and retained forecast copies', async () => {
    const forecast = {
      models: {
        openMeteo: { source: 'Open-Meteo', hourly: [] }
      }
    }

    await weatherCacheService.setForecast(18.52, 73.85, 5, forecast)

    const latest = await weatherCacheService.getLatestForecast(18.52, 73.85, 5)
    const retained = await weatherCacheService.getRetainedForecast(
      18.52,
      73.85,
      5
    )

    assert.deepEqual(latest, forecast)
    assert.deepEqual(retained, forecast)
  })

  test('saves and retrieves historical provider runs without overwriting older runs', async () => {
    const run1 = {
      run: 1,
      retrievedAt: '2026-09-09T00:00:00.000Z',
      temperature: 24
    }
    const run2 = {
      run: 2,
      retrievedAt: '2026-09-09T06:00:00.000Z',
      temperature: 25
    }

    await weatherCacheService.saveForecastRun(
      18.52,
      73.85,
      'gfs',
      run1,
      run1.retrievedAt
    )
    await weatherCacheService.saveForecastRun(
      18.52,
      73.85,
      'gfs',
      run2,
      run2.retrievedAt
    )

    const runs = await weatherCacheService.getForecastRuns(
      18.52,
      73.85,
      'gfs',
      5
    )
    assert.equal(runs.length, 2)

    // Verify older run wasn't deleted or overwritten
    const timestamps = runs.map(r => r.runTimestamp)
    assert.ok(timestamps.includes('2026-09-09T00:00:00.000Z'))
    assert.ok(timestamps.includes('2026-09-09T06:00:00.000Z'))
  })

  test('caches and retrieves location alerts', async () => {
    const alerts = [{ id: 'alert-1', headline: 'Heavy Rain Warning' }]
    await weatherCacheService.setAlerts(18.52, 73.85, alerts)

    const fetched = await weatherCacheService.getAlerts(18.52, 73.85)
    assert.equal(fetched.length, 1)
    assert.equal(fetched[0].headline, 'Heavy Rain Warning')
  })

  test('invalidates location keys completely', async () => {
    await weatherCacheService.setCurrentWeather(18.52, 73.85, { temp: 28 })
    await weatherCacheService.setForecast(18.52, 73.85, 7, { forecast: true })

    await weatherCacheService.invalidateLocation(18.52, 73.85)

    const current = await weatherCacheService.getCurrentWeather(18.52, 73.85)
    const forecast = await weatherCacheService.getLatestForecast(
      18.52,
      73.85,
      7
    )

    assert.equal(current, null)
    assert.equal(forecast, null)
  })
})
