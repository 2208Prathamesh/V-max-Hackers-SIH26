import { Platform, NativeModules } from 'react-native'
import { offlineStorage } from './offlineStorage'

// Auto-detect the host machine's IP address
const getAutoDetectedHost = () => {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return window.location.hostname
  }
  const scriptURL = NativeModules?.SourceCode?.scriptURL
  if (scriptURL) {
    const match = scriptURL.match(/:\/\/([^:/]+)/)
    if (match && match[1]) {
      return match[1]
    }
  }
  // Default to common development LAN IP
  return '192.168.0.102'
}

const CANDIDATE_HOSTS = [
  getAutoDetectedHost(),
  '192.168.0.102',
  'localhost',
  '127.0.0.1',
  '10.0.2.2'
].filter(Boolean)

let activeBaseUrl = `http://${getAutoDetectedHost()}:5000/api`
let inMemoryToken = null

// Low-latency in-memory cache and in-flight request deduplication
const cache = new Map()
const inflight = new Map()
const DEFAULT_TTL = 90 * 1000 // 90 seconds
const ALERTS_TTL = 20 * 1000 // 20 seconds for alerts

export const setAuthToken = token => {
  inMemoryToken = token
  if (typeof globalThis !== 'undefined') {
    globalThis.__weathergpt_token = token
  }
}

export const getAuthToken = () => {
  return (
    inMemoryToken ||
    (typeof globalThis !== 'undefined' ? globalThis.__weathergpt_token : null)
  )
}

export const getApiBaseUrl = () => activeBaseUrl

// Fast fetch with configurable timeout (default 7s)
const fetchWithTimeout = async (url, options = {}, timeoutMs = 7000) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Connection timed out. Server unreachable.')
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

// Proactive backend discovery across candidate hosts
export const detectServer = async () => {
  // First test the current activeBaseUrl
  try {
    const res = await fetchWithTimeout(`${activeBaseUrl}/health`, {}, 2500)
    if (res.ok) return activeBaseUrl
  } catch {}

  // Test other candidates in parallel with 2.5s timeout
  for (const host of CANDIDATE_HOSTS) {
    const candidate = `http://${host}:5000/api`
    if (candidate === activeBaseUrl) continue
    try {
      const res = await fetchWithTimeout(`${candidate}/health`, {}, 2500)
      if (res.ok) {
        activeBaseUrl = candidate
        return activeBaseUrl
      }
    } catch {}
  }
  return activeBaseUrl
}

// Core unified request handler with offline storage & deduplication
const request = async (path, options = {}) => {
  const method = (options.method || 'GET').toUpperCase()
  const isGet = method === 'GET'
  const isAlerts = path.includes('/alerts')

  // Cache check for GET requests
  if (isGet && !options.skipCache) {
    const cacheKey = `${activeBaseUrl}${path}`
    const cached = cache.get(cacheKey)
    const ttl = isAlerts ? ALERTS_TTL : DEFAULT_TTL
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data
    }

    // In-flight deduplication
    if (inflight.has(cacheKey)) {
      return inflight.get(cacheKey)
    }

    const fetchPromise = (async () => {
      try {
        const headers = new Headers(options.headers || {})
        const token = getAuthToken()
        if (token) headers.set('Authorization', `Bearer ${token}`)

        const response = await fetchWithTimeout(`${activeBaseUrl}${path}`, {
          ...options,
          headers
        }, options.timeoutMs || 8000)

        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload.message || 'Request failed')
        }

        const data = payload.data !== undefined ? payload.data : payload
        cache.set(cacheKey, { data, timestamp: Date.now() })
        
        // Asynchronously persist to 7-day offline local storage
        offlineStorage.cacheApiPayload(path, data).catch(() => {})
        if (path.includes('/weather')) {
          const cName = data.resolvedCity || data.city || data.location?.name || 'Pune'
          offlineStorage.saveDailySnapshot(cName, data).catch(() => {})
        }

        return data
      } catch (networkErr) {
        // Network failure / Offline fallback: retrieve from 7-day offline store
        const offlineData = await offlineStorage.getCachedApiPayload(path)
        if (offlineData) {
          return offlineData
        }
        throw networkErr
      } finally {
        inflight.delete(cacheKey)
      }
    })()

    inflight.set(cacheKey, fetchPromise)
    return fetchPromise
  }

  // Mutating requests: clear cache and execute directly
  cache.clear()
  const headers = new Headers(options.headers || {})
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getAuthToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetchWithTimeout(`${activeBaseUrl}${path}`, {
    ...options,
    headers
  }, options.timeoutMs || 10000)

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.message || 'Request failed')
  }

  return payload.data !== undefined ? payload.data : payload
}

export const isBackendAvailable = async () => {
  try {
    await request('/health', { skipCache: true, timeoutMs: 3000 })
    return true
  } catch {
    return false
  }
}

// Auto-authenticate with the database demo account if no token is loaded
export const ensureAuth = async () => {
  const existingToken = getAuthToken()
  if (existingToken) return true

  try {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'sidpatil@gmail.com',
        password: 'password123'
      }),
      timeoutMs: 4000
    })
    if (res?.token) {
      setAuthToken(res.token)
      return true
    }
  } catch {}
  return false
}

