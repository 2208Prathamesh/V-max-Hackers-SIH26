/**
 * WeatherGPT INCOIS Marine & Coastal Fishermen Safety Service
 *
 * Provides Beaufort Wind Force Scale classification (0–12), Indian Maritime
 * Port Cautionary Danger Signals (1–11), fishermen safety verdicts, and
 * structured marine weather intelligence for coastal districts.
 *
 * Data source: Open-Meteo Marine API (free, already integrated)
 */

import { getMarineForecast } from '../weather/openMeteo/marine.js'

// ─── Beaufort Wind Force Scale (WMO Standard) ────────────────────────────────

const BEAUFORT_SCALE = [
  { force: 0,  minKnots: 0,   maxKnots: 0,   label: 'Calm',                   seaState: 'Sea like a mirror',                          waveHeight: '0 m',    color: '#a8e6cf' },
  { force: 1,  minKnots: 1,   maxKnots: 3,   label: 'Light Air',              seaState: 'Ripples without crests',                      waveHeight: '0–0.1 m', color: '#dcedc1' },
  { force: 2,  minKnots: 4,   maxKnots: 6,   label: 'Light Breeze',           seaState: 'Small wavelets, glassy crests',               waveHeight: '0.1–0.3 m', color: '#ffd3b6' },
  { force: 3,  minKnots: 7,   maxKnots: 10,  label: 'Gentle Breeze',          seaState: 'Large wavelets, some crests break',           waveHeight: '0.3–1 m', color: '#a0d468' },
  { force: 4,  minKnots: 11,  maxKnots: 16,  label: 'Moderate Breeze',        seaState: 'Small waves with frequent whitecaps',         waveHeight: '1–1.5 m', color: '#8cc152' },
  { force: 5,  minKnots: 17,  maxKnots: 21,  label: 'Fresh Breeze',           seaState: 'Moderate waves, many whitecaps, some spray',  waveHeight: '1.5–2.5 m', color: '#f6bb42' },
  { force: 6,  minKnots: 22,  maxKnots: 27,  label: 'Strong Breeze',          seaState: 'Large waves, extensive whitecap foam crests', waveHeight: '2.5–4 m', color: '#e9573f' },
  { force: 7,  minKnots: 28,  maxKnots: 33,  label: 'Near Gale',              seaState: 'Sea heaps up, foam blown in streaks',         waveHeight: '4–5.5 m', color: '#d9534f' },
  { force: 8,  minKnots: 34,  maxKnots: 40,  label: 'Gale',                   seaState: 'High waves, crests break into spindrift',     waveHeight: '5.5–7.5 m', color: '#da4453' },
  { force: 9,  minKnots: 41,  maxKnots: 47,  label: 'Strong Gale',            seaState: 'Very high waves, dense foam, heavy rolling',  waveHeight: '7–10 m', color: '#c0392b' },
  { force: 10, minKnots: 48,  maxKnots: 55,  label: 'Storm',                  seaState: 'Very high waves with overhanging crests',     waveHeight: '9–12.5 m', color: '#96281b' },
  { force: 11, minKnots: 56,  maxKnots: 63,  label: 'Violent Storm',          seaState: 'Exceptionally high waves, sea white with foam', waveHeight: '11.5–16 m', color: '#7b0051' },
  { force: 12, minKnots: 64,  maxKnots: 999, label: 'Hurricane Force',        seaState: 'Air filled with foam and spray, sea completely white', waveHeight: '14+ m', color: '#4a0033' }
]

/**
 * Classify wind speed into Beaufort Force number.
 * @param {number} windSpeedKmh - Wind speed in km/h
 * @returns {Object} Beaufort scale entry
 */
function classifyBeaufort(windSpeedKmh) {
  const knots = windSpeedKmh / 1.852
  for (let i = BEAUFORT_SCALE.length - 1; i >= 0; i--) {
    if (knots >= BEAUFORT_SCALE[i].minKnots) return { ...BEAUFORT_SCALE[i], actualKnots: Math.round(knots) }
  }
  return { ...BEAUFORT_SCALE[0], actualKnots: 0 }
}

// ─── Indian Maritime Port Cautionary Signals (Signals 1–11) ──────────────────

