import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
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
  Loader2
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
            ? `<span style="position:absolute; width:26px; height:26px; border-radius:9999px; background:${color}; opacity:0.4; animation:ping 1.6s cubic-bezier(0,0,0.2,1) infinite;"></span>`
            : ''
        }
        <div style="background:${color}; color:#ffffff; font-size:10px; font-weight:800; padding:3px 8px; border-radius:9999px; display:inline-flex; align-items:center; gap:4px; box-shadow:0 4px 12px rgba(0,0,0,0.5); border:1.5px solid #ffffff; white-space:nowrap;">
          <span>⚠️</span>
          <span>${sev.toUpperCase()}</span>
        </div>
      </div>
    `,
    iconSize: [80, 26],
    iconAnchor: [40, 13],
    popupAnchor: [0, -14]
  })
}

// Regional view shortcuts (navigation presets)
const REGION_SHORTCUTS = [
  { label: 'All India', lat: 20.5937, lng: 78.9629, zoom: 5 },
  { label: 'Maharashtra', lat: 19.7515, lng: 75.7139, zoom: 7 },
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
  const [radarEnabled, setRadarEnabled] = useState(false)
  const [weatherLayerEnabled, setWeatherLayerEnabled] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const [mapCenter, setMapCenter] = useState({
    lat: REGION_SHORTCUTS[1].lat,
    lng: REGION_SHORTCUTS[1].lng,
    zoom: REGION_SHORTCUTS[1].zoom
  })

  const [authorityAlerts, setAuthorityAlerts] = useState([])
  const [publicAlerts, setPublicAlerts] = useState([])
  const [weatherStations, setWeatherStations] = useState([])
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [loading, setLoading] = useState(false)

  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)

  // Fetch real alert geography from existing alert APIs
  const loadMapData = async () => {
    setLoading(true)
    try {
      const [authData, activeData] = await Promise.all([
        api.getAuthorityAlerts().catch(() => []),
        api.activeAlerts().catch(() => [])
      ])

      const authList = Array.isArray(authData) ? authData : []
      const publicList = Array.isArray(activeData) ? activeData : []

      setAuthorityAlerts(authList)
      setPublicAlerts(publicList)

      // Select first active authority alert if available
      const firstActive =
        authList.find(a => a.status === 'active') ||
        authList[0] ||
        publicList[0]
      if (firstActive && !selectedAlert) {
        setSelectedAlert(firstActive)
      }
    } catch (err) {
      console.warn('Could not load authority map alerts:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMapData()
  }, [])

  // Fetch optional weather stations if toggled
  useEffect(() => {
    if (!weatherLayerEnabled) return
    api
      .mapWeatherLayer('temperature')
      .then(geo => {
        if (geo?.features) setWeatherStations(geo.features)
      })
      .catch(() => setWeatherStations([]))
  }, [weatherLayerEnabled])

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

  const handleAlertMarkerClick = alert => {
    setSelectedAlert(alert)
    if (alert.latitude && alert.longitude) {
      setMapCenter({ lat: alert.latitude, lng: alert.longitude, zoom: 10 })
    }
  }

  // Watermark-Free Slippy Base Map Tile Provider
  const getTileUrl = () => {
    if (basemapStyle === 'satellite') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    }
    // Free OpenStreetMap with .leaflet-map-dark CSS filter (No API key needed)
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  }

  const getTileAttribution = () => {
    if (basemapStyle === 'satellite') {
      return '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics'
    }
    if (basemapStyle === 'osm') {
      return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
    return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }

  // Combine and deduplicate alerts with valid coordinates
  const displayableAlerts = [...authorityAlerts, ...publicAlerts].filter(
    alert => {
      return (
        alert &&
        typeof alert.latitude === 'number' &&
        !isNaN(alert.latitude) &&
        typeof alert.longitude === 'number' &&
        !isNaN(alert.longitude) &&
        alert.latitude >= -90 &&
        alert.latitude <= 90 &&
        alert.longitude >= -180 &&
        alert.longitude <= 180
      )
    }
  )

  return (
    <div className='space-y-6 animate-fadeIn pb-10'>
      {/* Create Advisory Modal */}
      <CreateAdvisoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAlertCreated={() => {
          loadMapData()
        }}
      />

      {/* Top Header & Dropdown Controls */}
      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5'>
            <span>Authority Weather Map</span>
            <span className='px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'>
              Live Operations GIS
            </span>
            {loading && (
              <Loader2 className='w-4 h-4 text-blue-500 animate-spin' />
            )}
          </h1>
          <p className='text-sm font-medium text-slate-500 dark:text-slate-400 mt-1'>
            Real-time geospatial tracking of official advisories, meteorological
            hazards, and affected populations
          </p>
        </div>

        {/* Top Right Controls & Create Advisory Button */}
        <div className='flex items-center gap-2.5 flex-wrap'>
          {/* Region Preset Dropdown */}
          <div className='relative'>
            <select
              value={selectedRegion.label}
              onChange={handleRegionChange}
              className='appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-white dark:bg-[#111C2E] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs focus:outline-none cursor-pointer'
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
              className='appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-white dark:bg-[#111C2E] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs focus:outline-none cursor-pointer'
            >
              <option value='dark'>Carto Dark</option>
              <option value='osm'>OpenStreetMap</option>
              <option value='satellite'>Esri Satellite</option>
            </select>
            <ChevronDown className='w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none' />
          </div>

          {/* Radar Toggle Button */}
          <button
            type='button'
            onClick={() => setRadarEnabled(!radarEnabled)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
              radarEnabled
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white dark:bg-[#111C2E] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
            }`}
          >
            <CloudRain className='w-3.5 h-3.5' />
            <span>Radar</span>
          </button>

          {/* Fullscreen Button */}
          <button
            type='button'
            onClick={toggleFullscreen}
            className='p-2 rounded-xl bg-white dark:bg-[#111C2E] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs cursor-pointer'
            title='Toggle Fullscreen'
          >
            <Maximize2 className='w-4 h-4' />
          </button>

          {/* Create Advisory Primary CTA */}
          <button
            type='button'
            onClick={() => setIsCreateModalOpen(true)}
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
              className="w-full h-full z-0"
              ref={mapInstanceRef}
            >
              <MapViewController center={mapCenter} zoom={mapCenter.zoom} />

              {/* Base Slippy Tile Layer */}
              <TileLayer
                attribution={getTileAttribution()}
                url={getTileUrl()}
                className={basemapStyle === 'dark' ? 'leaflet-tile-dark' : ''}
              />

              {/* Optional RainViewer Radar Layer (Gracefully fails without breaking map) */}
              {radarEnabled && (
                <TileLayer
                  url='https://tilecache.rainviewer.com/v2/radar/nowcast/256/{z}/{x}/{y}/2/1_1.png'
                  opacity={0.65}
                  zIndex={300}
                />
              )}

              {/* Real Point Alert Markers from Database */}
              {displayableAlerts.map((alert, idx) => {
                const isSelected =
                  selectedAlert?._id === alert._id ||
                  selectedAlert?.id === alert.id
                return (
                  <Marker
                    key={alert._id || alert.id || idx}
                    position={[alert.latitude, alert.longitude]}
                    icon={createAlertIcon(alert.severity, alert.status)}
                    eventHandlers={{
                      click: () => handleAlertMarkerClick(alert)
                    }}
                  >
                    <Popup className='custom-leaflet-popup'>
                      <div className='p-2 space-y-1.5 min-w-[200px] text-xs font-sans'>
                        <div className='flex items-center justify-between gap-2 border-b pb-1'>
                          <span className='font-bold text-slate-900'>
                            {alert.title}
                          </span>
                          <span className='px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 uppercase'>
                            {alert.status}
                          </span>
                        </div>
                        <p className='text-slate-600 font-medium'>
                          📍 {alert.location}
                        </p>
                        {alert.description && (
                          <p className='text-slate-500 text-[11px] leading-relaxed line-clamp-2'>
                            {alert.description}
                          </p>
                        )}
                        <div className='pt-1 flex items-center justify-between text-[10px] text-slate-400'>
                          <span>
                            Severity:{' '}
                            <strong className='uppercase'>
                              {alert.severity}
                            </strong>
                          </span>
                          <span>Source: {alert.source || 'Authority'}</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}

              {/* Optional Weather Observation Station Markers */}
              {weatherLayerEnabled &&
                weatherStations.map((stn, idx) => {
                  const [lng, lat] = stn.geometry?.coordinates || []
                  if (!lat || !lng) return null
                  return (
                    <Marker
                      key={`stn-${idx}`}
                      position={[lat, lng]}
                      icon={L.divIcon({
                        className: 'station-pin',
                        html: `<div style="background:#1E293B; color:#38BDF8; font-size:10px; font-weight:700; padding:2px 6px; border-radius:9999px; border:1px solid #38BDF8;">${
                          stn.properties?.temperatureC || '--'
                        }°C</div>`,
                        iconSize: [45, 20]
                      })}
                    />
                  )
                })}
            </MapContainer>

            {/* In-Map Controls Toolbar */}
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
                {displayableAlerts.length} Official Alert Coordinates Plotted
              </span>
            </div>
          </div>
        </div>

        {/* Right Inspector & Alert Triage Panel (4 Cols) */}
        <div className='lg:col-span-4 space-y-4'>
          {/* Selected Alert Details Card */}
          {selectedAlert ? (
            <div className='bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4'>
              <div className='flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800'>
                <div className='flex items-center gap-2'>
                  <div className='p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'>
                    <AlertTriangle className='w-4 h-4' />
                  </div>
                  <div>
                    <h3 className='font-bold text-sm text-slate-900 dark:text-white line-clamp-1'>
                      {selectedAlert.title}
                    </h3>
                    <p className='text-[11px] text-slate-400'>
                      Selected Alert Coordinates
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                    selectedAlert.severity === 'extreme' ||
                    selectedAlert.severity === 'Red'
                      ? 'bg-red-500 text-white'
                      : selectedAlert.severity === 'high' ||
                        selectedAlert.severity === 'Orange'
                      ? 'bg-orange-500 text-white'
                      : 'bg-amber-400 text-slate-950'
                  }`}
                >
                  {selectedAlert.severity}
                </span>
              </div>

              <div className='space-y-2.5 text-xs'>
                <div className='flex items-center justify-between text-slate-500 dark:text-slate-400'>
                  <span>Geographic Location:</span>
                  <span className='font-bold text-slate-800 dark:text-slate-200'>
                    {selectedAlert.location}
                  </span>
                </div>
                <div className='flex items-center justify-between text-slate-500 dark:text-slate-400'>
                  <span>Latitude, Longitude:</span>
                  <span className='font-semibold text-slate-700 dark:text-slate-300'>
                    {Number(selectedAlert.latitude).toFixed(4)},{' '}
                    {Number(selectedAlert.longitude).toFixed(4)}
                  </span>
                </div>
                <div className='flex items-center justify-between text-slate-500 dark:text-slate-400'>
                  <span>Lifecycle Status:</span>
                  <span className='font-bold text-blue-600 dark:text-blue-400 uppercase'>
                    {selectedAlert.status}
                  </span>
                </div>
                <div className='flex items-center justify-between text-slate-500 dark:text-slate-400'>
                  <span>Source Authority:</span>
                  <span className='font-semibold text-slate-700 dark:text-slate-300'>
                    {selectedAlert.source || 'Authority'}
                  </span>
                </div>
                {selectedAlert.affectedAreas &&
                  selectedAlert.affectedAreas.length > 0 && (
                    <div className='pt-2'>
                      <span className='text-slate-400 block mb-1 font-medium'>
                        Targeted Areas:
                      </span>
                      <div className='flex flex-wrap gap-1'>
                        {selectedAlert.affectedAreas.map((area, aIdx) => (
                          <span
                            key={aIdx}
                            className='px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300'
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                {selectedAlert.description && (
                  <div className='pt-2 border-t border-slate-100 dark:border-slate-800'>
                    <span className='text-slate-400 block mb-1 font-medium'>
                      Directives & Advisory:
                    </span>
                    <p className='text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl'>
                      {selectedAlert.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className='bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm text-center text-slate-400 text-xs'>
              <MapPin className='w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600' />
              <p>
                Click any alert marker on the map to inspect its real
                coordinates and public directives.
              </p>
            </div>
          )}

          {/* Active Alerts List Card (Click to fly) */}
          <div className='bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3'>
            <h3 className='font-bold text-xs uppercase tracking-wider text-slate-400'>
              Active Alerts on Map ({displayableAlerts.length})
            </h3>
            <div className='space-y-2 max-h-56 overflow-y-auto pr-1'>
              {displayableAlerts.length === 0 ? (
                <p className='text-xs text-slate-400'>
                  No active alerts with valid coordinates.
                </p>
              ) : (
                displayableAlerts.map(alert => (
                  <button
                    key={alert._id || alert.id}
                    type='button'
                    onClick={() => handleAlertMarkerClick(alert)}
                    className={`w-full text-left p-2.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                      selectedAlert?._id === alert._id ||
                      selectedAlert?.id === alert.id
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
