/**
 * WeatherGPT Aviation Weather Briefing Service
 *
 * Provides METAR/TAF decoding, flight-rule classification (VFR/MVFR/IFR/LIFR),
 * runway crosswind component calculations, and human-readable aeronautical
 * briefings for major Indian airports.
 *
 * Data source: NOAA Aviation Weather Center (free, public, no API key required)
 * https://aviationweather.gov/api/data/metar?ids=VABB&format=json
 */

// ─── Indian Airport Catalog ──────────────────────────────────────────────────
const AIRPORTS = {
  VABB: { name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', state: 'Maharashtra', runways: [{ id: '09/27', heading: 90 }, { id: '14/32', heading: 140 }] },
  VIDP: { name: 'Indira Gandhi International Airport', city: 'Delhi', state: 'NCT Delhi', runways: [{ id: '09/27', heading: 90 }, { id: '10/28', heading: 100 }, { id: '11/29', heading: 110 }] },
  VOBL: { name: 'Kempegowda International Airport', city: 'Bengaluru', state: 'Karnataka', runways: [{ id: '09L/27R', heading: 90 }, { id: '09R/27L', heading: 90 }] },
  VOMM: { name: 'Chennai International Airport', city: 'Chennai', state: 'Tamil Nadu', runways: [{ id: '07/25', heading: 70 }, { id: '12/30', heading: 120 }] },
  VECC: { name: 'Netaji Subhas Chandra Bose International Airport', city: 'Kolkata', state: 'West Bengal', runways: [{ id: '01L/19R', heading: 10 }, { id: '01R/19L', heading: 10 }] },
  VAPO: { name: 'Pune Lohegaon Airport & IAF Station', city: 'Pune', state: 'Maharashtra', runways: [{ id: '10/28', heading: 100 }, { id: '14/32', heading: 140 }] },
  VOHS: { name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', state: 'Telangana', runways: [{ id: '09L/27R', heading: 90 }, { id: '09R/27L', heading: 90 }] },
  VAAH: { name: 'Sardar Vallabhbhai Patel International Airport', city: 'Ahmedabad', state: 'Gujarat', runways: [{ id: '05/23', heading: 50 }] },
  VIJP: { name: 'Jaipur International Airport', city: 'Jaipur', state: 'Rajasthan', runways: [{ id: '09/27', heading: 90 }, { id: '15/33', heading: 150 }] },
  VILK: { name: 'Chaudhary Charan Singh International Airport', city: 'Lucknow', state: 'Uttar Pradesh', runways: [{ id: '09/27', heading: 90 }] },
  VEGT: { name: 'Lokpriya Gopinath Bordoloi International Airport', city: 'Guwahati', state: 'Assam', runways: [{ id: '02/20', heading: 20 }] },
  VISR: { name: 'Sheikh ul-Alam International Airport', city: 'Srinagar', state: 'Jammu & Kashmir', runways: [{ id: '13/31', heading: 130 }] },
  VOCI: { name: 'Cochin International Airport', city: 'Kochi', state: 'Kerala', runways: [{ id: '09/27', heading: 90 }] },
  VOTV: { name: 'Thiruvananthapuram International Airport', city: 'Thiruvananthapuram', state: 'Kerala', runways: [{ id: '14/32', heading: 140 }] },
  VOCL: { name: 'Calicut International Airport', city: 'Kozhikode', state: 'Kerala', runways: [{ id: '10/28', heading: 100 }] },
  VOML: { name: 'Mangalore International Airport', city: 'Mangalore', state: 'Karnataka', runways: [{ id: '06/24', heading: 60 }, { id: '09/27', heading: 90 }] },
  VOCB: { name: 'Coimbatore International Airport', city: 'Coimbatore', state: 'Tamil Nadu', runways: [{ id: '05/23', heading: 50 }] },
  VOMD: { name: 'Madurai International Airport', city: 'Madurai', state: 'Tamil Nadu', runways: [{ id: '09/27', heading: 90 }] },
  VOVZ: { name: 'Visakhapatnam Airport (INS Dega)', city: 'Visakhapatnam', state: 'Andhra Pradesh', runways: [{ id: '10/28', heading: 100 }, { id: '05/23', heading: 50 }] },
  VEBS: { name: 'Biju Patnaik International Airport', city: 'Bhubaneswar', state: 'Odisha', runways: [{ id: '14/32', heading: 140 }, { id: '05/23', heading: 50 }] },
  VEPT: { name: 'Jayprakash Narayan International Airport', city: 'Patna', state: 'Bihar', runways: [{ id: '07/25', heading: 70 }] },
  VEBN: { name: 'Lal Bahadur Shastri International Airport', city: 'Varanasi', state: 'Uttar Pradesh', runways: [{ id: '09/27', heading: 90 }] },
  VIAR: { name: 'Sri Guru Ram Dass Jee International Airport', city: 'Amritsar', state: 'Punjab', runways: [{ id: '16/34', heading: 160 }] },
  VICG: { name: 'Shaheed Bhagat Singh International Airport', city: 'Chandigarh', state: 'Chandigarh', runways: [{ id: '11/29', heading: 110 }] },
  VAID: { name: 'Devi Ahilyabai Holkar International Airport', city: 'Indore', state: 'Madhya Pradesh', runways: [{ id: '07/25', heading: 70 }] },
  VABP: { name: 'Raja Bhoj International Airport', city: 'Bhopal', state: 'Madhya Pradesh', runways: [{ id: '12/30', heading: 120 }] },
  VANP: { name: 'Dr. Babasaheb Ambedkar International Airport', city: 'Nagpur', state: 'Maharashtra', runways: [{ id: '14/32', heading: 140 }, { id: '09/27', heading: 90 }] },
  VASU: { name: 'Surat International Airport', city: 'Surat', state: 'Gujarat', runways: [{ id: '04/22', heading: 40 }] },
  VABO: { name: 'Vadodara Airport (Civil Aerodrome)', city: 'Vadodara', state: 'Gujarat', runways: [{ id: '04/22', heading: 40 }] },
  VOPB: { name: 'Veer Savarkar International Airport', city: 'Port Blair', state: 'Andaman & Nicobar', runways: [{ id: '04/22', heading: 40 }] },
  VILH: { name: 'Kushok Bakula Rimpochee Airport (High Altitude)', city: 'Leh', state: 'Ladakh', runways: [{ id: '07/25', heading: 70 }] },
  VOGO: { name: 'Manohar International Airport (Mopa)', city: 'Goa (Mopa)', state: 'Goa', runways: [{ id: '09/27', heading: 90 }] },
  VAGO: { name: 'Dabolim International Airport (INS Hansa)', city: 'Goa (Dabolim)', state: 'Goa', runways: [{ id: '08/26', heading: 80 }] },
  VAJJ: { name: 'Chhatrapati Sambhajinagar Airport', city: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', runways: [{ id: '09/27', heading: 90 }] }
}

// ─── METAR Parsing Engine ────────────────────────────────────────────────────

/**
 * Parse a raw METAR string into structured weather data.
 * Handles standard ICAO METAR format including wind, visibility, clouds,
 * temperature, dewpoint, pressure (QNH), and weather phenomena.
 */
function parseMetar(raw) {
  if (!raw || typeof raw !== 'string') return null
  const parts = raw.trim().split(/\s+/)
  const result = {
    raw,
    station: null,
    observationTime: null,
    wind: { direction: null, speed: null, gust: null, unit: 'kt', variable: false },
    visibility: { value: null, unit: 'm' },
    weather: [],
    clouds: [],
    temperature: null,
    dewpoint: null,
    pressure: { qnh: null, unit: 'hPa' },
    remarks: null,
    flightRules: 'VFR',
    ceilingFt: null
  }

  let i = 0

  // Skip METAR/SPECI prefix
  if (parts[i] === 'METAR' || parts[i] === 'SPECI') i++

  // Station ICAO
  if (/^[A-Z]{4}$/.test(parts[i])) {
    result.station = parts[i++]
  }

  // Observation time (DDHHMMz)
  if (/^\d{6}Z$/i.test(parts[i])) {
    const t = parts[i++]
    result.observationTime = `Day ${t.slice(0,2)}, ${t.slice(2,4)}:${t.slice(4,6)} UTC`
  }

  // AUTO indicator
  if (parts[i] === 'AUTO') i++

  // Wind (dddssKT or dddssGggKT or VRB)
  const windMatch = parts[i] && parts[i].match(/^(\d{3}|VRB)(\d{2,3})(G(\d{2,3}))?(KT|MPS)$/)
  if (windMatch) {
    result.wind.direction = windMatch[1] === 'VRB' ? 'VRB' : parseInt(windMatch[1])
    result.wind.speed = parseInt(windMatch[2])
    result.wind.gust = windMatch[4] ? parseInt(windMatch[4]) : null
    result.wind.unit = windMatch[5] === 'MPS' ? 'mps' : 'kt'
    result.wind.variable = windMatch[1] === 'VRB'
    i++
  }

  // Variable wind direction (e.g. 180V240)
  if (parts[i] && /^\d{3}V\d{3}$/.test(parts[i])) {
    result.wind.variableRange = parts[i++]
  }

  // Visibility
  if (parts[i] === 'CAVOK') {
    result.visibility.value = 9999
    result.visibility.cavok = true
    i++
  } else if (parts[i] && /^\d{4}$/.test(parts[i])) {
    result.visibility.value = parseInt(parts[i++])
  } else if (parts[i] && /^\d+SM$/.test(parts[i])) {
    result.visibility.value = parseFloat(parts[i]) * 1609.34
    result.visibility.unit = 'SM'
    i++
  }

  // Weather phenomena
  const wxCodes = {
    RA: 'Rain', SN: 'Snow', DZ: 'Drizzle', GR: 'Hail', GS: 'Small Hail',
    TS: 'Thunderstorm', FG: 'Fog', BR: 'Mist', HZ: 'Haze', FU: 'Smoke',
    DU: 'Dust', SA: 'Sand', SQ: 'Squall', FC: 'Funnel Cloud',
    SS: 'Sandstorm', DS: 'Duststorm', SH: 'Showers', FZ: 'Freezing',
    MI: 'Shallow', BC: 'Patches', PR: 'Partial', BL: 'Blowing',
    DR: 'Drifting', VC: 'Vicinity', PL: 'Ice Pellets', IC: 'Ice Crystals',
    UP: 'Unknown Precipitation'
  }
  while (parts[i] && /^[-+]?(VC)?((MI|BC|PR|BL|DR|FZ|SH|TS)?(RA|SN|DZ|GR|GS|PL|IC|UP|FG|BR|HZ|FU|DU|SA|SQ|FC|SS|DS)+)$/.test(parts[i])) {
    const wx = parts[i++]
    const intensity = wx.startsWith('+') ? 'Heavy' : wx.startsWith('-') ? 'Light' : 'Moderate'
    const cleanWx = wx.replace(/^[-+]/, '')
    const codes = cleanWx.match(/.{2}/g) || []
    const description = codes.map(c => wxCodes[c] || c).join(' ')
    result.weather.push({ raw: wx, intensity, description })
  }

  // Cloud layers
  const cloudTypes = { FEW: 'Few', SCT: 'Scattered', BKN: 'Broken', OVC: 'Overcast' }
  while (parts[i] && /^(FEW|SCT|BKN|OVC|CLR|SKC|NCD|NSC|VV)(\d{3})?(CB|TCU)?$/.test(parts[i])) {
    const cl = parts[i++]
    if (cl === 'CLR' || cl === 'SKC' || cl === 'NCD' || cl === 'NSC') {
      result.clouds.push({ type: 'Clear', altitude: null })
      continue
    }
    const match = cl.match(/^(FEW|SCT|BKN|OVC|VV)(\d{3})(CB|TCU)?$/)
    if (match) {
      const altFt = parseInt(match[2]) * 100
      result.clouds.push({
        type: match[1] === 'VV' ? 'Vertical Visibility' : (cloudTypes[match[1]] || match[1]),
        altitude: altFt,
        significant: match[3] || null
      })
    }
  }

  // Temperature / Dewpoint
  if (parts[i] && /^M?\d{2}\/M?\d{2}$/.test(parts[i])) {
    const [t, d] = parts[i++].split('/')
    result.temperature = t.startsWith('M') ? -parseInt(t.slice(1)) : parseInt(t)
    result.dewpoint = d.startsWith('M') ? -parseInt(d.slice(1)) : parseInt(d)
  }

  // QNH / Altimeter
  if (parts[i] && /^Q\d{4}$/.test(parts[i])) {
    result.pressure.qnh = parseInt(parts[i++].slice(1))
  } else if (parts[i] && /^A\d{4}$/.test(parts[i])) {
    result.pressure.qnh = Math.round(parseInt(parts[i++].slice(1)) * 0.338639)
    result.pressure.unit = 'inHg'
  }

  // Remarks
  const rmkIdx = parts.indexOf('RMK')
  if (rmkIdx > -1) {
    result.remarks = parts.slice(rmkIdx + 1).join(' ')
  }

  // Calculate ceiling (lowest BKN or OVC layer)
  const ceilingLayers = result.clouds.filter(c =>
    (c.type === 'Broken' || c.type === 'Overcast' || c.type === 'Vertical Visibility') && c.altitude !== null
  )
  result.ceilingFt = ceilingLayers.length > 0 ? Math.min(...ceilingLayers.map(c => c.altitude)) : null

  // Classify flight rules
  result.flightRules = classifyFlightRules(result.visibility.value, result.ceilingFt)

  return result
}

// ─── Flight Rules Classifier ─────────────────────────────────────────────────

/**
 * Classify flight conditions according to FAA/ICAO standards.
 * @param {number} visibilityMeters - Visibility in meters
 * @param {number|null} ceilingFt - Ceiling height in feet AGL
 * @returns {'VFR'|'MVFR'|'IFR'|'LIFR'}
 */
function classifyFlightRules(visibilityMeters, ceilingFt) {
  const visSM = visibilityMeters ? visibilityMeters / 1609.34 : 10 // default 10SM (clear)

  // LIFR: Ceiling < 500ft or Visibility < 1 SM
  if ((ceilingFt !== null && ceilingFt < 500) || visSM < 1) return 'LIFR'

  // IFR: Ceiling 500–999ft or Visibility 1–2.99 SM
  if ((ceilingFt !== null && ceilingFt < 1000) || visSM < 3) return 'IFR'

  // MVFR: Ceiling 1000–2999ft or Visibility 3–4.99 SM
  if ((ceilingFt !== null && ceilingFt < 3000) || visSM < 5) return 'MVFR'

  return 'VFR'
}

const FLIGHT_RULES_META = {
  VFR:  { label: 'Visual Flight Rules',            color: '#22c55e', severity: 'safe',     description: 'Excellent conditions for visual flight. Ceiling > 3,000 ft, Visibility > 5 SM.' },
  MVFR: { label: 'Marginal Visual Flight Rules',   color: '#3b82f6', severity: 'caution',  description: 'Reduced visibility or low ceiling. Exercise caution. Ceiling 1,000–3,000 ft or Visibility 3–5 SM.' },
  IFR:  { label: 'Instrument Flight Rules',         color: '#ef4444', severity: 'warning',  description: 'Instrument flight required. Low ceiling or visibility. Ceiling 500–1,000 ft or Visibility 1–3 SM.' },
  LIFR: { label: 'Low Instrument Flight Rules',     color: '#a855f7', severity: 'danger',   description: 'Extremely hazardous conditions. Ceiling < 500 ft or Visibility < 1 SM. Only experienced IFR pilots.' }
}

// ─── Crosswind Calculator ────────────────────────────────────────────────────

/**
 * Calculate crosswind and headwind components for a runway.
 * @param {number} windDir - Wind direction in degrees
 * @param {number} windSpeed - Wind speed in knots
 * @param {number} runwayHeading - Runway heading in degrees
 * @returns {{ crosswind: number, headwind: number, tailwind: boolean }}
 */
function calculateCrosswind(windDir, windSpeed, runwayHeading) {
  if (windDir === 'VRB' || windDir === null || windSpeed === null) {
    return { crosswind: 0, headwind: windSpeed || 0, tailwind: false, variable: true }
  }
  const angleDiff = ((windDir - runwayHeading + 360) % 360)
  const angleRad = (angleDiff * Math.PI) / 180

  const crosswind = Math.abs(Math.round(windSpeed * Math.sin(angleRad)))
  const headwindComponent = Math.round(windSpeed * Math.cos(angleRad))
  const tailwind = headwindComponent < 0

  return {
    crosswind,
    headwind: Math.abs(headwindComponent),
    tailwind,
    variable: false,
    angleDeg: angleDiff > 180 ? 360 - angleDiff : angleDiff
  }
}

// ─── Live METAR Fetch from NOAA (Free, No API Key) ──────────────────────────

/**
 * Fetch current METAR from NOAA Aviation Weather Center.
 * Falls back to a representative synthetic METAR if network is unavailable.
 */
async function fetchLiveMetar(icao) {
  const code = (icao || '').toUpperCase().trim()
  if (!code || !/^[A-Z]{4}$/.test(code)) {
    throw Object.assign(new Error('Invalid ICAO code. Expected 4-letter identifier (e.g. VABB).'), { statusCode: 400 })
  }

  try {
    const url = `https://aviationweather.gov/api/data/metar?ids=${code}&format=json&taf=true`
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) })

    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data) && data.length > 0) {
        return {
          source: 'NOAA Aviation Weather Center (Live)',
          metar: data[0],
          raw: data[0].rawOb || data[0].rawMETAR || null,
          taf: data[0].rawTaf || null
        }
      }
    }
  } catch (err) {
    console.warn(`[AVIATION] Live METAR fetch failed for ${code}:`, err.message)
  }

  // Fallback: generate representative METAR based on airport location
  return generateFallbackMetar(code)
}

