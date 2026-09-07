const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const getToken = () =>
  localStorage.getItem("weathergpt_token");

const request = async (path, options = {}) => {
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  const token = getToken();

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers,
    }
  );

  // ============================================
  // AUTHENTICATION ERROR
  // ============================================

  if (response.status === 401) {
    localStorage.removeItem(
      "weathergpt_token"
    );

    localStorage.removeItem(
      "weathergpt_user"
    );

    window.dispatchEvent(
      new CustomEvent(
        "weathergpt:unauthorized"
      )
    );
  }

  const payload =
    await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload.message ||
        "Request failed"
    );
  }

  return payload.data ?? payload;
};

export const api = {
  // ============================================
  // HEALTH
  // ============================================

  health: () =>
    request("/health"),

  // ============================================
  // AUTH
  // ============================================

  login: (credentials) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (details) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(details),
    }),

  currentUser: () =>
    request("/auth/me"),

  logout: () =>
    request("/auth/logout", {
      method: "POST",
    }),

  forgotPassword: (email) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: ({
    token,
    password,
    confirmPassword,
  }) =>
    request(
      `/auth/reset-password/${token}`,
      {
        method: "POST",
        body: JSON.stringify({
          password,
          confirmPassword,
        }),
      }
    ),

  // ============================================
  // USER PROFILE
  // ============================================

  getUserProfile: () =>
    request("/users/profile"),

  updateProfile: (profile) =>
    request("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profile),
    }),

  // ============================================
  // WEATHER & FORECAST
  // ============================================

  weather: ({
    latitude,
    longitude,
    city,
  }) => {
    const params =
      new URLSearchParams();

    if (city) {
      params.set("city", city);
    }

    if (latitude !== undefined) {
      params.set(
        "latitude",
        String(latitude)
      );
    }

    if (longitude !== undefined) {
      params.set(
        "longitude",
        String(longitude)
      );
    }

    return request(
      `/weather/current?${params.toString()}`
    );
  },

  forecast: ({
    latitude,
    longitude,
    city,
    days = 7,
  }) => {
    const params =
      new URLSearchParams({
        days: String(days),
      });

    if (city) {
      params.set("city", city);
    }

    if (latitude !== undefined) {
      params.set(
        "latitude",
        String(latitude)
      );
    }

    if (longitude !== undefined) {
      params.set(
        "longitude",
        String(longitude)
      );
    }

    return request(
      `/weather/forecast?${params.toString()}`
    );
  },

  hourly: ({
    city,
    hours = 24,
  }) =>
    request(
      `/weather/hourly?city=${encodeURIComponent(
        city
      )}&hours=${hours}`
    ),

  compareModels: ({ city }) =>
    request(
      `/weather/compare?city=${encodeURIComponent(
        city
      )}`
    ),

  // ============================================
  // ALERTS
  // ============================================

  alerts: () =>
    request("/alerts"),

  activeAlerts: () =>
    request("/alerts/active"),

  getAlertById: (id) =>
    request(`/alerts/${id}`),

  // ============================================
  // 🔔 NOTIFICATIONS
  // ============================================

  // Get all notifications
  notifications: () =>
    request("/notifications"),

  // Get unread notification count
  unreadNotificationCount: () =>
    request(
      "/notifications/unread-count"
    ),

  // Mark one notification as read
  markNotificationAsRead: (id) =>
    request(
      `/notifications/${id}/read`,
      {
        method: "PATCH",
      }
    ),

  // Mark all notifications as read
  markAllNotificationsAsRead: () =>
    request(
      "/notifications/read-all",
      {
        method: "PATCH",
      }
    ),

  // ============================================
  // LOCATIONS
  // ============================================

  locations: () =>
    request("/locations"),

  addLocation: (location) =>
    request("/locations", {
      method: "POST",
      body: JSON.stringify(location),
    }),

  updateLocation: (
    id,
    location
  ) =>
    request(`/locations/${id}`, {
      method: "PUT",
      body: JSON.stringify(location),
    }),

  deleteLocation: (id) =>
    request(
      `/locations/${id}`,
      {
        method: "DELETE",
      }
    ),

  favoriteLocation: (id) =>
    request(
      `/locations/${id}/favorite`,
      {
        method: "PATCH",
      }
    ),

  // ============================================
  // CHAT & MESSAGES
  // ============================================

  conversations: () =>
    request("/conversations"),

  createConversation: (
    details
  ) =>
    request("/conversations", {
      method: "POST",
      body: JSON.stringify(details),
    }),

  deleteConversation: (id) =>
    request(
      `/conversations/${id}`,
      {
        method: "DELETE",
      }
    ),

  messages: (conversationId) =>
    request(
      `/messages/${conversationId}`
    ),

  sendMessage: (details) =>
    request("/messages", {
      method: "POST",
      body: JSON.stringify(details),
    }),

  // ============================================
  // SETTINGS & PREFERENCES
  // ============================================

  getSettings: () =>
    request("/settings"),

  updateSettings: (settings) =>
    request("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    }),

  changePassword: (passwords) =>
    request(
      "/settings/password",
      {
        method: "PATCH",
        body: JSON.stringify(passwords),
      }
    ),

  // ============================================
  // CLIMATE INTELLIGENCE
  // ============================================

  climateHistory: ({
    city,
    startDate,
    endDate,
  }) =>
    request(
      `/climate/history?city=${encodeURIComponent(
        city
      )}&startDate=${encodeURIComponent(
        startDate
      )}&endDate=${encodeURIComponent(
        endDate
      )}`
    ),

  climateTrends: ({
    city,
    startYear,
    endYear,
  }) =>
    request(
      `/climate/trends?city=${encodeURIComponent(
        city
      )}&startYear=${encodeURIComponent(
        startYear
      )}&endYear=${encodeURIComponent(
        endYear
      )}`
    ),

  fullClimateData: ({
    city,
    startDate,
    endDate,
  }) =>
    request(
      `/climate/full?city=${encodeURIComponent(
        city
      )}&startDate=${encodeURIComponent(
        startDate
      )}&endDate=${encodeURIComponent(
        endDate
      )}`
    ),

  // ============================================
  // GIS & MAP LAYERS
  // ============================================

  weatherMapLayer: (
    layer = "temperature"
  ) =>
    request(
      `/maps/layers/weather?layer=${encodeURIComponent(
        layer
      )}`
    ),

  alertsMapLayer: () =>
    request("/maps/layers/alerts"),

  floodRiskMapLayer: () =>
    request(
      "/maps/layers/flood-risk"
    ),

  cycloneTracks: () =>
    request(
      "/satellite/cyclone-tracks"
    ),

  satelliteLayers: () =>
    request(
      "/satellite/layers"
    ),

  // ============================================
  // VOICE & MULTIMODAL
  // ============================================

  transcribeVoice: ({
    audioBase64,
    mimeType,
    language,
  }) =>
    request(
      "/voice/transcribe",
      {
        method: "POST",
        body: JSON.stringify({
          audioBase64,
          mimeType,
          language,
        }),
      }
    ),

  synthesizeVoice: ({
    text,
    language,
  }) =>
    request(
      "/voice/synthesize",
      {
        method: "POST",
        body: JSON.stringify({
          text,
          language,
        }),
      }
    ),

  // ============================================
  // ADVISORIES
  // ============================================

  cropAdvisory: ({
    crop,
    latitude,
    longitude,
  }) =>
    request(
      `/advisories/crop?crop=${encodeURIComponent(
        crop
      )}&latitude=${encodeURIComponent(
        latitude
      )}&longitude=${encodeURIComponent(
        longitude
      )}`
    ),

  disasterAdvisory: ({
    location,
    latitude,
    longitude,
  }) =>
    request(
      `/advisories/disaster?location=${encodeURIComponent(
        location || ""
      )}&latitude=${encodeURIComponent(
        latitude || ""
      )}&longitude=${encodeURIComponent(
        longitude || ""
      )}`
    ),
};

export default api;