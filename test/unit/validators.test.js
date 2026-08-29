import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { registerSchema, loginSchema } from '../../backend/src/validators/authValidator.js'
import { locationSchema } from '../../backend/src/validators/locationValidator.js'
import { sendMessageSchema } from '../../backend/src/validators/chatValidator.js'

describe('Unit: Joi Validation Schemas Tests', () => {
  describe('Auth Validation', () => {
    test('registerSchema should pass valid registration payload', () => {
      const { error } = registerSchema.validate({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      })
      assert.equal(error, undefined)
    })

    test('registerSchema should reject short password (< 8 chars)', () => {
      const { error } = registerSchema.validate({
        name: 'John Doe',
        email: 'john@example.com',
        password: '123'
      })
      assert.ok(error)
      assert.match(error.message, /8 characters/i)
    })

    test('loginSchema should reject invalid email format', () => {
      const { error } = loginSchema.validate({
        email: 'not-an-email',
        password: 'password123'
      })
      assert.ok(error)
    })
  })

  describe('Location Validation', () => {
    test('locationSchema should pass valid location coordinates', () => {
      const { error } = locationSchema.validate({
        name: 'Pune Home',
        city: 'Pune',
        country: 'India',
        latitude: 18.5204,
        longitude: 73.8567,
        isFavorite: true
      })
      assert.equal(error, undefined)
    })

    test('locationSchema should reject out-of-bounds latitude (> 90)', () => {
      const { error } = locationSchema.validate({
        name: 'North Pole Beyond',
        city: 'Arctic',
        country: 'Earth',
        latitude: 105.0,
        longitude: 50.0
      })
      assert.ok(error)
      assert.match(error.message, /Latitude/i)
    })
  })

  describe('Chat Validation', () => {
    test('sendMessageSchema should pass valid message', () => {
      const { error } = sendMessageSchema.validate({
        conversationId: 'conv_123',
        content: 'Is it going to rain today in Pune?'
      })
      assert.equal(error, undefined)
    })

    test('sendMessageSchema should reject empty content', () => {
      const { error } = sendMessageSchema.validate({
        conversationId: 'conv_123',
        content: '   '
      })
      assert.ok(error)
    })
  })
})
