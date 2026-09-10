import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { useWeather } from '../../context/WeatherContext'
import { api } from '../../services/api'
import { CreateAdvisoryModal } from '../../components/modals/CreateAdvisoryModal'
import {
  Maximize2,
  ChevronDown,
  MapPin,
  Layers,
  CloudRain,
  Thermometer,
  Wind,
  Shield,
  AlertTriangle,
  Plus,
  Minus,
  Crosshair,
  Radio,
  Clock,
  Eye,
  Send,
  Loader2,
  Home,
  PhoneCall,
  Activity,
  CheckCircle2,
  Compass,
  Droplets
} from 'lucide-react'

// Controller to smoothly fly viewport when region or alert selection changes
function MapViewController ({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (
      center &&
      typeof center.lat === 'number' &&
      typeof center.lng === 'number'
    ) {
      map.flyTo([center.lat, center.lng], zoom || map.getZoom(), {
        duration: 1.2,
        easeLinearity: 0.25
      })
    }
  }, [center, zoom, map])
  return null
}

// In-map click handler to inspect telemetry anywhere
function MapClickHandler ({ onMapClick }) {
  useMapEvents({
    click: e => {
      if (onMapClick) onMapClick(e.latlng)
    }
  })
  return null
}

// In-map Action Controls (Zoom In, Zoom Out, Locate Center)
function InMapToolbar ({ onZoomIn, onZoomOut, onResetCenter }) {
  return (
    <div className='absolute top-4 left-4 z-[400] flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-2xl'>
      <button
        type='button'
        onClick={onZoomIn}
        className='p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer'
        title='Zoom In'
      >
        <Plus className='w-4 h-4' />
      </button>
      <button
        type='button'
        onClick={onZoomOut}
        className='p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer'
        title='Zoom Out'
      >
        <Minus className='w-4 h-4' />
      </button>
      <div className='h-[1px] bg-slate-700/80 mx-1 my-0.5' />
      <button
        type='button'
        onClick={onResetCenter}
        className='p-2 text-sky-400 hover:text-sky-300 hover:bg-slate-800 rounded-xl transition cursor-pointer'
        title='Reset Regional View'
      >
        <Crosshair className='w-4 h-4' />
      </button>
    </div>
  )
}

// Factory for real point alert markers
const createAlertIcon = (severity, status) => {
  const sev = String(severity || '').toLowerCase()
  const isRed = sev === 'extreme' || sev === 'red' || sev === 'critical'
  const isOrange = sev === 'high' || sev === 'orange'
  const isYellow = sev === 'moderate' || sev === 'yellow'

  const color = isRed
    ? '#EF4444'
    : isOrange
    ? '#F97316'
    : isYellow
    ? '#EAB308'
    : '#10B981'
  const pulseClass =
    status === 'active' && (isRed || isOrange) ? 'animate-ping' : ''

  return L.divIcon({
    className: 'custom-leaflet-alert-icon',
    html: `
      <div style="position:relative; display:inline-flex; align-items:center; justify-content:center; cursor:pointer;">
        ${
          pulseClass
            ? `<span style="position:absolute; width:34px; height:34px; border-radius:9999px; background:${color}; opacity:0.35; animation:ping 1.4s cubic-bezier(0,0,0.2,1) infinite;"></span>`
            : ''
        }
        <div style="width:22px; height:22px; border-radius:9999px; background:${color}; border:2.5px solid #ffffff; box-shadow:0 0 12px rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; color:#ffffff; font-size:11px; font-weight:900;">
          !
        </div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -14]
  })
}

// Factory for evacuation relief shelter markers
const createShelterIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-shelter-icon',
    html: `
      <div style="width:26px; height:26px; border-radius:9px; background:#2563EB; border:2px solid #ffffff; box-shadow:0 2px 10px rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; color:#ffffff; font-size:13px;">
        🏛️
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -16]
  })
}

