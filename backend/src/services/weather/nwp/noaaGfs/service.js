import { GribMessage } from '@mattnucc/gribberish'
import { getGFSMessages } from './client.js'
import { normalizeGFS, getValue } from './normalizer.js'

function parseMessage (buffer, name) {
  try {
    if (!buffer) return null
    return GribMessage.parseFromBuffer(new Uint8Array(buffer), 0)
  } catch (error) {
    console.error(`GRIB parsing error for ${name}: ${error.message}`)
    return null
  }
}

function buildTimestamp (message) {
  return message.forecastDate.toISOString()
}

function buildRunMetadata (date, cycle, steps, now = new Date()) {
  const runTime = new Date(
    `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(
      6,
      8
    )}T${cycle}:00:00.000Z`
  )
  const ageHours = Number.isNaN(runTime.getTime())
    ? null
    : Math.max(0, (now.getTime() - runTime.getTime()) / 3600000)

  return {
    date,
    cycle,
    runTime: Number.isNaN(runTime.getTime()) ? null : runTime.toISOString(),
    model: 'NOAA-GFS',
    forecastHorizonHours: steps.length ? Number(steps.at(-1)) : null,
    ageHours
  }
}

function calculateIntervalPrecipitation (previousAccumulated, accumulated) {
  if (previousAccumulated == null || accumulated == null) return null
  return Math.max(0, accumulated - previousAccumulated)
}

function buildHourlyPoint (step, timestamp, forecast, precipitation) {
  return {
    time: timestamp,
    timestamp,
    leadTimeHours: Number(step),
    temperature: forecast.temperature,
    dewPoint: forecast.dewPoint,
    humidity: forecast.humidity,
    pressure: forecast.pressure,
    windSpeed: forecast.windSpeed,
    windDirection: forecast.windDirection,
    precipitation,
    precipitationProbability: null,
    weatherCode: null,
    weatherDescription: 'Weather data available'
  }
}

function buildNwpSemantics (hourly) {
  const initialCondition = hourly[0] || null
  return {
    dataType: 'nwp_forecast',
    initialConditionType: 'model_initial_condition',
    initialCondition: initialCondition
      ? { ...initialCondition, condition: 'Weather data available' }
      : null,
    current: initialCondition
      ? {
          ...initialCondition,
          condition: 'Weather data available',
          dataType: 'nwp_forecast',
          initialConditionType: 'model_initial_condition'
        }
      : null
  }
}

function buildDailyForecast (hourly) {
  const grouped = new Map()
  for (const point of hourly) {
    const date = point.timestamp.slice(0, 10)
    const day = grouped.get(date) || {
      date,
      temperatures: [],
      precipitation: 0,
      hasPrecipitation: false,
      windSpeeds: []
    }
    if (point.temperature != null) day.temperatures.push(point.temperature)
    if (point.precipitation != null) {
      day.precipitation += point.precipitation
      day.hasPrecipitation = true
    }
    if (point.windSpeed != null) day.windSpeeds.push(point.windSpeed)
    grouped.set(date, day)
  }
  return [...grouped.values()].map(day => ({
    date: day.date,
    maxTemperature: day.temperatures.length
      ? Math.max(...day.temperatures)
      : null,
    minTemperature: day.temperatures.length
      ? Math.min(...day.temperatures)
      : null,
    precipitation: day.hasPrecipitation
      ? Number(day.precipitation.toFixed(3))
      : null,
    precipitationSum: day.hasPrecipitation
      ? Number(day.precipitation.toFixed(3))
      : null,
    precipitationProbability: null,
    maxWindSpeed: day.windSpeeds.length ? Math.max(...day.windSpeeds) : null,
    weatherCode: null,
    weatherDescription: 'Weather data available'
  }))
}

