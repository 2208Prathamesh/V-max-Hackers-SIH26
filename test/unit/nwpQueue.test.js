import { describe, test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  enqueueNWP,
  getNWPQueueStats,
  resetNWPQueueForTesting,
  formatQueueLocationKey
} from '../../backend/src/services/weather/nwp/nwpQueue.js'

describe('Global NWP Queue Concurrency & Coalescing Audit', () => {
  beforeEach(() => {
    resetNWPQueueForTesting()
  })

  test('enqueues at least 5 different locations concurrently and maintains max concurrency === 1', async () => {
    const locations = [
      '18.52_73.86', // Pune
      '19.08_72.88', // Mumbai
      '28.61_77.21', // Delhi
      '12.97_77.59', // Bangalore
      '51.51_-0.13' // London
    ]

    let currentActive = 0
    let maxObservedConcurrency = 0
    const completionOrder = []

    const tasks = locations.map((locKey, index) => {
      return enqueueNWP(locKey, async () => {
        currentActive++
        if (currentActive > maxObservedConcurrency) {
          maxObservedConcurrency = currentActive
        }

        // Assert strictly at most 1 job is executing right now
        assert.equal(
          currentActive,
          1,
          `Expected at most 1 active job, but got ${currentActive}`
        )

        // Simulate async NWP work
        await new Promise(resolve => setTimeout(resolve, 25))

        currentActive--
        completionOrder.push(locKey)
        return `result_${index}_${locKey}`
      })
    })

    // All 5 jobs were enqueued concurrently
    const results = await Promise.all(tasks)

    // Verification
    assert.equal(
      maxObservedConcurrency,
      1,
      'Peak observed concurrency during task execution must be exactly 1'
    )
    assert.equal(
      getNWPQueueStats().peakConcurrent,
      1,
      'Queue stats peakConcurrent must be 1'
    )
    assert.equal(
      completionOrder.length,
      5,
      'All 5 locations must have executed'
    )
    assert.equal(
      results.length,
      5,
      'All 5 promises must have resolved with values'
    )
    assert.equal(results[0], 'result_0_18.52_73.86')
    assert.equal(results[4], 'result_4_51.51_-0.13')
    assert.equal(
      getNWPQueueStats().activeCount,
      0,
      'Active count must return to 0'
    )
    assert.equal(
      getNWPQueueStats().pendingCount,
      0,
      'Pending count must return to 0'
    )
  })

  test('coalesces duplicate concurrent requests for the same canonical location into a single execution', async () => {
    let executionCount = 0
    const targetLoc = '18.52_73.86'

    // Enqueue 3 requests for the same location simultaneously
    const req1 = enqueueNWP(targetLoc, async () => {
      executionCount++
      await new Promise(resolve => setTimeout(resolve, 30))
      return { forecast: 'data_run_1', timestamp: 12345 }
    })

    const req2 = enqueueNWP(targetLoc, async () => {
      executionCount++
      await new Promise(resolve => setTimeout(resolve, 30))
      return { forecast: 'data_run_2', timestamp: 67890 }
    })

    const req3 = enqueueNWP(targetLoc, async () => {
      executionCount++
      await new Promise(resolve => setTimeout(resolve, 30))
      return { forecast: 'data_run_3', timestamp: 11111 }
    })

    const [res1, res2, res3] = await Promise.all([req1, req2, req3])

    assert.equal(
      executionCount,
      1,
      'Task should only have executed once across 3 concurrent identical-location requests'
    )
    assert.deepEqual(
      res1,
      res2,
      'Coalesced requests must resolve to the exact same result'
    )
    assert.deepEqual(
      res2,
      res3,
      'Coalesced requests must resolve to the exact same result'
    )
    assert.equal(res1.forecast, 'data_run_1')
    assert.equal(
      getNWPQueueStats().inFlightCount,
      0,
      'inFlightByLocation must be cleared after completion'
    )
  })

  test('continues processing subsequent queue items after an NWP job fails or throws', async () => {
    const executed = []
    const failedLoc = '19.08_72.88'
    const successLoc1 = '18.52_73.86'
    const successLoc2 = '28.61_77.21'

    const job1 = enqueueNWP(successLoc1, async () => {
      executed.push(successLoc1)
      return 'ok1'
    })

    const job2 = enqueueNWP(failedLoc, async () => {
      executed.push(failedLoc)
      throw new Error('Simulated GRIB decompression native error')
    })

    const job3 = enqueueNWP(successLoc2, async () => {
      executed.push(successLoc2)
      return 'ok3'
    })

    const r1 = await job1
    assert.equal(r1, 'ok1')

    await assert.rejects(
      async () => await job2,
      /Simulated GRIB decompression native error/,
      'Job 2 must reject with the thrown error'
    )

    const r3 = await job3
    assert.equal(
      r3,
      'ok3',
      'Job 3 must successfully execute even though Job 2 failed'
    )

    assert.deepEqual(
      executed,
      [successLoc1, failedLoc, successLoc2],
      'All 3 jobs must have been attempted in sequence'
    )
    assert.equal(
      getNWPQueueStats().activeCount,
      0,
      'Queue activeCount must be 0'
    )
    assert.equal(
      getNWPQueueStats().pendingCount,
      0,
      'Queue pendingCount must be 0'
    )
    assert.equal(
      getNWPQueueStats().totalFailed,
      1,
      'totalFailed counter must increment'
    )
    assert.equal(
      getNWPQueueStats().totalCompleted,
      2,
      'totalCompleted counter must be 2'
    )
  })

  test('formatQueueLocationKey handles string, coordinate objects, and null safely', () => {
    assert.equal(formatQueueLocationKey('18.52_73.86'), '18.52_73.86')
    assert.equal(
      formatQueueLocationKey({ latitude: 18.5204, longitude: 73.8567 }),
      '18.52_73.86'
    )
    assert.equal(
      formatQueueLocationKey({ lat: 18.5204, lon: 73.8567 }),
      '18.52_73.86'
    )
    assert.equal(formatQueueLocationKey(null), null)
    assert.equal(formatQueueLocationKey(''), null)
  })
})
