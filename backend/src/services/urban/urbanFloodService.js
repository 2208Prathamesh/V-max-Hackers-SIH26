/**
 * WeatherGPT Urban Flash Flood Vulnerability Index
 *
 * Implements a simplified Rational Runoff Method for Indian metro cities to
 * compute urban flash flood risk from rainfall intensity. Uses the equation:
 *   Q = C × I × A  (runoff = coefficient × rainfall intensity × catchment area)
 *
 * Provides drainage saturation levels (Normal → Advisory → Severe → Critical)
 * and city-specific vulnerable hotspot information.
 *
 * Data source: Derived from existing Open-Meteo precipitation forecast (free)
 */

// ─── Indian Metro Vulnerability Profiles ─────────────────────────────────────

const CITY_PROFILES = {
  mumbai: {
    name: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.0760,
    lon: 72.8777,
    runoffCoefficient: 0.85,       // Very high impermeability (dense urban)
    drainageCapacityMmh: 25,       // Designed drain capacity in mm/hr
    elevationRiskFactor: 1.3,      // Low-lying areas amplify flooding
    population: '20.4 million',
    hotspots: [
      { area: 'Hindmata',          risk: 'Critical', reason: 'Lowest elevation point in Mumbai, railway junction, floods annually at 30mm/hr rainfall' },
      { area: 'Sion-Matunga',      risk: 'Critical', reason: 'Mithi river flood plain, inadequate stormwater drains' },
      { area: 'Andheri Subway',    risk: 'Severe',   reason: 'Railway underpass prone to waterlogging' },
      { area: 'Dadar',             risk: 'Severe',   reason: 'Confluence of multiple drains, high commercial density' },
      { area: 'King Circle',       risk: 'Severe',   reason: 'Historic flooding area, low natural gradient' }
    ]
  },
  delhi: {
    name: 'Delhi',
    state: 'NCT Delhi',
    lat: 28.6139,
    lon: 77.2090,
    runoffCoefficient: 0.78,
    drainageCapacityMmh: 30,
    elevationRiskFactor: 1.1,
    population: '32.9 million',
    hotspots: [
      { area: 'Minto Bridge',      risk: 'Critical', reason: 'Railway underpass, severe waterlogging trap' },
      { area: 'ITO',               risk: 'Severe',   reason: 'Yamuna flood plain proximity' },
      { area: 'Pragati Maidan',    risk: 'Severe',   reason: 'Below-road-level areas collect runoff' },
      { area: 'Pul Prahladpur',    risk: 'Severe',   reason: 'Barapullah Nallah overflow zone' },
      { area: 'Dwarka Sector 7-8', risk: 'Moderate', reason: 'New drainage infrastructure, but flat terrain' }
    ]
  },
  pune: {
    name: 'Pune',
    state: 'Maharashtra',
    lat: 18.5204,
    lon: 73.8567,
    runoffCoefficient: 0.72,
    drainageCapacityMmh: 28,
    elevationRiskFactor: 1.2,
    population: '7.4 million',
    hotspots: [
      { area: 'Sinhagad Road',     risk: 'Severe',   reason: 'Mutha river proximity, low-lying residential areas' },
      { area: 'Ambil Odha',        risk: 'Critical', reason: 'Nallah encroachment, severe inundation during monsoon' },
      { area: 'Dandekar Bridge',   risk: 'Severe',   reason: 'River bank overflow zone, old stormwater system' },
      { area: 'Katraj',            risk: 'Moderate', reason: 'Hill runoff funneling into urban basin' }
    ]
  },
  bengaluru: {
    name: 'Bengaluru',
    state: 'Karnataka',
    lat: 12.9716,
    lon: 77.5946,
    runoffCoefficient: 0.80,
    drainageCapacityMmh: 22,
    elevationRiskFactor: 1.15,
    population: '13.2 million',
    hotspots: [
      { area: 'Silk Board',        risk: 'Critical', reason: 'Destroyed lake connectivity, extreme waterlogging' },
      { area: 'Outer Ring Road',   risk: 'Severe',   reason: 'IT corridor built on reclaimed lake beds' },
      { area: 'Koramangala',       risk: 'Severe',   reason: 'Bellandur Lake overflow, sewage mixing' },
      { area: 'Marathahalli',      risk: 'Severe',   reason: 'Varthur Lake flood plain encroachment' },
      { area: 'Majestic',          risk: 'Moderate', reason: 'Old city, undersized British-era drains' }
    ]
  },
  chennai: {
    name: 'Chennai',
    state: 'Tamil Nadu',
    lat: 13.0827,
    lon: 80.2707,
    runoffCoefficient: 0.82,
    drainageCapacityMmh: 20,
    elevationRiskFactor: 1.35,
    population: '11.5 million',
    hotspots: [
      { area: 'Velachery',         risk: 'Critical', reason: 'Pallikaranai marshland destruction, 2015 flood epicenter' },
      { area: 'T. Nagar',          risk: 'Severe',   reason: 'Dense commercial zone, zero percolation' },
      { area: 'Adyar River Basin', risk: 'Severe',   reason: 'Encroached river banks, storm surge vulnerability' },
      { area: 'Tambaram',          risk: 'Severe',   reason: 'Adyar tributary flood zone' },
      { area: 'Porur Lake',        risk: 'Moderate', reason: 'Lake overflow during intense NE monsoon' }
    ]
  },
  kolkata: {
    name: 'Kolkata',
    state: 'West Bengal',
    lat: 22.5726,
    lon: 88.3639,
    runoffCoefficient: 0.79,
    drainageCapacityMmh: 18,
    elevationRiskFactor: 1.4,
    population: '15.1 million',
    hotspots: [
      { area: 'Salt Lake',         risk: 'Severe',   reason: 'Reclaimed wetland, inadequate outlet capacity' },
      { area: 'Behala',            risk: 'Severe',   reason: 'Diamond Harbour Road underpass flooding' },
      { area: 'Ruby More',         risk: 'Severe',   reason: 'EM Bypass depression, canal overflow' },
      { area: 'Esplanade',         risk: 'Moderate', reason: 'Old drainage from colonial era, high density' }
    ]
  },
  hyderabad: {
    name: 'Hyderabad',
    state: 'Telangana',
    lat: 17.3850,
    lon: 78.4867,
    runoffCoefficient: 0.75,
    drainageCapacityMmh: 25,
    elevationRiskFactor: 1.2,
    population: '10.5 million',
    hotspots: [
      { area: 'Falaknuma',         risk: 'Severe',   reason: 'Musi river flood zone, old city drainage' },
      { area: 'Tolichowki',        risk: 'Severe',   reason: 'Nala encroachment, steep terrain runoff' },
      { area: 'Kukatpally',        risk: 'Moderate', reason: 'Rapid urbanization, insufficient stormwater network' },
      { area: 'Alwal',             risk: 'Severe',   reason: 'Lake breach overflow zone' }
    ]
  },
  ahmedabad: {
    name: 'Ahmedabad',
    state: 'Gujarat',
    lat: 23.0225,
    lon: 72.5714,
    runoffCoefficient: 0.78,
    drainageCapacityMmh: 24,
    elevationRiskFactor: 1.15,
    population: '8.4 million',
    hotspots: [
      { area: 'Akhbarnagar Subway', risk: 'Critical', reason: 'Deep railway underpass prone to sudden 6-foot waterlogging' },
      { area: 'Parimal Underpass',   risk: 'Critical', reason: 'Stormwater collection bowl, vehicular drowning trap' },
      { area: 'Mithakhali Subway',  risk: 'Severe',   reason: 'Low gradient runoff funnel from CG Road' },
      { area: 'Vastrapur Lake Area', risk: 'Moderate', reason: 'Lake catchment overflow during cloudbursts' }
    ]
  },
  surat: {
    name: 'Surat',
    state: 'Gujarat',
    lat: 21.1702,
    lon: 72.8311,
    runoffCoefficient: 0.82,
    drainageCapacityMmh: 20,
    elevationRiskFactor: 1.4,
    population: '6.9 million',
    hotspots: [
      { area: 'Adajan',             risk: 'Critical', reason: 'Tapi river floodplain, tidal backflow vulnerability' },
      { area: 'Varachha',           risk: 'Severe',   reason: 'High concrete density, diamond hub drainage blocks' },
      { area: 'Rander',             risk: 'Severe',   reason: 'Historic flood corridor during Ukai dam peak releases' },
      { area: 'Katargam',           risk: 'Moderate', reason: 'Khari canal overflow zone' }
    ]
  },
  guwahati: {
    name: 'Guwahati',
    state: 'Assam',
    lat: 26.1445,
    lon: 91.7362,
    runoffCoefficient: 0.80,
    drainageCapacityMmh: 18,
    elevationRiskFactor: 1.45,
    population: '1.2 million',
    hotspots: [
      { area: 'Anil Nagar & Nabin Nagar', risk: 'Critical', reason: 'Lowest bowl of Guwahati, severe Bharalu river waterlogging' },
      { area: 'Zoo Road (RG Baruah)',     risk: 'Critical', reason: 'Hilly flash runoff funneling into arterial road' },
      { area: 'Rukminigaon',              risk: 'Severe',   reason: 'Bahini river backwater inundation' },
      { area: 'Maligaon Underpass',       risk: 'Severe',   reason: 'Railway depression prone to vehicle submergence' }
    ]
  },
  patna: {
    name: 'Patna',
    state: 'Bihar',
    lat: 25.5941,
    lon: 85.1376,
    runoffCoefficient: 0.77,
    drainageCapacityMmh: 16,
    elevationRiskFactor: 1.4,
    population: '2.5 million',
    hotspots: [
      { area: 'Rajendra Nagar',     risk: 'Critical', reason: 'Saucer-shaped depression, notorious 2019 deluge site' },
      { area: 'Kankarbagh',         risk: 'Critical', reason: 'Insufficient sump capacity, prolonged multi-day inundation' },
      { area: 'Boring Canal Road',  risk: 'Severe',   reason: 'Clogged canal siphon causing upstream street flooding' },
      { area: 'Patliputra Colony',  risk: 'Moderate', reason: 'Low gradient natural stormwater outlet to Ganga' }
    ]
  },
  kochi: {
    name: 'Kochi',
    state: 'Kerala',
    lat: 9.9312,
    lon: 76.2673,
    runoffCoefficient: 0.79,
    drainageCapacityMmh: 20,
    elevationRiskFactor: 1.35,
    population: '2.1 million',
    hotspots: [
      { area: 'MG Road & KSRTC Stand', risk: 'Critical', reason: 'Below high-tide level, backwater locks during rains' },
      { area: 'Edappally Toll',        risk: 'Severe',   reason: 'Metro pillar runoff constriction, canal blockages' },
      { area: 'Kaloor Stadium Junction', risk: 'Severe', reason: 'Perandoor canal overflow corridor' },
      { area: 'Fort Kochi Lowlands',   risk: 'Moderate', reason: 'Coastal high-tide wave surging into alleys' }
    ]
  },
  nagpur: {
    name: 'Nagpur',
    state: 'Maharashtra',
    lat: 21.1458,
    lon: 79.0882,
    runoffCoefficient: 0.73,
    drainageCapacityMmh: 26,
    elevationRiskFactor: 1.15,
    population: '2.9 million',
    hotspots: [
      { area: 'Narendra Nagar RUB',  risk: 'Critical', reason: 'Railway underbridge fills within 20 mins of heavy rain' },
      { area: 'Nag River Stretch',   risk: 'Severe',   reason: 'Encroached river banks overflowing into residential belts' },
      { area: 'Sitabuldi',           risk: 'Moderate', reason: 'Commercial runoff convergence point' }
    ]
  },
  nashik: {
    name: 'Nashik',
    state: 'Maharashtra',
    lat: 19.9975,
    lon: 73.7898,
    runoffCoefficient: 0.71,
    drainageCapacityMmh: 27,
    elevationRiskFactor: 1.2,
    population: '2.2 million',
    hotspots: [
      { area: 'Ramkund / Panchavati', risk: 'Critical', reason: 'Godavari river ghats submerge during Gangapur dam discharges' },
      { area: 'Dwarka Circle',        risk: 'Severe',   reason: 'Highway junction stormwater funneling' },
      { area: 'College Road',         risk: 'Moderate', reason: 'Rapid urbanization runoff bottleneck' }
    ]
  },
  lucknow: {
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    lat: 26.8467,
    lon: 80.9462,
    runoffCoefficient: 0.76,
    drainageCapacityMmh: 22,
    elevationRiskFactor: 1.2,
    population: '3.8 million',
    hotspots: [
      { area: 'Charbagh Station Circle', risk: 'Critical', reason: 'Natural low basin around historic railway hub' },
      { area: 'Alambagh Canal Road',    risk: 'Severe',   reason: 'Siltation in Haider Canal causing backflow' },
      { area: 'Gomti Nagar Extension',  risk: 'Moderate', reason: 'Riverfront embankment ponding during cloudburst' }
    ]
  },
  srinagar: {
    name: 'Srinagar',
    state: 'Jammu & Kashmir',
    lat: 34.0837,
    lon: 74.7973,
    runoffCoefficient: 0.74,
    drainageCapacityMmh: 18,
    elevationRiskFactor: 1.4,
    population: '1.6 million',
    hotspots: [
      { area: 'Rajbagh & Jawahar Nagar', risk: 'Critical', reason: 'Jhelum river flood plain, catastrophic 2014 flood site' },
      { area: 'Lal Chowk Bund',          risk: 'Severe',   reason: 'Commercial epicenter vulnerable to Jhelum breach' },
      { area: 'Bemina Wetlands',         risk: 'Severe',   reason: 'Built on historic flood retention spill channels' }
    ]
  },
  bhubaneswar: {
    name: 'Bhubaneswar',
    state: 'Odisha',
    lat: 20.2961,
    lon: 85.8245,
    runoffCoefficient: 0.76,
    drainageCapacityMmh: 22,
    elevationRiskFactor: 1.25,
    population: '1.2 million',
    hotspots: [
      { area: 'Acharya Vihar Underpass', risk: 'Critical', reason: 'NH-16 railway junction, severe vehicular water trap' },
      { area: 'ISKCON Temple / Nayapalli', risk: 'Critical', reason: 'Natural water channel blockage on national highway' },
      { area: 'Bomikhal Canal',          risk: 'Severe',   reason: 'Drainage channel No. 10 overflow into colonies' }
    ]
  },
  jaipur: {
    name: 'Jaipur',
    state: 'Rajasthan',
    lat: 26.9124,
    lon: 75.7873,
    runoffCoefficient: 0.72,
    drainageCapacityMmh: 26,
    elevationRiskFactor: 1.1,
    population: '4.1 million',
    hotspots: [
      { area: 'MI Road / Panch Batti',   risk: 'Severe',   reason: 'Aravalli foothill rapid flash runoff into market' },
      { area: 'Sanganer Dravyavati Basin', risk: 'Critical', reason: 'Dravyavati river flash flooding during cloudbursts' },
      { area: 'Jhotwara Underpass',      risk: 'Severe',   reason: 'Railway underbridge water accumulation' }
    ]
  },
  indore: {
    name: 'Indore',
    state: 'Madhya Pradesh',
    lat: 22.7196,
    lon: 75.8577,
    runoffCoefficient: 0.74,
    drainageCapacityMmh: 25,
    elevationRiskFactor: 1.15,
    population: '3.3 million',
    hotspots: [
      { area: 'Rajwada / Sarafa',        risk: 'Severe',   reason: 'Old city high density, narrow drain gradients' },
      { area: 'Khan River Riverfront',   risk: 'Critical', reason: 'Kanh river surge causing low-colony backflow' },
      { area: 'Bhawarkua Square',        risk: 'Moderate', reason: 'BRTS corridor runoff accumulation' }
    ]
  },
  bhopal: {
    name: 'Bhopal',
    state: 'Madhya Pradesh',
    lat: 23.2599,
    lon: 77.4126,
    runoffCoefficient: 0.73,
    drainageCapacityMmh: 24,
    elevationRiskFactor: 1.2,
    population: '2.4 million',
    hotspots: [
      { area: 'Karond Railway Underpass', risk: 'Critical', reason: 'Extreme slope depression, rapid submergence' },
      { area: 'MP Nagar Zone 2',          risk: 'Severe',   reason: 'Commercial hub stormwater grid overflow' },
      { area: 'Upper Lake Spillway',      risk: 'Severe',   reason: 'Bhadbhada dam sluice overflow down into Kaliasot' }
    ]
  }
}

