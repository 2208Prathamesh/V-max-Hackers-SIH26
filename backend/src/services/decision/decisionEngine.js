/**
 * WeatherGPT Decision Intelligence Engine
 *
 * Transforms verified meteorological data into structured, role-aware,
 * actionable decision support. Uses ONLY real data — never invents values.
 *
 * Pipeline: DATA → RISK → IMPACT → DECISION → ACTION
 */

// ─── Risk thresholds (meteorologically grounded) ────────────────────────────

const THRESHOLDS = {
  rain: {
    light: 1,       // mm/h or probability %: light mention
    moderate: 5,    // mm in period — notable
    heavy: 15,      // mm — disruption risk
    extreme: 40     // mm — flooding risk
  },
  rainProb: {
    low: 20,
    moderate: 40,
    high: 60,
    veryHigh: 80
  },
  wind: {
    breezy: 20,       // km/h
    gusty: 40,        // km/h — outdoor caution
    strong: 60,       // km/h — structural risk
    damaging: 80      // km/h — evacuate risk
  },
  temperature: {
    heatStress: 38,   // °C apparent temp
    coldStress: 10,   // °C
    severeHeat: 44,   // °C
    frost: 2          // °C
  },
  humidity: {
    uncomfortable: 80, // % — heat index amplification
    lowSpray: 70       // % — favorable for crop spray if below
  },
  aqi: {
    moderate: 51,
    unhealthy: 101,
    veryUnhealthy: 201
  }
}

// ─── Hazard detection from real data ─────────────────────────────────────────

