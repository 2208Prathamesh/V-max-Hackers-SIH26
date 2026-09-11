import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Building,
  CloudRain,
  Droplets,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  PhoneCall,
  MapPin,
  RefreshCw,
  Sliders,
  Car,
  Bike,
  Bus,
  Footprints,
  Info,
  Send,
  Clock,
  Gauge,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Radio,
  Check,
  Compass,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Waves
} from 'lucide-react'
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  BarChart
} from 'recharts'
import { useWeather } from '../context/WeatherContext'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import api from '../services/api'

// ─── 20 Flood-Prone Indian Metropolitan Basins ───────────────────────────────
export const ALL_FLOOD_CITIES = [
  { id: 'mumbai', label: 'Mumbai', state: 'Maharashtra', isCoastal: true, defaultHotspot: 'Hindmata' },
  { id: 'delhi', label: 'Delhi', state: 'NCT Delhi', isCoastal: false, defaultHotspot: 'Minto Bridge' },
  { id: 'bengaluru', label: 'Bengaluru', state: 'Karnataka', isCoastal: false, defaultHotspot: 'Silk Board' },
  { id: 'pune', label: 'Pune', state: 'Maharashtra', isCoastal: false, defaultHotspot: 'Sinhagad Road' },
  { id: 'chennai', label: 'Chennai', state: 'Tamil Nadu', isCoastal: true, defaultHotspot: 'Velachery' },
  { id: 'kolkata', label: 'Kolkata', state: 'West Bengal', isCoastal: true, defaultHotspot: 'Salt Lake' },
  { id: 'hyderabad', label: 'Hyderabad', state: 'Telangana', isCoastal: false, defaultHotspot: 'Tolichowki' },
  { id: 'ahmedabad', label: 'Ahmedabad', state: 'Gujarat', isCoastal: false, defaultHotspot: 'Akhbarnagar Subway' },
  { id: 'surat', label: 'Surat', state: 'Gujarat', isCoastal: true, defaultHotspot: 'Adajan' },
  { id: 'guwahati', label: 'Guwahati', state: 'Assam', isCoastal: false, defaultHotspot: 'Anil Nagar' },
  { id: 'patna', label: 'Patna', state: 'Bihar', isCoastal: false, defaultHotspot: 'Rajendra Nagar' },
  { id: 'kochi', label: 'Kochi', state: 'Kerala', isCoastal: true, defaultHotspot: 'MG Road' },
  { id: 'nagpur', label: 'Nagpur', state: 'Maharashtra', isCoastal: false, defaultHotspot: 'Pardi Flyover Service' },
  { id: 'nashik', label: 'Nashik', state: 'Maharashtra', isCoastal: false, defaultHotspot: 'Ramkund Godavari' },
  { id: 'lucknow', label: 'Lucknow', state: 'Uttar Pradesh', isCoastal: false, defaultHotspot: 'Hazratganj Lowlands' },
  { id: 'srinagar', label: 'Srinagar', state: 'Jammu & Kashmir', isCoastal: false, defaultHotspot: 'Rajbagh Jhelum' },
  { id: 'bhubaneswar', label: 'Bhubaneswar', state: 'Odisha', isCoastal: true, defaultHotspot: 'Acharya Vihar Underpass' },
  { id: 'jaipur', label: 'Jaipur', state: 'Rajasthan', isCoastal: false, defaultHotspot: 'MI Road' },
  { id: 'indore', label: 'Indore', state: 'Madhya Pradesh', isCoastal: false, defaultHotspot: 'Khan River Riverfront' },
  { id: 'bhopal', label: 'Bhopal', state: 'Madhya Pradesh', isCoastal: false, defaultHotspot: 'Karond Railway Underpass' }
]

// ─── Municipal Disaster Control Helplines ─────────────────────────────────────
export const CITY_HELPLINES = {
  mumbai: { authority: 'MCGM Disaster Control', phone: '1916', desc: 'Brihanmumbai Municipal Corporation 24x7 Control Desk' },
  delhi: { authority: 'NDMC / DDMA Helpline', phone: '1077', desc: 'Delhi Disaster Management Authority Emergency' },
  bengaluru: { authority: 'BBMP Disaster Control', phone: '1533', desc: 'Bruhat Bengaluru Mahanagara Palike War Room' },
  pune: { authority: 'PMC Disaster Cell', phone: '020-25501269', desc: 'Pune Municipal Corporation Emergency Cell' },
  chennai: { authority: 'Greater Chennai Corp', phone: '1913', desc: 'GCC Flood & Stormwater Drainage Control' },
  kolkata: { authority: 'KMC Disaster Helpline', phone: '033-22861212', desc: 'Kolkata Municipal Corporation Control Room' },
  hyderabad: { authority: 'GHMC Disaster Cell', phone: '040-21111111', desc: 'Greater Hyderabad Municipal Control' },
  ahmedabad: { authority: 'AMC Emergency Control', phone: '079-25391811', desc: 'Ahmedabad Municipal Corporation Flood Control' },
  surat: { authority: 'SMC Flood Control', phone: '0261-2423751', desc: 'Surat Municipal Corporation Emergency Room' },
  guwahati: { authority: 'GMC Flood Helpline', phone: '1077', desc: 'Guwahati Municipal & ASDMA Control' },
  patna: { authority: 'Patna Municipal Control', phone: '1800-3456-644', desc: 'PMC Stormwater Sump & Drainage' },
  kochi: { authority: 'Kochi Corp Disaster Cell', phone: '0484-2369007', desc: 'Cochin Municipal Corporation Control' },
  nagpur: { authority: 'NMC Control Room', phone: '0712-2567011', desc: 'Nagpur Municipal Corporation Emergency' },
  nashik: { authority: 'NMC Flood Cell', phone: '0253-2578206', desc: 'Nashik Municipal Disaster Cell' },
  lucknow: { authority: 'LMC Relief Room', phone: '0522-2615195', desc: 'Lucknow Municipal Flood Control' },
  srinagar: { authority: 'SMC Flood Helpline', phone: '0194-2474499', desc: 'Srinagar Municipal Corporation Flood Room' },
  bhubaneswar: { authority: 'BMC Control Room', phone: '1929', desc: 'Bhubaneswar Municipal Corporation' },
  jaipur: { authority: 'JMC Disaster Cell', phone: '0141-2742900', desc: 'Jaipur Nagar Nigam Emergency Cell' },
  indore: { authority: 'IMC Control Room', phone: '0731-2535555', desc: 'Indore Municipal Disaster Room' },
  bhopal: { authority: 'BMC Emergency Cell', phone: '0755-2540220', desc: 'Bhopal Municipal Corporation Helpline' }
}

