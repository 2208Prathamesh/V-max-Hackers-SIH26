import { createClient } from 'redis'
import env from '../../config/env.js'

let client = null
let isConnected = false
let hasLoggedConnectionFailure = false
let connectionPromise = null

// In-memory fallback map for when Redis is unavailable or disabled
const memoryFallback = new Map()
const memoryExpiry = new Map()

function isMemoryExpired (key) {
  const expiresAt = memoryExpiry.get(key)
  if (!expiresAt) return false
  if (Date.now() > expiresAt) {
    memoryFallback.delete(key)
    memoryExpiry.delete(key)
    return true
  }
  return false
}

/**
 * Build Redis connection configuration
 */
function buildClientConfig () {
  if (env.REDIS_HOST) {
    const config = {
      socket: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT || 6379,
        reconnectStrategy: retries => {
          if (retries > 5) {
            return new Error('Redis max reconnect attempts reached')
          }
          return Math.min(retries * 500, 3000)
        }
      }
    }
    if (env.REDIS_PASSWORD) {
      config.password = env.REDIS_PASSWORD
    }
    return config
  }

  return {
    url: env.REDIS_URL,
    socket: {
      reconnectStrategy: retries => {
        if (retries > 5) {
          return new Error('Redis max reconnect attempts reached')
        }
        return Math.min(retries * 500, 3000)
      }
    }
  }
}

/**
 * Initialize Redis connection (non-blocking, will not crash process)
 */
export async function connectRedis () {
  if (!env.REDIS_ENABLED) {
    return false
  }

  if (isConnected && client?.isReady) {
    return true
  }

  if (connectionPromise) {
    return connectionPromise
  }

  connectionPromise = (async () => {
    try {
      if (!client) {
        client = createClient(buildClientConfig())

        client.on('error', err => {
          isConnected = false
          if (!hasLoggedConnectionFailure) {
            console.warn(
              `⚠️ [Redis] Connection error: ${err.message}. Operating with fallback.`
            )
            hasLoggedConnectionFailure = true
          }
        })

        client.on('ready', () => {
          isConnected = true
          hasLoggedConnectionFailure = false
          console.log('✅ [Redis] Connected and ready')
        })

        client.on('end', () => {
          isConnected = false
        })
      }

      await client.connect()
      isConnected = true
      return true
    } catch (err) {
      isConnected = false
      if (!hasLoggedConnectionFailure) {
        console.warn(
          `⚠️ [Redis] Initial connection failed (${err.message}). Using memory fallback.`
        )
        hasLoggedConnectionFailure = true
      }
      return false
    } finally {
      connectionPromise = null
    }
  })()

  return connectionPromise
}

/**
 * Disconnect Redis gracefully
 */
export async function disconnectRedis () {
  if (!client) return
  try {
    if (client.isOpen) {
      await client.quit()
    }
  } catch (err) {
    console.warn(`[Redis] Disconnect warning: ${err.message}`)
  } finally {
    isConnected = false
    client = null
  }
}

/**
 * Check if Redis is connected and ready
 */
export function isRedisReady () {
  return Boolean(client && client.isReady && isConnected)
}

/**
 * Safe GET operation
 * @param {string} key
 * @returns {Promise<string|null>}
 */
export async function redisGet (key) {
  if (isRedisReady()) {
    try {
      return await client.get(key)
    } catch (err) {
      console.warn(`[Redis] get error for ${key}: ${err.message}`)
    }
  }

  if (isMemoryExpired(key)) return null
  return memoryFallback.get(key) || null
}

/**
 * Safe SET operation with optional TTL in seconds
 * @param {string} key
 * @param {string} value
 * @param {object} [options]
 * @param {number} [options.EX] - TTL in seconds
 * @returns {Promise<boolean>}
 */
export async function redisSet (key, value, options = {}) {
  const ttlSeconds = options.EX

  if (isRedisReady()) {
    try {
      if (ttlSeconds && Number.isFinite(ttlSeconds) && ttlSeconds > 0) {
        await client.set(key, value, { EX: Math.floor(ttlSeconds) })
      } else {
        await client.set(key, value)
      }
      return true
    } catch (err) {
      console.warn(`[Redis] set error for ${key}: ${err.message}`)
    }
  }

  // Memory fallback
  memoryFallback.set(key, value)
  if (ttlSeconds && Number.isFinite(ttlSeconds) && ttlSeconds > 0) {
    memoryExpiry.set(key, Date.now() + ttlSeconds * 1000)
  } else {
    memoryExpiry.delete(key)
  }

  // Bound memory fallback size
  if (memoryFallback.size > 500) {
    const oldestKey = memoryFallback.keys().next().value
    memoryFallback.delete(oldestKey)
    memoryExpiry.delete(oldestKey)
  }

  return true
}

/**
 * Safe DEL operation
 * @param {string|string[]} keys
 * @returns {Promise<number>}
 */
export async function redisDel (keys) {
  const keyList = Array.isArray(keys) ? keys : [keys]
  let deletedCount = 0

  if (isRedisReady()) {
    try {
      deletedCount = await client.del(keyList)
      return deletedCount
    } catch (err) {
      console.warn(`[Redis] del error: ${err.message}`)
    }
  }

  for (const k of keyList) {
    if (memoryFallback.has(k)) {
      memoryFallback.delete(k)
      memoryExpiry.delete(k)
      deletedCount++
    }
  }
  return deletedCount
}

/**
 * Safe KEYS search
 * @param {string} pattern
 * @returns {Promise<string[]>}
 */
export async function redisKeys (pattern) {
  if (isRedisReady()) {
    try {
      return await client.keys(pattern)
    } catch (err) {
      console.warn(`[Redis] keys error for pattern ${pattern}: ${err.message}`)
    }
  }

  // Convert redis glob pattern to regex for memory fallback
  const regexPattern = new RegExp(
    '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
  )
  const matched = []
  for (const k of memoryFallback.keys()) {
    if (!isMemoryExpired(k) && regexPattern.test(k)) {
      matched.push(k)
    }
  }
  return matched
}

/**
 * Clear in-memory fallback (primarily for test cleanup)
 */
export function clearMemoryFallback () {
  memoryFallback.clear()
  memoryExpiry.clear()
}

/**
 * Direct client accessor (for tests)
 */
export function getUnderlyingClient () {
  return client
}

export default {
  connectRedis,
  disconnectRedis,
  isRedisReady,
  redisGet,
  redisSet,
  redisDel,
  redisKeys,
  clearMemoryFallback,
  getUnderlyingClient
}
