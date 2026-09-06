import { GribMessage } from '@mattnucc/gribberish'
import { getGFSMessages } from './client.js'
import { normalizeGFS } from './normalizer.js'

function parseMessage (buffer, name) {
  try {
    return GribMessage.parseFromBuffer(new Uint8Array(buffer), 0)
  } catch (error) {
    throw new Error(`Could not parse NOAA GFS ${name}: ${error.message}`)
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

export async function getGFSWeather (latitude, longitude, days = 7) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number')
    throw new Error('Latitude and longitude must be numbers')
  if (latitude < -90 || latitude > 90)
    throw new Error('Latitude must be between -90 and 90')
  if (longitude < -180 || longitude > 180)
    throw new Error('Longitude must be between -180 and 180')

  const { date, cycle, messages, steps } = await getGFSMessages({ days })
  const hourly = []
  let previousAccumulatedPrecipitation = null
  let gridLocation = null

  for (const step of steps) {
    const fields = messages[step]
    const parsed = {
      temperature: parseMessage(fields.temperature.buffer, 'temperature'),
      humidity: parseMessage(fields.humidity.buffer, 'humidity'),
      dewPoint: fields.dewPoint
        ? parseMessage(fields.dewPoint.buffer, 'dewPoint')
        : null,
      uWind: parseMessage(fields.uWind.buffer, 'uWind'),
      vWind: parseMessage(fields.vWind.buffer, 'vWind'),
      pressure: parseMessage(fields.pressure.buffer, 'pressure'),
      precipitation: fields.precipitation
        ? parseMessage(fields.precipitation.buffer, 'precipitation')
        : null
    }
    const timestamp = buildTimestamp(parsed.temperature)
    const normalized = normalizeGFS(parsed, { latitude, longitude }, timestamp)
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
