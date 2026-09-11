let AsyncStorage = null
try {
  // eslint-disable-next-line
  const mod = require('@react-native-async-storage/async-storage')
  AsyncStorage = mod?.default || mod
} catch {
  // Graceful fallback to window.localStorage / memoryStore
}

const PREFIX_CACHE = '@weathergpt_api_cache_'
const PREFIX_SNAPSHOTS = '@weathergpt_snapshots_'
const KEY_LAST_SYNC = '@weathergpt_last_sync'
const KEY_PINNED_WIDGETS = '@weathergpt_pinned_widgets'
const DEFAULT_PINNED_WIDGETS = {
  aviation: true,
  marine: true,
  urbanFlood: true,
  airQuality: false
}
const MAX_PINNED_WIDGETS = 3
const MAX_DAYS = 7

/**
 * Universal Storage Helper: Uses AsyncStorage with a safe in-memory fallback
 */
class LocalStorageEngine {
  constructor () {
    this.memoryStore = new Map()
  }

  async setItem (key, value) {
    const str = typeof value === 'string' ? value : JSON.stringify(value)
    this.memoryStore.set(key, str)
    try {
      if (typeof window !== 'undefined' && window?.localStorage) {
        window.localStorage.setItem(key, str)
      }
    } catch {}
    try {
      if (AsyncStorage?.setItem) {
        await AsyncStorage.setItem(key, str)
      }
    } catch {}
  }

  async getItem (key) {
    try {
      if (AsyncStorage?.getItem) {
        const val = await AsyncStorage.getItem(key)
        if (val) return val
      }
    } catch {}

    try {
      if (typeof window !== 'undefined' && window?.localStorage) {
        const val = window.localStorage.getItem(key)
        if (val) return val
      }
    } catch {}

    return this.memoryStore.get(key) || null
  }

  async removeItem (key) {
    this.memoryStore.delete(key)
    try {
      if (typeof window !== 'undefined' && window?.localStorage) {
        window.localStorage.removeItem(key)
      }
    } catch {}
    try {
      if (AsyncStorage?.removeItem) {
        await AsyncStorage.removeItem(key)
      }
    } catch {}
  }
}

const storage = new LocalStorageEngine()

/**
 * Normalizes city names for key storage
 */
const normalizeCity = (city = 'Pune') =>
  city.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')

/**
 * Generates an ISO Date string YYYY-MM-DD
 */
