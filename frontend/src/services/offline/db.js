import { openDB } from 'idb'

export const DB_NAME = 'weathergpt_offline_db'
export const DB_VERSION = 1

export const STORES = {
  CURRENT_WEATHER: 'current_weather',
  FORECASTS: 'forecasts',
  ALERTS: 'alerts'
}

let dbPromise = null

/**
 * Check if IndexedDB is supported in the current environment
 */
export const isIndexedDBSupported = () => {
  return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null
}

/**
 * Initialize or get the singleton database instance
 * Gracefully returns null if IndexedDB is disabled or unavailable
 */
export const getDB = async () => {
  if (!isIndexedDBSupported()) {
    return null
  }

  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade (db) {
        if (!db.objectStoreNames.contains(STORES.CURRENT_WEATHER)) {
          db.createObjectStore(STORES.CURRENT_WEATHER, { keyPath: 'locationKey' })
        }
        if (!db.objectStoreNames.contains(STORES.FORECASTS)) {
          db.createObjectStore(STORES.FORECASTS, { keyPath: 'locationKey' })
        }
        if (!db.objectStoreNames.contains(STORES.ALERTS)) {
          db.createObjectStore(STORES.ALERTS, { keyPath: 'scope' })
        }
      },
      blocked () {
        console.warn('WeatherGPT Offline DB: Upgrade blocked by another tab')
      },
      blocking () {
        console.warn('WeatherGPT Offline DB: Older database version closed for upgrade')
      },
      terminated () {
        dbPromise = null
      }
    }).catch(err => {
      console.warn('WeatherGPT Offline DB: Failed to open IndexedDB:', err?.message || err)
      dbPromise = null
      return null
    })
  }

  return dbPromise
}

/**
 * Helper to safely execute an operation on an object store
 * @param {string} storeName 
 * @param {'readonly'|'readwrite'} mode 
 * @param {(store: any, tx: any) => Promise<any>} callback 
 */
export const withStore = async (storeName, mode, callback) => {
  const db = await getDB()
  if (!db) return null

  try {
    const tx = db.transaction(storeName, mode)
    const store = tx.objectStore(storeName)
    const result = await callback(store, tx)
    await tx.done
    return result
  } catch (err) {
    console.warn(`WeatherGPT Offline DB error in store ${storeName}:`, err?.message || err)
    return null
  }
}

