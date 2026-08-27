import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer, stopTestServer } from '../helpers/testServer.js'
import Alert from '../../backend/src/models/Alert.js'

describe('Integration: Weather Alerts Endpoints', () => {
  let baseUrl = ''
  let alertId = ''

  before(async () => {
    const res = await startTestServer()
    baseUrl = res.serverUrl

    // Insert a test alert
    const alert = await Alert.create({
      title: 'Monsoon Flooding Alert',
      description: 'Localized flash floods reported in low-lying zones.',
      type: 'rain',
      severity: 'high',
      location: 'Pune, Maharashtra',
      latitude: 18.5204,
      longitude: 73.8567,
      startTime: new Date(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      source: 'Test Alert Generator',
      status: 'active'
    })
    alertId = alert._id
  })

  after(async () => {
    if (alertId) {
      await Alert.findByIdAndDelete(alertId)
    }
    await stopTestServer()
  })

  test('GET /api/alerts should be publicly accessible without authentication header', async () => {
    const res = await fetch(`${baseUrl}/api/alerts`)
    const payload = await res.json()

    assert.equal(res.status, 200)
    assert.equal(payload.success, true)
    assert.ok(Array.isArray(payload.data))
  })

  test('GET /api/alerts/active should return active alerts list', async () => {
    const res = await fetch(`${baseUrl}/api/alerts/active`)
    const payload = await res.json()

    assert.equal(res.status, 200)
    assert.equal(payload.success, true)
    assert.ok(Array.isArray(payload.data))
  })

  test('GET /api/alerts/:id should return single alert details', async () => {
    const res = await fetch(`${baseUrl}/api/alerts/${alertId}`)
    const payload = await res.json()

    assert.equal(res.status, 200)
    assert.equal(payload.success, true)
    assert.equal(payload.data.title, 'Monsoon Flooding Alert')
  })
})
