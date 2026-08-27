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

export const CACHE_TTL_MS = {
  WEATHER_CURRENT: 5 * 60 * 1000,    // 5 minutes
  WEATHER_FORECAST: 15 * 60 * 1000,  // 15 minutes
  GEOCODING: 24 * 60 * 60 * 1000      // 24 hours
};

export default {
  ROLES,
  SEVERITY_LEVELS,
  ALERT_TYPES,
  ALERT_STATUSES,
  NOTIFICATION_TYPES,
  CONVERSATION_CATEGORIES,
  UNITS,
  SUPPORTED_LANGUAGES,
  CACHE_TTL_MS
};