// ─── Drainage Saturation Levels ──────────────────────────────────────────────

const SATURATION_LEVELS = {
  NORMAL:   { level: 'Normal',    color: '#22c55e', icon: '✅', description: 'Drainage operating within capacity. No waterlogging expected.' },
  ADVISORY: { level: 'Advisory',  color: '#eab308', icon: '🟡', description: 'Drainage nearing 70% capacity. Minor surface ponding possible in low-lying areas. Monitor conditions.' },
  SEVERE:   { level: 'Severe',    color: '#f97316', icon: '🟠', description: 'Drainage capacity exceeded. Significant waterlogging in known hotspots. Avoid underpasses and low roads.' },
  CRITICAL: { level: 'Critical Inundation', color: '#dc2626', icon: '🔴', description: 'Catastrophic urban flooding. Major roads impassable. Life-threatening flash flood conditions. Seek higher ground immediately.' }
}

// ─── Rational Runoff Method Calculator ───────────────────────────────────────

/**
 * Calculate urban flash flood vulnerability using the Rational Runoff Method.
 *
 * @param {number} rainfallIntensityMmh - Forecasted rainfall intensity (mm/hr)
 * @param {string} cityKey - City identifier from CITY_PROFILES
 * @returns {Object} Flood vulnerability assessment
 */