function detectHazards (weather, forecast, imdWarning) {
  const hazards = []
  const current = weather || {}
  const daily = Array.isArray(forecast) ? forecast : []
  const today = daily[0] || {}
  const tomorrow = daily[1] || {}

  // 1. Active official IMD warning — always surfaces first
  if (imdWarning?.hasActiveWarning) {
    hazards.push({
      id: 'imd_official',
      type: 'official_warning',
      severity: imdWarning.warningLevel === 'Red' ? 'extreme' :
                imdWarning.warningLevel === 'Orange' ? 'high' : 'moderate',
      title: `IMD ${imdWarning.warningLevel} Alert: ${imdWarning.hazard}`,
      detail: imdWarning.advice,
      priority: 1,
      source: 'official_warning',
      validFrom: imdWarning.validFrom,
      validTo: imdWarning.validTo
    })
  }

  // 2. Heavy rain risk (from forecast)
  const todayRainProb = today.precipitationProbability ?? 0
  const todayRainMm = today.precipitationSum ?? today.precipitation ?? 0

  if (todayRainMm >= THRESHOLDS.rain.extreme || todayRainProb >= THRESHOLDS.rainProb.veryHigh) {
    hazards.push({
      id: 'heavy_rain',
      type: 'flood',
      severity: todayRainMm >= THRESHOLDS.rain.extreme ? 'high' : 'moderate',
      title: 'Heavy Rainfall Expected Today',
      detail: `${todayRainMm > 0 ? `${todayRainMm} mm expected` : ''} (${todayRainProb}% probability). Flash flooding possible in low-lying areas.`,
      priority: 2,
      source: 'forecast'
    })
  } else if (todayRainMm >= THRESHOLDS.rain.moderate || todayRainProb >= THRESHOLDS.rainProb.moderate) {
    hazards.push({
      id: 'moderate_rain',
      type: 'rain',
      severity: 'low',
      title: 'Moderate Rain Likely',
      detail: `${todayRainMm > 0 ? `${todayRainMm} mm` : `${todayRainProb}%`} chance of rain today.`,
      priority: 4,
      source: 'forecast'
    })
  }

  // 3. Heat stress
  const apparentTemp = current.apparentTemperature ?? current.temperature ?? 0
  if (apparentTemp >= THRESHOLDS.temperature.severeHeat) {
    hazards.push({
      id: 'severe_heat',
      type: 'heatwave',
      severity: 'high',
      title: `Severe Heat — Feels Like ${Math.round(apparentTemp)}°C`,
      detail: 'Dangerous heat index. Risk of heat exhaustion or stroke without precautions.',
      priority: 2,
      source: 'observation'
    })
  } else if (apparentTemp >= THRESHOLDS.temperature.heatStress) {
    hazards.push({
      id: 'heat_stress',
      type: 'heatwave',
      severity: 'moderate',
      title: `High Heat — Feels Like ${Math.round(apparentTemp)}°C`,
      detail: 'Significant heat stress. Stay hydrated and avoid prolonged outdoor exposure.',
      priority: 3,
      source: 'observation'
    })
  }

  // 4. Cold stress
  const temp = current.temperature ?? 25
  if (temp <= THRESHOLDS.temperature.frost) {
    hazards.push({
      id: 'frost',
      type: 'coldwave',
      severity: 'moderate',
      title: `Near-Frost Conditions — ${temp}°C`,
      detail: 'Risk of frost damage to crops and cold exposure for outdoor workers.',
      priority: 3,
      source: 'observation'
    })
  } else if (temp <= THRESHOLDS.temperature.coldStress) {
    hazards.push({
      id: 'cold',
      type: 'coldwave',
      severity: 'low',
      title: `Cold Conditions — ${temp}°C`,
      detail: 'Cold weather advisory. Keep warm, especially the elderly and children.',
      priority: 5,
      source: 'observation'
    })
  }

  // 5. Strong wind
  const windSpeed = current.windSpeed ?? current.windSpeedKmh ?? 0
  const windGusts = current.windGusts ?? windSpeed * 1.3
  if (windGusts >= THRESHOLDS.wind.damaging) {
    hazards.push({
      id: 'damaging_wind',
      type: 'strong_wind',
      severity: 'high',
      title: `Damaging Wind Gusts — up to ${Math.round(windGusts)} km/h`,
      detail: 'Risk of structural damage. Secure loose objects. Avoid large trees.',
      priority: 2,
      source: 'observation'
    })
  } else if (windGusts >= THRESHOLDS.wind.gusty) {
    hazards.push({
      id: 'gusty_wind',
      type: 'strong_wind',
      severity: 'low',
      title: `Gusty Winds — up to ${Math.round(windGusts)} km/h`,
      detail: 'Gusty conditions. Exercise caution when driving large vehicles or motorcycles.',
      priority: 5,
      source: 'observation'
    })
  }

  // Sort by priority (1 = highest)
  hazards.sort((a, b) => a.priority - b.priority)
  return hazards
}

// ─── Role-specific action library ────────────────────────────────────────────

