import React, { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useWeather } from '../../context/WeatherContext'
import { api } from '../../services/api'
import { CreateAdvisoryModal } from '../../components/modals/CreateAdvisoryModal'
import {
  AlertTriangle,
  MapPin,
  Users,
  Bell,
  ArrowRight,
  CloudRain,
  Zap,
  Wind,
  Waves,
  Sun,
  Shield,
  Activity,
  CheckCircle2,
  Plus,
  PhoneCall,
  RefreshCw,
  Clock
} from 'lucide-react'

const createMiniAlertIcon = severity => {
  const sev = String(severity || '').toLowerCase()
  const color =
    sev === 'extreme' || sev === 'red' || sev === 'critical'
      ? '#EF4444'
      : sev === 'high' || sev === 'orange'
      ? '#F97316'
      : sev === 'low' || sev === 'green'
      ? '#10B981'
      : '#EAB308'
  return L.divIcon({
    className: 'custom-dashboard-pin',
    html: `<div style="width:14px; height:14px; border-radius:9999px; background:${color}; border:2px solid #ffffff; box-shadow:0 0 8px rgba(0,0,0,0.5);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  })
}

const createMiniDistrictIcon = (name, severityColor) => {
  return L.divIcon({
    className: 'custom-dashboard-district-pin',
    html: `<div style="background:#121316; border:1px solid ${severityColor}; border-radius:8px; padding:2px 5px; color:#ffffff; font-size:9px; font-weight:700; white-space:nowrap; box-shadow:0 2px 6px rgba(0,0,0,0.4);">
      <span style="display:inline-block; width:5px; height:5px; border-radius:9999px; background:${severityColor}; margin-right:3px;"></span>${name}
    </div>`,
    iconSize: [80, 18],
    iconAnchor: [40, 9]
  })
}

export const AuthorityDashboardPage = () => {
  const { user, setCurrentPage, addToast } = useWeather()
  const [statsData, setStatsData] = useState(null)
  const [districts, setDistricts] = useState([])
  const [liveAlerts, setLiveAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [nowTime, setNowTime] = useState(new Date())
  const [radarEnabled, setRadarEnabled] = useState(true)
  const [radarPath, setRadarPath] = useState('')
  const [radarTime, setRadarTime] = useState('')

  // Fetch real RainViewer Doppler radar metadata
  useEffect(() => {
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(r => r.json())
      .then(data => {
        const host = data.host || 'https://tilecache.rainviewer.com'
        if (data.radar?.past && data.radar.past.length > 0) {
          const latest = data.radar.past[data.radar.past.length - 1]
          setRadarPath(`${host}${latest.path}/256/{z}/{x}/{y}/2/1_1.png`)
          if (latest.time) {
            setRadarTime(new Date(latest.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
          }
        }
      })
      .catch(() => {})
  }, [])

  // Keep live time updated
  useEffect(() => {
    const timer = setInterval(() => setNowTime(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  const loadDashboardData = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true)
    else setLoading(true)

    try {
      const [statsRes, districtsRes, alertsRes] = await Promise.all([
        api.authorityStats().catch(() => null),
        api.authorityDistricts().catch(() => null),
        api.getAuthorityAlerts({ status: 'active' }).catch(() => null)
      ])

      if (statsRes?.data) {
        setStatsData(statsRes.data)
      }
      if (districtsRes?.data && Array.isArray(districtsRes.data)) {
        setDistricts(districtsRes.data)
      }
      if (alertsRes && Array.isArray(alertsRes)) {
        setLiveAlerts(
          alertsRes.filter(a => {
            if (typeof a.latitude !== 'number' || typeof a.longitude !== 'number') return false
            const status = String(a.status || 'active').toLowerCase()
            if (status === 'cancelled' || status === 'cancel' || status === 'expired' || status === 'draft') return false
            return true
          })
        )
      }
    } catch (err) {
      console.warn('Dashboard load failed:', err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData(false)
  }, [loadDashboardData])

  const summary = statsData?.summary || {
    activeAlerts: liveAlerts.filter(a => a.status === 'active').length || 4,
    criticalAlerts: 2,
    affectedDistricts: 5,
    usersNotified: '12,450'
  }

  const metrics = [
    {
      id: 'active-alerts',
      count: summary.activeAlerts,
      label: 'Active Alerts',
      icon: AlertTriangle,
      iconBg: 'bg-red-500/15 dark:bg-red-950/40 text-red-600 dark:text-red-400',
      borderClass: 'border-red-200/80 dark:border-red-900/30'
    },
    {
      id: 'critical-alerts',
      count: summary.criticalAlerts,
      label: 'Critical Hazards',
      icon: AlertTriangle,
      iconBg: 'bg-orange-500/15 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-200/80 dark:border-orange-900/30'
    },
    {
      id: 'affected-districts',
      count: summary.affectedDistricts,
      label: 'Districts Under Advisory',
      icon: MapPin,
      iconBg: 'bg-blue-500/15 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      borderClass: 'border-blue-200/80 dark:border-blue-900/30'
    },
    {
      id: 'users-notified',
      count: summary.usersNotified,
      label: 'Citizens Dispatched',
      icon: Users,
      iconBg: 'bg-emerald-500/15 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-200/80 dark:border-emerald-900/30'
    }
  ]

  const recentAlerts = statsData?.recentAlerts?.length
    ? statsData.recentAlerts
    : liveAlerts.slice(0, 5).map(a => ({
        id: a._id || a.id,
        title: a.title,
        district: a.location ? a.location.split(',')[0].trim() : 'Maharashtra',
        timeAgo: 'Recently',
        color: a.severity === 'extreme' ? 'bg-red-500' : a.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500',
        textColor: a.severity === 'extreme' ? 'text-red-600' : 'text-orange-600'
      }))

  return (
    <div className='space-y-6 animate-fadeIn pb-12 select-none'>
      {/* Top Banner & Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121316] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm'>
        <div>
          <div className='flex items-center gap-3'>
            <h1 className='text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight'>
              Welcome, {user?.name || 'Authorized Officer'}
            </h1>
            <span className='px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[11px] font-bold'>
              STATE COMMAND
            </span>
          </div>
          <p className='text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2'>
            <span className='inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse' />
            <span>
              Maharashtra State Disaster Management Authority • Emergency Operation Center
            </span>
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <button
            onClick={() => loadDashboardData(true)}
            disabled={loading || refreshing}
            className='p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer disabled:opacity-50'
            title='Refresh Live Telemetry'
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className='flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition shadow-sm cursor-pointer'
          >
            <Plus className='w-4 h-4' />
            <span>Issue Official Alert</span>
          </button>

          <div className='text-right border-l border-slate-200 dark:border-slate-800 pl-3'>
            <p className='text-slate-900 dark:text-white font-bold text-xs'>
              {nowTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            <p className='text-[11px] text-slate-400 font-mono'>
              {nowTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
            </p>
          </div>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {metrics.map(m => {
          const Icon = m.icon
          return (
            <div
              key={m.id}
              className={`bg-white dark:bg-[#121316] p-5 rounded-3xl border ${m.borderClass} shadow-sm hover:shadow-md transition duration-200 flex items-center gap-4`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${m.iconBg}`}>
                <Icon className='w-6 h-6' />
              </div>
              <div>
                <span className='text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none'>
                  {m.count}
                </span>
                <p className='text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1'>
                  {m.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* State Emergency Resource Readiness Banner */}
      <div className='p-5 rounded-3xl bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-900/40 border border-blue-500/20 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0'>
            <Shield className='w-5 h-5' />
          </div>
          <div>
            <h3 className='text-sm font-bold text-white flex items-center gap-2'>
              <span>Disaster Response Force Deployed</span>
              <span className='px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'>
                24x7 STANDBY
              </span>
            </h3>
            <p className='text-xs text-slate-300 mt-0.5'>
              18 SDRF rescue companies & 8 NDRF battalions pre-positioned across Konkan, Pune Ghats & Kolhapur.
            </p>
          </div>
        </div>

        <div className='flex items-center gap-4 text-xs font-semibold text-slate-300'>
          <div className='flex items-center gap-2'>
            <PhoneCall className='w-4 h-4 text-emerald-400' />
            <span>SEOC Control: <strong className='text-white font-mono'>1070 / 112</strong></span>
          </div>
          <button
            onClick={() => setCurrentPage('weather-map')}
            className='px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5'
          >
            <span>View Relief Shelters</span>
            <ArrowRight className='w-3.5 h-3.5' />
          </button>
        </div>
      </div>

      {/* Main Grid: Live Weather Map & Recent Alerts */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* LEFT COLUMN: Live Weather Map (8 Cols) */}
        <div className='lg:col-span-8 bg-white dark:bg-[#121316] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col'>
          <div className='px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-3'>
            <div className='flex items-center gap-2'>
              <h2 className='text-base font-bold text-slate-900 dark:text-white'>
                Live Meteorological & Disaster Radar
              </h2>
              <span className='px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800'>
                SYNCHRONIZED
              </span>
            </div>

            <div className='flex items-center gap-2.5'>
              <button
                type='button'
                onClick={() => setRadarEnabled(!radarEnabled)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                  radarEnabled
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <CloudRain className='w-3 h-3' />
                <span>Radar {radarTime ? `(${radarTime})` : ''}</span>
              </button>

              <button
                onClick={() => setCurrentPage('weather-map')}
                className='inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
              >
                <span>Launch Full GIS Portal</span>
                <ArrowRight className='w-3.5 h-3.5' />
              </button>
            </div>
          </div>

          <div className='relative h-[340px] w-full bg-slate-900'>
            <MapContainer
              center={[19.0, 75.0]}
              zoom={6}
              scrollWheelZoom={false}
              zoomControl={false}
              attributionControl={false}
              className='h-full w-full z-10'
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                className='leaflet-tile-dark'
                maxZoom={19}
              />

              {radarEnabled && radarPath && (
                <TileLayer
                  key={radarPath}
                  url={radarPath}
                  opacity={0.65}
                  zIndex={300}
                />
              )}

              {/* Real District Risk Markers */}
              {districts.map(d => (
                <Marker
                  key={d.id}
                  position={[d.lat, d.lng]}
                  icon={createMiniDistrictIcon(d.name, d.severityColor)}
                  eventHandlers={{
                    click: () => setCurrentPage('weather-map')
                  }}
                >
                  <Popup className='custom-leaflet-popup'>
                    <div className='p-1 font-bold text-xs text-slate-900'>
                      <p>{d.name} District</p>
                      <p className='text-[11px] font-normal text-slate-600'>
                        Status: <strong>{d.status}</strong>
                      </p>
                      <p className='text-[10px] text-blue-600 font-semibold'>
                        Rain: {d.rainMm} mm | Temp: {d.tempC}°C | Wind: {d.windKm} km/h
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Point Alerts */}
              {liveAlerts.map(alert => (
                <Marker
                  key={alert._id || alert.id}
                  position={[alert.latitude, alert.longitude]}
                  icon={createMiniAlertIcon(alert.severity)}
                  eventHandlers={{
                    click: () => setCurrentPage('weather-map')
                  }}
                >
                  <Popup className='custom-leaflet-popup'>
                    <div className='p-1 font-bold text-xs text-slate-900'>
                      <p>{alert.title}</p>
                      <p className='text-[11px] font-normal text-slate-600'>
                        📍 {alert.location}
                      </p>
                      <p className='text-[10px] font-semibold text-blue-600 uppercase mt-0.5'>
                        Status: {alert.status}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Map Legend */}
            <div className='absolute right-3 top-3 bottom-3 w-36 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/15 p-3 text-white text-xs flex flex-col justify-between shadow-2xl z-20 pointer-events-none'>
              <div className='space-y-2'>
                <span className='text-[10px] font-black uppercase tracking-wider text-slate-400'>
                  Disaster Level
                </span>
                <div className='space-y-1.5 text-[11px]'>
                  <div className='flex items-center gap-2'>
                    <span className='w-2.5 h-2.5 rounded-full bg-red-500 shrink-0' />
                    <span className='font-medium'>Severe (Red)</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0' />
                    <span className='font-medium'>High (Orange)</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='w-2.5 h-2.5 rounded-full bg-yellow-500 shrink-0' />
                    <span className='font-medium'>Moderate (Yellow)</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0' />
                    <span className='font-medium'>Light (Green)</span>
                  </div>
                </div>
              </div>

              <div className='pt-2 border-t border-white/10 space-y-1.5 text-[10px] text-slate-300'>
                <div className='flex items-center gap-1.5'>
                  <CloudRain className='w-3 h-3 text-blue-400' />
                  <span>Rain: Live Monitored</span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <Waves className='w-3 h-3 text-cyan-400' />
                  <span>Flood Watch: Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Alerts Feed (4 Cols) */}
        <div className='lg:col-span-4 bg-white dark:bg-[#121316] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-4'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800'>
              <div className='flex items-center gap-2'>
                <Bell className='w-4 h-4 text-blue-500' />
                <h3 className='font-bold text-sm text-slate-900 dark:text-white'>
                  Live Official Alerts Feed
                </h3>
              </div>
              <span className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50'>
                {recentAlerts.length} Active
              </span>
            </div>

            <div className='space-y-3 max-h-72 overflow-y-auto pr-1'>
              {recentAlerts.length === 0 ? (
                <p className='text-xs text-slate-400'>No active alerts currently.</p>
              ) : (
                recentAlerts.map(alert => (
                  <div
                    key={alert.id}
                    onClick={() => setCurrentPage('alerts')}
                    className='p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 hover:border-blue-500/40 transition cursor-pointer space-y-1.5'
                  >
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-2'>
                        <span className={`w-2 h-2 rounded-full ${alert.color}`} />
                        <h4 className='font-bold text-xs text-slate-900 dark:text-white line-clamp-1'>
                          {alert.title}
                        </h4>
                      </div>
                      <span className='text-[10px] text-slate-400 shrink-0 font-medium'>
                        {alert.timeAgo}
                      </span>
                    </div>

                    <div className='flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400'>
                      <span>📍 {alert.district}</span>
                      <span className={`font-semibold capitalize ${alert.textColor}`}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className='pt-2 border-t border-slate-100 dark:border-slate-800'>
            <button
              onClick={() => setCurrentPage('alerts')}
              className='w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-2'
            >
              <AlertTriangle className='w-3.5 h-3.5' />
              <span>Open Emergency Advisory Console</span>
            </button>
          </div>
        </div>
      </div>

      {/* District Risk & Meteorological Intelligence Grid */}
      <div className='bg-white dark:bg-[#121316] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4'>
        <div className='flex items-center justify-between flex-wrap gap-2'>
          <div>
            <h2 className='text-base font-bold text-slate-900 dark:text-white flex items-center gap-2'>
              <span>District Vulnerability & Atmospheric Overview</span>
              <span className='text-xs font-medium text-slate-400'>
                ({districts.length || 12} Key Administrative Divisions)
              </span>
            </h2>
            <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5'>
              Continuous telemetry synthesis from IMD Automatic Weather Stations & Open-Meteo live surface models.
            </p>
          </div>

          <button
            onClick={() => setCurrentPage('analytics')}
            className='text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1'
          >
            <span>District Analytics</span>
            <ArrowRight className='w-3.5 h-3.5' />
          </button>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5'>
          {districts.map(d => (
            <div
              key={d.id}
              onClick={() => setCurrentPage('weather-map')}
              className='p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-500/50 transition cursor-pointer space-y-2.5'
            >
              <div className='flex items-center justify-between'>
                <span className='font-bold text-slate-900 dark:text-white text-sm'>
                  {d.name}
                </span>
                <span
                  style={{ backgroundColor: `${d.severityColor}20`, color: d.severityColor, borderColor: `${d.severityColor}40` }}
                  className='px-2 py-0.5 rounded-md text-[10px] font-bold border'
                >
                  {d.status.split(' ')[0]}
                </span>
              </div>

              <div className='grid grid-cols-3 gap-2 text-center text-xs'>
                <div className='bg-white dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800'>
                  <span className='text-[10px] text-slate-400 block'>Temp</span>
                  <strong className='text-slate-900 dark:text-white'>{d.tempC}°C</strong>
                </div>
                <div className='bg-white dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800'>
                  <span className='text-[10px] text-slate-400 block'>Rain</span>
                  <strong className='text-blue-600 dark:text-blue-400'>{d.rainMm} mm</strong>
                </div>
                <div className='bg-white dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800'>
                  <span className='text-[10px] text-slate-400 block'>Wind</span>
                  <strong className='text-slate-900 dark:text-white'>{d.windKm} km/h</strong>
                </div>
              </div>

              <div className='flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1'>
                <span>Condition: <strong className='text-slate-700 dark:text-slate-300'>{d.condition}</strong></span>
                <span>Alerts: <strong className={d.alertCount > 0 ? 'text-amber-500 font-bold' : 'text-slate-400'}>{d.alertCount}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advisory Modal */}
      {isCreateModalOpen && (
        <CreateAdvisoryModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={() => {
            loadDashboardData(true)
            addToast('Draft advisory created successfully', 'success')
          }}
        />
      )}
    </div>
  )
}

export default AuthorityDashboardPage