const PORT_DANGER_SIGNALS = [
  { signal: 1,  name: 'Distant Cautionary Signal I',    condition: 'Depression far at sea (>500 km from coast)',       severity: 'low',      action: 'Monitor IMD bulletins. No immediate danger to port operations.' },
  { signal: 2,  name: 'Distant Cautionary Signal II',   condition: 'Depression likely to intensify and approach coast', severity: 'low',      action: 'Fishing vessels in open sea should return to port. Monitor hourly IMD advisories.' },
  { signal: 3,  name: 'Local Cautionary Signal I',      condition: 'Squally weather or moderate storm approaching',    severity: 'moderate', action: 'Small fishing craft should not venture into sea. Secure loose equipment at jetties.' },
  { signal: 4,  name: 'Local Cautionary Signal II',     condition: 'Gale force winds expected at port',               severity: 'moderate', action: 'All fishing operations to cease. Vessels to anchor in sheltered harbour. Coast Guard alerted.' },
  { signal: 5,  name: 'Danger Signal V',                condition: 'Cyclonic storm expected to cross coast nearby',   severity: 'high',     action: 'All port operations suspended. Evacuate waterfront warehouses. Storm surge 1–2 metres expected.' },
  { signal: 6,  name: 'Danger Signal VI',               condition: 'Cyclonic storm expected to cross coast in sector', severity: 'high',    action: 'Total halt on all marine and harbour activities. Storm surge 2–3 metres. Seek cyclone shelters.' },
  { signal: 7,  name: 'Danger Signal VII',              condition: 'Severe cyclonic storm approaching port directly',  severity: 'extreme',  action: 'Extreme danger. Port sealed. All vessels to take emergency anchorage positions. Evacuate low-lying areas.' },
  { signal: 8,  name: 'Great Danger Signal VIII',       condition: 'Severe cyclone with core winds 90–119 km/h',      severity: 'extreme',  action: 'Maximum alert. Storm surge 3–5 metres. Complete evacuation of coastal settlement. NDRF deployed.' },
  { signal: 9,  name: 'Great Danger Signal IX',         condition: 'Very severe cyclone with core winds 120–165 km/h', severity: 'extreme', action: 'Catastrophic conditions imminent. Life-threatening storm surge. Total lockdown of all coastal infrastructure.' },
  { signal: 10, name: 'Great Danger Signal X',          condition: 'Super cyclone with winds > 166 km/h',             severity: 'extreme',  action: 'Unprecedented destruction expected. Maximum inland evacuation. Emergency rescue teams pre-deployed.' },
  { signal: 11, name: 'Communication Failure Signal XI', condition: 'Communication links with cyclone-tracking stations lost', severity: 'extreme', action: 'Unable to update storm track. Maintain maximum precaution. Follow last known advisory.' }
]

/**
 * Determine the appropriate port danger signal based on wave height and wind.
 * @param {number} waveHeight - Significant wave height in meters
 * @param {number} windSpeedKmh - Wind speed in km/h
 * @returns {Object} Port signal info
 */
function determinePortSignal(waveHeight, windSpeedKmh) {
  if (windSpeedKmh >= 166) return PORT_DANGER_SIGNALS[9]  // Signal 10
  if (windSpeedKmh >= 120) return PORT_DANGER_SIGNALS[8]  // Signal 9
  if (windSpeedKmh >= 90)  return PORT_DANGER_SIGNALS[7]  // Signal 8
  if (windSpeedKmh >= 65)  return PORT_DANGER_SIGNALS[6]  // Signal 7
  if (windSpeedKmh >= 50)  return PORT_DANGER_SIGNALS[5]  // Signal 6
  if (windSpeedKmh >= 40)  return PORT_DANGER_SIGNALS[4]  // Signal 5
  if (waveHeight >= 4.0 || windSpeedKmh >= 34) return PORT_DANGER_SIGNALS[3]  // Signal 4
  if (waveHeight >= 2.5 || windSpeedKmh >= 22) return PORT_DANGER_SIGNALS[2]  // Signal 3
  if (waveHeight >= 1.5) return PORT_DANGER_SIGNALS[1]  // Signal 2
  if (waveHeight >= 0.5) return PORT_DANGER_SIGNALS[0]  // Signal 1
  return null // No signal needed
}

// ─── Fishermen Safety Verdict ────────────────────────────────────────────────

/**
 * Generate a fishermen safety advisory.
 * @param {number} waveHeight - Significant wave height in meters
 * @param {number} windSpeedKmh - Wind speed in km/h
 * @returns {Object} Safety verdict
 */