/**
 * Generate a representative fallback METAR when NOAA is unreachable.
 */
function generateFallbackMetar(icao) {
  const now = new Date()
  const dd = String(now.getUTCDate()).padStart(2, '0')
  const hh = String(now.getUTCHours()).padStart(2, '0')
  const mm = String(now.getUTCMinutes()).padStart(2, '0')

  // Seasonal baseline for Indian subcontinent
  const month = now.getUTCMonth() + 1
  const isMonsoon = month >= 6 && month <= 9
  const isWinter = month >= 11 || month <= 2

  const windDir = isMonsoon ? 250 : (isWinter ? 330 : 270)
  const windSpd = isMonsoon ? 15 : (isWinter ? 8 : 10)
  const vis = isMonsoon ? 4000 : (isWinter ? 2000 : 6000)
  const temp = isMonsoon ? 28 : (isWinter ? 18 : 34)
  const dew = isMonsoon ? 24 : (isWinter ? 10 : 20)
  const qnh = isMonsoon ? 1004 : 1014
  const wx = isMonsoon ? ' TSRA' : (isWinter ? ' HZ' : '')
  const cloud = isMonsoon ? 'BKN025CB' : (isWinter ? 'SCT050' : 'FEW040')

  const rawMetar = `METAR ${icao} ${dd}${hh}${mm}Z ${String(windDir).padStart(3, '0')}${String(windSpd).padStart(2, '0')}KT ${vis}${wx} ${cloud} ${String(temp).padStart(2, '0')}/${String(dew).padStart(2, '0')} Q${qnh} NOSIG`

  return {
    source: 'WeatherGPT Seasonal Estimate (NOAA Unavailable)',
    metar: null,
    raw: rawMetar,
    taf: null,
    isFallback: true
  }
}