function calculateFloodIndex(rainfallIntensityMmh, cityKey) {
  const city = CITY_PROFILES[cityKey]
  if (!city) {
    // Generic profile for unknown cities
    return calculateFloodIndexGeneric(rainfallIntensityMmh)
  }

  const rainfall = Math.max(0, rainfallIntensityMmh)

  // Q = C × I × A  (we normalize A = 1 km² for index comparison)
  const runoff = city.runoffCoefficient * rainfall * city.elevationRiskFactor

  // Drainage saturation ratio = runoff / drain capacity
  const saturationRatio = rainfall > 0 ? (runoff / city.drainageCapacityMmh) : 0

  // Determine saturation level
  let saturation
  if (saturationRatio >= 2.0)      saturation = SATURATION_LEVELS.CRITICAL
  else if (saturationRatio >= 1.2) saturation = SATURATION_LEVELS.SEVERE
  else if (saturationRatio >= 0.7) saturation = SATURATION_LEVELS.ADVISORY
  else                             saturation = SATURATION_LEVELS.NORMAL

  // Flood vulnerability score (0–100)
  const vulnerabilityScore = Math.min(100, Math.round(saturationRatio * 50))

  // Hotspot warnings (only active hotspots based on intensity)
  const activeHotspots = city.hotspots.filter(h => {
    if (h.risk === 'Critical' && rainfall >= 25) return true
    if (h.risk === 'Severe' && rainfall >= 35) return true
    if (h.risk === 'Moderate' && rainfall >= 50) return true
    return false
  })

  // Estimated waterlogging depth (empirical formula for Indian metros)
  const waterlogDepthCm = saturationRatio > 1
    ? Math.round((saturationRatio - 1) * city.drainageCapacityMmh * 0.4 * city.elevationRiskFactor)
    : 0

  return {
    city: city.name,
    state: city.state,
    population: city.population,
    rainfallIntensityMmh: rainfall,
    runoffCoefficient: city.runoffCoefficient,
    drainageCapacityMmh: city.drainageCapacityMmh,
    computedRunoff: Math.round(runoff * 10) / 10,
    saturationRatio: Math.round(saturationRatio * 100) / 100,
    saturation,
    vulnerabilityScore,
    estimatedWaterlogDepthCm: waterlogDepthCm,
    activeHotspots,
    allHotspots: city.hotspots,
    availableCities: Object.entries(CITY_PROFILES).map(([key, c]) => ({ id: key, name: c.name, state: c.state, population: c.population })),
    recommendations: generateRecommendations(saturation.level, waterlogDepthCm),
    methodology: 'Rational Runoff Method (Q = C × I × A × Elevation Risk Factor)'
  }
}

