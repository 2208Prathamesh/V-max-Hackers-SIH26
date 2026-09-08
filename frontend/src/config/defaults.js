/**
 * Frontend structural defaults — used ONLY as initial state before API data loads.
 * These contain NO demo/fake data — just empty arrays and safe unit defaults.
 */

export const DEFAULT_SETTINGS = {
  timeZone: '(UTC+05:30) Asia/Kolkata',
  units: {
    temperature: 'C',
    windSpeed: 'kmh',
    pressure: 'hPa',
    precipitation: 'mm'
  },
  notifications: {
    weatherAlerts: true,
    dailyForecast: true,
    weeklySummary: false,
    breakingNews: true
  },
  language: 'en'
};

export const DEFAULT_USER_STATS = {
  conversations: 0,
  thisWeek: 0,
  thisMonth: 0,
  totalMessages: 0,
  storageUsedPercent: 0,
  locationsSaved: 0
};
