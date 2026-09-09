import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizeTimestamp,
  normalizeDate,
  areLocationsCompatible,
  reconcileHourlyPoints,
  reconcileDailyPoints,
  reconcileCurrentConditions,
  computeCacheStatus,
  mergeForecastData
} from '../../backend/src/services/weather/cache/forecastReconciler.js'

describe('Unit: Forecast Reconciler Tests', () => {
  const baseFetchedAt = '2026-09-09T08:00:00.000Z'
  const newFetchedAt = '2026-09-09T10:00:00.000Z'

  test('demonstrates exact required merge behavior: 10:00 A, 11:00 B, 12:00 C, 13:00 D merged with 10:00 X, 11:00 Y, 13:00 Z', () => {
    const oldHourly = [
      {
        time: '2026-09-09T10:00:00.000Z',
        temperature: 20,
        source: 'GFS',
        fetchedAt: baseFetchedAt
      },
      {
        time: '2026-09-09T11:00:00.000Z',
        temperature: 21,
        source: 'GFS',
        fetchedAt: baseFetchedAt
      },
      {
        time: '2026-09-09T12:00:00.000Z',
        temperature: 22,
        source: 'GFS',
        fetchedAt: baseFetchedAt
      },
      {
        time: '2026-09-09T13:00:00.000Z',
        temperature: 23,
        source: 'GFS',
        fetchedAt: baseFetchedAt
      }
    ]

    const newHourly = [
      {
        time: '2026-09-09T10:00:00.000Z',
        temperature: 25,
        source: 'Open-Meteo',
        fetchedAt: newFetchedAt
      },
      {
        time: '2026-09-09T11:00:00.000Z',
        temperature: 26,
        source: 'Open-Meteo',
        fetchedAt: newFetchedAt
      },
      {
        time: '2026-09-09T13:00:00.000Z',
        temperature: 27,
        source: 'Open-Meteo',
        fetchedAt: newFetchedAt
      }
    ]

    const { hourly, stats } = reconcileHourlyPoints(oldHourly, newHourly, {
      newSource: 'Open-Meteo',
      oldSource: 'GFS',
      nowIso: newFetchedAt
    })

    assert.equal(hourly.length, 4)

    // 10:00 -> NEW (25°C, fresh)
    assert.equal(hourly[0].temperature, 25)
    assert.equal(hourly[0].isStale, false)
    assert.equal(hourly[0].source, 'Open-Meteo')

    // 11:00 -> NEW (26°C, fresh)
    assert.equal(hourly[1].temperature, 26)
    assert.equal(hourly[1].isStale, false)
    assert.equal(hourly[1].source, 'Open-Meteo')

    // 12:00 -> OLD / STALE (22°C, preserved as stale)
    assert.equal(hourly[2].temperature, 22)
    assert.equal(hourly[2].isStale, true)
    assert.equal(hourly[2].source, 'GFS')
    assert.equal(hourly[2].fetchedAt, baseFetchedAt)

    // 13:00 -> NEW (27°C, fresh)
    assert.equal(hourly[3].temperature, 27)
    assert.equal(hourly[3].isStale, false)
    assert.equal(hourly[3].source, 'Open-Meteo')

    // Composite status should be mixed
    assert.equal(stats.fresh, 3)
    assert.equal(stats.stale, 1)
    assert.equal(computeCacheStatus(stats), 'mixed')
  })

  test('demonstrates field-level gap filling when new point has null metrics', () => {
    const oldHourly = [
      {
        time: '2026-09-09T10:00:00.000Z',
        temperature: 28,
        humidity: 75,
        precipitationProbability: 55,
        windSpeed: 12,
        source: 'ECMWF',
        fetchedAt: baseFetchedAt
      }
    ]

    const newHourly = [
      {
        time: '2026-09-09T10:00:00.000Z',
        temperature: 29,
        humidity: null, // missing in new provider response
        precipitationProbability: 60,
        windSpeed: null, // missing in new provider response
        source: 'Open-Meteo',
        fetchedAt: newFetchedAt
      }
    ]

    const { hourly, stats } = reconcileHourlyPoints(oldHourly, newHourly, {
      newSource: 'Open-Meteo',
      oldSource: 'ECMWF',
      nowIso: newFetchedAt
    })

    assert.equal(hourly.length, 1)
    const pt = hourly[0]

    // Temperature from NEW
    assert.equal(pt.temperature, 29)
    // PrecipitationProbability from NEW
    assert.equal(pt.precipitationProbability, 60)
    // Humidity filled from OLD
    assert.equal(pt.humidity, 75)
    // WindSpeed filled from OLD
    assert.equal(pt.windSpeed, 12)

    // Field-level provenance tracked
    assert.equal(pt.isPartiallyStale, true)
    assert.ok(pt.fieldProvenance.humidity)
    assert.equal(pt.fieldProvenance.humidity.source, 'ECMWF')
    assert.equal(pt.fieldProvenance.humidity.isStale, true)
    assert.ok(pt.fieldProvenance.windSpeed)

    assert.equal(stats.mixedPoints, 1)
    assert.equal(computeCacheStatus(stats), 'mixed')
  })

  test('normalizes timestamps in differing string representations to the same bucket', () => {
    const oldHourly = [
      {
        time: '2026-09-09T10:00',
        temperature: 24,
        source: 'GFS',
        fetchedAt: baseFetchedAt
      }
    ]
    const newHourly = [
      {
        time: '2026-09-09T10:00:00.000Z',
        temperature: 26,
        source: 'Open-Meteo',
        fetchedAt: newFetchedAt
      }
    ]

    const { hourly } = reconcileHourlyPoints(oldHourly, newHourly, {
      newSource: 'Open-Meteo',
      nowIso: newFetchedAt
    })

    assert.equal(hourly.length, 1)
    assert.equal(hourly[0].temperature, 26)
    assert.equal(hourly[0].isStale, false)
  })

  test('safety boundary: discards retained points exceeding maximum usable stale age', () => {
    // 72 hours ago
    const ancientFetchedAt = new Date(
      Date.now() - 72 * 3600 * 1000
    ).toISOString()
    const oldHourly = [
      {
        time: '2026-09-09T12:00:00.000Z',
        temperature: 22,
        source: 'GFS',
        fetchedAt: ancientFetchedAt
      }
    ]
    const newHourly = [
      {
        time: '2026-09-09T10:00:00.000Z',
        temperature: 25,
        source: 'Open-Meteo',
        fetchedAt: newFetchedAt
      }
    ]

    // Max stale age is 48 hours
    const { hourly, stats } = reconcileHourlyPoints(oldHourly, newHourly, {
      newSource: 'Open-Meteo',
      oldSource: 'GFS',
      nowIso: newFetchedAt,
      maxStaleAgeMs: 48 * 3600 * 1000
    })

    // The ancient point must be discarded, not merged!
    assert.equal(hourly.length, 1)
    assert.equal(hourly[0].temperature, 25)
    assert.equal(stats.stale, 0)
    assert.equal(computeCacheStatus(stats), 'fresh')
  })

  test('safety boundary: rejects merge if old and new locations are incompatible', () => {
    const oldForecast = {
      location: { latitude: 18.52, longitude: 73.85 }, // Pune
      source: 'GFS',
      forecast: {
        hourly: [{ time: '2026-09-09T12:00:00.000Z', temperature: 22 }]
      }
    }
    const newForecast = {
      location: { latitude: 28.61, longitude: 77.2 }, // Delhi (~1200km away)
      source: 'Open-Meteo',
      forecast: {
        hourly: [{ time: '2026-09-09T10:00:00.000Z', temperature: 35 }]
      }
    }

    const merged = mergeForecastData(oldForecast, newForecast, {
      nowIso: newFetchedAt
    })

    // Should NOT merge points across different locations!
    assert.equal(merged.forecast.hourly.length, 1)
    assert.equal(merged.forecast.hourly[0].temperature, 35)
    assert.equal(merged.cache.cacheStatus, 'fresh')
  })

  test('reconciles daily forecast points and preserves date keys', () => {
    const oldDaily = [
      {
        date: '2026-09-09',
        maxTemperature: 30,
        minTemperature: 22,
        source: 'GFS',
        fetchedAt: baseFetchedAt
      },
      {
        date: '2026-09-10',
        maxTemperature: 31,
        minTemperature: 23,
        source: 'GFS',
        fetchedAt: baseFetchedAt
      }
    ]
    const newDaily = [
      {
        date: '2026-09-09',
        maxTemperature: 29,
        minTemperature: 21,
        source: 'Open-Meteo',
        fetchedAt: newFetchedAt
      },
      {
        date: '2026-09-11',
        maxTemperature: 32,
        minTemperature: 24,
        source: 'Open-Meteo',
        fetchedAt: newFetchedAt
      }
    ]

    const { daily, stats } = reconcileDailyPoints(oldDaily, newDaily, {
      newSource: 'Open-Meteo',
      oldSource: 'GFS',
      nowIso: newFetchedAt
    })

    assert.equal(daily.length, 3)
    // 2026-09-09 -> NEW
    assert.equal(daily[0].date, '2026-09-09')
    assert.equal(daily[0].maxTemperature, 29)
    assert.equal(daily[0].isStale, false)
    // 2026-09-10 -> OLD gap-filled
    assert.equal(daily[1].date, '2026-09-10')
    assert.equal(daily[1].maxTemperature, 31)
    assert.equal(daily[1].isStale, true)
    // 2026-09-11 -> NEW
    assert.equal(daily[2].date, '2026-09-11')
    assert.equal(daily[2].maxTemperature, 32)
    assert.equal(daily[2].isStale, false)

    assert.equal(stats.fresh, 2)
    assert.equal(stats.stale, 1)
  })

  test('reconcileCurrentConditions fills null fields from old condition', () => {
    const oldCurrent = {
      temperature: 28,
      humidity: 70,
      pressure: 1010,
      visibility: 8000
    }
    const newCurrent = {
      temperature: 29,
      humidity: 68,
      pressure: 1009,
      visibility: null // missing
    }

    const merged = reconcileCurrentConditions(oldCurrent, newCurrent)
    assert.equal(merged.temperature, 29)
    assert.equal(merged.humidity, 68)
    assert.equal(merged.visibility, 8000) // filled from old
    assert.equal(merged.isStale, false)
  })

  test('computeCacheStatus correctly identifies fresh, mixed, and stale states', () => {
    assert.equal(
      computeCacheStatus({ fresh: 10, stale: 0, mixedPoints: 0, total: 10 }),
      'fresh'
    )
    assert.equal(
      computeCacheStatus({ fresh: 0, stale: 5, mixedPoints: 0, total: 5 }),
      'stale'
    )
    assert.equal(
      computeCacheStatus({ fresh: 5, stale: 2, mixedPoints: 0, total: 7 }),
      'mixed'
    )
    assert.equal(
      computeCacheStatus({ fresh: 5, stale: 0, mixedPoints: 1, total: 6 }),
      'mixed'
    )
    assert.equal(computeCacheStatus({ total: 0 }), 'empty')
  })
})
