const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getToken = () => localStorage.getItem('weathergpt_token')

const request = async (path, options = {}) => {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')

  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  })

  if (response.status === 401) {
    // If token is invalid or expired, clear auth storage and notify listeners
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

export const api = {
  health: () => request('/health'),

  // Auth
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

  // User profile
  getUserProfile: () => request('/users/me'),
  updateProfile: profile =>
    request('/users/me', {
      method: 'PATCH',
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
  hourly: ({ city, hours = 24 }) =>
    request(`/weather/hourly?city=${encodeURIComponent(city)}&hours=${hours}`),
  compareModels: ({ city }) =>
    request(`/weather/compare?city=${encodeURIComponent(city)}`),

  // Alerts
  alerts: () => request('/alerts'),
  activeAlerts: () => request('/alerts/active'),
  getAlertById: id => request(`/alerts/${id}`),
  markAlertRead: id => request(`/alerts/${id}/read`, { method: 'PATCH' }),

  // Notifications
  notifications: () => request('/notifications'),
  unreadNotificationCount: () => request('/notifications/unread-count'),
  markNotificationRead: id =>
    request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () =>
    request('/notifications/read-all', { method: 'PATCH' }),

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
  deleteLocation: id => request(`/locations/${id}`, { method: 'DELETE' }),
  favoriteLocation: id =>
    request(`/locations/${id}/favorite`, { method: 'PATCH' }),

  // Chat & Messages
  conversations: () => request('/conversations'),
  createConversation: details =>
    request('/conversations', {
      method: 'POST',
      body: JSON.stringify(details)
    }),
  renameConversation: (id, title) =>
    request(`/conversations/${id}/rename`, {
      method: 'PATCH',
      body: JSON.stringify({ title })
    }),
  deleteConversation: id =>
    request(`/conversations/${id}`, { method: 'DELETE' }),
  messages: conversationId => request(`/messages/${conversationId}`),
  sendMessage: details =>
    request('/messages', {
      method: 'POST',
      body: JSON.stringify(details)
    }),

  // Settings & Preferences
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

  // Climate Intelligence
  climateHistory: ({ city, startDate, endDate }) =>
    request(
      `/climate/history?city=${encodeURIComponent(
        city
      )}&startDate=${encodeURIComponent(
        startDate
      )}&endDate=${encodeURIComponent(endDate)}`
    ),
  climateTrends: ({ city, startYear, endYear }) =>
    request(
      `/climate/trends?city=${encodeURIComponent(
        city
      )}&startYear=${encodeURIComponent(
        startYear
      )}&endYear=${encodeURIComponent(endYear)}`
    ),

  // GIS & Map Layers
  weatherMapLayer: (layer = 'temperature') =>
    request(`/maps/layers/weather?layer=${encodeURIComponent(layer)}`),
  alertsMapLayer: () => request('/maps/layers/alerts'),
  floodRiskMapLayer: () => request('/maps/layers/flood-risk'),
  cycloneTracks: () => request('/satellite/cyclone-tracks'),
  satelliteLayers: () => request('/satellite/layers'),

  // Voice & Multimodal
  transcribeVoice: ({ audioBase64, mimeType, language }) =>
    request('/voice/transcribe', {
      method: 'POST',
      body: JSON.stringify({ audioBase64, mimeType, language })
    }),
  synthesizeVoice: ({ text, language }) =>
    request('/voice/synthesize', {
      method: 'POST',
      body: JSON.stringify({ text, language })
    }),

  // Advisories
  cropAdvisory: ({ crop, latitude, longitude }) =>
    request(
      `/advisories/agriculture?crop=${encodeURIComponent(
        crop
      )}&latitude=${encodeURIComponent(
        latitude
      )}&longitude=${encodeURIComponent(longitude)}`
    ),
  disasterAdvisory: ({ location, latitude, longitude }) =>
    request(
      `/advisories/disaster?location=${encodeURIComponent(
        location || ''
      )}&latitude=${encodeURIComponent(
        latitude || ''
      )}&longitude=${encodeURIComponent(longitude || '')}`
    )
}

export default api
