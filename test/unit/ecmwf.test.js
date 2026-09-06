import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildForecastSteps,
  fetchRange,
  findMessage,
  mapWithConcurrency,
  normalizeStep,
  parseIndex
} from '../../backend/src/services/weather/nwp/ecmwf/client.js'
import {
  buildHourlyPoint,
  buildNwpSemantics,
  buildRunMetadata,
  calculateIntervalPrecipitation,
  buildTimestamp
} from '../../backend/src/services/weather/nwp/ecmwf/service.js'
import {
  calculateRelativeHumidity,
  getNearestIndex,
  normalizeECMWF
} from '../../backend/src/services/weather/nwp/ecmwf/normalizer.js'

describe('ECMWF forecast helpers', () => {
  test('builds 3-hour steps through 144h and 6-hour steps afterwards', () => {
    const steps = buildForecastSteps(168)
    assert.equal(steps.length, 53)
    assert.deepEqual(steps.slice(0, 3), [0, 3, 6])
    assert.equal(steps.at(-1), 168)
    assert.equal(steps.includes(147), false)
    assert.equal(steps.includes(150), true)
  })

  test('constrains range work to the configured concurrency', async () => {
    let active = 0
    let maximumActive = 0

    await mapWithConcurrency(Array.from({ length: 10 }), 3, async () => {
      active += 1
      maximumActive = Math.max(maximumActive, active)
      await new Promise(resolve => setTimeout(resolve, 5))
      active -= 1
    })

    assert.equal(maximumActive, 3)
  })

  test('retries a transient range failure', async () => {
    const originalFetch = globalThis.fetch
    let attempts = 0
    globalThis.fetch = async () => {
      attempts += 1
      if (attempts === 1) throw new TypeError('fetch failed')
      return new Response(Buffer.from('grib'), {
        status: 206,
        headers: { 'content-range': 'bytes 0-3/4' }
      })
    }

    try {
      const buffer = await fetchRange('https://example.test/field', 0, 4)
      assert.equal(buffer.toString(), 'grib')
      assert.equal(attempts, 2)
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  test('does not retry permanent range failures', async () => {
    const originalFetch = globalThis.fetch
    let attempts = 0
    globalThis.fetch = async () => {
      attempts += 1
      return new Response('', { status: 404, statusText: 'Not Found' })
    }

    try {
      await assert.rejects(
        fetchRange('https://example.test/missing', 0, 4),
        /404/
      )
      assert.equal(attempts, 1)
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  test('parses index entries and finds an arbitrary forecast step', () => {
    const index = parseIndex(
      [
        JSON.stringify({
          param: '2t',
          step: '0',
          levtype: 'sfc',
          _offset: '1',
          _length: '2'
        }),
        JSON.stringify({
          param: '2t',
          step: '6',
          levtype: 'sfc',
          _offset: '3',
          _length: '4'
        })
      ].join('\n')
    )

    assert.equal(normalizeStep('6h'), '6')
    assert.equal(findMessage(index, '2t', 6)._offset, '3')
  })

  test('normalizes units, wind, humidity, pressure, timestamp, and longitude', () => {
    const message = values => ({
      data: [values],
      gridShape: { rows: 1, cols: 1 },
      latlng: { latitude: [18.5], longitude: [433.75] }
    })
    const normalized = normalizeECMWF(
      {
        temperature: message(300),
        dewPoint: message(290),
        uWind: message(3),
        vWind: message(4),
        pressure: message(101325),
        precipitation: message(0.002),
        timestamp: '2026-09-06T06:00:00.000Z'
      },
      { latitude: 18.51957, longitude: 73.85535 }
    )

    assert.equal(normalized.timestamp, '2026-09-06T06:00:00.000Z')
    assert.equal(normalized.forecast.temperature, 26.85)
    assert.equal(normalized.forecast.pressure, 1013.25)
    assert.equal(normalized.forecast.windSpeed, 18)
    assert.equal(normalized.forecast.precipitation, 2)
    assert.equal(normalized.location.gridLongitude, 73.75)
    assert.ok(normalized.forecast.humidity > 50)
    assert.equal(
      getNearestIndex(message(1), 18.51957, -286.14465).longitude,
      73.75
    )
  })

  test('calculates accumulated precipitation increments without negative values', () => {
    assert.equal(calculateIntervalPrecipitation(null, 2), null)
    assert.equal(calculateIntervalPrecipitation(2, 5), 3)
    assert.equal(calculateIntervalPrecipitation(5, 4), 0)
  })

  test('builds unambiguous UTC forecast timestamps', () => {
    assert.equal(
      buildTimestamp('20260906', '12', 6),
      '2026-09-06T18:00:00.000Z'
    )
    assert.equal(calculateRelativeHumidity(26.85, 16.85) > 40, true)
  })

  test('labels ECMWF points with forecast lead time and run metadata', () => {
    const forecast = { temperature: 26, humidity: 70 }
    const initialCondition = buildHourlyPoint(
      0,
      '2026-09-06T06:00:00.000Z',
      forecast,
      null
    )
    const laterPoint = buildHourlyPoint(
      '6',
      '2026-09-06T12:00:00.000Z',
      forecast,
      1
    )
    const run = buildRunMetadata(
      '20260906',
      '06',
      [0, 3, 6],
      new Date('2026-09-06T05:00:00.000Z')
    )

    assert.equal(initialCondition.leadTimeHours, 0)
    assert.equal(laterPoint.leadTimeHours, 6)
    assert.equal(initialCondition.timestamp.endsWith('Z'), true)
    assert.equal(run.runTime, '2026-09-06T06:00:00.000Z')
    assert.equal(run.model, 'ECMWF-IFS')
    assert.equal(run.forecastHorizonHours, 6)
    assert.equal(run.ageHours, 0)
    assert.equal(run.ageHours >= 0, true)

    const responseSemantics = buildNwpSemantics([initialCondition, laterPoint])
    assert.equal(responseSemantics.dataType, 'nwp_forecast')
    assert.equal(
      responseSemantics.initialConditionType,
      'model_initial_condition'
    )
    assert.equal(responseSemantics.initialCondition.leadTimeHours, 0)
  })

  test('keeps requested coordinates separate from grid coordinates', () => {
    const message = values => ({
      data: [values],
      gridShape: { rows: 1, cols: 1 },
      latlng: { latitude: [18.5], longitude: [433.75] }
    })
    const normalized = normalizeECMWF(
      {
        temperature: message(300),
        dewPoint: message(290),
        uWind: message(3),
        vWind: message(4),
        pressure: message(101325),
        timestamp: '2026-09-06T06:00:00.000Z'
      },
      { latitude: 18.51957, longitude: 73.85535 }
    )

    assert.equal(normalized.location.requestedLatitude, 18.51957)
    assert.equal(normalized.location.requestedLongitude, 73.85535)
    assert.equal(normalized.location.gridLatitude, 18.5)
    assert.equal(normalized.location.gridLongitude, 73.75)
  })
})
