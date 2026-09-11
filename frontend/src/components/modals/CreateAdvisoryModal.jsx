import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents
} from 'react-leaflet'
import L from 'leaflet'
import {
  X,
  AlertTriangle,
  Send,
  MapPin,
  Clock,
  Shield,
  FileText,
  Crosshair,
  Layers
} from 'lucide-react'
import { useWeather } from '../../context/WeatherContext'
import { api } from '../../services/api'

// District preset navigation shortcuts (not restrictive)
const DISTRICT_PRESETS = [
  {
    name: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.5204,
    lng: 73.8567
  },
  {
    name: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.076,
    lng: 72.8777
  },
  {
    name: 'Nashik',
    district: 'Nashik',
    state: 'Maharashtra',
    lat: 19.9975,
    lng: 73.7898
  },
  {
    name: 'Ratnagiri',
    district: 'Ratnagiri',
    state: 'Maharashtra',
    lat: 16.9902,
    lng: 73.312
  },
  {
    name: 'Kolhapur',
    district: 'Kolhapur',
    state: 'Maharashtra',
    lat: 16.705,
    lng: 74.2433
  },
  {
    name: 'Nagpur',
    district: 'Nagpur',
    state: 'Maharashtra',
    lat: 21.1458,
    lng: 79.0882
  },
  {
    name: 'Satara',
    district: 'Satara',
    state: 'Maharashtra',
    lat: 17.6805,
    lng: 74.0183
  },
  {
    name: 'Chhatrapati Sambhaji Nagar',
    district: 'Aurangabad',
    state: 'Maharashtra',
    lat: 19.8762,
    lng: 75.3433
  },
  {
    name: 'Solapur',
    district: 'Solapur',
    state: 'Maharashtra',
    lat: 17.6599,
    lng: 75.9064
  },
  {
    name: 'Delhi NCR',
    district: 'Delhi',
    state: 'Delhi',
    lat: 28.6139,
    lng: 77.209
  },
  {
    name: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946
  },
  {
    name: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    lat: 13.0827,
    lng: 80.2707
  },
  {
    name: 'Kolkata',
    district: 'Kolkata',
    state: 'West Bengal',
    lat: 22.5726,
    lng: 88.3639
  }
]

const HAZARD_TYPE_MAP = {
  'Heavy Rainfall': 'rain',
  Thunderstorm: 'thunderstorm',
  'Strong Winds': 'strong_wind',
  'Flood Watch': 'flood',
  'Heat Alert': 'heatwave',
  Cyclone: 'cyclone',
  'Cold Wave': 'coldwave',
  Lightning: 'lightning'
}

const SEVERITY_MAP = {
  Red: 'extreme',
  Orange: 'high',
  Yellow: 'moderate',
  Green: 'low'
}

// Mini-map click-to-pick controller
function LocationPickerEvents ({ onPick }) {
  useMapEvents({
    click (e) {
      if (e.latlng && typeof onPick === 'function') {
        onPick(e.latlng.lat, e.latlng.lng)
      }
    }
  })
  return null
}

// Map center controller
function MiniMapController ({ center }) {
  const map = useMap()
  useEffect(() => {
    if (
      center &&
      typeof center.lat === 'number' &&
      typeof center.lng === 'number'
    ) {
      map.flyTo([center.lat, center.lng], map.getZoom(), { duration: 0.8 })
    }
  }, [center, map])
  return null
}

