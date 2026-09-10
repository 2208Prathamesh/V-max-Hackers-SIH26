import React, { useState, useEffect } from 'react'
import { useWeather } from '../../context/WeatherContext'
import {
  Plus,
  Eye,
  MoreHorizontal,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  CloudRain,
  Wind,
  Zap,
  Waves,
  Shield,
  Bell,
  MapPin,
  Clock,
  Check,
  ChevronDown,
  Maximize2,
  Share2,
  Download,
  Send,
  XCircle,
  FileText
} from 'lucide-react'
import { initialAuthorityAlerts } from '../../data/mockAuthorityData'
import { CreateAdvisoryModal } from '../../components/modals/CreateAdvisoryModal'
import { api } from '../../services/api'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

function MapViewController ({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (
      center &&
      typeof center[0] === 'number' &&
      typeof center[1] === 'number'
    ) {
      map.setView(center, zoom || 11, { animate: true })
    }
  }, [center, zoom, map])
  return null
}

const createAlertPinIcon = severity => {
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

  return L.divIcon({
    className: 'custom-leaflet-alert-icon',
    html: `
      <div style="position:relative; display:inline-flex; align-items:center; justify-content:center; cursor:pointer;">
        <span style="position:absolute; width:28px; height:28px; border-radius:9999px; background:${color}; opacity:0.35; animation:ping 1.6s cubic-bezier(0,0,0.2,1) infinite;"></span>
        <div style="background:${color}; color:#ffffff; font-size:11px; font-weight:800; padding:4px 10px; border-radius:9999px; display:inline-flex; align-items:center; gap:5px; box-shadow:0 4px 12px rgba(0,0,0,0.5); border:2px solid #ffffff; white-space:nowrap;">
          <span>⚠️</span>
          <span>${sev.toUpperCase()}</span>
        </div>
      </div>
    `,
    iconSize: [80, 28],
    iconAnchor: [40, 14],
    popupAnchor: [0, -16]
  })
}

const normalizeAlert = alert => {
  const id = alert._id || alert.id
  const severity = (alert.severity || 'moderate').toLowerCase()
  const severityLabel =
    severity === 'extreme' || severity === 'red'
      ? 'Red (Critical)'
      : severity === 'high' || severity === 'orange'
      ? 'Orange (High)'
      : severity === 'moderate' || severity === 'yellow'
      ? 'Yellow (Moderate)'
      : 'Green (Light)'

  const startTimeStr = alert.startTime
    ? new Date(alert.startTime).toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Now'
  const expiryTimeStr = alert.endTime
    ? new Date(alert.endTime).toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : alert.expiryTime || 'Ongoing'

  const rawStatus = (alert.status || 'draft').toLowerCase()
  const statusDisplay =
    rawStatus === 'active'
      ? 'Active'
      : rawStatus === 'draft'
      ? 'Draft'
      : rawStatus === 'cancelled'
      ? 'Cancelled'
      : rawStatus === 'expired'
      ? 'Expired'
      : 'Acknowledged'

  return {
    ...alert,
    id,
    _id: id,
    title: alert.title,
    type: alert.type || 'Hazard',
    district:
      alert.metadata?.district ||
      alert.district ||
      (alert.location
        ? alert.location.split(',')[0].replace(' District', '')
        : 'District'),
    location: alert.location || `${alert.district || 'Region'}, Maharashtra`,
    severity:
      severity === 'extreme'
        ? 'Red'
        : severity === 'high'
        ? 'Orange'
        : severity === 'moderate'
        ? 'Yellow'
        : severity === 'low'
        ? 'Green'
        : alert.severity || 'Orange',
    severityLabel,
    severityLevel:
      severity === 'extreme' || severity === 'red'
        ? 'critical'
        : severity === 'high' || severity === 'orange'
        ? 'high'
        : severity === 'moderate' || severity === 'yellow'
        ? 'moderate'
        : 'low',
    startTime: startTimeStr,
    expiryTime: expiryTimeStr,
    status: statusDisplay,
    rawStatus,
    source: alert.source || 'AUTHORITY',
    affectedUsers:
      alert.metadata?.estimatedUsers || alert.affectedUsers || '3,500',
    description: alert.description || 'Public warning advisory issued.',
    action: alert.action || 'Follow safety directives and keep alert.',
    createdBy: alert.createdBy,
    publishedBy: alert.publishedBy,
    cancelledBy: alert.cancelledBy,
    publishedAt: alert.publishedAt,
    cancelledAt: alert.cancelledAt,
    createdAt: alert.createdAt
  }
}

