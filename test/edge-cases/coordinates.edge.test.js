import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer, stopTestServer } from '../helpers/testServer.js'

describe('Edge Cases: Geographical Boundary & Extreme Coordinates', () => {
  let baseUrl = ''

  before(async () => {
    const res = await startTestServer()
    baseUrl = res.serverUrl
  })

  after(async () => {
    await stopTestServer()
  })

  test('Should handle Equator coordinates (0, 0)', async () => {
    const res = await fetch(`${baseUrl}/api/weather/current?latitude=0&longitude=0`)
    const payload = await res.json()

    assert.equal(res.status, 200)
    assert.equal(payload.success, true)
    assert.equal(payload.data.location.latitude, 0)
    assert.equal(payload.data.location.longitude, 0)
  })

  test('Should handle Arctic polar coordinates (80.0°N, 0.0°E)', async () => {
    const res = await fetch(`${baseUrl}/api/weather/current?latitude=80.0&longitude=0.0`)
    const payload = await res.json()

    assert.equal(res.status, 200)
    assert.equal(payload.success, true)
    assert.ok(payload.data.forecast.current.temperature !== undefined)
  })

  test('Should handle International Date Line vicinity (-179.5°W)', async () => {
    const res = await fetch(`${baseUrl}/api/weather/current?latitude=21.3&longitude=-179.5`)
    const payload = await res.json()

    assert.equal(res.status, 200)
    assert.equal(payload.success, true)
  })

  test('Should reject invalid latitude out of bounds (> 90)', async () => {
    const res = await fetch(`${baseUrl}/api/weather/forecast?latitude=120.5&longitude=73.85`)
    // Open-Meteo or validator returns error
    assert.ok(res.status >= 400)
  })

  test('Should reject non-numeric/NaN coordinates', async () => {
    const res = await fetch(`${baseUrl}/api/weather/current?latitude=abc&longitude=xyz`)
    assert.equal(res.status, 400)
  })
})
