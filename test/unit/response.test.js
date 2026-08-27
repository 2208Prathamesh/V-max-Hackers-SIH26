import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { successResponse, errorResponse, createdResponse, noContentResponse } from '../../backend/src/utils/response.js'

describe('Unit: Response Utility Tests', () => {
  // Mock Express response object
  function createMockRes() {
    return {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code
        return this
      },
      json(data) {
        this.body = data
        return this
      },
      send() {
        return this
      }
    }
  }

  test('successResponse should format payload with status 200 by default', () => {
    const res = createMockRes()
    successResponse(res, { city: 'Pune' }, 'Weather data retrieved', 200)

    assert.equal(res.statusCode, 200)
    assert.equal(res.body.success, true)
    assert.equal(res.body.message, 'Weather data retrieved')
    assert.deepEqual(res.body.data, { city: 'Pune' })
  })

  test('successResponse should preserve numeric data without confusing with status code', () => {
    const res = createMockRes()
    successResponse(res, 27.5, 'Current temperature in C', 200)

    assert.equal(res.statusCode, 200)
    assert.equal(res.body.success, true)
    assert.equal(res.body.data, 27.5)
  })

  test('createdResponse should return HTTP status 201', () => {
    const res = createMockRes()
    createdResponse(res, { id: 'loc-123' }, 'Location added')

    assert.equal(res.statusCode, 201)
    assert.equal(res.body.success, true)
    assert.deepEqual(res.body.data, { id: 'loc-123' })
  })

  test('errorResponse should format error details correctly', () => {
    const res = createMockRes()
    errorResponse(res, 'Validation error', 400, ['Email is required'])

    assert.equal(res.statusCode, 400)
    assert.equal(res.body.success, false)
    assert.equal(res.body.message, 'Validation error')
    assert.deepEqual(res.body.errors, ['Email is required'])
  })

  test('noContentResponse should set status 204', () => {
    const res = createMockRes()
    noContentResponse(res)
    assert.equal(res.statusCode, 204)
  })
})
