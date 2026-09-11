/**
 * System Prompts & Grounded Meteorological Context Templates for Gemini AI
 *
 * Design principles:
 * - AI only interprets verified data — never invents values
 * - Source types are clearly labeled in every prompt
 * - Role-aware: farmer, authority, and citizen get targeted instructions
 * - Decision-oriented: answers move toward "what should the user do?"
 */

// ─── Role profiles for AI instruction ────────────────────────────────────────

const ROLE_INSTRUCTIONS = {
  farmer: `You are helping a FARMER. Prioritize:
- Irrigation scheduling (when to water, when to hold)
- Pesticide/herbicide spray window feasibility (wind, rain risk)
- Crop protection decisions (heat stress, frost, waterlogging)
- Harvest window timing
- Soil moisture context where provided
Be specific with thresholds: e.g. "Wind at 18 km/h — marginal for spraying, consider early morning window".`,

  authority: `You are briefing a DISASTER MANAGEMENT OFFICER. Prioritize:
- Severity and areal extent of any hazards
- Affected population zones
- Response timeline and sequence
- Resource pre-positioning recommendations
- Clear GO/NO-GO recommendations on emergency activations
- Distinguish between IMD official warnings and forecast-based risk
Be direct, operational, and structured. No pleasantries.`,

  admin: `You are briefing a SYSTEM ADMINISTRATOR. Be concise and technical.
Summarize weather status and any active warnings relevant to platform operation.`,

  user: `You are helping a CITIZEN. Prioritize:
- Clear, jargon-free explanation of conditions
- Practical personal decisions (travel, outdoor plans, dress appropriately)
- Safety guidance for any active alerts
- Answers to "Will it rain?", "Is it safe to go out?", "Should I be worried?"
Be warm, reassuring, and specific.`
}

// ─── Main system instruction ──────────────────────────────────────────────────

export const SYSTEM_INSTRUCTION = `You are WeatherGPT, an authoritative, intelligent, and empathetic weather decision-support assistant for India.

CRITICAL GROUNDING & RELEVANCE RULES:
1. Relevance & Conciseness: Answer ONLY what the user asked directly. If the user asks for temperature, give ONLY the temperature, feels-like, and today's min/max. DO NOT add unsolicited paragraphs about farming, umbrellas, clothing, car washing, or disaster protocols unless the user explicitly asked for them.
2. Location Grounding: NEVER invent or guess a location. NEVER use or output the text "N/A" or "In N/A". If the user did not specify a location, politely ask which city or location they are inquiring about.
3. Grounding: Strictly interpret, explain, and contextualize the verified meteorological data provided in the prompt. NEVER invent temperatures, rain probability, wind speeds, or fake disaster alerts.
4. Source authority: Data sections are labeled by type (OBSERVATION / FORECAST / OFFICIAL_WARNING / AI_INTERPRETATION). Respect these distinctions.
5. Multilingual: Reply in the target language specified. Supported: English (en), Hindi (hi), Marathi (mr), Bengali (bn), Tamil (ta), Telugu (te).
6. Tone: Helpful, concise, scientifically accurate, and natural.`

// ─── Main grounded context prompt builder ────────────────────────────────────

/**
 * Format verified meteorological facts into a structured context prompt for Gemini
 * @param {object} param0
 * @param {string} param0.location
 * @param {object} param0.currentWeather
 * @param {Array<object>} param0.forecastDaily
 * @param {object} [param0.imdWarning]
 * @param {object} [param0.agroAdvisory]
 * @param {object} [param0.nwpComparison]
 * @param {object} [param0.timelineEvents]  — from weatherTimeline service
 * @param {object} [param0.decisionBrief]   — from decisionEngine
 * @param {string} [param0.userRole='user']
 * @param {string} [param0.language='en']
 * @returns {string}
 */
