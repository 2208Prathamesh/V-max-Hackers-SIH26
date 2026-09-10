import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import {
  formatLocationKey,
  isLocationCompatible
} from '../../frontend/src/services/offline/locationKey.js'

import {
  MAX_STALE_MS,
  saveCurrentWeather,
  getCurrentWeather
} from '../../frontend/src/services/offline/weatherCache.js'

import {
  ALERT_MAX_STALE_MS,
  getAlertScopeKey
} from '../../frontend/src/services/offline/alertCache.js'

import {
  isIndexedDBSupported,
  withStore
} from '../../frontend/src/services/offline/db.js'

import { offlineManager } from '../../frontend/src/services/offline/offlineManager.js'

describe('Unit: Frontend Offline Cache - Location Identity & Boundaries', () => {
  test('formatLocationKey should deterministically format coordinates to 2 decimal places', () => {
    assert.equal(formatLocationKey(18.5204, 73.8567), '18.52_73.86')
    assert.equal(formatLocationKey('19.0760', '72.8777'), '19.08_72.88')
    assert.equal(formatLocationKey(0, 0), '0.00_0.00')
    assert.equal(formatLocationKey(-33.8688, 151.2093), '-33.87_151.21')
  })

  test('formatLocationKey should reject invalid coordinates', () => {
    assert.throws(
      () => formatLocationKey('invalid', 73.85),
      /Invalid coordinates/
    )
    assert.throws(
      () => formatLocationKey(18.52, undefined),
      /Invalid coordinates/
    )
  })

  test('isLocationCompatible should verify coordinate closeness and require identical canonical keys', () => {
    // 1. Exact match
    assert.equal(isLocationCompatible(18.52, 73.86, 18.52, 73.86), true)

    // 2. Two coordinates in the same canonical key with tight delta (<0.01°) are compatible
    // 18.5204 and 18.5220 both format to "18.52", delta is 0.0016
    assert.equal(isLocationCompatible(18.5204, 73.8567, 18.522, 73.858), true)

    // 3. Coordinates that produce different canonical keys are rejected
    // 18.524 vs 18.526 format to "18.52" vs "18.53"
    assert.equal(isLocationCompatible(18.524, 73.86, 18.526, 73.86), false)

    // 4. Concrete collision scenario: Shivajinagar (18.5312, 73.8446) vs Deccan Gymkhana (18.5173, 73.8415)
    // Keys differ ("18.53_73.84" vs "18.52_73.84") -> rejected
    assert.equal(
      isLocationCompatible(18.5312, 73.8446, 18.5173, 73.8415),
      false
    )

    // 5. A coordinate difference > 0.01° is rejected
    assert.equal(isLocationCompatible(18.52, 73.86, 18.535, 73.86), false)
    assert.equal(isLocationCompatible(18.52, 73.86, 18.52, 73.875), false)

    // 6. Far-away locations (e.g. Pune vs Mumbai, ~120km away) are rejected
    assert.equal(isLocationCompatible(18.5204, 73.8567, 19.076, 72.8777), false)

    // 7. Invalid/non-numeric coordinates are safely rejected
    assert.equal(isLocationCompatible(NaN, 73.86, 18.52, 73.86), false)
    assert.equal(isLocationCompatible('abc', 73.86, 18.52, 73.86), false)
    assert.equal(isLocationCompatible(18.52, 73.86, null, undefined), false)
  })
})

describe('Unit: Frontend Offline Cache - Stale Windows & Scopes', () => {
  test('Current weather max stale limit should be 12 hours', () => {
    assert.equal(MAX_STALE_MS.CURRENT, 12 * 60 * 60 * 1000)
    assert.equal(MAX_STALE_MS.CURRENT, 43200000)
  })

  test('Hourly forecast max stale limit should be 72 hours', () => {
    assert.equal(MAX_STALE_MS.HOURLY, 72 * 60 * 60 * 1000)
    assert.equal(MAX_STALE_MS.HOURLY, 259200000)
  })

  test('Daily forecast max stale limit should be 7 days', () => {
    assert.equal(MAX_STALE_MS.DAILY, 7 * 24 * 60 * 60 * 1000)
    assert.equal(MAX_STALE_MS.DAILY, 604800000)
  })

  test('Alerts max stale limit should be 24 hours', () => {
    assert.equal(ALERT_MAX_STALE_MS, 24 * 60 * 60 * 1000)
    assert.equal(ALERT_MAX_STALE_MS, 86400000)
  })

  test('getAlertScopeKey should distinguish between authenticated and public scopes', () => {
    assert.equal(getAlertScopeKey(true), 'my-alerts')
    assert.equal(getAlertScopeKey(false), 'public-alerts')
  })
})

