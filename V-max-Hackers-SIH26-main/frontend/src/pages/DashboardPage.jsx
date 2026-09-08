import React, { useState } from 'react'
import { useWeather } from '../context/WeatherContext'
import {
  MapPin,
  Droplets,
  Wind,
  Gauge,
  Eye,
  AlertTriangle,
  ChevronRight,
  CalendarDays,
  Map,
  MessageSquare,
  Mic,
  Send,
  Sprout,
  Sun,
  CloudRain,
  CloudSun,
  Cloud,
  ArrowRight
} from 'lucide-react'

// 3D Styled Cloud & Sun Illustration for Hero Card
const Hero3DWeatherGraphic = () => (
  <div className='relative w-36 h-28 sm:w-44 sm:h-32 flex items-center justify-center select-none pointer-events-none'>
    {/* Radiant Sun with Golden Rays */}
    <div className='absolute top-1 right-2 sm:right-4 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-yellow-200 shadow-[0_0_24px_rgba(250,204,21,0.85)] flex items-center justify-center animate-pulse-subtle'>
      {/* Sun rays styling */}
      <div className='w-12 h-12 rounded-full bg-yellow-300/40 blur-xs' />
    </div>

    {/* Front 3D Puffy Cloud */}
    <div className='relative z-10 filter drop-shadow-xl mt-4 -ml-4'>
      <svg
        className='w-28 h-20 sm:w-36 sm:h-24'
        viewBox='0 0 100 68'
        fill='none'
      >
        <path
          d='M75 58H25C13.95 58 5 49.05 5 38C5 27.56 12.97 19 23.31 18.09C27.65 7.46 38.2 0.5 50.5 0.5C65.34 0.5 77.63 11.16 80.22 25.28C89.28 26.98 95.5 34.88 95.5 43.88C95.5 52.02 88.94 58 80.8 58H75Z'
          fill='url(#heroCloudGrad)'
        />
        <defs>
          <linearGradient
            id='heroCloudGrad'
            x1='15'
            y1='5'
            x2='85'
            y2='60'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='#FFFFFF' />
            <stop offset='0.6' stopColor='#F0F6FC' />
            <stop offset='1' stopColor='#D5E2EE' />
          </linearGradient>
        </defs>
      </svg>
    </div>
  </div>
)

// Green Trees Landscape Illustration for Eco Banner
const TreesIllustration = () => (
  <div className='relative w-48 sm:w-64 h-20 sm:h-24 flex items-end justify-end select-none pointer-events-none overflow-hidden'>
    <svg className='w-full h-full' viewBox='0 0 240 90' fill='none'>
      {/* Rolling Hills in background */}
      <path
        d='M0 90 Q 60 45, 120 70 T 240 60 L 240 90 Z'
        fill='#A7F3D0'
        opacity='0.6'
      />
      <path
        d='M40 90 Q 110 50, 180 75 T 240 65 L 240 90 Z'
        fill='#6EE7B7'
        opacity='0.7'
      />
      <path
        d='M0 90 Q 90 65, 170 80 T 240 75 L 240 90 Z'
        fill='#34D399'
        opacity='0.8'
      />

      {/* Tree 1: Left small round */}
      <circle cx='35' cy='62' r='16' fill='#10B981' />
      <circle cx='30' cy='56' r='12' fill='#34D399' />
      <rect
        x='33'
        y='70'
        width='4'
        height='18'
        fill='#78350F'
        opacity='0.8'
        rx='2'
      />

      {/* Tree 2: Center-left medium tree */}
      <circle cx='70' cy='50' r='22' fill='#059669' />
      <circle cx='65' cy='42' r='17' fill='#10B981' />
      <rect
        x='68'
        y='66'
        width='5'
        height='22'
        fill='#78350F'
        opacity='0.8'
        rx='2'
      />

      {/* Tree 3: Large Center tree */}
      <circle cx='120' cy='38' r='28' fill='#047857' />
      <circle cx='114' cy='30' r='22' fill='#10B981' />
      <circle cx='128' cy='34' r='16' fill='#34D399' />
      <rect
        x='117'
        y='60'
        width='6'
        height='28'
        fill='#78350F'
        opacity='0.9'
        rx='3'
      />

      {/* Tree 4: Right medium round tree */}
      <circle cx='170' cy='48' r='24' fill='#059669' />
      <circle cx='164' cy='40' r='18' fill='#34D399' />
      <rect
        x='168'
        y='66'
        width='5'
        height='22'
        fill='#78350F'
        opacity='0.8'
        rx='2'
      />

      {/* Tree 5: Far Right small tree */}
      <circle cx='210' cy='58' r='16' fill='#10B981' />
      <rect
        x='208'
        y='70'
        width='4'
        height='18'
        fill='#78350F'
        opacity='0.8'
        rx='2'
      />
    </svg>
  </div>
)