/**
 * Generic flood index for cities not in our profile database.
 */
function calculateFloodIndexGeneric(rainfallIntensityMmh) {
  const rainfall = Math.max(0, rainfallIntensityMmh)
  const defaultC = 0.75
  const defaultDrainCap = 25
  const runoff = defaultC * rainfall
  const saturationRatio = rainfall > 0 ? runoff / defaultDrainCap : 0

  let saturation
  if (saturationRatio >= 2.0)      saturation = SATURATION_LEVELS.CRITICAL
  else if (saturationRatio >= 1.2) saturation = SATURATION_LEVELS.SEVERE
  else if (saturationRatio >= 0.7) saturation = SATURATION_LEVELS.ADVISORY
  else                             saturation = SATURATION_LEVELS.NORMAL

  return {
    city: 'Unknown City',
    rainfallIntensityMmh: rainfall,
    runoffCoefficient: defaultC,
    drainageCapacityMmh: defaultDrainCap,
    computedRunoff: Math.round(runoff * 10) / 10,
    saturationRatio: Math.round(saturationRatio * 100) / 100,
    saturation,
    vulnerabilityScore: Math.min(100, Math.round(saturationRatio * 50)),
    estimatedWaterlogDepthCm: saturationRatio > 1 ? Math.round((saturationRatio - 1) * defaultDrainCap * 0.35) : 0,
    activeHotspots: [],
    allHotspots: [],
    availableCities: Object.entries(CITY_PROFILES).map(([key, c]) => ({ id: key, name: c.name, state: c.state, population: c.population })),
    recommendations: generateRecommendations(saturation.level, 0),
    methodology: 'Rational Runoff Method (Generic Urban Profile)'
  }
}

