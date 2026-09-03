function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function round(value, digits = 1) {
  return Number(value.toFixed(digits))
}

function dayOfYear(date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0)
  const current = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  )

  return Math.floor((current - start) / 86400000)
}

function buildSeed(latitude, longitude) {
  return Math.abs(latitude) * 17.13 + Math.abs(longitude) * 7.91
}

function computeHourlySnapshot(latitude, longitude, date, modelBias = {}) {
  const latFactor = Math.abs(latitude) / 90
  const tropicalBoost = clamp((30 - Math.abs(latitude)) / 30, 0, 1)
  const monsoonBias = longitude > 65 && longitude < 95 ? 1 : 0
  const seasonalWave = Math.sin(((dayOfYear(date) - 172) / 365) * Math.PI * 2)
  const diurnalWave = Math.sin(((date.getUTCHours() - 6) / 24) * Math.PI * 2)
  const seed = buildSeed(latitude, longitude)

  const baseTemperature =
    27 -
    latFactor * 22 +
    tropicalBoost * 5 +
    seasonalWave * 4 +
    diurnalWave * 4 +
    Math.sin(seed / 9) * 1.2 +
    (modelBias.temperature ?? 0)

  const humidity =
    68 +
    tropicalBoost * 16 -
    seasonalWave * 10 -
    diurnalWave * 8 +
    Math.cos(seed / 11) * 4 +
    (modelBias.humidity ?? 0)

  const cloudCover =
    42 +
    tropicalBoost * 28 +
    monsoonBias * 14 +
    seasonalWave * 12 -
    diurnalWave * 10 +
    Math.sin(seed / 5) * 6

  const precipitationProbability =
    cloudCover * 0.72 +
    tropicalBoost * 18 +
    monsoonBias * 12 +
    Math.max(0, seasonalWave) * 16 +
    (modelBias.precipitationProbability ?? 0)

  const windSpeed =
    9 +
    latFactor * 10 +
    Math.abs(diurnalWave) * 7 +
    Math.abs(Math.sin(seed / 13)) * 5 +
    (modelBias.windSpeed ?? 0)

  const windDirection = (Math.round((seed * 19 + date.getUTCHours() * 23) % 360) + 360) % 360
  const precipitation = Math.max(
    0,
    (precipitationProbability - 50) / 14 +
      Math.max(0, seasonalWave) * 1.6 +
      tropicalBoost * 0.8 +
      (modelBias.precipitation ?? 0)
  )

  const temperature = round(baseTemperature)
  const humidityPct = round(clamp(humidity, 20, 99))
  const cloudPct = round(clamp(cloudCover, 0, 100))
  const rainProbability = round(clamp(precipitationProbability, 0, 100))
  const wind = round(clamp(windSpeed, 2, 42))
  const rain = round(precipitation)
  const apparentTemperature = round(
    temperature + (humidityPct - 55) / 18 - wind / 22
  )
  const pressure = round(1009 + Math.cos(seed / 17) * 6 - seasonalWave * 3)
  const dewPoint = round(temperature - ((100 - humidityPct) / 5))
  const visibility = round(clamp(18000 - cloudPct * 70 - rain * 1200, 2500, 20000), 0)
  const windGust = round(wind + 4 + Math.abs(diurnalWave) * 4)
  const soilTemperature = round(temperature - 1.5 + tropicalBoost * 1.3)
  const soilMoisture = round(clamp(0.16 + rainProbability / 240 + tropicalBoost / 12, 0.08, 0.48), 3)
  const evapotranspiration = round(clamp(1.5 + (temperature - 18) / 8 + wind / 18, 0.8, 7.2), 2)
  const uvIndex = round(clamp(8 - cloudPct / 18 + tropicalBoost * 2 + Math.max(0, diurnalWave) * 3, 0, 11), 1)

  let weatherCode = 0
  if (rain >= 6 || rainProbability >= 85) {
    weatherCode = 95
  } else if (rain >= 2.5 || rainProbability >= 70) {
    weatherCode = 63
  } else if (rain >= 0.5 || rainProbability >= 45) {
    weatherCode = 61
  } else if (cloudPct >= 75) {
    weatherCode = 3
  } else if (cloudPct >= 45) {
    weatherCode = 2
  } else if (cloudPct >= 20) {
    weatherCode = 1
  }

  return {
    temperature,
    humidityPct,
    apparentTemperature,
    rain,
    rainProbability,
    weatherCode,
    cloudPct,
    pressure,
    wind,
    windDirection,
    windGust,
    dewPoint,
    visibility,
    soilTemperature,
    soilMoisture,
    evapotranspiration,
    uvIndex
  }
}

