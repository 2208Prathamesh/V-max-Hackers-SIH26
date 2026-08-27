import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { hashPassword, comparePassword } from '../../backend/src/utils/password.js'

describe('Unit: Password Hashing & Verification Tests', () => {
  const plainPassword = 'SuperSecretPassword!123'

  test('hashPassword should generate a secure bcrypt hash string', async () => {
    const hash = await hashPassword(plainPassword)
    assert.ok(typeof hash === 'string')
    assert.ok(hash.startsWith('$2'))
    assert.notEqual(hash, plainPassword)
  })

  test('comparePassword should return true for correct password', async () => {
    const hash = await hashPassword(plainPassword)
    const isMatch = await comparePassword(plainPassword, hash)
    assert.equal(isMatch, true)
  })

  test('comparePassword should return false for incorrect password', async () => {
    const hash = await hashPassword(plainPassword)
    const isMatch = await comparePassword('WrongPassword123', hash)
    assert.equal(isMatch, false)
  })
})
