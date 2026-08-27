/**
 * System Prompts & Grounded Meteorological Context Templates for Gemini AI
 */

export const SYSTEM_INSTRUCTION = `You are WeatherGPT, an authoritative, intelligent, and empathetic conversational meteorological assistant.

CRITICAL INSTRUCTIONS:
1. Grounding: You must strictly interpret, explain, and contextualize the verified meteorological data provided in the prompt. NEVER invent temperatures, rain probability, wind speeds, or fake disaster alerts.
2. Multilingual: If the user asks in Hindi, Marathi, Bengali, Tamil, Telugu, or any other supported Indian language (or if a specific language is requested), reply fluently and naturally in that language with correct meteorological terminology.
3. Domain Depth:
   - For General Users: Explain conditions clearly (e.g. "Warm and humid afternoon with a light breeze").
   - For Farmers/Agriculture: Include actionable advice about irrigation, pesticide spraying, and crop protection.
   - For Disaster/Severe Alerts: Highlight safety measures, waterlogging precautions, and emergency emergency advice clearly with alert emojis (🚨, ⚠️).
4. Tone: Helpful, concise, scientifically accurate, and friendly.`;

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
export function buildGroundedContextPrompt({
  location,
  currentWeather,
  forecastDaily = [],
  imdWarning,
  agroAdvisory,
  nwpComparison,
  language = 'en'
}) {
  const current = currentWeather || {};
  const daily = forecastDaily.slice(0, 5);

  let prompt = `VERIFIED METEOROLOGICAL DATA FOR: ${location}\n\n`;

  prompt += `--- Current Weather ---\n`;
  prompt += `- Temperature: ${current.temperature ?? 'N/A'}°C (Feels like: ${current.apparentTemperature ?? current.feelsLike ?? 'N/A'}°C)\n`;
  prompt += `- Condition: ${current.weatherDescription || current.condition || 'Clear'}\n`;
  prompt += `- Relative Humidity: ${current.humidity ?? 'N/A'}%\n`;
  prompt += `- Wind Speed: ${current.windSpeed ?? 'N/A'} km/h (${current.windDirection ?? ''})\n`;
  prompt += `- Atmospheric Pressure: ${current.pressure ?? 'N/A'} hPa\n\n`;

  if (daily.length > 0) {
    prompt += `--- 5-Day Forecast ---\n`;
    daily.forEach((d, idx) => {
      prompt += `Day ${idx + 1} (${d.date || d.day || 'Upcoming'}): Max ${d.maxTemperature ?? d.temperature ?? '--'}°C, Min ${d.minTemperature ?? '--'}°C, Rain Prob: ${d.precipitationProbability ?? d.precipitationProbabilityMax ?? 0}%, Condition: ${d.weatherDescription || d.condition || 'Fair'}\n`;
    });
    prompt += `\n`;
  }

  if (imdWarning && imdWarning.hasActiveWarning) {
    prompt += `--- Official IMD Warning ---\n`;
    prompt += `- Level: ${imdWarning.warningLevel} Alert (${imdWarning.action})\n`;
    prompt += `- Hazard: ${imdWarning.hazard}\n`;
    prompt += `- Advisory: ${imdWarning.advice}\n\n`;
  }

  if (nwpComparison?.consensus) {
    prompt += `--- NWP Model Consensus (ECMWF vs GFS) ---\n`;
    prompt += `- Model Confidence: ${nwpComparison.consensus.confidenceScore}% (${nwpComparison.consensus.confidenceCategory})\n`;
    prompt += `- Consensus Note: ${nwpComparison.consensus.agreementSummary}\n\n`;
  }

  if (agroAdvisory?.recommendations) {
    prompt += `--- Agriculture & Crop Insights ---\n`;
    prompt += `- Irrigation: ${agroAdvisory.recommendations.irrigation.advice}\n`;
    prompt += `- Pest Spraying: ${agroAdvisory.recommendations.pesticideSpraying.advice}\n`;
    prompt += `- Crop Specific: ${agroAdvisory.recommendations.cropSpecificAdvisory}\n\n`;
  }

  prompt += `Target Output Language: ${language}\n`;
  prompt += `Please answer the user's question accurately using ONLY the verified data above.`;

  return prompt;
}

export default {
  SYSTEM_INSTRUCTION,
  buildGroundedContextPrompt
};
