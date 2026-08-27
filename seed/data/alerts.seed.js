/**
 * Weather Alerts seed dataset covering diverse severities and types
 */
export const alertsSeedData = [
  {
    title: 'Heavy Rain & Flash Flood Warning',
    description:
      'Heavy to very heavy rainfall expected across Pune district. Low-lying areas may experience waterlogging.',
    type: 'rain',
    severity: 'high',
    location: 'Pune, Maharashtra, India',
    latitude: 18.5204,
    longitude: 73.8567,
    startTime: new Date(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    source: 'WeatherGPT Early Warning System',
    status: 'active'
  },
  {
    title: 'Severe Thunderstorm & Lightning Advisory',
    description:
      'Gusty winds up to 60 km/h with frequent cloud-to-ground lightning anticipated during evening hours.',
    type: 'thunderstorm',
    severity: 'moderate',
    location: 'Mumbai, Maharashtra, India',
    latitude: 19.076,
    longitude: 72.8777,
    startTime: new Date(),
    endTime: new Date(Date.now() + 18 * 60 * 60 * 1000),
    source: 'WeatherGPT Alert Radar',
    status: 'active'
  },
  {
    title: 'Severe Heatwave Alert',
    description:
      'Maximum daytime temperatures likely to exceed 43°C. Stay hydrated and avoid prolonged sun exposure.',
    type: 'heatwave',
    severity: 'extreme',
    location: 'New Delhi, Delhi, India',
    latitude: 28.6139,
    longitude: 77.209,
    startTime: new Date(),
    endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
    source: 'WeatherGPT National Weather Monitoring',
    status: 'active'
  },
  {
    title: 'Coastal High Swell & Gale Wind Advisory',
    description:
      'High waves and squally winds expected along the western coastline. Fishermen advised not to venture into deep sea.',
    type: 'strong_wind',
    severity: 'moderate',
    location: 'Goa, India',
    latitude: 15.2993,
    longitude: 74.124,
    startTime: new Date(),
    endTime: new Date(Date.now() + 36 * 60 * 60 * 1000),
    source: 'WeatherGPT Marine Services',
    status: 'active'
  }
]
