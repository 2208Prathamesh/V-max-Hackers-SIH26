import { getForecast as getOpenMeteoForecast } from '../openMeteo/client.js'
import { getECMWFWeather } from './ecmwf/service.js'
import { getGFSWeather } from './noaaGfs/service.js'
import { normalizeForecast } from '../normalizers/weatherNormalizer.js'
import { enqueueNWP } from './nwpQueue.js'

const AGREEMENT_SCORE_THRESHOLDS = Object.freeze({
  high: 90,
  moderate: 70
})

const SPREAD_THRESHOLDS = Object.freeze({
  temperature: { low: 1, moderate: 3 },
  precipitation: { low: 1, moderate: 5 },
  windSpeed: { low: 5, moderate: 10 }
})

/**
 * Fetch ECMWF weather with fallback
 */
async function fetchECMWF (latitude, longitude) {
  try {
    return await getECMWFWeather(latitude, longitude, 1)
  } catch {
    return null
  }
}

function extractEcmwfPoint (ecmwfData) {
  if (!ecmwfData) {
    return null
  }

  if (ecmwfData.initialCondition) {
    return {
      temperatureC: ecmwfData.initialCondition.temperature ?? null,
      feelsLikeC: ecmwfData.initialCondition.apparentTemperature ?? null,
      humidity: ecmwfData.initialCondition.humidity ?? null,
      windSpeedKmh: ecmwfData.initialCondition.windSpeed ?? null,
      precipitationMm: ecmwfData.initialCondition.precipitation ?? 0,
      pressureHpa: ecmwfData.initialCondition.pressure ?? null
    }
  }

  if (ecmwfData.forecast) {
    return {
      temperatureC: ecmwfData.forecast.temperature ?? null,
      feelsLikeC: ecmwfData.forecast.temperature ?? null,
      humidity: ecmwfData.forecast.humidity ?? null,
      windSpeedKmh: ecmwfData.forecast.windSpeed ?? null,
      precipitationMm: 0,
      pressureHpa: ecmwfData.forecast.pressure ?? null
    }
  }

  return {
    temperatureC:
      ecmwfData.temperature?.celsius ?? ecmwfData.temperature ?? null,
    feelsLikeC: ecmwfData.feelsLike?.celsius ?? null,
    humidity: ecmwfData.humidity?.relative ?? null,
    windSpeedKmh: ecmwfData.wind?.speedKmh ?? null,
    precipitationMm: ecmwfData.precipitation?.mm ?? 0,
    pressureHpa: ecmwfData.pressure?.hpa ?? null
  }
}

