import React from 'react'
import { WifiOff, RefreshCw } from 'lucide-react'
import { useWeather } from '../../context/WeatherContext'

export const OfflineBanner = () => {
  const {
    isOffline,
    weatherData,
    selectedMapLocation,
    refreshWeather,
    refreshForecast,
    refreshAlerts,
    weatherLoading
  } = useWeather()

  const offlineMeta = weatherData?._offlineMeta
  const isShowingCached = Boolean(offlineMeta?.isOffline)

  if (!isOffline && !isShowingCached) {
    return null
  }

  const formatCachedTime = timestamp => {
    if (!timestamp) return null
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return null
    }
  }

  const cachedTime = formatCachedTime(offlineMeta?.cachedAt || offlineMeta?.fetchedAt)

  const handleRetry = () => {
    if (selectedMapLocation) {
      const lat = selectedMapLocation.lat ?? selectedMapLocation.latitude
      const lng = selectedMapLocation.lng ?? selectedMapLocation.longitude
      if (lat !== undefined && lng !== undefined) {
        refreshWeather(lat, lng)
        refreshForecast(lat, lng)
      }
    }
    refreshAlerts()
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs md:text-sm text-amber-800 dark:text-amber-300 flex items-center justify-between transition-colors"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>
          <strong>Offline Mode:</strong>{' '}
          {cachedTime
            ? `Showing cached weather from ${cachedTime}.`
            : 'Network is currently unavailable. Viewing local data.'}
        </span>
      </div>
      <button
        type="button"
        onClick={handleRetry}
        disabled={weatherLoading}
        className="inline-flex items-center gap-1 font-medium text-xs text-amber-800 dark:text-amber-200 hover:text-amber-950 dark:hover:text-white underline cursor-pointer disabled:opacity-50"
      >
        <RefreshCw className={`w-3 h-3 ${weatherLoading ? 'animate-spin' : ''}`} />
        <span>Retry</span>
      </button>
    </div>
  )
}

export default OfflineBanner