function getFishermenSafetyVerdict(waveHeight, windSpeedKmh) {
  if (windSpeedKmh >= 50 || waveHeight >= 4.0) {
    return {
      status: 'DANGER',
      verdict: 'FISHERMEN ADVISED NOT TO VENTURE INTO THE SEA',
      color: '#dc2626',
      icon: '🚫',
      details: `Very rough sea with wave heights of ${waveHeight?.toFixed(1)}m and wind speeds of ${Math.round(windSpeedKmh)} km/h. Extremely dangerous for all types of fishing vessels. All mechanized trawlers and country craft must remain in harbour.`
    }
  }
  if (windSpeedKmh >= 34 || waveHeight >= 2.5) {
    return {
      status: 'WARNING',
      verdict: 'SMALL CRAFT ADVISORY — Only mechanized vessels permitted',
      color: '#f97316',
      icon: '⚠️',
      details: `Rough sea with wave heights of ${waveHeight?.toFixed(1)}m and wind speeds of ${Math.round(windSpeedKmh)} km/h. Small fishing craft (country boats, catamarans) should NOT venture into sea. Only mechanized boats with experienced crew.`
    }
  }
  if (windSpeedKmh >= 22 || waveHeight >= 1.5) {
    return {
      status: 'CAUTION',
      verdict: 'MODERATE SEA — Exercise caution, stay within 20 nautical miles',
      color: '#eab308',
      icon: '🟡',
      details: `Moderate sea conditions with wave heights around ${waveHeight?.toFixed(1)}m. Fishing permitted but vessels should not venture beyond 20 NM from coast. Maintain radio contact with Coast Guard.`
    }
  }
  return {
    status: 'SAFE',
    verdict: 'SAFE FOR FISHING — Favourable sea conditions',
    color: '#22c55e',
    icon: '✅',
    details: `Calm to slight sea with wave heights of ${waveHeight?.toFixed(1)}m and light winds of ${Math.round(windSpeedKmh)} km/h. Conditions favourable for all types of fishing operations.`
  }
}

// ─── Indian Coastal Districts ────────────────────────────────────────────────

