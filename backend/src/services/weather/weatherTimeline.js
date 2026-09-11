/**
 * WeatherGPT Weather Timeline & Transition Detection
 *
 * Analyzes hourly forecast data to detect meaningful transitions
 * (rain start/stop, temperature spikes, wind increases, etc.)
 * and returns a concise, human-readable timeline.
 *
 * Uses ONLY real incoming forecast data — never invents values.
 */

const MIN_TEMP_CHANGE_SIGNIFICANT = 3  // °C over 3 hours
const MIN_WIND_CHANGE_SIGNIFICANT = 10 // km/h over 3 hours
const RAIN_START_PROB_THRESHOLD = 40   // % probability
const RAIN_STOP_PROB_THRESHOLD = 20    // %

/**
 * Format an ISO timestamp into a human-readable time string
 */
function formatTime (isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
}

/**
 * Format period label relative to now
 */
function getPeriodLabel (isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  const now = new Date()
  const diffH = (d - now) / (1000 * 60 * 60)

  if (diffH < 0.5) return 'Now'
  if (diffH < 1.5) return 'In ~1 hour'
  if (diffH < 3.5) return 'In ~3 hours'
  if (d.getDate() === now.getDate()) {
    const h = d.getHours()
    if (h < 12) return 'This morning'
    if (h < 17) return 'This afternoon'
    if (h < 21) return 'This evening'
    return 'Tonight'
  }
  return 'Tomorrow'
}

/**
 * Detect when rain transitions (starts, stops, intensifies)
 */
function detectRainTransitions (hourly) {
  const events = []
  if (!Array.isArray(hourly) || hourly.length < 2) return events

  let wasRaining = false

  for (let i = 0; i < hourly.length - 1; i++) {
    const h = hourly[i]
    const next = hourly[i + 1]
    const prob = h.precipitationProbability ?? h.precipitation_probability ?? 0
    const rain = h.precipitation ?? h.precipitationMm ?? 0
    const isRaining = prob >= RAIN_START_PROB_THRESHOLD || rain > 0.5

    const probNext = next.precipitationProbability ?? next.precipitation_probability ?? 0
    const rainNext = next.precipitation ?? next.precipitationMm ?? 0
    const willRain = probNext >= RAIN_START_PROB_THRESHOLD || rainNext > 0.5

    // Rain starting
    if (!wasRaining && isRaining) {
      const intensity = rain >= 10 ? 'Heavy rain' : rain >= 3 ? 'Moderate rain' : prob >= 70 ? 'Rain likely' : 'Light rain expected'
      events.push({
        time: h.time,
        formattedTime: formatTime(h.time),
        period: getPeriodLabel(h.time),
        type: 'rain_start',
        event: intensity,
        detail: rain > 0 ? `~${rain.toFixed(1)} mm` : `${prob}% probability`,
        riskLevel: rain >= 15 ? 'high' : rain >= 5 ? 'moderate' : 'low',
        icon: '🌧️'
      })
    }

    // Rain stopping
    if (wasRaining && !isRaining && i < hourly.length - 2) {
      events.push({
        time: h.time,
        formattedTime: formatTime(h.time),
        period: getPeriodLabel(h.time),
        type: 'rain_stop',
        event: 'Rain clearing',
        detail: 'Conditions improving',
        riskLevel: 'low',
        icon: '⛅'
      })
    }

    // Heavy rain intensification
    if (wasRaining && isRaining && rain >= 15 && i > 0) {
      const prevRain = hourly[i - 1].precipitation ?? 0
      if (rain - prevRain >= 10) {
        events.push({
          time: h.time,
          formattedTime: formatTime(h.time),
          period: getPeriodLabel(h.time),
          type: 'rain_intensify',
          event: 'Rain intensifying',
          detail: `Increasing to ~${rain.toFixed(1)} mm/h`,
          riskLevel: 'high',
          icon: '⛈️'
        })
      }
    }

    wasRaining = isRaining
  }

  return events
}

/**
 * Detect significant temperature transitions
 */
