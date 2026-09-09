import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  redisGet,
  redisSet,
  redisDel,
  redisKeys,
  clearMemoryFallback,
  isRedisReady
} from '../../backend/src/services/cache/redisClient.js'

describe('Unit: Redis Client & Fallback Tests', () => {
  beforeEach(() => {
    clearMemoryFallback()
  })

  test('handles get and set operations gracefully without crashing', async () => {
    const success = await redisSet('test:key:1', JSON.stringify({ temp: 25 }))
    assert.equal(success, true)

    const raw = await redisGet('test:key:1')
    assert.ok(raw)
    const parsed = JSON.parse(raw)
    assert.equal(parsed.temp, 25)
  })

  test('returns null for nonexistent keys', async () => {
    const raw = await redisGet('test:key:nonexistent')
    assert.equal(raw, null)
  })

  test('deletes keys correctly', async () => {
    await redisSet('test:key:delete', 'value')
    const beforeDel = await redisGet('test:key:delete')
    assert.equal(beforeDel, 'value')

    const delCount = await redisDel('test:key:delete')
    assert.ok(delCount >= 1)

    const afterDel = await redisGet('test:key:delete')
    assert.equal(afterDel, null)
  })

  test('searches keys by pattern matching', async () => {
    await redisSet('weather:forecast:run:gfs:1', 'run1')
    await redisSet('weather:forecast:run:gfs:2', 'run2')
    await redisSet('weather:forecast:run:ecmwf:1', 'run3')
    await redisSet('weather:current:pune', 'current')

    const gfsKeys = await redisKeys('weather:forecast:run:gfs:*')
    assert.equal(gfsKeys.length, 2)

    const allRunKeys = await redisKeys('weather:forecast:run:*')
    assert.equal(allRunKeys.length, 3)
  })

  test('supports TTL expiry without throwing errors', async () => {
    // 1 second TTL
    await redisSet('test:key:ttl', 'expiring', { EX: 1 })
    const immediate = await redisGet('test:key:ttl')
    assert.equal(immediate, 'expiring')
  })

  test('reports connection status reliably', () => {
    const ready = isRedisReady()
    assert.equal(typeof ready, 'boolean')
  })
})
