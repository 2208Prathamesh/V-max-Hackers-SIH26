import weatherService from './weather/weatherService.js';
import { searchLocation } from './weather/openMeteo/geocoding.js';

/**
 * Extract a candidate city/location name from user query
 * Examples:
 * - "What is the current weather in Mumbai?" -> "Mumbai"
 * - "Will it rain in Delhi tomorrow?" -> "Delhi"
 * - "Temperature for Pune" -> "Pune"
 * - "Tokyo weather" -> "Tokyo"
 * @param {string} text - User message input
 * @returns {string|null} - Extracted candidate location
 */
function extractLocationQuery(text) {
  const clean = (text || '').replace(/[?!.,]/g, ' ').trim();

  // 1. Look for "in/for/at/near/around/of <location>" at the end
  const prepEndMatch = clean.match(/\b(?:in|for|at|near|around|of)\s+([a-zA-Z\s]+)$/i);
  if (prepEndMatch && prepEndMatch[1]) {
    const candidate = prepEndMatch[1]
      .replace(/\b(today|tomorrow|tonight|now|this week|please|currently)\b/gi, '')
      .trim();
    if (candidate.length >= 2) return candidate;
  }

  // 2. Look for "in/for/at/near/around/of <location> (today|tomorrow|weather|forecast...)"
  const prepMiddleMatch = clean.match(/\b(?:in|for|at|near|around|of)\s+([a-zA-Z\s]+?)\s+(?:today|tomorrow|tonight|now|this week|weather|forecast|temperature|temp|rain|climate)/i);
  if (prepMiddleMatch && prepMiddleMatch[1]) {
    const candidate = prepMiddleMatch[1].trim();
    if (candidate.length >= 2) return candidate;
  }

  // 3. Look for "<location> weather/forecast" at the start
  const cityBeforeWeather = clean.match(/^([a-zA-Z\s]{2,30})\s+(?:weather|forecast|temperature|temp|climate|rain)/i);
  if (cityBeforeWeather && cityBeforeWeather[1]) {
    return cityBeforeWeather[1].trim();
  }

  // 4. Remove common question filler words and check remaining text
  const stripped = clean
    .replace(/\b(what|is|the|how|weather|forecast|temperature|temp|climate|rain|raining|rainy|condition|conditions|like|will|it|today|tomorrow|tonight|now|this|week|please|tell|me|about|give|get|show|check|current|any|in|for|at|of)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (stripped.length >= 2 && stripped.length <= 40) {
    return stripped;
  }

  return null;
}

/**
 * Generate WeatherGPT response dynamically based on live NWP and Open-Meteo data
 * @param {object} param0
 * @param {string} param0.conversationId - Conversation ID
 * @param {string} param0.userId - User ID
 * @param {string} param0.message - User text message
 * @returns {Promise<{ content: string, messageType: string, metadata: object }>}
 */
const generateResponse = async ({ conversationId, userId, message }) => {
  const text = (message || '').trim();
  const lowerText = text.toLowerCase();

  let response = {
    content: '',
    messageType: 'text',
    metadata: {}
  };

  const isWeatherQuestion =
    lowerText.includes('weather') ||
    lowerText.includes('temperature') ||
    lowerText.includes('temp') ||
    lowerText.includes('rain') ||
    lowerText.includes('forecast') ||
    lowerText.includes('humidity') ||
    lowerText.includes('wind') ||
    lowerText.includes('cloud') ||
    lowerText.includes('hot') ||
    lowerText.includes('cold') ||
    lowerText.includes('climate') ||
    lowerText.includes('aqi') ||
    lowerText.includes('air quality');

  if (isWeatherQuestion) {
    const locationCandidate = extractLocationQuery(text);

    if (locationCandidate) {
      try {
        const geoResult = await searchLocation(locationCandidate);

        if (geoResult?.results && geoResult.results.length > 0) {
          const match = geoResult.results[0];
          const locationName = `${match.name}${match.admin1 ? ', ' + match.admin1 : ''}, ${match.country}`;
          
          const weatherData = await weatherService.getWeather(match.latitude, match.longitude);
          const current = weatherData?.forecast?.current;
          const daily = weatherData?.forecast?.daily || [];
          const todayDaily = daily[0] || {};

          const temp = current?.temperature ?? 'N/A';
          const humidity = current?.humidity ?? 'N/A';
          const wind = current?.windSpeed ?? 'N/A';
          const rainProb = todayDaily?.precipitationProbability ?? current?.precipitation ?? 0;

          let answer = `Currently in ${locationName}, the temperature is ${temp}°C with relative humidity at ${humidity}% and wind speed around ${wind} km/h.`;

          if (lowerText.includes('rain') || lowerText.includes('rainy')) {
            if (rainProb > 40) {
              answer += ` 🌧️ Rain is likely with a ${rainProb}% precipitation probability.`;
            } else {
              answer += ` ☀️ Little to no rain expected (${rainProb}% chance).`;
            }
          } else if (todayDaily?.maxTemperature !== undefined && todayDaily?.minTemperature !== undefined) {
            answer += ` Today's forecast ranges from ${todayDaily.minTemperature}°C to ${todayDaily.maxTemperature}°C.`;
          }

          response = {
            content: answer,
            messageType: 'weather',
            metadata: {
              location: locationName,
              latitude: match.latitude,
              longitude: match.longitude,
              current,
              daily: daily.slice(0, 5),
              airQuality: weatherData.airQuality
            }
          };
        } else {
          response.content = `I couldn't locate "${locationCandidate}". Please check the spelling or provide the city and state name.`;
        }
      } catch (err) {
        console.error('Chat weather fetch error:', err.message);
        response.content = `I encountered an issue fetching live weather for "${locationCandidate}". Please try again shortly.`;
      }
    } else {
      response.content = 'Which city or location would you like the weather forecast for?';
    }
  } else {
    response.content =
      'Hello! I am WeatherGPT. Ask me anything about current weather conditions, multi-day forecasts, rainfall chances, wind speeds, or air quality for any city in the world.';
  }

  return response;
};

export { generateResponse, extractLocationQuery };
export default { generateResponse, extractLocationQuery };
