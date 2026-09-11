import weatherService from './weather/weatherService.js'
import { searchLocation } from './weather/openMeteo/geocoding.js'
import imdService from './weather/imd/imdService.js'
import advisoryService from './advisory/advisoryService.js'
import { generateGeminiWeatherResponse } from './ai/geminiService.js'
import { buildWeatherSynthesis } from './weather/weatherSynthesis.js'
import { buildWeatherTimeline } from './weather/weatherTimeline.js'
import { buildDecisionBrief } from './decision/decisionEngine.js'
import { buildDecisionContextPrompt } from './ai/promptTemplates.js'

// ─── Intent categories ────────────────────────────────────────────────────────

const INTENT = {
  WEATHER_QUERY: 'weather_query',         // "What's the weather in Mumbai?"
  DECISION_QUERY: 'decision_query',       // "Can I travel?", "Is it safe?"
  FARM_QUERY: 'farm_query',              // "When should I spray?", "irrigate today?"
  ALERT_QUERY: 'alert_query',            // "Any warnings?", "cyclone update?"
  MARINE_QUERY: 'marine_query',          // "Fishing tomorrow?", "sea conditions?"
  AVIATION_QUERY: 'aviation_query',      // "Flight weather?", "visibility?"
  GENERAL_KNOWLEDGE: 'general_knowledge' // "How do cyclones form?"
}

/**
 * Detect the primary intent of a user message
 * More precise than a flat keyword list — routes to the right data pipeline
 */
function detectIntent (text) {
  const t = (text || '').toLowerCase()

  // Decision queries — questions that need a recommendation, not just data
  if (/\b(can i|should i|safe to|is it okay|worth going|good time to|right time|will it affect|help me decide|what should i do|advice|recommend|do i need|need an?|carry an?|take an?|umbrella|jacket|raincoat|travel|outdoor|picnic)\b/.test(t)) {
    // Narrow to farming if farming words present
    if (/\b(spray|spraying|irrigat|sow|harvest|crops?|farms?|fields?|pesticides?|fertilizers?|plough|weed|frost|heat\s+stress)\b/.test(t)) {
      return INTENT.FARM_QUERY
    }
    return INTENT.DECISION_QUERY
  }

  // Farm queries (even without "should I")
  if (/\b(spray|spraying|irrigat|sow|harvest|crops?|farms?|fields?|pesticides?|fertilizers?|kharif|rabi|paddy|wheat|cotton|sugarcane|jowar|bajra|frost|heat\s+stress|सिंचाई|खेत|फसल|पिक|शेती)\b/.test(t)) {
    return INTENT.FARM_QUERY
  }

  // Alert queries
  if (/\b(alert|warning|cyclone|storm|flood|disaster|emergency|danger|red alert|orange alert|imd warning|चेतावनी|इशारा|चेतावणी)\b/.test(t)) {
    return INTENT.ALERT_QUERY
  }

  // Marine queries
  if (/\b(sea|ocean|wave|fishing|fishermen|marine|coast|coastal|sailor|boat|ship|knots|tide)\b/.test(t)) {
    return INTENT.MARINE_QUERY
  }

  // Aviation queries
  if (/\b(flight|airport|runway|visibility|metar|aviation|pilot|aircraft|cloud ceiling|turbulence|crosswind)\b/.test(t)) {
    return INTENT.AVIATION_QUERY
  }

  // Weather data queries (broad)
  if (/\b(weather|temperature|temp|rain|raining|rainfall|forecast|humidity|wind|cloud|cloudy|sunny|overcast|drizzle|showers?|hot|cold|climate|aqi|air quality|pressure|mausam|baarish|hawa|tapman|हवामान|पाऊस|तापमान|वर्षा|வானிலை|వాతావరణం|আবহাওয়া)\b/.test(t)) {
    return INTENT.WEATHER_QUERY
  }

  return INTENT.GENERAL_KNOWLEDGE
}

/**
 * Detect language from text — expands beyond just hi/mr to cover all 6 supported languages
 */
