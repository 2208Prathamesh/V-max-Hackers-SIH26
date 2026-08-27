import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer, stopTestServer } from '../helpers/testServer.js'
import User from '../../backend/src/models/User.js'
import UserPreferences from '../../backend/src/models/UserPreferences.js'

describe('Integration: User Settings & Preferences Endpoints', () => {
  let baseUrl = ''
  let authToken = ''
  const settingsUser = {
    name: 'Settings Tester',
    email: `settings_user_${Date.now()}@example.com`,
    password: 'Password123!'
  }

  before(async () => {
    const res = await startTestServer()
    baseUrl = res.serverUrl

    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsUser)
    })
    const regData = await regRes.json()
    authToken = regData.data.token
  })

  after(async () => {
    const user = await User.findOne({ email: settingsUser.email })
    if (user) {
      await UserPreferences.deleteMany({ userId: user._id })
      await User.findByIdAndDelete(user._id)
    }
    await stopTestServer()
  })

  test('GET /api/settings should retrieve user settings (or initialize defaults)', async () => {
    const res = await fetch(`${baseUrl}/api/settings`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })

    const payload = await res.json()
    assert.equal(res.status, 200)
    assert.equal(payload.success, true)
    assert.equal(payload.data.temperatureUnit, 'C')
  })

  test('PUT /api/settings should update preferences (e.g. appearance, units)', async () => {
    const res = await fetch(`${baseUrl}/api/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        temperatureUnit: 'F',
        appearance: 'dark'
      })
    })

    const payload = await res.json()
    assert.equal(res.status, 200)
    assert.equal(payload.success, true)
    assert.equal(payload.data.temperatureUnit, 'F')
    assert.equal(payload.data.appearance, 'dark')
  })
})
