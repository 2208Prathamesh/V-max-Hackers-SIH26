function normalizeForecast (data, source) {
  return {
    source,

    location: {
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone
    },

    current: {
      temperature: data.current?.temperature_2m ?? null,
      humidity: data.current?.relative_humidity_2m ?? null,
      apparentTemperature: data.current?.apparent_temperature ?? null,
      windSpeed: data.current?.wind_speed_10m ?? null,
      windDirection: data.current?.wind_direction_10m ?? null,
      pressure: data.current?.surface_pressure ?? null,
      precipitation: data.current?.precipitation ?? null
    },

    hourly:
      data.hourly?.time.map((time, index) => ({
        time,
        temperature: data.hourly.temperature_2m?.[index] ?? null,
        humidity: data.hourly.relative_humidity_2m?.[index] ?? null,
        precipitation: data.hourly.precipitation?.[index] ?? null,
        precipitationProbability:
          data.hourly.precipitation_probability?.[index] ?? null,
        windSpeed: data.hourly.wind_speed_10m?.[index] ?? null,
        windDirection: data.hourly.wind_direction_10m?.[index] ?? null,
        pressure: data.hourly.surface_pressure?.[index] ?? null
      })) ?? [],

    daily:
      data.daily?.time.map((date, index) => ({
        date,
        maxTemperature: data.daily.temperature_2m_max?.[index] ?? null,
        minTemperature: data.daily.temperature_2m_min?.[index] ?? null,
        precipitation: data.daily.precipitation_sum?.[index] ?? null,
        precipitationProbability:
          data.daily.precipitation_probability_max?.[index] ?? null,
        maxWindSpeed: data.daily.wind_speed_10m_max?.[index] ?? null
      })) ?? []
  }
}

export { normalizeForecast }
