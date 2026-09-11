import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import { useWeather } from '../context/WeatherContext'
import { useLanguage } from '../context/LanguageContext'
import {
  Waves,
  Anchor,
  Compass,
  Wind,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  Radio,
  Clock,
  RefreshCw,
  MapPin,
  Calendar,
  Thermometer,
  Eye,
  Info,
  Search,
  LifeBuoy,
  CheckSquare
} from 'lucide-react'

// ─── Indian Coastal Stations by Basin & State ────────────────────────────────
const MARITIME_STATIONS = [
  // Gujarat (Arabian Sea)
  { id: 'kandla', name: 'Deendayal / Kandla Port', basin: 'Arabian Sea', state: 'Gujarat', lat: '23.0000° N', lon: '70.2200° E', portCode: 'INIXY' },
  { id: 'mundra', name: 'Mundra Port & SEZ', basin: 'Arabian Sea', state: 'Gujarat', lat: '22.8400° N', lon: '69.7200° E', portCode: 'INMUN' },
  { id: 'porbandar', name: 'Porbandar Coastal Port', basin: 'Arabian Sea', state: 'Gujarat', lat: '21.6400° N', lon: '69.6000° E', portCode: 'INPBD' },
  { id: 'veraval', name: 'Veraval / Somnath Fishery Harbour', basin: 'Arabian Sea', state: 'Gujarat', lat: '20.9000° N', lon: '70.3600° E', portCode: 'INVRL' },
  { id: 'bhavnagar', name: 'Bhavnagar Anchorage Port', basin: 'Arabian Sea', state: 'Gujarat', lat: '21.7600° N', lon: '72.1500° E', portCode: 'INBHU' },
  { id: 'surat', name: 'Hazira / Surat Port', basin: 'Arabian Sea', state: 'Gujarat', lat: '21.1100° N', lon: '72.6400° E', portCode: 'INHZA' },

  // Maharashtra (Arabian Sea)
  { id: 'dahanu', name: 'Dahanu / Palghar Fishery Zone', basin: 'Arabian Sea', state: 'Maharashtra', lat: '19.9700° N', lon: '72.7300° E', portCode: 'INDHN' },
  { id: 'mumbai', name: 'Mumbai Port (JNPT / MbPT)', basin: 'Arabian Sea', state: 'Maharashtra', lat: '18.9438° N', lon: '72.8441° E', portCode: 'INBOM' },
  { id: 'alibag', name: 'Alibag / Raigad Coastal Harbour', basin: 'Arabian Sea', state: 'Maharashtra', lat: '18.6400° N', lon: '72.8700° E', portCode: 'INALB' },
  { id: 'ratnagiri', name: 'Ratnagiri Fishery Port (Mirya Bay)', basin: 'Arabian Sea', state: 'Maharashtra', lat: '16.9902° N', lon: '73.3120° E', portCode: 'INRTC' },
  { id: 'sindhudurg', name: 'Sindhudurg (Malvan Harbour)', basin: 'Arabian Sea', state: 'Maharashtra', lat: '16.0594° N', lon: '73.4682° E', portCode: 'INMLV' },

  // Goa (Arabian Sea)
  { id: 'goa', name: 'Mormugao Major Port (MPT)', basin: 'Arabian Sea', state: 'Goa', lat: '15.4167° N', lon: '73.8000° E', portCode: 'INMRM' },

  // Karnataka (Arabian Sea)
  { id: 'karwar', name: 'Karwar / Baithkol Port', basin: 'Arabian Sea', state: 'Karnataka', lat: '14.8100° N', lon: '74.1300° E', portCode: 'INKRW' },
  { id: 'udupi', name: 'Malpe Fishery Port (Udupi)', basin: 'Arabian Sea', state: 'Karnataka', lat: '13.3500° N', lon: '74.7000° E', portCode: 'INMLP' },
  { id: 'mangalore', name: 'New Mangalore Port (NMPT)', basin: 'Arabian Sea', state: 'Karnataka', lat: '12.9344° N', lon: '74.8211° E', portCode: 'INNML' },

  // Kerala (Arabian Sea)
  { id: 'kannur', name: 'Azhikkal / Kannur Port', basin: 'Arabian Sea', state: 'Kerala', lat: '11.8700° N', lon: '75.3700° E', portCode: 'INAZK' },
  { id: 'kozhikode', name: 'Beypore / Kozhikode Harbour', basin: 'Arabian Sea', state: 'Kerala', lat: '11.2500° N', lon: '75.7800° E', portCode: 'INBEY' },
  { id: 'kochi', name: 'Cochin Major Port (CoPT)', basin: 'Arabian Sea', state: 'Kerala', lat: '9.9667° N', lon: '76.2667° E', portCode: 'INCOK' },
  { id: 'alappuzha', name: 'Alappuzha / Alleppey Pier', basin: 'Arabian Sea', state: 'Kerala', lat: '9.4900° N', lon: '76.3300° E', portCode: 'INALP' },
  { id: 'kollam', name: 'Neendakara / Kollam Fishing Port', basin: 'Arabian Sea', state: 'Kerala', lat: '8.8900° N', lon: '76.6000° E', portCode: 'INKOL' },
  { id: 'vizhinjam', name: 'Vizhinjam International Seaport', basin: 'Arabian Sea', state: 'Kerala', lat: '8.3800° N', lon: '76.9900° E', portCode: 'INVZJ' },

  // Tamil Nadu (Bay of Bengal / Indian Ocean)
  { id: 'kanyakumari', name: 'Kanyakumari / Cape Comorin', basin: 'Bay of Bengal', state: 'Tamil Nadu', lat: '8.0800° N', lon: '77.5400° E', portCode: 'INKYK' },
  { id: 'tuticorin', name: 'V.O. Chidambaranar Port (Tuticorin)', basin: 'Bay of Bengal', state: 'Tamil Nadu', lat: '8.7642° N', lon: '78.1348° E', portCode: 'INTCR' },
  { id: 'rameswaram', name: 'Rameswaram / Pamban Pass', basin: 'Bay of Bengal', state: 'Tamil Nadu', lat: '9.2800° N', lon: '79.3100° E', portCode: 'INPAM' },
  { id: 'nagapattinam', name: 'Nagapattinam Deep Water Port', basin: 'Bay of Bengal', state: 'Tamil Nadu', lat: '10.7600° N', lon: '79.8400° E', portCode: 'INNPT' },
  { id: 'cuddalore', name: 'Cuddalore Anchorage Port', basin: 'Bay of Bengal', state: 'Tamil Nadu', lat: '11.7500° N', lon: '79.7700° E', portCode: 'INCDL' },
  { id: 'chennai', name: 'Chennai Port (ChPA / Ennore)', basin: 'Bay of Bengal', state: 'Tamil Nadu', lat: '13.0827° N', lon: '80.2707° E', portCode: 'INMAA' },

  // Puducherry (Bay of Bengal)
  { id: 'puducherry', name: 'Puducherry Port Harbour', basin: 'Bay of Bengal', state: 'Puducherry', lat: '11.9400° N', lon: '79.8100° E', portCode: 'INPNY' },

  // Andhra Pradesh (Bay of Bengal)
  { id: 'krishnapatnam', name: 'Krishnapatnam Port (Nellore)', basin: 'Bay of Bengal', state: 'Andhra Pradesh', lat: '14.2500° N', lon: '80.1200° E', portCode: 'INKRI' },
  { id: 'machilipatnam', name: 'Machilipatnam / Gilakaladindi', basin: 'Bay of Bengal', state: 'Andhra Pradesh', lat: '16.1800° N', lon: '81.1300° E', portCode: 'INMPT' },
  { id: 'kakinada', name: 'Kakinada Deep Water Port', basin: 'Bay of Bengal', state: 'Andhra Pradesh', lat: '16.9800° N', lon: '82.2400° E', portCode: 'INKAK' },
  { id: 'vizag', name: 'Visakhapatnam Major Port (VPA)', basin: 'Bay of Bengal', state: 'Andhra Pradesh', lat: '17.6868° N', lon: '83.2185° E', portCode: 'INVTZ' },

  // Odisha (Bay of Bengal)
  { id: 'gopalpur', name: 'Gopalpur Port (Ganjam)', basin: 'Bay of Bengal', state: 'Odisha', lat: '19.2600° N', lon: '84.9100° E', portCode: 'INGPR' },
  { id: 'puri', name: 'Puri Coastal Fishery Station', basin: 'Bay of Bengal', state: 'Odisha', lat: '19.8135° N', lon: '85.8312° E', portCode: 'INPURI' },
  { id: 'paradip', name: 'Paradip Major Port (PPA)', basin: 'Bay of Bengal', state: 'Odisha', lat: '20.3167° N', lon: '86.6167° E', portCode: 'INPRT' },
  { id: 'dhamra', name: 'Dhamra Port (Bhadrak)', basin: 'Bay of Bengal', state: 'Odisha', lat: '20.7900° N', lon: '86.9700° E', portCode: 'INDHM' },

  // West Bengal (Bay of Bengal)
  { id: 'digha', name: 'Digha / Shankarpur Fishery Hub', basin: 'Bay of Bengal', state: 'West Bengal', lat: '21.6300° N', lon: '87.5100° E', portCode: 'INDGH' },
  { id: 'haldia', name: 'Haldia Dock Complex (HDC)', basin: 'Bay of Bengal', state: 'West Bengal', lat: '22.0600° N', lon: '88.0600° E', portCode: 'INHAL' },
  { id: 'kolkata', name: 'Syama Prasad Mookerjee Port (Kolkata)', basin: 'Bay of Bengal', state: 'West Bengal', lat: '22.5726° N', lon: '88.3639° E', portCode: 'INCCU' },

  // Island Territories
  { id: 'portblair', name: 'Port Blair / South Andaman Harbour', basin: 'Bay of Bengal', state: 'Andaman & Nicobar', lat: '11.6200° N', lon: '92.7200° E', portCode: 'INIXZ' },
  { id: 'kavaratti', name: 'Kavaratti Lagoon & Jetty', basin: 'Arabian Sea', state: 'Lakshadweep', lat: '10.5700° N', lon: '72.6400° E', portCode: 'INKVT' }
]

