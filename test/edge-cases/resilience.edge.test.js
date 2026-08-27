import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer, stopTestServer } from '../helpers/testServer.js'

describe('Edge Cases: Resilience, Empty Payloads & Boundary Conditions', () => {
  let baseUrl = ''

  before(async () => {
    const res = await startTestServer()
    baseUrl = res.serverUrl
  })

  after(async () => {
    await stopTestServer()
  })

  test('Should handle completely empty POST body gracefully', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    assert.equal(res.status, 400)
    const payload = await res.json()
    assert.equal(payload.success, false)
  })

  test('Should reject registration with empty strings or spaces only', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '   ',
        email: '   ',
        password: '   '
      })
    })
    assert.equal(res.status, 400)
  })

  test('GET /api/weather/current without any parameters should return 400', async () => {
    const res = await fetch(`${baseUrl}/api/weather/current`)
    assert.equal(res.status, 400)
    const payload = await res.json()
    assert.equal(payload.success, false)
  })

  test('GET /api/health should respond reliably with 200', async () => {
    const res = await fetch(`${baseUrl}/api/health`)
    assert.equal(res.status, 200)
    const payload = await res.json()
    assert.equal(payload.success, true)
  })
})