// ─── Full Briefing Assembly ──────────────────────────────────────────────────

/**
 * Generate a complete aviation weather briefing for an airport.
 */
async function getAviationBriefing(icao) {
  const code = (icao || '').toUpperCase().trim()
  const airport = AIRPORTS[code] || { name: `Airport ${code}`, city: 'Unknown', runways: [] }

  const liveData = await fetchLiveMetar(code)
  const rawMetar = liveData.raw
  const decoded = rawMetar ? parseMetar(rawMetar) : null

  // Calculate crosswind for each runway
  const runwayAnalysis = airport.runways.map(rwy => {
    const cw = decoded ? calculateCrosswind(decoded.wind.direction, decoded.wind.speed, rwy.heading) : null
    return {
      runway: rwy.id,
      heading: rwy.heading,
      crosswind: cw,
      safe: cw ? cw.crosswind <= 20 : true,
      warning: cw && cw.crosswind > 15 ? `Crosswind ${cw.crosswind} kt exceeds advisory threshold (15 kt)` : null
    }
  })

  // Determine best runway (lowest crosswind)
  const bestRunway = runwayAnalysis.length > 0
    ? runwayAnalysis.reduce((best, rwy) => (!best || (rwy.crosswind && rwy.crosswind.crosswind < best.crosswind.crosswind)) ? rwy : best, null)
    : null

  return {
    icao: code,
    airport: airport.name,
    city: airport.city,
    source: liveData.source,
    isFallback: liveData.isFallback || false,
    rawMetar,
    rawTaf: liveData.taf || null,
    decoded,
    flightRules: decoded ? decoded.flightRules : 'UNKNOWN',
    flightRulesMeta: decoded ? FLIGHT_RULES_META[decoded.flightRules] : null,
    runwayAnalysis,
    bestRunway,
    briefingSummary: decoded ? buildBriefingSummary(decoded, airport, bestRunway) : 'METAR data unavailable.',
    timestamp: new Date().toISOString()
  }
}