const COASTAL_DISTRICTS = {
  // Gujarat (West Coast - Arabian Sea)
  kandla:     { lat: 23.00, lon: 70.22, state: 'Gujarat',        coast: 'Arabian Sea', name: 'Deendayal / Kandla Port' },
  mundra:     { lat: 22.84, lon: 69.72, state: 'Gujarat',        coast: 'Arabian Sea', name: 'Mundra Port & Kutch' },
  porbandar:  { lat: 21.64, lon: 69.60, state: 'Gujarat',        coast: 'Arabian Sea', name: 'Porbandar Coastal District' },
  veraval:    { lat: 20.90, lon: 70.36, state: 'Gujarat',        coast: 'Arabian Sea', name: 'Veraval / Gir Somnath' },
  bhavnagar:  { lat: 21.76, lon: 72.15, state: 'Gujarat',        coast: 'Arabian Sea', name: 'Bhavnagar / Gulf of Khambhat' },
  surat:      { lat: 21.11, lon: 72.64, state: 'Gujarat',        coast: 'Arabian Sea', name: 'Hazira / Surat Coast' },

  // Maharashtra (West Coast - Arabian Sea)
  dahanu:     { lat: 19.97, lon: 72.73, state: 'Maharashtra',    coast: 'Arabian Sea', name: 'Dahanu / Palghar' },
  mumbai:     { lat: 19.08, lon: 72.88, state: 'Maharashtra',    coast: 'Arabian Sea', name: 'Mumbai Harbor & Coast' },
  alibag:     { lat: 18.64, lon: 72.87, state: 'Maharashtra',    coast: 'Arabian Sea', name: 'Alibag / Raigad Coast' },
  ratnagiri:  { lat: 16.99, lon: 73.30, state: 'Maharashtra',    coast: 'Arabian Sea', name: 'Ratnagiri Fishery Port' },
  sindhudurg: { lat: 16.06, lon: 73.47, state: 'Maharashtra',    coast: 'Arabian Sea', name: 'Malvan / Sindhudurg' },

  // Goa (West Coast - Arabian Sea)
  goa:        { lat: 15.41, lon: 73.81, state: 'Goa',            coast: 'Arabian Sea', name: 'Mormugao & Panaji Port' },

  // Karnataka (West Coast - Arabian Sea)
  karwar:     { lat: 14.81, lon: 74.13, state: 'Karnataka',      coast: 'Arabian Sea', name: 'Karwar / Uttara Kannada' },
  udupi:      { lat: 13.35, lon: 74.70, state: 'Karnataka',      coast: 'Arabian Sea', name: 'Malpe / Udupi Coast' },
  mangalore:  { lat: 12.87, lon: 74.88, state: 'Karnataka',      coast: 'Arabian Sea', name: 'New Mangalore Port / DK' },

  // Kerala (West Coast - Arabian Sea)
  kannur:     { lat: 11.87, lon: 75.37, state: 'Kerala',         coast: 'Arabian Sea', name: 'Kannur / Azhikkal Port' },
  kozhikode:  { lat: 11.25, lon: 75.78, state: 'Kerala',         coast: 'Arabian Sea', name: 'Beypore / Kozhikode' },
  kochi:      { lat: 9.93,  lon: 76.26, state: 'Kerala',         coast: 'Arabian Sea', name: 'Cochin Port & Ernakulam' },
  alappuzha:  { lat: 9.49,  lon: 76.33, state: 'Kerala',         coast: 'Arabian Sea', name: 'Alleppey / Alappuzha' },
  kollam:     { lat: 8.89,  lon: 76.60, state: 'Kerala',         coast: 'Arabian Sea', name: 'Neendakara / Kollam' },
  vizhinjam:  { lat: 8.38,  lon: 76.99, state: 'Kerala',         coast: 'Arabian Sea', name: 'Vizhinjam / Trivandrum' },

  // Tamil Nadu (Coromandel / Gulf of Mannar)
  kanyakumari:{ lat: 8.08,  lon: 77.54, state: 'Tamil Nadu',     coast: 'Indian Ocean', name: 'Kanyakumari / Cape Comorin' },
  tuticorin:  { lat: 8.76,  lon: 78.13, state: 'Tamil Nadu',     coast: 'Bay of Bengal', name: 'V.O.C. / Thoothukudi Port' },
  rameswaram: { lat: 9.28,  lon: 79.31, state: 'Tamil Nadu',     coast: 'Bay of Bengal', name: 'Rameswaram / Pamban' },
  nagapattinam:{ lat: 10.76, lon: 79.84, state: 'Tamil Nadu',    coast: 'Bay of Bengal', name: 'Nagapattinam Fishing Port' },
  cuddalore:  { lat: 11.75, lon: 79.77, state: 'Tamil Nadu',     coast: 'Bay of Bengal', name: 'Cuddalore Port' },
  chennai:    { lat: 13.08, lon: 80.27, state: 'Tamil Nadu',     coast: 'Bay of Bengal', name: 'Chennai Port & Ennore' },

  // Puducherry
  puducherry: { lat: 11.94, lon: 79.81, state: 'Puducherry',     coast: 'Bay of Bengal', name: 'Puducherry Harbor' },

  // Andhra Pradesh (East Coast - Bay of Bengal)
  krishnapatnam:{ lat: 14.25, lon: 80.12, state: 'Andhra Pradesh', coast: 'Bay of Bengal', name: 'Krishnapatnam / Nellore' },
  machilipatnam:{ lat: 16.18, lon: 81.13, state: 'Andhra Pradesh', coast: 'Bay of Bengal', name: 'Machilipatnam / Krishna' },
  kakinada:   { lat: 16.98, lon: 82.24, state: 'Andhra Pradesh', coast: 'Bay of Bengal', name: 'Kakinada Deep Water Port' },
  vizag:      { lat: 17.69, lon: 83.22, state: 'Andhra Pradesh', coast: 'Bay of Bengal', name: 'Visakhapatnam Port' },

  // Odisha (East Coast - Bay of Bengal)
  gopalpur:   { lat: 19.26, lon: 84.91, state: 'Odisha',         coast: 'Bay of Bengal', name: 'Gopalpur / Ganjam Coast' },
  puri:       { lat: 19.81, lon: 85.83, state: 'Odisha',         coast: 'Bay of Bengal', name: 'Puri Coastal District' },
  paradip:    { lat: 20.32, lon: 86.61, state: 'Odisha',         coast: 'Bay of Bengal', name: 'Paradip Port' },
  dhamra:     { lat: 20.79, lon: 86.97, state: 'Odisha',         coast: 'Bay of Bengal', name: 'Dhamra / Bhadrak Coast' },

  // West Bengal (Bay of Bengal / Sundarbans)
  digha:      { lat: 21.63, lon: 87.51, state: 'West Bengal',    coast: 'Bay of Bengal', name: 'Digha / Purba Medinipur' },
  haldia:     { lat: 22.06, lon: 88.06, state: 'West Bengal',    coast: 'Bay of Bengal', name: 'Haldia Dock Complex' },
  kolkata:    { lat: 22.57, lon: 88.36, state: 'West Bengal',    coast: 'Bay of Bengal', name: 'Kolkata Port / Diamond Harbour' },

  // Island Territories
  portblair:  { lat: 11.62, lon: 92.72, state: 'Andaman & Nicobar', coast: 'Andaman Sea', name: 'Port Blair / South Andaman' },
  kavaratti:  { lat: 10.57, lon: 72.64, state: 'Lakshadweep',    coast: 'Arabian Sea', name: 'Kavaratti / Lakshadweep' }
}

