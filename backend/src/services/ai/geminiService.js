import env from '../../config/env.js';
import { SYSTEM_INSTRUCTION, buildGroundedContextPrompt } from './promptTemplates.js';

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Generate AI explanation from Google Gemini API with grounded facts
 * @param {object} param0
 * @param {string} param0.userMessage - Original user query
 * @param {object} param0.groundedContext - Meteorological parameters and warnings
 * @param {string} [param0.language='en'] - Output language ('en', 'hi', 'mr', 'bn', 'ta', 'te')
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
            { text: `User Question: "${userMessage}". Please answer exclusively in language code: ${language}. Provide a warm, polite, lively and natural conversational response.` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        topP: 0.85,
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
 * Deterministic lively multilingual grounded generator
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
  const condition = current.weatherDescription || current.condition || 'निरभ्र';

  // 1. Marathi (मराठी - Lively & Natural)
  if (language === 'mr' || query.includes('काय') || query.includes('आहे') || query.includes('हवामान')) {
    let answer = `नमस्कार! सध्या **${location}** मध्ये हवामान **${condition}** असून तापमान **${temp}°C** आहे (जाणवणारे तापमान: ${current.apparentTemperature ?? temp}°C).\n\n`;
    answer += `📊 **मुख्य हवामान घटक:**\n`;
    answer += `• हवेतील ओलावा (आर्द्रता): **${humidity}%**\n`;
    answer += `• वाऱ्याचा वेग: **${wind} किमी/तास**\n`;

    if (todayForecast.maxTemperature !== undefined) {
      answer += `• आजचे अपेक्षित तापमान: **${todayForecast.minTemperature}°C ते ${todayForecast.maxTemperature}°C** दरम्यान राहील.\n`;
    }

    if (rainProb > 40) {
      answer += `\n🌧️ **पावसाचा अंदाज:** आज पाऊस पडण्याची शक्यता **${rainProb}%** आहे. बाहेर पडताना छत्री किंवा रेनकोट सोबत ठेवा!`;
    } else {
      answer += `\n☀️ **पावसाचा अंदाज:** आज पावसाची शक्यता फारच कमी (**${rainProb}%**) असून दिवसभर हवामान कोरडे राहण्याचा अंदाज आहे.`;
    }

    if (imdWarning && imdWarning.hasActiveWarning) {
      answer += `\n\n🚨 **हवामान विभागाचा (IMD) इशारा:** ${imdWarning.warningLevel} अलर्ट (${imdWarning.action}) जारी करण्यात आला आहे. धोका: ${imdWarning.hazard} - ${imdWarning.advice}`;
    }

    if (agroAdvisory?.recommendations?.cropSpecificAdvisory || query.includes('पीक') || query.includes('शेत')) {
      answer += `\n\n🌾 **शेतकरी मित्रांसाठी सल्ला:** ${agroAdvisory?.recommendations?.cropSpecificAdvisory || 'पिकांमधील ओलावा तपासा आणि हवामानानुसार पाणी व्यवस्थापन करा.'}`;
    }

    return answer;
  }

  // 2. Hindi (हिन्दी - Lively & Natural)
  if (language === 'hi' || query.includes('kaisa') || query.includes('hogi') || query.includes('mausam') || query.includes('baarish')) {
    let answer = `नमस्ते! वर्तमान में **${location}** में मौसम **${condition}** है और तापमान **${temp}°C** बना हुआ है।\n\n`;
    answer += `📊 **प्रमुख मौसम आंकड़े:**\n`;
    answer += `• आर्द्रता: **${humidity}%**\n`;
    answer += `• हवा की गति: **${wind} किमी/घंटा**\n`;

    if (rainProb > 40) {
      answer += `\n🌧️ **बारिश की संभावना:** आज **${rainProb}%** बारिश होने के आसार हैं। बाहर निकलते समय सावधानी बरतें।`;
    } else {
      answer += `\n☀️ **बारिश की संभावना:** आज बारिश की संभावना कम (**${rainProb}%**) है और मौसम सामान्य रहेगा।`;
    }

    if (imdWarning?.hasActiveWarning) {
      answer += `\n\n🚨 **मौसम विभाग (IMD) चेतावनी:** ${imdWarning.warningLevel} अलर्ट जारी है (${imdWarning.hazard})। कृपया स्थानीय सुरक्षा निर्देशों का पालन करें।`;
    }

    return answer;
  }

  // 3. Bengali (বাংলা)
  if (language === 'bn') {
    let answer = `নমস্কার! বর্তমানে **${location}**-এ আবহাওয়া **${condition}** এবং তাপমাত্রা **${temp}°C**। বাতাসের আর্দ্রতা **${humidity}%** এবং বাতাসের গতি **${wind} কিমি/ঘণ্টা**।`;
    if (rainProb > 40) {
      answer += `\n🌧️ বৃষ্টির সম্ভাবনা **${rainProb}%**।`;
    }
    return answer;
  }

  // 4. Tamil (தமிழ்)
  if (language === 'ta') {
    let answer = `வணக்கம்! தற்போது **${location}** பகுதியில் வெப்பநிலை **${temp}°C** ஆகவும், வானிலை **${condition}** ஆகவும் உள்ளது. ஈரப்பதம் **${humidity}%** மற்றும் காற்றின் வேகம் **${wind} கி.மீ/மணி**।`;
    if (rainProb > 40) {
      answer += `\n🌧️ மழை பெய்ய வாய்ப்பு **${rainProb}%** உள்ளது.`;
    }
    return answer;
  }

  // 5. Telugu (తెలుగు)
  if (language === 'te') {
    let answer = `నమస్కారం! ప్రస్తుతం **${location}** లో ఉష్ణోగ్రత **${temp}°C** మరియు వాతావరణం **${condition}** గా ఉంది. గాలిలో తేమ **${humidity}%** మరియు గాలి వేగం **${wind} కి.మీ/గం**।`;
    if (rainProb > 40) {
      answer += `\n🌧️ వర్షం పడే అవకాశం **${rainProb}%** ఉంది.`;
    }
    return answer;
  }

  // 6. Default English
  let answer = `Hello! Currently in **${location}**, the weather is **${condition}** with a temperature of **${temp}°C** (feels like ${current.apparentTemperature ?? temp}°C).\n\n`;
  answer += `• Humidity: **${humidity}%**\n`;
  answer += `• Wind Speed: **${wind} km/h**\n`;

  if (rainProb > 40) {
    answer += `🌧️ **Precipitation:** Rain is likely today with a **${rainProb}%** probability.`;
  } else {
    answer += `☀️ **Precipitation:** Dry conditions expected with low rainfall chance (**${rainProb}%**).`;
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
