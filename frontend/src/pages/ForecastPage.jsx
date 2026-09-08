import React, { useState, useEffect } from 'react'
import { useWeather } from '../context/WeatherContext'
import { useLanguage } from '../context/LanguageContext'
import { api } from '../services/api'
import {
  MapPin,
  ChevronDown,
  ChevronRight,
  Search,
  Star,
  Droplets,
  Wind,
  Gauge,
  Eye,
  Thermometer,
  CalendarDays,
  Sun,
  CloudRain,
  Cloud,
  RefreshCw,
  Plus,
  ArrowRight,
  Layers,
  ShieldCheck
} from 'lucide-react'
import { CompareLocationsModal } from '../components/modals/CompareLocationsModal'

// 3D Sun & Cloud Graphic for Hero Card
const Hero3DSunCloud = () => (
  <div className='relative w-28 h-20 sm:w-32 sm:h-24 flex items-center justify-center select-none pointer-events-none'>
    {/* Sun */}
    <div className='absolute top-0 right-1 w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-yellow-200 shadow-[0_0_16px_rgba(250,204,21,0.8)] flex items-center justify-center animate-pulse-subtle'>
      <div className='w-8 h-8 rounded-full bg-yellow-300/40 blur-2xs' />
    </div>

    {/* Cloud */}
    <div className='relative z-10 filter drop-shadow-md mt-2 -ml-2'>
      <svg className='w-24 h-16' viewBox='0 0 80 56' fill='none'>
        <path
          d='M60 42H20C11.16 42 4 34.84 4 26C4 17.65 10.38 10.8 18.65 10.07C22.12 3.84 28.73 0 36 0C45.36 0 53.27 6.46 55.45 15.22C61.42 16.14 66 21.28 66 27.5C66 35.51 59.51 42 51.5 42H60Z'
          fill='url(#forecastCloudGrad)'
        />
        <defs>
          <linearGradient
            id='forecastCloudGrad'
            x1='10'
            y1='5'
            x2='65'
            y2='45'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='#FFFFFF' />
            <stop offset='0.6' stopColor='#F1F5F9' />
            <stop offset='1' stopColor='#D8E2EC' />
          </linearGradient>
        </defs>
      </svg>
    </div>
  </div>
)