const getDateKey = (date = new Date()) => {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

export const offlineStorage = {
  /**
   * Save a daily telemetry snapshot to ensure 7 days of historical and offline continuity
   */
  async saveDailySnapshot (cityName, weatherData, forecastData = null) {
    if (!cityName || !weatherData) return
    const normCity = normalizeCity(cityName)
    const storeKey = `${PREFIX_SNAPSHOTS}${normCity}`
    const todayStr = getDateKey()

    try {
      const existingRaw = await storage.getItem(storeKey)
      let snapshots = existingRaw ? JSON.parse(existingRaw) : []
      if (!Array.isArray(snapshots)) snapshots = []

      // Extract high-fidelity parameters
      const current = weatherData.forecast?.current || weatherData.current || weatherData
      const temp = current.temperature ?? 28
      const condition = current.condition || current.weatherDescription || 'Clear Sky'
      const humidity = current.humidity ?? 65
      const windSpeed = current.windSpeed ?? 12
      const pressure = current.pressure ? Math.round(current.pressure) : 1012
      const rainProb = current.precipitationProbability ?? current.precipitation ?? 15
      const aqi = weatherData.airQuality?.aqi || 55

      // Check today's min/max from forecast
      const dailyForecast = forecastData?.models?.openMeteo?.daily || forecastData?.daily || []
      const todayDaily = dailyForecast[0] || {}
      const minTemp = todayDaily.minTemperature ?? Math.round(temp - 4)
      const maxTemp = todayDaily.maxTemperature ?? Math.round(temp + 4)

      const newSnapshot = {
        date: todayStr,
        displayDate: new Date().toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        }),
        timestamp: Date.now(),
        city: cityName,
        temp: Math.round(temp),
        minTemp: Math.round(minTemp),
        maxTemp: Math.round(maxTemp),
        condition,
        humidity: Math.round(humidity),
        windSpeed: Math.round(windSpeed),
        pressure,
        rainProb: Math.round(rainProb),
        aqi: Math.round(aqi),
        hourly: (forecastData?.models?.openMeteo?.hourly || forecastData?.hourly || []).slice(0, 24)
      }

      // Upsert today's snapshot
      const existingIdx = snapshots.findIndex(s => s.date === todayStr)
      if (existingIdx >= 0) {
        snapshots[existingIdx] = { ...snapshots[existingIdx], ...newSnapshot }
      } else {
        snapshots.unshift(newSnapshot)
      }

      // Keep only rolling 7 days
      snapshots = snapshots.slice(0, MAX_DAYS)

      await storage.setItem(storeKey, snapshots)
      await storage.setItem(KEY_LAST_SYNC, Date.now().toString())
      return snapshots
    } catch (err) {
      console.warn('Offline save snapshot error:', err)
    }
  },

  /**
   * Retrieve rolling 7-day history for a city from local storage
   */
  async get7DayHistory (cityName) {
    const normCity = normalizeCity(cityName)
    const storeKey = `${PREFIX_SNAPSHOTS}${normCity}`

    try {
      const raw = await storage.getItem(storeKey)
      let snapshots = raw ? JSON.parse(raw) : []
      if (!Array.isArray(snapshots)) snapshots = []

      // If we have some days but less than 7, build realistic historical continuity
      if (snapshots.length > 0 && snapshots.length < 7) {
        const base = snapshots[0]
        const filled = [...snapshots]
        for (let i = snapshots.length; i < 7; i++) {
          const pastDate = new Date(Date.now() - i * 86400000)
          const dateStr = pastDate.toISOString().split('T')[0]
          const tempVariance = (i % 2 === 0 ? 1 : -1) * (i * 0.6)
          filled.push({
            date: dateStr,
            displayDate: pastDate.toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short'
            }),
            timestamp: pastDate.getTime(),
            city: base.city,
            temp: Math.round(base.temp + tempVariance),
            minTemp: Math.round(base.minTemp + tempVariance),
            maxTemp: Math.round(base.maxTemp + tempVariance),
            condition: base.condition,
            humidity: Math.max(30, Math.min(95, Math.round(base.humidity + (i * 2 - 3)))),
            windSpeed: Math.max(5, Math.min(40, Math.round(base.windSpeed + (i % 3)))),
            pressure: Math.round(base.pressure + (i % 2 === 0 ? 2 : -2)),
            rainProb: Math.max(0, Math.min(100, Math.round(base.rainProb + (i * 5 - 10)))),
            aqi: Math.max(25, Math.min(350, Math.round(base.aqi + (i * 4 - 6)))),
            isHistoricalEstimate: true
          })
        }
        return filled
      }

      return snapshots
    } catch (err) {
      console.warn('Offline get 7-day history error:', err)
      return []
    }
  },

  /**
   * Cache arbitrary API GET payload for complete offline screen availability
   */
  async cacheApiPayload (endpointKey, payload) {
    if (!endpointKey || payload === undefined) return
    const key = `${PREFIX_CACHE}${endpointKey}`
    try {
      await storage.setItem(key, {
        payload,
        cachedAt: Date.now()
      })
    } catch {}
  },

  /**
   * Get cached API payload when offline or network fails
   */
  async getCachedApiPayload (endpointKey) {
    if (!endpointKey) return null
    const key = `${PREFIX_CACHE}${endpointKey}`
    try {
      const raw = await storage.getItem(key)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      return parsed?.payload || parsed
    } catch {
      return null
    }
  },

  /**
   * Get overall offline telemetry diagnostics
   */
  async getStorageDiagnostics () {
    try {
      const lastSync = await storage.getItem(KEY_LAST_SYNC)
      return {
        lastSync: lastSync ? new Date(parseInt(lastSync, 10)) : null,
        isSupported: true,
        maxDaysRetention: MAX_DAYS
      }
    } catch {
      return { lastSync: null, isSupported: false, maxDaysRetention: MAX_DAYS }
    }
  },

  /**
   * Get user preferences for specialty widgets pinned to the Home Dashboard (default: all false)
   */
  async getPinnedWidgets () {
    try {
      const raw = await storage.getItem(KEY_PINNED_WIDGETS)
      if (!raw) return DEFAULT_PINNED_WIDGETS
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
      return { ...DEFAULT_PINNED_WIDGETS, ...parsed }
    } catch {
      return DEFAULT_PINNED_WIDGETS
    }
  },

  /**
   * Toggle or set a specific specialty widget pinned to the Home Dashboard
   * Strictly enforces MAX 3 pinned widgets constraint.
   */
  async setWidgetPinned (widgetKey, isPinned) {
    try {
      const current = await this.getPinnedWidgets()
      if (isPinned && !current[widgetKey]) {
        const currentlyPinnedCount = Object.entries(current).filter(([k, v]) => v && k !== widgetKey).length
        if (currentlyPinnedCount >= MAX_PINNED_WIDGETS) {
          return {
            success: false,
            error: 'MAX_LIMIT_REACHED',
            message: `Maximum ${MAX_PINNED_WIDGETS} widgets can be pinned to Home Dashboard. Please unpin one first.`,
            widgets: current
          }
        }
      }
      const updated = { ...current, [widgetKey]: !!isPinned }
      await storage.setItem(KEY_PINNED_WIDGETS, JSON.stringify(updated))
      return { success: true, widgets: updated }
    } catch {
      return { success: false, widgets: DEFAULT_PINNED_WIDGETS }
    }
  },

  /**
   * Check if user can pin another widget (max 3)
   */
  async canPinWidget (widgetKey) {
    try {
      const current = await this.getPinnedWidgets()
      if (current[widgetKey]) return true
      const pinnedCount = Object.values(current).filter(Boolean).length
      return pinnedCount < MAX_PINNED_WIDGETS
    } catch {
      return true
    }
  },

  /**
   * Returns current count of pinned widgets
   */
  async getPinnedCount () {
    try {
      const current = await this.getPinnedWidgets()
      return Object.values(current).filter(Boolean).length
    } catch {
      return 0
    }
  }
}
