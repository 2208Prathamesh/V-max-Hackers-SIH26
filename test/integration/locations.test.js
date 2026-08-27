import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer, stopTestServer } from '../helpers/testServer.js'
import User from '../../backend/src/models/User.js'
import SavedLocation from '../../backend/src/models/SavedLocation.js'

describe('Integration: Saved Locations CRUD & Weather Enrichment', () => {
  let baseUrl = ''
  let authToken = ''
  let locationId = ''
  const locUser = {
    name: 'Location Tester',
    email: `loc_user_${Date.now()}@example.com`,
    password: 'Password123!'
  }

  before(async () => {
    const res = await startTestServer()
    baseUrl = res.serverUrl

    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(locUser)
    })
    const regData = await regRes.json()
    authToken = regData.data.token
  })

  after(async () => {
    const user = await User.findOne({ email: locUser.email })
    if (user) {
      await SavedLocation.deleteMany({ userId: user._id })
      await User.findByIdAndDelete(user._id)
    }
    await stopTestServer()
  })

  test('POST /api/locations should save a new geographic location', async () => {
    const res = await fetch(`${baseUrl}/api/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'Pune Tech Hub',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        latitude: 18.5204,
        longitude: 73.8567,
        isFavorite: true
      })
    })

    const payload = await res.json()
    assert.equal(res.status, 201)
    assert.equal(payload.success, true)
    assert.equal(payload.data.city, 'Pune')
    locationId = payload.data._id
  })

  test('GET /api/locations should return saved locations enriched with live weather', async () => {
    const res = await fetch(`${baseUrl}/api/locations`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })

    const payload = await res.json()
    assert.equal(res.status, 200)
    assert.equal(payload.success, true)
    assert.ok(payload.data.length >= 1)
    assert.ok(payload.data[0].tempC !== undefined)
    assert.ok(payload.data[0].forecast3Day !== undefined)
  })

  test('PATCH /api/locations/:id/favorite should toggle favorite status', async () => {
    const res = await fetch(`${baseUrl}/api/locations/${locationId}/favorite`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authToken}` }
    })

    const payload = await res.json()
    assert.equal(res.status, 200)
    assert.equal(payload.success, true)
    assert.equal(payload.data.isFavorite, true)
  })

  test('DELETE /api/locations/:id should delete location', async () => {
    const res = await fetch(`${baseUrl}/api/locations/${locationId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` }
    })

    const payload = await res.json()
    assert.equal(res.status, 200)
    assert.equal(payload.success, true)
  })
})