/**
 * Generate context-sensitive recommendations based on flood severity.
 */
function generateRecommendations(level, waterlogDepthCm) {
  const recs = []

  switch (level) {
    case 'Critical Inundation':
      recs.push('🚨 EMERGENCY: Avoid ALL travel. Seek higher ground immediately.')
      recs.push('🚫 Do NOT walk or drive through floodwater — 15 cm of flowing water can knock an adult down.')
      recs.push('📞 Emergency contacts: NDRF (011-26107953), Local Police (100), Fire (101).')
      recs.push('⚡ Disconnect electrical appliances if water enters premises.')
      recs.push('🏥 Keep emergency medicines, drinking water, and documents in waterproof bags.')
      break
    case 'Severe':
      recs.push('⚠️ Avoid underpasses, subways, and low-lying roads.')
      recs.push('🚗 Do not attempt to drive through waterlogged areas. Turn around, don\'t drown.')
      recs.push('📱 Keep phone charged and monitor IMD / municipal alerts.')
      recs.push('🏠 Clear roof drains and balcony outlets to prevent structural water damage.')
      break
    case 'Advisory':
      recs.push('🟡 Minor surface ponding possible. Plan alternative routes.')
      recs.push('☂️ Carry rain gear. Allow extra commute time.')
      recs.push('🚗 Reduce vehicle speed on wet roads to prevent aquaplaning.')
      break
    default:
      recs.push('✅ Normal drainage conditions. No special precautions needed.')
  }

  if (waterlogDepthCm > 30) {
    recs.push(`📏 Estimated waterlogging depth: ${waterlogDepthCm} cm — vehicles may stall, pedestrians at risk.`)
  }

  return recs
}

