import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer, stopTestServer } from '../helpers/testServer.js'

describe('Integration: Live Weather & Geocoding Endpoints', () => {
  let baseUrl = ''

  before(async () => {
    const res = await startTestServer()
    baseUrl = res.serverUrl
  })

  after(async () => {
    await stopTestServer()
  })

  test('GET /api/weather/current?city=Pune should dynamically resolve city and return live weather', async () => {
    const res = await fetch(`${baseUrl}/api/weather/current?city=Pune`)
    const payload = await res.json()

    assert.equal(res.status, 200)
    assert.equal(payload.success, true)
    assert.ok(payload.data.forecast.current.temperature !== undefined)
    assert.ok(payload.data.location.latitude)
  })

  test('GET /api/weather/forecast?latitude=18.52&longitude=73.85&days=5 should return 5-day multi-model forecast', async () => {
    const res = await fetch(`${baseUrl}/api/weather/forecast?latitude=18.52&longitude=73.85&days=5`)
    const payload = await res.json()

    assert.equal(res.status, 200)
    assert.equal(payload.success, true)
    assert.ok(payload.data.models.openMeteo)
    assert.ok(payload.data.models.openMeteo.daily.length >= 5)
  })

  test('GET /api/weather/hourly?city=Mumbai&hours=12 should return 12-hour forecast', async () => {
    const res = await fetch(`${baseUrl}/api/weather/hourly?city=Mumbai&hours=12`)
    const payload = await res.json()

    assert.equal(res.status, 200)
    assert.equal(payload.success, true)
    assert.equal(payload.data.hourly.length, 12)
  })

  test('GET /api/weather/current with unknown city should return 404 location not found', async () => {
    const res = await fetch(`${baseUrl}/api/weather/current?city=NonExistentCityXYZ999`)
    const payload = await res.json()

    assert.equal(res.status, 404)
    assert.equal(payload.success, false)
  })
})
