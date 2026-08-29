import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeForecast } from '../../backend/src/services/weather/normalizers/weatherNormalizer.js'

describe('Unit: Weather Normalizer Tests', () => {
  const sampleRawOpenMeteo = {
    latitude: 18.52,
    longitude: 73.85,
    timezone: 'Asia/Kolkata',
    current: {
      temperature_2m: 28.4,
      relative_humidity_2m: 65,
      apparent_temperature: 30.1,
      wind_speed_10m: 14.2,
      wind_direction_10m: 230,
      surface_pressure: 1009.2,
      precipitation: 0.2
    },
    hourly: {
      time: ['2026-08-27T00:00', '2026-08-27T01:00'],
      temperature_2m: [25.1, 24.8],
      relative_humidity_2m: [75, 78],
      precipitation: [0, 0],
      precipitation_probability: [10, 15],
      wind_speed_10m: [10.2, 9.8],
      wind_direction_10m: [220, 225],
      surface_pressure: [1008, 1008]
    },
    daily: {
      time: ['2026-08-27'],
      temperature_2m_max: [30.5],
      temperature_2m_min: [22.4],
      precipitation_sum: [1.5],
      precipitation_probability_max: [60],
      wind_speed_10m_max: [16.8]
    }
  }

  test('normalizeForecast should structure current weather correctly', () => {
    const normalized = normalizeForecast(sampleRawOpenMeteo, 'Open-Meteo')
    assert.equal(normalized.source, 'Open-Meteo')
    assert.equal(normalized.location.latitude, 18.52)
    assert.equal(normalized.location.longitude, 73.85)
    assert.equal(normalized.current.temperature, 28.4)
    assert.equal(normalized.current.humidity, 65)
    assert.equal(normalized.current.apparentTemperature, 30.1)
    assert.equal(normalized.current.windSpeed, 14.2)
  })

  test('normalizeForecast should transform hourly arrays to array of objects', () => {
    const normalized = normalizeForecast(sampleRawOpenMeteo, 'Open-Meteo')
    assert.equal(Array.isArray(normalized.hourly), true)
    assert.equal(normalized.hourly.length, 2)
    assert.equal(normalized.hourly[0].temperature, 25.1)
    assert.equal(normalized.hourly[0].precipitationProbability, 10)
  })

  test('normalizeForecast should transform daily forecast arrays correctly', () => {
    const normalized = normalizeForecast(sampleRawOpenMeteo, 'Open-Meteo')
    assert.equal(Array.isArray(normalized.daily), true)
    assert.equal(normalized.daily.length, 1)
    assert.equal(normalized.daily[0].maxTemperature, 30.5)
    assert.equal(normalized.daily[0].minTemperature, 22.4)
    assert.equal(normalized.daily[0].precipitationProbability, 60)
  })

  test('normalizeForecast should handle missing/null fields gracefully', () => {
    const normalized = normalizeForecast({}, 'Unknown')
    assert.equal(normalized.source, 'Unknown')
    assert.equal(normalized.current.temperature, null)
    assert.deepEqual(normalized.hourly, [])
    assert.deepEqual(normalized.daily, [])
  })
})
