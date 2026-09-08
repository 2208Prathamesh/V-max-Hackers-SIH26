import { parseGribIndex } from '@mattnucc/gribberish'
import { getCachedBuffer, setCachedBuffer } from '../../../../utils/nwpCache.js'

const BASE_URL = 'https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod'
const MAX_CACHE_ENTRIES = 80
const indexCache = new Map()
let inflightRequest = null

function buildForecastSteps (maxHours = 144) {
  const cappedHours = Math.max(0, Number(maxHours) || 144)
  const steps = []
  for (let step = 0; step <= Math.min(cappedHours, 144); step += 3)
    steps.push(step)
  for (let step = 150; step <= cappedHours; step += 6) steps.push(step)
  return steps
}

function formatStep (step) {
  return String(step).padStart(3, '0')
}

function formatDate (date) {
  return date.toISOString().slice(0, 10).replaceAll('-', '')
}

function buildFileUrl (date, cycle, step) {
  return `${BASE_URL}/gfs.${date}/${cycle}/atmos/gfs.t${cycle}z.pgrb2.0p25.f${formatStep(
    step
  )}`
}

function findEntry (entries, variable, level) {
  return entries.find(entry => entry.var === variable && entry.level === level)
}

async function getIndex (date, cycle, step) {
  const key = `${date}-${cycle}-${step}`
  if (indexCache.has(key)) return indexCache.get(key)

  const response = await fetch(`${buildFileUrl(date, cycle, step)}.idx`)
  if (!response.ok) throw new Error(`NOAA GFS index error: ${response.status}`)

  const entries = parseGribIndex(await response.text())
  if (indexCache.size >= MAX_CACHE_ENTRIES)
    indexCache.delete(indexCache.keys().next().value)
  indexCache.set(key, entries)
  return entries
}

async function fetchRange (url, offset, length) {
  const response = await fetch(url, {
    headers: { Range: `bytes=${offset}-${offset + length - 1}` }
  })
  if (!response.ok) throw new Error(`NOAA GFS range error: ${response.status}`)
  return Buffer.from(await response.arrayBuffer())
}

async function findLatestGFSRun (maxStep = 144) {
  const cycles = ['18', '12', '06', '00']
  const requestedStep = buildForecastSteps(maxStep).at(-1)
  const now = new Date()

  for (let daysBack = 0; daysBack < 3; daysBack++) {
    const date = new Date(now)
    date.setUTCDate(date.getUTCDate() - daysBack)
    const dateString = formatDate(date)

    for (const cycle of cycles) {
      try {
        const entries = await getIndex(dateString, cycle, requestedStep)
        if (entries.length) {
          console.log(
            `Latest NOAA GFS run found: ${dateString} ${cycle}Z (horizon ${requestedStep}h)`
          )
          return { date: dateString, cycle }
        }
      } catch {
        // Try the next cycle/run while data is being published.
      }
    }
  }

  throw new Error('Could not find a recent NOAA GFS forecast run')
}

async function getBuffer (date, cycle, step, name, indexEntry) {
  const cacheKey = `${date}_${cycle}_${step}_${name}`
  const cached = await getCachedBuffer(cacheKey)
  if (cached) return cached

  const url = buildFileUrl(date, cycle, step)
  const buffer = await fetchRange(url, indexEntry.offset, indexEntry.length)
  await setCachedBuffer(cacheKey, buffer)
  return buffer
}

async function getGFSMessages ({ days = 7 } = {}) {
  if (inflightRequest) return await inflightRequest

  inflightRequest = (async () => {
    try {
      const maxHours = Math.min(Math.max(Number(days) || 7, 1), 14) * 24
      const steps = buildForecastSteps(maxHours)
      const run = await findLatestGFSRun(maxHours)
      const { date, cycle } = run

      return {
        date,
        cycle,
        steps,
        getBuffer: async (step, name) => {
          const entries = await getIndex(date, cycle, step)
          const fields = {
            temperature: ['TMP', '2 m above ground'],
            humidity: ['RH', '2 m above ground'],
            dewPoint: ['DPT', '2 m above ground'],
            uWind: ['UGRD', '10 m above ground'],
            vWind: ['VGRD', '10 m above ground'],
            pressure: ['PRMSL', 'mean sea level'],
            precipitation: ['APCP', 'surface']
          }
          const [variable, level] = fields[name]
          const entry = findEntry(entries, variable, level)
          if (!entry || entry.length == null) {
            if (name === 'precipitation' && step === 0) {
              return null
            }
            throw new Error(`NOAA GFS parameter not found: ${variable} ${level} at ${step}h`)
          }
          return getBuffer(date, cycle, step, name, entry)
        }
      }
    } finally {
      inflightRequest = null
    }
  })()

  return await inflightRequest
}

async function getGFSForecast (latitude, longitude, days = 7) {
  return await getGFSMessages({ days, latitude, longitude })
}

export {
  buildFileUrl,
  buildForecastSteps,
  findEntry,
  findLatestGFSRun,
  getGFSForecast,
  getGFSMessages,
  parseGribIndex
}