export const AuthorityAlertsPage = () => {
  const { addToast } = useWeather()
  const [alertsList, setAlertsList] = useState([])
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [activeFilterTab, setActiveFilterTab] = useState('all') // 'all' | 'active' | 'draft' | 'cancelled'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [activeModelTab, setActiveModelTab] = useState('imd') // 'imd' | 'gfs' | 'ecmwf'
  const [mapZoom, setMapZoom] = useState(12)
  const [isActionPending, setIsActionPending] = useState(false)
  const [confirmPublishId, setConfirmPublishId] = useState(null)

  const fetchAlerts = async () => {
    try {
      const data = await api.getAuthorityAlerts()
      if (Array.isArray(data) && data.length > 0) {
        setAlertsList(data.map(normalizeAlert))
      } else {
        // Fallback to initial mock if DB has no authority alerts yet
        setAlertsList(initialAuthorityAlerts.map(normalizeAlert))
      }
    } catch (err) {
      console.warn(
        'Could not fetch authority alerts from backend:',
        err.message
      )
      setAlertsList(initialAuthorityAlerts.map(normalizeAlert))
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  const filterTabs = [
    { id: 'all', label: `All (${alertsList.length})` },
    {
      id: 'active',
      label: `Active (${
        alertsList.filter(a => a.rawStatus === 'active').length
      })`
    },
    {
      id: 'draft',
      label: `Drafts (${
        alertsList.filter(a => a.rawStatus === 'draft').length
      })`
    },
    {
      id: 'cancelled',
      label: `Cancelled (${
        alertsList.filter(
          a => a.rawStatus === 'cancelled' || a.rawStatus === 'resolved'
        ).length
      })`
    }
  ]

  const filteredAlerts = alertsList.filter(alert => {
    if (activeFilterTab === 'active') return alert.rawStatus === 'active'
    if (activeFilterTab === 'draft') return alert.rawStatus === 'draft'
    if (activeFilterTab === 'cancelled')
      return alert.rawStatus === 'cancelled' || alert.rawStatus === 'resolved'
    return true
  })

  const handlePublish = async id => {
    setIsActionPending(true)
    try {
      const published = await api.publishAuthorityAlert(id)
      const normalized = normalizeAlert(published)
      setAlertsList(prev => prev.map(a => (a.id === id ? normalized : a)))
      if (selectedAlert?.id === id) {
        setSelectedAlert(normalized)
      }
      addToast(
        'Advisory published and live notifications broadcast to citizens!',
        'success'
      )
      setConfirmPublishId(null)
    } catch (err) {
      console.error('Publish failed:', err)
      addToast(err.message || 'Failed to publish advisory', 'error')
    } finally {
      setIsActionPending(false)
    }
  }

  const handleCancelAlert = async id => {
    setIsActionPending(true)
    try {
      const cancelled = await api.cancelAuthorityAlert(id)
      const normalized = normalizeAlert(cancelled)
      setAlertsList(prev => prev.map(a => (a.id === id ? normalized : a)))
      if (selectedAlert?.id === id) {
        setSelectedAlert(normalized)
      }
      addToast(
        'Advisory has been cancelled and revoked from active feeds.',
        'info'
      )
    } catch (err) {
      console.error('Cancel failed:', err)
      addToast(err.message || 'Failed to cancel advisory', 'error')
    } finally {
      setIsActionPending(false)
    }
  }

  const handleAlertCreated = newAlert => {
    const normalized = normalizeAlert(newAlert)
    setAlertsList(prev => [
      normalized,
      ...prev.filter(a => a.id !== normalized.id)
    ])
    fetchAlerts()
  }

  const getSeverityBadgeClass = severity => {
    switch (severity?.toLowerCase()) {
      case 'red':
      case 'critical':
      case 'extreme':
        return 'bg-red-500 text-white dark:bg-red-600 font-bold'
      case 'orange':
      case 'high':
        return 'bg-orange-500 text-white dark:bg-orange-600 font-bold'
      case 'yellow':
      case 'moderate':
        return 'bg-amber-400 text-slate-950 font-bold'
      case 'green':
      case 'light':
      case 'low':
        return 'bg-emerald-500 text-white dark:bg-emerald-600 font-bold'
      default:
        return 'bg-slate-500 text-white font-bold'
    }
  }

  const getStatusBadgeClass = status => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50'
      case 'draft':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
      case 'cancelled':
        return 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
      case 'expired':
        return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
      case 'acknowledged':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
      case 'resolved':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
    }
  }

  const handleAcknowledge = id => {
    setAlertsList(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, status: 'Acknowledged', rawStatus: 'acknowledged' }
          : a
      )
    )
    if (selectedAlert?.id === id) {
      setSelectedAlert(prev => ({
        ...prev,
        status: 'Acknowledged',
        rawStatus: 'acknowledged'
      }))
    }
    addToast('Alert marked as Acknowledged by District Authority', 'success')
  }

  const handleEscalate = id => {
    addToast(
      'Emergency escalated to State Disaster Response Force (SDRF)',
      'warning'
    )
  }

  const handleResolve = id => {
    handleCancelAlert(id)
  }

  // =========================================================================
  // VIEW 2: ALERT DETAIL PAGE (Matching Image 3 & 4)
  // =========================================================================
  if (selectedAlert) {
    const forecast = selectedAlert.forecastOverview?.[activeModelTab] || {
      expectedRain: '80–120 mm',
      windSpeed: '25–40 km/h',
      thunderstorms: 'Likely',
      floodRisk: 'High'
    }

    return (
      <div className='space-y-6 animate-fadeIn pb-10'>
        {/* Create Advisory Modal */}
        <CreateAdvisoryModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onAlertCreated={handleAlertCreated}
        />

        {/* Confirmation Modal */}
        {confirmPublishId && (
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn'>
            <div className='w-full max-w-md bg-white dark:bg-[#111C2E] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40'>
                  <AlertTriangle className='w-6 h-6' />
                </div>
                <div>
                  <h3 className='text-base font-bold text-slate-900 dark:text-white'>
                    Confirm Emergency Broadcast
                  </h3>
                  <p className='text-xs text-slate-500 dark:text-slate-400'>
                    Broadcast live alert to citizens
                  </p>
                </div>
              </div>
              <p className='text-xs text-slate-600 dark:text-slate-300 leading-relaxed'>
                Publishing this advisory will transition it to{' '}
                <strong>Active</strong> and immediately push real-time
                notifications to registered users within the affected district.
              </p>
              <div className='flex items-center justify-end gap-2.5 pt-2'>
                <button
                  type='button'
                  onClick={() => setConfirmPublishId(null)}
                  className='px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer'
                >
                  Cancel
                </button>
                <button
                  type='button'
                  disabled={isActionPending}
                  onClick={() => handlePublish(confirmPublishId)}
                  className='px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition flex items-center gap-1.5 cursor-pointer'
                >
                  <Send className='w-3.5 h-3.5' />
                  <span>
                    {isActionPending
                      ? 'Broadcasting...'
                      : 'Publish & Broadcast'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Back Link */}
        <button
          onClick={() => setSelectedAlert(null)}
          className='inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer'
        >
          <ArrowLeft className='w-4 h-4' />
          <span>Back to Alerts</span>
        </button>

        {/* Header Bar */}
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111C2E] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm'>
          <div className='flex items-center gap-4'>
            <div className='w-13 h-13 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0'>
              <AlertTriangle className='w-7 h-7' />
            </div>
            <div>
              <div className='flex items-center gap-3 flex-wrap'>
                <h1 className='text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight'>
                  {selectedAlert.title}
                </h1>
                <span className='px-2.5 py-0.5 rounded-full bg-red-600 text-white text-xs font-black shadow-xs'>
                  {selectedAlert.severityLevel === 'critical'
                    ? 'Critical'
                    : selectedAlert.severity}
                </span>
              </div>
              <p className='text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium'>
                {selectedAlert.location}
              </p>
            </div>
          </div>

          {/* Action Buttons Header */}
          <div className='flex items-center gap-2.5 flex-wrap'>
            {selectedAlert.rawStatus === 'draft' && (
              <button
                disabled={isActionPending}
                onClick={() => setConfirmPublishId(selectedAlert.id)}
                className='px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50'
              >
                <Send className='w-4 h-4' />
                <span>Publish Advisory</span>
              </button>
            )}

            {selectedAlert.rawStatus === 'active' && (
              <button
                disabled={isActionPending}
                onClick={() => handleCancelAlert(selectedAlert.id)}
                className='px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50'
              >
                <XCircle className='w-4 h-4' />
                <span>Cancel Advisory</span>
              </button>
            )}

            <button
              onClick={() => handleAcknowledge(selectedAlert.id)}
              className='px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer'
            >
              <Check className='w-4 h-4' />
              <span>Acknowledge</span>
            </button>

            <button
              onClick={() => handleEscalate(selectedAlert.id)}
              className='px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer'
            >
              <Shield className='w-4 h-4 text-orange-500' />
              <span>Escalate</span>
            </button>
          </div>
        </div>

        {/* Two Column Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* LEFT COLUMN: Alert Information (6 Cols) */}
          <div className='lg:col-span-6 bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6'>
            <h2 className='text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800'>
              Alert Information
            </h2>

            {/* Information Key-Value Rows matching Image 3 */}
            <div className='space-y-3.5 text-xs sm:text-sm'>
              <div className='flex items-center justify-between py-1'>
                <span className='text-slate-500 dark:text-slate-400 font-medium'>
                  Type
                </span>
                <span className='font-bold text-slate-900 dark:text-white'>
                  {selectedAlert.type}
                </span>
              </div>

              <div className='flex items-center justify-between py-1'>
                <span className='text-slate-500 dark:text-slate-400 font-medium'>
                  Severity
                </span>
                <span className='px-2.5 py-0.5 rounded-md bg-red-600 text-white text-xs font-bold'>
                  {selectedAlert.severityLabel ||
                    `${selectedAlert.severity} (Critical)`}
                </span>
              </div>

              <div className='flex items-center justify-between py-1'>
                <span className='text-slate-500 dark:text-slate-400 font-medium'>
                  Location
                </span>
                <span className='font-bold text-slate-900 dark:text-white'>
                  {selectedAlert.location}
                </span>
              </div>

              <div className='flex items-center justify-between py-1'>
                <span className='text-slate-500 dark:text-slate-400 font-medium'>
                  Start Time
                </span>
                <span className='font-semibold text-slate-900 dark:text-white'>
                  {selectedAlert.startTime}
                </span>
              </div>

              <div className='flex items-center justify-between py-1'>
                <span className='text-slate-500 dark:text-slate-400 font-medium'>
                  Expiry Time
                </span>
                <span className='font-semibold text-slate-900 dark:text-white'>
                  {selectedAlert.expiryTime}
                </span>
              </div>

              <div className='flex items-center justify-between py-1'>
                <span className='text-slate-500 dark:text-slate-400 font-medium'>
                  Source
                </span>
                <span className='font-bold text-blue-600 dark:text-blue-400'>
                  {selectedAlert.source}
                </span>
              </div>

              <div className='flex items-center justify-between py-1'>
                <span className='text-slate-500 dark:text-slate-400 font-medium'>
                  Status
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${getStatusBadgeClass(
                    selectedAlert.status
                  )}`}
                >
                  {selectedAlert.status}
                </span>
              </div>

              <div className='flex items-center justify-between py-1'>
                <span className='text-slate-500 dark:text-slate-400 font-medium'>
                  Affected Users
                </span>
                <span className='font-bold text-slate-900 dark:text-white'>
                  {selectedAlert.affectedUsers}
                </span>
              </div>
            </div>

            {/* Description Block */}
            <div className='pt-4 border-t border-slate-100 dark:border-slate-800'>
              <h3 className='text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2'>
                Public Directives & Context
              </h3>
              <p className='text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800'>
                {selectedAlert.description}
              </p>
            </div>

            {/* Audit Trail Section */}
            {(selectedAlert.createdBy ||
              selectedAlert.publishedBy ||
              selectedAlert.cancelledBy) && (
              <div className='pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs'>
                <h3 className='font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2'>
                  Official Audit Trail
                </h3>
                {selectedAlert.createdBy && (
                  <div className='flex items-center justify-between py-1 text-slate-500 dark:text-slate-400'>
                    <span>Draft Created By:</span>
                    <span className='font-semibold text-slate-800 dark:text-slate-200'>
                      {selectedAlert.createdBy?.name ||
                        selectedAlert.createdBy?.email ||
                        'Authority Officer'}
                    </span>
                  </div>
                )}
                {selectedAlert.publishedBy && (
                  <div className='flex items-center justify-between py-1 text-slate-500 dark:text-slate-400'>
                    <span>Published By:</span>
                    <span className='font-semibold text-blue-600 dark:text-blue-400'>
                      {selectedAlert.publishedBy?.name ||
                        selectedAlert.publishedBy?.email ||
                        'Authority Officer'}
                    </span>
                  </div>
                )}
                {selectedAlert.cancelledBy && (
                  <div className='flex items-center justify-between py-1 text-slate-500 dark:text-slate-400'>
                    <span>Cancelled By:</span>
                    <span className='font-semibold text-rose-600 dark:text-rose-400'>
                      {selectedAlert.cancelledBy?.name ||
                        selectedAlert.cancelledBy?.email ||
                        'Authority Officer'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Forecast Overview & Affected Area Map (6 Cols) */}
          <div className='lg:col-span-6 space-y-6'>
            {/* Forecast Overview Card */}
            <div className='bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-base font-bold text-slate-900 dark:text-white'>
                  Forecast Overview
                </h2>

                {/* Model Tabs: IMD / GFS / ECMWF */}
                <div className='flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl'>
                  {['imd', 'gfs', 'ecmwf'].map(model => (
                    <button
                      key={model}
                      onClick={() => setActiveModelTab(model)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition uppercase ${
                        activeModelTab === model
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Metric Blocks */}
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                <div className='bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl text-center border border-slate-100 dark:border-slate-800'>
                  <CloudRain className='w-5 h-5 text-blue-500 mx-auto mb-1.5' />
                  <p className='text-sm font-black text-slate-900 dark:text-white'>
                    {forecast.expectedRain}
                  </p>
                  <p className='text-[11px] text-slate-400 font-medium'>
                    Expected Rainfall
                  </p>
                </div>

                <div className='bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl text-center border border-slate-100 dark:border-slate-800'>
                  <Wind className='w-5 h-5 text-cyan-500 mx-auto mb-1.5' />
                  <p className='text-sm font-black text-slate-900 dark:text-white'>
                    {forecast.windSpeed}
                  </p>
                  <p className='text-[11px] text-slate-400 font-medium'>
                    Wind Speed
                  </p>
                </div>

                <div className='bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl text-center border border-slate-100 dark:border-slate-800'>
                  <Zap className='w-5 h-5 text-amber-500 mx-auto mb-1.5' />
                  <p className='text-sm font-black text-slate-900 dark:text-white'>
                    {forecast.thunderstorms}
                  </p>
                  <p className='text-[11px] text-slate-400 font-medium'>
                    Thunderstorms
                  </p>
                </div>

                <div className='bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl text-center border border-slate-100 dark:border-slate-800'>
                  <Waves className='w-5 h-5 text-rose-500 mx-auto mb-1.5' />
                  <p className='text-sm font-black text-slate-900 dark:text-white'>
                    {forecast.floodRisk}
                  </p>
                  <p className='text-[11px] text-slate-400 font-medium'>
                    Flood Risk
                  </p>
                </div>
              </div>
            </div>

            {/* Affected Area (Map) Card */}
            <div className='bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm'>
              <div className='flex items-center justify-between mb-3'>
                <h2 className='text-base font-bold text-slate-900 dark:text-white'>
                  Affected Area (Map)
                </h2>
                <span className='text-xs font-semibold text-slate-500 dark:text-slate-400'>
                  {selectedAlert.district}
                </span>
              </div>

              {/* District Real Interactive Leaflet Map Widget */}
              {(() => {
                const lat =
                  typeof selectedAlert.latitude === 'number'
                    ? selectedAlert.latitude
                    : typeof selectedAlert.lat === 'number'
                    ? selectedAlert.lat
                    : selectedAlert.geometry?.coordinates?.[1] || 18.5204
                const lng =
                  typeof selectedAlert.longitude === 'number'
                    ? selectedAlert.longitude
                    : typeof selectedAlert.lng === 'number'
                    ? selectedAlert.lng
                    : selectedAlert.geometry?.coordinates?.[0] || 73.8567

                return (
                  <div className='relative h-64 rounded-2xl overflow-hidden bg-[#0A111F] border border-slate-200 dark:border-slate-800 z-0'>
                    <MapContainer
                      center={[lat, lng]}
                      zoom={mapZoom}
                      scrollWheelZoom={false}
                      zoomControl={false}
                      className='h-full w-full'
                    >
                      <MapViewController center={[lat, lng]} zoom={mapZoom} />
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                        className='leaflet-tile-dark'
                      />
                      <Marker
                        position={[lat, lng]}
                        icon={createAlertPinIcon(
                          selectedAlert.severityLevel || selectedAlert.severity
                        )}
                      >
                        <Popup>
                          <div className='p-1 text-slate-900'>
                            <div className='font-bold text-xs'>
                              {selectedAlert.title}
                            </div>
                            <div className='text-[11px] text-slate-600'>
                              {selectedAlert.location}
                            </div>
                            <div className='text-[10px] text-slate-500 mt-1 font-mono'>
                              {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>

                    {/* Map Zoom Controls */}
                    <div className='absolute right-3 top-3 z-[400] flex flex-col bg-slate-900/90 rounded-xl border border-white/20 shadow-lg overflow-hidden text-white'>
                      <button
                        onClick={() =>
                          setMapZoom(prev => Math.min(prev + 1, 18))
                        }
                        className='p-2 hover:bg-white/20 transition text-xs font-bold'
                        title='Zoom In'
                      >
                        +
                      </button>
                      <div className='border-t border-white/10' />
                      <button
                        onClick={() =>
                          setMapZoom(prev => Math.max(prev - 1, 6))
                        }
                        className='p-2 hover:bg-white/20 transition text-xs font-bold'
                        title='Zoom Out'
                      >
                        -
                      </button>
                    </div>

                    {/* Bottom Overlay Label */}
                    <div className='absolute bottom-3 left-3 z-[400] px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-xs text-white text-xs font-medium border border-white/10 flex items-center gap-2'>
                      <MapPin className='w-3.5 h-3.5 text-red-400' />
                      <span>
                        {selectedAlert.location || selectedAlert.district} (
                        {lat.toFixed(3)}°N, {lng.toFixed(3)}°E)
                      </span>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6 animate-fadeIn pb-10'>
      {/* Create Advisory Modal */}
      <CreateAdvisoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAlertCreated={handleAlertCreated}
      />

      {/* Confirmation Modal */}
      {confirmPublishId && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn'>
          <div className='w-full max-w-md bg-white dark:bg-[#111C2E] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4'>
            <div className='flex items-center gap-3'>
              <div className='p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40'>
                <AlertTriangle className='w-6 h-6' />
              </div>
              <div>
                <h3 className='text-base font-bold text-slate-900 dark:text-white'>
                  Confirm Emergency Broadcast
                </h3>
                <p className='text-xs text-slate-500 dark:text-slate-400'>
                  Broadcast live alert to citizens
                </p>
              </div>
            </div>
            <p className='text-xs text-slate-600 dark:text-slate-300 leading-relaxed'>
              Publishing this advisory will transition it to{' '}
              <strong>Active</strong> and immediately push real-time
              notifications to registered users within the affected district.
            </p>
            <div className='flex items-center justify-end gap-2.5 pt-2'>
              <button
                type='button'
                onClick={() => setConfirmPublishId(null)}
                className='px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer'
              >
                Cancel
              </button>
              <button
                type='button'
                disabled={isActionPending}
                onClick={() => handlePublish(confirmPublishId)}
                className='px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition flex items-center gap-1.5 cursor-pointer'
              >
                <Send className='w-3.5 h-3.5' />
                <span>
                  {isActionPending ? 'Broadcasting...' : 'Publish & Broadcast'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight'>
            Weather Alerts
          </h1>
          <p className='text-sm font-medium text-slate-500 dark:text-slate-400 mt-1'>
            View and manage all active and past alerts
          </p>
        </div>

        {/* Top Right Create Advisory Button */}
        <button
          type='button'
          onClick={() => setIsCreateModalOpen(true)}
          className='inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold shadow-md shadow-blue-600/20 transition cursor-pointer'
        >
          <Plus className='w-4 h-4' />
          <span>Create Advisory</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className='flex items-center gap-2 overflow-x-auto pb-1'>
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilterTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
              activeFilterTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#111C2E] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alerts Table Card matching Image 2 */}
      <div className='bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30'>
                <th className='px-6 py-4'>Type</th>
                <th className='px-6 py-4'>Location</th>
                <th className='px-6 py-4'>Severity</th>
                <th className='px-6 py-4'>Start Time</th>
                <th className='px-6 py-4'>Expiry Time</th>
                <th className='px-6 py-4'>Status</th>
                <th className='px-6 py-4 text-center'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 dark:divide-slate-800/70 text-sm'>
              {filteredAlerts.map(alert => (
                <tr
                  key={alert.id}
                  className='hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer group'
                  onClick={() => setSelectedAlert(alert)}
                >
                  {/* Type */}
                  <td className='px-6 py-4.5 font-bold text-slate-900 dark:text-white'>
                    <div className='flex items-center gap-2.5'>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          alert.severity === 'Red'
                            ? 'bg-red-500'
                            : alert.severity === 'Orange'
                            ? 'bg-orange-500'
                            : alert.severity === 'Yellow'
                            ? 'bg-amber-400'
                            : 'bg-emerald-500'
                        }`}
                      />
                      <span>{alert.type}</span>
                    </div>
                  </td>

                  {/* Location */}
                  <td className='px-6 py-4.5 font-semibold text-slate-700 dark:text-slate-300'>
                    {alert.district}
                  </td>

                  {/* Severity */}
                  <td className='px-6 py-4.5'>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase ${getSeverityBadgeClass(
                        alert.severity
                      )}`}
                    >
                      {alert.severity}
                    </span>
                  </td>

                  {/* Start Time */}
                  <td className='px-6 py-4.5 font-medium text-slate-500 dark:text-slate-400'>
                    {alert.startTime}
                  </td>

                  {/* Expiry Time */}
                  <td className='px-6 py-4.5 font-medium text-slate-500 dark:text-slate-400'>
                    {alert.expiryTime}
                  </td>

                  {/* Status */}
                  <td className='px-6 py-4.5'>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${getStatusBadgeClass(
                        alert.status
                      )}`}
                    >
                      {alert.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td
                    className='px-6 py-4.5 text-center'
                    onClick={e => e.stopPropagation()}
                  >
                    <div className='flex items-center justify-center gap-2'>
                      {alert.rawStatus === 'draft' && (
                        <button
                          type='button'
                          onClick={() => setConfirmPublishId(alert.id)}
                          className='p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition'
                          title='Publish Advisory'
                        >
                          <Send className='w-4 h-4' />
                        </button>
                      )}

                      {alert.rawStatus === 'active' && (
                        <button
                          type='button'
                          onClick={() => handleCancelAlert(alert.id)}
                          className='p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition'
                          title='Cancel Advisory'
                        >
                          <XCircle className='w-4 h-4' />
                        </button>
                      )}

                      <button
                        type='button'
                        onClick={() => setSelectedAlert(alert)}
                        className='p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition'
                        title='View Alert Details'
                      >
                        <Eye className='w-4 h-4' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
