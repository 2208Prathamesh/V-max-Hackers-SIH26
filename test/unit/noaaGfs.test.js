import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildForecastSteps,
  findEntry,
  parseGribIndex
} from '../../backend/src/services/weather/nwp/noaaGfs/client.js'
import {
  buildHourlyPoint,
  buildNwpSemantics,
  buildRunMetadata,
  calculateIntervalPrecipitation
} from '../../backend/src/services/weather/nwp/noaaGfs/service.js'
import {
  getNearestGridPoint,
  normalizeGFS
} from '../../backend/src/services/weather/nwp/noaaGfs/normalizer.js'

describe('native NOAA GFS helpers', () => {
  test('builds multi-step forecast intervals', () => {
    const steps = buildForecastSteps(168)
    assert.deepEqual(steps.slice(0, 3), [0, 3, 6])
    assert.equal(steps.at(-1), 168)
    assert.equal(steps.includes(147), false)
  })

  test('parses native GFS index fields by variable and level', () => {
    const entries = parseGribIndex(
      [
        '1:0:d=2026090600:PRMSL:mean sea level:3 hour fcst:',
        '2:866762:d=2026090600:TMP:2 m above ground:3 hour fcst:',
        '3:409434209:d=2026090600:UGRD:10 m above ground:3 hour fcst:'
      ].join('\n')
    )

    assert.equal(findEntry(entries, 'TMP', '2 m above ground').offset, 866762)
    assert.equal(findEntry(entries, 'PRMSL', 'mean sea level').var, 'PRMSL')
  })

  test('normalizes native GFS units and 0..360 longitude', () => {
    const message = values => ({
      data: [values],
      gridShape: { rows: 1, cols: 1 },
      latlng: { latitude: [18.5], longitude: [433.75] }
    })
    const normalized = normalizeGFS(
      {
        temperature: message(300),
        humidity: message(70),
        dewPoint: message(290),
        uWind: message(3),
        vWind: message(4),
        pressure: message(101325),
        precipitation: message(2)
      },
      { latitude: 18.51957, longitude: 73.85535 },
      '2026-09-06T06:00:00.000Z'
    )

    assert.equal(normalized.forecast.temperature, 26.85)
    assert.equal(normalized.forecast.pressure, 1013.25)
    assert.equal(normalized.forecast.windSpeed, 18)
    assert.equal(normalized.location.gridLongitude, 73.75)
    assert.equal(normalized.timestamp, '2026-09-06T06:00:00.000Z')
    assert.equal(
      getNearestGridPoint(message(1), 18.52, -286.25).longitude,
      73.75
    )
  })

  test('clamps accumulated precipitation increments', () => {
    assert.equal(calculateIntervalPrecipitation(null, 2), null)
    assert.equal(calculateIntervalPrecipitation(2, 5), 3)
    assert.equal(calculateIntervalPrecipitation(5, 4), 0)
  })

  test('labels GFS points with forecast lead time and run metadata', () => {
    const forecast = { temperature: 26, humidity: 70 }
    const initialCondition = buildHourlyPoint(
      0,
      '2026-09-06T12:00:00.000Z',
      forecast,
      null
    )
    const laterPoint = buildHourlyPoint(
      3,
      '2026-09-06T15:00:00.000Z',
      forecast,
      1
    )
    const run = buildRunMetadata(
      '20260906',
      '12',
      [0, 3, 6],
      new Date('2026-09-06T13:00:00.000Z')
    )

    assert.equal(initialCondition.leadTimeHours, 0)
    assert.equal(laterPoint.leadTimeHours, 3)
    assert.equal(initialCondition.timestamp.endsWith('Z'), true)
    assert.equal(run.runTime, '2026-09-06T12:00:00.000Z')
    assert.equal(run.model, 'NOAA-GFS')
    assert.equal(run.forecastHorizonHours, 6)
    assert.equal(run.ageHours, 1)
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
    const normalized = normalizeGFS(
      {
        temperature: message(300),
        humidity: message(70),
        dewPoint: message(290),
        uWind: message(3),
        vWind: message(4),
        pressure: message(101325)
      },
      { latitude: 18.51957, longitude: 73.85535 },
      '2026-09-06T12:00:00.000Z'
    )

    assert.equal(normalized.location.requestedLatitude, 18.51957)
    assert.equal(normalized.location.requestedLongitude, 73.85535)
    assert.equal(normalized.location.gridLatitude, 18.5)
    assert.equal(normalized.location.gridLongitude, 73.75)
  })
})