// Factory for district risk markers
const createDistrictIcon = (name, severityColor, rainMm, tempC) => {
  return L.divIcon({
    className: 'custom-leaflet-district-icon',
    html: `
      <div style="background:#0F172A; border:1.5px solid ${severityColor}; border-radius:12px; padding:3px 8px; color:#ffffff; font-size:10px; font-weight:800; display:flex; align-items:center; gap:5px; box-shadow:0 4px 12px rgba(0,0,0,0.5); white-space:nowrap;">
        <span style="width:7px; height:7px; border-radius:9999px; background:${severityColor};"></span>
        <span>${name}</span>
        <span style="color:#60A5FA; font-size:9px;">${rainMm}mm</span>
        ${tempC != null ? `<span style="color:#E2E8F0; font-size:9px; border-left:1px solid #334155; padding-left:4px;">${tempC}°</span>` : ''}
      </div>
    `,
    iconSize: [120, 24],
    iconAnchor: [60, 12],
    popupAnchor: [0, -14]
  })
}

// State Geographic Region Shortcuts
const REGION_SHORTCUTS = [
  { label: 'All India View', lat: 21.0, lng: 78.0, zoom: 5 },
  { label: 'Maharashtra (State)', lat: 19.3, lng: 75.8, zoom: 7 },
  { label: 'Konkan Coast', lat: 18.52, lng: 73.02, zoom: 8 },
  { label: 'Western Ghats', lat: 17.68, lng: 73.85, zoom: 8 },
  { label: 'Vidarbha Division', lat: 21.1458, lng: 79.0882, zoom: 8 },
  { label: 'Marathwada', lat: 19.2, lng: 76.5, zoom: 8 },
  { label: 'North Maharashtra', lat: 20.5, lng: 74.5, zoom: 8 }
]

