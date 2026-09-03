const API_BASE_URL = 'http://localhost:5000/api'

const request = async (path, options = {}) => {
  const headers = new Headers(options.headers || {})

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const token = globalThis.__weathergpt_token || null
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
  messages: conversationId => request(`/messages/${conversationId}`),
  sendMessage: details =>
    request('/messages', {
      method: 'POST',
      body: JSON.stringify(details)
    })
}

export default api
