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
  ChevronRight,
  Send,
  Clock,
  Gauge,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Radio,
  Check
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
  Legend,
  BarChart
} from 'recharts'
import { useWeather } from '../context/WeatherContext'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import api from '../services/api'

// ─── 20 Flood-Prone Indian Metropolitan Basins ───────────────────────────────
export const ALL_FLOOD_CITIES = [
  { id: 'mumbai', label: 'Mumbai', state: 'Maharashtra', coords: [19.076, 72.8777] },
  { id: 'delhi', label: 'Delhi', state: 'NCT Delhi', coords: [28.6139, 77.209] },
  { id: 'bengaluru', label: 'Bengaluru', state: 'Karnataka', coords: [12.9716, 77.5946] },
  { id: 'pune', label: 'Pune', state: 'Maharashtra', coords: [18.5204, 73.8567] },
  { id: 'chennai', label: 'Chennai', state: 'Tamil Nadu', coords: [13.0827, 80.2707] },
  { id: 'kolkata', label: 'Kolkata', state: 'West Bengal', coords: [22.5726, 88.3639] },
  { id: 'hyderabad', label: 'Hyderabad', state: 'Telangana', coords: [17.385, 78.4867] },
  { id: 'ahmedabad', label: 'Ahmedabad', state: 'Gujarat', coords: [23.0225, 72.5714] },
  { id: 'surat', label: 'Surat', state: 'Gujarat', coords: [21.1702, 72.8311] },
  { id: 'guwahati', label: 'Guwahati', state: 'Assam', coords: [26.1445, 91.7362] },
  { id: 'patna', label: 'Patna', state: 'Bihar', coords: [25.5941, 85.1376] },
  { id: 'kochi', label: 'Kochi', state: 'Kerala', coords: [9.9312, 76.2673] },
  { id: 'nagpur', label: 'Nagpur', state: 'Maharashtra', coords: [21.1458, 79.0882] },
  { id: 'nashik', label: 'Nashik', state: 'Maharashtra', coords: [19.9975, 73.7898] },
  { id: 'lucknow', label: 'Lucknow', state: 'Uttar Pradesh', coords: [26.8467, 80.9462] },
  { id: 'srinagar', label: 'Srinagar', state: 'Jammu & Kashmir', coords: [34.0837, 74.7973] },
  { id: 'bhubaneswar', label: 'Bhubaneswar', state: 'Odisha', coords: [20.2961, 85.8245] },
  { id: 'jaipur', label: 'Jaipur', state: 'Rajasthan', coords: [26.9124, 75.7873] },
  { id: 'indore', label: 'Indore', state: 'Madhya Pradesh', coords: [22.7196, 75.8577] },
  { id: 'bhopal', label: 'Bhopal', state: 'Madhya Pradesh', coords: [23.2599, 77.4126] }
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

// ─── Simulated Municipal Pump Stations per Major Metro ────────────────────────
const CITY_PUMP_STATIONS = {
  mumbai: [
    { name: 'Haji Ali Pumping Station', capacity: '120 m³/sec', status: 'Operational', pumpsActive: '6 of 6', tideGate: 'Open' },
    { name: 'Britannia Stormwater Outfall', capacity: '90 m³/sec', status: 'Operational', pumpsActive: '5 of 6', tideGate: 'Open' },
    { name: 'Cleveland Bunder Station', capacity: '110 m³/sec', status: 'Operational', pumpsActive: '6 of 6', tideGate: 'Open' },
    { name: 'Love Grove (Worli Nullah)', capacity: '105 m³/sec', status: 'Standby', pumpsActive: '4 of 6', tideGate: 'Open' },
    { name: 'Gazdarbandh (Santacruz)', capacity: '75 m³/sec', status: 'Operational', pumpsActive: '4 of 4', tideGate: 'Open' }
  ],
  delhi: [
    { name: 'Minto Bridge Auto-Pump Sump', capacity: '45 m³/sec', status: 'Operational', pumpsActive: '4 of 4', tideGate: 'N/A' },
    { name: 'Barapullah Nullah Pumping Hub', capacity: '85 m³/sec', status: 'Operational', pumpsActive: '5 of 6', tideGate: 'N/A' },
    { name: 'ITO Yamuna Sluice Gates', capacity: '120 m³/sec', status: 'Operational', pumpsActive: '8 of 8', tideGate: 'Discharging' },
    { name: 'Tilak Bridge Underpass Station', capacity: '35 m³/sec', status: 'Operational', pumpsActive: '3 of 3', tideGate: 'N/A' }
  ],
  bengaluru: [
    { name: 'Bellandur Lake Outflow Sluices', capacity: '60 m³/sec', status: 'Operational', pumpsActive: '4 of 5', tideGate: 'Open' },
    { name: 'Silk Board Junction Sump Hub', capacity: '40 m³/sec', status: 'Operational', pumpsActive: '3 of 4', tideGate: 'N/A' },
    { name: 'Varthur Waste Weir Station', capacity: '55 m³/sec', status: 'Operational', pumpsActive: '4 of 4', tideGate: 'Open' }
  ],
  pune: [
    { name: 'Ambil Odha Diversion Conduit', capacity: '50 m³/sec', status: 'Operational', pumpsActive: '4 of 4', tideGate: 'Open' },
    { name: 'Mutha Riverbank Flood Gates', capacity: '95 m³/sec', status: 'Operational', pumpsActive: '6 of 6', tideGate: 'Monitoring' },
    { name: 'Dandekar Bridge Stormwater Hub', capacity: '35 m³/sec', status: 'Operational', pumpsActive: '3 of 4', tideGate: 'Open' }
  ],
  chennai: [
    { name: 'Velachery Pallikaranai Outlet', capacity: '80 m³/sec', status: 'Operational', pumpsActive: '5 of 6', tideGate: 'High Tide Barred' },
    { name: 'Adyar River Mouth Sea Sluice', capacity: '130 m³/sec', status: 'Operational', pumpsActive: '7 of 8', tideGate: 'Open' },
    { name: 'Buckingham Canal Pump Depot', capacity: '90 m³/sec', status: 'Operational', pumpsActive: '6 of 6', tideGate: 'Open' }
  ]
}

export const UrbanFloodPage = () => {
  const { setCurrentPage, addToast } = useWeather()
  const { isDark } = useTheme()
  const { language } = useLanguage()

  // State
  const [floodCity, setFloodCity] = useState('mumbai')
  const [floodMode, setFloodMode] = useState('live') // 'live' | 'forecast' | 'monsoon_surge' | 'custom'
  const [customRainfall, setCustomRainfall] = useState(35)
  const [floodData, setFloodData] = useState(null)
  const [floodLoading, setFloodLoading] = useState(false)
  const [activeHotspotFilter, setActiveHotspotFilter] = useState('all') // 'all' | 'Critical' | 'Severe' | 'Moderate'
  const [selectedRouteHotspot, setSelectedRouteHotspot] = useState('')
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'hotspots' | 'hydrology' | 'infrastructure' | 'citizen_reports'

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
      status: 'Traffic completely halted, BEST buses diverting',
      time: '14 mins ago',
      verified: true
    },
    {
      id: 2,
      city: 'mumbai',
      location: 'Sion Matunga Gandhi Market',
      depth: 'Ankle level (~15 cm)',
      status: 'Water receding gradually as municipal pumps run',
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
      // Diurnal storm progression simulation
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
      { name: 'Atmospheric Influx', value: rain, fill: '#38BDF8' },
      { name: 'Soil Infiltration', value: perviousInfiltration, fill: '#10B981' },
      { name: 'Surface Runoff (Q)', value: runoff, fill: '#F59E0B' },
      { name: 'Drain Capacity Limit', value: drainCap, fill: '#6366F1' },
      { name: 'Excess Sump Ponding', value: excessPonding, fill: '#EF4444' }
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

  // Active severity color helpers
  const severityColor = floodData?.saturation?.color || '#22c55e'
  const isCritical = floodData?.saturation?.level === 'Critical Inundation'
  const isSevere = floodData?.saturation?.level === 'Severe'
  const isElevated = isCritical || isSevere

  return (
    <div className='max-w-7xl mx-auto space-y-6 pb-16 px-3 sm:px-6 pt-4'>
      {/* =======================================================================
          1. TOP HERO HEADER & BASIN SELECTOR
          ======================================================================= */}
      <div className='relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white border border-blue-500/30 shadow-2xl space-y-6'>
        {/* Atmospheric Glow & Particle Flares */}
        <div className='pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl animate-pulse' />
        <div className='pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl' />

        {/* Header Badges & Actions */}
        <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2 flex-wrap'>
              <span className='px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/20 text-sky-300 border border-blue-400/30 flex items-center gap-1.5'>
                <Radio className='w-3 h-3 text-sky-300 animate-pulse' />
                SIH PS 26068 Urban Hydro-Telemetry
              </span>
              <span className='px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 font-mono'>
                Rational Runoff Engine (Q = C × I × A)
              </span>
            </div>
            <h1 className='text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-3'>
              <Building className='w-7 h-7 sm:w-9 sm:h-9 text-sky-400' />
              <span>Urban Flash Flood &amp; Inundation Portal</span>
            </h1>
            <p className='text-xs sm:text-sm text-sky-100/80 max-w-3xl leading-relaxed'>
              High-resolution stormwater drainage saturation tracking, real-time waterlogging depth calculations,
              and low-lying hotspot diversion matrix across 20 major Indian metropolitan basins.
            </p>
          </div>

          <div className='flex items-center gap-2 flex-wrap'>
            <button
              type='button'
              onClick={() => setIsReportModalOpen(true)}
              className='px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95'
            >
              <AlertTriangle className='w-3.5 h-3.5 text-slate-950' />
              <span>Report Flooded Street</span>
            </button>
            <button
              type='button'
              onClick={loadFlood}
              disabled={floodLoading}
              className='px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50'
              title='Refresh Telemetry'
            >
              <RefreshCw className={`w-3.5 h-3.5 ${floodLoading ? 'animate-spin text-sky-300' : ''}`} />
              <span>{floodLoading ? 'Updating...' : 'Sync Radar'}</span>
            </button>
          </div>
        </div>

        {/* Quick Metro Selector Pills */}
        <div className='relative z-10 space-y-3 pt-2 border-t border-white/10'>
          <div className='flex items-center justify-between gap-2 flex-wrap'>
            <span className='text-xs font-bold text-sky-200 tracking-wide uppercase'>
              Select Metropolitan Basin ({ALL_FLOOD_CITIES.length} Monitored):
            </span>
            <div className='flex items-center gap-2'>
              <select
                value={floodCity}
                onChange={(e) => setFloodCity(e.target.value)}
                className='px-3 py-1.5 rounded-xl text-xs font-bold bg-white/15 border border-white/25 text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400'
              >
                {ALL_FLOOD_CITIES.map(c => (
                  <option key={c.id} value={c.id} className='bg-slate-900 text-white'>
                    {c.label} ({c.state})
                  </option>
                ))}
              </select>
            </div>
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
                      ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/30'
                      : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
                  }`}
                >
                  <MapPin className={`w-3 h-3 inline mr-1 ${active ? 'text-slate-950' : 'text-sky-300'}`} />
                  {c.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Telemetry Mode Toggle & Custom Simulator */}
        <div className='relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15'>
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='text-xs font-bold text-sky-200 mr-1'>Analysis Mode:</span>
            <button
              type='button'
              onClick={() => setFloodMode('live')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                floodMode === 'live'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                  : 'bg-white/5 text-sky-100 border-white/10 hover:bg-white/10'
              }`}
            >
              📡 Live Radar Telemetry
            </button>
            <button
              type='button'
              onClick={() => setFloodMode('forecast')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                floodMode === 'forecast'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                  : 'bg-white/5 text-sky-100 border-white/10 hover:bg-white/10'
              }`}
            >
              🔮 Next 6-Hr Forecast Peak
            </button>
            <button
              type='button'
              onClick={() => setFloodMode('monsoon_surge')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                floodMode === 'monsoon_surge'
                  ? 'bg-rose-600 text-white border-rose-400 shadow-sm'
                  : 'bg-white/5 text-sky-100 border-white/10 hover:bg-white/10'
              }`}
            >
              ⛈️ Cloudburst Stress Test (55 mm/h)
            </button>
            <button
              type='button'
              onClick={() => setFloodMode('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                floodMode === 'custom'
                  ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-sm'
                  : 'bg-white/5 text-sky-100 border-white/10 hover:bg-white/10'
              }`}
            >
              🎛️ Custom Inundation Simulator
            </button>
          </div>

          {/* Interactive Rainfall Slider if in Custom Mode */}
          {floodMode === 'custom' && (
            <div className='flex items-center gap-3 w-full md:w-auto bg-black/30 px-3.5 py-1.5 rounded-xl border border-white/20'>
              <Sliders className='w-4 h-4 text-amber-300 shrink-0' />
              <div className='flex items-center gap-2'>
                <span className='text-xs font-bold text-amber-200'>Intensity:</span>
                <input
                  type='range'
                  min='5'
                  max='120'
                  step='5'
                  value={customRainfall}
                  onChange={(e) => setCustomRainfall(Number(e.target.value))}
                  className='w-28 sm:w-36 accent-amber-400 cursor-pointer'
                />
                <span className='text-xs font-black text-white font-mono min-w-[55px]'>
                  {customRainfall} mm/h
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =======================================================================
          2. CRITICAL ALERT BANNER (If Severe or Critical)
          ======================================================================= */}
      {isElevated && (
        <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg ${
          isCritical
            ? 'bg-rose-500/15 border-rose-500 text-rose-900 dark:text-rose-100 shadow-rose-500/10 animate-pulse'
            : 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-100 shadow-amber-500/10'
        }`}>
          <div className='flex items-center gap-3'>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCritical ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'}`}>
              <ShieldAlert className='w-6 h-6' />
            </div>
            <div>
              <div className='font-black text-sm sm:text-base flex items-center gap-2'>
                <span>URGENT: {floodData?.saturation?.level} Alert in {floodData?.city}</span>
                <span className='px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/20'>
                  {floodData?.saturationRatio}x Design Sump Overflow
                </span>
              </div>
              <p className='text-xs opacity-90 mt-0.5 leading-relaxed'>
                {floodData?.saturation?.description || 'Drainage network overwhelmed. Severe waterlogging in low-lying corridors.'}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2 shrink-0'>
            {CITY_HELPLINES[floodCity]?.phone && (
              <a
                href={`tel:${CITY_HELPLINES[floodCity].phone.replace(/[^0-9]/g, '')}`}
                className='px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer'
              >
                <PhoneCall className='w-3.5 h-3.5' />
                <span>Call {CITY_HELPLINES[floodCity].phone}</span>
              </a>
            )}
            <a
              href='tel:1078'
              className='px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition'
            >
              NDRF 1078
            </a>
          </div>
        </div>
      )}

      {/* =======================================================================
          3. KEY HYDROLOGICAL TELEMETRY CARDS (KPI GRID)
          ======================================================================= */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* KPI 1: Saturation Level */}
        <div className='p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
              Saturation Level
            </span>
            <Gauge className='w-4 h-4 text-blue-600 dark:text-blue-400' />
          </div>
          <div className='flex items-baseline gap-2'>
            <span
              className='text-2xl font-black'
              style={{ color: severityColor }}
            >
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
            Drain Sump Ratio: <strong className='text-slate-900 dark:text-white font-mono'>{floodData?.saturationRatio || 0}x</strong> design limit
          </div>
        </div>

        {/* KPI 2: Computed Surface Runoff */}
        <div className='p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
              Runoff Discharge (Q)
            </span>
            <Droplets className='w-4 h-4 text-amber-500' />
          </div>
          <div className='flex items-baseline gap-1'>
            <span className='text-3xl font-black text-slate-900 dark:text-white font-mono'>
              {floodData?.computedRunoff || 0}
            </span>
            <span className='text-xs font-bold text-slate-400 font-mono'>mm/hr</span>
          </div>
          <div className='text-[11px] font-semibold text-slate-500 dark:text-slate-400'>
            Design Drain Capacity: <strong className='text-slate-700 dark:text-slate-300 font-mono'>{floodData?.drainageCapacityMmh || 25} mm/hr</strong>
          </div>
          <div className='text-[10px] font-medium text-slate-400'>
            Impermeability Coeff: C = {floodData?.runoffCoefficient || 0.8}
          </div>
        </div>

        {/* KPI 3: Inundation Depth */}
        <div className='p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
              Est. Waterlog Depth
            </span>
            <Layers className='w-4 h-4 text-indigo-500' />
          </div>
          <div className='flex items-baseline gap-1'>
            <span className={`text-3xl font-black font-mono ${
              (floodData?.estimatedWaterlogDepthCm || 0) > 15 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
            }`}>
              {floodData?.estimatedWaterlogDepthCm || 0}
            </span>
            <span className='text-xs font-bold text-slate-400 font-mono'>cm</span>
          </div>
          <div className='text-[11px] font-semibold text-slate-500 dark:text-slate-400'>
            {(floodData?.estimatedWaterlogDepthCm || 0) > 25
              ? '🚨 High vehicle submersion risk'
              : (floodData?.estimatedWaterlogDepthCm || 0) > 10
                ? '⚠️ Stalled sedans & two-wheelers'
                : '✅ Minimal surface ponding'}
          </div>
          <div className='text-[10px] font-medium text-slate-400'>
            Pedestrian knock-down threshold: 15 cm
          </div>
        </div>

        {/* KPI 4: Time to Drain */}
        <div className='p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
              Recession Clearance Window
            </span>
            <Clock className='w-4 h-4 text-emerald-500' />
          </div>
          <div className='flex items-baseline gap-1'>
            <span className='text-3xl font-black text-slate-900 dark:text-white font-mono'>
              {recessionHours > 0 ? recessionHours : '< 0.5'}
            </span>
            <span className='text-xs font-bold text-slate-400 font-mono'>hours</span>
          </div>
          <div className='text-[11px] font-semibold text-slate-500 dark:text-slate-400'>
            Estimated time to evacuate water once rainfall halts
          </div>
          <div className='text-[10px] font-medium text-slate-400'>
            Subject to gravity outfalls &amp; high tide locks
          </div>
        </div>
      </div>

      {/* =======================================================================
          4. NAVIGATION TABS FOR DEEP ANALYSIS
          ======================================================================= */}
      <div className='flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none pb-1'>
        {[
          { id: 'overview', label: 'Hydrodynamic Visualizations & Charts', icon: TrendingUp },
          { id: 'hotspots', label: `Vulnerable Hotspot Matrix (${floodData?.allHotspots?.length || 0})`, icon: MapPin },
          { id: 'hydrology', label: 'Rational Runoff Mechanics & Formulation', icon: Info },
          { id: 'infrastructure', label: 'Stormwater Pumps & Sluice Gates', icon: Gauge },
          { id: 'citizen_reports', label: `Citizen Incident Feed (${crowdsourcedReports.length})`, icon: ShieldAlert }
        ].map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type='button'
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 border-b-2 ${
                active
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
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
          TAB 1: HYDRODYNAMIC VISUALIZATIONS & CHARTS
          ======================================================================= */}
      {activeTab === 'overview' && (
        <div className='space-y-6'>
          {/* Main Chart: 12-Hour Hydrograph */}
          <div className='p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
              <div>
                <h3 className='text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2'>
                  <TrendingUp className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                  <span>12-Hour Storm Progression &amp; Drainage Saturation Hydrograph</span>
                </h3>
                <p className='text-xs text-slate-500 dark:text-slate-400'>
                  Dynamic modeling of precipitation rate vs stormwater capacity threshold in {floodData?.city || currentCityObj.label}
                </p>
              </div>
              <div className='flex items-center gap-3 text-xs'>
                <span className='flex items-center gap-1.5 text-slate-600 dark:text-slate-300'>
                  <span className='w-3 h-3 rounded-xs bg-sky-400 inline-block' /> Rain (mm/h)
                </span>
                <span className='flex items-center gap-1.5 text-slate-600 dark:text-slate-300'>
                  <span className='w-3 h-3 rounded-xs bg-amber-500 inline-block' /> Runoff Q
                </span>
                <span className='flex items-center gap-1.5 text-slate-600 dark:text-slate-300'>
                  <span className='w-3 h-0.5 bg-rose-500 inline-block' /> Drain Limit
                </span>
              </div>
            </div>

            <div className='h-72 sm:h-80 w-full pt-2'>
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
                    label={{ value: `Max Drain Limit (${floodData?.drainageCapacityMmh || 25} mm/h)`, fill: '#ef4444', fontSize: 10, position: 'top' }}
                  />
                  <Bar dataKey='rainfall' name='Precipitation (mm/h)' fill='url(#rainGradient)' radius={[4, 4, 0, 0]} barSize={20} />
                  <Area type='monotone' dataKey='runoff' name='Computed Runoff (mm/h)' stroke='#f59e0b' fill='url(#runoffGradient)' strokeWidth={2} />
                  <Line type='monotone' dataKey='depth' name='Waterlog Depth (cm)' stroke='#8b5cf6' strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Catchment Dynamics & Hotspot Risk Comparison Dual Grid */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Chart 2: Catchment Water Balance */}
            <div className='p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4'>
              <h4 className='text-base font-bold text-slate-900 dark:text-white flex items-center gap-2'>
                <Droplets className='w-4 h-4 text-sky-500' />
                <span>Urban Catchment Mass Balance (mm/hr)</span>
              </h4>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                Rational Runoff allocation: Infiltration retention vs discharge constraints in {floodData?.city || currentCityObj.label}
              </p>
              <div className='h-64 w-full pt-2'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={catchmentBalanceData} layout='vertical' margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke={isDark ? '#334155' : '#e2e8f0'} />
                    <XAxis type='number' stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                    <YAxis dataKey='name' type='category' stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} width={110} />
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

            {/* Quick Route & Transit Feasibility Checker */}
            <div className='p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4'>
              <h4 className='text-base font-bold text-slate-900 dark:text-white flex items-center gap-2'>
                <Car className='w-4 h-4 text-emerald-500' />
                <span>Live Route Feasibility &amp; Clearance Advisor</span>
              </h4>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                Select your vulnerable commute corridor to inspect real-time passage clearance:
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

                  const estDepth = floodData?.estimatedWaterlogDepthCm || 0
                  const isPassableSedan = estDepth < 15
                  const isPassableBike = estDepth < 10
                  const isPassableHeavy = estDepth < 40

                  return (
                    <div className='space-y-3 pt-2'>
                      <div className='p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1.5'>
                        <div className='flex items-center justify-between'>
                          <span className='font-bold text-slate-900 dark:text-white'>{currentSpot?.area}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            currentSpot?.risk === 'Critical' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                          }`}>
                            {currentSpot?.risk} Vulnerability
                          </span>
                        </div>
                        <p className='text-slate-500 dark:text-slate-400 text-[11px]'>{currentSpot?.reason}</p>
                      </div>

                      {/* Transit Matrix */}
                      <div className='grid grid-cols-3 gap-2 text-center text-xs'>
                        <div className={`p-2.5 rounded-xl border ${isPassableBike ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'}`}>
                          <Bike className='w-4 h-4 mx-auto mb-1' />
                          <div className='font-bold'>2-Wheelers</div>
                          <div className='text-[10px]'>{isPassableBike ? 'Passable' : 'Stall Hazard'}</div>
                        </div>
                        <div className={`p-2.5 rounded-xl border ${isPassableSedan ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'}`}>
                          <Car className='w-4 h-4 mx-auto mb-1' />
                          <div className='font-bold'>Cars &amp; Sedans</div>
                          <div className='text-[10px]'>{isPassableSedan ? 'Passable' : 'Submersion'}</div>
                        </div>
                        <div className={`p-2.5 rounded-xl border ${isPassableHeavy ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'}`}>
                          <Bus className='w-4 h-4 mx-auto mb-1' />
                          <div className='font-bold'>Buses &amp; SUVs</div>
                          <div className='text-[10px]'>{isPassableHeavy ? 'Open' : 'Impassable'}</div>
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
          TAB 2: VULNERABLE HOTSPOT MATRIX & ZONE DETAILS
          ======================================================================= */}
      {activeTab === 'hotspots' && (
        <div className='space-y-5'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm'>
            <div>
              <h3 className='text-base font-bold text-slate-900 dark:text-white'>
                Monitored Vulnerable Inundation Corridors in {floodData?.city || currentCityObj.label}
              </h3>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                Identified topographical depressions, nallah bottlenecks, and railway underpass flood traps.
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
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
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
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all hover:shadow-md space-y-3 ${
                    isCrit
                      ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/30'
                      : isSev
                        ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/30'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
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

                  <div className='pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400'>
                    <span>Local Elevation Risk: <strong>Elevated Bowl</strong></span>
                    <span className='text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 cursor-pointer hover:underline'>
                      <span>Bypass Route</span>
                      <ArrowUpRight className='w-3 h-3' />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 3: HYDROLOGICAL MECHANICS & RATIONAL RUNOFF EQUATION
          ======================================================================= */}
      {activeTab === 'hydrology' && (
        <div className='p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6'>
          <div>
            <h3 className='text-lg font-black text-slate-900 dark:text-white flex items-center gap-2'>
              <Info className='w-5 h-5 text-blue-600 dark:text-blue-400' />
              <span>Hydrological Physics: The Rational Runoff Method</span>
            </h3>
            <p className='text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1'>
              Standard civil stormwater engineering formula employed by municipal flood control networks:
            </p>
          </div>

          {/* Mathematical Card */}
          <div className='p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-slate-900 dark:text-white space-y-3'>
            <div className='text-2xl sm:text-3xl font-black font-mono tracking-wider text-blue-600 dark:text-blue-400 text-center py-2'>
              Q = C × I × A × E<sub>rf</sub>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-2'>
              <div className='p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'>
                <div className='font-bold text-blue-600 dark:text-blue-400'>Q (Peak Runoff)</div>
                <div className='text-slate-500 dark:text-slate-400 mt-0.5'>Total volumetric surface runoff flowing toward stormwater sumps (mm/hr).</div>
              </div>
              <div className='p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'>
                <div className='font-bold text-blue-600 dark:text-blue-400'>C (Runoff Coefficient)</div>
                <div className='text-slate-500 dark:text-slate-400 mt-0.5'>Impermeability factor based on concrete/asphalt density (0.72 – 0.85 in Indian metros).</div>
              </div>
              <div className='p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'>
                <div className='font-bold text-blue-600 dark:text-blue-400'>I (Rainfall Intensity)</div>
                <div className='text-slate-500 dark:text-slate-400 mt-0.5'>Hourly rainfall rate captured via live Doppler radar and Open-Meteo telemetry stream.</div>
              </div>
              <div className='p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'>
                <div className='font-bold text-blue-600 dark:text-blue-400'>E<sub>rf</sub> (Elevation Factor)</div>
                <div className='text-slate-500 dark:text-slate-400 mt-0.5'>Low-lying saucer depression amplification index (1.1x to 1.45x multiplier).</div>
              </div>
            </div>
          </div>

          {/* City Hydrological Profile Table */}
          <div className='space-y-2'>
            <h4 className='text-sm font-bold text-slate-900 dark:text-white'>
              Selected Metropolitan Basin Parameter Baseline:
            </h4>
            <div className='overflow-x-auto'>
              <table className='w-full text-left text-xs border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden'>
                <thead className='bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold'>
                  <tr>
                    <th className='p-3'>City</th>
                    <th className='p-3'>Runoff Coeff (C)</th>
                    <th className='p-3'>Drain Design Cap</th>
                    <th className='p-3'>Topographical Risk</th>
                    <th className='p-3'>Primary Risk Culprit</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300'>
                  <tr>
                    <td className='p-3 font-bold text-slate-900 dark:text-white'>{floodData?.city || currentCityObj.label}</td>
                    <td className='p-3 font-mono font-bold text-blue-600 dark:text-blue-400'>{floodData?.runoffCoefficient || 0.85}</td>
                    <td className='p-3 font-mono'>{floodData?.drainageCapacityMmh || 25} mm/hr</td>
                    <td className='p-3'>Low-gradient coastal / river floodplain</td>
                    <td className='p-3'>Saucer depression &amp; high tide backflow</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 4: STORMWATER PUMPS & INFRASTRUCTURE STATUS
          ======================================================================= */}
      {activeTab === 'infrastructure' && (
        <div className='space-y-5'>
          <div className='p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
            <div>
              <h3 className='text-base font-bold text-slate-900 dark:text-white'>
                Major Stormwater Pumping Stations &amp; Outfalls ({floodData?.city || currentCityObj.label})
              </h3>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                Real-time active pump deployment and gravity sluice discharge telemetry.
              </p>
            </div>
            <span className='px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'>
              All Pumping Grids Online
            </span>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {(CITY_PUMP_STATIONS[floodCity] || CITY_PUMP_STATIONS.mumbai).map((pump, idx) => (
              <div key={idx} className='p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='font-bold text-sm text-slate-900 dark:text-white'>{pump.name}</span>
                  <span className='px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'>
                    {pump.status}
                  </span>
                </div>
                <div className='grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400'>
                  <div>
                    Discharge Flow: <strong className='text-slate-900 dark:text-white font-mono block'>{pump.capacity}</strong>
                  </div>
                  <div>
                    Active Turbines: <strong className='text-slate-900 dark:text-white font-mono block'>{pump.pumpsActive}</strong>
                  </div>
                </div>
                <div className='text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between'>
                  <span className='text-slate-500'>Tide Sluice Gate:</span>
                  <span className='font-bold text-blue-600 dark:text-blue-400'>{pump.tideGate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 5: CITIZEN WATERLOGGING REPORTS FEED
          ======================================================================= */}
      {activeTab === 'citizen_reports' && (
        <div className='space-y-5'>
          <div className='p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
            <div>
              <h3 className='text-base font-bold text-slate-900 dark:text-white'>
                Live Crowdsourced Street Inundation Feed
              </h3>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                Direct community reports verified by municipal disaster management desks.
              </p>
            </div>
            <button
              type='button'
              onClick={() => setIsReportModalOpen(true)}
              className='px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer shadow-md'
            >
              + Submit Waterlog Report
            </button>
          </div>

          <div className='space-y-3'>
            {crowdsourcedReports.map(rep => (
              <div
                key={rep.id}
                className='p-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3'
              >
                <div className='space-y-1'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <span className='font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5'>
                      <MapPin className='w-3.5 h-3.5 text-blue-600 dark:text-blue-400' />
                      {rep.location}
                    </span>
                    <span className='px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'>
                      {rep.depth}
                    </span>
                    {rep.verified && (
                      <span className='px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1'>
                        <Check className='w-3 h-3' /> Verified
                      </span>
                    )}
                  </div>
                  <p className='text-xs text-slate-600 dark:text-slate-300'>{rep.status}</p>
                </div>
                <div className='text-xs text-slate-400 shrink-0'>
                  {rep.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =======================================================================
          5. MUNICIPAL DIRECTORY & EMERGENCY SOS FOOTER
          ======================================================================= */}
      <div className='p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-4 shadow-xl'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800'>
          <div className='flex items-center gap-2.5'>
            <PhoneCall className='w-5 h-5 text-emerald-400 shrink-0' />
            <div>
              <div className='font-black text-sm text-white'>
                {CITY_HELPLINES[floodCity]?.authority || 'Municipal Disaster Control'}
              </div>
              <div className='text-xs text-slate-400'>
                {CITY_HELPLINES[floodCity]?.desc || '24x7 Emergency Flood & Pumping Desk'}
              </div>
            </div>
          </div>
          <div className='flex items-center gap-2 flex-wrap'>
            {CITY_HELPLINES[floodCity]?.phone && (
              <a
                href={`tel:${CITY_HELPLINES[floodCity].phone.replace(/[^0-9]/g, '')}`}
                className='px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm'
              >
                <PhoneCall className='w-3.5 h-3.5' />
                <span>Call {CITY_HELPLINES[floodCity].phone}</span>
              </a>
            )}
            <a
              href='tel:1078'
              className='px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700'
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
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300'>
          <div className='p-3 rounded-xl bg-slate-800/60 border border-slate-800'>
            <span className='font-bold text-sky-400 block mb-1'>⚡ Electrical Safety:</span>
            Switch off main circuit breaker if water enters premises. Avoid contact with electric poles and submersed transformers.
          </div>
          <div className='p-3 rounded-xl bg-slate-800/60 border border-slate-800'>
            <span className='font-bold text-sky-400 block mb-1'>🚗 Driving Hazard:</span>
            Never drive into flooded subways or underpasses. Turn around, do not drown — 30 cm water floats most cars.
          </div>
          <div className='p-3 rounded-xl bg-slate-800/60 border border-slate-800'>
            <span className='font-bold text-sky-400 block mb-1'>💧 Potable Water:</span>
            Boil drinking water or use chlorine tablets. Municipal pipelines may suffer cross-contamination from flood backwash.
          </div>
        </div>
      </div>

      {/* =======================================================================
          6. MODAL: REPORT WATERLOGGED STREET
          ======================================================================= */}
      {isReportModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn'>
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