// ─── Alternate Bypass Corridor Recommendations for Hotspots ──────────────────
const HOTSPOT_BYPASS_MAP = {
  'Hindmata': 'Take Dr. Babasaheb Ambedkar Flyover upper deck directly to Dadar; avoid lower service lane.',
  'Sion-Matunga': 'Divert via Eastern Freeway or Wadala Monorail corridor; avoid Gandhi Market junction.',
  'Andheri Subway': 'Use Gopal Krishna Gokhale Bridge (reopened) or Milan Subway elevated connector.',
  'Dadar': 'Take Senapati Bapat Marg elevated road or Tilak Bridge towards Matunga.',
  'King Circle': 'Divert via Eastern Express Highway via Priyadarshini Circle bypass.',
  'Minto Bridge': 'Divert via Connaught Place Outer Circle, Deen Dayal Upadhyaya Marg, or Barakhamba Road.',
  'ITO': 'Use Vikas Marg elevated lanes or Ring Road bypass towards Sarai Kale Khan.',
  'Silk Board': 'Use Electronic City Elevated Tollway or HSR Layout 27th Main inner link.',
  'Outer Ring Road': 'Use Old Airport Road or Sarjapur-Bellandur interior link roads.',
  'Sinhagad Road': 'Divert via Paud Road or Katraj-Dehu Road Bypass away from Mutha basin.',
  'Velachery': 'Use Taramani 100 Feet Road or OMR Elevated Expressway corridor.'
}