function detectLanguage (text) {
  const t = (text || '')

  // Devanagari ranges
  if (/[\u0900-\u097F]/.test(t)) {
    // Differentiate Marathi vs Hindi by common words
    if (/काय|आहे|कसं|मराठी|पुण्यात|मुंबईत|नागपूरला/.test(t)) return 'mr'
    return 'hi'
  }

  // Bengali
  if (/[\u0980-\u09FF]/.test(t)) return 'bn'

  // Tamil
  if (/[\u0B80-\u0BFF]/.test(t)) return 'ta'

  // Telugu
  if (/[\u0C00-\u0C7F]/.test(t)) return 'te'

  // Gujarati
  if (/[\u0A80-\u0AFF]/.test(t)) return 'gu'

  // Punjabi (Gurmukhi)
  if (/[\u0A00-\u0A7F]/.test(t)) return 'pa'

  // Roman-script Hindi/Marathi hints
  const lower = t.toLowerCase()
  if (/\b(kaisa|kaise|kaisi|hogi|hoga|mausam|baarish|kya|abhi|kal|aaj|garmi|sardi|tapman|kitna|kitni|hai|batao|bataiye)\b/.test(lower)) return 'hi'
  if (/\b(kaay|aahe|havaaman|havaman|pausha|paus|udya|aaj|kasa|kashi|sang|sanga)\b/.test(lower)) return 'mr'

  return 'en'
}

// Set of common non-location terms (verbs, farm words, conditions, question words)
const NON_LOCATION_TERMS = new Set([
  'spray', 'spraying', 'sprayed', 'pesticide', 'pesticides', 'fertilizer', 'fertilizers',
  'irrigate', 'irrigating', 'irrigation', 'water', 'watering', 'harvest', 'harvesting',
  'sow', 'sowing', 'crop', 'crops', 'field', 'fields', 'farm', 'farming', 'soil', 'moisture',
  'yield', 'paddy', 'wheat', 'cotton', 'sugarcane', 'plants', 'plant', 'seed', 'seeds',
  'vegetable', 'vegetables', 'travel', 'traveling', 'flight', 'drive', 'driving', 'umbrella',
  'picnic', 'outdoors', 'outside', 'walk', 'walking', 'safe', 'safety', 'danger', 'risk', 'risks',
  'alert', 'warning', 'forecast', 'temperature', 'temp', 'rain', 'raining', 'rainfall',
  'thunderstorm', 'storm', 'cyclone', 'flood', 'frost', 'heat', 'heatwave', 'cold', 'wind',
  'winds', 'windy', 'cloud', 'clouds', 'cloudy', 'to', 'a', 'an', 'the', 'my', 'our', 'your',
  'his', 'her', 'their', 'me', 'us', 'today', 'tomorrow', 'tonight', 'now', 'yesterday',
  'days', 'day', 'hours', 'hour', 'morning', 'evening', 'afternoon', 'night', 'week', 'this',
  'next', 'good', 'bad', 'need', 'should', 'can', 'will', 'is', 'it', 'are', 'was', 'were',
  'any', 'some', 'much', 'many', 'more', 'check', 'give', 'tell', 'show', 'please',
  'what', 'where', 'how', 'why', 'who', 'when', 'kaisa', 'kasa', 'aahe', 'hogi', 'tapman',
  'baarish', 'paus', 'havaman', 'mausam', 'ka', 'ki', 'ke', 'mein', 'cha', 'chi', 'che',
  'madhe', 'madhil', 'se', 'ko', 'bhi', 'kya', 'batao', 'sanga'
])

/**
 * Check if a candidate string is a plausible geographical location
 */
function isPlausibleLocation (candidate) {
  if (!candidate || typeof candidate !== 'string') return false
  const trimmed = candidate.trim()
  if (trimmed.length < 2 || trimmed.length > 50) return false

  const words = trimmed.toLowerCase().split(/\s+/)
  // If every word in the candidate is a known non-location word, reject it
  const allNonLocation = words.every(w => NON_LOCATION_TERMS.has(w))
  if (allNonLocation) return false

  // If the candidate contains obvious farm/decision verbs without a comma/state
  if (words.some(w => ['spray', 'pesticide', 'pesticides', 'irrigate', 'crops', 'fertilizer', 'harvest'].includes(w))) {
    return false
  }

  return true
}

/**
 * Extract a location candidate from user text
 */
