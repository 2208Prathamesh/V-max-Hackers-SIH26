import env from '../../config/env.js';
import { SYSTEM_INSTRUCTION, buildGroundedContextPrompt } from './promptTemplates.js';

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Generate AI explanation from Google Gemini API with grounded facts
 * @param {object} param0
 * @param {string} param0.userMessage - Original user query
 * @param {object} param0.groundedContext - Meteorological parameters and warnings
 * @param {string} [param0.language='en'] - Output language
 * @returns {Promise<string>} Natural language response
 */
export async function generateGeminiWeatherResponse({ userMessage, groundedContext, language = 'en' }) {
  const apiKey = env.GEMINI_API_KEY;

  const contextPrompt = buildGroundedContextPrompt({
    ...groundedContext,
    language
  });

  // Fallback to local rule-based explanation if API key is not configured
  if (!apiKey || apiKey.trim() === '') {
    return generateOfflineGroundedResponse({ userMessage, groundedContext, language });
  }

  try {
    const model = env.GEMINI_MODEL || 'gemini-1.5-flash';
    const url = `${GEMINI_API_ENDPOINT}/${model}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: SYSTEM_INSTRUCTION },
            { text: contextPrompt },
            { text: `User Question: "${userMessage}"` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2, // Low temperature for high factual grounding
        topP: 0.8,
        maxOutputTokens: 800
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.warn(`Gemini API returned ${response.status}. Using offline grounded fallback.`);
      return generateOfflineGroundedResponse({ userMessage, groundedContext, language });
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (candidate && candidate.trim()) {
      return candidate.trim();
    }

    return generateOfflineGroundedResponse({ userMessage, groundedContext, language });
  } catch (err) {
    console.warn('Gemini API call failed:', err.message);
    return generateOfflineGroundedResponse({ userMessage, groundedContext, language });
  }
}

/**
 * Deterministic multilingual grounded fallback generator
 */
function generateOfflineGroundedResponse({ userMessage, groundedContext, language = 'en' }) {
  const { location, currentWeather, forecastDaily = [], imdWarning, agroAdvisory } = groundedContext;
  const current = currentWeather || {};
  const todayForecast = forecastDaily[0] || {};
  const query = (userMessage || '').toLowerCase();

  const temp = current.temperature ?? '28';
  const humidity = current.humidity ?? '65';
  const wind = current.windSpeed ?? '12';
  const rainProb = todayForecast.precipitationProbability ?? current.precipitation ?? 0;
  const condition = current.weatherDescription || current.condition || 'Clear';

  // Multilingual Templates (Marathi, Hindi, English)
  if (language === 'mr' || query.includes('काय') || query.includes('आहे')) {
    let answer = `सध्या ${location} मध्ये तापमान ${temp}°C असून हवामान ${condition} आहे. हवेतील आर्द्रता ${humidity}% आणि वाऱ्याचा वेग ${wind} किमी/तास आहे.`;
    if (rainProb > 40) {
      answer += ` 🌧️ पावसाची शक्यता ${rainProb}% आहे.`;
    }
    if (imdWarning?.hasActiveWarning) {
      answer += ` 🚨 IMD इशारा: ${imdWarning.warningLevel} अलर्ट (${imdWarning.hazard}).`;
    }
    return answer;
  }

  if (language === 'hi' || query.includes('kaisa') || query.includes('hogi') || query.includes('mausam')) {
    let answer = `वर्तमान में ${location} में तापमान ${temp}°C है और मौसम ${condition} बना हुआ है। आर्द्रता ${humidity}% और हवा की गति ${wind} किमी/घंटा है।`;
    if (rainProb > 40) {
      answer += ` 🌧️ बारिश की संभावना ${rainProb}% है।`;
    }
    if (imdWarning?.hasActiveWarning) {
      answer += ` 🚨 IMD चेतावनी: ${imdWarning.warningLevel} अलर्ट (${imdWarning.hazard}).`;
    }
    return answer;
  }

  // Default English grounded answer
  let answer = `Currently in ${location}, the weather is ${condition} with a temperature of ${temp}°C (feels like ${current.apparentTemperature ?? temp}°C). Humidity is at ${humidity}% with winds blowing at ${wind} km/h.`;

  if (query.includes('rain') || query.includes('precipitation')) {
    if (rainProb > 40) {
      answer += ` 🌧️ Rain is likely with a ${rainProb}% precipitation probability today.`;
    } else {
      answer += ` ☀️ Little to no rainfall expected today (${rainProb}% chance).`;
    }
  } else if (todayForecast.maxTemperature !== undefined && todayForecast.minTemperature !== undefined) {
    answer += ` Today's temperature is expected to range between ${todayForecast.minTemperature}°C and ${todayForecast.maxTemperature}°C.`;
  }

  if (imdWarning && imdWarning.hasActiveWarning) {
    answer += `\n\n🚨 **IMD Official Warning**: ${imdWarning.warningLevel} Alert (${imdWarning.action}) due to ${imdWarning.hazard}. ${imdWarning.advice}`;
  }

  if (agroAdvisory?.recommendations?.cropSpecificAdvisory && query.includes('crop')) {
    answer += `\n\n🌾 **Crop Advisory**: ${agroAdvisory.recommendations.cropSpecificAdvisory}`;
  }

  return answer;
}

export default {
  generateGeminiWeatherResponse
};
