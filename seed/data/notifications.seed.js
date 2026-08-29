/**
 * Notifications seed dataset
 */
export const notificationsSeedData = [
  {
    type: 'weather_alert',
    title: 'Flash Flood Warning for Pune',
    message: 'Heavy precipitation predicted over the next 12 hours. Travel with caution.',
    isRead: false
  },
  {
    type: 'forecast',
    title: 'Daily Morning Forecast',
    message: 'Today will be partly cloudy with light evening showers and a high of 29°C.',
    isRead: true
  },
  {
    type: 'system',
    title: 'Welcome to WeatherGPT',
    message: 'Explore multi-model numerical weather forecasts (ECMWF, GFS, Open-Meteo) and AI weather insights.',
    isRead: true
  }
]