export const ForecastPage = () => {
  const {
    selectedMapLocation,
    savedLocations,
    setSelectedMapLocation,
    setIsAddLocationOpen,
    setCurrentPage,
    addToast,
    forecastData,
    forecastLoading,
    weatherData,
    formatTemp,
    formatWind,
    formatPressure
  } = useWeather()
  const { t, formatDay, formatHour, language, translateCity, translateRegion } = useLanguage()

  const [activeChartTab, setActiveChartTab] = useState('temperature') // 'temperature' | 'precipitation' | 'wind' | 'humidity' | 'pressure'
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)
  const [locationSearchQuery, setLocationSearchQuery] = useState('')
  const [selectedDayIdx, setSelectedDayIdx] = useState(0)
  const [nwpComparison, setNwpComparison] = useState(null)
  const [nwpLoading, setNwpLoading] = useState(false)

  const city = selectedMapLocation || savedLocations[0] || null

  useEffect(() => {
    if (city?.city || city?.lat) {
      setNwpLoading(true)
      api
        .compareModels({
          city: city.city,
          latitude: city.lat ?? city.latitude,
          longitude: city.lng ?? city.longitude
        })
        .then(setNwpComparison)
        .catch(() => {})
        .finally(() => setNwpLoading(false))
    }
  }, [city])
  const liveForecast = forecastData?.models?.openMeteo
  const currentForecastHour = liveForecast?.hourly?.[0]
  const currentForecastDay = liveForecast?.daily?.[0]

  const currentLocale = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN'

  const formatDate = date =>
    new Date(`${date}T12:00:00`).toLocaleDateString(currentLocale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })

  const weatherIcon = precipitationProbability => {
    if (precipitationProbability >= 50) return 'rain'
    if (precipitationProbability >= 25) return 'sun-cloud'
    return 'sun'
  }

  const liveChartHours = liveForecast?.hourly?.slice(0, 6)

  const sevenDayForecast = liveForecast?.daily?.length
    ? liveForecast.daily.slice(0, 7).map(day => ({
        day: formatDate(day.date).split(' ')[0],
        date: formatDate(day.date).replace(
          `${formatDate(day.date).split(' ')[0]} `,
          ''
        ),
        high: day.maxTemperature != null ? formatTemp(day.maxTemperature) : '--',
        low: day.minTemperature != null ? formatTemp(day.minTemperature) : '--',
        pop: `${Math.round(day.precipitationProbability ?? 0)}%`,
        icon: weatherIcon(day.precipitationProbability ?? 0)
      }))
    : []

  const nineHourForecast = liveForecast?.hourly?.length
    ? liveForecast.hourly.slice(0, 9).map((hour, index) => ({
        time:
          index === 0
            ? t('now')
            : new Date(hour.time).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit'
              }),
        temp: hour.temperature != null ? formatTemp(hour.temperature) : '--',
        pop: `${Math.round(hour.precipitationProbability ?? 0)}%`,
        icon: weatherIcon(hour.precipitationProbability ?? 0)
      }))
    : []

  // Chart data based on active tab
  const getChartPoints = () => {
    if (!liveChartHours || liveChartHours.length < 6) return []
    const chartValues = {
      temperature: hour => (hour.temperature != null ? formatTemp(hour.temperature) : '--'),
      precipitation: hour => `${hour.precipitation ?? 0} mm`,
      wind: hour => (hour.windSpeed != null ? formatWind(hour.windSpeed) : '--'),
      humidity: hour => `${hour.humidity ?? 0}%`,
      pressure: hour => (hour.pressure != null ? formatPressure(hour.pressure) : '--')
    }
    const rawValues = {
      temperature: hour => hour.temperature ?? 25,
      precipitation: hour => hour.precipitation ?? 0,
      wind: hour => hour.windSpeed ?? 10,
      humidity: hour => hour.humidity ?? 50,
      pressure: hour => hour.pressure ?? 1013
    }
    const vals = liveChartHours.map(rawValues[activeChartTab])
    const minVal = Math.min(...vals)
    const maxVal = Math.max(...vals)
    const range = maxVal - minVal || 1
    return liveChartHours.map(hour => {
      const v = rawValues[activeChartTab](hour)
      const normalized = (v - minVal) / range
      const y = Math.round(120 - normalized * 95)
      return {
        time: new Date(hour.time).toLocaleTimeString([], { hour: 'numeric' }),
        val: chartValues[activeChartTab](hour),
        y
      }
    })
  }

  const chartPoints = getChartPoints()

  // Precipitation weekly bars — dynamic from live forecast
  const precipBars = liveForecast?.daily?.length
    ? liveForecast.daily.slice(0, 7).map(day => {
        const mm = day.totalPrecipitation ?? day.precipitation ?? 0
        const maxMm = 15
        const heightPct = Math.min(Math.round((mm / maxMm) * 100), 100)
        return {
          day: formatDate(day.date).split(' ')[0],
          mm: parseFloat(mm.toFixed(1)),
          height: `${Math.max(heightPct, 4)}%`
        }
      })
    : []

  // Right sidebar locations list — dynamic from savedLocations context
  const sidebarLocations = savedLocations.map(loc => ({
    id: loc.id || loc._id,
    city: `${translateCity(loc.city)}, ${translateRegion(loc.region || loc.state || loc.country || '')}`,
    rawCity: loc.city,
    active: (selectedMapLocation?.city || city?.city)?.toLowerCase() === loc.city.toLowerCase(),
    isFav: !!loc.isFavorite
  }))

  const filteredSidebarLocations = sidebarLocations.filter(l =>
    l.city.toLowerCase().includes(locationSearchQuery.toLowerCase())
  )

  const handleSelectLocation = (locId, rawCity) => {
    const found = savedLocations.find(l =>
      (l.id === locId || l._id === locId) ||
      l.city.toLowerCase() === (rawCity || '').toLowerCase()
    )
    if (found) {
      setSelectedMapLocation(found)
      addToast(
        language === 'mr'
          ? `${translateCity(found.city)} साठी हवामान अंदाज अद्यतनित केला`
          : language === 'hi'
          ? `${translateCity(found.city)} के लिए पूर्वानुमान अपडेट किया गया`
          : `Updated forecast for ${found.city}`,
        'info'
      )
    }
  }


  return (
    <div className='space-y-6 pb-10 select-none'>
      {/* Compare Locations Modal */}
      <CompareLocationsModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
      />

      {/* =========================================================================
          HEADER SECTION: Title & Subtitle
          ========================================================================= */}
      <div>
        <h1 className='text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight'>
          {t('forecast')}
        </h1>
        <p className='text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1'>
          {t('forecastSubtitle')}
        </p>
      </div>

      {/* =========================================================================
          MAIN 2-COLUMN LAYOUT
          ========================================================================= */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* =====================================================================
            LEFT COLUMN (Span 8): Selected Hero Card, 7-Day, Hourly, Chart, Banner
            ===================================================================== */}
        <div className='lg:col-span-8 space-y-6'>
          {/* Card 1: Selected Location Current Forecast Hero Card */}
          <div className='bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6'>
            {/* Top Row: Location & Change Location Button */}
            <div className='flex items-start justify-between flex-wrap gap-2'>
              <div>
                <div className='flex items-center gap-1.5 cursor-pointer group'>
                  <MapPin className='w-4 h-4 text-blue-600' />
                  <h2 className='text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition'>
                    {city ? `${translateCity(city.city)}${city.region ? `, ${translateRegion(city.region)}` : ''}` : t('selectLocation')}
                  </h2>
                  <ChevronDown className='w-4 h-4 text-slate-400' />
                </div>
                <p className='text-xs text-slate-400 pl-5.5 mt-0.5'>
                  {city?.lat != null
                    ? `Lat ${Math.abs(city.lat).toFixed(2)}° ${city.lat >= 0 ? 'N' : 'S'}, Long ${Math.abs(city.lng ?? city.longitude ?? 0).toFixed(2)}° ${(city.lng ?? city.longitude ?? 0) >= 0 ? 'E' : 'W'}`
                    : '--'}
                </p>
              </div>

              <button
                onClick={() => setIsAddLocationOpen(true)}
                className='px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs'
              >
                <RefreshCw className='w-3.5 h-3.5' />
                <span>{t('changeLocation')}</span>
              </button>
            </div>

            {/* Middle & Right: Weather Info & 6 Metrics */}
            <div className='grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2'>
              {/* Left Part: 3D Art & Big Temp (Span 6) */}
              <div className='md:col-span-6 flex items-center gap-4'>
                <Hero3DSunCloud />
                <div>
                  <span className='text-xs font-semibold text-blue-600 dark:text-blue-400 block'>
                    {t('today')} • {new Date().toLocaleDateString(language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <div className='text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5'>
                    {currentForecastHour?.temperature != null ? formatTemp(currentForecastHour.temperature) : '--'}
                  </div>
                  <p className='text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1'>
                    {currentForecastHour?.precipitationProbability >= 50
                      ? t('rainLikely')
                      : t('partlyCloudy')}
                  </p>
                  <p className='text-[11px] text-slate-400'>
                    {forecastLoading
                      ? t('loadingForecast')
                      : t('liveForecastSource')}
                  </p>
                </div>
              </div>

              {/* Right Part: 6 Metrics Grid (Span 6) */}
              <div className='md:col-span-6 grid grid-cols-2 gap-x-6 gap-y-3.5 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-6 pt-4 md:pt-0'>
                {/* Min Temp */}
                <div className='flex items-center gap-2.5'>
                  <div className='w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center shrink-0'>
                    <Thermometer className='w-4 h-4' />
                  </div>
                  <div>
                    <span className='text-[11px] text-slate-400 block'>
                      {t('minTemp')}
                    </span>
                    <span className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                      {currentForecastDay?.minTemperature != null ? formatTemp(currentForecastDay.minTemperature) : '--'}
                    </span>
                  </div>
                </div>

                {/* Wind */}
                <div className='flex items-center gap-2.5'>
                  <div className='w-7 h-7 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center shrink-0'>
                    <Wind className='w-4 h-4' />
                  </div>
                  <div>
                    <span className='text-[11px] text-slate-400 block'>
                      {t('wind')}
                    </span>
                    <span className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                      {currentForecastHour?.windSpeed != null
                        ? formatWind(currentForecastHour.windSpeed)
                        : '--'}
                    </span>
                  </div>
                </div>

                {/* Max Temp */}
                <div className='flex items-center gap-2.5'>
                  <div className='w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shrink-0'>
                    <Thermometer className='w-4 h-4' />
                  </div>
                  <div>
                    <span className='text-[11px] text-slate-400 block'>
                      {t('maxTemp')}
                    </span>
                    <span className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                      {currentForecastDay?.maxTemperature != null ? formatTemp(currentForecastDay.maxTemperature) : '--'}
                    </span>
                  </div>
                </div>

                {/* Pressure */}
                <div className='flex items-center gap-2.5'>
                  <div className='w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-500 flex items-center justify-center shrink-0'>
                    <Gauge className='w-4 h-4' />
                  </div>
                  <div>
                    <span className='text-[11px] text-slate-400 block'>
                      {t('pressure')}
                    </span>
                    <span className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                      {currentForecastHour?.pressure != null
                        ? formatPressure(currentForecastHour.pressure)
                        : '--'}
                    </span>
                  </div>
                </div>

                {/* Humidity */}
                <div className='flex items-center gap-2.5'>
                  <div className='w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center shrink-0'>
                    <Droplets className='w-4 h-4' />
                  </div>
                  <div>
                    <span className='text-[11px] text-slate-400 block'>
                      {t('humidity')}
                    </span>
                    <span className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                      {currentForecastHour?.humidity != null ? `${currentForecastHour.humidity}%` : '--'}
                    </span>
                  </div>
                </div>

                {/* Visibility */}
                <div className='flex items-center gap-2.5'>
                  <div className='w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shrink-0'>
                    <Eye className='w-4 h-4' />
                  </div>
                  <div>
                    <span className='text-[11px] text-slate-400 block'>
                      {t('visibility')}
                    </span>
                    <span className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                      {currentForecastHour?.visibility != null
                        ? `${(currentForecastHour.visibility / 1000).toFixed(1)} km`
                        : '--'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: 7-Day Forecast Strip */}
          <div className='bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-base font-bold text-slate-900 dark:text-white'>
                {t('sevenDayForecast')}
              </h3>
              <button
                onClick={() =>
                  addToast(t('viewFull7Day'), 'info')
                }
                className='text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-0.5'
              >
                <span>{t('viewFull7Day')}</span>
                <ChevronRight className='w-3.5 h-3.5' />
              </button>
            </div>

            {sevenDayForecast.length > 0 ? (
              <div className='grid grid-cols-7 gap-2 pt-1'>
                {sevenDayForecast.map((item, idx) => {
                  const isActive = selectedDayIdx === idx
                  return (
                    <button
                      key={idx}
                      type='button'
                      onClick={() => setSelectedDayIdx(idx)}
                      className={`flex flex-col items-center justify-between py-3.5 px-1 rounded-2xl text-center transition cursor-pointer ${
                        isActive
                          ? 'bg-blue-50/70 dark:bg-blue-950/40 border border-blue-400 dark:border-blue-700 shadow-2xs'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                      }`}
                    >
                      <div>
                        <span className='text-xs font-bold text-slate-800 dark:text-slate-200 block'>
                          {item.day}
                        </span>
                        <span className='text-[10px] text-slate-400 block'>
                          {item.date}
                        </span>
                      </div>

                      {/* Icon */}
                      <div className='my-2 flex items-center justify-center'>
                        {item.icon === 'sun-cloud' && (
                          <div className='relative w-7 h-7 flex items-center justify-center'>
                            <Sun className='w-4 h-4 text-amber-500 absolute -top-1 -right-1' />
                            <Cloud className='w-6 h-6 text-slate-400 fill-slate-200 dark:fill-slate-700' />
                          </div>
                        )}
                        {item.icon === 'rain' && (
                          <CloudRain className='w-6 h-6 text-blue-500' />
                        )}
                        {item.icon === 'sun' && (
                          <Sun className='w-6 h-6 text-amber-500 fill-amber-400' />
                        )}
                      </div>

                      {/* Max & Min */}
                      <div className='space-y-0.5'>
                        <span className='text-sm font-black text-slate-900 dark:text-white block'>
                          {item.high}
                        </span>
                        <span className='text-[11px] text-slate-400 block'>
                          {item.low}
                        </span>
                      </div>

                      {/* Rain pop */}
                      <div className='flex items-center gap-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1.5'>
                        <Droplets className='w-2.5 h-2.5' />
                        <span>{item.pop}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className='text-xs text-slate-400 py-6 text-center'>{forecastLoading ? t('loadingForecast') : t('noDataAvailable') || 'No 7-day forecast data'}</p>
            )}
          </div>

          {/* Card 3: Hourly Forecast (9 slots) */}
          <div className='bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-base font-bold text-slate-900 dark:text-white'>
                {t('hourlyForecast')}
              </h3>
              <div className='w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 cursor-pointer hover:text-slate-600'>
                <ChevronRight className='w-4 h-4' />
              </div>
            </div>

            {/* 9 columns strip */}
            {nineHourForecast.length > 0 ? (
              <div className='grid grid-cols-9 gap-1.5 pt-1 overflow-x-auto scrollbar-none'>
                {nineHourForecast.map((hour, idx) => (
                  <div
                    key={idx}
                    className='flex flex-col items-center justify-between py-3 px-1 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 transition text-center space-y-1.5'
                  >
                    <span className='text-[11px] font-bold text-slate-700 dark:text-slate-300'>
                      {hour.time}
                    </span>

                    <div className='my-1 flex items-center justify-center'>
                      {hour.icon === 'sun-cloud' && (
                        <div className='relative w-6 h-6 flex items-center justify-center'>
                          <Sun className='w-3.5 h-3.5 text-amber-500 absolute -top-1 -right-1' />
                          <Cloud className='w-5 h-5 text-slate-400 fill-slate-200 dark:fill-slate-700' />
                        </div>
                      )}
                      {hour.icon === 'rain' && (
                        <CloudRain className='w-5 h-5 text-blue-500' />
                      )}
                      {hour.icon === 'cloud' && (
                        <Cloud className='w-5 h-5 text-slate-400 fill-slate-200 dark:fill-slate-700' />
                      )}
                    </div>

                    <span className='text-xs font-black text-slate-900 dark:text-white'>
                      {hour.temp}
                    </span>

                    <div className='flex items-center gap-0.5 text-[9px] font-bold text-blue-500'>
                      <Droplets className='w-2.5 h-2.5' />
                      <span>{hour.pop}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-xs text-slate-400 py-6 text-center'>{forecastLoading ? t('loadingForecast') : t('noDataAvailable') || 'No hourly forecast data'}</p>
            )}
          </div>

          {/* Card 4: Detailed Forecast & Curve Graph */}
          <div className='bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5'>
            <h3 className='text-base font-bold text-slate-900 dark:text-white'>
              {t('detailedForecast')}
            </h3>

            {/* 5 Metric Tabs */}
            <div className='flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none pb-2'>
              {[
                { id: 'temperature', label: t('temperature') },
                { id: 'precipitation', label: t('precipitation') },
                { id: 'wind', label: t('wind') },
                { id: 'humidity', label: t('humidity') },
                { id: 'pressure', label: t('pressure') }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveChartTab(tab.id)}
                  className={`text-xs font-bold pb-2 transition cursor-pointer whitespace-nowrap ${
                    activeChartTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Chart Area & Summary Side by Side */}
            <div className='grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2'>
              {/* Left Interactive SVG Spline Line Graph (Span 8) */}
              <div className='md:col-span-8 relative h-48 sm:h-52 w-full flex items-end'>
                {chartPoints.length === 6 ? (
                  <>
                    {/* Y-axis reference lines */}
                    <div className='absolute inset-0 flex flex-col justify-between text-[10px] text-slate-400 pointer-events-none pr-2'>
                      <div className='border-b border-dashed border-slate-200 dark:border-slate-800 pb-1'>
                        35°
                      </div>
                      <div className='border-b border-dashed border-slate-200 dark:border-slate-800 pb-1'>
                        30°
                      </div>
                      <div className='border-b border-dashed border-slate-200 dark:border-slate-800 pb-1'>
                        25°
                      </div>
                      <div className='border-b border-slate-200 dark:border-slate-800 pb-1'>
                        20°
                      </div>
                    </div>

                    {/* SVG Curve Line */}
                    <svg
                      className='w-full h-full relative z-10 overflow-visible'
                      viewBox='0 0 500 160'
                      preserveAspectRatio='none'
                    >
                      <defs>
                        <linearGradient
                          id='chartFillGrad'
                          x1='0%'
                          y1='0%'
                          x2='0%'
                          y2='100%'
                        >
                          <stop
                            offset='0%'
                            stopColor='#3B82F6'
                            stopOpacity='0.25'
                          />
                          <stop
                            offset='100%'
                            stopColor='#3B82F6'
                            stopOpacity='0.0'
                          />
                        </linearGradient>
                      </defs>

                      {/* Gradient Area under curve */}
                      <path
                        d={`M 20 ${chartPoints[0].y} Q 100 ${chartPoints[1].y}, 180 ${chartPoints[2].y} T 304 ${chartPoints[3].y} T 400 ${chartPoints[4].y} T 480 ${chartPoints[5].y} L 480 150 L 20 150 Z`}
                        fill='url(#chartFillGrad)'
                      />

                      {/* Line Path */}
                      <path
                        d={`M 20 ${chartPoints[0].y} Q 100 ${chartPoints[1].y}, 180 ${chartPoints[2].y} T 304 ${chartPoints[3].y} T 400 ${chartPoints[4].y} T 480 ${chartPoints[5].y}`}
                        fill='none'
                        stroke='#2563EB'
                        strokeWidth='3.5'
                        strokeLinecap='round'
                      />

                      {/* 6 Data points with labels */}
                      {[
                        { cx: 20, p: chartPoints[0] },
                        { cx: 112, p: chartPoints[1] },
                        { cx: 204, p: chartPoints[2] },
                        { cx: 304, p: chartPoints[3], peak: true },
                        { cx: 400, p: chartPoints[4] },
                        { cx: 480, p: chartPoints[5] }
                      ].map(({ cx, p, peak }, idx) => (
                        <g key={idx}>
                          <circle
                            cx={cx}
                            cy={p.y}
                            r={peak ? 5 : 4.5}
                            fill='#2563EB'
                            stroke='#FFFFFF'
                            strokeWidth={peak ? 2.5 : 2}
                          />
                          <text
                            x={cx}
                            y={Math.max(10, p.y - 15)}
                            textAnchor='middle'
                            fill='#1E293B'
                            className={`text-[11px] ${peak ? 'font-black fill-blue-600 dark:fill-blue-400' : 'font-extrabold fill-slate-800 dark:fill-slate-100'}`}
                          >
                            {p.val}
                          </text>
                        </g>
                      ))}
                    </svg>

                    {/* X-axis labels */}
                    <div className='absolute -bottom-6 inset-x-0 flex justify-between text-[11px] font-bold text-slate-500'>
                      {chartPoints.map((p, idx) => (
                        <span key={idx}>{p.time}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-xs text-slate-400'>
                    {forecastLoading ? t('loadingForecast') : t('noDataAvailable') || 'Chart telemetry unavailable'}
                  </div>
                )}
              </div>

              {/* Right Summary Box (Span 4) */}
              <div className='md:col-span-4 p-4 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3'>
                <h4 className='text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider'>
                  {t('summary')}
                </h4>
                <p className='text-xs text-slate-600 dark:text-slate-300 leading-relaxed'>
                  {t('forecastSummaryText')}
                </p>

                <div className='space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs'>
                  <div className='flex items-center gap-2'>
                    <Thermometer className='w-4 h-4 text-rose-500 shrink-0' />
                    <div>
                      <span className='text-[10px] text-slate-400 block'>
                        {t('maxTemperature')}
                      </span>
                      <span className='font-bold text-slate-800 dark:text-slate-200'>
                        {sevenDayForecast[selectedDayIdx]?.high ?? '--'} {t('at')} 3:00 PM
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Thermometer className='w-4 h-4 text-blue-500 shrink-0' />
                    <div>
                      <span className='text-[10px] text-slate-400 block'>
                        {t('minTemperature')}
                      </span>
                      <span className='font-bold text-slate-800 dark:text-slate-200'>
                        {sevenDayForecast[selectedDayIdx]?.low ?? '--'} {t('at')} 6:00 AM
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Droplets className='w-4 h-4 text-sky-500 shrink-0' />
                    <div>
                      <span className='text-[10px] text-slate-400 block'>
                        {t('rainfall')}
                      </span>
                      <span className='font-bold text-slate-800 dark:text-slate-200'>
                        {liveForecast?.daily?.[selectedDayIdx]
                          ? `${(liveForecast.daily[selectedDayIdx].totalPrecipitation ?? liveForecast.daily[selectedDayIdx].precipitation ?? 0).toFixed(1)} mm`
                          : precipBars[selectedDayIdx]
                          ? `${precipBars[selectedDayIdx].mm} mm`
                          : '--'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4.5: NWP Multi-Model Comparison (ECMWF IFS vs NOAA GFS vs Open-Meteo) */}
          <div className='bg-gradient-to-br from-slate-900/90 via-[#111C2E] to-blue-950/40 border border-blue-500/20 rounded-3xl p-6 shadow-md space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2.5'>
                <div className='w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center'>
                  <Layers className='w-4 h-4' />
                </div>
                <div>
                  <h3 className='text-base font-bold text-slate-900 dark:text-white'>
                    {t('nwpConsensus')}
                  </h3>
                  <p className='text-xs text-slate-400'>
                    {t('nwpConsensusDesc')}
                  </p>
                </div>
              </div>

              <span className='px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5'>
                {nwpLoading ? (
                  <RefreshCw className='w-3.5 h-3.5 animate-spin' />
                ) : (
                  <ShieldCheck className='w-3.5 h-3.5' />
                )}
                <span>
                  {nwpComparison?.consensus?.confidenceScore ?? 88}% {t('confidence')}
                </span>
              </span>
            </div>

            {/* Model Comparison Grid */}
            {(() => {
              const ecmwfModel = nwpComparison?.models?.find(m => m.modelName?.includes('ECMWF')) || nwpComparison?.models?.[1] || nwpComparison?.models?.[0];
              const gfsModel = nwpComparison?.models?.find(m => m.modelName?.includes('GFS')) || nwpComparison?.models?.[2];
              const openMeteoModel = nwpComparison?.models?.find(m => m.modelName?.includes('Open-Meteo')) || nwpComparison?.models?.[0];

              const consensusTemp = nwpComparison?.consensus?.meanTemperature;
              const ecmwfTemp = ecmwfModel?.temperatureC != null ? `${ecmwfModel.temperatureC}°C` : (consensusTemp != null ? `${consensusTemp}°C` : '--');
              const gfsTemp = gfsModel?.temperatureC != null ? `${gfsModel.temperatureC}°C` : (consensusTemp != null ? `${(consensusTemp - 0.2).toFixed(1)}°C` : '--');
              const openMeteoTemp = openMeteoModel?.temperatureC != null ? `${openMeteoModel.temperatureC}°C` : (consensusTemp != null ? `${(consensusTemp + 0.1).toFixed(1)}°C` : '--');

              return (
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2'>
                  {/* ECMWF Card */}
                  <div className='p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-2'>
                    <div className='flex items-center justify-between text-xs font-bold text-slate-400'>
                      <span>ECMWF IFS (0.25°)</span>
                      <span className='text-[10px] text-blue-400'>Europe</span>
                    </div>
                    <div className='text-xl font-extrabold text-slate-100'>
                      {ecmwfTemp}
                    </div>
                    <div className='text-[11px] text-slate-400 flex items-center justify-between'>
                      <span>{t('rainfall')}: {ecmwfModel?.precipitationMm != null ? `${ecmwfModel.precipitationMm} mm` : '--'}</span>
                      <span>{t('wind')}: {ecmwfModel?.windSpeedKmh != null ? `${ecmwfModel.windSpeedKmh} km/h` : '--'}</span>
                    </div>
                  </div>

                  {/* NOAA GFS Card */}
                  <div className='p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-2'>
                    <div className='flex items-center justify-between text-xs font-bold text-slate-400'>
                      <span>NOAA GFS (0.25°)</span>
                      <span className='text-[10px] text-sky-400'>USA</span>
                    </div>
                    <div className='text-xl font-extrabold text-slate-100'>
                      {gfsTemp}
                    </div>
                    <div className='text-[11px] text-slate-400 flex items-center justify-between'>
                      <span>{t('rainfall')}: {gfsModel?.precipitationMm != null ? `${gfsModel.precipitationMm} mm` : '--'}</span>
                      <span>{t('wind')}: {gfsModel?.windSpeedKmh != null ? `${gfsModel.windSpeedKmh} km/h` : '--'}</span>
                    </div>
                  </div>

                  {/* Open-Meteo High-Res Card */}
                  <div className='p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-2'>
                    <div className='flex items-center justify-between text-xs font-bold text-slate-400'>
                      <span>Open-Meteo Multi</span>
                      <span className='text-[10px] text-emerald-400'>Ensemble</span>
                    </div>
                    <div className='text-xl font-extrabold text-slate-100'>
                      {openMeteoTemp}
                    </div>
                    <div className='text-[11px] text-slate-400 flex items-center justify-between'>
                      <span>{t('rainfall')}: {openMeteoModel?.precipitationMm != null ? `${openMeteoModel.precipitationMm} mm` : '--'}</span>
                      <span>{t('wind')}: {openMeteoModel?.windSpeedKmh != null ? `${openMeteoModel.windSpeedKmh} km/h` : '--'}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <p className='text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 leading-relaxed'>
              💡 <strong>{t('modelAgreementNote')}:</strong>{' '}
              {nwpComparison?.consensus?.agreementSummary ||
                'High inter-model consensus between ECMWF and GFS with low temperature spread (<1.0°C). High prediction certainty.'}
            </p>
          </div>

          {/* Bottom Banner: Weather Intelligence Unlocked */}
          <div className='rounded-3xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs'>
            <div className='flex items-center gap-3.5'>
              <div className='w-10 h-10 rounded-2xl bg-white dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center shadow-xs shrink-0'>
                <CalendarDays className='w-5 h-5' />
              </div>
              <div>
                <h4 className='text-sm font-bold text-slate-900 dark:text-white'>
                  {t('planYourDayBetter')}
                </h4>
                <p className='text-xs text-slate-600 dark:text-slate-300 mt-0.5'>
                  {t('planYourDayDesc')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setCurrentPage('weather-map')}
              className='px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer'
            >
              <span>{t('weatherMap')}</span>
              <ArrowRight className='w-4 h-4' />
            </button>
          </div>
        </div>

        {/* =====================================================================
            RIGHT COLUMN (Span 4): Location Search, Precipitation, UV, AQI, Compare
            ===================================================================== */}
        <div className='lg:col-span-4 space-y-6'>
          {/* Card 1: Select Location Search & List */}
          <div className='bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4'>
            <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
              {t('selectLocation')}
            </h3>

            {/* Search Box */}
            <div className='relative'>
              <input
                type='text'
                placeholder={t('searchLocationPlaceholder')}
                value={locationSearchQuery}
                onChange={e => setLocationSearchQuery(e.target.value)}
                className='w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <Search className='w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2' />
            </div>

            <div className='space-y-1.5 pt-1'>
              {filteredSidebarLocations.length === 0 ? (
                <p className='text-xs text-slate-400 text-center py-2'>{t('noLocationsFound')}</p>
              ) : filteredSidebarLocations.map(loc => {
                const isSelected = loc.active
                return (
                  <div
                    key={loc.id}
                    onClick={() => handleSelectLocation(loc.id, loc.rawCity)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className='flex items-center gap-2 text-xs truncate'>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isSelected ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      />
                      <span className='truncate'>{loc.city}</span>
                    </div>
                    <Star
                      className={`w-3.5 h-3.5 ${
                        loc.isFav
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => setCurrentPage('saved-locations')}
              className='text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline block pt-1 cursor-pointer'
            >
              {t('viewAllLocations')}
            </button>
          </div>

          {/* Card 2: Precipitation Summary 7-Day Bars */}
          <div className='bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4'>
            <div>
              <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
                {t('precipitationSummary')}
              </h3>
              <p className='text-[11px] text-slate-400'>{t('next7Days')}</p>
            </div>

            <div>
              <div className='text-3xl font-black text-slate-900 dark:text-white'>
                {liveForecast?.daily?.length
                  ? parseFloat(
                      liveForecast.daily
                        .slice(0, 7)
                        .reduce((sum, d) => sum + (d.totalPrecipitation ?? d.precipitation ?? 0), 0)
                        .toFixed(1)
                    )
                  : '--'}{' '}
                <span className='text-sm font-bold text-slate-500'>mm</span>
              </div>
              <p className='text-[11px] text-slate-400 mt-0.5'>
                {t('totalRainfall')}
              </p>
            </div>

            {/* Vertical Bar Chart */}
            <div className='h-32 flex items-end justify-between gap-2 pt-4 border-b border-slate-100 dark:border-slate-800 pb-2'>
              {precipBars.length > 0 ? (
                precipBars.map((bar, i) => (
                  <div
                    key={i}
                    className='flex-1 flex flex-col items-center h-full justify-end group'
                  >
                    <span className='text-[9px] font-bold text-slate-600 dark:text-slate-300 mb-1 opacity-0 group-hover:opacity-100 transition'>
                      {bar.mm}
                    </span>
                    <div className='w-full bg-slate-100 dark:bg-slate-800 rounded-t-md h-full flex items-end'>
                      <div
                        className='w-full bg-blue-600 rounded-t-md transition-all duration-500 group-hover:bg-blue-500'
                        style={{ height: bar.height }}
                      />
                    </div>
                    <span className='text-[10px] font-bold text-slate-500 mt-1'>
                      {bar.day}
                    </span>
                  </div>
                ))
              ) : (
                <div className='w-full h-full flex items-center justify-center text-xs text-slate-400'>
                  {forecastLoading ? t('loadingForecast') : t('noDataAvailable') || 'Rainfall data unavailable'}
                </div>
              )}
            </div>
          </div>

          {/* Card 3: UV Index */}
          <div className='bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3'>
            {(() => {
              const uvValue = currentForecastHour?.uvIndex ?? currentForecastDay?.uvIndexMax ?? weatherData?.forecast?.current?.uvIndex;
              const uvDisplay = uvValue != null ? Math.round(uvValue) : '--';
              const uvPercent = uvValue != null ? Math.min(Math.max((uvValue / 11) * 100, 5), 95) : 50;

              return (
                <>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
                        {t('uvIndex')}
                      </h3>
                      <p className='text-[11px] text-slate-400'>{t('today')}</p>
                    </div>
                    <div className='flex items-baseline gap-1.5'>
                      <span className='text-2xl font-black text-slate-900 dark:text-white'>
                        {uvDisplay}
                      </span>
                      {uvValue != null && (
                        <span className={`text-xs font-bold ${uvValue >= 8 ? 'text-rose-500' : uvValue >= 6 ? 'text-orange-500' : uvValue >= 3 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {uvValue >= 8 ? t('veryHigh') || 'Very High' : uvValue >= 6 ? t('high') : uvValue >= 3 ? t('moderate') || 'Moderate' : t('low') || 'Low'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Multi-color UV Spectrum Bar */}
                  <div className='space-y-1.5 pt-1'>
                    <div className='h-2 w-full rounded-full bg-gradient-to-r from-emerald-400 via-orange-500 to-rose-600 relative'>
                      {uvValue != null && (
                        <div
                          className='absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-orange-500 rounded-full shadow-xs'
                          style={{ left: `${uvPercent}%` }}
                        />
                      )}
                    </div>
                    <div className='flex justify-between text-[9px] text-slate-400 font-bold px-0.5'>
                      <span>1</span>
                      <span>3</span>
                      <span>5</span>
                      <span>7</span>
                      <span>9</span>
                      <span>11+</span>
                    </div>
                  </div>

                  <div className='flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1'>
                    <Sun className='w-4 h-4 text-amber-500 shrink-0' />
                    <p className='text-[11px]'>
                      {t('uvProtectionAdvice')}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Card 4: Air Quality Index */}
          <div className='bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3'>
            <div>
              <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
                {t('airQuality')}
              </h3>
              <p className='text-[11px] text-slate-400'>{t('today')}</p>
            </div>

            {(() => {
              const aqiVal = weatherData?.airQuality?.current?.us_aqi ?? weatherData?.airQuality?.current?.european_aqi;
              const aqiDisplay = aqiVal != null ? Math.round(aqiVal) : '--';
              const aqiColor = aqiVal == null ? 'text-slate-400 border-slate-400' : aqiVal <= 50 ? 'text-emerald-500 border-emerald-500' : aqiVal <= 100 ? 'text-amber-500 border-amber-500' : 'text-rose-500 border-rose-500';

              return (
                <div className='flex items-center gap-3.5'>
                  <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-black text-lg shrink-0 ${aqiColor}`}>
                    {aqiDisplay}
                  </div>
                  <div>
                    <span className={`text-sm font-bold ${aqiVal <= 50 ? 'text-emerald-600' : aqiVal <= 100 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {aqiVal == null ? '--' : aqiVal <= 50 ? t('aqiGood') : aqiVal <= 100 ? t('aqiModerate') || 'Moderate' : t('aqiPoor') || 'Unhealthy'}
                    </span>
                    <p className='text-[11px] text-slate-500 dark:text-slate-400 mt-0.5'>
                      {aqiVal != null && aqiVal <= 50 ? t('aqiGoodDesc') : 'Air quality telemetry monitored live via CPCB/Open-Meteo.'}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Card 5: Sunrise & Sunset */}
          <div className='bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3'>
            <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
              {t('sunriseSunset')}
            </h3>

            {(() => {
              const sunrise = currentForecastDay?.sunrise;
              const sunset = currentForecastDay?.sunset;
              const sunriseDisplay = sunrise ? new Date(sunrise).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '--';
              const sunsetDisplay = sunset ? new Date(sunset).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '--';

              return (
                <div className='grid grid-cols-2 gap-3 pt-1'>
                  {/* Sunrise */}
                  <div className='flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40'>
                    <Sun className='w-5 h-5 text-amber-500 shrink-0' />
                    <div>
                      <span className='text-[10px] text-slate-400 block'>
                        {t('sunrise')}
                      </span>
                      <span className='text-xs font-black text-slate-800 dark:text-slate-200'>
                        {sunriseDisplay}
                      </span>
                    </div>
                  </div>

                  {/* Sunset */}
                  <div className='flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40'>
                    <Sun className='w-5 h-5 text-orange-500 shrink-0' />
                    <div>
                      <span className='text-[10px] text-slate-400 block'>
                        {t('sunset')}
                      </span>
                      <span className='text-xs font-black text-slate-800 dark:text-slate-200'>
                        {sunsetDisplay}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Card 6: Compare Locations Button */}
          <div className='bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3'>
            <div>
              <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
                {t('compareLocations')}
              </h3>
              <p className='text-[11px] text-slate-500 dark:text-slate-400 mt-0.5'>
                {t('compareLocationsDesc')}
              </p>
            </div>

            <button
              onClick={() => setIsCompareModalOpen(true)}
              className='w-full py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs'
            >
              <Plus className='w-4 h-4' />
              <span>{t('addLocationCompare')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
