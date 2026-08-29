/**
 * Application-wide constants, enums, and defaults
 */

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  ANALYST: 'analyst'
};

export const SEVERITY_LEVELS = {
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high',
  EXTREME: 'extreme'
};

export const IMD_WARNING_LEVELS = {
  RED: {
    color: 'Red',
    action: 'Take Action',
    severity: 'extreme',
    description: 'Extremely heavy rainfall, severe cyclonic storm, or severe heatwave. Immediate protective action required.'
  },
  ORANGE: {
    color: 'Orange',
    action: 'Be Prepared',
    severity: 'high',
    description: 'Very heavy rainfall, thunderstorm, or heatwave. Prepare for potential disruptions.'
  },
  YELLOW: {
    color: 'Yellow',
    action: 'Be Updated',
    severity: 'moderate',
    description: 'Moderate to heavy rain or wind. Keep track of latest weather updates.'
  },
  GREEN: {
    color: 'Green',
    action: 'No Warning',
    severity: 'low',
    description: 'No hazardous weather expected.'
  }
};

export const ALERT_TYPES = [
  'rain',
  'thunderstorm',
  'cyclone',
  'flood',
  'heatwave',
  'coldwave',
  'strong_wind',
  'fog',
  'drought',
  'lightning',
  'other'
];

export const ALERT_STATUSES = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};

export const CROPS = [
  'cotton',
  'rice',
  'wheat',
  'sugarcane',
  'soybean',
  'maize',
  'groundnut',
  'pulses',
  'tomato',
  'onion',
  'general'
];

export const NOTIFICATION_TYPES = [
  'weather_alert',
  'forecast',
  'system',
  'reminder',
  'general'
];

export const CONVERSATION_CATEGORIES = [
  'weather',
  'forecast',
  'alerts',
  'climate',
  'travel',
  'agriculture',
  'general'
];

export const UNITS = {
  TEMPERATURE: ['C', 'F'],
  WIND: ['km/h', 'm/s', 'mph', 'knots'],
  PRESSURE: ['hPa', 'mb', 'inHg', 'mmHg'],
  PRECIPITATION: ['mm', 'in']
};

export const SUPPORTED_LANGUAGES = [
  'en', 'hi', 'mr', 'bn', 'ta', 'te', 'gu', 'kn', 'ml', 'pa'
];

export const MAP_LAYERS = {
  TEMPERATURE: 'temperature',
  PRECIPITATION: 'precipitation',
  WIND: 'wind',
  CLOUDS: 'clouds',
  ALERTS: 'alerts',
  FLOOD_RISK: 'flood_risk',
  SATELLITE: 'satellite'
};

export const CACHE_TTL_MS = {
  WEATHER_CURRENT: 5 * 60 * 1000,    // 5 minutes
  WEATHER_FORECAST: 15 * 60 * 1000,  // 15 minutes
  GEOCODING: 24 * 60 * 60 * 1000,     // 24 hours
  CLIMATE_HISTORY: 60 * 60 * 1000,   // 1 hour
  IMD_WARNINGS: 10 * 60 * 1000       // 10 minutes
};

export default {
  ROLES,
  SEVERITY_LEVELS,
  IMD_WARNING_LEVELS,
  ALERT_TYPES,
  ALERT_STATUSES,
  CROPS,
  NOTIFICATION_TYPES,
  CONVERSATION_CATEGORIES,
  UNITS,
  SUPPORTED_LANGUAGES,
  MAP_LAYERS,
  CACHE_TTL_MS
};