function buildTimezone(longitude) {
  const roundedOffset = Math.round(longitude / 15)
  const sign = roundedOffset >= 0 ? '+' : '-'
  const absolute = String(Math.abs(roundedOffset)).padStart(2, '0')
  return `UTC${sign}${absolute}:00`
}

export function buildOfflineForecastPayload(
  latitude,
  longitude,
  {
    days = 7,
    hours = 48,
    providerName = 'WeatherGPT Offline Forecast',
    modelBias = {}
  } = {}
) {
  const cappedDays = Math.min(Math.max(Number(days) || 7, 1), 16)
  const totalHours = Math.min(Math.max(Number(hours) || 48, cappedDays * 24), 168)
  const now = new Date()
  const hourlyDates = Array.from({ length: totalHours }, (_, index) => {
    const date = new Date(now)
    date.setUTCHours(now.getUTCHours() + index, 0, 0, 0)
    return date
  })

  const hourlySnapshots = hourlyDates.map(date =>
    computeHourlySnapshot(latitude, longitude, date, modelBias)
  )

  const dailyDates = Array.from({ length: cappedDays }, (_, index) => {
    const date = new Date(now)
    date.setUTCHours(0, 0, 0, 0)
    date.setUTCDate(now.getUTCDate() + index)
    return date
  })

  const dailySlices = dailyDates.map((date, dayIndex) => {
    const start = dayIndex * 24
    const hoursForDay = hourlySnapshots.slice(start, start + 24)
    return {
      date,
      hoursForDay
    }
  })

  const current = hourlySnapshots[0]

  return {
    latitude,
    longitude,
    timezone: buildTimezone(longitude),
    current: {
      temperature_2m: current.temperature,
      relative_humidity_2m: current.humidityPct,
      apparent_temperature: current.apparentTemperature,
      precipitation: current.rain,
      rain: current.rain,
      showers: current.rain,
      weather_code: current.weatherCode,
      cloud_cover: current.cloudPct,
      surface_pressure: current.pressure,
      wind_speed_10m: current.wind,
      wind_direction_10m: current.windDirection,
      wind_gusts_10m: current.windGust
    },
    hourly: {
      time: hourlyDates.map(date => date.toISOString()),
      temperature_2m: hourlySnapshots.map(item => item.temperature),
      relative_humidity_2m: hourlySnapshots.map(item => item.humidityPct),
      dew_point_2m: hourlySnapshots.map(item => item.dewPoint),
      apparent_temperature: hourlySnapshots.map(item => item.apparentTemperature),
      precipitation_probability: hourlySnapshots.map(item => item.rainProbability),
      precipitation: hourlySnapshots.map(item => item.rain),
      rain: hourlySnapshots.map(item => item.rain),
      weather_code: hourlySnapshots.map(item => item.weatherCode),
      surface_pressure: hourlySnapshots.map(item => item.pressure),
      cloud_cover: hourlySnapshots.map(item => item.cloudPct),
      visibility: hourlySnapshots.map(item => item.visibility),
      wind_speed_10m: hourlySnapshots.map(item => item.wind),
      wind_direction_10m: hourlySnapshots.map(item => item.windDirection),
      wind_gusts_10m: hourlySnapshots.map(item => item.windGust),
      soil_temperature_0cm: hourlySnapshots.map(item => item.soilTemperature),
      soil_temperature_6cm: hourlySnapshots.map(item => round(item.soilTemperature - 0.7)),
      soil_moisture_0_to_1cm: hourlySnapshots.map(item => item.soilMoisture),
      soil_moisture_1_to_3cm: hourlySnapshots.map(item => round(clamp(item.soilMoisture + 0.03, 0.1, 0.52), 3)),
      uv_index: hourlySnapshots.map(item => item.uvIndex),
      et0_fao_evapotranspiration: hourlySnapshots.map(item => item.evapotranspiration)
    },
    daily: {
      time: dailyDates.map(date => date.toISOString().slice(0, 10)),
      weather_code: dailySlices.map(({ hoursForDay }) =>
        hoursForDay.reduce(
          (selected, item) => (item.rainProbability > selected.rainProbability ? item : selected),
          hoursForDay[0]
        ).weatherCode
      ),
      temperature_2m_max: dailySlices.map(({ hoursForDay }) =>
        round(Math.max(...hoursForDay.map(item => item.temperature)))
      ),
      temperature_2m_min: dailySlices.map(({ hoursForDay }) =>
        round(Math.min(...hoursForDay.map(item => item.temperature)))
      ),
      apparent_temperature_max: dailySlices.map(({ hoursForDay }) =>
        round(Math.max(...hoursForDay.map(item => item.apparentTemperature)))
      ),
      apparent_temperature_min: dailySlices.map(({ hoursForDay }) =>
        round(Math.min(...hoursForDay.map(item => item.apparentTemperature)))
      ),
      sunrise: dailyDates.map(date => {
        const sunrise = new Date(date)
        sunrise.setUTCHours(0, 45, 0, 0)
        return sunrise.toISOString()
      }),
      sunset: dailyDates.map(date => {
        const sunset = new Date(date)
        sunset.setUTCHours(12, 30, 0, 0)
        return sunset.toISOString()
      }),
      uv_index_max: dailySlices.map(({ hoursForDay }) =>
        round(Math.max(...hoursForDay.map(item => item.uvIndex)), 1)
      ),
      precipitation_sum: dailySlices.map(({ hoursForDay }) =>
        round(hoursForDay.reduce((total, item) => total + item.rain, 0), 1)
      ),
      rain_sum: dailySlices.map(({ hoursForDay }) =>
        round(hoursForDay.reduce((total, item) => total + item.rain, 0), 1)
      ),
      showers_sum: dailySlices.map(({ hoursForDay }) =>
        round(hoursForDay.reduce((total, item) => total + item.rain, 0), 1)
      ),
      precipitation_probability_max: dailySlices.map(({ hoursForDay }) =>
        round(Math.max(...hoursForDay.map(item => item.rainProbability)))
      ),
      wind_speed_10m_max: dailySlices.map(({ hoursForDay }) =>
        round(Math.max(...hoursForDay.map(item => item.wind)))
      ),
      wind_gusts_10m_max: dailySlices.map(({ hoursForDay }) =>
        round(Math.max(...hoursForDay.map(item => item.windGust)))
      ),
      wind_direction_10m_dominant: dailySlices.map(({ hoursForDay }) =>
        hoursForDay[Math.floor(hoursForDay.length / 2)].windDirection
      ),
      et0_fao_evapotranspiration: dailySlices.map(({ hoursForDay }) =>
        round(hoursForDay.reduce((total, item) => total + item.evapotranspiration, 0), 2)
      )
    },
    meta: {
      source: providerName,
      sourceType: 'offline_estimate',
      isFallback: true,
      retrievedAt: now.toISOString()
    }
  }
}

