import { getECMWFMessages } from './client.js'
import { GribMessage, GribMessageFactory } from '@mattnucc/gribberish'

import { normalizeECMWF, getValue } from './normalizer.js'

function parseMessage (buffer, param) {
  try {
    if (!buffer) return null
    if (typeof GribMessage?.parseFromBuffer === 'function') {
      return GribMessage.parseFromBuffer(new Uint8Array(buffer), 0)
    }
    const factory = GribMessageFactory.fromBuffer(new Uint8Array(buffer))

    if (factory.availableMessages.length === 0) {
      throw new Error(`No GRIB message found for ${param}`)
    }

    return factory.getMessage(factory.availableMessages[0])
  } catch (error) {
    console.error(`GRIB parsing error for ${param}: ${error.message}`)
    return null
  }
}

function buildTimestamp (date, cycle, step) {
  const timestamp = new Date(
    `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(
      6,
      8
    )}T${cycle}:00:00.000Z`
  )
  timestamp.setUTCHours(timestamp.getUTCHours() + Number(step))
  return timestamp.toISOString()
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
    model: 'ECMWF-IFS',
    forecastHorizonHours: steps.length ? Number(steps.at(-1)) : null,
    ageHours
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

export async function getECMWFWeather (latitude, longitude, days = 7) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new Error('Latitude and longitude must be numbers')
  }
  if (latitude < -90 || latitude > 90) {
    throw new Error('Latitude must be between -90 and 90')
  }
  if (longitude < -180 || longitude > 180) {
    throw new Error('Longitude must be between -180 and 180')
  }
  const cappedDays = Math.min(Math.max(Number(days) || 1, 1), 1)
  const { date, cycle, getBuffer, steps } = await getECMWFMessages({ days: cappedDays })
  const hourly = []
  let previousAccumulatedPrecipitation = null
  let gridLocation = null
  for (const step of steps) {
    try {
      // 1. Temperature (2t)
      const buf2t = await getBuffer(step, '2t')
      let msg2t = parseMessage(buf2t, '2t')
      const val2t = getValue(msg2t, { latitude, longitude })
      msg2t = null

      // 2. Dew Point (2d)
      const buf2d = await getBuffer(step, '2d')
      let msg2d = parseMessage(buf2d, '2d')
      const val2d = getValue(msg2d, { latitude, longitude })
      msg2d = null

      // 3. U-Wind (10u)
      const buf10u = await getBuffer(step, '10u')
      let msg10u = parseMessage(buf10u, '10u')
      const val10u = getValue(msg10u, { latitude, longitude })
      msg10u = null

      // 4. V-Wind (10v)
      const buf10v = await getBuffer(step, '10v')
      let msg10v = parseMessage(buf10v, '10v')
      const val10v = getValue(msg10v, { latitude, longitude })
      msg10v = null

      // 5. Pressure (msl)
      const bufMsl = await getBuffer(step, 'msl')
      let msgMsl = parseMessage(bufMsl, 'msl')
      const valMsl = getValue(msgMsl, { latitude, longitude })
      msgMsl = null

      // 6. Precipitation (tp)
      const bufTp = await getBuffer(step, 'tp')
      let msgTp = bufTp ? parseMessage(bufTp, 'tp') : null
      const valTp = msgTp ? getValue(msgTp, { latitude, longitude }) : null
      msgTp = null

      const normalized = normalizeECMWF(
        {
          temperature: val2t,
          dewPoint: val2d,
          uWind: val10u,
          vWind: val10v,
          pressure: valMsl,
          precipitation: valTp,
          timestamp: buildTimestamp(date, cycle, step)
        },
        { latitude, longitude }
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
          normalized.timestamp,
          normalized.forecast,
          intervalPrecipitation
        )
      )
    } catch (err) {
      console.error(`ECMWF parsing failed for step ${step}: ${err.message}`)
      // Continue to next step if one fails
    } finally {
      // Yield with brief pause to permit V8 and OS native heap reclamation
      await new Promise(resolve => setTimeout(resolve, 20))
    }
  }
  const nwpSemantics = buildNwpSemantics(hourly)
  console.log(`ECMWF forecast steps loaded: ${steps.join(',')}`)
  return {
    source: 'ECMWF-IFS',
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
