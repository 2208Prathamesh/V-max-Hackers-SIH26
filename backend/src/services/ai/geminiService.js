import env from '../../config/env.js';
import { SYSTEM_INSTRUCTION, buildGroundedContextPrompt, buildDecisionContextPrompt } from './promptTemplates.js';

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Generate AI explanation from Google Gemini API with grounded facts
 * @param {object} param0
 * @param {string} param0.userMessage - Original user query
 * @param {object} param0.groundedContext - Meteorological parameters and warnings
 * @param {string} [param0.language='en'] - Output language ('en', 'hi', 'mr', 'bn', 'ta', 'te')
 * @returns {Promise<string>} Natural language response
 */
export async function generateGeminiWeatherResponse({ userMessage, groundedContext, language = 'en', userRole = 'user' }) {
  const apiKey = env.GEMINI_API_KEY;

  const contextPrompt = buildGroundedContextPrompt({
    ...groundedContext,
    language,
    userRole
  });

  // Fallback to local rule-based explanation if API key is not configured
  if (!apiKey || apiKey.trim() === '') {
    return generateOfflineGroundedResponse({ userMessage, groundedContext, language, userRole });
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
            {
              text: `USER QUERY: "${userMessage}"
TARGET LANGUAGE: ${language}
RESPONSE DIRECTIVE:
1. Strictly answer ONLY what the user asked directly.
   - If user asked for temperature/temp: state ONLY the current temperature, feels-like, and today's min/max. DO NOT mention crops, farming, laundry, umbrellas, car washes, or disaster protocols.
   - If user asked about rain: focus ONLY on rain probability, sky condition, and precipitation timing.
   - If user asked about umbrella: answer directly Yes/No with the rain chance.
   - If user asked about agricultural decisions (spray/irrigation): give targeted advice for that specific task.
2. NEVER mention 'N/A' or 'N/A location'.
3. Keep the response crisp, natural, and concise (under 3 sentences unless a detailed breakdown was explicitly requested).`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 500
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Gemini API returned ${response.status}. Using offline grounded fallback.`);
      return generateOfflineGroundedResponse({ userMessage, groundedContext, language, userRole });
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (candidate && candidate.trim()) {
      return candidate.trim();
    }

    return generateOfflineGroundedResponse({ userMessage, groundedContext, language, userRole });
  } catch (err) {
    console.warn('Gemini API call failed:', err.message);
    return generateOfflineGroundedResponse({ userMessage, groundedContext, language, userRole });
  }
}

/**
 * Dynamic, personalized, and API-grounded weather intelligence generator
 * Responds conversationally to WHAT the user said + REAL API telemetry + USER ROLE personalization
 */
/**
 * Concise, laser-focused, and query-targeted grounded response generator.
 * Responds strictly to WHAT was asked, citing real API metrics, without dumping unrelated topics.
 */
function generateOfflineGroundedResponse({ userMessage, groundedContext, language = 'en', userRole = 'user' }) {
  const { location, currentWeather, forecastDaily = [], imdWarning, agroAdvisory } = groundedContext;

  const cleanLoc = (location && location !== 'N/A' && location !== 'undefined') ? location : null;
  const current = currentWeather || {};
  const today = forecastDaily[0] || {};
  const tomorrow = forecastDaily[1] || {};
  const query = (userMessage || '').toLowerCase().trim();

  // If no valid location was resolved and query needs location, ask for location directly!
  if (!cleanLoc) {
    if (/\b(temp|temperature|how hot|how cold|heat|warm|cold|tapman|तापमान)\b/.test(query)) {
      return language === 'mr'
        ? 'कोणत्या शहराचे किंवा परिसराचे तापमान तुम्हाला जाणून घ्यायचे आहे?'
        : language === 'hi'
          ? 'आप किस शहर या स्थान का तापमान जानना चाहते हैं?'
          : 'Which city or location would you like to know the temperature for?';
    }
    if (/\b(rain|raining|rainfall|baarish|paus|पाऊस|बारिश)\b/.test(query)) {
      return language === 'mr'
        ? 'कोणत्या शहराचा पावसाचा अंदाज तुम्हाला पाहायचा आहे?'
        : language === 'hi'
          ? 'आप किस स्थान का बारिश का अनुमान देखना चाहते हैं?'
          : 'Which city or location would you like to check the rain forecast for?';
    }
    return language === 'mr'
      ? 'कृपया शहर किंवा जिल्ह्याचे नाव सांगा ज्याचे हवामान तुम्हाला पाहायचे आहे.'
      : language === 'hi'
        ? 'कृपया उस शहर या जिले का नाम बताएं जिसका मौसम आप जानना चाहते हैं।'
        : 'Which city or location would you like to check the weather for?';
  }

  const temp = Math.round(Number(current.temperature ?? 28));
  const apparentTemp = Math.round(Number(current.apparentTemperature ?? temp));
  const humidity = Math.round(Number(current.humidity ?? 65));
  const wind = Math.round(Number(current.windSpeed ?? 12));
  const condition = current.condition || current.weatherDescription || 'Mainly clear';

  const todayRainProb = Math.round(Number(today.precipitationProbability ?? current.precipitation ?? 0));
  const tomorrowRainProb = Math.round(Number(tomorrow.precipitationProbability ?? 0));
  const todayMin = Math.round(Number(today.minTemperature ?? (temp - 4)));
  const todayMax = Math.round(Number(today.maxTemperature ?? (temp + 4)));

  const hasWarning = imdWarning && (imdWarning.hasActiveWarning || imdWarning.warningLevel);
  const warningLevel = imdWarning?.warningLevel || 'Active';
  const warningHazard = imdWarning?.hazard || 'Weather Warning';

  // 1. GREETING
  if (/\b(hi|hello|hey|namaste|who are you|what can you do|help me|start)\b/.test(query)) {
    if (userRole === 'farmer') {
      return `🌾 **Namaste! I am WeatherGPT Krishi Advisor for ${cleanLoc}.**\n\nCurrent field weather is **${condition}, ${temp}°C** (Wind: **${wind} km/h**, Rain Chance: **${todayRainProb}%**). Ask me about pesticide spray windows, irrigation timing, or crop advisories.`;
    }
    return `Hello! I am **WeatherGPT** for **${cleanLoc}**.\n\nCurrent conditions: **${condition}**, **${temp}°C** (feels like **${apparentTemp}°C**). Ask me directly about temperature, rain, umbrellas, forecasts, or clothing advice.`;
  }

  // 2. TEMPERATURE ONLY (What is the temp / How hot / Feels like)
  if (/\b(temp|temperature|how hot|how cold|feels like|heat|warm|cold|tapman|तापमान)\b/.test(query) && !query.includes('spray') && !query.includes('irrigat')) {
    if (language === 'mr') {
      return `🌡️ **${cleanLoc}** चे सध्याचे तापमान **${temp}°C** आहे (जाणवणारे तापमान: **${apparentTemp}°C**).\n• आजचे अपेक्षित तापमान: **${todayMin}°C (किमान) ते ${todayMax}°C (कमाल)**\n• हवेतील स्थिती: **${condition}** (आर्द्रता: **${humidity}%**)`;
    }
    if (language === 'hi') {
      return `🌡️ **${cleanLoc}** में वर्तमान तापमान **${temp}°C** है (महसूस: **${apparentTemp}°C**)।\n• आज का तापमान दायरा: **${todayMin}°C (न्यूनतम) से ${todayMax}°C (अधिकतम)**\n• वर्तमान स्थिति: **${condition}** (आर्द्रता: **${humidity}%**)`;
    }
    return `🌡️ The current temperature in **${cleanLoc}** is **${temp}°C** (feels like **${apparentTemp}°C**).\n\n• **Today's Range:** Minimum **${todayMin}°C** to Maximum **${todayMax}°C**\n• **Conditions:** ${condition} with **${humidity}%** relative humidity and **${wind} km/h** winds.`;
  }

  // 3. TOMORROW FORECAST
  if (/\b(tomorrow|kal|udya|उद्या|कल)\b/.test(query)) {
    const willRain = tomorrowRainProb >= 40;
    return `📅 **Tomorrow's Weather in ${cleanLoc}:**\n\n• **Condition:** ${tomorrow.condition || condition}\n• **Temperature:** **${Math.round(tomorrow.minTemperature ?? todayMin)}°C** to **${Math.round(tomorrow.maxTemperature ?? todayMax)}°C**\n• **Rain Probability:** **${tomorrowRainProb}%** (${willRain ? 'Rain is expected tomorrow' : 'Mostly dry weather expected'})`;
  }

  // 4. UMBRELLA ONLY
  if (/\b(umbrella|raincoat|chhati|छत्री)\b/.test(query)) {
    if (todayRainProb >= 40) {
      return `☔ **Yes, carry an umbrella in ${cleanLoc} today!** Rain probability is elevated at **${todayRainProb}%** with **${condition}** skies.`;
    }
    return `☀️ **No, you likely won't need an umbrella in ${cleanLoc} today.** Rain chance is only **${todayRainProb}%** under **${condition}** skies.`;
  }

  // 5. RAIN ONLY (Will it rain / Raining)
  if (/\b(rain|raining|rainfall|baarish|paus|पाऊस|बारिश|drizzle|shower|monsoon)\b/.test(query) && !query.includes('spray') && !query.includes('irrigat') && !query.includes('wash')) {
    if (todayRainProb >= 50) {
      return `🌧️ **Rain is likely in ${cleanLoc} today.** Precipitation chance is **${todayRainProb}%** with **${condition}** skies and **${humidity}%** humidity.`;
    }
    if (todayRainProb >= 25) {
      return `⛅ **Low-to-moderate rain risk in ${cleanLoc} today (${todayRainProb}%).** Passing brief showers are possible, but continuous rain is unlikely.`;
    }
    return `☀️ **Dry conditions expected in ${cleanLoc} today.** Rain probability is only **${todayRainProb}%** with **${condition}** weather.`;
  }

  // 6. WIND ONLY
  if (/\b(wind|windy|winds|hawa|वाऱ्याचा वेग|हवा)\b/.test(query) && !query.includes('spray')) {
    return `💨 The wind velocity in **${cleanLoc}** is currently **${wind} km/h** (${wind > 20 ? 'moderate breeze' : 'gentle breeze'}).`;
  }

  // 7. HUMIDITY ONLY
  if (/\b(humidity|humid|moisture in air|आर्द्रता|ओलावा)\b/.test(query) && !query.includes('soil')) {
    return `💧 The relative humidity in **${cleanLoc}** is currently **${humidity}%** (Current temp: **${temp}°C**).`;
  }

  // 8. CAR WASH
  if (/\b(car|wash)\b/.test(query) && !query.includes('crop') && !query.includes('clothes')) {
    if (todayRainProb > 30) {
      return `🚗 **Hold off on washing your car in ${cleanLoc} today.** Rain risk is **${todayRainProb}% today** and **${tomorrowRainProb}% tomorrow**. Washing now risks rain spots.`;
    }
    return `🚗 **Good day to wash your vehicle in ${cleanLoc}!** Rain probability is low at **${todayRainProb}%** and conditions are mostly **${condition}**.`;
  }

  // 9. CLOTHES DRYING
  if (/\b(clothes|laundry|dry clothes)\b/.test(query) && !query.includes('crop') && !query.includes('harvest')) {
    if (todayRainProb > 35 || humidity > 80) {
      return `🧺 **Indoor drying recommended in ${cleanLoc}.** Rain risk is **${todayRainProb}%** and humidity is high at **${humidity}%**. Clothes will dry slowly outside.`;
    }
    return `🧺 **Great day to dry clothes outside in ${cleanLoc}!** Rain chance is low at **${todayRainProb}%** with **${wind} km/h** breeze to assist drying.`;
  }

  // 10. HARVEST / CROP DRYING (Farmer specific)
  if ((query.includes('crop') || query.includes('harvest') || query.includes('grain')) && (query.includes('dry') || query.includes('drying'))) {
    if (todayRainProb > 30 || tomorrowRainProb > 30) {
      return `🌾 **Do not dry harvested produce in open yards in ${cleanLoc} today.** Rain risk is **${todayRainProb}% today** and **${tomorrowRainProb}% tomorrow**. Keep grain covered under tarpaulins.`;
    }
    return `🌾 **Safe to dry harvested crops in open yards in ${cleanLoc}.** Low precipitation risk (**${todayRainProb}%**) and temperatures reaching **${todayMax}°C**.`;
  }

  // 11. SPRAYING PESTICIDES
  if (/\b(spray|spraying|pesticide|pesticides|fungicide|chemical|weedicide|फवारणी|छिड़काव)\b/.test(query)) {
    if (wind > 15) {
      return `⚠️ **Pesticide Spray in ${cleanLoc}: NOT RECOMMENDED (High Wind)**\n\nWind speed is **${wind} km/h** (exceeds the 15 km/h safety threshold). Fine spray droplets will drift into non-target areas. Wait for calm morning or evening conditions.`;
    }
    if (todayRainProb > 35) {
      return `⚠️ **Pesticide Spray in ${cleanLoc}: NOT RECOMMENDED (Rain Risk)**\n\nRain probability is **${todayRainProb}%**. Any rainfall within 4–6 hours will wash off foliar chemicals. Wait for a clear dry window.`;
    }
    return `✅ **Pesticide Spray in ${cleanLoc}: SAFE TO SPRAY**\n\nWind velocity is calm at **${wind} km/h** (< 15 km/h limit) and rain risk is low at **${todayRainProb}%**. Best applied early morning (6–9 AM) or late afternoon.`;
  }

  // 12. IRRIGATION
  if (/\b(irrigat|irrigation|water crops|water the field|सिंचाई|पाणी)\b/.test(query)) {
    if (todayRainProb > 40 || tomorrowRainProb > 40) {
      return `🌧️ **Irrigation Guidance for ${cleanLoc}: POSTPONE IRRIGATION**\n\nRain probability is **${todayRainProb}% today** and **${tomorrowRainProb}% tomorrow**. Avoid excess field moisture and root rot.`;
    }
    return `💧 **Irrigation Guidance for ${cleanLoc}: PROCEED WITH IRRIGATION**\n\nDry conditions forecast with only **${todayRainProb}%** rain risk. Provide regular drip or canal watering as per crop stage.`;
  }

  // 13. WHAT TO WEAR
  if (/\b(wear|dress|jacket|sweater|what should i wear)\b/.test(query)) {
    if (temp >= 32 || apparentTemp >= 35) {
      return `👕 In **${cleanLoc}**, it feels like **${apparentTemp}°C** (${temp}°C with ${humidity}% humidity). Wear loose, light-colored cotton clothes and carry drinking water.`;
    }
    if (temp <= 18) {
      return `🧥 In **${cleanLoc}**, it's **${temp}°C**. A light jacket or sweater is recommended today.`;
    }
    return `👕 In **${cleanLoc}**, temperature is **${temp}°C** (feels like **${apparentTemp}°C**). Comfortable casual everyday wear is suitable today.`;
  }

  // 14. DEFAULT / GENERAL WEATHER OVERVIEW (Crisp 3-line status)
  return `🌤️ **Current Weather in ${cleanLoc}:**\n\n• **Status:** **${condition}**, **${temp}°C** (feels like **${apparentTemp}°C**)\n• **Today's Range:** **${todayMin}°C to ${todayMax}°C**\n• **Precipitation Chance:** **${todayRainProb}%**\n• **Wind & Moisture:** **${wind} km/h** | **${humidity}%** humidity\n${hasWarning ? `\n🚨 **IMD Alert:** ${warningLevel} Alert (${warningHazard})` : ''}`;
}

export default {
  generateGeminiWeatherResponse
};
