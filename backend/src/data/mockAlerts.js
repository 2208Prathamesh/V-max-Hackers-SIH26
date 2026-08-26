const mockAlerts = [
  {
    _id: 'alert001',

    title: 'Heavy Rain Warning',

    description:
      'Heavy rainfall is expected in Pune during the next few hours. Residents are advised to remain cautious in low-lying areas.',

    type: 'heavy_rain',

    severity: 'high',

    location: 'Pune, Maharashtra, India',

    latitude: 18.5204,

    longitude: 73.8567,

    startTime: new Date('2026-08-26T12:00:00'),

    endTime: new Date('2026-08-26T18:00:00'),

    source: 'WeatherGPT',

    status: 'active',

    createdAt: new Date()
  },

  {
    _id: 'alert002',

    title: 'Thunderstorm Advisory',

    description:
      'Thunderstorms with occasional lightning are possible in Pune. Avoid exposed outdoor areas during thunderstorms.',

    type: 'thunderstorm',

    severity: 'moderate',

    location: 'Pune, Maharashtra, India',

    latitude: 18.5204,

    longitude: 73.8567,

    startTime: new Date('2026-08-26T14:00:00'),

    endTime: new Date('2026-08-26T20:00:00'),

    source: 'WeatherGPT',

    status: 'active',

    createdAt: new Date()
  },

  {
    _id: 'alert003',

    title: 'Strong Wind Advisory',

    description:
      'Strong winds may occur during heavy rainfall. Secure loose outdoor objects.',

    type: 'strong_wind',

    severity: 'low',

    location: 'Pune, Maharashtra, India',

    latitude: 18.5204,

    longitude: 73.8567,

    startTime: new Date('2026-08-26T15:00:00'),

    endTime: new Date('2026-08-26T19:00:00'),

    source: 'WeatherGPT',

    status: 'active',

    createdAt: new Date()
  }
]

export default mockAlerts
