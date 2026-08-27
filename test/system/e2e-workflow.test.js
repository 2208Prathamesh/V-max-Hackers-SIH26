import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer, stopTestServer } from '../helpers/testServer.js'
import User from '../../backend/src/models/User.js'
import SavedLocation from '../../backend/src/models/SavedLocation.js'
import Conversation from '../../backend/src/models/Conversation.js'
import Message from '../../backend/src/models/Message.js'
import UserPreferences from '../../backend/src/models/UserPreferences.js'

describe('System / E2E: Full Lifecycle User Journey', () => {
  let baseUrl = ''
  let token = ''
  let userId = ''
  let conversationId = ''
  let locationId = ''

  const journeyUser = {
    name: 'E2E Journey Master',
    email: `e2e_${Date.now()}@example.com`,
    password: 'SecurePassword123!'
  }

  before(async () => {
    const res = await startTestServer()
    baseUrl = res.serverUrl
  })

  after(async () => {
    // Cleanup in case test aborted midway
    const user = await User.findOne({ email: journeyUser.email })
    if (user) {
      await User.findByIdAndDelete(user._id)
      await UserPreferences.deleteMany({ userId: user._id })
      await SavedLocation.deleteMany({ userId: user._id })
      await Conversation.deleteMany({ userId: user._id })
    }
    await stopTestServer()
  })

  test('Step 1: User registers on platform', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(journeyUser)
    })
    const payload = await res.json()
    assert.equal(res.status, 201)
    assert.ok(payload.data.token)
    token = payload.data.token
    userId = payload.data.user.id
  })

  test('Step 2: User personalizes weather settings', async () => {
    const res = await fetch(`${baseUrl}/api/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        temperatureUnit: 'C',
        windUnit: 'km/h',
        appearance: 'dark'
      })
    })
    const payload = await res.json()
    assert.equal(res.status, 200)
    assert.equal(payload.data.appearance, 'dark')
  })

  test('Step 3: User saves favorite location', async () => {
    const res = await fetch(`${baseUrl}/api/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Homebase Pune',
        city: 'Pune',
        country: 'India',
        latitude: 18.5204,
        longitude: 73.8567,
        isFavorite: true
      })
    })
    const payload = await res.json()
    assert.equal(res.status, 201)
    locationId = payload.data._id
  })

  test('Step 4: User launches WeatherGPT conversation & asks for rain forecast', async () => {
    // Create conversation
    const convRes = await fetch(`${baseUrl}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Pune Monsoon Query',
        category: 'forecast'
      })
    })
    const convPayload = await convRes.json()
    assert.equal(convRes.status, 201)
    conversationId = convPayload.data._id

    // Send question
    const msgRes = await fetch(`${baseUrl}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        conversationId,
        content: 'Will it rain today in Pune?'
      })
    })
    const msgPayload = await msgRes.json()
    assert.equal(msgRes.status, 201)
    assert.ok(msgPayload.data.aiMessage.content)
    assert.equal(msgPayload.data.aiMessage.messageType, 'weather')
  })

  test('Step 5: User checks public alerts', async () => {
    const res = await fetch(`${baseUrl}/api/alerts`)
    const payload = await res.json()
    assert.equal(res.status, 200)
    assert.ok(Array.isArray(payload.data))
  })

  test('Step 6: User deletes account with full cascading cleanup', async () => {
    const res = await fetch(`${baseUrl}/api/users/me`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert.equal(res.status, 200)

    // Verify cascade
    const [userCount, prefCount, locCount, convCount, msgCount] = await Promise.all([
      User.countDocuments({ _id: userId }),
      UserPreferences.countDocuments({ userId }),
      SavedLocation.countDocuments({ userId }),
      Conversation.countDocuments({ userId }),
      Message.countDocuments({ conversationId })
    ])

    assert.equal(userCount, 0)
    assert.equal(prefCount, 0)
    assert.equal(locCount, 0)
    assert.equal(convCount, 0)
    assert.equal(msgCount, 0)
  })
})