export const AuthorityWeatherMapPage = () => {
  const { addToast } = useWeather()
  const [selectedRegion, setSelectedRegion] = useState(REGION_SHORTCUTS[1]) // Maharashtra default
  const [basemapStyle, setBasemapStyle] = useState('dark') // 'dark' | 'osm' | 'satellite'
  const [radarEnabled, setRadarEnabled] = useState(true)
  const [radarPath, setRadarPath] = useState('')
  const [radarTime, setRadarTime] = useState('')
  const [sheltersEnabled, setSheltersEnabled] = useState(true)
  const [districtsEnabled, setDistrictsEnabled] = useState(true)
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [prefilledDistrict, setPrefilledDistrict] = useState('')

  const [mapCenter, setMapCenter] = useState({
    lat: REGION_SHORTCUTS[1].lat,
    lng: REGION_SHORTCUTS[1].lng,
    zoom: REGION_SHORTCUTS[1].zoom
  })

  const [authorityAlerts, setAuthorityAlerts] = useState([])
  const [districtsData, setDistrictsData] = useState([])
  const [sheltersData, setSheltersData] = useState([])
  const [selectedItem, setSelectedItem] = useState(null) // { type: 'alert'|'shelter'|'district'|'coordinate', data: ... }
  const [loading, setLoading] = useState(false)
  const [inspectingPoint, setInspectingPoint] = useState(false)

  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)

  // Fetch real RainViewer timestamped radar tile URL
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
      .catch(err => console.warn('Could not load RainViewer Doppler radar metadata:', err))
  }, [])

  const loadMapData = useCallback(async () => {
    setLoading(true)
    try {
      const [alertsRes, districtsRes, resourcesRes] = await Promise.all([
        api.getAuthorityAlerts({ status: 'active' }).catch(() => []),
        api.authorityDistricts().catch(() => null),
        api.authorityResources().catch(() => null)
      ])

      const authList = Array.isArray(alertsRes) ? alertsRes : []
      setAuthorityAlerts(authList)

      if (districtsRes?.data && Array.isArray(districtsRes.data)) {
        setDistrictsData(districtsRes.data)
      }

      if (resourcesRes?.data?.shelters) {
        setSheltersData(resourcesRes.data.shelters)
      }

      // Default selection to first active, non-expired, non-cancelled alert
      const now = Date.now()
      const firstActive = authList.find(a => {
        const s = String(a.status || '').toLowerCase()
        if (s !== 'active' || s === 'cancelled' || s === 'cancel' || s === 'expired') return false
        if (a.endTime && new Date(a.endTime).getTime() <= now) return false
        if (a.expiresAt && new Date(a.expiresAt).getTime() <= now) return false
        return true
      })
      if (firstActive && !selectedItem) {
        setSelectedItem({ type: 'alert', data: firstActive })
      }
    } catch (err) {
      console.warn('Could not load authority map layers:', err.message)
    } finally {
      setLoading(false)
    }
  }, [selectedItem])

  useEffect(() => {
    loadMapData()
  }, [loadMapData])

  // Handle clicking anywhere on the map to inspect live weather telemetry
  const handleMapClick = async (latlng) => {
    const lat = Math.round(latlng.lat * 10000) / 10000
    const lng = Math.round(latlng.lng * 10000) / 10000
    setInspectingPoint(true)
    setSelectedItem({
      type: 'coordinate',
      loading: true,
      data: { lat, lng }
    })

    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_gusts_10m,weather_code`)
      if (res.ok) {
        const d = await res.json()
        const cur = d.current || {}
        setSelectedItem({
          type: 'coordinate',
          loading: false,
          data: {
            lat,
            lng,
            temp: cur.temperature_2m,
            rain: cur.precipitation,
            wind: cur.wind_speed_10m,
            gusts: cur.wind_gusts_10m,
            humidity: cur.relative_humidity_2m,
            weatherCode: cur.weather_code
          }
        })
      }
    } catch {
      setSelectedItem(prev => prev ? { ...prev, loading: false } : null)
    } finally {
      setInspectingPoint(false)
    }
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (mapContainerRef.current?.requestFullscreen) {
        mapContainerRef.current.requestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  const handleRegionChange = e => {
    const region = REGION_SHORTCUTS.find(r => r.label === e.target.value)
    if (region) {
      setSelectedRegion(region)
      setMapCenter({ lat: region.lat, lng: region.lng, zoom: region.zoom })
      addToast(`Map centered on ${region.label}`, 'info')
    }
  }

  const getTileUrl = () => {
    if (basemapStyle === 'satellite') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    }
    if (basemapStyle === 'streets') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
    }
    // 100% Free OpenStreetMap with no API keys required
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  }

  const getTileAttribution = () => {
    if (basemapStyle === 'satellite') return '&copy; Esri &mdash; World Imagery'
    if (basemapStyle === 'streets') return '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; World Street Map'
    return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }

  const displayableAlerts = authorityAlerts.filter(alert => {
    // 1. Must have valid coordinates
    if (
      typeof alert.latitude !== 'number' ||
      isNaN(alert.latitude) ||
      typeof alert.longitude !== 'number' ||
      isNaN(alert.longitude) ||
      alert.latitude < -90 ||
      alert.latitude > 90 ||
      alert.longitude < -180 ||
      alert.longitude > 180
    ) {
      return false
    }

    // 2. Strict status check: do not show cancelled, cancel, draft, or expired alerts
    const status = String(alert.status || 'active').toLowerCase()
    if (status === 'cancelled' || status === 'cancel' || status === 'expired' || status === 'draft') {
      return false
    }

    return true
  })

  return (
    <div className='space-y-6 animate-fadeIn pb-12 select-none'>
      {/* Create Advisory Modal */}
      {isCreateModalOpen && (
        <CreateAdvisoryModal
          isOpen={isCreateModalOpen}
          initialDistrict={prefilledDistrict}
          onClose={() => {
            setIsCreateModalOpen(false)
            setPrefilledDistrict('')
          }}
          onAlertCreated={() => {
            loadMapData()
            addToast('Advisory dispatched to district network', 'success')
          }}
        />
      )}

      {/* Top Header & Dropdown Controls */}
      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#111C2E] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm'>
        <div>
          <div className='flex items-center gap-3'>
            <h1 className='text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight'>
              Authority Geospatial Command & GIS
            </h1>
            <span className='px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'>
              LIVE SITUATION ROOM
            </span>
            {loading && <Loader2 className='w-4 h-4 text-blue-500 animate-spin' />}
          </div>
          <p className='text-sm font-medium text-slate-500 dark:text-slate-400 mt-1'>
            Real-time geospatial tracking of official advisories, flood zones, evacuation shelters, and live weather telemetry
          </p>
        </div>

        {/* Top Right Controls & Create Advisory Button */}
        <div className='flex items-center gap-2.5 flex-wrap'>
          {/* Region Preset Dropdown */}
          <div className='relative'>
            <select
              value={selectedRegion.label}
              onChange={handleRegionChange}
              className='appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs focus:outline-none cursor-pointer'
            >
              {REGION_SHORTCUTS.map(r => (
                <option key={r.label} value={r.label}>
                  {r.label}
                </option>
              ))}
            </select>
            <ChevronDown className='w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none' />
          </div>

          {/* Basemap Style Dropdown */}
          <div className='relative'>
            <select
              value={basemapStyle}
              onChange={e => setBasemapStyle(e.target.value)}
              className='appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs focus:outline-none cursor-pointer'
            >
              <option value='dark'>Dark GIS Mode</option>
              <option value='osm'>OpenStreetMap Standard</option>
              <option value='satellite'>Esri Satellite</option>
              <option value='streets'>Esri Streets</option>
            </select>
            <ChevronDown className='w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none' />
          </div>

          {/* Alerts Toggle */}
          <button
            type='button'
            onClick={() => setAlertsEnabled(!alertsEnabled)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
              alertsEnabled
                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <AlertTriangle className='w-3.5 h-3.5' />
            <span>Alerts ({displayableAlerts.length})</span>
          </button>

          {/* District Pins Toggle */}
          <button
            type='button'
            onClick={() => setDistrictsEnabled(!districtsEnabled)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
              districtsEnabled
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <MapPin className='w-3.5 h-3.5' />
            <span>Districts ({districtsData.length})</span>
          </button>

          {/* Shelters Toggle */}
          <button
            type='button'
            onClick={() => setSheltersEnabled(!sheltersEnabled)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
              sheltersEnabled
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Home className='w-3.5 h-3.5' />
            <span>Shelters ({sheltersData.length})</span>
          </button>

          {/* Radar Toggle */}
          <button
            type='button'
            onClick={() => setRadarEnabled(!radarEnabled)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
              radarEnabled
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <CloudRain className='w-3.5 h-3.5' />
            <span>Radar {radarTime ? `(${radarTime})` : ''}</span>
          </button>

          {/* Fullscreen Button */}
          <button
            type='button'
            onClick={toggleFullscreen}
            className='p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-xs cursor-pointer'
            title='Toggle Fullscreen'
          >
            <Maximize2 className='w-4 h-4' />
          </button>

          {/* Create Advisory Primary CTA */}
          <button
            type='button'
            onClick={() => {
              setPrefilledDistrict('')
              setIsCreateModalOpen(true)
            }}
            className='inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition cursor-pointer'
          >
            <Plus className='w-3.5 h-3.5' />
            <span>Issue Advisory</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Real Leaflet Slippy Map & Inspector Panel */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
        {/* Real Interactive Leaflet Slippy Map (8 Cols) */}
        <div className='lg:col-span-8 space-y-4'>
          <div
            ref={mapContainerRef}
            className='relative h-[600px] md:h-[680px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 shadow-xl z-0'
          >
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={mapCenter.zoom}
              scrollWheelZoom={true}
              zoomControl={false}
              className='w-full h-full z-0'
              ref={mapInstanceRef}
            >
              <MapViewController center={mapCenter} zoom={mapCenter.zoom} />
              <MapClickHandler onMapClick={handleMapClick} />

              <TileLayer
                attribution={getTileAttribution()}
                url={getTileUrl()}
                className={basemapStyle === 'dark' ? 'leaflet-tile-dark' : ''}
              />

              {radarEnabled && radarPath && (
                <TileLayer
                  key={radarPath}
                  url={radarPath}
                  opacity={0.68}
                  zIndex={300}
                />
              )}

              {/* Point Alert Markers and Impact Radiuses */}
              {alertsEnabled &&
                displayableAlerts.map((alert, idx) => {
                  const sev = String(alert.severity || '').toLowerCase()
                  const radius = (sev === 'extreme' || sev === 'critical' || sev === 'red')
                    ? 32000
                    : (sev === 'high' || sev === 'orange')
                    ? 20000
                    : 12000
                  const color = (sev === 'extreme' || sev === 'critical' || sev === 'red')
                    ? '#EF4444'
                    : (sev === 'high' || sev === 'orange')
                    ? '#F97316'
                    : '#EAB308'

                  return (
                    <React.Fragment key={alert._id || alert.id || idx}>
                      <Circle
                        center={[alert.latitude, alert.longitude]}
                        radius={radius}
                        pathOptions={{
                          color,
                          fillColor: color,
                          fillOpacity: 0.16,
                          weight: 1.5,
                          dashArray: '4, 4'
                        }}
                      />
                      <Marker
                        position={[alert.latitude, alert.longitude]}
                        icon={createAlertIcon(alert.severity, alert.status)}
                        eventHandlers={{
                          click: () => setSelectedItem({ type: 'alert', data: alert })
                        }}
                      >
                        <Popup className='custom-leaflet-popup'>
                          <div className='p-2 space-y-1.5 min-w-[200px] text-xs font-sans'>
                            <div className='flex items-center justify-between gap-2 border-b pb-1'>
                              <span className='font-bold text-slate-900'>{alert.title}</span>
                              <span className='px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 uppercase'>
                                {alert.status}
                              </span>
                            </div>
                            <p className='text-slate-600 font-medium'>📍 {alert.location}</p>
                            <div className='pt-1 flex items-center justify-between text-[10px] text-slate-400'>
                              <span>Severity: <strong className='uppercase'>{alert.severity}</strong></span>
                              <span>Source: {alert.source || 'Authority'}</span>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    </React.Fragment>
                  )
                })}

              {/* District Markers with Live Rainfall & Real Temperature */}
              {districtsEnabled &&
                districtsData.map(d => (
                  <Marker
                    key={d.id}
                    position={[d.lat, d.lng]}
                    icon={createDistrictIcon(d.name, d.severityColor, d.rainMm, d.tempC)}
                    eventHandlers={{
                      click: () => setSelectedItem({ type: 'district', data: d })
                    }}
                  >
                    <Popup className='custom-leaflet-popup'>
                      <div className='p-2 text-xs font-sans space-y-1 text-slate-900'>
                        <p className='font-bold text-sm'>{d.name}</p>
                        <p className='text-[11px] text-slate-600'>Status: <strong>{d.status}</strong></p>
                        <p className='text-[11px] text-slate-600'>
                          Rainfall: <strong>{d.rainMm} mm</strong> | Temp: <strong>{d.tempC}°C</strong> | Wind: <strong>{d.windKm} km/h</strong>
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}

              {/* Evacuation Shelter Markers */}
              {sheltersEnabled &&
                sheltersData.map(sh => (
                  <Marker
                    key={sh.id}
                    position={[sh.lat, sh.lng]}
                    icon={createShelterIcon()}
                    eventHandlers={{
                      click: () => setSelectedItem({ type: 'shelter', data: sh })
                    }}
                  >
                    <Popup className='custom-leaflet-popup'>
                      <div className='p-2 text-xs font-sans space-y-1 text-slate-900'>
                        <p className='font-bold text-sm'>🏛️ {sh.name}</p>
                        <p className='text-[11px] text-slate-600'>District: <strong>{sh.district}</strong></p>
                        <p className='text-[11px] text-blue-600 font-bold'>Capacity: {sh.capacity} (Occupancy: {sh.occupancy})</p>
                        <p className='text-[10px] text-slate-500'>Manager: {sh.manager} ({sh.phone})</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>

            {/* In-Map Quick Toolbar */}
            <InMapToolbar
              onZoomIn={() => {
                if (mapInstanceRef.current) mapInstanceRef.current.zoomIn()
              }}
              onZoomOut={() => {
                if (mapInstanceRef.current) mapInstanceRef.current.zoomOut()
              }}
              onResetCenter={() => {
                setMapCenter({
                  lat: selectedRegion.lat,
                  lng: selectedRegion.lng,
                  zoom: selectedRegion.zoom
                })
              }}
            />

            {/* Map Status Badge Overlay */}
            <div className='absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-xs text-white text-xs font-semibold border border-slate-700/80 flex items-center gap-2 pointer-events-none z-[400]'>
              <span className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse' />
              <span>
                {displayableAlerts.length} Active Warnings • {sheltersData.length} Shelters Plotted
              </span>
            </div>
          </div>
        </div>

        {/* Right Inspector & Alert Triage Panel (4 Cols) */}
        <div className='lg:col-span-4 space-y-4'>
          {/* Selected Item Details Card */}
          {selectedItem?.type === 'alert' && (
            <div className='bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4'>
              <div className='flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800'>
                <div className='flex items-center gap-2'>
                  <div className='p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'>
                    <AlertTriangle className='w-4 h-4' />
                  </div>
                  <div>
                    <h3 className='font-bold text-sm text-slate-900 dark:text-white line-clamp-1'>
                      {selectedItem.data.title}
                    </h3>
                    <p className='text-[11px] text-slate-400'>Official Hazard Advisory</p>
                  </div>
                </div>
                <span className='px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-red-500 text-white'>
                  {selectedItem.data.severity}
                </span>
              </div>

              <div className='space-y-2.5 text-xs'>
                <div className='flex items-center justify-between text-slate-500 dark:text-slate-400'>
                  <span>Location:</span>
                  <span className='font-bold text-slate-800 dark:text-slate-200'>{selectedItem.data.location}</span>
                </div>
                <div className='flex items-center justify-between text-slate-500 dark:text-slate-400'>
                  <span>Coordinates:</span>
                  <span className='font-semibold text-slate-700 dark:text-slate-300'>
                    {Number(selectedItem.data.latitude).toFixed(4)}, {Number(selectedItem.data.longitude).toFixed(4)}
                  </span>
                </div>
                <div className='flex items-center justify-between text-slate-500 dark:text-slate-400'>
                  <span>Status:</span>
                  <span className='font-bold text-emerald-600 dark:text-emerald-400 uppercase'>{selectedItem.data.status}</span>
                </div>
                {selectedItem.data.description && (
                  <div className='pt-2 border-t border-slate-100 dark:border-slate-800'>
                    <span className='text-slate-400 block mb-1 font-medium'>Directives & Advisory:</span>
                    <p className='text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl'>
                      {selectedItem.data.description}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setPrefilledDistrict(selectedItem.data.location?.split(',')[0].trim() || '')
                  setIsCreateModalOpen(true)
                }}
                className='w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2'
              >
                <Plus className='w-4 h-4' />
                <span>Issue Supplemental Advisory</span>
              </button>
            </div>
          )}

          {selectedItem?.type === 'shelter' && (
            <div className='bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4'>
              <div className='flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800'>
                <div className='flex items-center gap-2'>
                  <div className='p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'>
                    <Home className='w-4 h-4' />
                  </div>
                  <div>
                    <h3 className='font-bold text-sm text-slate-900 dark:text-white line-clamp-1'>
                      {selectedItem.data.name}
                    </h3>
                    <p className='text-[11px] text-slate-400'>Designated Evacuation Facility</p>
                  </div>
                </div>
                <span className='px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'>
                  OPERATIONAL
                </span>
              </div>

              <div className='space-y-2.5 text-xs'>
                <div className='flex items-center justify-between text-slate-500 dark:text-slate-400'>
                  <span>District:</span>
                  <span className='font-bold text-slate-800 dark:text-slate-200'>{selectedItem.data.district}</span>
                </div>
                <div className='flex items-center justify-between text-slate-500 dark:text-slate-400'>
                  <span>Total Capacity:</span>
                  <span className='font-bold text-blue-600 dark:text-blue-400'>{selectedItem.data.capacity} Persons</span>
                </div>
                <div className='flex items-center justify-between text-slate-500 dark:text-slate-400'>
                  <span>Current Occupancy:</span>
                  <span className='font-bold text-slate-800 dark:text-slate-200'>{selectedItem.data.occupancy} Evacuees</span>
                </div>
                <div className='flex items-center justify-between text-slate-500 dark:text-slate-400'>
                  <span>Facility Manager:</span>
                  <span className='font-semibold text-slate-700 dark:text-slate-300'>{selectedItem.data.manager}</span>
                </div>
                <div className='flex items-center justify-between text-slate-500 dark:text-slate-400'>
                  <span>Contact Hotline:</span>
                  <span className='font-mono font-bold text-emerald-600 dark:text-emerald-400'>{selectedItem.data.phone}</span>
                </div>
              </div>

              <div className='w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden'>
                <div
                  style={{ width: `${Math.round((selectedItem.data.occupancy / selectedItem.data.capacity) * 100)}%` }}
                  className='bg-emerald-500 h-full rounded-full'
                />
              </div>
            </div>
          )}

          {selectedItem?.type === 'district' && (
            <div className='bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4'>
              <div className='flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800'>
                <div className='flex items-center gap-2'>
                  <div className='p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'>
                    <MapPin className='w-4 h-4' />
                  </div>
                  <div>
                    <h3 className='font-bold text-sm text-slate-900 dark:text-white'>
                      {selectedItem.data.name} District
                    </h3>
                    <p className='text-[11px] text-slate-400'>Population: {selectedItem.data.population}</p>
                  </div>
                </div>
                <span
                  style={{ backgroundColor: `${selectedItem.data.severityColor}20`, color: selectedItem.data.severityColor, borderColor: `${selectedItem.data.severityColor}40` }}
                  className='px-2 py-0.5 rounded-md text-[10px] font-bold border'
                >
                  {selectedItem.data.status}
                </span>
              </div>

              <div className='grid grid-cols-3 gap-2 text-center text-xs'>
                <div className='bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl'>
                  <span className='text-[10px] text-slate-400 block'>Temp</span>
                  <strong className='text-slate-900 dark:text-white'>{selectedItem.data.tempC}°C</strong>
                </div>
                <div className='bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl'>
                  <span className='text-[10px] text-slate-400 block'>Precipitation</span>
                  <strong className='text-blue-600 dark:text-blue-400'>{selectedItem.data.rainMm} mm</strong>
                </div>
                <div className='bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl'>
                  <span className='text-[10px] text-slate-400 block'>Wind</span>
                  <strong className='text-slate-900 dark:text-white'>{selectedItem.data.windKm} km/h</strong>
                </div>
              </div>

              <div className='space-y-2 text-xs'>
                <div className='flex items-center justify-between text-slate-500 dark:text-slate-400'>
                  <span>Flood Vulnerability:</span>
                  <strong className='text-slate-900 dark:text-white'>{selectedItem.data.floodRisk}</strong>
                </div>
                <div className='flex items-center justify-between text-slate-500 dark:text-slate-400'>
                  <span>Relief Shelters in District:</span>
                  <strong className='text-slate-900 dark:text-white'>{selectedItem.data.sheltersCount} Centers</strong>
                </div>
              </div>

              <button
                onClick={() => {
                  setPrefilledDistrict(selectedItem.data.name)
                  setIsCreateModalOpen(true)
                }}
                className='w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2'
              >
                <Plus className='w-4 h-4' />
                <span>Issue Alert for {selectedItem.data.name}</span>
              </button>
            </div>
          )}

          {selectedItem?.type === 'coordinate' && (
            <div className='bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4 animate-fadeIn'>
              <div className='flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800'>
                <div className='flex items-center gap-2'>
                  <div className='p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400'>
                    <Crosshair className='w-4 h-4' />
                  </div>
                  <div>
                    <h3 className='font-bold text-sm text-slate-900 dark:text-white'>
                      GPS Pin Telemetry
                    </h3>
                    <p className='text-[11px] text-slate-400 font-mono'>
                      {selectedItem.data.lat?.toFixed(4)}° N, {selectedItem.data.lng?.toFixed(4)}° E
                    </p>
                  </div>
                </div>
                <span className='px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800'>
                  POINT SENSOR
                </span>
              </div>

              {selectedItem.loading ? (
                <div className='py-6 flex flex-col items-center justify-center text-xs text-slate-400 gap-2'>
                  <Loader2 className='w-5 h-5 text-blue-500 animate-spin' />
                  <span>Querying real-time satellite & surface telemetry...</span>
                </div>
              ) : (
                <>
                  <div className='grid grid-cols-3 gap-2 text-center text-xs'>
                    <div className='bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl'>
                      <span className='text-[10px] text-slate-400 block'>Surface Temp</span>
                      <strong className='text-slate-900 dark:text-white'>{selectedItem.data.temp != null ? `${selectedItem.data.temp}°C` : '--'}</strong>
                    </div>
                    <div className='bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl'>
                      <span className='text-[10px] text-slate-400 block'>Precipitation</span>
                      <strong className='text-blue-600 dark:text-blue-400'>{selectedItem.data.rain != null ? `${selectedItem.data.rain} mm` : '0 mm'}</strong>
                    </div>
                    <div className='bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl'>
                      <span className='text-[10px] text-slate-400 block'>Wind Speed</span>
                      <strong className='text-slate-900 dark:text-white'>{selectedItem.data.wind != null ? `${selectedItem.data.wind} km/h` : '--'}</strong>
                    </div>
                  </div>

                  <div className='space-y-2 text-xs'>
                    <div className='flex items-center justify-between text-slate-500 dark:text-slate-400'>
                      <span>Relative Humidity:</span>
                      <strong className='text-slate-800 dark:text-slate-200'>{selectedItem.data.humidity != null ? `${selectedItem.data.humidity}%` : '--'}</strong>
                    </div>
                    {selectedItem.data.gusts != null && (
                      <div className='flex items-center justify-between text-slate-500 dark:text-slate-400'>
                        <span>Peak Wind Gusts:</span>
                        <strong className='text-slate-800 dark:text-slate-200'>{selectedItem.data.gusts} km/h</strong>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setPrefilledDistrict(`Lat: ${selectedItem.data.lat}, Lng: ${selectedItem.data.lng}`)
                      setIsCreateModalOpen(true)
                    }}
                    className='w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-blue-600/20'
                  >
                    <Plus className='w-4 h-4' />
                    <span>Issue Advisory at this Coordinate</span>
                  </button>
                </>
              )}
            </div>
          )}

          {!selectedItem && (
            <div className='bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm text-center text-slate-400 text-xs'>
              <MapPin className='w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600' />
              <p>Click any district badge, official hazard marker, or evacuation shelter on the map to inspect telemetry.</p>
            </div>
          )}

          {/* Active Alerts List Card (Click to fly) */}
          <div className='bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3'>
            <h3 className='font-bold text-xs uppercase tracking-wider text-slate-400'>
              Active Alerts Plotted ({displayableAlerts.length})
            </h3>
            <div className='space-y-2 max-h-56 overflow-y-auto pr-1'>
              {displayableAlerts.length === 0 ? (
                <p className='text-xs text-slate-400'>No active alerts with valid coordinates.</p>
              ) : (
                displayableAlerts.map(alert => (
                  <button
                    key={alert._id || alert.id}
                    type='button'
                    onClick={() => {
                      setSelectedItem({ type: 'alert', data: alert })
                      setMapCenter({ lat: alert.latitude, lng: alert.longitude, zoom: 10 })
                    }}
                    className={`w-full text-left p-2.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                      selectedItem?.data?._id === alert._id || selectedItem?.data?.id === alert.id
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 ring-1 ring-blue-500/30'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <p className='font-bold text-xs text-slate-900 dark:text-white line-clamp-1'>
                        {alert.title}
                      </p>
                      <p className='text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1'>
                        📍 {alert.location}
                      </p>
                    </div>
                    <span className='px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'>
                      {alert.severity}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthorityWeatherMapPage
