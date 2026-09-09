/**
 * Global Sequential NWP Processing Queue
 *
 * Enforces a strict global concurrency limit of 1 across all NWP operations
 * (ECMWF IFS, NOAA GFS, Model Comparisons) to prevent native Rust GRIB2
 * decompressions from running concurrently and exhausting system memory.
 *
 * Features:
 * - Strict concurrency limit: at most 1 active job globally at any time
 * - In-flight deduplication / coalescing: concurrent requests for the same canonical
 *   location key share a single in-flight Promise
 * - Non-blocking fault tolerance: job failures reject only that job and never stall the queue
 * - Event-loop yielding: setImmediate yields and V8 GC execution between jobs
 * - Concise lifecycle logging
 */

let activeCount = 0
let peakConcurrent = 0
let totalEnqueued = 0
let totalCompleted = 0
let totalFailed = 0
let anonCounter = 0

// Queue of pending jobs: Array<{ locationKey, task, resolve, reject, promise }>
const queue = []

// Map of canonical locationKey -> existing in-flight / queued Promise
const inFlightByLocation = new Map()

/**
 * Format a canonical location key from various input shapes
 *
 * @param {string|object} loc
 * @returns {string|null}
 */
export function formatQueueLocationKey (loc) {
  if (typeof loc === 'string' && loc.trim().length > 0) {
    return loc.trim()
  }
  if (loc && typeof loc === 'object') {
    const lat = Number(loc.latitude ?? loc.lat)
    const lon = Number(loc.longitude ?? loc.lon ?? loc.lng)
    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      return `${lat.toFixed(2)}_${lon.toFixed(2)}`
    }
  }
  return null
}

/**
 * Enqueue an NWP task.
 *
 * @param {string|object|Function} locationKeyOrTask - Location key or task function
 * @param {Function} [taskFn] - Async task function if locationKey is provided
 * @returns {Promise<any>} Resolves with the task result
 */
export function enqueueNWP (locationKeyOrTask, taskFn) {
  let locationKey = null
  let task = null

  if (typeof locationKeyOrTask === 'function') {
    task = locationKeyOrTask
    locationKey = `anon_${++anonCounter}`
  } else {
    locationKey =
      formatQueueLocationKey(locationKeyOrTask) || `anon_${++anonCounter}`
    task = taskFn
  }

  if (typeof task !== 'function') {
    return Promise.reject(new Error('enqueueNWP requires a task function'))
  }

  // 1. In-flight coalescing for same canonical location (if not anonymous)
  if (!locationKey.startsWith('anon_') && inFlightByLocation.has(locationKey)) {
    console.log(
      `[NWP QUEUE] coalesce ${locationKey} active=${activeCount} pending=${queue.length}`
    )
    return inFlightByLocation.get(locationKey)
  }

  // 2. Create deferred promise
  let deferredResolve
  let deferredReject
  const jobPromise = new Promise((resolve, reject) => {
    deferredResolve = resolve
    deferredReject = reject
  })

  const job = {
    locationKey,
    task,
    resolve: deferredResolve,
    reject: deferredReject,
    promise: jobPromise
  }

  totalEnqueued++
  if (!locationKey.startsWith('anon_')) {
    inFlightByLocation.set(locationKey, jobPromise)
  }

  console.log(
    `[NWP QUEUE] enqueue ${locationKey} active=${activeCount} pending=${queue.length}`
  )

  queue.push(job)
  processNext()

  return jobPromise
}

/**
 * Process the next job in the queue
 */
async function processNext () {
  if (activeCount >= 1 || queue.length === 0) {
    return
  }

  activeCount++
  if (activeCount > peakConcurrent) {
    peakConcurrent = activeCount
  }

  const job = queue.shift()
  console.log(
    `[NWP QUEUE] start ${job.locationKey} active=${activeCount} pending=${queue.length}`
  )

  try {
    const result = await job.task()
    totalCompleted++
    console.log(
      `[NWP QUEUE] finish ${job.locationKey} active=${
        activeCount - 1
      } pending=${queue.length}`
    )
    job.resolve(result)
  } catch (err) {
    totalFailed++
    console.error(
      `[NWP QUEUE] error ${job.locationKey}: ${err.message} active=${
        activeCount - 1
      } pending=${queue.length}`
    )
    job.reject(err)
  } finally {
    activeCount--
    if (!job.locationKey.startsWith('anon_')) {
      inFlightByLocation.delete(job.locationKey)
    }

    // Yield to the event loop and allow GC before starting next job
    await new Promise(resolve => setImmediate(resolve))
    if (global.gc) {
      try {
        global.gc()
      } catch (_) {}
    }

    // Process next item
    processNext()
  }
}

/**
 * Diagnostic queue statistics for monitoring and assertions
 */
export function getNWPQueueStats () {
  return {
    activeCount,
    pendingCount: queue.length,
    inFlightCount: inFlightByLocation.size,
    peakConcurrent,
    totalEnqueued,
    totalCompleted,
    totalFailed
  }
}

/**
 * Reset statistics (mainly for unit tests)
 */
export function resetNWPQueueForTesting () {
  queue.length = 0
  inFlightByLocation.clear()
  activeCount = 0
  peakConcurrent = 0
  totalEnqueued = 0
  totalCompleted = 0
  totalFailed = 0
  anonCounter = 0
}

export default {
  enqueueNWP,
  formatQueueLocationKey,
  getNWPQueueStats,
  resetNWPQueueForTesting
}