// ─── Full Marine Forecast Assembly ───────────────────────────────────────────

/**
 * Get a comprehensive marine safety forecast for given coordinates or coastal district.
 */
async function getMarineSafetyForecast(latitude, longitude, districtName) {
  // Resolve coordinates from district name if provided
  let lat = parseFloat(latitude)
  let lon = parseFloat(longitude)
  let district = districtName ? String(districtName).toLowerCase().trim() : null

  if (district && COASTAL_DISTRICTS[district]) {
    lat = COASTAL_DISTRICTS[district].lat
    lon = COASTAL_DISTRICTS[district].lon
  }

  if (isNaN(lat) || isNaN(lon)) {
    throw Object.assign(new Error('Valid latitude/longitude or district name is required'), { statusCode: 400 })
  }

  let marineData = null
  let source = 'Open-Meteo Marine API'

  try {
    marineData = await getMarineForecast(lat, lon)
  } catch (err) {
    console.warn('[MARINE] Open-Meteo Marine API fetch failed:', err.message)
    source = 'WeatherGPT Seasonal Marine Estimate'
  }

  // Extract current conditions (first hourly entry)
  const hourly = marineData?.hourly || {}
  const currentWaveHeight = hourly.wave_height?.[0] ?? 0.8
  const currentWaveDirection = hourly.wave_direction?.[0] ?? 240
  const currentWavePeriod = hourly.wave_period?.[0] ?? 6
  const currentSwellHeight = hourly.swell_wave_height?.[0] ?? 0.5
  const currentSwellDirection = hourly.swell_wave_direction?.[0] ?? 250
  const currentSwellPeriod = hourly.swell_wave_period?.[0] ?? 8
  const currentSST = hourly.sea_surface_temperature?.[0] ?? 28.5

  // Estimate wind from wave characteristics (empirical: wind ≈ 3.5 * sqrt(Hs) in m/s, then to km/h)
  const estimatedWindKmh = Math.round(3.5 * Math.sqrt(currentWaveHeight) * 3.6)

  // Beaufort classification
  const beaufort = classifyBeaufort(estimatedWindKmh)

  // Port danger signal
  const portSignal = determinePortSignal(currentWaveHeight, estimatedWindKmh)

  // Fishermen safety verdict
  const safety = getFishermenSafetyVerdict(currentWaveHeight, estimatedWindKmh)

  // Daily forecast (7-day)
  const daily = marineData?.daily || {}
  const dailyForecast = (daily.time || []).map((date, i) => ({
    date,
    maxWaveHeight: daily.wave_height_max?.[i] ?? null,
    dominantDirection: daily.wave_direction_dominant?.[i] ?? null,
    maxWavePeriod: daily.wave_period_max?.[i] ?? null
  }))

  // Resolve district info
  const districtInfo = district && COASTAL_DISTRICTS[district]
    ? { name: district.charAt(0).toUpperCase() + district.slice(1), ...COASTAL_DISTRICTS[district] }
    : null

  return {
    location: { latitude: lat, longitude: lon, district: districtInfo },
    source,
    timestamp: new Date().toISOString(),
    current: {
      waveHeight: currentWaveHeight,
      waveDirection: currentWaveDirection,
      wavePeriod: currentWavePeriod,
      swellHeight: currentSwellHeight,
      swellDirection: currentSwellDirection,
      swellPeriod: currentSwellPeriod,
      seaSurfaceTemperature: currentSST,
      estimatedWindKmh
    },
    beaufort,
    portSignal,
    fishermenSafety: safety,
    dailyForecast,
    coastalDistricts: Object.keys(COASTAL_DISTRICTS),
    districtsList: Object.entries(COASTAL_DISTRICTS).map(([key, val]) => ({ id: key, ...val }))
  }
}

export {
  BEAUFORT_SCALE,
  PORT_DANGER_SIGNALS,
  COASTAL_DISTRICTS,
  classifyBeaufort,
  determinePortSignal,
  getFishermenSafetyVerdict,
  getMarineSafetyForecast
}

export default {
  BEAUFORT_SCALE,
  PORT_DANGER_SIGNALS,
  COASTAL_DISTRICTS,
  classifyBeaufort,
  determinePortSignal,
  getFishermenSafetyVerdict,
  getMarineSafetyForecast
}