export const UrbanFloodPage = () => {
  const { addToast } = useWeather()
  const { isDark } = useTheme()
  const { language } = useLanguage()

  // State
  const [floodCity, setFloodCity] = useState('mumbai')
  const [floodMode, setFloodMode] = useState('live') // 'live' | 'forecast' | 'monsoon_surge' | 'custom'
  const [customRainfall, setCustomRainfall] = useState(35)
  const [floodData, setFloodData] = useState(null)
  const [floodLoading, setFloodLoading] = useState(false)
  const [selectedTransitMode, setSelectedTransitMode] = useState('car') // 'foot' | 'bike' | 'car' | 'bus'
  const [activeHotspotFilter, setActiveHotspotFilter] = useState('all') // 'all' | 'Critical' | 'Severe' | 'Moderate'
  const [selectedRouteHotspot, setSelectedRouteHotspot] = useState('')
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'hotspots' | 'infrastructure' | 'citizen_reports' | 'hydrology'

  // Crowdsourced incident report modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportSpot, setReportSpot] = useState('')
  const [reportDepth, setReportDepth] = useState('ankle') // 'ankle' | 'knee' | 'waist'
  const [reportNotes, setReportNotes] = useState('')
  const [crowdsourcedReports, setCrowdsourcedReports] = useState([
    {
      id: 1,
      city: 'mumbai',
      location: 'Hindmata Junction Flyover Service Road',
      depth: 'Knee level (~35 cm)',
      status: 'Traffic completely halted, BEST buses diverting over flyover',
      time: '14 mins ago',
      verified: true
    },
    {
      id: 2,
      city: 'mumbai',
      location: 'Sion Matunga Gandhi Market',
      depth: 'Ankle level (~15 cm)',
      status: 'Water receding gradually as municipal pumps run at capacity',
      time: '38 mins ago',
      verified: true
    },
    {
      id: 3,
      city: 'delhi',
      location: 'Minto Bridge Railway Underpass',
      depth: 'Waist level (~65 cm)',
      status: 'Automatic barricades engaged, traffic diverted to Connaught Place',
      time: '25 mins ago',
      verified: true
    }
  ])

  // Load telemetry from API
  const loadFlood = useCallback(async () => {
    try {
      setFloodLoading(true)
      const rainParam = floodMode === 'custom' ? customRainfall : null
      const res = await api.getUrbanFloodIndex(floodCity, rainParam, floodMode)
      if (res && (res.data || res.success)) {
        setFloodData(res.data || res)
      }
    } catch (err) {
      console.warn('Urban flood fetch failed:', err.message)
      addToast?.('Failed to load urban flood telemetry', 'error')
    } finally {
      setFloodLoading(false)
    }
  }, [floodCity, floodMode, customRainfall, addToast])

  useEffect(() => {
    loadFlood()
  }, [loadFlood])

  // Current active city object
  const currentCityObj = useMemo(() => {
    return ALL_FLOOD_CITIES.find(c => c.id === floodCity) || ALL_FLOOD_CITIES[0]
  }, [floodCity])

  // Generate 12-Hour Hydrodynamic Projection data for Recharts
  const projectionData = useMemo(() => {
    if (!floodData) return []
    const nowHour = new Date().getHours()
    const currentRain = floodData.rainfallIntensityMmh || 0
    const drainCap = floodData.drainageCapacityMmh || 25
    const runoffCoeff = floodData.runoffCoefficient || 0.8
    const elevFactor = 1.25

    return Array.from({ length: 12 }, (_, i) => {
      const h = (nowHour + i) % 24
      const timeLabel = i === 0 ? 'Now' : `${h.toString().padStart(2, '0')}:00`
      const variance = Math.sin((i / 11) * Math.PI) * 1.3
      const rainVal = Math.max(0, Math.round((currentRain * (0.8 + variance)) * 10) / 10)
      const runoffVal = Math.round(rainVal * runoffCoeff * elevFactor * 10) / 10
      const satRatio = rainVal > 0 ? Math.round((runoffVal / drainCap) * 100) : 0
      const waterlogDepth = satRatio > 100 ? Math.round(((satRatio / 100) - 1) * drainCap * 0.4) : 0

      return {
        time: timeLabel,
        rainfall: rainVal,
        runoff: runoffVal,
        capacity: drainCap,
        saturation: satRatio,
        depth: waterlogDepth
      }
    })
  }, [floodData])

  // Catchment Water Balance Breakdown Data
  const catchmentBalanceData = useMemo(() => {
    if (!floodData) return []
    const rain = floodData.rainfallIntensityMmh || 20
    const runoff = floodData.computedRunoff || 16
    const drainCap = floodData.drainageCapacityMmh || 25
    const perviousInfiltration = Math.max(0, Math.round((rain - (runoff / 1.25)) * 10) / 10)
    const excessPonding = Math.max(0, Math.round((runoff - drainCap) * 10) / 10)

    return [
      { name: 'Atmospheric Rain', value: rain, fill: '#38BDF8' },
      { name: 'Soil Percolation', value: perviousInfiltration, fill: '#10B981' },
      { name: 'Surface Runoff Q', value: runoff, fill: '#F59E0B' },
      { name: 'Drain Capacity', value: drainCap, fill: '#6366F1' },
      { name: 'Ponding Sump', value: excessPonding, fill: '#EF4444' }
    ]
  }, [floodData])

  // Filtered hotspots list
  const filteredHotspots = useMemo(() => {
    if (!floodData?.allHotspots) return []
    if (activeHotspotFilter === 'all') return floodData.allHotspots
    return floodData.allHotspots.filter(h => h.risk === activeHotspotFilter)
  }, [floodData, activeHotspotFilter])

  // Calculate recession / time-to-drain estimate in hours
  const recessionHours = useMemo(() => {
    if (!floodData || !floodData.estimatedWaterlogDepthCm || floodData.estimatedWaterlogDepthCm === 0) return 0
    const depth = floodData.estimatedWaterlogDepthCm
    const drainRateCmPerHour = (floodData.drainageCapacityMmh / 10) * 1.2
    return Math.max(0.3, Math.round((depth / drainRateCmPerHour) * 10) / 10)
  }, [floodData])

  // Handle citizen incident submission
  const handleReportSubmit = (e) => {
    e.preventDefault()
    if (!reportSpot.trim()) return

    const depthText = reportDepth === 'ankle' ? 'Ankle level (~15 cm)' : reportDepth === 'knee' ? 'Knee level (~35 cm)' : 'Waist level (~65 cm)'
    const newReport = {
      id: Date.now(),
      city: floodCity,
      location: reportSpot.trim(),
      depth: depthText,
      status: reportNotes.trim() || 'Citizen reported live waterlogging event',
      time: 'Just now',
      verified: false
    }

    setCrowdsourcedReports(prev => [newReport, ...prev])
    setIsReportModalOpen(false)
    setReportSpot('')
    setReportNotes('')
    addToast?.('Your waterlogging report has been submitted to municipal telemetry desk', 'success')
  }

  // Active severity helpers
  const severityColor = floodData?.saturation?.color || '#22c55e'
  const isCritical = floodData?.saturation?.level === 'Critical Inundation'
  const isSevere = floodData?.saturation?.level === 'Severe'
  const isAdvisory = floodData?.saturation?.level === 'Advisory'
  const isElevated = isCritical || isSevere

  // User Transit Feasibility evaluator based on water depth
  const currentDepth = floodData?.estimatedWaterlogDepthCm || 0
  const transitEvaluation = useMemo(() => {
    if (selectedTransitMode === 'foot') {
      if (currentDepth > 15) return { status: 'Danger', badgeClass: 'bg-rose-500 text-white', text: 'Impassable on foot — flowing water over 15 cm carries knock-down & hidden open manhole risk.' }
      if (currentDepth > 5) return { status: 'Caution', badgeClass: 'bg-amber-500 text-slate-950', text: 'Shallow puddles. Wear gumboots; watch for submerged curbs and open drains.' }
      return { status: 'Safe', badgeClass: 'bg-emerald-500 text-white', text: 'Safe for walking. Normal sidewalk conditions.' }
    }
    if (selectedTransitMode === 'bike') {
      if (currentDepth > 15) return { status: 'Danger', badgeClass: 'bg-rose-500 text-white', text: 'High stall & skid hazard. Water will enter exhaust pipe and submerge carburettor/battery.' }
      if (currentDepth > 8) return { status: 'Caution', badgeClass: 'bg-amber-500 text-slate-950', text: 'Drive slow in 1st gear. Maintain throttle to prevent water back-suction into exhaust.' }
      return { status: 'Passable', badgeClass: 'bg-emerald-500 text-white', text: 'Road traction normal. Safe for two-wheelers and autos.' }
    }
    if (selectedTransitMode === 'car') {
      if (currentDepth > 20) return { status: 'Danger', badgeClass: 'bg-rose-500 text-white', text: 'CRITICAL: Engine hydro-lock danger. Low sedans and hatchbacks will float and stall.' }
      if (currentDepth > 12) return { status: 'Caution', badgeClass: 'bg-amber-500 text-slate-950', text: 'Proceed only if necessary in low gear. Do not stop inside standing water pools.' }
      return { status: 'Passable', badgeClass: 'bg-emerald-500 text-white', text: 'Clear road surface. Normal sedan/hatchback clearance.' }
    }
    // SUV / Bus
    if (currentDepth > 35) return { status: 'Severe Caution', badgeClass: 'bg-rose-500 text-white', text: 'Deep waterlogging in underpasses. High clearance vehicles only; do not enter flooded subways.' }
    if (currentDepth > 18) return { status: 'Slow Transit', badgeClass: 'bg-amber-500 text-slate-950', text: 'Heavy vehicles can pass at slow crawl to prevent creating tidal wakes into roadside shops.' }
    return { status: 'Open', badgeClass: 'bg-emerald-500 text-white', text: 'Public transit & heavy vehicles running on scheduled routes.' }
  }, [selectedTransitMode, currentDepth])

  return (
    <div className='max-w-7xl mx-auto space-y-6 pb-20 px-3 sm:px-6 pt-4'>
      {/* =======================================================================
          1. CITIZEN-FIRST TOP HEADER (Proper Light & Dark Theme Support)
          ======================================================================= */}
      <div className='rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors'>
        {/* Top Badges & Controls */}
        <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
          <div className='space-y-1.5'>
            <div className='flex items-center gap-2 flex-wrap'>
              <span className='px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5'>
                <Radio className='w-3 h-3 text-blue-600 dark:text-sky-400 animate-pulse' />
                SIH PS 26068 Urban Hydro-Telemetry
              </span>
              <span className='px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono'>
                Q = C × I × A Engine
              </span>
              {currentCityObj.isCoastal && (
                <span className='px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1'>
                  <Waves className='w-3 h-3' /> Coastal Basin
                </span>
              )}
            </div>

            <h1 className='text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5'>
              <Building className='w-7 h-7 text-blue-600 dark:text-sky-400' />
              <span>Urban Flash Flood &amp; Drainage Portal</span>
            </h1>

            <p className='text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed'>
              Real-time drainage saturation monitoring, floodwater depth calculations, and safe commuter bypass
              routes across 20 major Indian metropolitan basins.
            </p>
          </div>

          <div className='flex items-center gap-2 flex-wrap'>
            <button
              type='button'
              onClick={() => setIsReportModalOpen(true)}
              className='px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95'
            >
              <AlertTriangle className='w-3.5 h-3.5 text-slate-950' />
              <span>Report Flooded Street</span>
            </button>
            <button
              type='button'
              onClick={loadFlood}
              disabled={floodLoading}
              className='px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50'
              title='Refresh Telemetry'
            >
              <RefreshCw className={`w-3.5 h-3.5 ${floodLoading ? 'animate-spin text-blue-600 dark:text-sky-400' : ''}`} />
              <span>{floodLoading ? 'Updating...' : 'Sync Telemetry'}</span>
            </button>
          </div>
        </div>

        {/* Basin Selector Bar */}
        <div className='space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800'>
          <div className='flex items-center justify-between gap-2 flex-wrap'>
            <span className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
              Select Metro Basin ({ALL_FLOOD_CITIES.length} Monitored):
            </span>
            <select
              value={floodCity}
              onChange={(e) => setFloodCity(e.target.value)}
              className='px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              {ALL_FLOOD_CITIES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.label} ({c.state})
                </option>
              ))}
            </select>
          </div>

          <div className='flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none'>
            {ALL_FLOOD_CITIES.slice(0, 10).map((c) => {
              const active = floodCity === c.id
              return (
                <button
                  key={c.id}
                  type='button'
                  onClick={() => setFloodCity(c.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}
                >
                  <MapPin className={`w-3 h-3 inline mr-1 ${active ? 'text-white' : 'text-blue-500'}`} />
                  {c.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Telemetry Stream Modes & Simulator */}
        <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs'>
          <div className='flex items-center gap-1.5 flex-wrap'>
            <span className='font-bold text-slate-500 dark:text-slate-400 mr-1'>Mode:</span>
            <button
              type='button'
              onClick={() => setFloodMode('live')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer border ${
                floodMode === 'live'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              📡 Live Doppler Telemetry
            </button>
            <button
              type='button'
              onClick={() => setFloodMode('forecast')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer border ${
                floodMode === 'forecast'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              🔮 Next 6h Storm Peak
            </button>
            <button
              type='button'
              onClick={() => setFloodMode('monsoon_surge')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer border ${
                floodMode === 'monsoon_surge'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              ⛈️ Cloudburst Stress Test (55 mm/h)
            </button>
            <button
              type='button'
              onClick={() => setFloodMode('custom')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer border ${
                floodMode === 'custom'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              🎛️ Custom Rainfall Slider
            </button>
          </div>

          {/* Interactive Rainfall Slider if in Custom Mode */}
          {floodMode === 'custom' && (
            <div className='flex items-center gap-3 bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700'>
              <Sliders className='w-4 h-4 text-amber-500 shrink-0' />
              <div className='flex items-center gap-2'>
                <span className='font-bold text-slate-700 dark:text-slate-300'>Simulate Rain:</span>
                <input
                  type='range'
                  min='5'
                  max='120'
                  step='5'
                  value={customRainfall}
                  onChange={(e) => setCustomRainfall(Number(e.target.value))}
                  className='w-28 sm:w-36 accent-blue-600 cursor-pointer'
                />
                <span className='font-black text-slate-900 dark:text-white font-mono min-w-[55px]'>
                  {customRainfall} mm/h
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =======================================================================
          2. CITIZEN "AT-A-GLANCE" STATUS BANNER
          ======================================================================= */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        isCritical
          ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
          : isSevere
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
            : isAdvisory
              ? 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900/50 text-sky-900 dark:text-sky-200'
              : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200'
      }`}>
        <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
          <div className='flex items-start gap-3'>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              isCritical
                ? 'bg-rose-600 text-white'
                : isSevere
                  ? 'bg-amber-500 text-slate-950'
                  : isAdvisory
                    ? 'bg-sky-600 text-white'
                    : 'bg-emerald-600 text-white'
            }`}>
              {isCritical ? <AlertTriangle className='w-5 h-5' /> : isSevere ? <ShieldAlert className='w-5 h-5' /> : <ShieldCheck className='w-5 h-5' />}
            </div>
            <div>
              <div className='flex items-center gap-2 flex-wrap'>
                <span className='font-black text-base sm:text-lg'>
                  {floodData?.city || currentCityObj.label}: {floodData?.saturation?.level || 'Normal'}
                </span>
                <span className='px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/10 dark:bg-white/10'>
                  {floodData?.saturationRatio || 0}x Designed Capacity
                </span>
              </div>
              <p className='text-xs sm:text-sm mt-0.5 opacity-90 leading-relaxed font-medium'>
                {floodData?.saturation?.description || 'Drainage networks operating normally. No significant street ponding detected.'}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2 shrink-0'>
            {CITY_HELPLINES[floodCity]?.phone && (
              <a
                href={`tel:${CITY_HELPLINES[floodCity].phone.replace(/[^0-9]/g, '')}`}
                className='px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs'
              >
                <PhoneCall className='w-3.5 h-3.5' />
                <span>Call {CITY_HELPLINES[floodCity].phone}</span>
              </a>
            )}
            <a
              href='tel:1078'
              className='px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-50 transition'
            >
              NDRF 1078
            </a>
          </div>
        </div>
      </div>

      {/* =======================================================================
          3. USER TRANSIT ADVISOR (Walking, Bike, Car, SUV)
          ======================================================================= */}
      <div className='p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
          <div>
            <h3 className='text-base font-bold text-slate-900 dark:text-white flex items-center gap-2'>
              <Compass className='w-4 h-4 text-blue-600 dark:text-blue-400' />
              <span>Commute Passage Clearance: How are you travelling?</span>
            </h3>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Instant safety and mechanical risk evaluation based on estimated inundation depth ({currentDepth} cm):
            </p>
          </div>
        </div>

        {/* Transit Mode Selector Buttons */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-2.5'>
          {[
            { id: 'foot', label: 'Walking on Foot', icon: Footprints },
            { id: 'bike', label: '2-Wheeler / Auto', icon: Bike },
            { id: 'car', label: 'Sedan / Hatchback', icon: Car },
            { id: 'bus', label: 'SUV / Bus / Transit', icon: Bus }
          ].map(mode => {
            const Icon = mode.icon
            const active = selectedTransitMode === mode.id
            return (
              <button
                key={mode.id}
                type='button'
                onClick={() => setSelectedTransitMode(mode.id)}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                }`}
              >
                <Icon className='w-5 h-5' />
                <span className='text-xs font-bold'>{mode.label}</span>
              </button>
            )
          })}
        </div>

        {/* Active Mode Evaluation Card */}
        <div className='p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs'>
          <div className='flex items-start gap-3'>
            <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shrink-0 ${transitEvaluation.badgeClass}`}>
              {transitEvaluation.status}
            </span>
            <p className='text-slate-700 dark:text-slate-300 font-medium leading-relaxed'>
              {transitEvaluation.text}
            </p>
          </div>
          <div className='text-[11px] text-slate-500 dark:text-slate-400 shrink-0 font-mono'>
            Current Road Sump: <strong className='text-slate-900 dark:text-white font-bold'>{currentDepth} cm</strong>
          </div>
        </div>
      </div>

      {/* =======================================================================
          4. CORE TELEMETRY METRIC TILES
          ======================================================================= */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Metric 1: Drainage Saturation */}
        <div className='p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5'>
          <div className='flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
            <span>Drain Saturation</span>
            <Gauge className='w-4 h-4 text-blue-600 dark:text-blue-400' />
          </div>
          <div className='flex items-baseline gap-2'>
            <span className='text-2xl font-black' style={{ color: severityColor }}>
              {floodData?.saturation?.level || 'Normal'}
            </span>
          </div>
          <div className='w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden'>
            <div
              className='h-full rounded-full transition-all duration-700'
              style={{
                width: `${Math.min(100, (floodData?.saturationRatio || 0.2) * 50)}%`,
                backgroundColor: severityColor
              }}
            />
          </div>
          <div className='text-[11px] font-semibold text-slate-500 dark:text-slate-400'>
            Ratio: <strong className='text-slate-900 dark:text-white font-mono'>{floodData?.saturationRatio || 0}x</strong> design limit
          </div>
        </div>

        {/* Metric 2: Surface Runoff Rate */}
        <div className='p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5'>
          <div className='flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
            <span>Surface Runoff (Q)</span>
            <Droplets className='w-4 h-4 text-amber-500' />
          </div>
          <div className='flex items-baseline gap-1'>
            <span className='text-3xl font-black text-slate-900 dark:text-white font-mono'>
              {floodData?.computedRunoff || 0}
            </span>
            <span className='text-xs font-bold text-slate-400 font-mono'>mm/hr</span>
          </div>
          <div className='text-[11px] font-semibold text-slate-500 dark:text-slate-400'>
            Designed Drain Cap: <strong className='text-slate-700 dark:text-slate-300 font-mono'>{floodData?.drainageCapacityMmh || 25} mm/hr</strong>
          </div>
        </div>

        {/* Metric 3: Waterlog Depth */}
        <div className='p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5'>
          <div className='flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
            <span>Waterlog Depth</span>
            <Layers className='w-4 h-4 text-indigo-500' />
          </div>
          <div className='flex items-baseline gap-1'>
            <span className={`text-3xl font-black font-mono ${currentDepth > 15 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {currentDepth}
            </span>
            <span className='text-xs font-bold text-slate-400 font-mono'>cm</span>
          </div>
          <div className='text-[11px] font-semibold text-slate-500 dark:text-slate-400'>
            {currentDepth > 25 ? '🚨 Vehicle stalling risk' : currentDepth > 10 ? '⚠️ Slow traffic ponding' : '✅ Road surface dry'}
          </div>
        </div>

        {/* Metric 4: Recession Time */}
        <div className='p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5'>
          <div className='flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
            <span>Clearance Window</span>
            <Clock className='w-4 h-4 text-emerald-500' />
          </div>
          <div className='flex items-baseline gap-1'>
            <span className='text-3xl font-black text-slate-900 dark:text-white font-mono'>
              {recessionHours > 0 ? recessionHours : '< 0.5'}
            </span>
            <span className='text-xs font-bold text-slate-400 font-mono'>hours</span>
          </div>
          <div className='text-[11px] font-semibold text-slate-500 dark:text-slate-400'>
            Estimated time to clear water once downpour stops
          </div>
        </div>
      </div>

      {/* =======================================================================
          5. ANALYSIS NAVIGATION TABS
          ======================================================================= */}
      <div className='flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none pb-1 text-xs sm:text-sm font-bold'>
        {[
          { id: 'overview', label: 'Hydrodynamic Visualizations', icon: TrendingUp },
          { id: 'hotspots', label: `Hotspot Matrix & Bypasses (${floodData?.allHotspots?.length || 0})`, icon: MapPin },
          { id: 'infrastructure', label: 'Pumps & Tidal Sluice Gates', icon: Gauge },
          { id: 'citizen_reports', label: `Citizen Incident Feed (${crowdsourcedReports.length})`, icon: ShieldAlert },
          { id: 'hydrology', label: 'Rational Runoff Mechanics', icon: Info }
        ].map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type='button'
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0 border-b-2 ${
                active
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/20'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className='w-4 h-4' />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* =======================================================================
          TAB 1: HYDRODYNAMIC CHARTS & ROUTE ADVISOR
          ======================================================================= */}
      {activeTab === 'overview' && (
        <div className='space-y-6'>
          {/* Main Chart: 12-Hour Hydrograph */}
          <div className='p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
              <div>
                <h3 className='text-base font-bold text-slate-900 dark:text-white flex items-center gap-2'>
                  <TrendingUp className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                  <span>12-Hour Storm Progression &amp; Drainage Saturation Hydrograph</span>
                </h3>
                <p className='text-xs text-slate-500 dark:text-slate-400'>
                  Hourly projection of precipitation vs municipal stormwater design limit ({floodData?.drainageCapacityMmh || 25} mm/h)
                </p>
              </div>
              <div className='flex items-center gap-3 text-xs'>
                <span className='flex items-center gap-1 text-slate-600 dark:text-slate-300'>
                  <span className='w-3 h-3 rounded-xs bg-sky-400 inline-block' /> Rain (mm/h)
                </span>
                <span className='flex items-center gap-1 text-slate-600 dark:text-slate-300'>
                  <span className='w-3 h-3 rounded-xs bg-amber-500 inline-block' /> Runoff Q
                </span>
                <span className='flex items-center gap-1 text-slate-600 dark:text-slate-300'>
                  <span className='w-3 h-0.5 bg-rose-500 inline-block' /> Drain Limit
                </span>
              </div>
            </div>

            <div className='h-72 w-full pt-2'>
              <ResponsiveContainer width='100%' height='100%'>
                <ComposedChart data={projectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id='rainGradient' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#38bdf8' stopOpacity={0.8} />
                      <stop offset='95%' stopColor='#38bdf8' stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id='runoffGradient' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#f59e0b' stopOpacity={0.8} />
                      <stop offset='95%' stopColor='#f59e0b' stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey='time' stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                  <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#cbd5e1',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: isDark ? '#f8fafc' : '#0f172a'
                    }}
                  />
                  <ReferenceLine
                    y={floodData?.drainageCapacityMmh || 25}
                    stroke='#ef4444'
                    strokeDasharray='4 4'
                    strokeWidth={2}
                    label={{ value: `Max Limit (${floodData?.drainageCapacityMmh || 25} mm/h)`, fill: '#ef4444', fontSize: 10, position: 'top' }}
                  />
                  <Bar dataKey='rainfall' name='Precipitation (mm/h)' fill='url(#rainGradient)' radius={[4, 4, 0, 0]} barSize={20} />
                  <Area type='monotone' dataKey='runoff' name='Runoff (mm/h)' stroke='#f59e0b' fill='url(#runoffGradient)' strokeWidth={2} />
                  <Line type='monotone' dataKey='depth' name='Depth (cm)' stroke='#8b5cf6' strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Catchment Dynamics & Hotspot Bypass Corridor Dual View */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Catchment Balance */}
            <div className='p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4'>
              <h4 className='text-base font-bold text-slate-900 dark:text-white flex items-center gap-2'>
                <Droplets className='w-4 h-4 text-sky-500' />
                <span>Urban Catchment Mass Balance (mm/hr)</span>
              </h4>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                Rational Runoff allocation: Pervious percolation vs discharge bottlenecks in {floodData?.city || currentCityObj.label}
              </p>
              <div className='h-60 w-full pt-1'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={catchmentBalanceData} layout='vertical' margin={{ top: 5, right: 20, left: 35, bottom: 5 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke={isDark ? '#334155' : '#e2e8f0'} />
                    <XAxis type='number' stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                    <YAxis dataKey='name' type='category' stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} width={115} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                        borderColor: isDark ? '#334155' : '#cbd5e1',
                        borderRadius: '0.75rem',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey='value' name='mm/hr Volume' radius={[0, 6, 6, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Route & Alternate Bypass Corridor Advisor */}
            <div className='p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4'>
              <h4 className='text-base font-bold text-slate-900 dark:text-white flex items-center gap-2'>
                <Car className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                <span>Commuter Underpass &amp; Elevated Bypass Finder</span>
              </h4>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                Select your vulnerable commute bottleneck to view live passage and safe detour routes:
              </p>

              <div className='space-y-3 pt-1'>
                <select
                  value={selectedRouteHotspot || floodData?.allHotspots?.[0]?.area || ''}
                  onChange={(e) => setSelectedRouteHotspot(e.target.value)}
                  className='w-full px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  {floodData?.allHotspots?.map((h, i) => (
                    <option key={i} value={h.area}>
                      {h.area} — Risk: {h.risk}
                    </option>
                  ))}
                </select>

                {(() => {
                  const currentSpot = floodData?.allHotspots?.find(
                    h => h.area === (selectedRouteHotspot || floodData?.allHotspots?.[0]?.area)
                  ) || floodData?.allHotspots?.[0]

                  const bypassText = HOTSPOT_BYPASS_MAP[currentSpot?.area] || `Divert via upper arterial highway avoiding lower ${currentSpot?.area} depression.`

                  return (
                    <div className='space-y-3 pt-1'>
                      <div className='p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-2'>
                        <div className='flex items-center justify-between'>
                          <span className='font-black text-slate-900 dark:text-white'>{currentSpot?.area}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            currentSpot?.risk === 'Critical' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          }`}>
                            {currentSpot?.risk} Vulnerability
                          </span>
                        </div>
                        <p className='text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed'>{currentSpot?.reason}</p>

                        <div className='pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2 text-blue-700 dark:text-sky-300 font-bold'>
                          <Compass className='w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-sky-400' />
                          <span>Recommended Bypass: {bypassText}</span>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 2: VULNERABLE HOTSPOT MATRIX & DETAILS
          ======================================================================= */}
      {activeTab === 'hotspots' && (
        <div className='space-y-5'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm'>
            <div>
              <h3 className='text-base font-bold text-slate-900 dark:text-white'>
                Monitored Flood Inundation Zones in {floodData?.city || currentCityObj.label}
              </h3>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                Known topographical depressions, railway underpasses, and river floodplain corridors.
              </p>
            </div>
            <div className='flex items-center gap-1.5'>
              {['all', 'Critical', 'Severe', 'Moderate'].map(f => (
                <button
                  key={f}
                  type='button'
                  onClick={() => setActiveHotspotFilter(f)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    activeHotspotFilter === f
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {f === 'all' ? 'All Zones' : f}
                </button>
              ))}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filteredHotspots.map((h, idx) => {
              const isCrit = h.risk === 'Critical'
              const isSev = h.risk === 'Severe'
              const bypassRoute = HOTSPOT_BYPASS_MAP[h.area] || `Elevated arterial bypass corridor avoiding ${h.area} depression.`

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all hover:shadow-md space-y-3 ${
                    isCrit
                      ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                      : isSev
                        ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className='flex items-center justify-between'>
                    <span className='font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5'>
                      <MapPin className={`w-4 h-4 ${isCrit ? 'text-rose-500' : isSev ? 'text-amber-500' : 'text-blue-500'}`} />
                      {h.area}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      isCrit
                        ? 'bg-rose-500 text-white'
                        : isSev
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-blue-500 text-white'
                    }`}>
                      {h.risk} Risk
                    </span>
                  </div>

                  <p className='text-xs text-slate-600 dark:text-slate-300 leading-relaxed'>
                    {h.reason}
                  </p>

                  <div className='pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1 text-xs'>
                    <div className='text-[11px] text-blue-700 dark:text-sky-300 font-bold flex items-start gap-1.5'>
                      <Compass className='w-3.5 h-3.5 shrink-0 mt-0.5' />
                      <span>Bypass: {bypassRoute}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 3: STORMWATER PUMPING STATIONS & COASTAL SLUICE GATES
          ======================================================================= */}
      {activeTab === 'infrastructure' && (
        <div className='space-y-5'>
          <div className='p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
            <div>
              <h3 className='text-base font-bold text-slate-900 dark:text-white'>
                Major Stormwater Pumping Stations &amp; Tidal Sluice Gates ({floodData?.city || currentCityObj.label})
              </h3>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                Real-time municipal pump operations and gravity discharge sluices into rivers/seas.
              </p>
            </div>
            <span className='px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'>
              All Pumping Depots Active
            </span>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {(CITY_PUMP_STATIONS[floodCity] || CITY_PUMP_STATIONS.mumbai).map((pump, idx) => (
              <div key={idx} className='p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='font-bold text-sm text-slate-900 dark:text-white'>{pump.name}</span>
                  <span className='px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'>
                    {pump.status}
                  </span>
                </div>
                <div className='grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400'>
                  <div>
                    Discharge Capacity: <strong className='text-slate-900 dark:text-white font-mono block'>{pump.capacity}</strong>
                  </div>
                  <div>
                    Active Turbines: <strong className='text-slate-900 dark:text-white font-mono block'>{pump.pumpsActive}</strong>
                  </div>
                </div>
                <div className='text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between'>
                  <span className='text-slate-500'>Sluice Gate Status:</span>
                  <span className='font-bold text-blue-600 dark:text-blue-400'>{pump.tideGate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 4: CROWDSOURCED CITIZEN WATERLOGGING FEED
          ======================================================================= */}
      {activeTab === 'citizen_reports' && (
        <div className='space-y-5'>
          <div className='p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
            <div>
              <h3 className='text-base font-bold text-slate-900 dark:text-white'>
                Live Crowdsourced Street Inundation Reports
              </h3>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                Real-time road waterlogging observations reported by citizens and motorists on the ground.
              </p>
            </div>
            <button
              type='button'
              onClick={() => setIsReportModalOpen(true)}
              className='px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer shadow-xs'
            >
              + Report Inundated Street
            </button>
          </div>

          <div className='space-y-3'>
            {crowdsourcedReports.map(rep => (
              <div
                key={rep.id}
                className='p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3'
              >
                <div className='space-y-1'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <span className='font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5'>
                      <MapPin className='w-3.5 h-3.5 text-blue-600 dark:text-blue-400' />
                      {rep.location}
                    </span>
                    <span className='px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50'>
                      {rep.depth}
                    </span>
                    {rep.verified && (
                      <span className='px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1'>
                        <Check className='w-3 h-3' /> Verified
                      </span>
                    )}
                  </div>
                  <p className='text-xs text-slate-600 dark:text-slate-300'>{rep.status}</p>
                </div>
                <div className='text-xs text-slate-400 shrink-0 font-medium'>
                  {rep.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 5: HYDROLOGICAL MECHANICS & RATIONAL RUNOFF
          ======================================================================= */}
      {activeTab === 'hydrology' && (
        <div className='p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6'>
          <div>
            <h3 className='text-lg font-black text-slate-900 dark:text-white flex items-center gap-2'>
              <Info className='w-5 h-5 text-blue-600 dark:text-blue-400' />
              <span>Civil Stormwater Hydrodynamics: The Rational Runoff Method</span>
            </h3>
            <p className='text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1'>
              Standard hydrological equation employed across Indian municipal flood risk protocols:
            </p>
          </div>

          {/* Equation Banner */}
          <div className='p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-slate-900 dark:text-white space-y-3 text-center'>
            <div className='text-2xl sm:text-3xl font-black font-mono tracking-wider text-blue-600 dark:text-blue-400 py-1'>
              Q = C × I × A × E<sub>rf</sub>
            </div>
            <p className='text-xs text-slate-600 dark:text-slate-300 max-w-xl mx-auto'>
              Calculates surface runoff volume (Q) generated per unit catchment area by multiplying soil impermeability (C),
              rainfall rate (I), and local elevation basin risk factors.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs'>
            <div className='p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700'>
              <div className='font-bold text-blue-600 dark:text-blue-400'>Q (Discharge Runoff)</div>
              <div className='text-slate-500 dark:text-slate-400 mt-0.5'>Total storm runoff in mm/hr flowing towards low-lying catchment sumps.</div>
            </div>
            <div className='p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700'>
              <div className='font-bold text-blue-600 dark:text-blue-400'>C (Impermeability)</div>
              <div className='text-slate-500 dark:text-slate-400 mt-0.5'>Asphalt and building concrete factor (0.72 – 0.85 in dense Indian cities).</div>
            </div>
            <div className='p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700'>
              <div className='font-bold text-blue-600 dark:text-blue-400'>I (Rainfall Rate)</div>
              <div className='text-slate-500 dark:text-slate-400 mt-0.5'>Real-time rainfall intensity (mm/hr) captured from live radar &amp; satellites.</div>
            </div>
            <div className='p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700'>
              <div className='font-bold text-blue-600 dark:text-blue-400'>E<sub>rf</sub> (Elevation Multiplier)</div>
              <div className='text-slate-500 dark:text-slate-400 mt-0.5'>Topographical bowl factor (1.1x to 1.45x) compounding flooding in subways.</div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          6. MUNICIPAL DIRECTORY & EMERGENCY SOS (Theme Adaptive)
          ======================================================================= */}
      <div className='p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800'>
          <div className='flex items-center gap-2.5'>
            <PhoneCall className='w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0' />
            <div>
              <div className='font-black text-sm text-slate-900 dark:text-white'>
                {CITY_HELPLINES[floodCity]?.authority || 'Municipal Disaster Control'}
              </div>
              <div className='text-xs text-slate-500 dark:text-slate-400'>
                {CITY_HELPLINES[floodCity]?.desc || '24x7 Emergency Flood & Pumping Desk'}
              </div>
            </div>
          </div>
          <div className='flex items-center gap-2 flex-wrap'>
            {CITY_HELPLINES[floodCity]?.phone && (
              <a
                href={`tel:${CITY_HELPLINES[floodCity].phone.replace(/[^0-9]/g, '')}`}
                className='px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs'
              >
                <PhoneCall className='w-3.5 h-3.5' />
                <span>Call {CITY_HELPLINES[floodCity].phone}</span>
              </a>
            )}
            <a
              href='tel:1078'
              className='px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 transition'
            >
              NDRF 1078
            </a>
            <a
              href='tel:112'
              className='px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition'
            >
              Emergency 112
            </a>
          </div>
        </div>

        {/* Actionable SOP Checklist */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-300'>
          <div className='p-3.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800'>
            <span className='font-bold text-blue-600 dark:text-sky-400 block mb-1'>⚡ Electrical Safety:</span>
            Switch off ground-floor main breakers if water enters premises. Stay away from fallen street lighting wires.
          </div>
          <div className='p-3.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800'>
            <span className='font-bold text-blue-600 dark:text-sky-400 block mb-1'>🚗 Avoid Subways:</span>
            Never drive into flooded railway underpasses. Turn around, do not drown — 30 cm water easily stalls and floats passenger cars.
          </div>
          <div className='p-3.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800'>
            <span className='font-bold text-blue-600 dark:text-sky-400 block mb-1'>💧 Potable Water:</span>
            Boil drinking water or use chlorine disinfection. Flood runoff can contaminate municipal supply siphons.
          </div>
        </div>
      </div>

      {/* =======================================================================
          7. MODAL: REPORT WATERLOGGED STREET
          ======================================================================= */}
      {isReportModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn'>
          <div className='w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4'>
            <div className='flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800'>
              <h3 className='text-base font-bold text-slate-900 dark:text-white flex items-center gap-2'>
                <AlertTriangle className='w-4 h-4 text-amber-500' />
                <span>Report Road Waterlogging</span>
              </h3>
              <button
                type='button'
                onClick={() => setIsReportModalOpen(false)}
                className='text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold'
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className='space-y-3.5 text-xs'>
              <div>
                <label className='block font-bold text-slate-700 dark:text-slate-300 mb-1'>
                  Location / Landmark / Crossroad:
                </label>
                <input
                  type='text'
                  required
                  placeholder='e.g. Andheri Subway, Western Express Highway'
                  value={reportSpot}
                  onChange={(e) => setReportSpot(e.target.value)}
                  className='w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              <div>
                <label className='block font-bold text-slate-700 dark:text-slate-300 mb-1'>
                  Estimated Water Depth:
                </label>
                <div className='grid grid-cols-3 gap-2'>
                  {[
                    { id: 'ankle', label: 'Ankle (< 15cm)' },
                    { id: 'knee', label: 'Knee (15-40cm)' },
                    { id: 'waist', label: 'Waist (> 40cm)' }
                  ].map(d => (
                    <button
                      key={d.id}
                      type='button'
                      onClick={() => setReportDepth(d.id)}
                      className={`p-2 rounded-xl text-center font-bold border transition cursor-pointer ${
                        reportDepth === d.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className='block font-bold text-slate-700 dark:text-slate-300 mb-1'>
                  Traffic Impact / Notes (Optional):
                </label>
                <textarea
                  rows={2}
                  placeholder='e.g. 2-wheelers stalling, drainage clogged with debris'
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  className='w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              <div className='flex items-center justify-end gap-2 pt-2'>
                <button
                  type='button'
                  onClick={() => setIsReportModalOpen(false)}
                  className='px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center gap-1.5 shadow-md'
                >
                  <Send className='w-3.5 h-3.5' />
                  <span>Submit to Control Room</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UrbanFloodPage
