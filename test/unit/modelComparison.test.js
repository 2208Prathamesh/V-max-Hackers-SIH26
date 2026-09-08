import test from 'node:test'
import assert from 'node:assert/strict'
import {
  alignForecasts,
  buildForecastUncertainty,
  classifySpread,
  findLargestDisagreement,
  getAgreementLevel,
  summarizeAlignedForecasts
} from '../../backend/src/services/weather/nwp/modelComparisonService.js'

function point (timestamp, leadTimeHours, values = {}) {
  return {
    timestamp,
    leadTimeHours,
    temperature: values.temperature ?? null,
    precipitation: values.precipitation ?? null,
    windSpeed: values.windSpeed ?? null
  }
}

test('NWP forecast timestamp alignment', async t => {
  await t.test('matches exact UTC timestamps and calculates spreads', () => {
    const timestamp = '2026-09-07T15:00:00.000Z'
    const aligned = alignForecasts(
      [
        point(timestamp, 3, {
          temperature: 29.2,
          precipitation: 2.1,
          windSpeed: 14
        })
      ],
      [
        point(timestamp, 3, {
          temperature: 28.7,
          precipitation: 1.7,
          windSpeed: 12
        })
      ]
    )

    assert.equal(aligned.length, 1)
    assert.equal(aligned[0].timestamp, timestamp)
    assert.deepEqual(aligned[0].leadTimeHours, { gfs: 3, ecmwf: 3 })
    assert.equal(aligned[0].gfs.source, 'NOAA-GFS')
    assert.equal(aligned[0].ecmwf.source, 'ECMWF-IFS')
    assert.equal(aligned[0].comparison.temperatureSpread, 0.5)
    assert.equal(aligned[0].comparison.precipitationSpread, 0.4)
    assert.equal(aligned[0].comparison.windSpeedSpread, 2)
  })

  await t.test('does not compare mismatched timestamps', () => {
    const aligned = alignForecasts(
      [point('2026-09-07T15:00:00.000Z', 3, { temperature: 29 })],
      [point('2026-09-07T16:00:00.000Z', 4, { temperature: 29 })]
    )

    assert.deepEqual(aligned, [])
  })

  await t.test(
    'supports multiple matches and excludes missing model data',
    () => {
      const aligned = alignForecasts(
        [
          point('2026-09-07T15:00:00.000Z', 3, { temperature: 29 }),
          point('2026-09-07T18:00:00.000Z', 6, { temperature: 30 }),
          point('2026-09-07T21:00:00.000Z', 9, { temperature: 28 })
        ],
        [
          point('2026-09-07T15:00:00.000Z', 3, { temperature: 28 }),
          point('2026-09-07T21:00:00.000Z', 9, { temperature: 29 })
        ]
      )

      assert.equal(aligned.length, 2)
      assert.deepEqual(
        aligned.map(item => item.timestamp),
        ['2026-09-07T15:00:00.000Z', '2026-09-07T21:00:00.000Z']
      )
    }
  )

  await t.test(
    'matches step 0 only when initialization timestamps match',
    () => {
      const aligned = alignForecasts(
        [point('2026-09-07T00:00:00.000Z', 0, { temperature: 25 })],
        [point('2026-09-07T00:00:00.000Z', 0, { temperature: 25.5 })]
      )

      assert.equal(aligned.length, 1)
      assert.deepEqual(aligned[0].leadTimeHours, { gfs: 0, ecmwf: 0 })
    }
  )

  await t.test('summarizes spreads without NaN or division by zero', () => {
    const summary = summarizeAlignedForecasts(
      alignForecasts(
        [
          point('2026-09-07T15:00:00.000Z', 3, {
            temperature: 29.2,
            precipitation: 2.1,
            windSpeed: 14
          }),
          point('2026-09-07T18:00:00.000Z', 6, {
            temperature: 30.1,
            precipitation: 1,
            windSpeed: 10
          })
        ],
        [
          point('2026-09-07T15:00:00.000Z', 3, {
            temperature: 28.7,
            precipitation: 1.7,
            windSpeed: 12
          }),
          point('2026-09-07T18:00:00.000Z', 6, {
            temperature: 29.8,
            precipitation: 2,
            windSpeed: 13
          })
        ]
      )
    )

    assert.equal(summary.matchedTimestamps, 2)
    assert.equal(summary.temperature.meanSpread, 0.4)
    assert.equal(summary.temperature.maxSpread, 0.5)
    assert.equal(summary.precipitation.meanSpread, 0.7)
    assert.equal(summary.precipitation.maxSpread, 1)
    assert.equal(summary.windSpeed.meanSpread, 2.5)
    assert.equal(summary.windSpeed.maxSpread, 3)
    assert.equal(Number.isNaN(summary.modelAgreementScore), false)
    assert.ok(
      summary.modelAgreementScore >= 0 && summary.modelAgreementScore <= 100
    )
  })

  await t.test('handles empty arrays and missing metric values safely', () => {
    const empty = summarizeAlignedForecasts(alignForecasts([], []))
    assert.equal(empty.matchedTimestamps, 0)
    assert.equal(empty.temperature.meanSpread, null)
    assert.equal(empty.precipitation.maxSpread, null)
    assert.equal(empty.modelAgreementScore, null)

    const missingMetrics = summarizeAlignedForecasts(
      alignForecasts(
        [point('2026-09-07T15:00:00.000Z', 3)],
        [point('2026-09-07T15:00:00.000Z', 3)]
      )
    )
    assert.equal(missingMetrics.matchedTimestamps, 1)
    assert.equal(missingMetrics.temperature.meanSpread, null)
    assert.equal(Number.isNaN(missingMetrics.modelAgreementScore), false)
  })

  await t.test('classifies agreement scores deterministically', () => {
    assert.equal(getAgreementLevel(100), 'high')
    assert.equal(getAgreementLevel(90), 'high')
    assert.equal(getAgreementLevel(89), 'moderate')
    assert.equal(getAgreementLevel(70), 'moderate')
    assert.equal(getAgreementLevel(69), 'low')
    assert.equal(getAgreementLevel(0), 'low')
    assert.equal(getAgreementLevel(null), 'unavailable')
  })

  await t.test(
    'classifies variable uncertainty from mean spread thresholds',
    () => {
      assert.equal(classifySpread('temperature', 0.9), 'low')
      assert.equal(classifySpread('temperature', 1), 'moderate')
      assert.equal(classifySpread('temperature', 3), 'moderate')
      assert.equal(classifySpread('temperature', 3.1), 'high')

      assert.equal(classifySpread('precipitation', 0.9), 'low')
      assert.equal(classifySpread('precipitation', 1), 'moderate')
      assert.equal(classifySpread('precipitation', 5), 'moderate')
      assert.equal(classifySpread('precipitation', 5.1), 'high')

      assert.equal(classifySpread('windSpeed', 4.9), 'low')
      assert.equal(classifySpread('windSpeed', 5), 'moderate')
      assert.equal(classifySpread('windSpeed', 10), 'moderate')
      assert.equal(classifySpread('windSpeed', 10.1), 'high')
    }
  )

  await t.test(
    'finds the largest disagreement and ignores missing precipitation',
    () => {
      const aligned = alignForecasts(
        [
          point('2026-09-07T15:00:00.000Z', 3, {
            temperature: 25,
            precipitation: null,
            windSpeed: 20
          }),
          point('2026-09-07T18:00:00.000Z', 6, {
            temperature: 30,
            precipitation: 7.1,
            windSpeed: 10
          })
        ],
        [
          point('2026-09-07T15:00:00.000Z', 3, {
            temperature: 25.2,
            precipitation: 0,
            windSpeed: 20
          }),
          point('2026-09-07T18:00:00.000Z', 6, {
            temperature: 29,
            precipitation: 2.3,
            windSpeed: 10
          })
        ]
      )
      const largest = findLargestDisagreement(aligned)

      assert.deepEqual(largest, {
        timestamp: '2026-09-07T18:00:00.000Z',
        variable: 'precipitation',
        spread: 4.8,
        gfsValue: 7.1,
        ecmwfValue: 2.3
      })
    }
  )

  await t.test('uses the mean for uncertainty instead of one outlier', () => {
    const aligned = alignForecasts(
      [
        point('2026-09-07T15:00:00.000Z', 3, { temperature: 20 }),
        point('2026-09-07T18:00:00.000Z', 6, { temperature: 20 }),
        point('2026-09-07T21:00:00.000Z', 9, { temperature: 24 })
      ],
      [
        point('2026-09-07T15:00:00.000Z', 3, { temperature: 19.5 }),
        point('2026-09-07T18:00:00.000Z', 6, { temperature: 19.5 }),
        point('2026-09-07T21:00:00.000Z', 9, { temperature: 20 })
      ]
    )
    const uncertainty = buildForecastUncertainty(aligned)

    assert.equal(uncertainty.uncertainty.temperature, 'moderate')
    assert.equal(uncertainty.matchedTimestamps, 3)
  })

  await t.test(
    'returns a safe unavailable uncertainty object with no matches',
    () => {
      const uncertainty = buildForecastUncertainty([])

      assert.deepEqual(uncertainty, {
        agreementLevel: 'unavailable',
        modelAgreementScore: null,
        uncertainty: {
          temperature: 'unavailable',
          precipitation: 'unavailable',
          windSpeed: 'unavailable'
        },
        largestDisagreement: null,
        matchedTimestamps: 0
      })
    }
  )
})