function buildRoleActions (hazards, role, weather, forecast) {
  const actions = []
  const daily = Array.isArray(forecast) ? forecast : []
  const today = daily[0] || {}
  const rainMm = today.precipitationSum ?? today.precipitation ?? 0
  const rainProb = today.precipitationProbability ?? 0
  const windSpeed = weather?.windSpeed ?? weather?.windSpeedKmh ?? 0

  for (const hazard of hazards) {
    if (hazard.type === 'official_warning' || hazard.id === 'imd_official') {
      actions.push({
        category: 'official',
        priority: 1,
        action: hazard.detail || 'Follow official IMD advisory and local authority instructions.',
        hazardRef: hazard.id
      })
    }

    if (role === 'farmer') {
      if (hazard.type === 'flood' || hazard.id === 'heavy_rain') {
        actions.push({ category: 'farm', priority: 1, action: 'Suspend field operations immediately. Delay all sowing and fertilizer application.', hazardRef: hazard.id })
        actions.push({ category: 'farm', priority: 2, action: 'Clear field drainage trenches to avoid root submersion and fungal rot.', hazardRef: hazard.id })
        actions.push({ category: 'farm', priority: 3, action: 'Move harvested produce and grain sacks to elevated, dry storage.', hazardRef: hazard.id })
      } else if (hazard.type === 'rain' || hazard.id === 'moderate_rain') {
        actions.push({ category: 'farm', priority: 2, action: 'Postpone pesticide and chemical spraying to avoid chemical wash-off and wastage.', hazardRef: hazard.id })
        actions.push({ category: 'farm', priority: 3, action: 'Hold off surface irrigation today to conserve groundwater and power.', hazardRef: hazard.id })
        actions.push({ category: 'farm', priority: 4, action: 'Ensure bunds are reinforced to capture beneficial rain runoff.', hazardRef: hazard.id })
      }
      if (hazard.type === 'heatwave') {
        actions.push({ category: 'farm', priority: 2, action: 'Irrigate crops during early morning or post-sunset to minimize evaporative loss.', hazardRef: hazard.id })
        actions.push({ category: 'farm', priority: 3, action: 'Apply straw or plastic mulching to preserve soil moisture around root zones.', hazardRef: hazard.id })
      }
      if (hazard.type === 'coldwave' || hazard.id === 'frost') {
        actions.push({ category: 'farm', priority: 2, action: 'Cover sensitive nursery seedlings overnight. Light dawn irrigation helps prevent frost damage.', hazardRef: hazard.id })
      }
      if (hazard.type === 'strong_wind') {
        actions.push({ category: 'farm', priority: 2, action: 'Avoid pesticide dusting; wind drift decreases efficacy and endangers nearby crops.', hazardRef: hazard.id })
        actions.push({ category: 'farm', priority: 3, action: 'Stake tall crop varieties (sugarcane, banana, maize) against wind lodging.', hazardRef: hazard.id })
      }
      // Favorable spraying window
      if (rainProb < 30 && windSpeed < 18) {
        actions.push({ category: 'farm', priority: 4, action: 'Favorable spraying window active: Low wind (<18 km/h) and minimal rain probability in next 12 hours.', hazardRef: 'favorable_window' })
      }
    }

    if (role === 'authority' || role === 'admin') {
      if (hazard.severity === 'extreme' || hazard.severity === 'high') {
        actions.push({ category: 'ops', priority: 1, action: 'Activate State & District Emergency Operations Centre (EOC). Brief Collector.', hazardRef: hazard.id })
        actions.push({ category: 'ops', priority: 1, action: 'Pre-position NDRF/SDRF emergency rescue units in identified flood/landslide vulnerable zones.', hazardRef: hazard.id })
        actions.push({ category: 'ops', priority: 2, action: 'Broadcast Common Alerting Protocol (CAP) warning via SMS and cell broadcast.', hazardRef: hazard.id })
      }
      if (hazard.type === 'flood' || hazard.type === 'rain') {
        actions.push({ category: 'ops', priority: 2, action: 'Monitor river gauge levels and coordinate with Irrigation Department for dam reservoir discharge.', hazardRef: hazard.id })
        actions.push({ category: 'ops', priority: 3, action: 'Review low-lying urban flood points; ensure municipal dewatering pump readiness.', hazardRef: hazard.id })
      }
      if (hazard.type === 'heatwave') {
        actions.push({ category: 'ops', priority: 2, action: 'Activate Heat Action Plan (HAP). Direct public water kiosks and hospital cooling wards.', hazardRef: hazard.id })
        actions.push({ category: 'ops', priority: 3, action: 'Enforce afternoon work halts on outdoor construction sites between 12 PM–4 PM.', hazardRef: hazard.id })
      }
    }

    // Citizen defaults
    if (!role || role === 'user') {
      if (hazard.type === 'flood' || hazard.id === 'heavy_rain') {
        actions.push({ category: 'citizen', priority: 1, action: 'Avoid low-lying subways and flooded roads. Never drive or walk through running water.', hazardRef: hazard.id })
        actions.push({ category: 'citizen', priority: 2, action: 'Keep phone charged and emergency battery backup handy.', hazardRef: hazard.id })
      } else if (hazard.type === 'rain' || hazard.id === 'moderate_rain') {
        actions.push({ category: 'citizen', priority: 2, action: 'Carry an umbrella or rain gear. Expect slowed transit during peak hours.', hazardRef: hazard.id })
        actions.push({ category: 'citizen', priority: 3, action: 'Ensure electronic devices and important paperwork are sealed against dampness.', hazardRef: hazard.id })
      }
      if (hazard.type === 'heatwave') {
        actions.push({ category: 'citizen', priority: 2, action: 'Drink ORS or water every 30 minutes. Limit direct sun exposure between 12 PM–4 PM.', hazardRef: hazard.id })
      }
      if (hazard.type === 'official_warning' || hazard.id === 'imd_official') {
        actions.push({ category: 'citizen', priority: 1, action: 'Monitor official IMD and State Disaster bulletins. Follow police instructions.', hazardRef: hazard.id })
      }
    }
  }

  // Baseline fallbacks if conditions are calm
  if (actions.length === 0) {
    if (role === 'farmer') {
      actions.push({ category: 'farm', priority: 3, action: 'Weather is favorable for standard field scouting, weeding, and crop maintenance.', hazardRef: 'baseline' })
      actions.push({ category: 'farm', priority: 4, action: 'Inspect soil moisture before running scheduled irrigation pumps to save power.', hazardRef: 'baseline' })
      actions.push({ category: 'farm', priority: 5, action: 'Check upcoming 3-day precipitation trends before planning bulk fertilizer purchase.', hazardRef: 'baseline' })
    } else if (role === 'authority' || role === 'admin') {
      actions.push({ category: 'ops', priority: 3, action: 'Maintain standard meteorological situational awareness across district command posts.', hazardRef: 'baseline' })
      actions.push({ category: 'ops', priority: 4, action: 'Verify automated sensor telemetry and Doppler radar link connectivity.', hazardRef: 'baseline' })
    } else {
      actions.push({ category: 'citizen', priority: 3, action: 'Conditions are favorable for normal outdoor activities and daily transit.', hazardRef: 'baseline' })
      actions.push({ category: 'citizen', priority: 4, action: 'Good air circulation. Normal precautions for outdoor sports and exercise.', hazardRef: 'baseline' })
    }
  }

  // Deduplicate and sort
  const seen = new Set()
  return actions
    .filter(a => { const k = a.action; if (seen.has(k)) return false; seen.add(k); return true })
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 6)
}