export function buildGroundedContextPrompt ({
  location,
  currentWeather,
  forecastDaily = [],
  imdWarning,
  agroAdvisory,
  nwpComparison,
  timelineEvents,
  decisionBrief,
  userRole = 'user',
  language = 'en'
}) {
  const current = currentWeather || {}
  const daily = forecastDaily.slice(0, 5)
  const roleKey = (userRole || 'user').toLowerCase()

  const cleanLoc = (location && location !== 'N/A' && location !== 'undefined') ? location : 'India'
  let prompt = `VERIFIED METEOROLOGICAL DATA FOR: ${cleanLoc}\n`
  prompt += `[Data retrieved: ${new Date().toISOString()}]\n\n`

  // Role-specific instructions
  const roleInstructions = ROLE_INSTRUCTIONS[roleKey] || ROLE_INSTRUCTIONS.user
  prompt += `--- USER ROLE & RESPONSE GUIDELINES ---\n${roleInstructions}\n\n`

  // Current weather (labeled by source)
  const temperature = current.temperature ?? current.temperatureC
  const windSpeed = current.windSpeed ?? current.windSpeedKmh ?? current.windSpeedMs
  const windUnit = current.windSpeedMs != null && current.windSpeed == null && current.windSpeedKmh == null ? 'm/s' : 'km/h'
  
  if (temperature != null) {
    prompt += `--- [OBSERVATION] Current Weather ---\n`
    prompt += `- Data source: ${current.source ? `${current.source} observation` : 'Open-Meteo / IMD observation'}\n`
    prompt += `- Temperature: ${temperature}°C${(current.apparentTemperature ?? current.feelsLike) != null ? ` (Feels like: ${current.apparentTemperature ?? current.feelsLike}°C)` : ''}\n`
    prompt += `- Condition: ${current.weatherDescription || current.condition || 'Clear'}\n`
    if (current.humidity != null) prompt += `- Relative Humidity: ${current.humidity}%\n`
    if (windSpeed != null) prompt += `- Wind Speed: ${windSpeed} ${windUnit} (${current.windDirection ?? current.windDirectionDeg ?? ''})\n`
    if (current.pressure || current.pressureHpa) prompt += `- Atmospheric Pressure: ${current.pressure ?? current.pressureHpa} hPa\n`
    prompt += `\n`
  }

  // 5-day forecast
  if (daily.length > 0) {
    prompt += `--- [FORECAST] 5-Day Outlook ---\n`
    daily.forEach((d, idx) => {
      const rain = d.precipitationSum ?? d.precipitation ?? null
      const prob = d.precipitationProbability ?? d.precipitationProbabilityMax ?? 0
      prompt += `Day ${idx + 1} (${d.date || d.day || 'Upcoming'}): Max ${d.maxTemperature ?? d.temperature ?? '--'}°C, Min ${d.minTemperature ?? '--'}°C, Rain Prob: ${prob}%${rain !== null ? `, Expected: ${rain} mm` : ''}, Condition: ${d.weatherDescription || d.condition || 'Fair'}\n`
    })
    prompt += `\n`
  }

  // IMD official warning (highest authority)
  if (imdWarning && imdWarning.hasActiveWarning) {
    prompt += `--- [OFFICIAL_WARNING] IMD Authoritative Warning ---\n`
    prompt += `IMPORTANT: This is an official government warning from the India Meteorological Department. Present it faithfully without modification.\n`
    prompt += `- Warning Level: ${imdWarning.warningLevel} Alert (Action: ${imdWarning.action})\n`
    prompt += `- Hazard Type: ${imdWarning.hazard}\n`
    prompt += `- Official Advisory: ${imdWarning.advice}\n`
    prompt += `- Valid: ${imdWarning.validFrom || 'now'} to ${imdWarning.validTo || 'ongoing'}\n`
    prompt += `- Issued by: ${imdWarning.issuedBy || 'India Meteorological Department (IMD)'}\n\n`
  }

  // NWP model comparison (if available)
  if (nwpComparison?.consensus) {
    prompt += `--- [FORECAST] NWP Model Consensus (ECMWF vs GFS) ---\n`
    prompt += `- Model Agreement Score: ${nwpComparison.consensus.modelAgreementScore ?? nwpComparison.consensus.confidenceScore ?? 'unavailable'}% (${nwpComparison.consensus.confidenceCategory})\n`
    prompt += `- Consensus Note: ${nwpComparison.consensus.agreementSummary}\n\n`
  }

  if (nwpComparison?.forecastUncertainty) {
    const uncertainty = nwpComparison.forecastUncertainty
    const largest = uncertainty.largestDisagreement
    prompt += `--- [FORECAST] NWP Forecast Uncertainty ---\n`
    prompt += `- Agreement level: ${uncertainty.agreementLevel}\n`
    prompt += `- Model agreement score: ${uncertainty.modelAgreementScore ?? 'unavailable'} (agreement measure only, not a probability). Do not invent another score.\n`
    prompt += `- Per-variable uncertainty: temperature=${uncertainty.uncertainty.temperature}, precipitation=${uncertainty.uncertainty.precipitation}, wind=${uncertainty.uncertainty.windSpeed}\n`
    prompt += `- Matched forecast timestamps: ${uncertainty.matchedTimestamps}\n`
    if (largest) {
      prompt += `- Largest model disagreement: ${largest.variable} at ${largest.timestamp}, spread ${largest.spread}\n`
    }
    prompt += `Note: Explain model agreement as how consistently the two models support each other — not as forecast accuracy.\n\n`
  }

  // Weather timeline events
  if (timelineEvents?.hasEvents && timelineEvents.events?.length > 0) {
    prompt += `--- [AI_INTERPRETATION] Forecast Timeline (Key Changes) ---\n`
    prompt += `Note: These transitions are detected from the forecast data above — they are AI interpretation, not official warnings.\n`
    for (const e of timelineEvents.events.slice(0, 4)) {
      prompt += `- ${e.period} (${e.formattedTime}): ${e.event} — ${e.detail} [Risk: ${e.riskLevel}]\n`
    }
    prompt += `\n`
  }

  // Agriculture advisory (for farmers)
  if (agroAdvisory?.recommendations) {
    prompt += `--- [AI_INTERPRETATION] Agriculture & Crop Decision Data ---\n`
    prompt += `Note: These are AI-generated advisories based on the weather data above. Not official government advisories.\n`
    prompt += `- Irrigation: ${agroAdvisory.recommendations.irrigation.advice}\n`
    prompt += `- Pest Spraying: ${agroAdvisory.recommendations.pesticideSpraying.advice}\n`
    prompt += `- Crop Specific: ${agroAdvisory.recommendations.cropSpecificAdvisory}\n\n`
  }

  // Decision brief summary (pre-computed)
  if (decisionBrief?.hazards?.length > 0) {
    prompt += `--- [AI_INTERPRETATION] Decision Intelligence Summary ---\n`
    prompt += `Headline: ${decisionBrief.headline}\n`
    prompt += `Overall Risk Level: ${decisionBrief.overallRisk}\n`
    if (decisionBrief.primaryImpact) prompt += `Primary Impact: ${decisionBrief.primaryImpact}\n`
    if (decisionBrief.actions?.length > 0) {
      prompt += `Recommended Actions:\n`
      decisionBrief.actions.slice(0, 3).forEach(a => {
        prompt += `  • ${a.action}\n`
      })
    }
    prompt += `\n`
  }

  // Footer
  prompt += `--- RESPONSE GUIDANCE ---\n`
  prompt += `Target Output Language: ${language}\n`
  prompt += `Source Transparency: Where you reference weather data, briefly indicate whether it is an observation, forecast, or official warning.\n`
  prompt += `Answer the user's question using ONLY the verified data above. Do not invent values. Focus on decision support relevant to the user's role.`

  return prompt
}

/**
 * Build a lightweight decision-oriented prompt for non-location queries
 */
export function buildDecisionContextPrompt ({ userMessage, role = 'user', language = 'en' }) {
  const roleKey = (role || 'user').toLowerCase()
  const roleInstructions = ROLE_INSTRUCTIONS[roleKey] || ROLE_INSTRUCTIONS.user

  return `You are WeatherGPT. The user did not ask about a specific location's weather, but has a general question.

${roleInstructions}

RULES:
- If the question is about general weather science, meteorology, or climate: answer accurately.
- If the question asks for a weather forecast without a location: ask the user to specify their city or location.
- Do not invent weather data.
- Reply in language: ${language}

User question: "${userMessage}"`
}

export default {
  SYSTEM_INSTRUCTION,
  buildGroundedContextPrompt,
  buildDecisionContextPrompt
}
