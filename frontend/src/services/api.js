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

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.message || 'Request failed')
  }

  return payload.data ?? payload
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
  weather: ({ latitude, longitude }) =>
    request(
      `/weather/current?latitude=${encodeURIComponent(
        latitude
      )}&longitude=${encodeURIComponent(longitude)}`
    ),
  forecast: ({ latitude, longitude, days = 7 }) =>
    request(
      `/weather/forecast?latitude=${encodeURIComponent(
        latitude
      )}&longitude=${encodeURIComponent(longitude)}&days=${days}`
    ),
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
