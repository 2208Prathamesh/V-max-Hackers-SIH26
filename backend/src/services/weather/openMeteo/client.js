const BASE_URL = 'https://api.open-meteo.com/v1/forecast'

async function getForecast (latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,

    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,wind_direction_10m,surface_pressure',

    hourly:
      'temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure',

    daily:
      'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',

    forecast_days: '7',
    timezone: 'auto'
  })

  const response = await fetch(`${BASE_URL}?${params}`)

  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status}`)
  }

  return response.json()
}

export { getForecast }
