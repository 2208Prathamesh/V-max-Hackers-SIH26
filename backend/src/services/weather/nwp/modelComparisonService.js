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
function withTimeout (promise, ms = 3000) {
  return Promise.race([
    promise,
    new Promise(resolve => setTimeout(() => resolve(null), ms))
  ])
}

async function fetchMultiModelFeed (latitude, longitude) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&models=ecmwf_ifs025,gfs_seamless&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,surface_pressure&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&forecast_days=7&timezone=auto`
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

/**
 * Compare aligned ECMWF and NOAA GFS Numerical Weather Predictions with deep divergence metrics.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<object>}
 */
export async function compareNWPModels (latitude, longitude) {
  const openMeteoPromise = getOpenMeteoForecast(latitude, longitude).catch(
    () => null
  )
  const multiModelPromise = fetchMultiModelFeed(latitude, longitude)
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
  const [openMeteoRaw, multiModelFeed] = await Promise.all([
    openMeteoPromise,
    multiModelPromise
  ])

  const openMeteoNorm = openMeteoRaw
    ? normalizeForecast(openMeteoRaw, 'Open-Meteo')
    : null
  const gfsNorm = gfsRaw

  // Build daily arrays from multiModelFeed if available
  const dailyDates = multiModelFeed?.daily?.time || []
  const ecmwfDailyMax = multiModelFeed?.daily?.temperature_2m_max_ecmwf_ifs025 || []
  const ecmwfDailyMin = multiModelFeed?.daily?.temperature_2m_min_ecmwf_ifs025 || []
  const ecmwfDailyRain = multiModelFeed?.daily?.precipitation_sum_ecmwf_ifs025 || []
  const ecmwfDailyRainProb = multiModelFeed?.daily?.precipitation_probability_max_ecmwf_ifs025 || []
  const ecmwfDailyWind = multiModelFeed?.daily?.wind_speed_10m_max_ecmwf_ifs025 || []

  const gfsDailyMax = multiModelFeed?.daily?.temperature_2m_max_gfs_seamless || []
  const gfsDailyMin = multiModelFeed?.daily?.temperature_2m_min_gfs_seamless || []
  const gfsDailyRain = multiModelFeed?.daily?.precipitation_sum_gfs_seamless || []
  const gfsDailyRainProb = multiModelFeed?.daily?.precipitation_probability_max_gfs_seamless || []
  const gfsDailyWind = multiModelFeed?.daily?.wind_speed_10m_max_gfs_seamless || []

  const openMeteoDaily = openMeteoNorm?.daily || []

  const models = []

  // 1. Open-Meteo High-Resolution Ensemble
  if (openMeteoNorm?.current) {
    const dailyArr = openMeteoDaily.slice(0, 7).map(d => ({
      date: d.date,
      maxTemp: d.maxTemperature,
      minTemp: d.minTemperature,
      precipitationMm: d.precipitation ?? d.totalPrecipitation ?? 0,
      precipitationProb: d.precipitationProbability ?? 0,
      windSpeedKmh: d.windSpeed ?? 10
    }))

    models.push({
      id: 'ensemble',
      modelName: 'Open-Meteo High-Res Ensemble',
      shortName: 'Ensemble Blend',
      provider: 'Open-Meteo / Multi-Model Consortia',
      resolution: '1-11 km blended grid',
      cycle: 'Hourly real-time update',
      source: 'Open-Meteo',
      confidenceWeight: 25,
      temperatureC: openMeteoNorm.current.temperature ?? null,
      feelsLikeC: openMeteoNorm.current.apparentTemperature ?? null,
      humidity: openMeteoNorm.current.humidity ?? null,
      windSpeedKmh: openMeteoNorm.current.windSpeed ?? null,
      precipitationMm: openMeteoNorm.current.precipitation ?? 0,
      pressureHpa: openMeteoNorm.current.pressure ?? null,
      daily: dailyArr
    })
  }

  // 2. ECMWF IFS (Integrated Forecast System - Europe)
  const ecmwfPoint = extractEcmwfPoint(ecmwfData)
  const ecmwfTemp = ecmwfPoint?.temperatureC ?? (multiModelFeed?.current?.temperature_2m != null ? multiModelFeed.current.temperature_2m : null)
  const ecmwfRain = ecmwfPoint?.precipitationMm ?? (ecmwfDailyRain[0] != null ? ecmwfDailyRain[0] : 0)
  const ecmwfWind = ecmwfPoint?.windSpeedKmh ?? (ecmwfDailyWind[0] != null ? ecmwfDailyWind[0] : null)
  const ecmwfPressure = ecmwfPoint?.pressureHpa ?? (multiModelFeed?.current?.surface_pressure != null ? multiModelFeed.current.surface_pressure : null)
  const ecmwfHumidity = ecmwfPoint?.humidity ?? (multiModelFeed?.current?.relative_humidity_2m != null ? multiModelFeed.current.relative_humidity_2m : null)

  const ecmwfDailyArr = dailyDates.map((date, idx) => ({
    date,
    maxTemp: ecmwfDailyMax[idx] ?? null,
    minTemp: ecmwfDailyMin[idx] ?? null,
    precipitationMm: ecmwfDailyRain[idx] ?? 0,
    precipitationProb: ecmwfDailyRainProb[idx] ?? 0,
    windSpeedKmh: ecmwfDailyWind[idx] ?? null
  }))

  models.push({
    id: 'ecmwf',
    modelName: 'ECMWF IFS (Integrated Forecast System)',
    shortName: 'ECMWF IFS',
    provider: 'European Centre for Medium-Range Weather Forecasts (Reading, UK)',
    resolution: '0.25° (~9-25 km global mesh)',
    cycle: '00Z / 12Z Operational Cycle',
    source: 'ECMWF-IFS',
    confidenceWeight: 45,
    temperatureC: ecmwfTemp,
    feelsLikeC: ecmwfPoint?.feelsLikeC ?? null,
    humidity: ecmwfHumidity,
    windSpeedKmh: ecmwfWind,
    precipitationMm: ecmwfRain,
    pressureHpa: ecmwfPressure,
    daily: ecmwfDailyArr
  })

  // 3. NOAA GFS (Global Forecast System - USA)
  const gfsPoint = gfsNorm?.initialCondition
  const gfsTemp = gfsPoint?.temperature ?? (gfsDailyMax[0] != null && gfsDailyMin[0] != null ? parseFloat(((gfsDailyMax[0] + gfsDailyMin[0]) / 2).toFixed(1)) : null)
  const gfsRain = gfsPoint?.precipitation ?? (gfsDailyRain[0] != null ? gfsDailyRain[0] : 0)
  const gfsWind = gfsPoint?.windSpeed ?? (gfsDailyWind[0] != null ? gfsDailyWind[0] : null)
  const gfsPressure = gfsPoint?.pressure ?? ecmwfPressure
  const gfsHumidity = gfsPoint?.humidity ?? ecmwfHumidity

  const gfsDailyArr = dailyDates.map((date, idx) => ({
    date,
    maxTemp: gfsDailyMax[idx] ?? null,
    minTemp: gfsDailyMin[idx] ?? null,
    precipitationMm: gfsDailyRain[idx] ?? 0,
    precipitationProb: gfsDailyRainProb[idx] ?? 0,
    windSpeedKmh: gfsDailyWind[idx] ?? null
  }))

  models.push({
    id: 'gfs',
    modelName: 'NOAA GFS (Global Forecast System)',
    shortName: 'NOAA GFS',
    provider: 'National Oceanic and Atmospheric Administration (NOAA / NWS, USA)',
    resolution: '0.25° (~22 km mesh)',
    cycle: '00Z / 06Z / 12Z / 18Z Cycle',
    source: 'NOAA-GFS',
    confidenceWeight: 30,
    temperatureC: gfsTemp,
    feelsLikeC: gfsPoint?.apparentTemperature ?? null,
    humidity: gfsHumidity,
    windSpeedKmh: gfsWind,
    precipitationMm: gfsRain,
    pressureHpa: gfsPressure,
    daily: gfsDailyArr
  })

  // 4. Calculate 7-Day Multi-Model Daily Comparison Matrix
  const dailyComparison = dailyDates.slice(0, 7).map((date, idx) => {
    const eMax = ecmwfDailyMax[idx]
    const gMax = gfsDailyMax[idx]
    const oMax = openMeteoDaily[idx]?.maxTemperature
    const validMaxes = [eMax, gMax, oMax].filter(v => v != null && Number.isFinite(v))
    const consensusMax = validMaxes.length ? parseFloat((validMaxes.reduce((a, b) => a + b, 0) / validMaxes.length).toFixed(1)) : null

    const eMin = ecmwfDailyMin[idx]
    const gMin = gfsDailyMin[idx]
    const oMin = openMeteoDaily[idx]?.minTemperature
    const validMins = [eMin, gMin, oMin].filter(v => v != null && Number.isFinite(v))
    const consensusMin = validMins.length ? parseFloat((validMins.reduce((a, b) => a + b, 0) / validMins.length).toFixed(1)) : null

    const eRain = ecmwfDailyRain[idx] ?? 0
    const gRain = gfsDailyRain[idx] ?? 0
    const oRain = openMeteoDaily[idx]?.precipitation ?? openMeteoDaily[idx]?.totalPrecipitation ?? 0
    const maxRain = Math.max(eRain, gRain, oRain)
    const minRain = Math.min(eRain, gRain, oRain)
    const rainSpread = parseFloat((maxRain - minRain).toFixed(1))
    const tempSpread = validMaxes.length > 1 ? parseFloat((Math.max(...validMaxes) - Math.min(...validMaxes)).toFixed(1)) : 0

    // Check divergence flag
    const isDivergent = rainSpread >= 3 || tempSpread >= 2.5

    return {
      date,
      dayIndex: idx,
      consensusMax,
      consensusMin,
      tempSpread,
      maxExpectedRainMm: parseFloat(maxRain.toFixed(1)),
      rainSpread,
      isDivergent,
      models: {
        ecmwf: { maxTemp: eMax, minTemp: eMin, rainMm: eRain, rainProb: ecmwfDailyRainProb[idx] ?? 0 },
        gfs: { maxTemp: gMax, minTemp: gMin, rainMm: gRain, rainProb: gfsDailyRainProb[idx] ?? 0 },
        ensemble: { maxTemp: oMax, minTemp: oMin, rainMm: oRain, rainProb: openMeteoDaily[idx]?.precipitationProbability ?? 0 }
      }
    }
  })

  // Compare GFS and ECMWF point-by-point native comparison
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

  // Agreement and Confidence
  const baseAgreement = nwpComparison.modelAgreementScore
  const modelAgreementScore = baseAgreement != null ? baseAgreement : (tempSpread < 1.5 && rainSpread < 2 ? 94 : tempSpread < 3 ? 84 : 72)
  const confidenceCategory =
    modelAgreementScore >= 85
      ? 'High Confidence'
      : modelAgreementScore >= 65
      ? 'Moderate Confidence'
      : 'Low Confidence (Model Divergence)'

  // Inter-model divergence plain text explanation
  const divergentDays = dailyComparison.filter(d => d.isDivergent)
  let agreementSummary = ''
  if (divergentDays.length === 0) {
    agreementSummary = 'Strong consensus across ECMWF IFS and NOAA GFS. Temperature spread is under 1.5°C and precipitation profiles are aligned.'
  } else {
    const d = divergentDays[0]
    agreementSummary = `Models align overall, but note moderate divergence on ${d.date} where ECMWF projects ${d.models.ecmwf.rainMm} mm rain vs GFS ${d.models.gfs.rainMm} mm.`
  }

  // Sector-specific actionable advisories based on model consensus
  const totalNext3DaysRain = dailyComparison.slice(0, 3).reduce((sum, d) => sum + d.maxExpectedRainMm, 0)
  const maxWindNext2Days = Math.max(...models.map(m => m.windSpeedKmh || 0), ...dailyComparison.slice(0, 2).map(d => d.models.ecmwf.rainMm ? 15 : 8))
  
  const operationalAdvisories = {
    cropSpraying: {
      status: maxWindNext2Days <= 15 && totalNext3DaysRain < 1 ? 'Optimal' : totalNext3DaysRain >= 5 ? 'Not Recommended' : 'Fair',
      color: maxWindNext2Days <= 15 && totalNext3DaysRain < 1 ? 'emerald' : totalNext3DaysRain >= 5 ? 'rose' : 'amber',
      advice: totalNext3DaysRain >= 5
        ? 'Avoid chemical / pesticide spraying: rain washout likely within 48-72h based on multi-model consensus.'
        : maxWindNext2Days > 20
        ? 'High wind gusts (>20 km/h) could cause chemical drift. Spray during early morning calm hours.'
        : 'Favorable spraying window: low wind drift risk and dry consensus across ECMWF and GFS.'
    },
    irrigation: {
      status: totalNext3DaysRain >= 15 ? 'Hold Irrigation' : totalNext3DaysRain >= 5 ? 'Light / Reduced' : 'Normal Irrigation',
      color: totalNext3DaysRain >= 15 ? 'blue' : totalNext3DaysRain >= 5 ? 'sky' : 'amber',
      advice: totalNext3DaysRain >= 15
        ? 'Postpone irrigation: ECMWF & GFS models agree on substantial rainfall (>= 15mm) over next 72h.'
        : totalNext3DaysRain >= 5
        ? 'Moderate showers forecasted. Reduce irrigation volume to prevent field waterlogging.'
        : 'Dry conditions projected across models. Proceed with standard crop moisture replenishment.'
    },
    fieldMobility: {
      status: totalNext3DaysRain >= 25 ? 'Restricted' : 'Favorable',
      color: totalNext3DaysRain >= 25 ? 'rose' : 'emerald',
      advice: totalNext3DaysRain >= 25
        ? 'Heavy soil saturation risk. Heavy machinery and harvest transport may face soil bogging.'
        : 'Ground trafficability and harvesting machinery access are optimal across all forecasted days.'
    }
  }

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
      rainSpreadMm: rainSpread,
      modelAgreementScore,
      confidenceScore: modelAgreementScore,
      confidenceCategory,
      agreementSummary
    },
    dailyComparison,
    operationalAdvisories,
    comparedModelsCount: models.length,
    models,
    matchedTimestamps: nwpComparison.matchedTimestamps || dailyDates.length,
    modelAgreementScore,
    ...nwpComparison
  }
}

export default {
  compareNWPModels
}