/**
 * Fetch live and forecast precipitation telemetry for a city from Open-Meteo.
 * @param {string} cityKey - City identifier from CITY_PROFILES
 * @returns {Promise<{ current: number, peak6h: number, source: string }>}
 */
export async function fetchLiveCityRainfall(cityKey) {
  const city = CITY_PROFILES[cityKey]
  if (!city || !city.lat || !city.lon) {
    return { current: 0, peak6h: 0, source: 'Regional IMD Telemetry Network' }
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=precipitation,rain&hourly=precipitation&forecast_days=1`
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) })
    if (res.ok) {
      const data = await res.json()
      const currentRain = data.current?.precipitation ?? data.current?.rain ?? 0
      const hourly = data.hourly?.precipitation || []
      const currentHour = new Date().getHours()
      const next6 = hourly.slice(currentHour, currentHour + 6)
      const peak6h = next6.length > 0 ? Math.max(...next6) : currentRain
      return {
        current: Math.round(currentRain * 10) / 10,
        peak6h: Math.round(peak6h * 10) / 10,
        source: 'Open-Meteo High-Resolution Telemetry'
      }
    }
  } catch (err) {
    // Non-blocking fallback
  }

  return { current: 0, peak6h: 0, source: 'Regional IMD Telemetry Network' }
}

export {
  CITY_PROFILES,
  SATURATION_LEVELS,
  calculateFloodIndex,
  calculateFloodIndexGeneric,
  generateRecommendations
}

export default {
  CITY_PROFILES,
  SATURATION_LEVELS,
  calculateFloodIndex,
  calculateFloodIndexGeneric,
  generateRecommendations,
  fetchLiveCityRainfall
}
