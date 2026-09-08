import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useWeather } from '../../context/WeatherContext'
import { api } from '../../services/api'
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
  CheckCircle2
} from 'lucide-react'
import {
  initialAuthorityAlerts,
  authorityDistrictMapData
} from '../../data/mockAuthorityData'

const createMiniAlertIcon = severity => {
  const sev = String(severity || '').toLowerCase()
  const color =
    sev === 'extreme' || sev === 'red' || sev === 'critical'
      ? '#EF4444'
      : sev === 'high' || sev === 'orange'
      ? '#F97316'
      : '#EAB308'
  return L.divIcon({
    className: 'custom-dashboard-pin',
    html: `<div style="width:14px; height:14px; border-radius:9999px; background:${color}; border:2px solid #ffffff; box-shadow:0 0 8px rgba(0,0,0,0.5);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  })
}

export const AuthorityDashboardPage = () => {
  const { user, setCurrentPage } = useWeather()
  const [liveAlerts, setLiveAlerts] = useState([])

  useEffect(() => {
    let mounted = true
    api
      .getAuthorityAlerts()
      .then(data => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          setLiveAlerts(data.filter(a => a.latitude && a.longitude))
        }
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  const metrics = [
    {
      id: 'active-alerts',
      count: '12',
      label: 'Active Alerts',
      icon: AlertTriangle,
      iconBg: 'bg-red-500/15 dark:bg-red-950/40 text-red-600 dark:text-red-400',
      borderClass: 'border-red-200/80 dark:border-red-900/30'
    },
    {
      id: 'critical-alerts',
      count: '3',
      label: 'Critical Alerts',
      icon: AlertTriangle,
      iconBg:
        'bg-orange-500/15 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-200/80 dark:border-orange-900/30'
    },
    {
      id: 'affected-districts',
      count: '7',
      label: 'Affected Districts',
      icon: MapPin,
      iconBg:
        'bg-blue-500/15 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      borderClass: 'border-blue-200/80 dark:border-blue-900/30'
    },
    {
      id: 'users-notified',
      count: '8,420',
      label: 'Users Notified',
      icon: Users,
      iconBg:
        'bg-emerald-500/15 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-200/80 dark:border-emerald-900/30'
    }
  ]

  const recentAlerts = [
    {
      id: 'ra-1',
      title: 'Heavy Rainfall',
      district: 'Pune District',
      timeAgo: '2 hours ago',
      color: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400'
    },
    {
      id: 'ra-2',
      title: 'Thunderstorm',
      district: 'Mumbai',
      timeAgo: '3 hours ago',
      color: 'bg-orange-500',
      textColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      id: 'ra-3',
      title: 'Strong Winds',
      district: 'Nashik',
      timeAgo: '5 hours ago',
      color: 'bg-orange-500',
      textColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      id: 'ra-4',
      title: 'Heavy Rainfall',
      district: 'Ratnagiri',
      timeAgo: '6 hours ago',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      id: 'ra-5',
      title: 'Flood Watch',
      district: 'Kolhapur',
      timeAgo: '8 hours ago',
      color: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400'
    }
  ]

  return (
    <div className='space-y-6 animate-fadeIn pb-8'>
      {/* Top Banner & Header matching Image 2 */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111C2E] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight'>
            Welcome, {user?.name || 'Dr. A. Sharma'}
          </h1>
          <p className='text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2'>
            <span className='inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse' />
            <span>
              {user?.state || 'Maharashtra State'} Authority • Operations Portal
            </span>
          </p>
        </div>

        <div className='flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300'>
          <div className='flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'>
            <Bell className='w-4 h-4 text-rose-500' />
            <span className='w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold'>
              3
            </span>
          </div>
          <div className='text-right'>
            <p className='text-slate-900 dark:text-white font-bold'>
              Tue, 9 Sep 2025
            </p>
            <p className='text-[11px] text-slate-400'>10:41 AM IST</p>
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
              className={`bg-white dark:bg-[#111C2E] p-5 rounded-3xl border ${m.borderClass} shadow-sm hover:shadow-md transition duration-200 flex items-center gap-4`}
            >
              <div
                className={`w-13 h-13 rounded-2xl flex items-center justify-center flex-shrink-0 ${m.iconBg}`}
              >
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

      {/* Main Grid: Live Weather Map & Recent Alerts */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* LEFT COLUMN: Live Weather Map (8 Cols) */}
        <div className='lg:col-span-8 bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col'>
          {/* Card Header */}
          <div className='px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <h2 className='text-base font-bold text-slate-900 dark:text-white'>
                Live Weather Map
              </h2>
              <span className='px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800'>
                LIVE RADAR
              </span>
            </div>

            <button
              onClick={() => setCurrentPage('weather-map')}
              className='inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
            >
              <span>View Full Map</span>
              <ArrowRight className='w-3.5 h-3.5' />
            </button>
          </div>

          {/* Real Interactive Leaflet Mini-Map */}
          <div className='relative flex-1 min-h-[380px] bg-[#0E1726] overflow-hidden select-none'>
            <MapContainer
              center={[19.7515, 75.7139]}
              zoom={6}
              scrollWheelZoom={false}
              zoomControl={false}
              className='w-full h-full z-0 leaflet-map-dark'
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              />
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

            {/* Map Legend (Right Overlay) */}
            <div className='absolute right-3 top-3 bottom-3 w-36 bg-slate-900/85 backdrop-blur-md rounded-2xl border border-white/15 p-3 text-white text-xs flex flex-col justify-between shadow-2xl z-20'>
              <div className='space-y-2'>
                <span className='text-[10px] font-black uppercase tracking-wider text-slate-400'>
                  Alert Severity
                </span>
                <div className='space-y-1.5 text-[11px]'>
                  <div className='flex items-center gap-2'>
                    <span className='w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 shadow-xs' />
                    <span className='font-medium'>Severe (Red)</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0 shadow-xs' />
                    <span className='font-medium'>High (Orange)</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='w-2.5 h-2.5 rounded-full bg-yellow-500 shrink-0 shadow-xs' />
                    <span className='font-medium'>Moderate (Yellow)</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-xs' />
                    <span className='font-medium'>Light (Green)</span>
                  </div>
                </div>
              </div>

              <div className='pt-2 border-t border-white/10 space-y-2'>
                <span className='text-[10px] font-black uppercase tracking-wider text-slate-400'>
                  Hazards
                </span>
                <div className='space-y-1.5 text-[11px]'>
                  <div className='flex items-center gap-2 text-slate-200'>
                    <CloudRain className='w-3.5 h-3.5 text-blue-400' />
                    <span>Rain</span>
                  </div>
                  <div className='flex items-center gap-2 text-slate-200'>
                    <Zap className='w-3.5 h-3.5 text-amber-400' />
                    <span>Thunderstorm</span>
                  </div>
                  <div className='flex items-center gap-2 text-slate-200'>
                    <Wind className='w-3.5 h-3.5 text-cyan-400' />
                    <span>High Wind</span>
                  </div>
                  <div className='flex items-center gap-2 text-slate-200'>
                    <Waves className='w-3.5 h-3.5 text-indigo-400' />
                    <span>Flood Risk</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Alerts (4 Cols) */}
        <div className='lg:col-span-4 bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between'>
          <div>
            {/* Card Header */}
            <div className='px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between'>
              <h2 className='text-base font-bold text-slate-900 dark:text-white'>
                Recent Alerts
              </h2>
              <button
                onClick={() => setCurrentPage('alerts')}
                className='text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
              >
                View All
              </button>
            </div>

            {/* List of Recent Alerts */}
            <div className='divide-y divide-slate-100 dark:divide-slate-800/80'>
              {recentAlerts.map(alert => (
                <div
                  key={alert.id}
                  onClick={() => setCurrentPage('alerts')}
                  className='px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer flex items-center justify-between gap-3 group'
                >
                  <div className='flex items-center gap-3.5 min-w-0'>
                    <span
                      className={`w-3 h-3 rounded-full ${alert.color} shrink-0 ring-4 ring-slate-100 dark:ring-slate-800 group-hover:scale-110 transition`}
                    />
                    <div className='min-w-0'>
                      <p className='text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400'>
                        {alert.title}
                      </p>
                      <p className='text-xs text-slate-500 dark:text-slate-400 truncate'>
                        {alert.district}
                      </p>
                    </div>
                  </div>

                  <span className='text-xs font-medium text-slate-400 dark:text-slate-500 shrink-0'>
                    {alert.timeAgo}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Footer */}
          <div className='p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20'>
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
    </div>
  )
}
