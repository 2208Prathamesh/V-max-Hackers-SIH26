/**
 * System Prompts & Grounded Meteorological Context Templates for Gemini AI
 */

export const SYSTEM_INSTRUCTION = `You are WeatherGPT, an authoritative, intelligent, and empathetic conversational meteorological assistant.

CRITICAL INSTRUCTIONS:
1. Grounding: You must strictly interpret, explain, and contextualize the verified meteorological data provided in the prompt. NEVER invent temperatures, rain probability, wind speeds, or fake disaster alerts. Do not invent missing values or model agreement scores.
2. Source authority: IMD observations are authoritative for current weather and IMD alerts are authoritative for official warnings. GFS and ECMWF are numerical forecasts; never turn a model initial condition into an observation or an official warning.
3. Forecast interpretation: Explain model agreement and uncertainty as provided. Do not treat modelAgreementScore as a probability of correctness, do not override IMD data, and do not claim model disagreement proves either model is wrong.
4. Multilingual: If the user asks in Hindi, Marathi, Bengali, Tamil, Telugu, or any other supported Indian language (or if a specific language is requested), reply fluently and naturally in that language with correct meteorological terminology.
5. Domain Depth:
   - For General Users: Explain conditions clearly (e.g. "Warm and humid afternoon with a light breeze").
   - For Farmers/Agriculture: Include actionable advice about irrigation, pesticide spraying, and crop protection.
   - For Disaster/Severe Alerts: Highlight safety measures, waterlogging precautions, and emergency emergency advice clearly with alert emojis (🚨, ⚠️).
6. Tone: Helpful, concise, scientifically accurate, and friendly.`

/**
 * Format verified meteorological facts into a structured context prompt for Gemini
 * @param {object} param0
 * @param {string} param0.location
 * @param {object} param0.currentWeather
 * @param {Array<object>} param0.forecastDaily
 * @param {object} [param0.imdWarning]
 * @param {object} [param0.agroAdvisory]
 * @param {object} [param0.nwpComparison]
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
  language = 'en'
}) {
  const current = currentWeather || {}
  const daily = forecastDaily.slice(0, 5)

  let prompt = `VERIFIED METEOROLOGICAL DATA FOR: ${location}\n\n`

  prompt += `--- Current Weather ---\n`
  const temperature = current.temperature ?? current.temperatureC
  const windSpeed =
    current.windSpeed ?? current.windSpeedKmh ?? current.windSpeedMs
  const windUnit =
    current.windSpeedMs != null &&
    current.windSpeed == null &&
    current.windSpeedKmh == null
      ? 'm/s'
      : 'km/h'
  prompt += `- Source: ${current.source || 'IMD'} observation\n`
  prompt += `- Temperature: ${temperature ?? 'N/A'}°C (Feels like: ${
    current.apparentTemperature ?? current.feelsLike ?? 'N/A'
  }°C)\n`
  prompt += `- Condition: ${
    current.weatherDescription || current.condition || 'Clear'
  }\n`
  prompt += `- Relative Humidity: ${current.humidity ?? 'N/A'}%\n`
  prompt += `- Wind Speed: ${windSpeed ?? 'N/A'} ${windUnit} (${
    current.windDirection ?? current.windDirectionDeg ?? ''
  })\n`
  prompt += `- Atmospheric Pressure: ${
    current.pressure ?? current.pressureHpa ?? 'N/A'
  } hPa\n\n`

  if (daily.length > 0) {
    prompt += `--- 5-Day Forecast ---\n`
    daily.forEach((d, idx) => {
      prompt += `Day ${idx + 1} (${d.date || d.day || 'Upcoming'}): Max ${
        d.maxTemperature ?? d.temperature ?? '--'
      }°C, Min ${d.minTemperature ?? '--'}°C, Rain Prob: ${
        d.precipitationProbability ?? d.precipitationProbabilityMax ?? 0
      }%, Condition: ${d.weatherDescription || d.condition || 'Fair'}\n`
    })
    prompt += `\n`
  }

  if (imdWarning && imdWarning.hasActiveWarning) {
    prompt += `--- Official IMD Warning ---\n`
    prompt += `- Level: ${imdWarning.warningLevel} Alert (${imdWarning.action})\n`
    prompt += `- Hazard: ${imdWarning.hazard}\n`
    prompt += `- Advisory: ${imdWarning.advice}\n\n`
  }

  if (nwpComparison?.consensus) {
    prompt += `--- NWP Model Consensus (ECMWF vs GFS) ---\n`
    prompt += `- Model Agreement Score: ${
      nwpComparison.consensus.modelAgreementScore ??
      nwpComparison.consensus.confidenceScore ??
      'N/A'
    }% (${nwpComparison.consensus.confidenceCategory})\n`
    prompt += `- Consensus Note: ${nwpComparison.consensus.agreementSummary}\n\n`
  }

  if (nwpComparison?.forecastUncertainty) {
    const uncertainty = nwpComparison.forecastUncertainty
    const largest = uncertainty.largestDisagreement
    prompt += `--- Deterministic NWP Forecast Uncertainty ---\n`
    prompt += `- Agreement level: ${uncertainty.agreementLevel}\n`
    prompt += `- Model agreement score: ${
      uncertainty.modelAgreementScore ?? 'unavailable'
    } (agreement measure only, not a probability)\n`
    prompt += `- Variable uncertainty: temperature ${uncertainty.uncertainty.temperature}, precipitation ${uncertainty.uncertainty.precipitation}, wind ${uncertainty.uncertainty.windSpeed}\n`
    prompt += `- Matched forecast timestamps: ${uncertainty.matchedTimestamps}\n`
    if (largest) {
      prompt += `- Largest model disagreement: ${largest.variable} at ${largest.timestamp}, spread ${largest.spread}\n`
    }
    prompt += `Explain this as how consistently GFS and ECMWF support each other. Do not invent another score, probability, guarantee, or claim that disagreement proves either model is wrong. Mention the largest disagreement only when relevant to the user's question.\n\n`
  }

  if (agroAdvisory?.recommendations) {
    prompt += `--- Agriculture & Crop Insights ---\n`
    prompt += `- Irrigation: ${agroAdvisory.recommendations.irrigation.advice}\n`
    prompt += `- Pest Spraying: ${agroAdvisory.recommendations.pesticideSpraying.advice}\n`
    prompt += `- Crop Specific: ${agroAdvisory.recommendations.cropSpecificAdvisory}\n\n`
  }

  prompt += `Target Output Language: ${language}\n`
  prompt += `Please answer the user's question accurately using ONLY the verified data above.`

  return prompt
}

export default {
  SYSTEM_INSTRUCTION,
  buildGroundedContextPrompt
}
