const WEATHER_CODE_DESCRIPTIONS = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Light rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Light snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Severe thunderstorm with hail'
}

function describeWeather(weatherCode) {
  return WEATHER_CODE_DESCRIPTIONS[weatherCode] || 'Weather data available'
}

function normalizeForecast (data, source) {
  const metadata = data?.meta || {}

  return {
    source: metadata.source || source,
    sourceType: metadata.sourceType || 'provider',
    isFallback: metadata.isFallback || false,
    retrievedAt: metadata.retrievedAt || new Date().toISOString(),

    location: {
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone
    },

    current: {
      temperature: data.current?.temperature_2m ?? null,
      humidity: data.current?.relative_humidity_2m ?? null,
      apparentTemperature: data.current?.apparent_temperature ?? null,
      dewPoint: data.current?.dew_point_2m ?? null,
      windSpeed: data.current?.wind_speed_10m ?? null,
      windDirection: data.current?.wind_direction_10m ?? null,
      windGust: data.current?.wind_gusts_10m ?? null,
      pressure: data.current?.surface_pressure ?? null,
      precipitation: data.current?.precipitation ?? null,
      isDay: data.current?.is_day ?? null,
      is_day: data.current?.is_day ?? null,
      visibility: data.current?.visibility ?? data.hourly?.visibility?.[0] ?? null,
      uvIndex: data.current?.uv_index ?? data.hourly?.uv_index?.[0] ?? null,
      weatherCode: data.current?.weather_code ?? null,
      weatherDescription: describeWeather(data.current?.weather_code),
      condition: describeWeather(data.current?.weather_code),
      cloudCover: data.current?.cloud_cover ?? null
    },

    hourly:
      data.hourly?.time.map((time, index) => ({
        time,
        temperature: data.hourly.temperature_2m?.[index] ?? null,
        humidity: data.hourly.relative_humidity_2m?.[index] ?? null,
        dewPoint: data.hourly.dew_point_2m?.[index] ?? null,
        apparentTemperature: data.hourly.apparent_temperature?.[index] ?? null,
        precipitation: data.hourly.precipitation?.[index] ?? null,
        precipitationProbability:
          data.hourly.precipitation_probability?.[index] ?? null,
        rain: data.hourly.rain?.[index] ?? null,
        weatherCode: data.hourly.weather_code?.[index] ?? null,
        weatherDescription: describeWeather(data.hourly.weather_code?.[index]),
        windSpeed: data.hourly.wind_speed_10m?.[index] ?? null,
        windDirection: data.hourly.wind_direction_10m?.[index] ?? null,
        windGust: data.hourly.wind_gusts_10m?.[index] ?? null,
        pressure: data.hourly.surface_pressure?.[index] ?? null,
        cloudCover: data.hourly.cloud_cover?.[index] ?? null,
        visibility: data.hourly.visibility?.[index] ?? null,
        soil_temperature_0cm: data.hourly.soil_temperature_0cm?.[index] ?? null,
        soil_temperature_6cm: data.hourly.soil_temperature_6cm?.[index] ?? null,
        soilTemperature: data.hourly.soil_temperature_0cm?.[index] ?? null,
        soil_moisture_0_to_1cm: data.hourly.soil_moisture_0_to_1cm?.[index] ?? null,
        soil_moisture_1_to_3cm: data.hourly.soil_moisture_1_to_3cm?.[index] ?? null,
        soilMoisture: data.hourly.soil_moisture_0_to_1cm?.[index] ?? null,
        uvIndex: data.hourly.uv_index?.[index] ?? null,
        et0_fao_evapotranspiration:
          data.hourly.et0_fao_evapotranspiration?.[index] ?? null
      })) ?? [],

    daily:
      data.daily?.time.map((date, index) => ({
        date,
        maxTemperature: data.daily.temperature_2m_max?.[index] ?? null,
        minTemperature: data.daily.temperature_2m_min?.[index] ?? null,
        apparentTemperatureMax:
          data.daily.apparent_temperature_max?.[index] ?? null,
        apparentTemperatureMin:
          data.daily.apparent_temperature_min?.[index] ?? null,
        precipitation: data.daily.precipitation_sum?.[index] ?? null,
        precipitationSum: data.daily.precipitation_sum?.[index] ?? null,
        rainSum: data.daily.rain_sum?.[index] ?? null,
        precipitationProbability:
          data.daily.precipitation_probability_max?.[index] ?? null,
        maxWindSpeed: data.daily.wind_speed_10m_max?.[index] ?? null,
        windGust: data.daily.wind_gusts_10m_max?.[index] ?? null,
        weatherCode: data.daily.weather_code?.[index] ?? null,
        weatherDescription: describeWeather(data.daily.weather_code?.[index]),
        condition: describeWeather(data.daily.weather_code?.[index]),
        sunrise: data.daily.sunrise?.[index] ?? null,
        sunset: data.daily.sunset?.[index] ?? null,
        uvIndexMax: data.daily.uv_index_max?.[index] ?? null,
        evapotranspiration:
          data.daily.et0_fao_evapotranspiration?.[index] ?? null
      })) ?? []
  }
}

export { normalizeForecast }
