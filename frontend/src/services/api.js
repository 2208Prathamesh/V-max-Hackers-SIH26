const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('weathergpt_token');

const request = async (path, options = {}) => {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload.data ?? payload;
};

export const api = {
  // Liveness
  health: () => request('/health'),

  // Authentication
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
  register: (details) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(details)
    }),
  currentUser: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Live Weather & Forecasts
  weather: ({ latitude, longitude, city }) => {
    const params = new URLSearchParams();
    if (latitude && longitude) {
      params.set('latitude', latitude);
      params.set('longitude', longitude);
    }
    if (city) params.set('city', city);
    return request(`/weather/current?${params}`);
  },
  forecast: ({ latitude, longitude, city, days = 7 }) => {
    const params = new URLSearchParams({ days: String(days) });
    if (latitude && longitude) {
      params.set('latitude', latitude);
      params.set('longitude', longitude);
    }
    if (city) params.set('city', city);
    return request(`/weather/forecast?${params}`);
  },
  hourly: ({ latitude, longitude, city, hours = 24 }) => {
    const params = new URLSearchParams({ hours: String(hours) });
    if (latitude && longitude) {
      params.set('latitude', latitude);
      params.set('longitude', longitude);
    }
    if (city) params.set('city', city);
    return request(`/weather/hourly?${params}`);
  },
  compareModels: ({ latitude, longitude, city }) => {
    const params = new URLSearchParams();
    if (latitude && longitude) {
      params.set('latitude', latitude);
      params.set('longitude', longitude);
    }
    if (city) params.set('city', city);
    return request(`/weather/compare?${params}`);
  },

  // IMD Official Alerts & Warnings
  imdWarnings: () => request('/imd/warnings'),
  imdDistrictWarning: (name) => request(`/imd/warnings/district?name=${encodeURIComponent(name)}`),
  imdBulletin: () => request('/imd/bulletin'),
  alerts: () => request('/alerts'),

  // Climate & 20-Year Historical Trends
  climateHistory: ({ city, latitude, longitude, startDate, endDate }) => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (latitude && longitude) {
      params.set('latitude', latitude);
      params.set('longitude', longitude);
    }
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return request(`/climate/history?${params}`);
  },
  climateTrends: ({ city, latitude, longitude, startYear, endYear }) => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (latitude && longitude) {
      params.set('latitude', latitude);
      params.set('longitude', longitude);
    }
    if (startYear) params.set('startYear', startYear);
    if (endYear) params.set('endYear', endYear);
    return request(`/climate/trends?${params}`);
  },

  // Agriculture & Disaster Decision Support
  agricultureAdvisory: ({ city, latitude, longitude, crop }) => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (latitude && longitude) {
      params.set('latitude', latitude);
      params.set('longitude', longitude);
    }
    if (crop) params.set('crop', crop);
    return request(`/advisories/agriculture?${params}`);
  },
  disasterAdvisory: ({ city, latitude, longitude }) => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (latitude && longitude) {
      params.set('latitude', latitude);
      params.set('longitude', longitude);
    }
    return request(`/advisories/disaster?${params}`);
  },

  // GIS Map Layers
  mapWeatherLayer: (layer = 'temperature') => request(`/maps/layers/weather?layer=${layer}`),
  mapAlertsLayer: () => request('/maps/layers/alerts'),
  mapFloodRiskLayer: () => request('/maps/layers/flood-risk'),

  // Voice Assistance
  voiceTranscribe: (data) =>
    request('/voice/transcribe', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  voiceSynthesize: (data) =>
    request('/voice/synthesize', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Satellite & WMO WIS 2.0 Metadata
  satelliteLayers: () => request('/satellite/layers'),
  satelliteCycloneTracks: () => request('/satellite/cyclone-tracks'),

  // Saved Locations
  locations: () => request('/locations'),
  addLocation: (location) =>
    request('/locations', {
      method: 'POST',
      body: JSON.stringify(location)
    }),
  deleteLocation: (id) => request(`/locations/${id}`, { method: 'DELETE' }),
  favoriteLocation: (id) => request(`/locations/${id}/favorite`, { method: 'PATCH' }),

  // Conversations & AI Messages
  conversations: () => request('/conversations'),
  createConversation: (details) =>
    request('/conversations', {
      method: 'POST',
      body: JSON.stringify(details)
    }),
  messages: (conversationId) => request(`/messages/${conversationId}`),
  sendMessage: (details) =>
    request('/messages', {
      method: 'POST',
      body: JSON.stringify(details)
    }),

  // User Settings
  settings: () => request('/settings'),
  updateSettings: (settings) =>
    request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),
  changePassword: (passwords) =>
    request('/settings/password', {
      method: 'PUT',
      body: JSON.stringify(passwords)
    })
};

export default api;
