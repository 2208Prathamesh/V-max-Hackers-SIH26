import React, { useState } from 'react'
import { useWeather } from '../context/WeatherContext'
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
  Crown
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
    setIsPremiumModalOpen,
    setCurrentPage,
    addToast,
    forecastData,
    forecastLoading,
    forecastError,
    formatTemp,
    formatWind,
    formatPressure
  } = useWeather()

  const [activeChartTab, setActiveChartTab] = useState('temperature') // 'temperature' | 'precipitation' | 'wind' | 'humidity' | 'pressure'
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)
  const [locationSearchQuery, setLocationSearchQuery] = useState('')
  const [selectedDayIdx, setSelectedDayIdx] = useState(0)

  const city = selectedMapLocation ||
    savedLocations[0] || { city: 'Pune', region: 'Maharashtra' }
  const liveForecast = [
    forecastData?.models?.ecmwf,
    forecastData?.models?.gfs,
    forecastData?.models?.openMeteo
  ].find(
    model =>
      model?.current &&
      Array.isArray(model.hourly) &&
      model.hourly.length > 0 &&
      Array.isArray(model.daily) &&
      model.daily.length > 0
  )
  const currentForecast = liveForecast?.current
  const currentForecastHour = liveForecast?.hourly?.[0]
  const currentForecastDay = liveForecast?.daily?.[0]

  const locationTimezone = liveForecast?.location?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone

  const hourlyStartIndex = liveForecast?.hourly?.findIndex(
    hour => new Date(hour.time) >= new Date()
  ) ?? 0

  const hourlySlice = liveForecast?.hourly
    ? liveForecast.hourly.slice(hourlyStartIndex, hourlyStartIndex + 9)
    : []

  const formatDate = date =>
    new Date(`${date}T12:00:00`).toLocaleDateString([], {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })

  const weatherIcon = precipitationProbability => {
    if (precipitationProbability >= 50) return 'rain'
    if (precipitationProbability >= 25) return 'sun-cloud'
    return 'sun'
  }


  const sevenDayForecast = liveForecast?.daily?.length
    ? liveForecast.daily.slice(0, 7).map(day => ({
        day: formatDate(day.date).split(' ')[0],
        date: formatDate(day.date).replace(
          `${formatDate(day.date).split(' ')[0]} `,
          ''
        ),
        high: formatTemp(day.maxTemperature),
        low: formatTemp(day.minTemperature),
        pop: `${Math.round(day.precipitationProbability ?? 0)}%`,
        icon: weatherIcon(day.precipitationProbability ?? 0)
      }))
    : []

  const nineHourForecast = hourlySlice.length
    ? hourlySlice.map((hour, index) => ({
        time:
          index === 0
            ? 'Now'
            : new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                timeZone: locationTimezone
              }).format(new Date(hour.time)),
        temp: formatTemp(hour.temperature),
        pop: `${Math.round(hour.precipitationProbability ?? 0)}%`,
        icon: weatherIcon(hour.precipitationProbability ?? 0)
      }))
    : []

  // Chart data based on active tab
  const getChartPoints = () => {
    if (hourlySlice.length) {
      const chartValues = {
        temperature: hour => formatTemp(hour.temperature),
        precipitation: hour => `${hour.precipitation ?? 0} mm`,
        wind: hour => formatWind(hour.windSpeed),
        humidity: hour => `${hour.humidity ?? 0}%`,
        pressure: hour => formatPressure(hour.pressure)
      }
      const yPositions = [120, 85, 65, 25, 50, 100]
      return hourlySlice.slice(0, 6).map((hour, index) => ({
        time: new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          timeZone: locationTimezone
        }).format(new Date(hour.time)),
        val: chartValues[activeChartTab](hour),
        y: yPositions[index]
      }))
    }

    return []
  }

  const chartPoints = getChartPoints()
  const chartX = index => [20, 112, 204, 304, 400, 480][index]
  const chartPath = chartPoints
    .map((point, index) => `${chartX(index)} ${point.y}`)
    .join(' L ')

  // Precipitation weekly bars
  const maxPrecipitation = Math.max(
    ...(liveForecast?.daily?.slice(0, 7).map(day => day.precipitation ?? 0) || [
      0
    ]),
    1
  )
  const precipBars = (liveForecast?.daily || []).slice(0, 7).map(day => ({
    day: formatDate(day.date).split(' ')[0],
    mm: day.precipitation ?? 0,
    height: `${Math.max(
      4,
      ((day.precipitation ?? 0) / maxPrecipitation) * 100
    )}%`
  }))

  // Right sidebar locations list
  const sidebarLocations = savedLocations.map(location => ({
    id: location.id,
    city: `${location.city}, ${
      location.region || location.state || ''
    }`.replace(/, $/, ''),
    isFav: location.isFavorite
  }))

  const filteredSidebarLocations = sidebarLocations.filter(l =>
    l.city.toLowerCase().includes(locationSearchQuery.toLowerCase())
  )

  const handleSelectLocation = locName => {
    const found = savedLocations.find(l =>
      l.city.toLowerCase().includes(locName.split(',')[0].toLowerCase())
    )
    if (found) {
      setSelectedMapLocation(found)
      addToast(`Updated forecast for ${found.city}`, 'info')
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
          Forecast
        </h1>
        <p className='text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1'>
          Plan ahead with accurate weather forecasts
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
                    {city.city}, {city.region}
                  </h2>
                  <ChevronDown className='w-4 h-4 text-slate-400' />
                </div>
                <p className='text-xs text-slate-400 pl-5.5 mt-0.5'>
                  {city.lat ?? city.latitude ?? '--'}° N,{' '}
                  {city.lng ?? city.longitude ?? '--'}° E
                </p>
              </div>

              <button
                onClick={() => setIsAddLocationOpen(true)}
                className='px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs'
              >
                <RefreshCw className='w-3.5 h-3.5' />
                <span>Change Location</span>
              </button>
            </div>

            {/* Middle & Right: Weather Info & 6 Metrics */}
            <div className='grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2'>
              {/* Left Part: 3D Art & Big Temp (Span 6) */}
              <div className='md:col-span-6 flex items-center gap-4'>
                <Hero3DSunCloud />
                <div>
                  <span className='text-xs font-semibold text-blue-600 dark:text-blue-400 block'>
                    {forecastLoading
                      ? 'Loading forecast...'
                      : forecastError
                      ? 'Forecast unavailable'
                      : liveForecast?.retrievedAt
                      ? new Date(liveForecast.retrievedAt).toLocaleDateString(
                          [],
                          {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          }
                        )
                      : currentForecastDay?.date
                      ? formatDate(currentForecastDay.date)
                      : 'Forecast unavailable'}
                  </span>
                  <div className='text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5'>
                    {formatTemp(currentForecast?.temperature)}
                  </div>
                  <p className='text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1'>
                    {currentForecast?.weatherDescription ||
                      'Weather unavailable'}
                  </p>
                  <p className='text-[11px] text-slate-400'>
                    {forecastLoading
                      ? 'Loading forecast...'
                      : forecastError
                      ? forecastError
                      : liveForecast
                      ? `Live forecast from ${liveForecast.source || 'WeatherGPT'}`
                      : 'Forecast unavailable'}
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
                      Min
                    </span>
                    <span className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                      {formatTemp(currentForecastDay?.minTemperature)}
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
                      Wind
                    </span>
                    <span className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                      {formatWind(currentForecast?.windSpeed)}
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
                      Max
                    </span>
                    <span className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                      {formatTemp(currentForecastDay?.maxTemperature)}
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
                      Pressure
                    </span>
                    <span className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                      {formatPressure(currentForecast?.pressure)}
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
                      Humidity
                    </span>
                    <span className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                      {currentForecast?.humidity == null
                        ? '--'
                        : `${currentForecast.humidity}%`}
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
                      Visibility
                    </span>
                    <span className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                      {currentForecastHour?.visibility == null
                        ? '--'
                        : `${(currentForecastHour.visibility / 1000).toFixed(
                            1
                          )} km`}
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
                7-Day Forecast
              </h3>
              <button
                onClick={() =>
                  addToast('Viewing extended ensemble forecast', 'info')
                }
                className='text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-0.5'
              >
                <span>View full 7-day forecast</span>
                <ChevronRight className='w-3.5 h-3.5' />
              </button>
            </div>

            {/* 7 Columns Daily Grid */}
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
          </div>

          {/* Card 3: Hourly Forecast (9 slots) */}
          <div className='bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-base font-bold text-slate-900 dark:text-white'>
                Hourly Forecast
              </h3>
              <div className='w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 cursor-pointer hover:text-slate-600'>
                <ChevronRight className='w-4 h-4' />
              </div>
            </div>

            {/* 9 columns strip */}
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
                    <Droplets className='w-2 h-2' />
                    <span>{hour.pop}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Detailed Forecast & Curve Graph */}
          <div className='bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5'>
            <h3 className='text-base font-bold text-slate-900 dark:text-white'>
              Detailed Forecast
            </h3>

            {/* 5 Metric Tabs */}
            <div className='flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none pb-2'>
              {[
                { id: 'temperature', label: 'Temperature' },
                { id: 'precipitation', label: 'Precipitation' },
                { id: 'wind', label: 'Wind' },
                { id: 'humidity', label: 'Humidity' },
                { id: 'pressure', label: 'Pressure' }
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
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
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

                  {chartPoints.length > 0 && (
                    <>
                      <path
                        d={`M ${chartPath} L ${chartX(
                          chartPoints.length - 1
                        )} 150 L ${chartX(0)} 150 Z`}
                        fill='url(#chartFillGrad)'
                      />
                      <path
                        d={`M ${chartPath}`}
                        fill='none'
                        stroke='#2563EB'
                        strokeWidth='3.5'
                        strokeLinecap='round'
                      />
                      {chartPoints.map((point, index) => (
                        <g key={`${point.time}-${index}`}>
                          <circle
                            cx={chartX(index)}
                            cy={point.y}
                            r='4.5'
                            fill='#2563EB'
                            stroke='#FFFFFF'
                            strokeWidth='2'
                          />
                          <text
                            x={chartX(index)}
                            y={Math.max(10, point.y - 15)}
                            textAnchor='middle'
                            fill='#1E293B'
                            className='text-[11px] font-extrabold fill-slate-800 dark:fill-slate-100'
                          >
                            {point.val}
                          </text>
                        </g>
                      ))}
                    </>
                  )}
                </svg>

                {/* X-axis labels */}
                <div className='absolute -bottom-6 inset-x-0 flex justify-between text-[11px] font-bold text-slate-500'>
                  {chartPoints.map(point => (
                    <span key={point.time}>{point.time}</span>
                  ))}
                </div>
              </div>

              {/* Right Summary Box (Span 4) */}
              <div className='md:col-span-4 p-4 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3'>
                <h4 className='text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider'>
                  Summary
                </h4>
                <p className='text-xs text-slate-600 dark:text-slate-300 leading-relaxed'>
                  {currentForecastDay?.weatherDescription ||
                    'Forecast summary unavailable.'}
                </p>

                <div className='space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs'>
                  <div className='flex items-center gap-2'>
                    <Thermometer className='w-4 h-4 text-rose-500 shrink-0' />
                    <div>
                      <span className='text-[10px] text-slate-400 block'>
                        Max Temperature
                      </span>
                      <span className='font-bold text-slate-800 dark:text-slate-200'>
                        {formatTemp(currentForecastDay?.maxTemperature)}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Thermometer className='w-4 h-4 text-blue-500 shrink-0' />
                    <div>
                      <span className='text-[10px] text-slate-400 block'>
                        Min Temperature
                      </span>
                      <span className='font-bold text-slate-800 dark:text-slate-200'>
                        {formatTemp(currentForecastDay?.minTemperature)}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Droplets className='w-4 h-4 text-sky-500 shrink-0' />
                    <div>
                      <span className='text-[10px] text-slate-400 block'>
                        Rainfall
                      </span>
                      <span className='font-bold text-slate-800 dark:text-slate-200'>
                        {currentForecastDay?.precipitation == null
                          ? '--'
                          : `${currentForecastDay.precipitation} mm`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Banner: Plan Your Day Better */}
          <div className='rounded-3xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs'>
            <div className='flex items-center gap-3.5'>
              <div className='w-10 h-10 rounded-2xl bg-white dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center shadow-xs shrink-0'>
                <CalendarDays className='w-5 h-5' />
              </div>
              <div>
                <h4 className='text-sm font-bold text-slate-900 dark:text-white'>
                  Plan Your Day Better
                </h4>
                <p className='text-xs text-slate-600 dark:text-slate-300 mt-0.5'>
                  Get detailed 7-day forecasts, hourly updates and severe
                  weather alerts with WeatherGPT Premium.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsPremiumModalOpen(true)}
              className='px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-blue-50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer'
            >
              <Crown className='w-4 h-4 text-amber-500 fill-amber-400' />
              <span>Upgrade to Premium</span>
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
              Select Location
            </h3>

            {/* Search Box */}
            <div className='relative'>
              <input
                type='text'
                placeholder='Search location...'
                value={locationSearchQuery}
                onChange={e => setLocationSearchQuery(e.target.value)}
                className='w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <Search className='w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2' />
            </div>

            {/* Locations List */}
            <div className='space-y-1.5 pt-1'>
              {filteredSidebarLocations.map(loc => {
                const isSelected = city.city
                  .toLowerCase()
                  .includes(loc.city.split(',')[0].toLowerCase())
                return (
                  <div
                    key={loc.id}
                    onClick={() => handleSelectLocation(loc.city)}
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
              View all locations
            </button>
          </div>

          {/* Card 2: Precipitation Summary 7-Day Bars */}
          <div className='bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4'>
            <div>
              <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
                Precipitation Summary
              </h3>
              <p className='text-[11px] text-slate-400'>Next 7 Days</p>
            </div>

            <div>
              <div className='text-3xl font-black text-slate-900 dark:text-white'>
                28.6{' '}
                <span className='text-sm font-bold text-slate-500'>mm</span>
              </div>
              <p className='text-[11px] text-slate-400 mt-0.5'>
                Total Rainfall
              </p>
            </div>

            {/* Vertical Bar Chart */}
            <div className='h-32 flex items-end justify-between gap-2 pt-4 border-b border-slate-100 dark:border-slate-800 pb-2'>
              {precipBars.map((bar, i) => (
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
              ))}
            </div>
          </div>

          {/* Card 3: UV Index */}
          <div className='bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
                  UV Index
                </h3>
                <p className='text-[11px] text-slate-400'>Today</p>
              </div>
              <div className='flex items-baseline gap-1.5'>
                <span className='text-2xl font-black text-slate-900 dark:text-white'>
                  7
                </span>
                <span className='text-xs font-bold text-orange-500'>High</span>
              </div>
            </div>

            {/* Multi-color UV Spectrum Bar */}
            <div className='space-y-1.5 pt-1'>
              <div className='h-2 w-full rounded-full bg-gradient-to-r from-emerald-400 via-orange-500 to-rose-600 relative'>
                <div className='absolute top-1/2 left-[62%] -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-orange-500 rounded-full shadow-xs' />
              </div>
              <div className='flex justify-between text-[9px] text-slate-400 font-bold px-0.5'>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>7</span>
                <span>8</span>
                <span>9</span>
                <span>10</span>
                <span>11+</span>
              </div>
            </div>

            <div className='flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1'>
              <Sun className='w-4 h-4 text-amber-500 shrink-0' />
              <p className='text-[11px]'>
                Wear sunglasses and use sun protection.
              </p>
            </div>
          </div>

          {/* Card 4: Air Quality Index */}
          <div className='bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3'>
            <div>
              <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
                Air Quality Index
              </h3>
              <p className='text-[11px] text-slate-400'>Today</p>
            </div>

            <div className='flex items-center gap-3.5'>
              <div className='w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center font-black text-lg text-emerald-600 shrink-0'>
                42
              </div>
              <div>
                <span className='text-sm font-bold text-emerald-600'>Good</span>
                <p className='text-[11px] text-slate-500 dark:text-slate-400 mt-0.5'>
                  Air quality is satisfactory and poses little or no risk.
                </p>
              </div>
            </div>
          </div>

          {/* Card 5: Sunrise & Sunset */}
          <div className='bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3'>
            <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
              Sunrise & Sunset
            </h3>

            <div className='grid grid-cols-2 gap-3 pt-1'>
              {/* Sunrise */}
              <div className='flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40'>
                <Sun className='w-5 h-5 text-amber-500 shrink-0' />
                <div>
                  <span className='text-[10px] text-slate-400 block'>
                    Sunrise
                  </span>
                  <span className='text-xs font-black text-slate-800 dark:text-slate-200'>
                    5:47 AM
                  </span>
                </div>
              </div>

              {/* Sunset */}
              <div className='flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40'>
                <Sun className='w-5 h-5 text-orange-500 shrink-0' />
                <div>
                  <span className='text-[10px] text-slate-400 block'>
                    Sunset
                  </span>
                  <span className='text-xs font-black text-slate-800 dark:text-slate-200'>
                    6:57 PM
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 6: Compare Locations Button */}
          <div className='bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3'>
            <div>
              <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
                Compare Locations
              </h3>
              <p className='text-[11px] text-slate-500 dark:text-slate-400 mt-0.5'>
                Compare weather between different locations.
              </p>
            </div>

            <button
              onClick={() => setIsCompareModalOpen(true)}
              className='w-full py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs'
            >
              <Plus className='w-4 h-4' />
              <span>Add Location to Compare</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