export const DashboardPage = () => {
  const {
    user,
    setCurrentPage,
    sendChatMessage,
    setActiveConversationId,
    setIsAirQualityOpen,
    selectedMapLocation,
    setSelectedMapLocation,
    savedLocations,
    addToast,
    conversations,
    alerts,
    weatherData,
    forecastData,
    formatTemp,
    formatWind,
    formatPressure
  } = useWeather()

  const [queryText, setQueryText] = useState('')

  const userName = user?.name ? user.name.split(' ')[0] : 'Sid'
  const currentHour = weatherData?.forecast?.hourly?.[0]
  const forecastCurrent = forecastData?.models?.openMeteo?.current
  const forecastHour = forecastData?.models?.openMeteo?.hourly?.[0]
  const currentConditions =
    weatherData?.forecast?.current?.temperature != null
      ? weatherData.forecast.current
      : currentHour?.temperature != null
      ? currentHour
      : forecastCurrent?.temperature != null
      ? forecastCurrent
      : forecastHour
  const forecastHours = forecastData?.models?.openMeteo?.hourly || []

  const weatherIcon = precipitationProbability => {
    if (precipitationProbability >= 50) return 'rain'
    if (precipitationProbability >= 25) return 'sun-cloud'
    return 'sun'
  }

  const selectedLocation = selectedMapLocation || savedLocations[0]
  const locationLabel = selectedLocation
    ? `${selectedLocation.city}, ${
        selectedLocation.region ||
        selectedLocation.state ||
        selectedLocation.country
      }`
    : 'Current location'
  const weatherDescription =
    currentConditions?.precipitation > 0
      ? 'Rain nearby'
      : currentConditions?.humidity > 80
      ? 'Humid conditions'
      : 'Current conditions'
  const currentTime =
    currentHour?.time || forecastHour?.time
      ? new Date(currentHour?.time || forecastHour.time).toLocaleString([], {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: 'numeric',
          minute: '2-digit'
        })
      : 'Weather data unavailable'

  const formattedCurrentTemperature = formatTemp(currentConditions?.temperature)
  const suggestionChips = [
    'Will it rain tomorrow?',
    'Weather in Mumbai',
    'Cyclone update',
    'Air quality today'
  ]

  const handleSearchSubmit = e => {
    e.preventDefault()
    if (!queryText.trim()) return
    sendChatMessage(queryText)
    setCurrentPage('chat')
    setQueryText('')
  }

  const handleChipClick = chip => {
    sendChatMessage(chip)
    setCurrentPage('chat')
  }

  const handleVoiceSearch = () => {
    addToast('Listening... Speak your weather query', 'info')
    setTimeout(() => {
      setQueryText('What is the forecast for this weekend?')
    }, 1500)
  }

  // Hourly Forecast Data matching screenshot
  const fallbackHourlyData = [
    { time: 'Now', temp: '28°', pop: '65%', icon: 'sun-cloud', isNow: true },
    { time: '9 AM', temp: '29°', pop: '60%', icon: 'rain' },
    { time: '10 AM', temp: '30°', pop: '70%', icon: 'rain' },
    { time: '11 AM', temp: '31°', pop: '80%', icon: 'rain' },
    { time: '12 PM', temp: '31°', pop: '70%', icon: 'cloud' },
    { time: '1 PM', temp: '30°', pop: '60%', icon: 'cloud' },
    { time: '2 PM', temp: '29°', pop: '40%', icon: 'cloud' }
  ]
  const hourlyData = forecastHours.length
    ? forecastHours.slice(0, 7).map((hour, index) => ({
        time:
          index === 0
            ? 'Now'
            : new Date(hour.time).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit'
              }),
        temp:
          formatTemp(hour.temperature).replace('°C', '').replace('°F', '') +
          '°',
        pop: `${Math.round(hour.precipitationProbability ?? 0)}%`,
        icon: weatherIcon(hour.precipitationProbability ?? 0),
        isNow: index === 0
      }))
    : fallbackHourlyData

  // Recent Conversations matching screenshot
  const fallbackRecentChats = [
    { id: 'conv-1', title: 'Will it rain tomorrow in Pune?', time: '8:15 AM' },
    { id: 'conv-2', title: 'Weather update for my farm', time: 'Yesterday' },
    {
      id: 'conv-3',
      title: 'Cyclone update in Bay of Bengal',
      time: 'Yesterday'
    },
    { id: 'conv-4', title: 'What is the temperature today?', time: '20 May' },
    { id: 'conv-5', title: 'Air quality in Delhi', time: '19 May' }
  ]
  const recentChats = conversations.length
    ? conversations.slice(0, 5).map(conversation => ({
        id: conversation.id,
        title: conversation.title,
        time: conversation.time || 'Recent'
      }))
    : fallbackRecentChats

  // Saved Locations matching screenshot
  const dashboardLocations = savedLocations.length
    ? savedLocations.slice(0, 4).map((location, index) => ({
        city: `${location.city}, ${
          location.region || location.state || location.country
        }`,
        status:
          index === 0
            ? 'Current Location'
            : location.isFavorite
            ? 'Favorite location'
            : 'Saved location',
        temp:
          index === 0 && currentHour
            ? formatTemp(currentHour.temperature)
            : '--',
        icon:
          index === 0
            ? weatherIcon(currentHour?.precipitationProbability ?? 0)
            : 'sun-cloud',
        rawCity: location.city
      }))
    : []

  const displayedAlerts = alerts.slice(0, 3)

  const handleLocationClick = rawCity => {
    const loc = savedLocations.find(
      l => l.city.toLowerCase() === rawCity.toLowerCase()
    )
    if (loc) {
      setSelectedMapLocation(loc)
      addToast(`Selected ${loc.city} weather view`, 'info')
    }
  }

  const handleRecentChatClick = id => {
    setActiveConversationId(id)
    setCurrentPage('chat')
  }

  return (
    <div className='space-y-6 pb-8 select-none'>
      {/* =========================================================================
          TOP SECTION: Greeting & AI Natural Language Search Bar
          ========================================================================= */}
      <div>
        <div className='flex items-center gap-2'>
          <h1 className='text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight'>
            Good morning, {userName}!
          </h1>
          <span className='text-2xl sm:text-3xl animate-bounce'>👋</span>
        </div>
        <p className='text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1'>
          Here's your weather overview
        </p>

        {/* AI Query Input Bar */}
        <form onSubmit={handleSearchSubmit} className='mt-5'>
          <div className='relative flex items-center w-full rounded-full bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-slate-700/80 shadow-sm hover:border-blue-300 dark:hover:border-slate-600 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition p-1.5 pl-6'>
            <input
              type='text'
              placeholder='Ask WeatherGPT anything...'
              value={queryText}
              onChange={e => setQueryText(e.target.value)}
              className='w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none pr-3'
            />
            <div className='flex items-center gap-2 pr-1'>
              {/* Mic button */}
              <button
                type='button'
                onClick={handleVoiceSearch}
                className='w-10 h-10 rounded-full border border-blue-100 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition flex items-center justify-center cursor-pointer'
                title='Voice Search'
              >
                <Mic className='w-4 h-4' />
              </button>
              {/* Send Submit button */}
              <button
                type='submit'
                className='w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/25 transition cursor-pointer'
                title='Ask WeatherGPT'
              >
                <Send className='w-4 h-4' />
              </button>
            </div>
          </div>
        </form>

        {/* 4 Query Suggestion Chips */}
        <div className='flex flex-wrap items-center gap-2.5 mt-3.5'>
          {suggestionChips.map((chip, index) => (
            <button
              key={index}
              type='button'
              onClick={() => handleChipClick(chip)}
              className='px-4 py-2 rounded-full bg-white dark:bg-[#151F32] border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition shadow-2xs cursor-pointer'
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          ROW 1: Current Weather Hero Card + Active Alerts
          ========================================================================= */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Left: Current Weather Card (Pune, Maharashtra) - Span 7 */}
        <div className='lg:col-span-7 rounded-[28px] bg-gradient-to-br from-[#d9effe] via-[#e8f6ff] to-[#f4faff] dark:from-slate-800/95 dark:via-slate-800/80 dark:to-slate-900 border border-sky-200/90 dark:border-slate-700/80 p-6 sm:p-7 shadow-sm flex flex-col justify-between relative overflow-hidden'>
          {/* Header with Location & Date */}
          <div>
            <div className='flex items-center gap-2'>
              <MapPin className='w-5 h-5 text-blue-600 fill-blue-600/10' />
              <h2 className='text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight'>
                {locationLabel}
              </h2>
            </div>
            <p className='text-xs text-slate-500 dark:text-slate-400 mt-1 pl-7 font-medium'>
              {currentTime}
            </p>
          </div>

          {/* Temperature & 3D Art Row */}
          <div className='flex items-center justify-between my-4'>
            <div>
              <div className='text-6xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tighter'>
                {formattedCurrentTemperature === '--' ? (
                  '--'
                ) : (
                  <>
                    {formattedCurrentTemperature
                      .replace('°C', '')
                      .replace('°F', '')}
                    <span className='text-3xl sm:text-4xl font-bold align-top'>
                      °{formattedCurrentTemperature.endsWith('°F') ? 'F' : 'C'}
                    </span>
                  </>
                )}
              </div>
              <p className='text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1.5'>
                Feels like {formatTemp(currentConditions?.apparentTemperature)}
              </p>
              <p className='text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5'>
                {weatherDescription}
              </p>
            </div>

            {/* 3D Sun & Cloud Graphic */}
            <Hero3DWeatherGraphic />
          </div>

          {/* 4 Metrics Pills Row */}
          <div className='grid grid-cols-4 gap-2.5 pt-4 border-t border-sky-200/60 dark:border-slate-700/60'>
            {/* Humidity */}
            <div className='bg-white/90 dark:bg-slate-800/90 rounded-2xl p-3 text-center border border-white/60 dark:border-slate-700/60 shadow-2xs'>
              <div className='w-6 h-6 mx-auto mb-1 text-blue-500 flex items-center justify-center'>
                <Droplets className='w-4 h-4' />
              </div>
              <span className='text-[11px] text-slate-500 dark:text-slate-400 block'>
                Humidity
              </span>
              <span className='text-xs sm:text-sm font-bold text-slate-900 dark:text-white'>
                {currentConditions?.humidity ?? '--'}
                {currentConditions?.humidity == null ? '' : '%'}
              </span>
            </div>

            {/* Wind */}
            <div className='bg-white/90 dark:bg-slate-800/90 rounded-2xl p-3 text-center border border-white/60 dark:border-slate-700/60 shadow-2xs'>
              <div className='w-6 h-6 mx-auto mb-1 text-blue-500 flex items-center justify-center'>
                <Wind className='w-4 h-4' />
              </div>
              <span className='text-[11px] text-slate-500 dark:text-slate-400 block'>
                Wind
              </span>
              <span className='text-xs sm:text-sm font-bold text-slate-900 dark:text-white'>
                {currentConditions?.windSpeed == null
                  ? '--'
                  : formatWind(currentConditions.windSpeed)}
              </span>
            </div>

            {/* Pressure */}
            <div className='bg-white/90 dark:bg-slate-800/90 rounded-2xl p-3 text-center border border-white/60 dark:border-slate-700/60 shadow-2xs'>
              <div className='w-6 h-6 mx-auto mb-1 text-blue-500 flex items-center justify-center'>
                <Gauge className='w-4 h-4' />
              </div>
              <span className='text-[11px] text-slate-500 dark:text-slate-400 block'>
                Pressure
              </span>
              <span className='text-xs sm:text-sm font-bold text-slate-900 dark:text-white'>
                {currentConditions?.pressure == null
                  ? '--'
                  : formatPressure(currentConditions.pressure)}
              </span>
            </div>

            {/* Visibility */}
            <div className='bg-white/90 dark:bg-slate-800/90 rounded-2xl p-3 text-center border border-white/60 dark:border-slate-700/60 shadow-2xs'>
              <div className='w-6 h-6 mx-auto mb-1 text-blue-500 flex items-center justify-center'>
                <Eye className='w-4 h-4' />
              </div>
              <span className='text-[11px] text-slate-500 dark:text-slate-400 block'>
                Visibility
              </span>
              <span className='text-xs sm:text-sm font-bold text-slate-900 dark:text-white'>
                --
              </span>
            </div>
          </div>
        </div>

        {/* Right: Active Alerts Card - Span 5 */}
        <div className='lg:col-span-5 bg-white dark:bg-[#111C2E] rounded-[28px] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-base font-bold text-slate-900 dark:text-white'>
              Active Alerts
            </h2>
            <button
              onClick={() => setCurrentPage('alerts')}
              className='text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
            >
              View All
            </button>
          </div>

          {displayedAlerts.length > 0 ? (
            <div className='space-y-2'>
              {displayedAlerts.map((alert, index) => (
                <div
                  key={alert._id || `${alert.title}-${index}`}
                  onClick={() => setCurrentPage('alerts')}
                  className={`${
                    index === 0
                      ? 'bg-[#FEF2F2] dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-900/40 p-4'
                      : 'bg-slate-50/80 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800/80 p-3'
                  } flex items-center justify-between rounded-2xl border cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800 transition`}
                >
                  <div className='flex items-start gap-3 min-w-0'>
                    <AlertTriangle
                      className={`${
                        index === 0
                          ? 'w-6 h-6 text-[#DC2626]'
                          : 'w-4 h-4 text-amber-500'
                      } shrink-0 mt-0.5`}
                    />
                    <div className='min-w-0'>
                      <h3
                        className={`${
                          index === 0
                            ? 'text-sm text-[#DC2626] dark:text-rose-400'
                            : 'text-xs text-slate-800 dark:text-slate-200'
                        } font-bold truncate group-hover:text-blue-600`}
                      >
                        {alert.title}
                      </h3>
                      <p className='text-[11px] text-slate-500 dark:text-slate-400 truncate'>
                        {alert.location}
                      </p>
                      {index === 0 && (
                        <p className='text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1'>
                          {alert.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {index === 0 ? (
                    <ArrowRight className='w-4 h-4 text-slate-400 shrink-0 ml-2' />
                  ) : (
                    <ChevronRight className='w-4 h-4 text-slate-400 shrink-0 ml-2' />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              No active alerts
            </p>
          )}
        </div>
      </div>

      {/* =========================================================================
          ROW 2: Today's Forecast + Quick Actions
          ========================================================================= */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Left: Today's Forecast (7 columns) - Span 7 */}
        <div className='lg:col-span-7 bg-white dark:bg-[#111C2E] rounded-[28px] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-base font-bold text-slate-900 dark:text-white'>
              Today's Forecast
            </h2>
            <button
              onClick={() => setCurrentPage('forecast')}
              className='text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
            >
              View Full Forecast
            </button>
          </div>

          {/* 7 Columns Hourly Grid */}
          <div className='grid grid-cols-7 gap-2 pt-2'>
            {hourlyData.map((item, index) => {
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center justify-between py-3.5 px-1 rounded-2xl text-center transition ${
                    item.isNow
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className='text-xs font-bold text-slate-700 dark:text-slate-300'>
                    {item.time}
                  </span>

                  {/* Weather Icon */}
                  <div className='my-2.5 flex items-center justify-center'>
                    {item.icon === 'sun-cloud' && (
                      <div className='relative w-7 h-7 flex items-center justify-center'>
                        <Sun className='w-4 h-4 text-amber-500 absolute -top-1 -right-1' />
                        <Cloud className='w-6 h-6 text-slate-400 fill-slate-200 dark:fill-slate-700' />
                      </div>
                    )}
                    {item.icon === 'rain' && (
                      <div className='text-blue-500'>
                        <CloudRain className='w-6 h-6' />
                      </div>
                    )}
                    {item.icon === 'cloud' && (
                      <div className='text-slate-400'>
                        <Cloud className='w-6 h-6 fill-slate-200 dark:fill-slate-700' />
                      </div>
                    )}
                  </div>

                  {/* Temp */}
                  <span className='text-sm sm:text-base font-black text-slate-900 dark:text-white'>
                    {item.temp}
                  </span>

                  {/* Rain Prob */}
                  <div className='flex items-center gap-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-1'>
                    <Droplets className='w-2.5 h-2.5' />
                    <span>{item.pop}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Quick Actions (2x2 Grid) - Span 5 */}
        <div className='lg:col-span-5 bg-white dark:bg-[#111C2E] rounded-[28px] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4'>
          <h2 className='text-base font-bold text-slate-900 dark:text-white'>
            Quick Actions
          </h2>

          <div className='grid grid-cols-2 gap-3.5 pt-1'>
            {/* Tile 1: Weather Forecast (Soft Blue) */}
            <button
              onClick={() => setCurrentPage('forecast')}
              className='flex flex-col items-center justify-center p-4 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/30 hover:bg-blue-100/90 dark:hover:bg-blue-900/40 border border-blue-100 dark:border-blue-900/40 transition duration-200 space-y-2 group cursor-pointer'
            >
              <div className='w-10 h-10 rounded-2xl bg-white dark:bg-blue-900/60 shadow-xs flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition'>
                <CalendarDays className='w-5 h-5' />
              </div>
              <span className='text-xs font-bold text-blue-900 dark:text-blue-200'>
                Weather Forecast
              </span>
            </button>

            {/* Tile 2: Weather Map (Soft Green) */}
            <button
              onClick={() => setCurrentPage('weather-map')}
              className='flex flex-col items-center justify-center p-4 rounded-2xl bg-[#ECFDF5] dark:bg-emerald-950/30 hover:bg-emerald-100/90 dark:hover:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-900/40 transition duration-200 space-y-2 group cursor-pointer'
            >
              <div className='w-10 h-10 rounded-2xl bg-white dark:bg-emerald-900/60 shadow-xs flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition'>
                <Map className='w-5 h-5' />
              </div>
              <span className='text-xs font-bold text-emerald-900 dark:text-emerald-200'>
                Weather Map
              </span>
            </button>

            {/* Tile 3: Alerts (Soft Red) */}
            <button
              onClick={() => setCurrentPage('alerts')}
              className='flex flex-col items-center justify-center p-4 rounded-2xl bg-[#FEF2F2] dark:bg-rose-950/30 hover:bg-rose-100/90 dark:hover:bg-rose-900/40 border border-rose-100 dark:border-rose-900/40 transition duration-200 space-y-2 group cursor-pointer'
            >
              <div className='w-10 h-10 rounded-2xl bg-white dark:bg-rose-900/60 shadow-xs flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition'>
                <AlertTriangle className='w-5 h-5' />
              </div>
              <span className='text-xs font-bold text-rose-900 dark:text-rose-200'>
                Alerts
              </span>
            </button>

            {/* Tile 4: Air Quality (Soft Purple) */}
            <button
              onClick={() => setIsAirQualityOpen(true)}
              className='flex flex-col items-center justify-center p-4 rounded-2xl bg-[#FAF5FF] dark:bg-purple-950/30 hover:bg-purple-100/90 dark:hover:bg-purple-900/40 border border-purple-100 dark:border-purple-900/40 transition duration-200 space-y-2 group cursor-pointer'
            >
              <div className='w-10 h-10 rounded-2xl bg-white dark:bg-purple-900/60 shadow-xs flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition'>
                <Wind className='w-5 h-5' />
              </div>
              <span className='text-xs font-bold text-purple-900 dark:text-purple-200'>
                Air Quality
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 3: Recent Conversations + Saved Locations
          ========================================================================= */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Left: Recent Conversations (5 items) - Span 6 */}
        <div className='lg:col-span-6 bg-white dark:bg-[#111C2E] rounded-[28px] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-3'>
          <div className='flex items-center justify-between pb-1'>
            <h2 className='text-base font-bold text-slate-900 dark:text-white'>
              Recent Conversations
            </h2>
            <button
              onClick={() => setCurrentPage('history')}
              className='text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
            >
              View All
            </button>
          </div>

          <div className='space-y-1'>
            {recentChats.map(chat => (
              <div
                key={chat.id}
                onClick={() => handleRecentChatClick(chat.id)}
                className='flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer group'
              >
                <div className='flex items-center gap-3 min-w-0 pr-2'>
                  <MessageSquare className='w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 transition' />
                  <p className='text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition'>
                    {chat.title}
                  </p>
                </div>
                <span className='text-[11px] font-medium text-slate-400 dark:text-slate-500 shrink-0'>
                  {chat.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Saved Locations (4 items) - Span 6 */}
        <div className='lg:col-span-6 bg-white dark:bg-[#111C2E] rounded-[28px] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-3'>
          <div className='flex items-center justify-between pb-1'>
            <h2 className='text-base font-bold text-slate-900 dark:text-white'>
              Saved Locations
            </h2>
            <button
              onClick={() => setCurrentPage('saved-locations')}
              className='text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
            >
              View All
            </button>
          </div>

          <div className='space-y-2'>
            {dashboardLocations.map((loc, idx) => (
              <div
                key={idx}
                onClick={() => handleLocationClick(loc.rawCity)}
                className='flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-100 dark:border-slate-800/80 cursor-pointer group'
              >
                <div className='flex items-center gap-3'>
                  <div className='w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0'>
                    <MapPin className='w-4 h-4' />
                  </div>
                  <div>
                    <h4 className='text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition'>
                      {loc.city}
                    </h4>
                    <p className='text-[11px] text-slate-400 dark:text-slate-500'>
                      {loc.status}
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <span className='text-sm sm:text-base font-bold text-slate-900 dark:text-white'>
                    {loc.temp}
                  </span>
                  <div>
                    {loc.icon === 'sun-cloud' && (
                      <CloudSun className='w-5 h-5 text-amber-500' />
                    )}
                    {loc.icon === 'rain' && (
                      <CloudRain className='w-5 h-5 text-blue-500' />
                    )}
                    {loc.icon === 'sun' && (
                      <Sun className='w-5 h-5 text-amber-500 fill-amber-400' />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 4: "Did you know?" Eco Tip Banner
          ========================================================================= */}
      <div className='rounded-[28px] bg-gradient-to-r from-[#ECFDF5] via-[#F0FDF4] to-[#DCFCE7] dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-900/30 border border-emerald-200/80 dark:border-emerald-900/40 p-5 sm:p-6 flex items-center justify-between relative overflow-hidden shadow-xs'>
        {/* Left Tip Content */}
        <div className='flex items-start gap-4 max-w-xl z-10'>
          <div className='w-11 h-11 rounded-2xl bg-emerald-500/20 dark:bg-emerald-500/30 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0'>
            <Sprout className='w-6 h-6' />
          </div>
          <div>
            <h3 className='text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight'>
              Did you know?
            </h3>
            <p className='text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed'>
              Trees can reduce the surrounding air temperature by up to 5°C.
              Plant more trees and stay cool!
            </p>
          </div>
        </div>

        {/* Right Trees Illustration */}
        <div className='hidden sm:block'>
          <TreesIllustration />
        </div>
      </div>
    </div>
  )
}