function extractLocationQuery (text) {
  const clean = (text || '').replace(/[?!.,]/g, ' ').trim()
  if (!clean) return null

  // 1. "in/at/near/around/of/for/me/mein/madhe/madhil <location>" at end
  const prepEndMatch = clean.match(/\b(?:in|at|near|around|of|for|me|mein|se|ko|madhe|madhil)\s+([a-zA-Z\u0900-\u097F\s]+)$/i)
  if (prepEndMatch?.[1]) {
    const candidate = prepEndMatch[1]
      .replace(/\b(today|tomorrow|tonight|now|this week|please|currently|aaj|kal|udya|kaisa|kasa|hai|aahe)\b/gi, '')
      .trim()
    if (isPlausibleLocation(candidate)) return candidate
  }

  // 2. "<location> me/mein/madhe/ka/ki/ke/cha/chi/che (temp|weather|baarish|...)"
  const indianPrepMatch = clean.match(
    /^([a-zA-Z\u0900-\u097F\s]{2,30})\s+(?:me|mein|madhe|madhil|ka|ki|ke|cha|chi|che)\s+(?:today|tomorrow|weather|forecast|temperature|temp|rain|baarish|paus|tapman|mausam|havaman)/i
  )
  if (indianPrepMatch?.[1]) {
    const candidate = indianPrepMatch[1].trim()
    if (isPlausibleLocation(candidate)) return candidate
  }

  // 3. "in/at/near/around/of/for <location> (weather|today|tomorrow...)"
  const prepMiddleMatch = clean.match(
    /\b(?:in|at|near|around|of|for)\s+([a-zA-Z\u0900-\u097F\s]+?)\s+(?:today|tomorrow|tonight|now|this week|weather|forecast|temperature|temp|rain|climate|baarish|tapman|mausam)/i
  )
  if (prepMiddleMatch?.[1]) {
    const candidate = prepMiddleMatch[1].trim()
    if (isPlausibleLocation(candidate)) return candidate
  }

  // 4. "<weather_term> <location>" e.g. "temp delhi", "weather mumbai", "temperature pune", "rain bangalore"
  const weatherBeforeCity = clean.match(/^(?:weather|forecast|temperature|temp|climate|rain|tapman|mausam|havaman|baarish|paus)\s+(?:in|of|for|at)?\s*([a-zA-Z\u0900-\u097F\s]{2,30})$/i)
  if (weatherBeforeCity?.[1]) {
    const candidate = weatherBeforeCity[1].replace(/\b(today|tomorrow|now|please|aaj|kal)\b/gi, '').trim()
    if (isPlausibleLocation(candidate)) return candidate
  }

  // 5. "<location> weather/forecast/temp" at start (e.g. "Delhi temp", "Mumbai weather")
  const cityBeforeWeather = clean.match(/^([a-zA-Z\u0900-\u097F\s]{2,30})\s+(?:weather|forecast|temperature|temp|climate|rain|tapman|mausam|havaman|baarish|paus)/i)
  if (cityBeforeWeather?.[1]) {
    const candidate = cityBeforeWeather[1].trim()
    if (isPlausibleLocation(candidate)) return candidate
  }

  // 6. Direct single city name input (1 to 3 words, e.g. "Delhi", "New Delhi", "Mumbai", "Baramati")
  const words = clean.split(/\s+/)
  if (words.length <= 3 && isPlausibleLocation(clean)) {
    if (!/^(hi|hello|hey|namaste|thanks|thank you|ok|okay|yes|no|bye|help)\b/i.test(clean)) {
      return clean
    }
  }

  return null
}

/**
 * Generate WeatherGPT response with role-awareness and decision intelligence
 *
 * @param {object} params
 * @param {string} params.conversationId
 * @param {string} params.userId
 * @param {string} params.message
 * @param {string} [params.userRole='user'] — farmer, authority, admin, user
 * @param {number} [params.latitude]        — user's current location
 * @param {number} [params.longitude]       — user's current location
 * @param {string} [params.userLocation]    — user's saved/profile location string
 * @returns {Promise<{ content: string, messageType: string, metadata: object }>}
 */
