function round(value, digits = 1) {
  return Number(value.toFixed(digits))
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function enumerateDates(startDate, endDate) {
  const dates = []
  const cursor = new Date(`${startDate}T00:00:00.000Z`)
  const end = new Date(`${endDate}T00:00:00.000Z`)

  while (cursor <= end) {
    dates.push(new Date(cursor))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return dates
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

export function buildOfflineHistoricalArchive(latitude, longitude, startDate, endDate) {
  const dates = enumerateDates(startDate, endDate)
  const absLat = Math.abs(Number(latitude))
  const monsoonZone = longitude > 68 && longitude < 96 ? 1 : 0

  const daily = dates.map(date => {
    const seasonal = Math.sin(((dayOfYear(date) - 172) / 365) * Math.PI * 2)
    const interannual = (date.getUTCFullYear() - 2020) * 0.08
    const base = 26 - absLat / 6 + seasonal * 6 + interannual
    const humidity = 58 + monsoonZone * 10 + Math.max(0, seasonal) * 16
    const rain = clamp(
      monsoonZone * Math.max(0, seasonal) * 10 +
        Math.max(0, Math.sin((dayOfYear(date) + longitude) / 12)) * 6,
      0,
      85
    )

    return {
      date: date.toISOString().slice(0, 10),
      temperatureMean: round(base, 2),
      temperatureMax: round(base + 4 + humidity / 45, 2),
      temperatureMin: round(base - 5 + seasonal / 2, 2),
      precipitation: round(rain, 1),
      rain: round(rain * 0.92, 1),
      windMax: round(clamp(10 + absLat / 8 + Math.abs(seasonal) * 12, 4, 38), 1)
    }
  })

  return {
    latitude,
    longitude,
    source: 'WeatherGPT Offline Climate Archive',
    sourceType: 'offline_estimate',
    isFallback: true,
    daily: {
      time: daily.map(item => item.date),
      temperature_2m_max: daily.map(item => item.temperatureMax),
      temperature_2m_min: daily.map(item => item.temperatureMin),
      temperature_2m_mean: daily.map(item => item.temperatureMean),
      precipitation_sum: daily.map(item => item.precipitation),
      rain_sum: daily.map(item => item.rain),
      wind_speed_10m_max: daily.map(item => item.windMax)
    }
  }
}

export default {
  buildOfflineHistoricalArchive
}
