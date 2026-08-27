import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer, stopTestServer } from '../helpers/testServer.js'
import User from '../../backend/src/models/User.js'
import Conversation from '../../backend/src/models/Conversation.js'
import Message from '../../backend/src/models/Message.js'

describe('Integration: WeatherGPT Conversation & Chat Endpoints', () => {
  let baseUrl = ''
  let authToken = ''
  let conversationId = ''
  const chatUser = {
    name: 'Chat Tester',
    email: `chat_user_${Date.now()}@example.com`,
    password: 'Password123!'
  }

  before(async () => {
    const res = await startTestServer()
    baseUrl = res.serverUrl

    // Register user to obtain JWT
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chatUser)
    })
    const regData = await regRes.json()
    authToken = regData.data.token
  })

  after(async () => {
    const user = await User.findOne({ email: chatUser.email })
    if (user) {
      await Conversation.deleteMany({ userId: user._id })
      await User.findByIdAndDelete(user._id)
    }
    await stopTestServer()
  })

  test('POST /api/conversations should create a new conversation session', async () => {
    const res = await fetch(`${baseUrl}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title: 'Pune Weather Forecast Inquiry',
        category: 'forecast'
      })
    })

    const payload = await res.json()
    assert.equal(res.status, 201)
    assert.equal(payload.success, true)
    assert.ok(payload.data._id)
    conversationId = payload.data._id
  })

  test('POST /api/messages should send user query and generate AI weather response', async () => {
    const res = await fetch(`${baseUrl}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        conversationId,
        content: 'What is the temperature in Pune?'
      })
    })

    const payload = await res.json()
    assert.equal(res.status, 201)
    assert.equal(payload.success, true)
    assert.equal(payload.data.userMessage.content, 'What is the temperature in Pune?')
    assert.ok(payload.data.aiMessage.content.length > 10)
    assert.equal(payload.data.aiMessage.sender, 'ai')
  })

  test('GET /api/messages/:conversationId should retrieve conversation messages', async () => {
    const res = await fetch(`${baseUrl}/api/messages/${conversationId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })

    const payload = await res.json()
    assert.equal(res.status, 200)
    assert.equal(payload.success, true)
    assert.ok(payload.data.length >= 2)
  })
})
