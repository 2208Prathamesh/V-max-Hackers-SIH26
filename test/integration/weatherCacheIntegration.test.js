import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer, stopTestServer } from '../helpers/testServer.js'
import { weatherCacheService } from '../../backend/src/services/weather/cache/weatherCacheService.js'
import { getCachedWeatherContext } from '../../backend/src/services/weather/cachedWeatherContext.js'

describe('Integration: Redis Weather Caching & Reconciliation Pipeline', () => {
  let baseUrl = ''

  before(async () => {
    const res = await startTestServer()
    baseUrl = res.serverUrl
  })

  after(async () => {
    await stopTestServer()
  })

  test('GET /api/weather/current populates cache and avoids NWP invocation', async () => {
    // 1. Initial request (populates cache)
    const res1 = await fetch(`${baseUrl}/api/weather/current?city=Pune`)
    const payload1 = await res1.json()

    assert.equal(res1.status, 200)
    assert.equal(payload1.success, true)
    assert.ok(payload1.data.forecast.current)
    // Crucial check: models ecmwf and gfs are deferred/not synchronous NWP
    assert.ok(
      payload1.data.models.ecmwf.error ||
        payload1.data.models.ecmwf.sourceType === 'provider_loading'
    )

    // 2. Cache should now have hot copy in Redis / fallback
    const lat = payload1.data.location.latitude
    const lon = payload1.data.location.longitude
    const cached = await weatherCacheService.getCurrentWeather(lat, lon, {
      includeNWP: false
    })
    assert.ok(cached)
    assert.equal(cached.location.latitude, lat)

    // 3. Second request should hit cache successfully
    const res2 = await fetch(`${baseUrl}/api/weather/current?city=Pune`)
    const payload2 = await res2.json()
    assert.equal(res2.status, 200)
    assert.equal(payload2.success, true)
    assert.equal(payload2.data.location.latitude, lat)
  })

  test('GET /api/weather/forecast populates latest cache and saves immutable provider runs', async () => {
    const res = await fetch(
      `${baseUrl}/api/weather/forecast?latitude=18.52&longitude=73.85&days=5`
    )
    const payload = await res.json()

    assert.equal(res.status, 200)
    assert.equal(payload.success, true)
    assert.ok(payload.data.models.openMeteo)
    assert.ok(payload.data.models.openMeteo.daily.length >= 5)

    // Verify latest forecast in cache
    const cached = await weatherCacheService.getLatestForecast(18.52, 73.85, 5)
    assert.ok(cached)

    // Verify historical run was saved
    const runs = await weatherCacheService.getForecastRuns(
      18.52,
      73.85,
      'open-meteo',
      5
    )
    assert.ok(runs.length >= 1)
    assert.equal(runs[0].provider, 'open-meteo')
  })

  test('getCachedWeatherContext retrieves clean unified context for Chat without Redis leaks', async () => {
    const context = await getCachedWeatherContext(
      { latitude: 18.52, longitude: 73.85 },
      { days: 5 }
    )

    assert.ok(context)
    assert.equal(context.location.latitude, 18.52)
    assert.equal(context.location.longitude, 73.85)
    assert.ok(context.current)
    assert.ok(context.forecast)
    assert.ok(Array.isArray(context.sources))
    assert.ok(typeof context.isStale === 'boolean')
    assert.equal(context.hasUsableData, true)
  })
})