function detectTemperatureTransitions (hourly) {
  const events = []
  if (!Array.isArray(hourly) || hourly.length < 4) return events

  // Check every 3-hour window
  for (let i = 0; i < hourly.length - 3; i += 3) {
    const h0 = hourly[i]
    const h3 = hourly[i + 3]
    const t0 = h0.temperature ?? h0.temperature_2m ?? null
    const t3 = h3.temperature ?? h3.temperature_2m ?? null

    if (t0 == null || t3 == null) continue

    const change = t3 - t0
    if (Math.abs(change) >= MIN_TEMP_CHANGE_SIGNIFICANT) {
      const isSpike = change > 0
      events.push({
        time: h3.time,
        formattedTime: formatTime(h3.time),
        period: getPeriodLabel(h3.time),
        type: isSpike ? 'temp_rise' : 'temp_drop',
        event: isSpike ? `Temperature rising to ${Math.round(t3)}°C` : `Temperature dropping to ${Math.round(t3)}°C`,
        detail: `${isSpike ? '+' : ''}${Math.round(change)}°C over 3 hours`,
        riskLevel: Math.abs(change) >= 6 ? 'moderate' : 'low',
        icon: isSpike ? '🌡️' : '❄️'
      })
    }
  }

  return events
}

/**
 * Detect significant wind speed increases
 */
function detectWindTransitions (hourly) {
  const events = []
  if (!Array.isArray(hourly) || hourly.length < 4) return events

  for (let i = 0; i < hourly.length - 3; i += 3) {
    const h0 = hourly[i]
    const h3 = hourly[i + 3]
    const w0 = h0.windSpeed ?? h0.wind_speed_10m ?? null
    const w3 = h3.windSpeed ?? h3.wind_speed_10m ?? null

    if (w0 == null || w3 == null) continue

    const change = w3 - w0
    if (change >= MIN_WIND_CHANGE_SIGNIFICANT && w3 >= 30) {
      events.push({
        time: h3.time,
        formattedTime: formatTime(h3.time),
        period: getPeriodLabel(h3.time),
        type: 'wind_increase',
        event: `Wind increasing to ${Math.round(w3)} km/h`,
        detail: `Up from ${Math.round(w0)} km/h`,
        riskLevel: w3 >= 60 ? 'high' : w3 >= 40 ? 'moderate' : 'low',
        icon: '💨'
      })
    }
  }

  return events
}

/**
 * Build a complete weather timeline from hourly forecast data
 *
 * @param {Array} hourly  - Normalized hourly forecast array
 * @param {Array} daily   - Normalized daily forecast array (optional, for multi-day context)
 * @param {number} maxHours - Only process this many hours ahead
 * @returns {object} Timeline object with events array + narrative string
 */
export function buildWeatherTimeline (hourly = [], daily = [], maxHours = 24) {
  if (!Array.isArray(hourly)) return { events: [], narrative: null, hasEvents: false }

  // Filter to current + next maxHours
  const now = new Date()
  const cutoff = new Date(now.getTime() + maxHours * 60 * 60 * 1000)
  const futureHours = hourly.filter(h => {
    if (!h.time) return false
    const t = new Date(h.time)
    return !isNaN(t) && t >= now && t <= cutoff
  })

  if (futureHours.length < 2) return { events: [], narrative: null, hasEvents: false }

  // Detect all transition types
  const rainEvents = detectRainTransitions(futureHours)
  const tempEvents = detectTemperatureTransitions(futureHours)
  const windEvents = detectWindTransitions(futureHours)

  // Merge and sort chronologically
  const allEvents = [...rainEvents, ...tempEvents, ...windEvents]
    .filter(e => e.time)
    .sort((a, b) => new Date(a.time) - new Date(b.time))

  // Deduplicate by time+type (keep highest risk)
  const dedupMap = new Map()
  for (const e of allEvents) {
    const key = `${e.time}_${e.type}`
    if (!dedupMap.has(key) || (e.riskLevel === 'high' && dedupMap.get(key).riskLevel !== 'high')) {
      dedupMap.set(key, e)
    }
  }

  const events = Array.from(dedupMap.values()).slice(0, 6)  // Max 6 timeline events

  // Build brief narrative
  let narrative = null
  if (events.length === 0) {
    const current = futureHours[0]
    const temp = current.temperature ?? null
    narrative = temp !== null
      ? `Stable conditions expected. Current temperature ${Math.round(temp)}°C.`
      : 'Stable conditions expected over the next 24 hours.'
  } else {
    const top = events[0]
    const highRisk = events.filter(e => e.riskLevel === 'high')
    if (highRisk.length > 0) {
      narrative = `${highRisk[0].event} — ${highRisk[0].period}. ${events.length > 1 ? `${events.length - 1} more change${events.length > 2 ? 's' : ''} ahead.` : ''}`
    } else {
      narrative = `${top.event} — ${top.period}. ${events.length > 1 ? `${events.length - 1} more change${events.length > 2 ? 's' : ''} ahead.` : ''}`
    }
  }

  return {
    events,
    narrative,
    hasEvents: events.length > 0,
    analyzedHours: futureHours.length
  }
}

export default { buildWeatherTimeline }
