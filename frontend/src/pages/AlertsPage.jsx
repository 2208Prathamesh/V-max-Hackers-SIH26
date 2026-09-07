import React, { useState,useEffect, useMemo } from 'react'
import { useWeather } from '../context/WeatherContext'
import { useTranslation } from 'react-i18next'
import {
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Clock,
  Calendar,
  CloudRain,
  Sun,
  SlidersHorizontal,
  RotateCcw,
  Bell,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  Settings as SettingsIcon,
  Globe
} from 'lucide-react'
import { AlertDetailsModal } from '../components/modals/AlertDetailsModal'
import { api } from '../services/api'

// 3D Weather Graphic Illustrations
const RainCloudArt = () => (
  <div className='relative w-20 h-16 sm:w-24 sm:h-20 flex items-center justify-center select-none pointer-events-none'>
    <div className='relative z-10 filter drop-shadow-md'>
      <svg
        className='w-16 h-12 sm:w-20 sm:h-14'
        viewBox='0 0 80 56'
        fill='none'
      >
        <path
          d='M60 42H20C11.16 42 4 34.84 4 26C4 17.65 10.38 10.8 18.65 10.07C22.12 3.84 28.73 0 36 0C45.36 0 53.27 6.46 55.45 15.22C61.42 16.14 66 21.28 66 27.5C66 35.51 59.51 42 51.5 42H60Z'
          fill='url(#rainCloudGrad)'
        />
        <defs>
          <linearGradient
            id='rainCloudGrad'
            x1='10'
            y1='5'
            x2='65'
            y2='45'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='#94A3B8' />
            <stop offset='0.5' stopColor='#64748B' />
            <stop offset='1' stopColor='#475569' />
          </linearGradient>
        </defs>
      </svg>
      {/* Rainfall lines */}
      <div className='flex justify-center gap-2 mt-1 -ml-2'>
        <div className='w-0.5 h-3 bg-blue-500 rounded-full transform -rotate-12 animate-pulse' />
        <div className='w-0.5 h-4 bg-sky-400 rounded-full transform -rotate-12 animate-pulse delay-75' />
        <div className='w-0.5 h-3 bg-blue-500 rounded-full transform -rotate-12 animate-pulse delay-150' />
      </div>
    </div>
  </div>
)

const WindBreezeArt = () => (
  <div className='relative w-20 h-16 sm:w-24 sm:h-20 flex items-center justify-center select-none pointer-events-none'>
    <svg
      className='w-14 h-12 text-sky-500'
      viewBox='0 0 64 48'
      fill='none'
      stroke='currentColor'
      strokeWidth='3.5'
      strokeLinecap='round'
    >
      <path d='M6 14h36a8 8 0 1 0-8-8' />
      <path d='M2 24h48a7 7 0 1 1-7 7' />
      <path d='M12 34h28a6 6 0 1 0-6-6' />
    </svg>
  </div>
)

const SunArt = () => (
  <div className='relative w-20 h-16 sm:w-24 sm:h-20 flex items-center justify-center select-none pointer-events-none'>
    <div className='relative w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-yellow-200 shadow-[0_0_18px_rgba(250,204,21,0.8)] flex items-center justify-center animate-pulse-subtle'>
      <Sun className='w-7 h-7 text-amber-900/30' />
    </div>
  </div>
)