export const api = {
  detectServer,
  ensureAuth,
  health: () => request('/health', { skipCache: true, timeoutMs: 3000 }),
  login: credentials =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
  register: details =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(details)
    }),
  currentUser: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Weather & Forecasts
  weather: ({ latitude, longitude, city } = {}) => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (latitude !== undefined) params.set('latitude', String(latitude))
    if (longitude !== undefined) params.set('longitude', String(longitude))
    return request(`/weather/current?${params.toString()}`)
  },
  forecast: ({ latitude, longitude, city, days = 7 } = {}) => {
    const params = new URLSearchParams({ days: String(days) })
    if (city) params.set('city', city)
    if (latitude !== undefined) params.set('latitude', String(latitude))
    if (longitude !== undefined) params.set('longitude', String(longitude))
    return request(`/weather/forecast?${params.toString()}`)
  },
  hourlyForecast: ({ latitude, longitude, city, hours = 24 } = {}) => {
    const params = new URLSearchParams({ hours: String(hours) })
    if (city) params.set('city', city)
    if (latitude !== undefined) params.set('latitude', String(latitude))
    if (longitude !== undefined) params.set('longitude', String(longitude))
    return request(`/weather/hourly?${params.toString()}`)
  },
  searchLocations: query => {
    if (!query || !query.trim()) return Promise.resolve([])
    return request(`/weather/search?q=${encodeURIComponent(query.trim())}`)
  },
  compareModels: ({ city = 'Pune', days = 3 } = {}) =>
    request(`/weather/compare?city=${encodeURIComponent(city)}&days=${days}`),

  // Live Alerts
  alerts: () => request('/alerts'),
  activeAlerts: () => request('/alerts/active'),

  // Saved User Locations
  locations: () => request('/locations'),
  addLocation: location =>
    request('/locations', {
      method: 'POST',
      body: JSON.stringify(location)
    }),
  deleteLocation: id => request(`/locations/${id}`, { method: 'DELETE' }),
  favoriteLocation: id =>
    request(`/locations/${id}/favorite`, { method: 'PATCH' }),

  // AI Chat & Conversations
  conversations: () => request('/conversations'),
  createConversation: details =>
    request('/conversations', {
      method: 'POST',
      body: JSON.stringify(details)
    }),
  deleteConversation: id =>
    request(`/conversations/${id}`, { method: 'DELETE' }),
  messages: conversationId => request(`/messages/${conversationId}`),
  sendMessage: details =>
    request('/messages', {
      method: 'POST',
      body: JSON.stringify(details)
    }),

  // User Settings
  getSettings: () => request('/settings'),
  updateSettings: settings =>
    request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),
  changePassword: passwords =>
    request('/settings/password', {
      method: 'PATCH',
      body: JSON.stringify(passwords)
    }),

  // GIS Map Layers
  weatherMapLayer: (layer = 'temperature') =>
    request(`/maps/layers/weather?layer=${encodeURIComponent(layer)}`),
  alertsMapLayer: () => request('/maps/layers/alerts'),
  floodRiskMapLayer: () => request('/maps/layers/flood-risk'),

  // Aviation Meteorology
  aviationAirports: () => request('/aviation/airports'),
  aviationMetar: (icao = 'VABB') =>
    request(`/aviation/metar/${encodeURIComponent(icao)}`),
  aviationBriefing: (icao = 'VABB') =>
    request(`/aviation/briefing/${encodeURIComponent(icao)}`),

  // Marine & Coastal Safety
  marineDistricts: () => request('/marine/districts'),
  marineForecast: (params = {}) => {
    const q = new URLSearchParams()
    if (params.lat) q.set('lat', String(params.lat))
    if (params.lon) q.set('lon', String(params.lon))
    if (params.district) q.set('district', params.district)
    return request(`/marine/forecast?${q.toString()}`)
  },
  marineCoastalDistrict: (district = 'mumbai') =>
    request(`/marine/coastal/${encodeURIComponent(district)}`),

  // Urban Flash Flood Index
  urbanFloodCities: () => request('/urban-flood/cities'),
  urbanFloodIndex: (params = {}) => {
    const q = new URLSearchParams()
    if (params.city) q.set('city', params.city)
    if (params.lat) q.set('lat', String(params.lat))
    if (params.lon) q.set('lon', String(params.lon))
    return request(`/urban-flood?${q.toString()}`)
  },

  // News Articles
  news: () => request('/news'),

  // Climate Intelligence & Climatology
  climateHistory: ({ city, latitude, longitude } = {}) => {
    const p = new URLSearchParams()
    if (city) p.set('city', city)
    if (latitude) p.set('latitude', String(latitude))
    if (longitude) p.set('longitude', String(longitude))
    return request(`/climate/history?${p.toString()}`)
  },
  climateTrends: ({ city, latitude, longitude } = {}) => {
    const p = new URLSearchParams()
    if (city) p.set('city', city)
    if (latitude) p.set('latitude', String(latitude))
    if (longitude) p.set('longitude', String(longitude))
    return request(`/climate/trends?${p.toString()}`)
  },
  climateFull: ({ city, latitude, longitude } = {}) => {
    const p = new URLSearchParams()
    if (city) p.set('city', city)
    if (latitude) p.set('latitude', String(latitude))
    if (longitude) p.set('longitude', String(longitude))
    return request(`/climate/full?${p.toString()}`)
  },

  // Satellite & Cyclone Tracks
  satelliteLayers: () => request('/satellite/layers'),
  satelliteCycloneTracks: () => request('/satellite/cyclone-tracks'),

  // Subscriptions & Notifications
  subscriptions: () => request('/subscriptions'),
  toggleSubscription: (id, enabled) =>
    request(`/subscriptions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled })
    }),

  // Alert Details
  alertById: id => request(`/alerts/${id}`),

  // Offline 7-Day Local Data Management
  getOffline7Days: city => offlineStorage.get7DayHistory(city),
  saveOfflineSnapshot: (city, weather, forecast) =>
    offlineStorage.saveDailySnapshot(city, weather, forecast),
  getStorageDiagnostics: () => offlineStorage.getStorageDiagnostics(),
  offlineStorage
}

export { offlineStorage }
export default api