export function buildOfflineAncillaryData(latitude, longitude) {
  const absLat = Math.abs(latitude)
  const absLon = Math.abs(longitude)

  return {
    airQuality: {
      source: 'WeatherGPT Offline Air Quality Estimate',
      sourceType: 'offline_estimate',
      isFallback: true,
      current: {
        usAqi: Math.round(clamp(42 + absLat * 0.8 + Math.sin(absLon / 9) * 14, 18, 145)),
        pm10: round(clamp(28 + absLat * 0.6 + Math.cos(absLon / 7) * 9, 10, 120)),
        pm2_5: round(clamp(16 + absLat * 0.45 + Math.sin(absLon / 6) * 7, 6, 90))
      }
    },
    elevation: {
      source: 'WeatherGPT Offline Elevation Estimate',
      sourceType: 'offline_estimate',
      isFallback: true,
      elevation: Math.round(clamp(Math.abs(Math.sin(latitude / 8) * 650 + Math.cos(longitude / 12) * 220), 0, 2800))
    },
    flood: {
      source: 'WeatherGPT Offline Flood Risk Estimate',
      sourceType: 'offline_estimate',
      isFallback: true,
      current: {
        riskLevel: absLat < 24 && longitude > 68 && longitude < 96 ? 'moderate' : 'low',
        advisory:
          absLat < 24 && longitude > 68 && longitude < 96
            ? 'Localized waterlogging is possible if heavy rain persists.'
            : 'No elevated inland flood risk detected from fallback estimation.'
      }
    },
    marine: {
      source: 'WeatherGPT Offline Marine Estimate',
      sourceType: 'offline_estimate',
      isFallback: true,
      current: {
        waveHeightMeters: round(clamp(0.6 + Math.abs(Math.sin(longitude / 15)) * 1.8, 0.4, 3.4)),
        seaSurfaceTemperatureC: round(clamp(26 - absLat / 5 + Math.cos(longitude / 10), -1, 31))
      }
    }
  }
}

export default {
  buildOfflineForecastPayload,
  buildOfflineAncillaryData
}