export async function getGFSWeather (latitude, longitude, days = 2) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number')
    throw new Error('Latitude and longitude must be numbers')
  if (latitude < -90 || latitude > 90)
    throw new Error('Latitude must be between -90 and 90')
  if (longitude < -180 || longitude > 180)
    throw new Error('Longitude must be between -180 and 180')

  // Cap native GRIB ingestion horizon to max 48h (2 days) to avoid out-of-memory panics
  // from downloading and decompressing hundreds of global GRIB slices in a single request.
  const cappedDays = Math.min(Math.max(Number(days) || 1, 1), 2)
  const { date, cycle, getBuffer, steps } = await getGFSMessages({ days: cappedDays })
  const hourly = []
  let previousAccumulatedPrecipitation = null
  let gridLocation = null

  for (const step of steps) {
    try {
      // Parse variables sequentially to ensure only 1 GribMessage exists in memory at any instant.
      const tempBuf = await getBuffer(step, 'temperature')
      let msgTemp = parseMessage(tempBuf, 'temperature')
      const timestamp = msgTemp ? buildTimestamp(msgTemp) : null
      const tempVal = getValue(msgTemp, { latitude, longitude })
      msgTemp = null

      const humBuf = await getBuffer(step, 'humidity')
      let msgHum = parseMessage(humBuf, 'humidity')
      const humVal = getValue(msgHum, { latitude, longitude })
      msgHum = null

      const dpBuf = await getBuffer(step, 'dewPoint')
      let msgDp = parseMessage(dpBuf, 'dewPoint')
      const dpVal = getValue(msgDp, { latitude, longitude })
      msgDp = null

      const uBuf = await getBuffer(step, 'uWind')
      let msgU = parseMessage(uBuf, 'uWind')
      const uVal = getValue(msgU, { latitude, longitude })
      msgU = null

      const vBuf = await getBuffer(step, 'vWind')
      let msgV = parseMessage(vBuf, 'vWind')
      const vVal = getValue(msgV, { latitude, longitude })
      msgV = null

      const pBuf = await getBuffer(step, 'pressure')
      let msgP = parseMessage(pBuf, 'pressure')
      const pVal = getValue(msgP, { latitude, longitude })
      msgP = null

      const prBuf = await getBuffer(step, 'precipitation')
      let msgPr = prBuf ? parseMessage(prBuf, 'precipitation') : null
      const prVal = getValue(msgPr, { latitude, longitude })
      msgPr = null

      const parsed = {
        temperature: tempVal,
        humidity: humVal,
        dewPoint: dpVal,
        uWind: uVal,
        vWind: vVal,
        pressure: pVal,
        precipitation: prVal
      }

      const normalized = normalizeGFS(
        parsed,
        { latitude, longitude },
        timestamp
      )

      gridLocation = gridLocation || normalized.location
      const accumulated = normalized.forecast.precipitation
      const intervalPrecipitation = calculateIntervalPrecipitation(
        previousAccumulatedPrecipitation,
        accumulated
      )
      previousAccumulatedPrecipitation = accumulated
      hourly.push(
        buildHourlyPoint(
          step,
          timestamp,
          normalized.forecast,
          intervalPrecipitation
        )
      )
    } catch (err) {
      console.error(`GFS parsing failed for step ${step}: ${err.message}`)
      // Continue to next step if one fails
    } finally {
      // Yield with setImmediate between forecast steps to permit GC and keep memory bounded
      await new Promise(resolve => setImmediate(resolve))
    }
  }

  const nwpSemantics = buildNwpSemantics(hourly)
  return {
    source: 'NOAA-GFS',
    sourceType: 'provider',
    isFallback: false,
    ...nwpSemantics,
    retrievedAt: new Date().toISOString(),
    location: {
      latitude,
      longitude,
      timezone: 'UTC',
      gridLatitude: gridLocation?.gridLatitude ?? null,
      gridLongitude: gridLocation?.gridLongitude ?? null
    },
    hourly,
    daily: buildDailyForecast(hourly),
    run: buildRunMetadata(date, cycle, steps),
    steps
  }
}

export {
  buildDailyForecast,
  buildTimestamp,
  buildRunMetadata,
  buildHourlyPoint,
  buildNwpSemantics,
  calculateIntervalPrecipitation,
  parseMessage
}
