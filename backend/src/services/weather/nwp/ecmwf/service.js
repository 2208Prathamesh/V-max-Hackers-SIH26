import { getECMWFMessages } from './client.js'

import { GribMessageFactory } from '@mattnucc/gribberish'

import { normalizeECMWF } from './normalizer.js'

function parseMessage (buffer, param) {
  const factory = GribMessageFactory.fromBuffer(new Uint8Array(buffer))

  if (factory.availableMessages.length === 0) {
    throw new Error(`No GRIB message found for ${param}`)
  }

  return factory.getMessage(factory.availableMessages[0])
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
  const { date, cycle, messages, steps } = await getECMWFMessages({ days })
  const hourly = []
  let previousAccumulatedPrecipitation = null
  let gridLocation = null
  for (const step of steps) {
    const stepMessages = messages[step]
    const normalized = normalizeECMWF(
      {
        temperature: parseMessage(stepMessages['2t'].buffer, '2t'),
        dewPoint: parseMessage(stepMessages['2d'].buffer, '2d'),
        uWind: parseMessage(stepMessages['10u'].buffer, '10u'),
        vWind: parseMessage(stepMessages['10v'].buffer, '10v'),
        pressure: parseMessage(stepMessages.msl.buffer, 'msl'),
        precipitation: stepMessages.tp
          ? parseMessage(stepMessages.tp.buffer, 'tp')
          : null,
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
