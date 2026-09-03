import { Platform } from 'react-native'

const DEFAULT_API_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api'
    : 'http://localhost:5000/api'

export const API_BASE_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
  DEFAULT_API_URL

let inMemoryToken = null

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

const request = async (path, options = {}) => {
  const headers = new Headers(options.headers || {})

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getAuthToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.message || 'Request failed')
  }

  return payload.data ?? payload
}

export const isBackendAvailable = async () => {
  try {
    await request('/health')
    return true
  } catch {
    return false
  }
}

export const api = {
  health: () => request('/health'),
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
  alerts: () => request('/alerts'),
  activeAlerts: () => request('/alerts/active'),
  locations: () => request('/locations'),
  addLocation: location =>
    request('/locations', {
      method: 'POST',
      body: JSON.stringify(location)
    }),
  deleteLocation: id => request(`/locations/${id}`, { method: 'DELETE' }),
  favoriteLocation: id =>
    request(`/locations/${id}/favorite`, { method: 'PATCH' }),
  conversations: () => request('/conversations'),
  createConversation: details =>
    request('/conversations', {
      method: 'POST',
      body: JSON.stringify(details)
    }),
  deleteConversation: id => request(`/conversations/${id}`, { method: 'DELETE' }),
  messages: conversationId => request(`/messages/${conversationId}`),
  sendMessage: details =>
    request('/messages', {
      method: 'POST',
      body: JSON.stringify(details)
    }),
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
  weatherMapLayer: (layer = 'temperature') =>
    request(`/maps/layers/weather?layer=${encodeURIComponent(layer)}`),
  alertsMapLayer: () => request('/maps/layers/alerts')
}

export default api
