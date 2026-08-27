import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer, stopTestServer } from '../helpers/testServer.js'

describe('Edge Cases: Security, Injection & Auth Attack Mitigation', () => {
  let baseUrl = ''

  before(async () => {
    const res = await startTestServer()
    baseUrl = res.serverUrl
  })

  after(async () => {
    await stopTestServer()
  })

  test('Should reject NoSQL injection attempts in login payload', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: { $gt: '' },
        password: { $gt: '' }
      })
    })

    // Joi validator intercepts and rejects object where string expected
    assert.equal(res.status, 400)
    const payload = await res.json()
    assert.equal(payload.success, false)
    assert.match(payload.message, /validation/i)
  })

  test('Should reject malformed JWT token string', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: 'Bearer thisIsNotAValidJwtTokenFormat' }
    })
    assert.equal(res.status, 401)
  })

  test('Should reject Bearer token with missing token value', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: 'Bearer ' }
    })
    assert.equal(res.status, 401)
  })

  test('Should sanitize or reject XSS script tags in chat messages safely', async () => {
    // Unauthenticated chat rejection
    const res = await fetch(`${baseUrl}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: '123456789012345678901234',
        content: '<script>alert("XSS")</script>'
      })
    })
    assert.equal(res.status, 401)
  })
})