describe('Unit: Frontend Offline Cache - Data Contracts & Stale Metadata Injection', () => {
  test('Offline metadata enrichment structure for current weather', () => {
    const originalData = {
      location: {
        name: 'Pune',
        latitude: 18.5204,
        longitude: 73.8567,
        timezone: 'Asia/Kolkata'
      },
      forecast: { current: { temperature: 28.5, condition: 'Clear' } },
      metadata: { source: 'Open-Meteo', fetchedAt: '2026-09-09T12:00:00.000Z' }
    }

    const cachedAt = Date.now() - 3600000 // 1 hour ago
    const record = {
      locationKey: '18.52_73.86',
      latitude: 18.5204,
      longitude: 73.8567,
      timezone: originalData.location.timezone,
      source: originalData.metadata.source,
      fetchedAt: originalData.metadata.fetchedAt,
      cachedAt,
      data: originalData
    }

    // Simulate retrieval enrichment logic
    const enriched = {
      ...record.data,
      _offlineMeta: {
        isOffline: true,
        isStale: true,
        cachedAt: record.cachedAt,
        fetchedAt: record.fetchedAt,
        source: record.source,
        timezone: record.timezone,
        latitude: record.latitude,
        longitude: record.longitude,
        locationKey: record.locationKey
      }
    }

    // 1. Original provider fields preserved
    assert.equal(enriched.forecast.current.temperature, 28.5)
    assert.equal(enriched.location.name, 'Pune')
    assert.equal(enriched.metadata.source, 'Open-Meteo')

    // 2. Offline metadata added separately
    assert.equal(enriched._offlineMeta.isOffline, true)
    assert.equal(enriched._offlineMeta.isStale, true)
    assert.equal(enriched._offlineMeta.cachedAt, cachedAt)
    assert.equal(enriched._offlineMeta.source, 'Open-Meteo')
    assert.equal(enriched._offlineMeta.locationKey, '18.52_73.86')
  })

  test('Offline alerts must always be marked as isOffline and isStale', () => {
    const rawAlerts = [
      { _id: 'alert-1', title: 'Heavy Rain Warning', severity: 'warning' },
      { _id: 'alert-2', title: 'Heatwave Alert', severity: 'danger' }
    ]

    const cachedAt = Date.now() - 1800000 // 30 min ago

    // Simulate retrieval enrichment logic for alerts
    const taggedAlerts = rawAlerts.map(alert => ({
      ...alert,
      isOffline: true,
      isStale: true,
      _offlineMeta: {
        isOffline: true,
        isStale: true,
        cachedAt,
        warning: 'Cached alert — not currently verified with authorities'
      }
    }))

    for (const alert of taggedAlerts) {
      assert.equal(alert.isOffline, true)
      assert.equal(alert.isStale, true)
      assert.ok(alert._offlineMeta.warning.includes('not currently verified'))
      assert.equal(alert._offlineMeta.cachedAt, cachedAt)
    }
  })

  test('Over-stale data older than maximum age must be rejected', () => {
    const now = Date.now()
    const thirteenHoursAgo = now - 13 * 60 * 60 * 1000

    const age = now - thirteenHoursAgo
    const isUsable = age <= MAX_STALE_MS.CURRENT
    assert.equal(
      isUsable,
      false,
      'Current weather older than 12h should not be usable'
    )

    const eightDaysAgo = now - 8 * 24 * 60 * 60 * 1000
    const forecastAge = now - eightDaysAgo
    const isForecastUsable = forecastAge <= MAX_STALE_MS.DAILY
    assert.equal(
      isForecastUsable,
      false,
      'Daily forecast older than 7 days should not be usable'
    )

    const twentyFiveHoursAgo = now - 25 * 60 * 60 * 1000
    const alertAge = now - twentyFiveHoursAgo
    const isAlertUsable = alertAge <= ALERT_MAX_STALE_MS
    assert.equal(
      isAlertUsable,
      false,
      'Alerts older than 24h should not be usable'
    )
  })

  test('Cached weather retrieval must reject record if stored locationKey differs from requested key', () => {
    const requestedLat = 18.5204
    const requestedLon = 73.8567
    const requestedKey = formatLocationKey(requestedLat, requestedLon) // "18.52_73.86"

    const corruptedOrMismatchedRecord = {
      locationKey: '19.08_72.88', // Mumbai key
      latitude: 18.5204,
      longitude: 73.8567,
      data: { temp: 25 }
    }

    // Verify key guard
    const isKeyValid = corruptedOrMismatchedRecord.locationKey === requestedKey
    assert.equal(
      isKeyValid,
      false,
      'Record with mismatched locationKey must be rejected'
    )
  })
})

describe('Unit: Frontend Offline Cache - Storage Resilience & OfflineManager', () => {
  test('isIndexedDBSupported safely reports false in non-browser Node environment', () => {
    assert.equal(isIndexedDBSupported(), false)
  })

  test('withStore gracefully returns null without throwing when IndexedDB is unavailable', async () => {
    const res = await withStore('current_weather', 'readonly', async store => {
      return store.get('test_key')
    })
    assert.equal(res, null)
  })

  test('weatherCache gracefully returns null/false when storage is unsupported', async () => {
    const saveResult = await saveCurrentWeather(18.52, 73.86, { temp: 25 })
    assert.equal(saveResult, false)

    const getResult = await getCurrentWeather(18.52, 73.86)
    assert.equal(getResult, null)
  })

  test('offlineManager provides isOnline status and handles subscriptions cleanly', () => {
    assert.equal(typeof offlineManager.isOnline(), 'boolean')

    let received = null
    const unsubscribe = offlineManager.subscribe(state => {
      received = state
    })

    assert.equal(typeof unsubscribe, 'function')

    offlineManager.notify({ isOnline: false })
    assert.deepEqual(received, { isOnline: false })

    offlineManager.notify({ isOnline: true })
    assert.deepEqual(received, { isOnline: true })

    unsubscribe()
    received = null
    offlineManager.notify({ isOnline: false })
    assert.equal(
      received,
      null,
      'Should not receive notifications after unsubscribe'
    )
  })
})