const createPinIcon = severity => {
  const color =
    severity === 'Red'
      ? '#EF4444'
      : severity === 'Orange'
      ? '#F97316'
      : severity === 'Yellow'
      ? '#EAB308'
      : '#10B981'
  return L.divIcon({
    className: 'custom-alert-pin',
    html: `
      <div style="position:relative; display:flex; align-items:center; justify-content:center; width:28px; height:28px;">
        <span style="position:absolute; width:28px; height:28px; border-radius:9999px; background:${color}; opacity:0.35; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>
        <span style="width:14px; height:14px; border-radius:9999px; background:${color}; border:2.5px solid #ffffff; box-shadow:0 0 10px rgba(0,0,0,0.5);"></span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  })
}

export const CreateAdvisoryModal = ({ isOpen, onClose, onAlertCreated, onCreated, initialDistrict }) => {
  const { addToast } = useWeather()
  const matchedPreset = initialDistrict
    ? DISTRICT_PRESETS.find(p => p.name.toLowerCase() === initialDistrict.toLowerCase())
    : null

  const [formData, setFormData] = useState({
    title: '',
    type: 'Heavy Rainfall',
    district: matchedPreset ? matchedPreset.name : initialDistrict || 'Pune',
    location: matchedPreset ? `${matchedPreset.name} District, Maharashtra` : `${initialDistrict || 'Pune'} District, Maharashtra`,
    latitude: matchedPreset ? matchedPreset.lat : 18.5204,
    longitude: matchedPreset ? matchedPreset.lng : 73.8567,
    severity: 'Orange',
    durationHours: 12,
    action: '',
    description: '',
    affectedUsers: '3,500'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showConfirmPublish, setShowConfirmPublish] = useState(false)
  const [showMiniMap, setShowMiniMap] = useState(true)

  // Lock background body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  // Keyboard accessibility: Escape to close
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errorMessage) setErrorMessage('')
  }

  const handlePresetSelect = e => {
    const selectedName = e.target.value
    const preset = DISTRICT_PRESETS.find(p => p.name === selectedName)
    if (preset) {
      setFormData(prev => ({
        ...prev,
        district: preset.district,
        location: `${preset.district} District, ${preset.state}`,
        latitude: preset.lat,
        longitude: preset.lng
      }))
    }
  }

  const handleMapLocationPick = async (lat, lng) => {
    const roundedLat = Number(lat.toFixed(4))
    const roundedLng = Number(lng.toFixed(4))
    setFormData(prev => ({
      ...prev,
      latitude: roundedLat,
      longitude: roundedLng
    }))

    try {
      const geo = await api.reverseGeocode({
        latitude: roundedLat,
        longitude: roundedLng
      })
      if (geo && (geo.city || geo.region)) {
        const locString = [geo.city, geo.region, geo.country || 'India']
          .filter(Boolean)
          .join(', ')
        setFormData(prev => ({
          ...prev,
          location: locString,
          district: geo.city || prev.district
        }))
      }
    } catch (_) {
      // Reverse geocode is best-effort; coordinates are already set
    }
  }

  const buildPayload = () => {
    const startTime = new Date()
    const endTime = new Date(
      startTime.getTime() +
        Number(formData.durationHours || 12) * 60 * 60 * 1000
    )

    const areas = [
      formData.district,
      `${formData.district} District`,
      formData.location
    ].filter(Boolean)

    return {
      title: formData.title.trim() || `${formData.type} Warning`,
      type: HAZARD_TYPE_MAP[formData.type] || 'rain',
      severity: SEVERITY_MAP[formData.severity] || 'moderate',
      location:
        formData.location.trim() ||
        `${formData.district} District, Maharashtra`,
      affectedAreas: Array.from(new Set(areas)),
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      description:
        formData.description.trim() ||
        `Advisory issued for ${formData.district}. Citizens are advised to follow civil defense directives.`,
      action:
        formData.action.trim() ||
        'Follow official safety guidelines and monitor emergency broadcasts.',
      probability: 'High',
      metadata: {
        district: formData.district,
        estimatedUsers: formData.affectedUsers
      }
    }
  }

  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      setErrorMessage('Please enter an advisory headline.')
      return
    }
    if (!formData.description.trim()) {
      setErrorMessage('Please enter advisory instructions or description.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const payload = buildPayload()
      const draft = await api.createAuthorityAlert(payload)
      addToast(`Advisory draft created for ${formData.district}`, 'info')
      if (onAlertCreated) onAlertCreated(draft)
      if (onCreated) onCreated(draft)
      onClose()
    } catch (err) {
      console.error('Failed to create draft advisory:', err)
      setErrorMessage(err.message || 'Failed to create draft advisory')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePublishImmediate = async () => {
    if (!formData.title.trim()) {
      setErrorMessage('Please enter an advisory headline.')
      return
    }
    if (!formData.description.trim()) {
      setErrorMessage('Please enter advisory instructions or description.')
      return
    }

    // High/Extreme severity confirmation check
    if (
      (formData.severity === 'Red' || formData.severity === 'Orange') &&
      !showConfirmPublish
    ) {
      setShowConfirmPublish(true)
      return
    }

    setShowConfirmPublish(false)
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const payload = buildPayload()
      // 1. Create draft
      const draft = await api.createAuthorityAlert(payload)
      // 2. Publish draft immediately
      const published = await api.publishAuthorityAlert(draft._id || draft.id)
      addToast(
        `Official Advisory published and broadcast to ${formData.district}!`,
        'success'
      )
      if (onAlertCreated) onAlertCreated(published)
      if (onCreated) onCreated(published)
      onClose()
    } catch (err) {
      console.error('Failed to publish advisory:', err)
      setErrorMessage(err.message || 'Failed to publish advisory')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = e => {
    e.preventDefault()
    handlePublishImmediate()
  }

  // Render modal directly to document.body via React Portal to escape all ancestor stacking contexts
  return createPortal(
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-advisory-title'
      className='fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/70 backdrop-blur-xs select-none'
    >
      <div
        onClick={e => e.stopPropagation()}
        className='w-full max-w-xl bg-white dark:bg-[#121316] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp'
      >
        {/* Modal Header (Fixed at top of modal, shrink-0) */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 shrink-0'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40'>
              <Shield className='w-5 h-5' />
            </div>
            <div>
              <h3
                id='modal-advisory-title'
                className='text-base font-bold text-slate-900 dark:text-white'
              >
                Issue Emergency Weather Advisory
              </h3>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                Official public warning broadcast system
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={onClose}
            aria-label='Close dialog'
            className='p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Scrollable Modal Content (flex-1 overflow-y-auto) */}
        <div className='flex-1 overflow-y-auto p-6 space-y-4'>
          {/* Error Banner */}
          {errorMessage && (
            <div className='p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 flex items-center gap-2.5 text-xs font-semibold text-red-600 dark:text-red-400'>
              <AlertTriangle className='w-4 h-4 shrink-0' />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Confirmation Banner for Critical/High Alerts */}
          {showConfirmPublish && (
            <div className='p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/80 space-y-2.5'>
              <div className='flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs sm:text-sm'>
                <AlertTriangle className='w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0' />
                <span>
                  Confirm Immediate Broadcast ({formData.severity} Severity)
                </span>
              </div>
              <p className='text-xs text-amber-700 dark:text-amber-400 leading-relaxed'>
                This will transition the advisory directly to{' '}
                <strong>Active</strong> and push instant real-time notifications
                to all registered citizens within{' '}
                <strong>{formData.location}</strong>.
              </p>
              <div className='flex items-center gap-2 pt-1'>
                <button
                  type='button'
                  onClick={handlePublishImmediate}
                  disabled={isSubmitting}
                  className='px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer'
                >
                  Yes, Broadcast Now
                </button>
                <button
                  type='button'
                  onClick={() => setShowConfirmPublish(false)}
                  className='px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition cursor-pointer'
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <form
            id='advisory-form'
            onSubmit={handleSubmit}
            className='space-y-4'
          >
            {/* Advisory Title */}
            <div>
              <label className='block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5'>
                Advisory Headline *
              </label>
              <input
                type='text'
                name='title'
                required
                placeholder='e.g. Flash Flood & Heavy Inundation Warning'
                value={formData.title}
                onChange={handleChange}
                className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              />
            </div>

            {/* Target Location / Preset Shortcut & Severity Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
              <div>
                <label className='block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5'>
                  District Shortcut Preset
                </label>
                <select
                  onChange={handlePresetSelect}
                  value={
                    DISTRICT_PRESETS.some(p => p.district === formData.district)
                      ? formData.district
                      : ''
                  }
                  className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500'
                >
                  <option value='' disabled>
                    Select district shortcut
                  </option>
                  {DISTRICT_PRESETS.map(p => (
                    <option key={p.name} value={p.district}>
                      {p.name} ({p.state})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5'>
                  Severity Level *
                </label>
                <select
                  name='severity'
                  value={formData.severity}
                  onChange={handleChange}
                  className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500'
                >
                  <option value='Red'>Red (Critical Action Required)</option>
                  <option value='Orange'>Orange (High Alert)</option>
                  <option value='Yellow'>Yellow (Moderate Watch)</option>
                  <option value='Green'>Green (Light Advisory)</option>
                </select>
              </div>
            </div>

            {/* Target Location Input */}
            <div>
              <div className='flex items-center justify-between mb-1.5'>
                <label className='text-xs font-semibold text-slate-700 dark:text-slate-300'>
                  Target Location Name *
                </label>
                <button
                  type='button'
                  onClick={() => setShowMiniMap(!showMiniMap)}
                  className='text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer'
                >
                  <MapPin className='w-3 h-3' />
                  <span>
                    {showMiniMap ? 'Hide Pinpoint Map' : 'Show Pinpoint Map'}
                  </span>
                </button>
              </div>
              <input
                type='text'
                name='location'
                required
                placeholder='e.g. Pune District, Maharashtra'
                value={formData.location}
                onChange={handleChange}
                className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500'
              />
            </div>

            {/* Interactive Real Map Point Picker */}
            {showMiniMap && (
              <div className='space-y-1.5'>
                <div className='relative h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950'>
                  <MapContainer
                    center={[formData.latitude, formData.longitude]}
                    zoom={9}
                    scrollWheelZoom={false}
                    zoomControl={false}
                    className='w-full h-full z-0 leaflet-map-dark'
                  >
                    <MiniMapController
                      center={{
                        lat: formData.latitude,
                        lng: formData.longitude
                      }}
                    />
                    <LocationPickerEvents onPick={handleMapLocationPick} />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                      className='leaflet-tile-dark'
                    />
                    <Marker
                      position={[formData.latitude, formData.longitude]}
                      icon={createPinIcon(formData.severity)}
                    />
                  </MapContainer>
                  <div className='absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-slate-900/85 backdrop-blur-xs text-[11px] font-semibold text-slate-300 border border-slate-700/80 flex items-center gap-1.5 pointer-events-none'>
                    <Crosshair className='w-3 h-3 text-sky-400' />
                    <span>
                      Click map to relocate alert center ({formData.latitude},{' '}
                      {formData.longitude})
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Meteorological Hazard & Validity Duration */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
              <div>
                <label className='block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5'>
                  Meteorological Hazard
                </label>
                <select
                  name='type'
                  value={formData.type}
                  onChange={handleChange}
                  className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500'
                >
                  <option value='Heavy Rainfall'>Heavy Rainfall</option>
                  <option value='Thunderstorm'>Thunderstorm & Lightning</option>
                  <option value='Strong Winds'>Gale & Strong Winds</option>
                  <option value='Flood Watch'>River Basin Flood Watch</option>
                  <option value='Heat Alert'>Severe Heatwave</option>
                  <option value='Cyclone'>Cyclone / Tropical Depression</option>
                  <option value='Lightning'>Convective Lightning Squall</option>
                </select>
              </div>

              <div>
                <label className='block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5'>
                  Validity Period
                </label>
                <select
                  name='durationHours'
                  value={formData.durationHours}
                  onChange={handleChange}
                  className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500'
                >
                  <option value={6}>Next 6 Hours</option>
                  <option value={12}>Next 12 Hours</option>
                  <option value={24}>Next 24 Hours</option>
                  <option value={48}>Next 48 Hours</option>
                  <option value={72}>Next 72 Hours</option>
                </select>
              </div>
            </div>

            {/* Civil Directives / Recommended Action */}
            <div>
              <label className='block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5'>
                Civil Directive / Protection Advice
              </label>
              <input
                type='text'
                name='action'
                placeholder='e.g. Avoid low-lying river areas, keep emergency kit ready'
                value={formData.action}
                onChange={handleChange}
                className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500'
              />
            </div>

            {/* Public Instructions & Description */}
            <div>
              <label className='block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5'>
                Public Instructions & Meteorological Description *
              </label>
              <textarea
                name='description'
                rows={3}
                required
                placeholder='Describe emergency instructions, affected roadways, evacuation recommendations...'
                value={formData.description}
                onChange={handleChange}
                className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none'
              />
            </div>
          </form>
        </div>

        {/* Modal Footer Actions (Fixed at bottom of modal, shrink-0) */}
        <div className='flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 shrink-0'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer'
          >
            Cancel
          </button>

          <div className='flex items-center gap-2.5'>
            <button
              type='button'
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className='flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer disabled:opacity-50'
            >
              <FileText className='w-3.5 h-3.5' />
              <span>{isSubmitting ? 'Saving...' : 'Save Draft'}</span>
            </button>

            <button
              type='button'
              onClick={handlePublishImmediate}
              disabled={isSubmitting}
              className='flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition cursor-pointer disabled:opacity-50'
            >
              <Send className='w-3.5 h-3.5' />
              <span>
                {isSubmitting ? 'Broadcasting...' : 'Publish Immediately'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default CreateAdvisoryModal
