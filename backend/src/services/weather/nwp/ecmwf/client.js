import { getCachedBuffer, setCachedBuffer } from '../../../../utils/nwpCache.js'

const BASE_URL = 'https://data.ecmwf.int/forecasts'

let inflightECMWFPromise = null
let rateLimitedUntil = 0
const MAX_RATE_LIMIT_RETRIES = 1
const MAX_RATE_LIMIT_WAIT_MS = 10000
const MAX_CACHED_STEPS = 80
const MAX_REQUEST_RETRIES = 4
const REQUEST_TIMEOUT_MS = 30000
const RANGE_CONCURRENCY = 3
const RETRY_BASE_DELAY_MS = 500
const RETRY_MAX_DELAY_MS = 8000
const indexCache = new Map()

function markRateLimited () {
  rateLimitedUntil = Date.now() + 60000
}

function assertNotRateLimited () {
  if (Date.now() < rateLimitedUntil) {
    throw new Error('ECMWF rate limited; retry cooldown active')
  }
}

function getRetryDelayMs (response) {
  const retryAfter = response.headers.get('retry-after')
  if (!retryAfter) return 1000

  const seconds = Number(retryAfter)
  if (Number.isFinite(seconds)) {
    return Math.min(Math.max(seconds * 1000, 0), MAX_RATE_LIMIT_WAIT_MS)
  }

  const retryAt = Date.parse(retryAfter)
  if (Number.isFinite(retryAt)) {
    return Math.min(Math.max(retryAt - Date.now(), 0), MAX_RATE_LIMIT_WAIT_MS)
  }

  return 1000
}

function buildForecastUrl (date, cycle = '00', step = '0') {
  return (
    `${BASE_URL}/${date}/${cycle}z/ifs/0p25/oper/` +
    `${date}${cycle}0000-${step}h-oper-fc.grib2`
  )
}

function buildIndexUrl (date, cycle = '00', step = '0') {
  return (
    `${BASE_URL}/${date}/${cycle}z/ifs/0p25/oper/` +
    `${date}${cycle}0000-${step}h-oper-fc.index`
  )
}