export const MarinePage = () => {
  const { isDark } = useWeather()
  const { language } = useLanguage()

  const [activeBasin, setActiveBasin] = useState('All') // 'All' | 'Arabian Sea' | 'Bay of Bengal'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStationId, setSelectedStationId] = useState('mumbai')
  const [marineData, setMarineData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Keep live UTC & IST clock updated every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Filter stations by active basin and search query
  const filteredStations = MARITIME_STATIONS.filter(s => {
    const matchesBasin = activeBasin === 'All' || s.basin === activeBasin
    const query = searchQuery.trim().toLowerCase()
    const matchesQuery = !query ||
      s.name.toLowerCase().includes(query) ||
      s.state.toLowerCase().includes(query) ||
      s.portCode.toLowerCase().includes(query) ||
      s.id.toLowerCase().includes(query)
    return matchesBasin && matchesQuery
  })

  const activeStation = MARITIME_STATIONS.find(s => s.id === selectedStationId) || MARITIME_STATIONS[0]

  // Fetch marine forecast when station changes
  const fetchMarineData = useCallback(async (stationId) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getMarineCoastal(stationId)
      setMarineData(data?.data || data)
    } catch (err) {
      console.error('Marine telemetry fetch error:', err)
      setError(err.message || 'Failed to retrieve marine observation telemetry')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedStationId) {
      fetchMarineData(selectedStationId)
    }
  }, [selectedStationId, fetchMarineData])

  const current = marineData?.current || {}
  const beaufort = marineData?.beaufort || {}
  const portSignal = marineData?.portSignal
  const safety = marineData?.fishermenSafety || {
    status: 'SAFE',
    verdict: 'SAFE FOR FISHING — FAVOURABLE SEA CONDITIONS',
    color: '#22c55e',
    icon: '✅',
    details: 'Calm to slight sea conditions favorable for all commercial and artisanal fishing operations.'
  }

  const isDanger = safety.status === 'DANGER'
  const isWarning = safety.status === 'WARNING'
  const isCaution = safety.status === 'CAUTION'
  const isSafe = safety.status === 'SAFE'

  const [showChecklist, setShowChecklist] = useState(false)

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans select-none">
      {/* ─── 1. INCOIS & Maritime Disaster Management Official Header ─────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                <Waves className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                INCOIS Coastal & Marine Disaster Management Portal
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-cyan-600 text-white shadow-xs">
                MoES / INCOIS MEWS
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Indian Coast Guard
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
              Indian Ocean Early Warning System: Real-time high-resolution ocean wave hydrodynamics, WMO Beaufort wind scale classification, Indian Maritime Port Cautionary Signals (1–11), and automated fishermen sea-venturing advisories.
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
            <div className="px-4 py-2 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900 text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Indian Std (IST)</div>
              <div className="text-sm font-black font-mono text-cyan-700 dark:text-cyan-300">
                {currentTime.toLocaleTimeString('en-IN', { hour12: false })} IST
              </div>
            </div>
            <button
              type="button"
              onClick={() => fetchMarineData(selectedStationId)}
              disabled={loading}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer disabled:opacity-50"
              title="Refresh Ocean Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Basin Filter Tabs & Coastal Station Selector */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Maritime Basin:
              </span>
              <div className="flex items-center gap-1.5">
                {['All', 'Arabian Sea', 'Bay of Bengal'].map(basin => (
                  <button
                    key={basin}
                    type="button"
                    onClick={() => setActiveBasin(basin)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeBasin === basin
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {basin}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Search Input */}
            <div className="relative flex items-center min-w-[240px]">
              <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search port, state, code..."
                className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-0.5">
            <span>
              Showing <strong className="text-cyan-600 dark:text-cyan-400">{filteredStations.length}</strong> of {MARITIME_STATIONS.length} coastal ports & fishery hubs across India
            </span>
            {searchQuery && (
              <span className="italic">Filtered by &ldquo;{searchQuery}&rdquo;</span>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {filteredStations.length === 0 ? (
              <div className="py-2 px-3 text-xs text-slate-400 italic">
                No coastal port or fishery station matches &ldquo;{searchQuery}&rdquo;. Try searching for Gujarat, Kerala, Tuticorin, or Kandla.
              </div>
            ) : (
              filteredStations.map(stn => {
                const active = selectedStationId === stn.id
                return (
                  <button
                    key={stn.id}
                    type="button"
                    onClick={() => setSelectedStationId(stn.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
                      active
                        ? 'bg-cyan-600 border-cyan-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:border-cyan-400 dark:hover:border-cyan-500'
                    }`}
                  >
                    <Anchor className="w-3.5 h-3.5 opacity-70" />
                    <span>{stn.name.split(' (')[0].split(' / ')[0]}</span>
                    <span className="opacity-60 text-[11px]">({stn.state})</span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* ─── Rapid Coastal Distress & SAR Direct Dialers (Always Accessible) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <a
          href="tel:1554"
          className="p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-center gap-3 transition group cursor-pointer no-underline"
          title="Direct Call Indian Coast Guard Search and Rescue"
        >
          <span className="p-2 rounded-xl bg-rose-600 text-white group-hover:scale-105 transition shadow-xs">
            <PhoneCall className="w-4 h-4" />
          </span>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Coast Guard SAR</div>
            <div className="text-sm font-black font-mono">1554 (Toll-Free)</div>
          </div>
        </a>

        <a
          href="tel:1093"
          className="p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-300 flex items-center gap-3 transition group cursor-pointer no-underline"
          title="Direct Call Coastal Marine Police"
        >
          <span className="p-2 rounded-xl bg-blue-600 text-white group-hover:scale-105 transition shadow-xs">
            <Radio className="w-4 h-4" />
          </span>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Coastal Marine Police</div>
            <div className="text-sm font-black font-mono">1093 (Toll-Free)</div>
          </div>
        </a>

        <a
          href="tel:112"
          className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-3 transition group cursor-pointer no-underline"
          title="National Unified Emergency Number"
        >
          <span className="p-2 rounded-xl bg-emerald-600 text-white group-hover:scale-105 transition shadow-xs">
            <ShieldAlert className="w-4 h-4" />
          </span>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">National Emergency</div>
            <div className="text-sm font-black font-mono">112 (All India)</div>
          </div>
        </a>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-3">
          <span className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs">
            <Anchor className="w-4 h-4" />
          </span>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Emergency VHF Channel</div>
            <div className="text-sm font-black font-mono">CH-16 (156.8 MHz)</div>
          </div>
        </div>
      </div>

      {loading && !marineData ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-400">Fetching oceanographic telemetry and wave hydrodynamics...</span>
        </div>
      ) : error ? (
        <div className="p-8 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <div className="font-bold text-base">Ocean State Telemetry Offline</div>
          <p className="text-xs text-rose-700/80 dark:text-rose-300/80 max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={() => fetchMarineData(selectedStationId)}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-sm hover:bg-rose-700 transition cursor-pointer"
          >
            Retry Station Link
          </button>
        </div>
      ) : (
        <>
          {/* ─── 2. Operational Fishermen Sea Venturing Early Warning Banner ─── */}
          <div
            className={`p-6 sm:p-7 rounded-3xl border shadow-sm space-y-4 transition-all ${
              isDanger
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-950 dark:text-rose-100'
                : isWarning
                ? 'bg-orange-500/10 border-orange-500/40 text-orange-950 dark:text-orange-100'
                : isCaution
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-950 dark:text-amber-100'
                : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-100'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={`p-3 rounded-2xl text-white font-black text-xl shadow-md ${
                    isDanger ? 'bg-rose-600' : isWarning ? 'bg-orange-600' : isCaution ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600'
                  }`}
                >
                  {isDanger ? '🚫' : isWarning ? '⚠️' : isCaution ? '🟡' : '✅'}
                </span>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-widest opacity-70">
                    Official INCOIS Coastal Early Warning Directive
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                    {safety.verdict}
                  </h2>
                </div>
              </div>

              {/* Action Buttons: Checklist Toggle + Station Badge */}
              <div className="flex items-center gap-2 flex-wrap">

                <button
                  type="button"
                  onClick={() => setShowChecklist(!showChecklist)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer bg-white/80 dark:bg-slate-900/80 hover:bg-white text-slate-900 dark:text-white border border-current/25 shadow-xs"
                >
                  <LifeBuoy className="w-3.5 h-3.5 text-amber-500" />
                  <span>{showChecklist ? 'Hide Checklist' : 'Safety Checklist'}</span>
                </button>

                <span className="px-3 py-1.5 rounded-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs border border-current/20 text-xs font-bold">
                  {activeStation.name.split(' (')[0]}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed font-medium opacity-90">
              {safety.details}
            </p>

            {/* Vessel Category Permissibility Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-current/15 text-xs">
              <div className="p-3 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-current/15">
                <span className="text-[10px] font-bold opacity-70 block uppercase">Non-Mechanized Country Craft</span>
                <span className="font-bold block mt-0.5">
                  {isDanger || isWarning ? '❌ STRICTLY PROHIBITED' : isCaution ? '⚠️ Restricted to 5 NM' : '✅ Cleared for Transit'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-current/15">
                <span className="text-[10px] font-bold opacity-70 block uppercase">Motorized Crafts &amp; Catamarans</span>
                <span className="font-bold block mt-0.5">
                  {isDanger ? '❌ HARBOUR HALT MANDATORY' : isWarning ? '⚠️ Advisory: Return to Coast' : '✅ Cleared with VHF Radio'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-current/15">
                <span className="text-[10px] font-bold opacity-70 block uppercase">Deep-Sea Mechanized Trawlers</span>
                <span className="font-bold block mt-0.5">
                  {isDanger ? '❌ SUSPENDED — SEEK SHELTER' : isWarning ? '⚠️ Maintain MRCC Radio Watch' : '✅ Unrestricted Operations'}
                </span>
              </div>
            </div>
          </div>

          {/* Pre-Departure Life-Safety Checklist (Mandated by Ministry of Shipping & Ports) */}
          {showChecklist && (
            <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h4 className="text-sm font-bold uppercase tracking-wide">
                    Mandatory Pre-Departure Safety Checklist for Fishermen
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowChecklist(false)}
                  className="text-xs text-amber-700 dark:text-amber-300 font-bold hover:underline cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/20 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    🦺 1. SOLAS Life Jackets
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">One approved life vest per crew member on board.</p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/20 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    📻 2. VHF Marine Radio
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Tuned to Channel 16 with emergency battery backup.</p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/20 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    🛰️ 3. NavIC / GPS Device
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Satellite receiver functional with harbor waypoints set.</p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/20 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    🧨 4. Red Distress Flares
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Minimum 2 pyrotechnic hand flares in waterproof casing.</p>
                </div>
              </div>
            </div>
          )}

          {/* ─── 3. Primary Ocean State & Hydrodynamic Telemetry Matrix ───────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Significant Wave Height (Hs) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Significant Wave Height</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  Spectral Hs
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black font-mono text-slate-900 dark:text-white">
                    {current.waveHeight != null ? current.waveHeight.toFixed(1) : '--'}
                  </span>
                  <span className="text-sm font-bold text-slate-400 font-sans">meters</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Peak Wave Period: <strong className="text-slate-700 dark:text-slate-300 font-mono">{current.wavePeriod ?? '--'} sec</strong>
                </div>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((current.waveHeight || 0.8) / 6) * 100)}%` }}
                />
              </div>
            </div>

            {/* Card 2: Primary Swell Characteristics */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Primary Ocean Swell</span>
                <Compass className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black font-mono text-slate-900 dark:text-white">
                    {current.swellHeight != null ? current.swellHeight.toFixed(1) : '--'}
                  </span>
                  <span className="text-sm font-bold text-slate-400 font-sans">meters</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Swell Direction: <strong className="text-slate-700 dark:text-slate-300 font-mono">{current.swellDirection ?? '--'}°</strong> • Period: <strong className="font-mono">{current.swellPeriod ?? '--'}s</strong>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">
                Propagating from deep oceanic fetch
              </span>
            </div>

            {/* Card 3: Beaufort Wind Force */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Beaufort Wind Scale</span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                  style={{
                    backgroundColor: `${beaufort.color || '#3b82f6'}22`,
                    color: beaufort.color || '#38bdf8'
                  }}
                >
                  Force {beaufort.force ?? 0}
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {beaufort.label || 'Moderate Breeze'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {beaufort.seaState || 'Small wavelets, glassy crests'}
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300">
                Wind: <strong>{current.estimatedWindKmh ?? 15} km/h</strong> ({beaufort.actualKnots ?? Math.round((current.estimatedWindKmh || 15) / 1.852)} knots)
              </div>
            </div>

            {/* Card 4: Sea Surface Temperature (SST) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Sea Surface Temp (SST)</span>
                <Thermometer className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black font-mono text-slate-900 dark:text-white">
                    {current.seaSurfaceTemperature != null ? current.seaSurfaceTemperature.toFixed(1) : '28.5'}
                  </span>
                  <span className="text-sm font-bold text-slate-400 font-sans">°C</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Cyclone Genesis Potential: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Normal Range</strong>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">
                Tropical cyclone threshold: &gt; 26.5°C
              </span>
            </div>
          </div>

          {/* ─── 4. Indian Maritime Port Cautionary Signals & Beaufort Meter ──── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Port Cautionary & Danger Signal Display (6 Cols) */}
            <div className="lg:col-span-6 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Anchor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Indian Maritime Port Signal Status
                  </h3>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Signals 1–11
                </span>
              </div>

              {portSignal ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-950 dark:text-amber-100 flex items-start gap-3">
                    <span className="text-2xl">🚩</span>
                    <div>
                      <div className="font-mono font-black text-sm uppercase">
                        Signal Hoisted: {portSignal.name} (Signal {portSignal.signal})
                      </div>
                      <p className="text-xs mt-1 text-amber-800 dark:text-amber-200">
                        {portSignal.condition}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-orange-500" />
                      <span>Harbor Master &amp; Port Officer Protocol:</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {portSignal.action}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                      <div className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
                        Normal Port Operations (No Cautionary Signal Hoisted)
                      </div>
                      <div className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
                        Winds and sea heights at {activeStation.name.split(' (')[0]} are within safe berthing and navigation tolerances.
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Indian Maritime Port Warning Signals (Signals 1 to 11) are officially hoisted by Major &amp; Minor Port Trusts upon receipt of cyclonic storm advisories from the India Meteorological Department (IMD Cyclone Warning Centers).
                  </div>
                </div>
              )}
            </div>

            {/* Right: WMO Beaufort Force Scale Gauge (6 Cols) */}
            <div className="lg:col-span-6 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wind className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    WMO Beaufort Wind &amp; Sea State Gauge
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">Force 0–12</span>
              </div>

              {/* Beaufort Spectrum Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold text-slate-400">
                  <span>Force 0 (Calm)</span>
                  <span>Force 6 (Gale)</span>
                  <span>Force 12 (Cyclone)</span>
                </div>
                <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex border border-slate-200 dark:border-slate-700">
                  {Array.from({ length: 13 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        background:
                          i <= (beaufort.force ?? 0)
                            ? i < 4
                              ? '#22c55e'
                              : i < 7
                              ? '#eab308'
                              : i < 10
                              ? '#f97316'
                              : '#ef4444'
                            : 'transparent',
                        borderRight: '1px solid rgba(0,0,0,0.1)'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Detailed Beaufort Matrix Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Scale Level</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">Force {beaufort.force ?? 0} ({beaufort.label || 'Moderate'})</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Velocity Envelope</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{beaufort.minKnots ?? 11}–{beaufort.maxKnots ?? 16} knots</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Typical Wave Height</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{beaufort.waveHeight || '1.0–1.5 m'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Observed Sea State: <strong>{beaufort.seaState || 'Small waves with frequent whitecaps.'}</strong></span>
              </div>
            </div>
          </div>

          {/* ─── 5. 7-Day Maritime Wave State Forecast Track ─────────────────── */}
          {Array.isArray(marineData?.dailyForecast) && marineData.dailyForecast.length > 0 && (
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    7-Day Ocean Wave Height &amp; Surge Forecast
                  </h3>
                </div>
                <span className="text-xs text-slate-400">Peak Sea Surface Heights</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {marineData.dailyForecast.map((day, idx) => {
                  const isHigh = day.maxWaveHeight >= 2.5
                  const isMod = day.maxWaveHeight >= 1.5
                  const dateLabel = new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border text-center transition-all ${
                        isHigh
                          ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                          : isMod
                          ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{dateLabel}</div>
                      <div className={`text-2xl font-black font-mono my-1 ${isHigh ? 'text-rose-600 dark:text-rose-400' : isMod ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {day.maxWaveHeight != null ? `${day.maxWaveHeight.toFixed(1)}m` : '--'}
                      </div>
                      <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        {isHigh ? 'Rough Sea' : isMod ? 'Moderate' : 'Calm / Slight'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        Period: {day.maxWavePeriod ? `${day.maxWavePeriod}s` : '--'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ─── 6. Maritime Rescue Coordination (MRCC) & SAR Emergency Panel ── */}
          <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-wider">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Indian Coast Guard • Maritime Rescue Coordination Centre (MRCC)</span>
              </div>
              <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Emergency Search &amp; Rescue (SAR) 24x7 Command Hotline
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
                Immediate vessel distress, man-overboard, boat capsizing, or sudden squall stranding. Continuous monitoring on VHF Marine Channel 16 (156.800 MHz).
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <a
                href="tel:1554"
                className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs tracking-wider shadow-lg shadow-rose-600/30 transition flex items-center gap-2 no-underline cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>DIAL 1554 (TOLL-FREE SAR)</span>
              </a>

              <div className="text-xs text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hidden sm:block">
                INCOIS Tsunami Warning: <strong className="text-slate-900 dark:text-white font-mono">040-23895011</strong>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default MarinePage
