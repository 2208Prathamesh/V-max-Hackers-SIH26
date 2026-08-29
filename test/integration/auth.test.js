import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer, stopTestServer } from '../helpers/testServer.js'
import User from '../../backend/src/models/User.js'

describe('Integration: Authentication Endpoints', () => {
  let baseUrl = ''
  const testUser = {
    name: 'Integration Test User',
    email: `test_${Date.now()}@example.com`,
    password: 'Password123!'
  }
  let authToken = ''

  before(async () => {
    const res = await startTestServer()
    baseUrl = res.serverUrl
  })

  after(async () => {
    await User.deleteMany({ email: testUser.email })
    await stopTestServer()
  })

  test('POST /api/auth/register should create a new user and return JWT token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    })

    const payload = await res.json()
    assert.equal(res.status, 201)
    assert.equal(payload.success, true)
    assert.ok(payload.data.token)
    assert.equal(payload.data.user.email, testUser.email.toLowerCase())
    authToken = payload.data.token
  })

  test('POST /api/auth/login should authenticate user with correct credentials', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    })

    const payload = await res.json()
    assert.equal(res.status, 200)
    assert.equal(payload.success, true)
    assert.ok(payload.data.token)
  })

  test('GET /api/auth/me should return authenticated user profile with valid Bearer token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })

    const payload = await res.json()
    assert.equal(res.status, 200)
    assert.equal(payload.success, true)
    assert.equal(payload.data.email, testUser.email.toLowerCase())
  })

  test('GET /api/auth/me should reject request without token (401)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`)
    assert.equal(res.status, 401)
  })
})