/**
 * Build a human-readable briefing summary.
 */
function buildBriefingSummary(decoded, airport, bestRunway) {
  const parts = []
  parts.push(`Aviation Weather Briefing for ${airport.city} (${decoded.station}).`)
  parts.push(`Observation: ${decoded.observationTime}.`)

  // Wind
  if (decoded.wind.variable) {
    parts.push(`Wind: Variable at ${decoded.wind.speed} knots${decoded.wind.gust ? `, gusting to ${decoded.wind.gust} knots` : ''}.`)
  } else if (decoded.wind.direction !== null) {
    parts.push(`Wind: ${decoded.wind.direction}° at ${decoded.wind.speed} knots${decoded.wind.gust ? `, gusting to ${decoded.wind.gust} knots` : ''}.`)
  }

  // Visibility
  if (decoded.visibility.cavok) {
    parts.push('Visibility: CAVOK (Ceiling And Visibility OK — unlimited).')
  } else if (decoded.visibility.value) {
    const km = (decoded.visibility.value / 1000).toFixed(1)
    parts.push(`Visibility: ${decoded.visibility.value}m (${km} km).`)
  }

  // Weather
  if (decoded.weather.length > 0) {
    parts.push(`Weather: ${decoded.weather.map(w => `${w.intensity} ${w.description}`).join(', ')}.`)
  }

  // Clouds
  if (decoded.clouds.length > 0) {
    const cloudDesc = decoded.clouds.map(c =>
      c.type === 'Clear' ? 'Clear skies' : `${c.type} at ${c.altitude?.toLocaleString()} ft${c.significant ? ` (${c.significant})` : ''}`
    ).join(', ')
    parts.push(`Clouds: ${cloudDesc}.`)
  }

  // Temperature
  if (decoded.temperature !== null) {
    parts.push(`Temperature: ${decoded.temperature}°C, Dewpoint: ${decoded.dewpoint}°C.`)
  }

  // Pressure
  if (decoded.pressure.qnh) {
    parts.push(`QNH: ${decoded.pressure.qnh} hPa.`)
  }

  // Flight rules
  const frMeta = FLIGHT_RULES_META[decoded.flightRules]
  parts.push(`Flight Category: ${decoded.flightRules} — ${frMeta?.label}. ${frMeta?.description}`)

  // Best runway
  if (bestRunway?.crosswind) {
    parts.push(`Recommended Runway: ${bestRunway.runway} (crosswind ${bestRunway.crosswind.crosswind} kt, ${bestRunway.crosswind.tailwind ? 'tailwind' : 'headwind'} ${bestRunway.crosswind.headwind} kt).`)
  }

  return parts.join(' ')
}

export {
  AIRPORTS,
  parseMetar,
  classifyFlightRules,
  FLIGHT_RULES_META,
  calculateCrosswind,
  fetchLiveMetar,
  getAviationBriefing
}

export default {
  AIRPORTS,
  parseMetar,
  classifyFlightRules,
  FLIGHT_RULES_META,
  calculateCrosswind,
  fetchLiveMetar,
  getAviationBriefing
}
