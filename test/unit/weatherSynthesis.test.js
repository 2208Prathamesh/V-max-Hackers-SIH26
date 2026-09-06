import test from 'node:test'
import assert from 'node:assert/strict'
import { buildWeatherSynthesis } from '../../backend/src/services/weather/weatherSynthesis.js'

const observation = {
  source: 'IMD',
  sourceType: 'observation',
  observedAt: '2026-09-07T12:00:00.000Z',
  temperatureC: 29,
  pressureHpa: 1008
}

const alerts = [
  {
    source: 'IMD',
    warningLevel: 'Orange',
    hazard: 'Heavy Rain'
  }
]

const gfs = {
  source: 'NOAA-GFS',
  dataType: 'nwp_forecast',
  initialConditionType: 'model_initial_condition',
  initialCondition: { leadTimeHours: 0, temperature: 28 },
  run: { model: 'NOAA-GFS', runTime: '2026-09-07T00:00:00.000Z' },
  hourly: [{ timestamp: '2026-09-07T00:00:00.000Z', leadTimeHours: 0 }],
  daily: []
}

const ecmwf = {
  source: 'ECMWF-IFS',
  dataType: 'nwp_forecast',
  initialConditionType: 'model_initial_condition',
  initialCondition: { leadTimeHours: 0, temperature: 28.5 },
  run: { model: 'ECMWF-IFS', runTime: '2026-09-07T00:00:00.000Z' },
  hourly: [{ timestamp: '2026-09-07T00:00:00.000Z', leadTimeHours: 0 }],
  daily: []
}

const modelComparison = {
  alignedForecasts: [{ timestamp: '2026-09-07T00:00:00.000Z' }],
  forecastUncertainty: {
    agreementLevel: 'moderate',
    modelAgreementScore: 82,
    uncertainty: {
      temperature: 'low',
      precipitation: 'moderate',
      windSpeed: 'low'
    },
    largestDisagreement: null,
    matchedTimestamps: 1
  }
}

test('weather source-aware synthesis', async t => {
  await t.test(
    'combines IMD observation, alerts, both NWP models, and agreement',
    () => {
      const synthesis = buildWeatherSynthesis({
        observation,
        alerts,
        gfs,
        ecmwf,
        modelComparison
      })

      assert.equal(synthesis.available, true)
      assert.equal(synthesis.observation.source, 'IMD')
      assert.equal(synthesis.observation.available, true)
      assert.equal(synthesis.alerts.source, 'IMD')
      assert.deepEqual(synthesis.alerts.items, alerts)
      assert.equal(synthesis.forecast.numericalModels.gfs.source, 'NOAA-GFS')
      assert.equal(synthesis.forecast.numericalModels.ecmwf.source, 'ECMWF-IFS')
      assert.deepEqual(
        synthesis.forecast.modelAgreement,
        modelComparison.forecastUncertainty
      )
      assert.equal(synthesis.sources.gfs.status, 'available')
      assert.equal(synthesis.sources.ecmwf.status, 'available')
    }
  )

  await t.test(
    'uses IMD for current weather and keeps NWP step 0 as forecast data',
    () => {
      const synthesis = buildWeatherSynthesis({ observation, gfs, ecmwf })

      assert.equal(synthesis.current.source, 'IMD')
      assert.deepEqual(synthesis.current.weather, observation)
      assert.equal(synthesis.current.weather.initialConditionType, undefined)
      assert.equal(
        synthesis.forecast.numericalModels.gfs.forecast.initialConditionType,
        'model_initial_condition'
      )
      assert.equal(
        synthesis.forecast.numericalModels.gfs.forecast.initialCondition
          .leadTimeHours,
        0
      )
    }
  )

  await t.test(
    'marks current unavailable when IMD observation is missing',
    () => {
      const synthesis = buildWeatherSynthesis({
        observation: { error: 'observation unavailable' },
        gfs,
        ecmwf,
        modelComparison
      })

      assert.deepEqual(synthesis.current, {
        available: false,
        reason: 'observation_unavailable'
      })
      assert.equal(synthesis.forecast.numericalModels.gfs.available, true)
      assert.equal(synthesis.forecast.numericalModels.ecmwf.available, true)
      assert.equal(synthesis.sources.observation.status, 'unavailable')
    }
  )

  await t.test('handles GFS unavailable and ECMWF available', () => {
    const synthesis = buildWeatherSynthesis({ observation, ecmwf })

    assert.equal(synthesis.forecast.numericalModels.gfs.available, false)
    assert.equal(synthesis.forecast.numericalModels.ecmwf.available, true)
    assert.equal(synthesis.sources.gfs.status, 'unavailable')
    assert.equal(synthesis.sources.ecmwf.status, 'available')
    assert.equal(
      synthesis.forecast.modelAgreement.agreementLevel,
      'unavailable'
    )
  })

  await t.test('handles ECMWF unavailable and GFS available', () => {
    const synthesis = buildWeatherSynthesis({ observation, gfs })

    assert.equal(synthesis.forecast.numericalModels.gfs.available, true)
    assert.equal(synthesis.forecast.numericalModels.ecmwf.available, false)
    assert.equal(synthesis.sources.gfs.status, 'available')
    assert.equal(synthesis.sources.ecmwf.status, 'unavailable')
  })

  await t.test(
    'keeps alerts separate and represents no alerts explicitly',
    () => {
      const synthesis = buildWeatherSynthesis({
        observation,
        alerts: [],
        gfs,
        ecmwf
      })

      assert.equal(synthesis.alerts.source, 'IMD')
      assert.equal(synthesis.alerts.available, true)
      assert.deepEqual(synthesis.alerts.items, [])
      assert.equal(synthesis.sources.alerts.status, 'available')
    }
  )

  await t.test(
    'returns a structured unavailable state when every source fails',
    () => {
      const synthesis = buildWeatherSynthesis({
        observation: { error: 'unavailable' },
        alerts: null,
        gfs: { source: 'NOAA-GFS', error: 'unavailable' },
        ecmwf: { source: 'ECMWF-IFS', error: 'unavailable' }
      })

      assert.equal(synthesis.available, false)
      assert.equal(synthesis.error, 'all_sources_unavailable')
      assert.equal(synthesis.current.available, false)
      assert.deepEqual(synthesis.alerts.items, [])
      assert.equal(synthesis.sources.gfs.status, 'unavailable')
      assert.equal(synthesis.sources.ecmwf.status, 'unavailable')
      assert.equal(synthesis.forecast.modelAgreement.modelAgreementScore, null)
      assert.equal(synthesis.forecast.modelAgreement.matchedTimestamps, 0)
    }
  )

  await t.test('does not treat a fallback provider as native GFS', () => {
    const synthesis = buildWeatherSynthesis({
      observation,
      gfs: {
        source: 'Open-Meteo',
        sourceType: 'final_fallback',
        hourly: []
      },
      ecmwf
    })

    assert.equal(synthesis.forecast.numericalModels.gfs.available, false)
    assert.equal(synthesis.forecast.numericalModels.gfs.source, 'Open-Meteo')
    assert.equal(synthesis.sources.gfs.status, 'unavailable')
    assert.equal(synthesis.forecast.numericalModels.gfs.forecast, null)
  })
})