const generateResponse = async ({ conversationId, userId, message, userRole = 'user', latitude, longitude, userLocation }) => {
  const text = (message || '').trim()
  const detectedLang = detectLanguage(text)
  const intent = detectIntent(text)

  let response = {
    content: '',
    messageType: 'text',
    metadata: { intent }
  }

  // ─── Direct Greetings ─────────────────────────────────────────────────────
  if (/^(hi|hello|hey|namaste|kem cho|kasa kay|halo|hola|good morning|good evening|good afternoon)\b/i.test(text)) {
    response.content = userRole === 'farmer'
      ? '🌾 Namaste! I am WeatherGPT Krishi Advisor. Tell me your district or crop, or ask about irrigation, spray windows, and rainfall.'
      : userRole === 'authority'
        ? '🚨 WeatherGPT Authority Briefing Online. Specify a district or query active warnings, flood risks, and emergency weather telemetry.'
        : 'Hello! I am WeatherGPT. Which city or location would you like to check the weather or temperature for?'
    return response
  }

  // ─── Weather queries lacking location in general knowledge path ───────────
  if (intent === INTENT.GENERAL_KNOWLEDGE) {
    if (/\b(temp|temperature|tapman|तापमान)\b/i.test(text)) {
      response.content = detectedLang === 'mr'
        ? 'कोणत्या शहराचे किंवा परिसराचे तापमान तुम्हाला जाणून घ्यायचे आहे?'
        : detectedLang === 'hi'
          ? 'आप किस शहर या स्थान का तापमान जानना चाहते हैं?'
          : 'Which city or location would you like to know the temperature for?'
      response.metadata.needsLocation = true
      return response
    }
    if (/\b(rain|raining|baarish|paus|बारिश|पाऊस)\b/i.test(text)) {
      response.content = detectedLang === 'mr'
        ? 'कोणत्या शहराचा पावसाचा अंदाज तुम्हाला पाहायचा आहे?'
        : detectedLang === 'hi'
          ? 'आप किस स्थान का बारिश का अनुमान देखना चाहते हैं?'
          : 'Which city or location would you like to check the rain forecast for?'
      response.metadata.needsLocation = true
      return response
    }
    if (/\b(weather|forecast|mausam|हवामान|मौसम)\b/i.test(text)) {
      response.content = detectedLang === 'mr'
        ? 'कृपया शहर किंवा जिल्ह्याचे नाव सांगा ज्याचे हवामान तुम्हाला पाहायचे आहे.'
        : detectedLang === 'hi'
          ? 'कृपया उस शहर या स्थान का नाम बताएं जिसका मौसम आप जानना चाहते हैं।'
          : 'Which city or location would you like to check the weather for?'
      response.metadata.needsLocation = true
      return response
    }

    // Truly general educational questions (e.g. "What is humidity?")
    const generalPrompt = buildDecisionContextPrompt({
      userMessage: text,
      role: userRole,
      language: detectedLang
    })

    try {
      const { generateGeminiWeatherResponse: gemini } = await import('./ai/geminiService.js')
      const aiText = await gemini({
        userMessage: generalPrompt,
        groundedContext: { location: null, currentWeather: null, forecastDaily: [] },
        language: detectedLang,
        userRole
      })
      response.content = aiText
    } catch {
      response.content = `WeatherGPT is ready to help. Please specify your city or location to see live weather observations and forecasts.`
    }
    return response
  }

  // ─── Resolve location: Candidate -> Body Lat/Lon -> User Location ─────────
  let resolvedLat = latitude ? Number(latitude) : null
  let resolvedLon = longitude ? Number(longitude) : null
  let locationName = null
  let locationCandidate = extractLocationQuery(text)

  // 1. Try explicit location candidate in message
  if (locationCandidate) {
    const geoResult = await searchLocation(locationCandidate).catch(() => null)
    if (geoResult?.results?.length) {
      const match = geoResult.results[0]
      resolvedLat = match.latitude
      resolvedLon = match.longitude
      locationName = `${match.name}${match.admin1 ? ', ' + match.admin1 : ''}, ${match.country}`
    } else {
      locationName = locationCandidate
    }
  }

  // 2. If no location candidate in message, check active station coordinates
  if (!locationCandidate && resolvedLat && resolvedLon) {
    if (userLocation && userLocation !== 'N/A' && userLocation !== 'undefined') {
      locationName = userLocation
    } else {
      locationName = `${resolvedLat.toFixed(2)}, ${resolvedLon.toFixed(2)}`
    }
  }

  // 3. Fallback to user profile location if provided and not N/A
  if (!locationName && userLocation && userLocation !== 'N/A' && userLocation !== 'undefined') {
    const geoResult = await searchLocation(userLocation).catch(() => null)
    if (geoResult?.results?.length) {
      const match = geoResult.results[0]
      resolvedLat = match.latitude
      resolvedLon = match.longitude
      locationName = `${match.name}${match.admin1 ? ', ' + match.admin1 : ''}, ${match.country}`
    }
  }

  // 4. CRITICAL: If still NO LOCATION, ASK FOR LOCATION DIRECTLY instead of inventing or using N/A!
  if (!locationName || !resolvedLat || !resolvedLon || locationName === 'N/A') {
    if (/\b(temp|temperature|how hot|how cold|heat|warm|cold|tapman|तापमान)\b/i.test(text)) {
      response.content = detectedLang === 'mr'
        ? 'कोणत्या शहराचे किंवा परिसराचे तापमान तुम्हाला जाणून घ्यायचे आहे?'
        : detectedLang === 'hi'
          ? 'आप किस शहर या स्थान का तापमान जानना चाहते हैं?'
          : 'Which city or location would you like to know the temperature for?'
      response.metadata.needsLocation = true
      return response
    }
    if (/\b(rain|raining|rainfall|baarish|paus|पाऊस|बारिश)\b/i.test(text)) {
      response.content = detectedLang === 'mr'
        ? 'कोणत्या शहराचा पावसाचा अंदाज तुम्हाला पाहायचा आहे?'
        : detectedLang === 'hi'
          ? 'आप किस स्थान का बारिश का अनुमान देखना चाहते हैं?'
          : 'Which city or location would you like to check the rain forecast for?'
      response.metadata.needsLocation = true
      return response
    }
    if (/\b(spray|spraying|pesticide|pesticides|irrigate|crop|harvest|शेती|फसल)\b/i.test(text)) {
      response.content = detectedLang === 'mr'
        ? 'कृपया तुमच्या शेताचे किंवा तालुक्याचे नाव सांगा जेणेकरून अचूक सल्ला देता येईल.'
        : detectedLang === 'hi'
          ? 'कृपया अपने खेत, गांव या जिले का नाम बताएं ताकि सटीक सलाह दी जा सके।'
          : 'Which farm location or district would you like agricultural weather advice for?'
      response.metadata.needsLocation = true
      return response
    }
    response.content = detectedLang === 'mr'
      ? 'कृपया शहर किंवा परिसराचे नाव सांगा ज्याचे हवामान तुम्हाला पाहायचे आहे.'
      : detectedLang === 'hi'
        ? 'कृपया उस शहर या स्थान का नाम बताएं जिसका मौसम आप जानना चाहते हैं।'
        : 'Which city or location would you like to check the weather for?'
    response.metadata.needsLocation = true
    return response
  }

  try {

    // ─── Fetch all data concurrently ────────────────────────────────────────
    const [weatherData, imdWarning, farmAdvisory] = await Promise.all([
      weatherService.getWeather(resolvedLat, resolvedLon, { includeNWP: false })
        .catch(() => ({})),
      imdService.getDistrictWarning(locationCandidate || '').catch(() => null),
      (intent === INTENT.FARM_QUERY || userRole === 'farmer')
        ? advisoryService.getAgricultureAdvisory(resolvedLat, resolvedLon).catch(() => null)
        : Promise.resolve(null)
    ])

    // Build timeline from hourly data
    const hourly = weatherData?.forecast?.hourly || []
    const daily = weatherData?.forecast?.daily || []
    const timeline = buildWeatherTimeline(hourly, daily, 24)

    // Build decision brief for decision/alert queries or authority role
    let decisionBrief = null
    if (intent === INTENT.DECISION_QUERY || intent === INTENT.ALERT_QUERY || userRole === 'authority') {
      decisionBrief = buildDecisionBrief({
        weatherData,
        imdWarning,
        role: userRole,
        location: locationName
      })
    }

    // Build weather synthesis
    const synthesis = buildWeatherSynthesis({
      observation: weatherData?.observations?.imd,
      alerts: imdWarning ? [imdWarning] : [],
      gfs: weatherData?.models?.gfs,
      ecmwf: weatherData?.models?.ecmwf,
      modelComparison: weatherData?.modelComparison
    })

    const current = synthesis.current.weather || weatherData?.forecast?.current || null

    // Generate AI response with enriched context
    const aiText = await generateGeminiWeatherResponse({
      userMessage: text,
      groundedContext: {
        location: locationName,
        currentWeather: current,
        forecastDaily: daily,
        imdWarning,
        agroAdvisory: farmAdvisory,
        nwpComparison: weatherData?.modelComparison,
        timelineEvents: timeline,
        decisionBrief
      },
      userRole,
      language: detectedLang
    })

    response = {
      content: aiText,
      messageType: intent === INTENT.WEATHER_QUERY ? 'weather' : 'decision',
      metadata: {
        intent,
        location: locationName,
        latitude: resolvedLat,
        longitude: resolvedLon,
        current,
        daily: daily.slice(0, 5),
        airQuality: weatherData?.airQuality,
        imdWarning,
        timeline,
        decisionBrief,
        synthesis
      }
    }
  } catch (err) {
    console.error('[ChatService] Error generating response:', err.message)
    response.content = `I encountered a problem fetching weather data for that location. Please try again shortly.`
  }

  return response
}

export { generateResponse, extractLocationQuery, detectIntent, detectLanguage }
export default { generateResponse, extractLocationQuery, detectIntent, detectLanguage }