function canonicalTimestamp (timestamp) {
  if (timestamp == null) return null
  const parsed = new Date(timestamp)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

function forecastPoint (point, source) {
  return {
    source,
    model: source,
    leadTimeHours: point.leadTimeHours ?? null,
    temperature: point.temperature ?? null,
    precipitation: point.precipitation ?? null,
    windSpeed: point.windSpeed ?? null
  }
}

function spread (left, right) {
  if (
    left == null ||
    right == null ||
    !Number.isFinite(left) ||
    !Number.isFinite(right)
  ) {
    return null
  }
  const value = Math.abs(left - right)
  return Number(value.toFixed(3))
}

export function getAgreementLevel (score) {
  if (score == null || !Number.isFinite(score)) return 'unavailable'
  if (score >= AGREEMENT_SCORE_THRESHOLDS.high) return 'high'
  if (score >= AGREEMENT_SCORE_THRESHOLDS.moderate) return 'moderate'
  return 'low'
}

export function classifySpread (variable, meanSpread) {
  if (meanSpread == null || !Number.isFinite(meanSpread)) return 'unavailable'
  const thresholds = SPREAD_THRESHOLDS[variable]
  if (!thresholds) return 'unavailable'
  if (meanSpread < thresholds.low) return 'low'
  if (meanSpread <= thresholds.moderate) return 'moderate'
  return 'high'
}

export function alignForecasts (gfsHourly = [], ecmwfHourly = []) {
  const ecmwfByTimestamp = new Map()

  for (const point of Array.isArray(ecmwfHourly) ? ecmwfHourly : []) {
    const timestamp = canonicalTimestamp(point?.timestamp)
    if (timestamp && !ecmwfByTimestamp.has(timestamp)) {
      ecmwfByTimestamp.set(timestamp, point)
    }
  }

  return (Array.isArray(gfsHourly) ? gfsHourly : [])
    .map(point => {
      const timestamp = canonicalTimestamp(point?.timestamp)
      const ecmwfPoint = timestamp ? ecmwfByTimestamp.get(timestamp) : null
      if (!timestamp || !ecmwfPoint) return null

      const gfs = forecastPoint(point, 'NOAA-GFS')
      const ecmwf = forecastPoint(ecmwfPoint, 'ECMWF-IFS')
      return {
        timestamp,
        leadTimeHours: {
          gfs: gfs.leadTimeHours,
          ecmwf: ecmwf.leadTimeHours
        },
        gfs,
        ecmwf,
        comparison: {
          temperatureSpread: spread(gfs.temperature, ecmwf.temperature),
          precipitationSpread: spread(gfs.precipitation, ecmwf.precipitation),
          windSpeedSpread: spread(gfs.windSpeed, ecmwf.windSpeed)
        }
      }
    })
    .filter(Boolean)
    .sort((left, right) => left.timestamp.localeCompare(right.timestamp))
}

function summarizeMetric (alignedForecasts, metric) {
  const values = alignedForecasts
    .map(point => point.comparison[metric])
    .filter(value => value != null && Number.isFinite(value))

  if (values.length === 0) return { meanSpread: null, maxSpread: null }

  return {
    meanSpread: Number(
      (
        values.reduce((total, value) => total + value, 0) / values.length
      ).toFixed(3)
    ),
    maxSpread: Number(Math.max(...values).toFixed(3))
  }
}

export function summarizeAlignedForecasts (alignedForecasts = []) {
  const safeForecasts = Array.isArray(alignedForecasts) ? alignedForecasts : []
  const temperature = summarizeMetric(safeForecasts, 'temperatureSpread')
  const precipitation = summarizeMetric(safeForecasts, 'precipitationSpread')
  const windSpeed = summarizeMetric(safeForecasts, 'windSpeedSpread')
  const metricMeans = [
    temperature.meanSpread == null ? null : temperature.meanSpread / 10,
    precipitation.meanSpread == null ? null : precipitation.meanSpread / 10,
    windSpeed.meanSpread == null ? null : windSpeed.meanSpread / 20
  ].filter(value => value != null && Number.isFinite(value))
  const averageNormalizedSpread = metricMeans.length
    ? metricMeans.reduce((total, value) => total + value, 0) /
      metricMeans.length
    : null
  const modelAgreementScore =
    averageNormalizedSpread == null
      ? null
      : Math.round(
          Math.max(0, Math.min(100, 100 - averageNormalizedSpread * 100))
        )

  return {
    matchedTimestamps: safeForecasts.length,
    temperature,
    precipitation,
    windSpeed,
    modelAgreementScore
  }
}

export function findLargestDisagreement (alignedForecasts = []) {
  let largest = null
  const variables = [
    ['temperature', 'temperatureSpread'],
    ['precipitation', 'precipitationSpread'],
    ['windSpeed', 'windSpeedSpread']
  ]

  for (const point of Array.isArray(alignedForecasts) ? alignedForecasts : []) {
    for (const [variable, spreadKey] of variables) {
      const currentSpread = point?.comparison?.[spreadKey]
      const gfsValue = point?.gfs?.[variable]
      const ecmwfValue = point?.ecmwf?.[variable]
      if (
        currentSpread == null ||
        gfsValue == null ||
        ecmwfValue == null ||
        !Number.isFinite(currentSpread)
      ) {
        continue
      }

      if (!largest || currentSpread > largest.spread) {
        largest = {
          timestamp: point.timestamp,
          variable,
          spread: currentSpread,
          gfsValue,
          ecmwfValue
        }
      }
    }
  }

  return largest
}

export function buildForecastUncertainty (alignedForecasts = []) {
  const summary = summarizeAlignedForecasts(alignedForecasts)
  return {
    agreementLevel: getAgreementLevel(summary.modelAgreementScore),
    modelAgreementScore: summary.modelAgreementScore,
    uncertainty: {
      temperature: classifySpread(
        'temperature',
        summary.temperature.meanSpread
      ),
      precipitation: classifySpread(
        'precipitation',
        summary.precipitation.meanSpread
      ),
      windSpeed: classifySpread('windSpeed', summary.windSpeed.meanSpread)
    },
    largestDisagreement: findLargestDisagreement(alignedForecasts),
    matchedTimestamps: summary.matchedTimestamps
  }
}

export function buildNWPModelComparison ({ gfs, ecmwf } = {}) {
  const nativeGfs = gfs?.source === 'NOAA-GFS' ? gfs : null
  const nativeEcmwf = ecmwf?.source === 'ECMWF-IFS' ? ecmwf : null
  const alignedForecasts = alignForecasts(
    nativeGfs?.hourly,
    nativeEcmwf?.hourly
  )
  const summary = summarizeAlignedForecasts(alignedForecasts)

  return {
    alignedForecasts,
    summary,
    matchedTimestamps: summary.matchedTimestamps,
    modelAgreementScore: summary.modelAgreementScore,
    forecastUncertainty: buildForecastUncertainty(alignedForecasts)
  }
}

/**
 * Compare aligned ECMWF and NOAA GFS Numerical Weather Predictions.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<object>}
 */
export async function compareNWPModels (latitude, longitude) {
  const openMeteoPromise = getOpenMeteoForecast(latitude, longitude).catch(
    () => null
  )
  const locKey = `${Number(latitude).toFixed(2)}_${Number(longitude).toFixed(
    2
  )}`
  const { ecmwfData, gfsRaw } = await enqueueNWP(locKey, async () => {
    const ecmwf = await fetchECMWF(latitude, longitude)
    await new Promise(resolve => setImmediate(resolve))
    if (global.gc) global.gc()
    const gfs = await getGFSWeather(latitude, longitude, 1).catch(() => null)
    return { ecmwfData: ecmwf, gfsRaw: gfs }
  })
  const openMeteoRaw = await openMeteoPromise

  const openMeteoNorm = openMeteoRaw
    ? normalizeForecast(openMeteoRaw, 'Open-Meteo')
    : null
  const gfsNorm = gfsRaw

  const models = []

  if (openMeteoNorm?.current) {
    models.push({
      modelName: 'Open-Meteo Global Best Match',
      provider: 'Open-Meteo Consortium',
      source: 'Open-Meteo',
      temperatureC: openMeteoNorm.current.temperature ?? null,
      feelsLikeC: openMeteoNorm.current.apparentTemperature ?? null,
      humidity: openMeteoNorm.current.humidity ?? null,
      windSpeedKmh: openMeteoNorm.current.windSpeed ?? null,
      precipitationMm: openMeteoNorm.current.precipitation ?? 0,
      pressureHpa: openMeteoNorm.current.pressure ?? null
    })
  }

  const ecmwfPoint = extractEcmwfPoint(ecmwfData)

  if (ecmwfPoint) {
    models.push({
      modelName: 'ECMWF IFS (Integrated Forecast System)',
      provider: 'European Centre for Medium-Range Weather Forecasts',
      source: 'ECMWF-IFS',
      temperatureC: ecmwfPoint.temperatureC,
      feelsLikeC: ecmwfPoint.feelsLikeC,
      humidity: ecmwfPoint.humidity,
      windSpeedKmh: ecmwfPoint.windSpeedKmh,
      precipitationMm: ecmwfPoint.precipitationMm,
      pressureHpa: ecmwfPoint.pressureHpa
    })
  }

  if (gfsNorm?.initialCondition) {
    models.push({
      modelName: 'NOAA GFS (Global Forecast System)',
      provider: 'National Oceanic and Atmospheric Administration (USA)',
      source: 'NOAA-GFS',
      temperatureC: gfsNorm.initialCondition.temperature ?? null,
      feelsLikeC: gfsNorm.initialCondition.apparentTemperature ?? null,
      humidity: gfsNorm.initialCondition.humidity ?? null,
      windSpeedKmh: gfsNorm.initialCondition.windSpeed ?? null,
      precipitationMm: gfsNorm.initialCondition.precipitation ?? 0,
      pressureHpa: gfsNorm.initialCondition.pressure ?? null
    })
  }

  const nwpComparison = buildNWPModelComparison({
    gfs: gfsNorm,
    ecmwf: ecmwfData
  })

  const validTemps = models
    .map(m => m.temperatureC)
    .filter(t => t !== null && !Number.isNaN(t))
  const validRains = models
    .map(m => m.precipitationMm)
    .filter(r => r !== null && !Number.isNaN(r))
  const validWinds = models
    .map(m => m.windSpeedKmh)
    .filter(w => w !== null && !Number.isNaN(w))

  const meanTemp =
    validTemps.length > 0
      ? parseFloat(
          (validTemps.reduce((a, b) => a + b, 0) / validTemps.length).toFixed(1)
        )
      : null

  const tempSpread =
    validTemps.length > 1
      ? parseFloat(
          (Math.max(...validTemps) - Math.min(...validTemps)).toFixed(1)
        )
      : 0

  const maxRain = validRains.length > 0 ? Math.max(...validRains) : 0
  const minRain = validRains.length > 0 ? Math.min(...validRains) : 0
  const rainSpread = parseFloat((maxRain - minRain).toFixed(1))

  const avgWind =
    validWinds.length > 0
      ? parseFloat(
          (validWinds.reduce((a, b) => a + b, 0) / validWinds.length).toFixed(1)
        )
      : null

  const modelAgreementScore = nwpComparison.modelAgreementScore
  const confidenceCategory =
    modelAgreementScore == null
      ? 'Unavailable'
      : modelAgreementScore >= 80
      ? 'High'
      : modelAgreementScore >= 60
      ? 'Moderate'
      : 'Low'
  const agreementSummary = nwpComparison.matchedTimestamps
    ? `GFS and ECMWF have ${nwpComparison.matchedTimestamps} exactly matched forecast timestamps.`
    : 'GFS and ECMWF have no exactly matched forecast timestamps.'

  return {
    location: {
      latitude,
      longitude
    },
    consensus: {
      temperatureC: meanTemp,
      temperatureSpreadC: tempSpread,
      avgWindSpeedKmh: avgWind,
      maxExpectedRainMm: maxRain,
      modelAgreementScore,
      confidenceScore: modelAgreementScore,
      confidenceCategory,
      agreementSummary
    },
    comparedModelsCount: models.length,
    models,
    matchedTimestamps: nwpComparison.matchedTimestamps,
    modelAgreementScore,
    ...nwpComparison
  }
}

export default {
  compareNWPModels
}
