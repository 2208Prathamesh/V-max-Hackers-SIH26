const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getToken = () => localStorage.getItem('weathergpt_token')

// High-Performance In-Memory Client Cache & In-flight Deduplication
const cache = new Map()
const inflight = new Map()
const DEFAULT_TTL_MS = 2 * 60 * 1000 // 2 minutes for general weather, forecasts, maps, historical
const SHORT_TTL_MS = 30 * 1000 // 30 seconds for live alerts
const MAX_CACHE_ENTRIES = 120

const getTtlForPath = path => {
  if (
    path.includes('/alerts') ||
    path.includes('/warnings') ||
    path.includes('/notifications')
  ) {
    return SHORT_TTL_MS
  }
  return DEFAULT_TTL_MS
}

const invalidateCache = () => {
  cache.clear()
}

const fetchWithTimeout = async (url, options = {}, timeoutMs = 25000) => {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, {
      ...options,
      signal: options.signal || controller.signal
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Connection timed out. Please check your network and retry.')
    }
    throw err
  } finally {
    clearTimeout(id)
  }
}

const request = async (path, options = {}) => {
  const method = (options.method || 'GET').toUpperCase()
  const isGet = method === 'GET'

  // For mutating requests (POST, PUT, DELETE, PATCH), invalidate cache and run directly
  if (!isGet) {
    invalidateCache()
    const headers = new Headers(options.headers)
    headers.set('Content-Type', 'application/json')
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)

    const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    })

    if (response.status === 401) {
      localStorage.removeItem('weathergpt_token')
      localStorage.removeItem('weathergpt_user')
      window.dispatchEvent(new CustomEvent('weathergpt:unauthorized'))
    }

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(payload.message || 'Request failed')
    }
    return payload.data ?? payload
  }

  // Check cache for GET requests
  const cacheKey = `${path}`
  const cachedEntry = cache.get(cacheKey)
  const now = Date.now()
  if (cachedEntry && now - cachedEntry.timestamp < cachedEntry.ttl) {
    return cachedEntry.data
  }

  // Deduplicate in-flight concurrent requests to the same path
  if (inflight.has(cacheKey)) {
    return inflight.get(cacheKey)
  }

  const fetchPromise = (async () => {
    try {
      const headers = new Headers(options.headers)
      headers.set('Content-Type', 'application/json')
      const token = getToken()
      if (token) headers.set('Authorization', `Bearer ${token}`)

      const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
        ...options,
        headers
      })

      if (response.status === 401) {
        localStorage.removeItem('weathergpt_token')
        localStorage.removeItem('weathergpt_user')
        window.dispatchEvent(new CustomEvent('weathergpt:unauthorized'))
      }

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload.message || 'Request failed')
      }

      const data = payload.data ?? payload

      // LRU Eviction if full
      if (cache.size >= MAX_CACHE_ENTRIES) {
        const oldest = cache.keys().next().value
        cache.delete(oldest)
      }

      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: getTtlForPath(path)
      })

      return data
    } finally {
      inflight.delete(cacheKey)
    }
  })()

  inflight.set(cacheKey, fetchPromise)
  return fetchPromise
}