// ─── Confidence assessment ────────────────────────────────────────────────────

function buildConfidenceAssessment (imdWarning, weatherData) {
  const sources = []
  let score = 0

  if (weatherData?.forecast?.current?.temperature != null) {
    sources.push('Open-Meteo forecast')
    score += 30
  }
  if (weatherData?.observations?.imd && !weatherData.observations.imd.error) {
    sources.push('IMD station observation')
    score += 40
  }
  if (imdWarning?.hasActiveWarning) {
    sources.push('IMD official warning')
    score += 30
  }

  const modelAgreement = weatherData?.modelComparison?.consensus?.modelAgreementScore ?? null
  let modelNote = null
  if (modelAgreement !== null) {
    modelNote = modelAgreement >= 85
      ? `ECMWF and GFS models agree (${modelAgreement}% alignment)`
      : modelAgreement >= 65
        ? `Model agreement is moderate (${modelAgreement}%) — some uncertainty exists`
        : `Model divergence detected (${modelAgreement}% alignment) — treat forecast range cautiously`
  }

  return {
    score: Math.min(100, score),
    level: score >= 70 ? 'high' : score >= 40 ? 'moderate' : 'limited',
    sources,
    modelNote,
    caveat: 'AI interpretation based on verified data. Not a substitute for official IMD warnings.'
  }
}

// ─── Main decision engine ─────────────────────────────────────────────────────

/**
 * Generate a structured decision intelligence brief
 *
 * @param {object} params
 * @param {object} params.weatherData   - Full weather service response
 * @param {object} params.imdWarning    - IMD warning object (may be null)
 * @param {string} params.role          - 'user' | 'farmer' | 'authority' | 'admin'
 * @param {string} params.location      - Location label string
 * @returns {object} Structured decision brief
 */
