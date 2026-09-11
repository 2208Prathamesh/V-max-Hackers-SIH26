import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { api } from '../services/api'
import { useWeather } from '../context/WeatherContext'
import { useLanguage } from '../context/LanguageContext'
import {
  Plane,
  Compass,
  Wind,
  CloudRain,
  Eye,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Clock,
  RefreshCw,
  Copy,
  Check,
  Radio,
  FileText,
  MapPin,
  ArrowUpRight,
  ChevronRight,
  Info,
  Search
} from 'lucide-react'

// ─── Indian Airport Catalog with IATA & Elevation Data (34 National Hubs) ──────
const AIRPORT_DIRECTORY = [
  { icao: 'VABB', iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj Intl Airport', city: 'Mumbai', state: 'Maharashtra', elevation: '39 ft (12 m)', lat: '19.0886° N', lon: '72.8679° E' },
  { icao: 'VIDP', iata: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', state: 'NCT Delhi', elevation: '777 ft (237 m)', lat: '28.5562° N', lon: '77.1000° E' },
  { icao: 'VOBL', iata: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru', state: 'Karnataka', elevation: '3,000 ft (915 m)', lat: '13.1986° N', lon: '77.7066° E' },
  { icao: 'VOMM', iata: 'MAA', name: 'Chennai International Airport', city: 'Chennai', state: 'Tamil Nadu', elevation: '52 ft (16 m)', lat: '12.9941° N', lon: '80.1807° E' },
  { icao: 'VECC', iata: 'CCU', name: 'Netaji Subhas Chandra Bose Intl Airport', city: 'Kolkata', state: 'West Bengal', elevation: '16 ft (5 m)', lat: '22.6547° N', lon: '88.4467° E' },
  { icao: 'VAPO', iata: 'PNQ', name: 'Pune Lohegaon Airport & IAF Station', city: 'Pune', state: 'Maharashtra', elevation: '1,942 ft (592 m)', lat: '18.5822° N', lon: '73.9197° E' },
  { icao: 'VOHS', iata: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', state: 'Telangana', elevation: '2,024 ft (617 m)', lat: '17.2403° N', lon: '78.4294° E' },
  { icao: 'VAAH', iata: 'AMD', name: 'Sardar Vallabhbhai Patel Intl Airport', city: 'Ahmedabad', state: 'Gujarat', elevation: '189 ft (58 m)', lat: '23.0772° N', lon: '72.6347° E' },
  { icao: 'VIJP', iata: 'JAI', name: 'Jaipur International Airport', city: 'Jaipur', state: 'Rajasthan', elevation: '1,263 ft (385 m)', lat: '26.8242° N', lon: '75.8122° E' },
  { icao: 'VILK', iata: 'LKO', name: 'Chaudhary Charan Singh Intl Airport', city: 'Lucknow', state: 'Uttar Pradesh', elevation: '405 ft (123 m)', lat: '26.7606° N', lon: '80.8893° E' },
  { icao: 'VEGT', iata: 'GAU', name: 'Lokpriya Gopinath Bordoloi Intl Airport', city: 'Guwahati', state: 'Assam', elevation: '162 ft (49 m)', lat: '26.1061° N', lon: '91.5859° E' },
  { icao: 'VISR', iata: 'SXR', name: 'Sheikh ul-Alam International Airport', city: 'Srinagar', state: 'Jammu & Kashmir', elevation: '5,430 ft (1,655 m)', lat: '34.0044° N', lon: '74.7742° E' },
  { icao: 'VOCI', iata: 'COK', name: 'Cochin International Airport', city: 'Kochi', state: 'Kerala', elevation: '30 ft (9 m)', lat: '10.1556° N', lon: '76.4019° E' },
  { icao: 'VOTV', iata: 'TRV', name: 'Thiruvananthapuram Intl Airport', city: 'Thiruvananthapuram', state: 'Kerala', elevation: '15 ft (5 m)', lat: '8.4821° N', lon: '76.9200° E' },
  { icao: 'VOCL', iata: 'CCJ', name: 'Calicut International Airport', city: 'Kozhikode', state: 'Kerala', elevation: '342 ft (104 m)', lat: '11.1369° N', lon: '75.9553° E' },
  { icao: 'VOML', iata: 'IXE', name: 'Mangalore International Airport', city: 'Mangalore', state: 'Karnataka', elevation: '336 ft (102 m)', lat: '12.9613° N', lon: '74.8900° E' },
  { icao: 'VOCB', iata: 'CJB', name: 'Coimbatore International Airport', city: 'Coimbatore', state: 'Tamil Nadu', elevation: '1,320 ft (402 m)', lat: '11.0297° N', lon: '77.0434° E' },
  { icao: 'VOMD', iata: 'IXM', name: 'Madurai International Airport', city: 'Madurai', state: 'Tamil Nadu', elevation: '461 ft (141 m)', lat: '9.8345° N', lon: '78.0934° E' },
  { icao: 'VOVZ', iata: 'VTZ', name: 'Visakhapatnam Airport (INS Dega)', city: 'Visakhapatnam', state: 'Andhra Pradesh', elevation: '17 ft (5 m)', lat: '17.7212° N', lon: '83.2245° E' },
  { icao: 'VEBS', iata: 'BBI', name: 'Biju Patnaik International Airport', city: 'Bhubaneswar', state: 'Odisha', elevation: '146 ft (45 m)', lat: '20.2444° N', lon: '85.8178° E' },
  { icao: 'VEPT', iata: 'PAT', name: 'Jayprakash Narayan Intl Airport', city: 'Patna', state: 'Bihar', elevation: '170 ft (52 m)', lat: '25.5913° N', lon: '85.0880° E' },
  { icao: 'VEBN', iata: 'VNS', name: 'Lal Bahadur Shastri Intl Airport', city: 'Varanasi', state: 'Uttar Pradesh', elevation: '266 ft (81 m)', lat: '25.4522° N', lon: '82.8592° E' },
  { icao: 'VIAR', iata: 'ATQ', name: 'Sri Guru Ram Dass Jee Intl Airport', city: 'Amritsar', state: 'Punjab', elevation: '756 ft (230 m)', lat: '31.7096° N', lon: '74.7973° E' },
  { icao: 'VICG', iata: 'IXC', name: 'Shaheed Bhagat Singh Intl Airport', city: 'Chandigarh', state: 'Chandigarh', elevation: '1,012 ft (308 m)', lat: '30.6735° N', lon: '76.7885° E' },
  { icao: 'VAID', iata: 'IDR', name: 'Devi Ahilyabai Holkar Intl Airport', city: 'Indore', state: 'Madhya Pradesh', elevation: '1,850 ft (564 m)', lat: '22.7217° N', lon: '75.8011° E' },
  { icao: 'VABP', iata: 'BHO', name: 'Raja Bhoj International Airport', city: 'Bhopal', state: 'Madhya Pradesh', elevation: '1,720 ft (524 m)', lat: '23.2875° N', lon: '77.3378° E' },
  { icao: 'VANP', iata: 'NAG', name: 'Dr. Babasaheb Ambedkar Intl Airport', city: 'Nagpur', state: 'Maharashtra', elevation: '1,033 ft (315 m)', lat: '21.0922° N', lon: '79.0472° E' },
  { icao: 'VASU', iata: 'STV', name: 'Surat International Airport', city: 'Surat', state: 'Gujarat', elevation: '16 ft (5 m)', lat: '21.1139° N', lon: '72.7419° E' },
  { icao: 'VABO', iata: 'BDQ', name: 'Vadodara Civil Aerodrome', city: 'Vadodara', state: 'Gujarat', elevation: '129 ft (39 m)', lat: '22.3361° N', lon: '73.2264° E' },
  { icao: 'VOPB', iata: 'IXZ', name: 'Veer Savarkar International Airport', city: 'Port Blair', state: 'Andaman & Nicobar', elevation: '53 ft (16 m)', lat: '11.6414° N', lon: '92.7297° E' },
  { icao: 'VILH', iata: 'IXL', name: 'Kushok Bakula Rimpochee Airport', city: 'Leh', state: 'Ladakh', elevation: '10,682 ft (3,256 m)', lat: '34.1359° N', lon: '77.5465° E' },
  { icao: 'VOGO', iata: 'GOX', name: 'Manohar International Airport (Mopa)', city: 'Goa (Mopa)', state: 'Goa', elevation: '558 ft (170 m)', lat: '15.7667° N', lon: '73.8667° E' },
  { icao: 'VAGO', iata: 'GOI', name: 'Dabolim International Airport', city: 'Goa (Dabolim)', state: 'Goa', elevation: '184 ft (56 m)', lat: '15.3808° N', lon: '73.8314° E' },
  { icao: 'VAJJ', iata: 'IXU', name: 'Chhatrapati Sambhajinagar Airport', city: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', elevation: '1,909 ft (582 m)', lat: '19.8631° N', lon: '75.3981° E' }
]

export const AviationPage = () => {
  const { isDark } = useWeather()
  const { language } = useLanguage()

  const [selectedIcao, setSelectedIcao] = useState('VABB')
  const [searchQuery, setSearchQuery] = useState('')
  const [briefing, setBriefing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Keep live UTC & IST clock updated every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Filter airports by search term (ICAO, IATA, City, State)
  const filteredAirports = AIRPORT_DIRECTORY.filter(apt => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return true
    return (
      apt.icao.toLowerCase().includes(q) ||
      apt.iata.toLowerCase().includes(q) ||
      apt.city.toLowerCase().includes(q) ||
      apt.state.toLowerCase().includes(q) ||
      apt.name.toLowerCase().includes(q)
    )
  })

  // Fetch full flight briefing
  const fetchBriefing = useCallback(async (icao) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.getAviationBriefing(icao)
      setBriefing(res?.data || res)
    } catch (err) {
      console.error('Aviation briefing fetch error:', err)
      setError(err.message || 'Failed to retrieve aerodrome meteorological briefing')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedIcao) {
      fetchBriefing(selectedIcao)
    }
  }, [selectedIcao, fetchBriefing])

  const copyRawMetar = () => {
    if (!briefing?.rawMetar) return
    navigator.clipboard.writeText(briefing.rawMetar)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const airportMeta = AIRPORT_DIRECTORY.find(a => a.icao === selectedIcao) || {
    icao: selectedIcao,
    iata: '---',
    name: briefing?.airport || `Aerodrome ${selectedIcao}`,
    city: briefing?.city || 'India',
    elevation: 'Sea Level',
    lat: '---',
    lon: '---'
  }

  const decoded = briefing?.decoded || {}
  const flightRules = briefing?.flightRules || 'VFR'
  const isVfr = flightRules === 'VFR'
  const isMvfr = flightRules === 'MVFR'
  const isIfr = flightRules === 'IFR'
  const isLifr = flightRules === 'LIFR'

  // ICAO Category styles
  const categoryBadgeConfig = {
    VFR: {
      badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      pill: 'bg-emerald-600 text-white',
      desc: 'Visual Flight Rules — Ceiling > 3,000 ft AGL and Visibility > 5 SM (8 km). Unrestricted visual departure and approach operations.',
      dispatchVerdict: 'NORMAL VISUAL OPERATIONS PERMITTED'
    },
    MVFR: {
      badge: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
      pill: 'bg-sky-600 text-white',
      desc: 'Marginal VFR — Ceiling 1,000–3,000 ft AGL or Visibility 3–5 SM (5–8 km). Visual approaches subject to ATC terrain separation.',
      dispatchVerdict: 'MARGINAL CONDITIONS — PILOT CAUTION ADVISED'
    },
    IFR: {
      badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
      pill: 'bg-rose-600 text-white',
      desc: 'Instrument Flight Rules — Ceiling 500–999 ft AGL or Visibility 1–2.99 SM (1.6–4.8 km). Mandatory ILS/RNAV instrument procedures.',
      dispatchVerdict: 'INSTRUMENT FLIGHT RULES IN FORCE — PRECISION ILS'
    },
    LIFR: {
      badge: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
      pill: 'bg-purple-600 text-white',
      desc: 'Low IFR — Ceiling < 500 ft AGL or Visibility < 1 SM (1.6 km). Category II/III low visibility procedures active. Divert contingencies ready.',
      dispatchVerdict: 'LOW VISIBILITY PROCEDURES (LVP) ACTIVE'
    }
  }[flightRules] || {
    badge: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    pill: 'bg-slate-600 text-white',
    desc: 'Observation pending or standard VMC parameters apply.',
    dispatchVerdict: 'METEOROLOGICAL FLIGHT RULES PENDING'
  }

  const wind = decoded.wind || { direction: 240, speed: 12, gust: null, unit: 'kt', variable: false }
  const visibilityM = decoded.visibility?.value ?? 6000
  const visibilityKm = (visibilityM / 1000).toFixed(1)
  const visibilitySm = (visibilityM / 1609.34).toFixed(1)
  const altimeterQnh = decoded.pressure?.qnh ?? 1010
  const altimeterInHg = (altimeterQnh * 0.02953).toFixed(2)

  // Parse coordinates helper
  const parseCoordinate = (coordStr) => {
    if (!coordStr) return 0
    const match = coordStr.match(/([0-9.]+)/)
    return match ? parseFloat(match[1]) : 0
  }

  // Haversine distance calculation in kilometers
  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const p1 = (lat1 * Math.PI) / 180
    const p2 = (lat2 * Math.PI) / 180
    const dp = ((lat2 - lat1) * Math.PI) / 180
    const dl = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dp / 2) * Math.sin(dp / 2) +
      Math.cos(p1) * Math.cos(p2) *
      Math.sin(dl / 2) * Math.sin(dl / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Math.round(R * c)
  }

  // Top 4 nearest alternate aerodromes for emergency diversion
  const alternateAirports = useMemo(() => {
    const currentApt = AIRPORT_DIRECTORY.find(a => a.icao === selectedIcao)
    if (!currentApt) return []
    const curLat = parseCoordinate(currentApt.lat)
    const curLon = parseCoordinate(currentApt.lon)

    return AIRPORT_DIRECTORY
      .filter(a => a.icao !== selectedIcao)
      .map(a => {
        const dKm = calculateDistanceKm(curLat, curLon, parseCoordinate(a.lat), parseCoordinate(a.lon))
        const dNm = Math.round(dKm / 1.852)
        return { ...a, distanceKm: dKm, distanceNm: dNm }
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 4)
  }, [selectedIcao])

  // DGCA Drone Rules 2021 Weather Clearance Assessment
  const droneClearance = useMemo(() => {
    const windSpd = wind.speed || 0
    const visM = visibilityM
    const ceilingFt = decoded.ceilingFt != null ? decoded.ceilingFt : 9999
    const rawMetar = briefing?.rawMetar || ''
    const hasRainOrStorm = /(RA|TS|SH|DZ|SQ|FC)/i.test(rawMetar) || (decoded.clouds || []).some(c => c.type === 'CB')

    const windPassed = windSpd <= 15
    const visPassed = visM >= 3000
    const ceilingPassed = ceilingFt >= 400
    const weatherPassed = !hasRainOrStorm

    let status = 'PERMITTED' // 'PERMITTED' | 'CONDITIONAL' | 'NO-FLY'
    if (!windPassed || !visPassed || !weatherPassed) {
      status = 'NO-FLY'
    } else if (windSpd > 10 || ceilingFt < 1000 || (wind.gust && wind.gust > 15)) {
      status = 'CONDITIONAL'
    }

    return {
      status,
      windSpd,
      windPassed,
      visM,
      visPassed,
      ceilingFt,
      ceilingPassed,
      weatherPassed,
      hasRainOrStorm
    }
  }, [wind, visibilityM, decoded, briefing])

  // Emergency Airlift & Evacuation Flight Readiness for Disaster Operations
  const disasterAirliftStatus = useMemo(() => {
    const vis = visibilityM
    const ceiling = decoded.ceilingFt != null ? decoded.ceilingFt : 9999
    const windSpd = wind.speed || 0
    const rawMetar = briefing?.rawMetar || ''
    const hasConvectiveStorm = /(TS|CB|SQ|FC)/i.test(rawMetar) || (decoded.clouds || []).some(c => c.type === 'CB')
    const hasHeavyRain = /(\+RA|FZRA)/i.test(rawMetar)

    // 1. Helicopter SAR (NDRF / IAF / Coast Guard winching & air-drops)
    let heliStatus = 'GO'
    let heliVerdict = 'CLEARED FOR AIRLIFT & WINCHING'
    let heliReason = 'Wind velocity and visibility within low-altitude hoist envelope.'
    if (hasConvectiveStorm || windSpd > 35) {
      heliStatus = 'NO-GO'
      heliVerdict = 'HELI-OPS GROUNDED — CONVECTIVE HAZARD'
      heliReason = 'Severe convective cell (CB) or winds exceeding 35 kt safety margin.'
    } else if (vis < 1500 || ceiling < 500 || windSpd > 22) {
      heliStatus = 'CAUTION'
      heliVerdict = 'MARGINAL — EXPERIENCED RESCUE CREW ONLY'
      heliReason = 'Reduced visibility (<1.5 km) or ceiling (<500 ft AGL) in operations zone.'
    }

    // 2. Air Ambulance / Medical Evacuation
    let medevacStatus = 'GO'
    let medevacVerdict = 'CLEARED FOR IMMEDIATE MEDEVAC'
    let medevacReason = 'Visual or standard precision instrument approaches fully supported.'
    if (vis < 800 || ceiling < 300 || hasConvectiveStorm) {
      medevacStatus = 'NO-GO'
      medevacVerdict = 'MEDEVAC FLIGHTS SUSPENDED'
      medevacReason = 'Ceiling/visibility below aerodrome approach minimums.'
    } else if (flightRules === 'IFR' || flightRules === 'LIFR' || vis < 3000) {
      medevacStatus = 'CAUTION'
      medevacVerdict = 'INSTRUMENT ONLY (ILS CAT I/II REQUIRED)'
      medevacReason = 'Mandatory instrument procedures. Non-precision visual aircraft grounded.'
    }

    // 3. Heavy Disaster Relief Cargo (C-130J, AN-32, Commercial Evac A320)
    const bestRwy = briefing?.bestRunway
    const favoredCw = bestRwy?.crosswind?.crosswind || 0
    let cargoStatus = 'GO'
    let cargoVerdict = 'RUNWAY OPEN FOR RELIEF LOGISTICS'
    let cargoReason = `Favored Runway ${bestRwy ? `RWY ${bestRwy.runway}` : 'Active'} crosswind component within 20 kt envelope.`
    if (favoredCw > 25 || hasConvectiveStorm) {
      cargoStatus = 'NO-GO'
      cargoVerdict = 'RELIEF RUNWAY CLOSED — CROSSWIND EXCEEDED'
      cargoReason = `Crosswind on active runway (${favoredCw} kt) exceeds heavy transport safety limits.`
    } else if (favoredCw > 15 || hasHeavyRain) {
      cargoStatus = 'CAUTION'
      cargoVerdict = 'MARGINAL CROSSWIND / WET RUNWAY'
      cargoReason = 'Increased braking distance on wet tarmac. Approach caution advised.'
    }

    return {
      heli: { status: heliStatus, verdict: heliVerdict, reason: heliReason },
      medevac: { status: medevacStatus, verdict: medevacVerdict, reason: medevacReason },
      cargo: { status: cargoStatus, verdict: cargoVerdict, reason: cargoReason }
    }
  }, [visibilityM, decoded, wind, briefing, flightRules])

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans select-none">
      {/* ─── 1. Aerodrome Meteorological Office (AMO) Official Header ─────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Plane className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Aerodrome Meteorological Office (AMO)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-xs">
                ICAO Annex 3
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                WMO Station
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
              Real-time civil aviation weather intelligence, METAR/SPECI decoding, runway crosswind component analysis, and ICAO flight rule classifications for flight operations dispatch.
            </p>
          </div>

          {/* Synchronized Operational Clocks */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Zulu (UTC)</div>
              <div className="text-sm font-black font-mono text-slate-900 dark:text-white">
                {currentTime.toISOString().slice(11, 19)}Z
              </div>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Indian Std (IST)</div>
              <div className="text-sm font-black font-mono text-blue-700 dark:text-blue-300">
                {currentTime.toLocaleTimeString('en-IN', { hour12: false })} IST
              </div>
            </div>
            <button
              type="button"
              onClick={() => fetchBriefing(selectedIcao)}
              disabled={loading}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer disabled:opacity-50"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Aerodrome Selector Pills & Search Bar */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Select Indian Aerodrome:
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Showing <strong className="text-blue-600 dark:text-blue-400">{filteredAirports.length}</strong> of {AIRPORT_DIRECTORY.length} national hubs
              </span>
            </div>

            {/* Airport Search Bar */}
            <div className="relative flex items-center min-w-[260px]">
              <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ICAO, IATA, city, state..."
                className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold px-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {filteredAirports.length === 0 ? (
              <div className="py-2 px-3 text-xs text-slate-400 italic">
                No aerodrome found matching &ldquo;{searchQuery}&rdquo;. Try searching for VABB, DEL, Bengaluru, or Goa.
              </div>
            ) : (
              filteredAirports.map(apt => {
                const active = selectedIcao === apt.icao
                return (
                  <button
                    key={apt.icao}
                    type="button"
                    onClick={() => setSelectedIcao(apt.icao)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
                      active
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500'
                    }`}
                  >
                    <span className="font-mono">{apt.icao}</span>
                    <span className="opacity-60 text-[11px]">({apt.iata})</span>
                    <span className="text-[11px] font-medium hidden sm:inline">{apt.city}</span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>

      {loading && !briefing ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-400">Decoding Aerodrome Meteorological Observation (METAR)...</span>
        </div>
      ) : error ? (
        <div className="p-8 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <div className="font-bold text-base">Aerodrome Telemetry Unavailable</div>
          <p className="text-xs text-rose-700/80 dark:text-rose-300/80 max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={() => fetchBriefing(selectedIcao)}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-sm hover:bg-rose-700 transition cursor-pointer"
          >
            Retry Aerodrome Query
          </button>
        </div>
      ) : (
        <>
          {/* ─── 2. Aerodrome Identification & Primary Flight Category HUD ───── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Aerodrome Header Card (7 Cols) */}
            <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-mono font-black text-sm tracking-wider">
                      {airportMeta.icao}
                    </span>
                    <span className="text-sm font-bold text-slate-400 font-mono">
                      IATA: {airportMeta.iata}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    {airportMeta.city}, {airportMeta.state}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-3">
                  {airportMeta.name}
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">Field Elevation</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{airportMeta.elevation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">Coordinates</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{airportMeta.lat}, {airportMeta.lon}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-400 block text-[11px] font-medium">Observation Source</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 truncate block">{briefing?.source}</span>
                  </div>
                </div>
              </div>

              {/* Plain-Language Flight Dispatch Briefing */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  <span>Operations Dispatch Briefing</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {briefing?.briefingSummary}
                </p>
              </div>
            </div>

            {/* Right: ICAO Flight Category HUD Card (5 Cols) */}
            <div className={`lg:col-span-5 p-6 sm:p-7 rounded-3xl border shadow-sm flex flex-col justify-between space-y-5 ${categoryBadgeConfig.badge}`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    ICAO Flight Category
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider ${categoryBadgeConfig.pill}`}>
                    {flightRules}
                  </span>
                </div>

                <div className="my-4">
                  <div className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                    {flightRules}
                  </div>
                  <div className="text-xs font-bold mt-1 text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    {categoryBadgeConfig.dispatchVerdict}
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 border-t border-current/15 pt-3">
                  {categoryBadgeConfig.desc}
                </p>
              </div>

              {/* Category Legend Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>LIFR (&lt;500ft)</span>
                  <span>IFR (&lt;1000ft)</span>
                  <span>MVFR (&lt;3000ft)</span>
                  <span>VFR (&gt;3000ft)</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-2">
                  <div className={`rounded-full ${isLifr ? 'bg-purple-600 ring-2 ring-purple-400' : 'bg-purple-500/30'}`} />
                  <div className={`rounded-full ${isIfr ? 'bg-rose-600 ring-2 ring-rose-400' : 'bg-rose-500/30'}`} />
                  <div className={`rounded-full ${isMvfr ? 'bg-sky-600 ring-2 ring-sky-400' : 'bg-sky-500/30'}`} />
                  <div className={`rounded-full ${isVfr ? 'bg-emerald-600 ring-2 ring-emerald-400' : 'bg-emerald-500/30'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* ─── 3. Raw METAR Console with Tokenized Decoder ─────────────────── */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Raw Aviation Routine Weather Report (METAR)
                </h3>
              </div>
              <button
                type="button"
                onClick={copyRawMetar}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy METAR'}</span>
              </button>
            </div>

            {/* Terminal View */}
            <div className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs sm:text-sm tracking-wide border border-slate-800 overflow-x-auto selection:bg-emerald-500 selection:text-slate-950">
              <code>{briefing?.rawMetar || 'METAR DATA CURRENTLY UNAVAILABLE'}</code>
            </div>

            {/* Tokenized Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Station</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{decoded.station || selectedIcao}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Surface Wind</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {wind.variable ? 'VRB' : `${wind.direction}°`} @ {wind.speed}kt
                  {wind.gust ? ` G${wind.gust}` : ''}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Visibility</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{visibilityM}m ({visibilitySm} SM)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Cloud Base</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {decoded.ceilingFt != null ? `${decoded.ceilingFt} ft AGL` : 'Ceiling Clear'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Temperature</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{decoded.temperature ?? '--'}°C</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Dew Point</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{decoded.dewpoint ?? '--'}°C</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Altimeter (QNH)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{altimeterQnh} hPa ({altimeterInHg}")</span>
              </div>
            </div>
          </div>

          {/* ─── 4. Active Aerodrome Runway Crosswind Assessment Matrix ─────── */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Runway Crosswind & Headwind Safety Matrix</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Trigonometric decomposition (<code className="font-mono text-blue-600 dark:text-blue-400">V × sin(θ)</code>) across all physical runway orientations for {airportMeta.city}.
                </p>
              </div>

              {briefing?.bestRunway && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Favored Operational Runway: <strong>RWY {briefing.bestRunway.runway}</strong></span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(briefing?.runwayAnalysis) && briefing.runwayAnalysis.map(rwy => {
                const cw = rwy.crosswind
                const isCrosswindSevere = cw && cw.crosswind > 20
                const isCrosswindAdvisory = cw && cw.crosswind > 15 && cw.crosswind <= 20
                const isFavored = briefing?.bestRunway?.runway === rwy.runway

                return (
                  <div
                    key={rwy.runway}
                    className={`p-5 rounded-2xl border transition-all space-y-4 ${
                      isFavored
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800 shadow-sm'
                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                          RWY {rwy.runway}
                        </span>
                        {isFavored && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase">
                            Favored
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        HDG {rwy.heading}°
                      </span>
                    </div>

                    {/* Wind Component Breakdown */}
                    {cw && !cw.variable ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 dark:text-slate-400">Crosswind Component:</span>
                          <span className={`font-mono font-black ${isCrosswindSevere ? 'text-rose-600 dark:text-rose-400 text-sm' : isCrosswindAdvisory ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                            {cw.crosswind} knots
                          </span>
                        </div>

                        {/* Crosswind Visual Limit Bar */}
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCrosswindSevere ? 'bg-rose-500' : isCrosswindAdvisory ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, (cw.crosswind / 30) * 100)}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-xs pt-1">
                          <span className="text-slate-500 dark:text-slate-400">
                            {cw.tailwind ? 'Tailwind Component:' : 'Headwind Component:'}
                          </span>
                          <span className={`font-mono font-bold ${cw.tailwind ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {cw.headwind} knots {cw.tailwind ? '(Tailwind)' : '(Headwind)'}
                          </span>
                        </div>

                        {rwy.warning && (
                          <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-semibold flex items-center gap-1.5 mt-2">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>{rwy.warning}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        🍃 <strong>Variable Wind ({wind.speed || 0} kt)</strong> — Light and variable. Zero crosswind penalty across this runway.
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* ─── Emergency Disaster Airlift & Rescue Airfield Readiness (NDRF / IAF / Air Ambulance) ─── */}
            <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                    <Plane className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Emergency Disaster Airlift &amp; Evacuation Airfield Readiness</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/15 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-400/30">
                        Disaster Ops HUD
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Standard operating dispatch readiness for National Disaster Response Force (NDRF), IAF relief cargo, and Emergency Air Ambulances for {airportMeta.city} ({airportMeta.icao}).
                    </p>
                  </div>
                </div>

                <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                  Surface Wind: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{wind.variable ? 'Variable / Calm' : `${wind.direction}°`} @ {wind.speed}kt</span>
                </div>
              </div>

              {/* 3 Operational Disaster Sortie Tiers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                {/* 1. Heli-SAR */}
                <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-2.5 ${
                  disasterAirliftStatus.heli.status === 'GO'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-200'
                    : disasterAirliftStatus.heli.status === 'CAUTION'
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/40 text-amber-950 dark:text-amber-200'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/40 text-rose-950 dark:text-rose-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-300">🚁 Heli-SAR &amp; Winching</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      disasterAirliftStatus.heli.status === 'GO'
                        ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950'
                        : disasterAirliftStatus.heli.status === 'CAUTION'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-rose-600 text-white'
                    }`}>
                      {disasterAirliftStatus.heli.status}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                      {disasterAirliftStatus.heli.verdict}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {disasterAirliftStatus.heli.reason}
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono border-t border-slate-200 dark:border-slate-800 pt-2">
                    Mi-17 / ALH Dhruv / Chetak Hoist Envelope
                  </div>
                </div>

                {/* 2. Air Ambulance */}
                <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-2.5 ${
                  disasterAirliftStatus.medevac.status === 'GO'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-200'
                    : disasterAirliftStatus.medevac.status === 'CAUTION'
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/40 text-amber-950 dark:text-amber-200'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/40 text-rose-950 dark:text-rose-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-300">🚑 Air Ambulance (Medevac)</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      disasterAirliftStatus.medevac.status === 'GO'
                        ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950'
                        : disasterAirliftStatus.medevac.status === 'CAUTION'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-rose-600 text-white'
                    }`}>
                      {disasterAirliftStatus.medevac.status}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                      {disasterAirliftStatus.medevac.verdict}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {disasterAirliftStatus.medevac.reason}
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono border-t border-slate-200 dark:border-slate-800 pt-2">
                    Critical Patient Evacuation Minimums
                  </div>
                </div>

                {/* 3. Heavy Relief Cargo */}
                <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-2.5 ${
                  disasterAirliftStatus.cargo.status === 'GO'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-200'
                    : disasterAirliftStatus.cargo.status === 'CAUTION'
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/40 text-amber-950 dark:text-amber-200'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/40 text-rose-950 dark:text-rose-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-300">📦 Heavy Relief Cargo (IAF)</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      disasterAirliftStatus.cargo.status === 'GO'
                        ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950'
                        : disasterAirliftStatus.cargo.status === 'CAUTION'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-rose-600 text-white'
                    }`}>
                      {disasterAirliftStatus.cargo.status}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                      {disasterAirliftStatus.cargo.verdict}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {disasterAirliftStatus.cargo.reason}
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono border-t border-slate-200 dark:border-slate-800 pt-2">
                    C-130J Hercules / AN-32 / Civilian Evacuation
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── 5. Vertical Atmospheric Profile & TAF Forecast ─────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cloud Stratification Ladder (5 Cols) */}
            <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-blue-500" />
                  <span>Cloud Stratification & Ceiling</span>
                </h3>
                <span className="text-xs font-mono font-bold text-slate-400">Surface to FL100</span>
              </div>

              {Array.isArray(decoded.clouds) && decoded.clouds.length > 0 ? (
                <div className="space-y-2.5">
                  {decoded.clouds.map((c, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono font-bold text-xs">
                          {c.coverage}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {c.coverage === 'FEW' ? 'Few (1-2 octas)' : c.coverage === 'SCT' ? 'Scattered (3-4 octas)' : c.coverage === 'BKN' ? 'Broken (5-7 octas)' : 'Overcast (8 octas)'}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {c.type === 'CB' ? '⚠️ Cumulonimbus (Convective Thunderstorm)' : 'Stratified Cloud Deck'}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                        {c.altitudeFt != null ? `${c.altitudeFt} ft AGL` : 'Unspecified'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
                  Clear of clouds below 10,000 ft (CAVOK parameters met).
                </div>
              )}
            </div>

            {/* Terminal Aerodrome Forecast (TAF) (7 Cols) */}
            <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span>Terminal Aerodrome Forecast (TAF)</span>
                </h3>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">24-30h Lead Time</span>
              </div>

              {briefing?.rawTaf ? (
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-slate-950 text-purple-900 dark:text-purple-300 font-mono text-xs leading-relaxed border border-purple-200/80 dark:border-slate-800 overflow-x-auto">
                  <code>{briefing.rawTaf}</code>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
                  No explicit TAF broadcast issued for {airportMeta.icao} in current cycle. Standard trend: NOSIG (No significant changes).
                </div>
              )}

              {/* DGCA & AAI Dispatch Directives */}
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
                <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  <span>Operational Flight Dispatcher Notice (DGCA CAR Series):</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  <li>Fuel reserves must comply with alternate destination aerodrome diversion minimums (45-minute holding allowance).</li>
                  <li>When IFR or MVFR conditions prevail, RNAV GNSS and ILS Cat I/II minima must be verified prior to pushback clearance.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ─── 6. DGCA Drone / UAV Pilot Weather Clearance HUD ─────────────── */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Plane className="w-4 h-4" />
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    DGCA Drone / UAV Weather Flying Clearance HUD
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    The Drone Rules 2021
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Automated statutory compliance evaluation under DGCA CAR Section 3, Series X, Part I (DigitalSky airspace envelope for Micro/Small Remotely Piloted Aircraft Systems).
                </p>
              </div>

              {/* Status Verdict Badge */}
              <div className={`px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 border shadow-xs ${
                droneClearance.status === 'PERMITTED'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : droneClearance.status === 'CONDITIONAL'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
              }`}>
                {droneClearance.status === 'PERMITTED' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : droneClearance.status === 'CONDITIONAL' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                )}
                <span>
                  {droneClearance.status === 'PERMITTED'
                    ? '🟢 PERMITTED TO FLY (VLOS)'
                    : droneClearance.status === 'CONDITIONAL'
                      ? '🟡 CAUTION: LOW ALTITUDE ONLY'
                      : '🔴 NO-FLY WEATHER HOLD'}
                </span>
              </div>
            </div>

            {/* Drone Operational Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Wind Speed Check */}
              <div className={`p-4 rounded-2xl border ${
                droneClearance.windPassed
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Wind Velocity Limit</span>
                  <span className={`text-[10px] font-black uppercase ${droneClearance.windPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {droneClearance.windPassed ? 'PASS' : 'EXCEEDED'}
                  </span>
                </div>
                <div className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1">
                  {droneClearance.windSpd} <span className="text-xs font-sans text-slate-400">knots</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Max allowable: <strong>15 kt (28 km/h)</strong> for Micro/Small UAVs.
                </div>
              </div>

              {/* Visual Line of Sight (VLOS) Visibility */}
              <div className={`p-4 rounded-2xl border ${
                droneClearance.visPassed
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">VLOS Flight Visibility</span>
                  <span className={`text-[10px] font-black uppercase ${droneClearance.visPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {droneClearance.visPassed ? 'PASS' : 'BELOW MIN'}
                  </span>
                </div>
                <div className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1">
                  {(droneClearance.visM / 1000).toFixed(1)} <span className="text-xs font-sans text-slate-400">km</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Statutory minimum: <strong>3,000 meters</strong> for visual orientation.
                </div>
              </div>

              {/* Cloud Base / Max Ceiling */}
              <div className={`p-4 rounded-2xl border ${
                droneClearance.ceilingPassed
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Ceiling Clearance</span>
                  <span className={`text-[10px] font-black uppercase ${droneClearance.ceilingPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {droneClearance.ceilingPassed ? 'PASS' : 'LOW CLOUD'}
                  </span>
                </div>
                <div className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1">
                  {droneClearance.ceilingFt >= 9999 ? 'Clear' : `${droneClearance.ceilingFt} ft`}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Max legal ceiling: <strong>400 ft AGL</strong> (Must stay clear of clouds).
                </div>
              </div>

              {/* Precipitation & Lightning Risk */}
              <div className={`p-4 rounded-2xl border ${
                droneClearance.weatherPassed
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Precipitation &amp; Storm</span>
                  <span className={`text-[10px] font-black uppercase ${droneClearance.weatherPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {droneClearance.weatherPassed ? 'CLEAR' : 'HAZARD'}
                  </span>
                </div>
                <div className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1">
                  {droneClearance.hasRainOrStorm ? 'Rain / Storm' : 'Nil Significant'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Flight prohibited in rain, convective gusts, or active lightning.
                </div>
              </div>
            </div>
          </div>

          {/* ─── 7. Nearest Safe Alternate Aerodromes (Diversion Contingencies) ─ */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>Nearest Alternate Aerodromes (Emergency Diversion Matrix)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Calculated great-circle nautical distance from {airportMeta.icao} ({airportMeta.city}) to designated commercial and civil diversion hubs.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                ICAO Annex 6 Contingency
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {alternateAirports.map(alt => (
                <div
                  key={alt.icao}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-slate-900 dark:text-white text-base">
                          {alt.icao}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          {alt.iata}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                        {alt.distanceNm} NM <span className="text-slate-400 font-normal">({alt.distanceKm} km)</span>
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                      {alt.city}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {alt.state} • Elev: {alt.elevation}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIcao(alt.icao)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>Inspect Aerodrome</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AviationPage