function parseIndex (indexText) {
  return indexText
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => {
      try {
        return JSON.parse(line)
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

function normalizeStep (step) {
  return String(step).replace(/h$/i, '')
}

function findMessage (index, param, step) {
  return index.find(
    item =>
      item.param === param &&
      normalizeStep(item.step) === normalizeStep(step) &&
      item.levtype === 'sfc'
  )
}

function buildForecastSteps (maxHours = 144) {
  const cappedHours = Math.max(0, Number(maxHours) || 144)
  const steps = []

  for (let step = 0; step <= Math.min(cappedHours, 144); step += 3) {
    steps.push(step)
  }

  for (let step = 150; step <= cappedHours; step += 6) {
    steps.push(step)
  }

  return steps
}

async function fetchRange (url, offset, length) {
  assertNotRateLimited()
  const start = Number(offset)
  const end = start + Number(length) - 1

  return await fetchWithRetry(
    url,
    {
      headers: {
        Range: `bytes=${start}-${end}`,
        'Accept-Encoding': 'identity'
      }
    },
    async response => {
      const contentRange = response.headers.get('content-range')
      if (!contentRange) {
        throw new Error(
          'ECMWF server did not return Content-Range. ' +
            'Range requests may not be supported.'
        )
      }
      return Buffer.from(await response.arrayBuffer())
    },
    'range request'
  )
}

function isRetryableStatus (status) {
  return status === 408 || status === 425 || status === 429 || status >= 500
}

function isRetryableError (error) {
  return (
    error?.name === 'AbortError' ||
    /fetch failed|network|timeout/i.test(error?.message || '')
  )
}

function getBackoffDelayMs (attempt, response) {
  if (response?.status === 429) return getRetryDelayMs(response)
  const exponential = Math.min(
    RETRY_BASE_DELAY_MS * 2 ** attempt,
    RETRY_MAX_DELAY_MS
  )
  return exponential + Math.floor(Math.random() * 250)
}

async function fetchWithRetry (url, options, readResponse, label) {
  for (let attempt = 0; attempt <= MAX_REQUEST_RETRIES; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    let response

    try {
      response = await fetch(url, { ...options, signal: controller.signal })
      if (response.ok) return await readResponse(response)

      const retryable = isRetryableStatus(response.status)
      if (!retryable || attempt === MAX_REQUEST_RETRIES) {
        if (response.status === 429) markRateLimited()
        throw new Error(
          `ECMWF ${label} failed: ${response.status} ${response.statusText}`
        )
      }

      if (response.status === 429) markRateLimited()
      const retryMs = getBackoffDelayMs(attempt, response)
      console.warn(
        `ECMWF ${label} returned ${response.status}; ` +
          `retrying in ${retryMs}ms (attempt ${
            attempt + 1
          }/${MAX_REQUEST_RETRIES})`
      )
      await new Promise(resolve => setTimeout(resolve, retryMs))
    } catch (error) {
      if (
        (!isRetryableError(error) || attempt === MAX_REQUEST_RETRIES) &&
        error
      ) {
        throw error
      }

      const retryMs = getBackoffDelayMs(attempt)
      console.warn(
        `ECMWF ${label} failed transiently; ` +
          `retrying in ${retryMs}ms (attempt ${
            attempt + 1
          }/${MAX_REQUEST_RETRIES})`
      )
      await new Promise(resolve => setTimeout(resolve, retryMs))
    } finally {
      clearTimeout(timeout)
    }
  }

  throw new Error(`ECMWF ${label} failed after retries`)
}

async function mapWithConcurrency (items, concurrency, mapper) {
  const results = new Array(items.length)
  let nextIndex = 0

  async function worker () {
    while (true) {
      const index = nextIndex++
      if (index >= items.length) return
      results[index] = await mapper(items[index], index)
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  )
  return results
}

async function getECMWFForecast (date, cycle = '00', step = '0') {
  const url = buildForecastUrl(date, cycle, step)

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `ECMWF error: ` + `${response.status} ` + `${response.statusText}`
    )
  }

  return Buffer.from(await response.arrayBuffer())
}

async function findLatestECMWFRun (maxStep = 144) {
  const cycles = ['18', '12', '06', '00']
  const requestedStep = buildForecastSteps(maxStep).at(-1)

  const now = new Date()

  // Start with today and search backwards.
  for (let daysBack = 0; daysBack < 3; daysBack++) {
    const date = new Date(now)

    date.setUTCDate(date.getUTCDate() - daysBack)

    const dateString = date.toISOString().slice(0, 10).replaceAll('-', '')

    for (const cycle of cycles) {
      const indexUrl = buildIndexUrl(dateString, cycle, requestedStep)

      try {
        const indexText = await getECMWFIndex(dateString, cycle, requestedStep)

        if (!indexText.trim()) {
          continue
        }

        console.log(
          `Latest ECMWF run found: ${dateString} ${cycle}Z ` +
            `(horizon ${requestedStep}h)`
        )

        return {
          date: dateString,
          cycle,
          indexText
        }
      } catch (error) {
        if (error?.message?.includes('ECMWF rate limited')) {
          throw error
        }
        // Try the next cycle/run.
        continue
      }
    }
  }

  throw new Error('Could not find a recent ECMWF forecast run')
}

async function getECMWFIndex (date, cycle = '12', step = '0') {
  const cacheKey = `${date}-${cycle}-${step}`
  const cached = indexCache.get(cacheKey)
  if (cached) return cached

  const url = buildIndexUrl(date, cycle, step)

  const text = await fetchWithRetry(
    url,
    { method: 'GET' },
    response => response.text(),
    'index request'
  )
  if (indexCache.size >= MAX_CACHED_STEPS) {
    indexCache.delete(indexCache.keys().next().value)
  }
  indexCache.set(cacheKey, text)
  return text
}

async function getBuffer (date, cycle, step, param, indexEntry) {
  const cacheKey = `${date}_${cycle}_${step}_${param}`
  const cached = await getCachedBuffer(cacheKey)
  if (cached) return cached

  const gribUrl = buildForecastUrl(date, cycle, step)
  const buffer = await fetchRange(
    gribUrl,
    Number(indexEntry._offset),
    Number(indexEntry._length)
  )
  await setCachedBuffer(cacheKey, buffer)
  return buffer
}

async function getECMWFMessages ({ days = 7 } = {}) {
  if (inflightECMWFPromise) {
    return await inflightECMWFPromise
  }

  assertNotRateLimited()

  inflightECMWFPromise = (async () => {
    try {
      const maxHours = Math.min(Math.max(Number(days) || 7, 1), 14) * 24
      const steps = buildForecastSteps(maxHours)
      const latestRun = await findLatestECMWFRun(maxHours)

      const { date, cycle } = latestRun

      console.log(`ECMWF run identified: ${date} ${cycle}Z`)

      return {
        date,
        cycle,
        steps,
        getBuffer: async (step, param) => {
          const indexText = await getECMWFIndex(date, cycle, step)
          const index = parseIndex(indexText)
          const entry = findMessage(index, param, step)
          if (!entry) {
            if (param === 'tp') return null
            throw new Error(`ECMWF parameter not found: ${param} at step ${step}h`)
          }
          return getBuffer(date, cycle, step, param, entry)
        }
      }
    } finally {
      inflightECMWFPromise = null
    }
  })()

  return await inflightECMWFPromise
}

export {
  buildForecastSteps,
  fetchRange,
  findMessage,
  findLatestECMWFRun,
  getECMWFForecast,
  getECMWFIndex,
  getECMWFMessages,
  normalizeStep,
  parseIndex,
  mapWithConcurrency
}