export function buildDecisionBrief ({ weatherData, imdWarning, role = 'user', location = 'Your location' }) {
  const current = weatherData?.forecast?.current || weatherData?.observations?.imd || {}
  const daily = weatherData?.forecast?.daily || []

  const hazards = detectHazards(current, daily, imdWarning)
  const actions = buildRoleActions(hazards, role, current, daily)
  const confidence = buildConfidenceAssessment(imdWarning, weatherData)

  // Build the headline
  let headline = 'No significant weather hazards detected'
  let overallRisk = 'low'
  let primaryImpact = null

  if (hazards.length > 0) {
    const top = hazards[0]
    headline = top.title
    overallRisk = top.severity
    primaryImpact = top.detail
  }

  // Build timeline summary from daily forecast
  const timelineEvents = buildTimelineSummary(daily)

  return {
    location,
    generatedAt: new Date().toISOString(),
    overallRisk,
    headline,
    primaryImpact,
    hazards: hazards.slice(0, 4),  // Top 4 hazards
    actions,
    timelineEvents,
    confidence,
    currentConditions: {
      temperature: current.temperature ?? null,
      apparentTemperature: current.apparentTemperature ?? current.temperature ?? null,
      humidity: current.humidity ?? null,
      windSpeed: current.windSpeed ?? current.windSpeedKmh ?? null,
      condition: current.weatherDescription || current.condition || null
    },
    sourceClassification: {
      observation: 'Measured current conditions from IMD or Open-Meteo',
      forecast: 'Numerical weather prediction from Open-Meteo (ECMWF/GFS blend)',
      official_warning: 'Authoritative warning from India Meteorological Department (IMD)',
      ai_interpretation: 'AI decision support — WeatherGPT analysis of verified data',
      recommendation: 'Suggested action based on detected hazards and user role'
    }
  }
}

/**
 * Build a simplified timeline of significant forecast changes
 */
function buildTimelineSummary (daily = []) {
  const events = []
  const today = daily[0]
  const tomorrow = daily[1]

  if (!today) return events

  const rainToday = today.precipitationSum ?? today.precipitation ?? 0
  const rainTomorrow = tomorrow?.precipitationSum ?? tomorrow?.precipitation ?? 0
  const probToday = today.precipitationProbability ?? 0
  const probTomorrow = tomorrow?.precipitationProbability ?? 0

  if (probToday >= 60 || rainToday >= 10) {
    events.push({ period: 'Today', event: 'Rain expected', detail: `${rainToday > 0 ? rainToday + ' mm' : probToday + '% probability'}`, riskLevel: rainToday >= 20 ? 'high' : 'moderate' })
  } else if (probToday >= 30) {
    events.push({ period: 'Today', event: 'Possible showers', detail: `${probToday}% chance`, riskLevel: 'low' })
  }

  if (probTomorrow >= 60 || rainTomorrow >= 10) {
    events.push({ period: 'Tomorrow', event: 'Rain forecast', detail: `${rainTomorrow > 0 ? rainTomorrow + ' mm' : probTomorrow + '% probability'}`, riskLevel: rainTomorrow >= 20 ? 'high' : 'moderate' })
  }

  const maxTempToday = today.maxTemperature ?? null
  const maxTempTomorrow = tomorrow?.maxTemperature ?? null
  if (maxTempToday !== null && maxTempTomorrow !== null) {
    const tempChange = maxTempTomorrow - maxTempToday
    if (Math.abs(tempChange) >= 3) {
      events.push({
        period: 'Tomorrow',
        event: tempChange > 0 ? 'Temperature rising' : 'Temperature dropping',
        detail: `${Math.round(maxTempTomorrow)}°C expected (${tempChange > 0 ? '+' : ''}${Math.round(tempChange)}°C)`,
        riskLevel: Math.abs(tempChange) >= 5 ? 'moderate' : 'low'
      })
    }
  }

  return events
}

export default { buildDecisionBrief }
