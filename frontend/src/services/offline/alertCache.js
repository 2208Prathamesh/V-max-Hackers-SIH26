import { STORES, withStore } from './db.js'

export const ALERT_MAX_STALE_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Determine the alert cache scope key based on auth status
 * @param {boolean} isAuthenticated 
 * @returns {string}
 */
export const getAlertScopeKey = (isAuthenticated = false) => {
  return isAuthenticated ? 'my-alerts' : 'public-alerts'
}

/**
 * Save alerts array to IndexedDB
 * 
 * @param {string} scope 
 * @param {Array<object>} alerts 
 * @returns {Promise<boolean>}
 */
export const saveAlerts = async (scope, alerts) => {
  if (!Array.isArray(alerts)) return false

  try {
    const now = Date.now()
    const record = {
      scope,
      alerts,
      cachedAt: now
    }

    const result = await withStore(STORES.ALERTS, 'readwrite', async store => {
      await store.put(record)
      return true
    })

    return Boolean(result)
  } catch (err) {
    console.warn('AlertCache: Error saving alerts:', err?.message || err)
    return false
  }
}

/**
 * Get alerts from IndexedDB
 * Always marks retrieved alerts with isOffline and isStale flags.
 * Returns null if not found or older than ALERT_MAX_STALE_MS.
 * 
 * @param {string} scope 
 * @returns {Promise<Array<object>|null>}
 */
export const getAlerts = async scope => {
  try {
    const record = await withStore(STORES.ALERTS, 'readonly', async store => {
      return store.get(scope)
    })

    if (!record || !Array.isArray(record.alerts)) return null

    const now = Date.now()
    const age = now - (record.cachedAt || 0)
    if (age > ALERT_MAX_STALE_MS) {
      return null
    }

    // Every cached alert MUST be marked as offline/stale to never mislead the user
    return record.alerts.map(alert => ({
      ...alert,
      isOffline: true,
      isStale: true,
      _offlineMeta: {
        isOffline: true,
        isStale: true,
        cachedAt: record.cachedAt,
        warning: 'Cached alert — not currently verified with authorities'
      }
    }))
  } catch (err) {
    console.warn('AlertCache: Error retrieving alerts:', err?.message || err)
    return null
  }
}

/**
 * Clean up alerts older than ALERT_MAX_STALE_MS
 */
export const cleanExpiredAlerts = async () => {
  const now = Date.now()

  await withStore(STORES.ALERTS, 'readwrite', async store => {
    let cursor = await store.openCursor()
    while (cursor) {
      const record = cursor.value
      if (now - (record.cachedAt || 0) > ALERT_MAX_STALE_MS) {
        await cursor.delete()
      }
      cursor = await cursor.continue()
    }
  }).catch(() => {})
}

export const alertCache = {
  saveAlerts,
  getAlerts,
  cleanExpiredAlerts,
  getAlertScopeKey,
  ALERT_MAX_STALE_MS
}

export default alertCache