export const AlertsPage = () => {
  const { t } = useTranslation()
  const {
    setCurrentPage,
    addToast,
    isAuthenticated
  } = useWeather()

  const [myAlerts, setMyAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  // Filters State
  const [selectedLocation, setSelectedLocation] = useState('All')
  const [alertTypeFilters, setAlertTypeFilters] = useState({
    all: true,
    warnings: true,
    watch: true,
    information: true
  })
  const [severityFilters, setSeverityFilters] = useState({
    severe: true,
    moderate: true,
    watch: true,
    info: true
  })

  useEffect(() => {
    const fetchMyAlerts = async () => {
      setIsLoading(true)
      try {
        if (!isAuthenticated) {
          setMyAlerts([])
          return
        }
        const data = await api.myAlerts()
        setMyAlerts(Array.isArray(data) ? data : [])
      } catch (error) {
        addToast(error.message || 'Could not load your alerts', 'warning')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMyAlerts()
  }, [isAuthenticated])

  // Modal State
  const [selectedAlertForDetails, setSelectedAlertForDetails] = useState(null)

  // Subscriptions State
  const [userSubscriptions, setUserSubscriptions] = useState([])

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        if (!isAuthenticated) return
        const data = await api.getSubscriptions()
        setUserSubscriptions(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch subscriptions:', error)
      }
    }
    fetchSubscriptions()
  }, [isAuthenticated])

  // Dynamic alerts mapping from backend alerts
  const activeAlertsList = useMemo(() => {
    if (!Array.isArray(myAlerts)) return []
    return myAlerts.map((alert, idx) => {
      const sev = String(
        alert.severity || alert.warningLevel || 'Moderate'
      ).toLowerCase()
      const isSevere = sev === 'red' || sev === 'extreme' || sev === 'severe'
      const isModerate = sev === 'orange' || sev === 'moderate'
      const isWatch = sev === 'yellow' || sev === 'watch'
      const severityLabel = isSevere
        ? 'Severe'
        : isModerate
        ? 'Moderate'
        : isWatch
        ? 'Watch'
        : 'Information'
      const severityLevel = isSevere ? 'high' : isModerate ? 'medium' : 'low'
      const type =
        alert.type ||
        (isSevere || isModerate ? 'warning' : isWatch ? 'watch' : 'information')
      const art = (alert.title || alert.hazard || '')
        .toLowerCase()
        .includes('rain')
        ? 'rain'
        : (alert.title || alert.hazard || '').toLowerCase().includes('wind')
        ? 'wind'
        : (alert.title || alert.hazard || '').toLowerCase().includes('heat')
        ? 'sun'
        : idx % 2 === 0
        ? 'rain'
        : 'wind'

      return {
        id: alert._id || alert.id || `alert-${idx}`,
        title: alert.title || alert.hazard || 'Weather Advisory',
        location:
          alert.location ||
          (alert.affectedAreas ? alert.affectedAreas.join(', ') : 'India'),
        region:
          alert.location ||
          (alert.affectedAreas ? alert.affectedAreas.join(', ') : 'India'),
        type,
        severity: severityLabel,
        severityLevel,
        time:
          alert.time ||
          (alert.startTime
            ? new Date(alert.startTime).toLocaleString([], {
                dateStyle: 'medium',
                timeStyle: 'short'
              })
            : 'Live'),
        effectiveTime: alert.startTime
          ? new Date(alert.startTime).toLocaleString([], {
              dateStyle: 'medium',
              timeStyle: 'short'
            })
          : 'Immediate',
        untilTime: alert.endTime
          ? new Date(alert.endTime).toLocaleString([], {
              dateStyle: 'medium',
              timeStyle: 'short'
            })
          : 'Until further notice',
        probability: alert.probability != null ? `${alert.probability}%` : '--',
        source: alert.source || alert.issuedBy || 'IMD',
        description: alert.description || '--',
        art,
        action: alert.action,
        colorDetails: alert.colorDetails
      }
    })
  }, [myAlerts])

  const recentAlertsList = []

  // Filtering Logic
  const filteredActiveAlerts = useMemo(() => {
    return activeAlertsList.filter(item => {
      // Tab filter
      if (activeTab === 'warnings' && item.type !== 'warning') return false
      if (activeTab === 'watch' && item.type !== 'watch') return false
      if (activeTab === 'information' && item.type !== 'information')
        return false

      // Location filter
      if (
        selectedLocation !== 'All' &&
        !item.location.toLowerCase().includes(selectedLocation.toLowerCase())
      ) {
        return false
      }

      // Severity filter
      if (item.severity === 'Severe' && !severityFilters.severe) return false
      if (item.severity === 'Moderate' && !severityFilters.moderate)
        return false
      if (item.severity === 'Watch' && !severityFilters.watch) return false

      return true
    })
  }, [activeTab, selectedLocation, severityFilters])

  const handleAlertDetails = async alert => {
    setSelectedAlertForDetails(alert)
    if (!/^[a-f\d]{24}$/i.test(String(alert.id))) return

    try {
      const detail = await api.getAlertById(alert.id)
      setSelectedAlertForDetails(current => ({
        ...current,
        description: detail.description || current.description,
        effectiveTime: detail.startTime
          ? new Date(detail.startTime).toLocaleString([], {
              dateStyle: 'medium',
              timeStyle: 'short'
            })
          : current.effectiveTime,
        untilTime: detail.endTime
          ? new Date(detail.endTime).toLocaleString([], {
              dateStyle: 'medium',
              timeStyle: 'short'
            })
          : current.untilTime,
        source: detail.source || current.source
      }))
      await api.markAlertRead(alert.id)
    } catch (error) {
      addToast(error.message || 'Could not load alert details', 'warning')
    }
  }

  const handleClearFilters = () => {
    setSelectedLocation('All')
    setActiveTab('all')
    setAlertTypeFilters({
      all: true,
      warnings: true,
      watch: true,
      information: true
    })
    setSeverityFilters({
      severe: true,
      moderate: true,
      watch: true,
      info: true
    })
    addToast('Filters reset to default', 'info')
  }

  const handleSubscriptionToggle = async (locationId, currentStatus) => {
    try {
      const newStatus = !currentStatus
      await api.toggleSubscription(locationId, newStatus)

      setUserSubscriptions(prev =>
        prev.map(loc =>
          loc._id === locationId ? { ...loc, notificationsEnabled: newStatus } : loc
        )
      )

      const locationName = userSubscriptions.find(l => l._id === locationId)?.name || 'Location'
      addToast(
        `${locationName} alert subscription ${
          newStatus ? 'enabled' : 'disabled'
        }`,
        'info'
      )
    } catch (error) {
      addToast(error.message || 'Could not update subscription', 'warning')
    }
  }

  return (
    <div className='space-y-6 pb-10 select-none'>
      {/* Alert Details Modal */}
      <AlertDetailsModal
        alert={selectedAlertForDetails}
        isOpen={Boolean(selectedAlertForDetails)}
        onClose={() => setSelectedAlertForDetails(null)}
        onShare={() => addToast('Alert advisory link copied!', 'success')}
      />

      {/* =========================================================================
          HEADER SECTION: Title & Description
          ========================================================================= */}
      <div>
        <div className='flex items-center gap-2'>
          <h1 className='text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight'>
            Alerts
          </h1>
          <ShieldCheck className='w-6 h-6 text-blue-600 fill-blue-50' />
        </div>
        <p className='text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1'>
          {t('alerts.subtitle')}
        </p>

        {/* 5 Filter Tabs */}
        <div className='flex items-center gap-6 mt-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none'>
          {/* Tab 1: All Alerts */}
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span> {t('alerts.active')} </span>
          </button>

          {/* Tab 2: Active (3) */}
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'active'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span> {t('alerts.active')} </span>
            <span className='w-4.5 h-4.5 rounded-full bg-[#EF4444] text-white text-[10px] flex items-center justify-center font-bold'>
              3
            </span>
          </button>

          {/* Tab 3: Warnings (2) */}
          <button
            onClick={() => setActiveTab('warnings')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'warnings'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>Warnings</span>
            <span className='w-4.5 h-4.5 rounded-full bg-[#F59E0B] text-white text-[10px] flex items-center justify-center font-bold'>
              2
            </span>
          </button>

          {/* Tab 4: Watch (1) */}
          <button
            onClick={() => setActiveTab('watch')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'watch'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>Watch</span>
            <span className='w-4.5 h-4.5 rounded-full bg-[#EAB308] text-white text-[10px] flex items-center justify-center font-bold'>
              1
            </span>
          </button>

          {/* Tab 5: Information (2) */}
          <button
            onClick={() => setActiveTab('information')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'information'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>Information</span>
            <span className='w-4.5 h-4.5 rounded-full bg-[#0EA5E9] text-white text-[10px] flex items-center justify-center font-bold'>
              2
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAIN 2-COLUMN LAYOUT: Alerts Stream (Left) + Filters & Map (Right)
          ========================================================================= */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* =====================================================================
            LEFT COLUMN (Span 8): Active Alerts & Recent Alerts
            ===================================================================== */}
        <div className='lg:col-span-8 space-y-6'>
          {/* Active Alerts Subheading */}
          <div className='flex items-center justify-between'>
            <h2 className='text-base font-bold text-slate-900 dark:text-white'>
              {t('alerts.active')} ({filteredActiveAlerts.length})
            </h2>
            <button
              onClick={() => setActiveTab('active')}
              className='text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
            >
              {t('common.viewAll')}
            </button>
          </div>

          {/* Active Alert Cards Stream */}
          <div className='space-y-4'>
            {filteredActiveAlerts.map(alert => {
              const isSevere = alert.severity === 'Severe'
              const isModerate = alert.severity === 'Moderate'

              return (
                <div
                  key={alert.id}
                  className={`rounded-3xl p-6 transition shadow-xs border ${
                    isSevere
                      ? 'bg-[#FFF5F5] dark:bg-rose-950/20 border-rose-200/90 dark:border-rose-900/60'
                      : isModerate
                      ? 'bg-[#FFFBEB] dark:bg-amber-950/20 border-amber-200/90 dark:border-amber-900/60'
                      : 'bg-[#FEFDF0] dark:bg-yellow-950/20 border-amber-200/80 dark:border-yellow-900/60'
                  }`}
                >
                  {/* Top Row: Icon, Title, Timestamps, 3D Art */}
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex items-start gap-3.5'>
                      <div className='shrink-0 mt-0.5'>
                        <AlertTriangle
                          className={`w-7 h-7 ${
                            isSevere
                              ? 'text-[#EF4444] fill-[#EF4444]/20'
                              : isModerate
                              ? 'text-[#F59E0B] fill-[#F59E0B]/20'
                              : 'text-[#EAB308] fill-[#EAB308]/20'
                          }`}
                        />
                      </div>
                      <div>
                        <h3
                          className={`text-base sm:text-lg font-black tracking-tight ${
                            isSevere
                              ? 'text-[#DC2626] dark:text-rose-400'
                              : isModerate
                              ? 'text-[#D97706] dark:text-amber-400'
                              : 'text-[#CA8A04] dark:text-yellow-400'
                          }`}
                        >
                          {alert.title}
                        </h3>
                        <p className='text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5'>
                          {alert.location}
                        </p>
                        <div className='flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium'>
                          <span className='flex items-center gap-1'>
                            <Calendar className='w-3 h-3 text-slate-400' />
                            {alert.effectiveTime}
                          </span>
                          <span>•</span>
                          <span className='flex items-center gap-1'>
                            <Clock className='w-3 h-3 text-slate-400' />
                            Until {alert.untilTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right 3D Art Illustration */}
                    <div className='hidden sm:block shrink-0'>
                      {alert.art === 'rain' && <RainCloudArt />}
                      {alert.art === 'wind' && <WindBreezeArt />}
                      {alert.art === 'sun' && <SunArt />}
                    </div>
                  </div>

                  {/* Description Paragraph */}
                  <p className='text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-4'>
                    {alert.description}
                  </p>

                  {/* Bottom Meta & Action Button Row */}
                  <div className='flex flex-col sm:flex-row sm:items-center justify-between pt-4 mt-4 border-t border-black/5 dark:border-white/5 gap-3'>
                    <div className='flex items-center gap-5 text-xs'>
                      {/* Severity */}
                      <div className='flex items-center gap-1.5'>
                        <AlertTriangle
                          className={`w-3.5 h-3.5 ${
                            isSevere
                              ? 'text-rose-500'
                              : isModerate
                              ? 'text-amber-500'
                              : 'text-yellow-500'
                          }`}
                        />
                        <span className='text-slate-500'>Severity</span>
                        <span
                          className={`font-bold ${
                            isSevere
                              ? 'text-rose-600'
                              : isModerate
                              ? 'text-amber-600'
                              : 'text-yellow-600'
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </div>

                      {/* Probability */}
                      <div className='flex items-center gap-1.5'>
                        <Clock className='w-3.5 h-3.5 text-slate-400' />
                        <span className='text-slate-500'>Probability</span>
                        <span className='font-bold text-slate-800 dark:text-slate-200'>
                          {alert.probability}
                        </span>
                      </div>

                      {/* Source */}
                      <div className='flex items-center gap-1.5'>
                        <Globe className='w-3.5 h-3.5 text-slate-400' />
                        <span className='text-slate-500'>Source</span>
                        <span className='font-bold text-slate-800 dark:text-slate-200'>
                          {alert.source}
                        </span>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={() => handleAlertDetails(alert)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer border ${
                        isSevere
                          ? 'border-rose-300 text-rose-600 hover:bg-rose-100/60 bg-white dark:bg-slate-900'
                          : isModerate
                          ? 'border-amber-300 text-amber-600 hover:bg-amber-100/60 bg-white dark:bg-slate-900'
                          : 'border-yellow-400 text-yellow-700 hover:bg-yellow-100/60 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <span> {t('common.viewAll')} </span>
                      <ChevronRight className='w-3.5 h-3.5' />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Recent Alerts Section */}
          <div className='space-y-3 pt-4'>
            <div className='flex items-center justify-between'>
              <h2 className='text-base font-bold text-slate-900 dark:text-white'>
                {t('alerts.active')}
              </h2>
              <button
                onClick={() =>
                  addToast(
                    'Displaying archived 30-day meteorological alerts',
                    'info'
                  )
                }
                className='text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
              >
                {t('common.viewAll')}
              </button>            </div>

            <div className='bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 shadow-2xs overflow-hidden'>
              {recentAlertsList.map(recent => (
                <div
                  key={recent.id}
                  onClick={() => setSelectedAlertForDetails(recent)}
                  className='p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer group'
                >
                  <div className='flex items-center gap-3.5 min-w-0'>
                    <div className='w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0'>
                      {recent.id === 'recent-1' ? (
                        <MapPin className='w-4 h-4' />
                      ) : (
                        <CloudRain className='w-4 h-4' />
                      )}
                    </div>
                    <div className='min-w-0'>
                      <h4 className='text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate'>
                        {recent.title}
                      </h4>
                      <p className='text-[11px] text-slate-400 dark:text-slate-500 mt-0.5'>
                        {recent.location}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-4 shrink-0'>
                    <span className='px-2.5 py-0.5 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60 rounded-md text-[10px] font-bold'>
                      {recent.tag}
                    </span>
                    <span className='text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline'>
                      {recent.time}
                    </span>
                    <ChevronRight className='w-4 h-4 text-slate-400 group-hover:text-slate-600 transition' />
                  </div>
                </div>
              ))}            </div>
          </div>

          {/* Footer Citation */}
          <div className='flex items-center justify-center gap-1.5 pt-4 text-xs text-slate-400 dark:text-slate-500'>
            <ShieldCheck className='w-4 h-4 text-slate-400' />
            <span>
              {t('alerts.title')} are provided by India Meteorological Department (IMD)
            </span>
          </div>
        </div>

        {/* =====================================================================
            RIGHT COLUMN (Span 4): Alert Filters, Alert Map, Alert Subscriptions
            ===================================================================== */}
        <div className='lg:col-span-4 space-y-6'>
          {/* Card 1: Alert Filters */}
          <div className='bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5'>
            <div className='flex items-center justify-between'>
              <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
                {t('alerts.active')}
              </h3>
              <SlidersHorizontal className='w-4 h-4 text-slate-400' />            </div>

            {/* Location Selector */}
            <div>
              <label className='block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5'>
                {t('common.search')}
              </label>
              <div className='relative'>
                <MapPin className='w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2' />
                <select
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value)}
                  className='w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer'
                >
                  <option value='All'>Pune, Maharashtra</option>
                  <option value='Pune'>Pune, Maharashtra</option>
                  <option value='Mumbai'>Mumbai, Maharashtra</option>
                  <option value='Nagpur'>Nagpur, Maharashtra</option>
                  <option value='Aurangabad'>Aurangabad, Maharashtra</option>
                  <option value='Delhi'>Delhi, India</option>
                </select>
                <ChevronDown className='w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none' />
              </div>            </div>

            {/* Alert Type Checkboxes */}
            <div className='space-y-2'>
              <label className='block text-xs font-bold text-slate-700 dark:text-slate-300'>
                {t('alerts.active')}
              </label>
              <div className='space-y-2'>
                <label className='flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={alertTypeFilters.all}
                    onChange={e =>
                      setAlertTypeFilters({
                        ...alertTypeFilters,
                        all: e.target.checked
                      })
                    }
                    className='w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600'
                  />
                  <span> {t('alerts.active')} </span>
                </label>

                <label className='flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={alertTypeFilters.warnings}
                    onChange={e =>
                      setAlertTypeFilters({
                        ...alertTypeFilters,
                        warnings: e.target.checked
                      })
                    }
                    className='w-4 h-4 rounded text-red-600 focus:ring-red-500 accent-red-600'
                  />
                  <span>Warnings</span>
                </label>

                <label className='flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={alertTypeFilters.watch}
                    onChange={e =>
                      setAlertTypeFilters({
                        ...alertTypeFilters,
                        watch: e.target.checked
                      })
                    }
                    className='w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500'
                  />
                  <span>Watch</span>
                </label>

                <label className='flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={alertTypeFilters.information}
                    onChange={e =>
                      setAlertTypeFilters({
                        ...alertTypeFilters,
                        information: e.target.checked
                      })
                    }
                    className='w-4 h-4 rounded text-blue-500 focus:ring-blue-500 accent-blue-500'
                  />
                  <span>Information</span>
                </label>
              </div>            </div>

            {/* Severity Checkboxes */}
            <div className='space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800'>
              <label className='block text-xs font-bold text-slate-700 dark:text-slate-300'>
                {t('alerts.active')}
              </label>
              <div className='space-y-2'>
                <label className='flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={severityFilters.severe}
                    onChange={e =>
                      setSeverityFilters({
                        ...severityFilters,
                        severe: e.target.checked
                      })
                    }
                    className='w-4 h-4 rounded text-red-600 focus:ring-red-500 accent-red-600'
                  />
                  <span>Severe</span>
                </label>

                <label className='flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={severityFilters.moderate}
                    onChange={e =>
                      setSeverityFilters({
                        ...severityFilters,
                        moderate: e.target.checked
                      })
                    }
                    className='w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500'
                  />
                  <span>Moderate</span>
                </label>

                <label className='flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={severityFilters.watch}
                    onChange={e =>
                      setSeverityFilters({
                        ...severityFilters,
                        watch: e.target.checked
                      })
                    }
                    className='w-4 h-4 rounded text-yellow-500 focus:ring-yellow-500 accent-yellow-500'
                  />
                  <span>Watch</span>
                </label>

                <label className='flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={severityFilters.info}
                    onChange={e =>
                      setSeverityFilters({
                        ...severityFilters,
                        info: e.target.checked
                      })
                    }
                    className='w-4 h-4 rounded text-blue-500 focus:ring-blue-500 accent-blue-500'
                  />
                  <span>Info</span>
                </label>
              </div>            </div>

            {/* Clear Filters Button */}
            <button
              onClick={handleClearFilters}
              className='w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer'
            >
              <RotateCcw className='w-3.5 h-3.5' />
              <span> {t('common.cancel')} </span>
            </button>
          </div>

          {/* Card 2: Alert Map Snapshot */}
          <div className='bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3'>
            <div className='flex items-center justify-between'>
              <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
                {t('dashboard.action.map')}
              </h3>
              <button
                onClick={() => setCurrentPage('weather-map')}
                className='text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
              >
                {t('common.viewAll')}
              </button>            </div>

            {/* Interactive Map Visual Container */}
            <div
              onClick={() => setCurrentPage('weather-map')}
              className='relative h-56 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-emerald-50/50 dark:bg-slate-800/80 cursor-pointer group'
            >
              {/* Map background tiles artwork */}
              <div
                className='absolute inset-0 bg-cover bg-center opacity-85 group-hover:scale-105 transition duration-500'
                style={{
                  backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px), radial-gradient(#CBD5E1 1px, #E2E8F0 1px)`,
                  backgroundSize: '20px 20px',
                  backgroundColor: '#D1FAE5'
                }}
              />
              {/* Coastline shape illustration */}
              <svg
                className='absolute inset-0 w-full h-full opacity-60 pointer-events-none'
                viewBox='0 0 200 200'
              >
                <path
                  d='M 40,0 Q 30,50 45,90 T 55,160 Q 60,190 70,200 L 0,200 L 0,0 Z'
                  fill='#93C5FD'
                />
              </svg>

              {/* Alert Pin 1: Pune (Severe Red Pin) */}
              <div className='absolute top-[48%] left-[34%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group-hover:scale-110 transition'>
                <div className='w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md shadow-rose-600/50 animate-bounce'>
                  ⚠️
                </div>
                <span className='text-[9px] font-extrabold text-slate-900 bg-white/90 px-1 py-0.2 rounded-sm shadow-2xs mt-0.5'>
                  Pune
                </span>
              </div>

              {/* Alert Pin 2: Mumbai (Amber Pin) */}
              <div className='absolute top-[38%] left-[22%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center'>
                <div className='w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[8px] font-bold shadow-xs'>
                  💨
                </div>
                <span className='text-[8px] font-bold text-slate-800 bg-white/80 px-1 rounded-xs mt-0.5'>
                  Mumbai
                </span>
              </div>

              {/* Alert Pin 3: Nagpur (Yellow Pin) */}
              <div className='absolute top-[22%] right-[18%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center'>
                <div className='w-4 h-4 rounded-full bg-yellow-500 text-white flex items-center justify-center text-[8px] font-bold shadow-xs'>
                  ☀️
                </div>
                <span className='text-[8px] font-bold text-slate-800 bg-white/80 px-1 rounded-xs mt-0.5'>
                  Nagpur
                </span>
              </div>

              {/* Alert Pin 4: Aurangabad */}
              <div className='absolute top-[30%] left-[48%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center'>
                <div className='w-3.5 h-3.5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[8px] font-bold'>
                  ⚡
                </div>
                <span className='text-[8px] font-bold text-slate-800 bg-white/80 px-1 rounded-xs mt-0.5'>
                  Aurangabad
                </span>
              </div>

              {/* Alert Pin 5: Solapur */}
              <div className='absolute bottom-[24%] left-[62%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center'>
                <div className='w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[8px] font-bold'>
                  •
                </div>
                <span className='text-[8px] font-bold text-slate-800 bg-white/80 px-1 rounded-xs mt-0.5'>
                  Solapur
                </span>
              </div>

              {/* Alert Pin 6: Kolhapur */}
              <div className='absolute bottom-[16%] left-[32%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center'>
                <div className='w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold'>
                  •
                </div>
                <span className='text-[8px] font-bold text-slate-800 bg-white/80 px-1 rounded-xs mt-0.5'>
                  Kolhapur
                </span>
              </div>

              {/* Zoom Buttons Controls */}
              <div className='absolute bottom-3 right-3 flex flex-col gap-1 bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden'>
                <button
                  type='button'
                  onClick={e => {
                    e.stopPropagation()
                    addToast('Map zoom in', 'info')
                  }}
                  className='p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition'
                >
                  <Plus className='w-3.5 h-3.5 text-slate-600 dark:text-slate-300' />
                </button>
                <div className='h-px bg-slate-200 dark:bg-slate-800' />
                <button
                  type='button'
                  onClick={e => {
                    e.stopPropagation()
                    addToast('Map zoom out', 'info')
                  }}
                  className='p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition'
                >
                  <Minus className='w-3.5 h-3.5 text-slate-600 dark:text-slate-300' />
                </button>
              </div>            </div>
          </div>

          {/* Card 3: Alert Subscriptions */}
          <div className='bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4'>
            <div className='flex items-center gap-2'>
              <Bell className='w-4 h-4 text-slate-600 dark:text-slate-400' />
              <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
                {t('alerts.active')}
              </h3>            </div>
            <p className='text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed'>
              Get notified about alerts in your selected locations.
            </p>

            {/* Subscribed Locations List */}
            <div className='space-y-3 pt-1'>
              {/* Dynamic Subscriptions Mapping */}
              {userSubscriptions.map(loc => (
                <div key={loc._id} className='flex items-center justify-between'>
                  <div>
                    <h4 className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                      {loc.name}
                    </h4>
                    <p className='text-[10px] text-slate-400'>
                      {loc.city}, {loc.state}
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={() => handleSubscriptionToggle(loc._id, loc.notificationsEnabled)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      loc.notificationsEnabled
                        ? 'bg-blue-600'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-200 ease-in-out shadow-xs ${
                        loc.notificationsEnabled ? 'translate-x-4.5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
              {userSubscriptions.length === 0 && (
                <p className='text-xs text-slate-500 dark:text-slate-400 italic text-center py-2'>
                  {t('dashboard.noAlerts')}
                </p>
              )}

            </div>

            {/* Manage Subscriptions Button */}
            <button
              onClick={() => setCurrentPage('settings')}
              className='w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer mt-2'
            >
              <SettingsIcon className='w-3.5 h-3.5' />
              <span> {t('common.update')} </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
