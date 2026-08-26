const mockWeather = {
  location: {
    name: 'Pune',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    latitude: 18.5204,
    longitude: 73.8567
  },

  current: {
    temperature: 27.5,
    feelsLike: 29.1,
    humidity: 72,
    pressure: 1008,
    windSpeed: 12.4,
    windDirection: 240,
    visibility: 8.5,

    precipitation: 0.8,
    precipitationProbability: 65,

    weatherCode: 61,
    condition: 'Light Rain',

    sunrise: '06:15',
    sunset: '18:52'
  },

  forecast: [
    {
      date: '2026-08-26',

      temperature: {
        min: 23.5,
        max: 28.2
      },

      condition: 'Light Rain',

      precipitationProbability: 70,

      precipitation: 4.2,

      humidity: 74,

      windSpeed: 13.5
    },

    {
      date: '2026-08-27',

      temperature: {
        min: 23.2,
        max: 29.0
      },

      condition: 'Partly Cloudy',

      precipitationProbability: 35,

      precipitation: 1.2,

      humidity: 68,

      windSpeed: 11.2
    },

    {
      date: '2026-08-28',

      temperature: {
        min: 22.8,
        max: 29.5
      },

      condition: 'Cloudy',

      precipitationProbability: 45,

      precipitation: 2.1,

      humidity: 70,

      windSpeed: 10.8
    },

    {
      date: '2026-08-29',

      temperature: {
        min: 23.0,
        max: 30.1
      },

      condition: 'Moderate Rain',

      precipitationProbability: 75,

      precipitation: 8.4,

      humidity: 76,

      windSpeed: 15.1
    },

    {
      date: '2026-08-30',

      temperature: {
        min: 22.7,
        max: 29.3
      },

      condition: 'Light Rain',

      precipitationProbability: 60,

      precipitation: 5.1,

      humidity: 73,

      windSpeed: 12.7
    }
  ],

  hourly: [
    {
      time: '10:00',
      temperature: 26.2,
      condition: 'Cloudy',
      precipitationProbability: 40
    },

    {
      time: '11:00',
      temperature: 27.0,
      condition: 'Cloudy',
      precipitationProbability: 45
    },

    {
      time: '12:00',
      temperature: 27.5,
      condition: 'Light Rain',
      precipitationProbability: 65
    },

    {
      time: '13:00',
      temperature: 27.8,
      condition: 'Light Rain',
      precipitationProbability: 70
    },

    {
      time: '14:00',
      temperature: 28.0,
      condition: 'Light Rain',
      precipitationProbability: 68
    },

    {
      time: '15:00',
      temperature: 27.4,
      condition: 'Rain',
      precipitationProbability: 75
    }
  ],

  airQuality: {
    aqi: 82,
    category: 'Moderate',

    pm2_5: 28.4,
    pm10: 54.7,

    carbonMonoxide: 420,
    nitrogenDioxide: 31.5
  },

  models: {
    ecmwf: {
      temperature: 27.8,
      precipitationProbability: 68,
      condition: 'Light Rain'
    },

    gfs: {
      temperature: 27.3,
      precipitationProbability: 71,
      condition: 'Light Rain'
    }
  },

  source: 'Mock Weather Data',

  updatedAt: new Date()
}

export default mockWeather