export const api = {
  // Cache Management
  clearCache: invalidateCache,

  // Liveness
  health: () => request('/health'),

  // Authentication
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
  socialLogin: payload =>
    request('/auth/social-login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  currentUser: () => request('/auth/me'),
  logout: () =>
    request('/auth/logout', {
      method: 'POST'
    }),
  forgotPassword: email =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),
  resetPassword: ({ token, password, confirmPassword }) =>
    request(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password, confirmPassword })
    }),
  getUserProfile: () => request('/users/profile'),
  updateProfile: profile =>
    request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    }),

  // Weather & Forecast
  weather: ({ latitude, longitude, city }) => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (latitude !== undefined) params.set('latitude', String(latitude))
    if (longitude !== undefined) params.set('longitude', String(longitude))
    return request(`/weather/current?${params.toString()}`)
  },
  forecast: ({ latitude, longitude, city, days = 7 }) => {
    const params = new URLSearchParams({ days: String(days) })
    if (city) params.set('city', city)
    if (latitude !== undefined) params.set('latitude', String(latitude))
    if (longitude !== undefined) params.set('longitude', String(longitude))
    return request(`/weather/forecast?${params.toString()}`)
  },
  hourly: ({ latitude, longitude, city, hours = 24 }) => {
    const params = new URLSearchParams({ hours: String(hours) })
    if (city) params.set('city', city)
    if (latitude !== undefined) params.set('latitude', String(latitude))
    if (longitude !== undefined) params.set('longitude', String(longitude))
    return request(`/weather/hourly?${params.toString()}`)
  },
  compareModels: ({ latitude, longitude, city }) => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (latitude !== undefined) params.set('latitude', String(latitude))
    if (longitude !== undefined) params.set('longitude', String(longitude))
    return request(`/weather/compare?${params.toString()}`)
  },
  searchLocations: query =>
    request(`/weather/search?q=${encodeURIComponent(query)}`),
  reverseGeocode: ({ latitude, longitude } = {}) => {
    const params = new URLSearchParams()
    if (latitude !== undefined) params.set('latitude', String(latitude))
    if (longitude !== undefined) params.set('longitude', String(longitude))
    const qs = params.toString() ? `?${params.toString()}` : ''
    return request(`/weather/reverse-geocode${qs}`)
  },

  // Alerts & IMD
  alerts: () => request('/alerts'),
  myAlerts: () => request('/alerts/my-alerts'),
  activeAlerts: () => request('/alerts/active'),
  getAlertById: id => request(`/alerts/${id}`),
  imdWarnings: () => request('/imd/warnings'),
  imdDistrictWarning: name =>
    request(`/imd/warnings/district?name=${encodeURIComponent(name)}`),
  imdBulletin: () => request('/imd/bulletin'),

  // Weather & Climate News
  getNews: ({ scope = 'all', category = 'all', query = '' } = {}) => {
    const params = new URLSearchParams()
    if (scope && scope !== 'all') params.set('scope', scope)
    if (category && category !== 'all') params.set('category', category)
    if (query && query.trim()) params.set('q', query.trim())
    const qs = params.toString() ? `?${params.toString()}` : ''
    return request(`/news${qs}`)
  },

  // Notifications & Subscriptions
  notifications: () => request('/notifications'),
  unreadNotificationCount: () => request('/notifications/unread-count'),
  markNotificationAsRead: id =>
    request(`/notifications/${id}/read`, {
      method: 'PATCH'
    }),
  markAllNotificationsAsRead: () =>
    request('/notifications/read-all', {
      method: 'PATCH'
    }),
  getSubscriptions: () => request('/subscriptions'),
  toggleSubscription: (id, enabled) =>
    request(`/subscriptions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled })
    }),

  // Locations
  locations: () => request('/locations'),
  addLocation: location =>
    request('/locations', {
      method: 'POST',
      body: JSON.stringify(location)
    }),
  updateLocation: (id, location) =>
    request(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(location)
    }),
  deleteLocation: id =>
    request(`/locations/${id}`, {
      method: 'DELETE'
    }),
  favoriteLocation: id =>
    request(`/locations/${id}/favorite`, {
      method: 'PATCH'
    }),

  // Conversations & AI Messages
  conversations: () => request('/conversations'),
  createConversation: details =>
    request('/conversations', {
      method: 'POST',
      body: JSON.stringify(details)
    }),
  deleteConversation: id =>
    request(`/conversations/${id}`, {
      method: 'DELETE'
    }),
  messages: conversationId => request(`/messages/${conversationId}`),
  sendMessage: details =>
    request('/messages', {
      method: 'POST',
      body: JSON.stringify(details)
    }),

  // Settings & Preferences
  settings: () => request('/settings'),
  getSettings: () => request('/settings'),
  updateSettings: settings =>
    request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),
  changePassword: passwords =>
    request('/settings/password', {
      method: 'PUT',
      body: JSON.stringify(passwords)
    }),

  // Climate Intelligence
  climateHistory: ({ city, latitude, longitude, startDate, endDate }) => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (latitude !== undefined) params.set('latitude', String(latitude))
    if (longitude !== undefined) params.set('longitude', String(longitude))
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    return request(`/climate/history?${params.toString()}`)
  },
  climateTrends: ({ city, latitude, longitude, startYear, endYear }) => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (latitude !== undefined) params.set('latitude', String(latitude))
    if (longitude !== undefined) params.set('longitude', String(longitude))
    if (startYear) params.set('startYear', String(startYear))
    if (endYear) params.set('endYear', String(endYear))
    return request(`/climate/trends?${params.toString()}`)
  },
  fullClimateData: ({ city, latitude, longitude, startDate, endDate, startYear, endYear } = {}) => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (latitude !== undefined) params.set('latitude', String(latitude))
    if (longitude !== undefined) params.set('longitude', String(longitude))
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    if (startYear) params.set('startYear', String(startYear))
    if (endYear) params.set('endYear', String(endYear))
    return request(`/climate/full?${params.toString()}`)
  },

  // GIS Map Layers
  weatherMapLayer: (layer = 'temperature') =>
    request(`/maps/layers/weather?layer=${encodeURIComponent(layer)}`),
  mapWeatherLayer: (layer = 'temperature') =>
    request(`/maps/layers/weather?layer=${encodeURIComponent(layer)}`),
  alertsMapLayer: () => request('/maps/layers/alerts'),
  mapAlertsLayer: () => request('/maps/layers/alerts'),
  floodRiskMapLayer: () => request('/maps/layers/flood-risk'),
  mapFloodRiskLayer: () => request('/maps/layers/flood-risk'),
  satelliteLayers: () => request('/satellite/layers'),
  cycloneTracks: () => request('/satellite/cyclone-tracks'),
  satelliteCycloneTracks: () => request('/satellite/cyclone-tracks'),

  // Voice Assistance
  transcribeVoice: ({ audioBase64, mimeType, language }) =>
    request('/voice/transcribe', {
      method: 'POST',
      body: JSON.stringify({ audioBase64, mimeType, language })
    }),
  voiceTranscribe: data =>
    request('/voice/transcribe', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  synthesizeVoice: ({ text, language }) =>
    request('/voice/synthesize', {
      method: 'POST',
      body: JSON.stringify({ text, language })
    }),
  voiceSynthesize: data =>
    request('/voice/synthesize', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Advisories
  agricultureAdvisory: ({ city, latitude, longitude, crop, sowingDate, das }) => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (latitude !== undefined) params.set('latitude', String(latitude))
    if (longitude !== undefined) params.set('longitude', String(longitude))
    if (crop) params.set('crop', crop)
    if (sowingDate) params.set('sowingDate', sowingDate)
    if (das !== undefined && das !== null) params.set('das', String(das))
    return request(`/advisories/agriculture?${params.toString()}`)
  },
  cropAdvisory: ({ crop, latitude, longitude }) =>
    request(
      `/advisories/crop?crop=${encodeURIComponent(
        crop || ''
      )}&latitude=${encodeURIComponent(
        latitude || ''
      )}&longitude=${encodeURIComponent(longitude || '')}`
    ),
  disasterAdvisory: ({ city, location, latitude, longitude }) => {
    const params = new URLSearchParams()
    const loc = city || location
    if (loc) params.set('location', loc)
    if (latitude !== undefined) params.set('latitude', String(latitude))
    if (longitude !== undefined) params.set('longitude', String(longitude))
    return request(`/advisories/disaster?${params.toString()}`)
  },

  // Authority Dashboard & Official Alerts
  getAuthorityAlerts: status =>
    request(
      status && status !== 'all'
        ? `/authority/alerts?status=${encodeURIComponent(status)}`
        : '/authority/alerts'
    ),
  getAuthorityAlertById: id => request(`/authority/alerts/${id}`),
  createAuthorityAlert: data =>
    request('/authority/alerts', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateAuthorityAlert: (id, data) =>
    request(`/authority/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  publishAuthorityAlert: id =>
    request(`/authority/alerts/${id}/publish`, {
      method: 'POST'
    }),
  cancelAuthorityAlert: id =>
    request(`/authority/alerts/${id}/cancel`, {
      method: 'POST'
    }),
  authorityStats: () => request('/authority/stats'),
  authorityDistricts: () => request('/authority/districts'),

  // Climate & Historical Reanalysis
  climateHistory: ({ city, latitude, longitude, startDate, endDate }) => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (latitude !== undefined) params.set('latitude', String(latitude))
    if (longitude !== undefined) params.set('longitude', String(longitude))
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    return request(`/climate/history?${params.toString()}`)
  },
  climateTrends: ({ city, latitude, longitude, startYear, endYear }) => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (latitude !== undefined) params.set('latitude', String(latitude))
    if (longitude !== undefined) params.set('longitude', String(longitude))
    if (startYear) params.set('startYear', String(startYear))
    if (endYear) params.set('endYear', String(endYear))
    return request(`/climate/trends?${params.toString()}`)
  },
  fullClimateData: ({ city, latitude, longitude, startYear, endYear, startDate, endDate }) => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (latitude !== undefined) params.set('latitude', String(latitude))
    if (longitude !== undefined) params.set('longitude', String(longitude))
    if (startYear) params.set('startYear', String(startYear))
    if (endYear) params.set('endYear', String(endYear))
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    return request(`/climate/full?${params.toString()}`)
  }
}

export default api

