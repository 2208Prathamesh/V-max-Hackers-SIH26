import React, { useState } from 'react'
import { useWeather } from '../context/WeatherContext'
import { useLanguage } from '../context/LanguageContext'
import {
  MapPin,
  Droplets,
  Wind,
  Sun,
  CloudRain,
  CloudSun,
  Cloud,
  ArrowRight,
  Activity,
  Mic,
  Send,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Compass,
  Sprout,
  CalendarDays,
  Gauge,
  Eye,
  Star,
  Crosshair
} from 'lucide-react'

export const DashboardPage = () => {
  const {
    user,
    setCurrentPage,
    sendChatMessage,
    setActiveConversationId,
    setIsAirQualityOpen,
    selectedMapLocation,
    setSelectedMapLocation,
    isDetectingLocation,
    detectCurrentLocation,
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

  const {
    language,
    t,
    getGreeting,
    formatDay,
    translateCondition,
    translateAlertTitle,
    translateAlertDescription,
    translateCity,
    translateRegion
  } = useLanguage()

  const [queryText, setQueryText] = useState('')

  const userName = user?.name ? user.name.split(' ')[0] : t('user')
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
  const forecastHours =
    forecastData?.models?.openMeteo?.hourly?.length
      ? forecastData.models.openMeteo.hourly
      : weatherData?.forecast?.hourly || []
  const dailyForecastData =
    forecastData?.models?.openMeteo?.daily?.length
      ? forecastData.models.openMeteo.daily
      : weatherData?.forecast?.daily || []

  const weatherIcon = precipitationProbability => {
    if (precipitationProbability >= 50) return 'rain'
    if (precipitationProbability >= 25) return 'sun-cloud'
    return 'sun'
  }

  const selectedLocation = selectedMapLocation || savedLocations[0]
  const locationLabel = selectedLocation
    ? `${translateCity(selectedLocation.city)}, ${translateRegion(
        selectedLocation.region ||
        selectedLocation.state ||
        selectedLocation.country
      )}`
    : t('currentLocation')

  const weatherDescription =
    currentConditions?.precipitation > 0
      ? t('rainNearby')
      : currentConditions?.humidity > 80
      ? t('humidConditions')
      : t('currentConditions')

  const currentTime =
    currentHour?.time || forecastHour?.time
      ? new Date(currentHour?.time || forecastHour.time).toLocaleString(
          language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN',
          {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: '2-digit'
          }
        )
      : t('weatherUnavailable')

  const formattedCurrentTemperature = formatTemp(currentConditions?.temperature)

  const suggestionChips = [
    t('chipRain'),
    t('chipMumbai'),
    t('chipCyclone'),
    t('chipAqi')
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
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      addToast(
        language === 'mr'
          ? 'या ब्राउझरमध्ये व्हॉइस सर्च उपलब्ध नाही.'
          : language === 'hi'
          ? 'इस ब्राउज़र में वॉइस सर्च उपलब्ध नहीं है।'
          : 'Voice recognition not supported in this browser.',
        'warning'
      )
      return
    }

    try {
      const recognition = new SpeechRecognition()
      const speechLangMap = {
        hi: 'hi-IN',
        mr: 'mr-IN',
        bn: 'bn-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        en: 'en-IN'
      }
      recognition.lang = speechLangMap[language] || 'en-IN'
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => {
        addToast(
          language === 'mr'
            ? 'ऐकत आहे... तुमचा प्रश्न बोला...'
            : language === 'hi'
            ? 'सुन रहा हूँ... अपना सवाल बोलिए...'
            : 'Listening... Speak your weather query...',
          'info'
        )
      }

      recognition.onresult = event => {
        const spokenText = event.results[0]?.[0]?.transcript
        if (spokenText) {
          setQueryText(spokenText)
          sendChatMessage(spokenText)
          setCurrentPage('chat')
        }
      }

      recognition.onerror = event => {
        console.warn('Dashboard voice search error:', event.error)
        addToast(
          language === 'mr'
            ? 'आवाज ओळखण्यात अडचण आली. पुन्हा प्रयत्न करा.'
            : language === 'hi'
            ? 'आवाज पहचानने में समस्या आई। पुनः प्रयास करें।'
            : 'Could not recognize voice. Please try again.',
          'warning'
        )
      }

      recognition.start()
    } catch (e) {
      console.warn('Voice recognition startup failed:', e)
    }
  }

  // 7-Hour Timeline Data
  const hourlyData = forecastHours.length
    ? forecastHours.slice(0, 7).map((hour, index) => ({
        time:
          index === 0
            ? t('now')
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
    : []

  // 7-Day Glance Data
  const weekGlance = dailyForecastData.length
    ? dailyForecastData.slice(0, 7).map((d, i) => ({
        day:
          i === 0
            ? t('today')
            : new Date(d.date).toLocaleDateString(
                language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN',
                { weekday: 'short' }
              ),
        min: formatTemp(d.minTemperature),
        max: formatTemp(d.maxTemperature),
        pop: `${Math.round(d.precipitationProbability ?? 0)}%`,
        icon: weatherIcon(d.precipitationProbability ?? 0)
      }))
    : []

  // Active alerts list for alert summary
  const activeAlertsList = (alerts || []).slice(0, 3)

  const handleLocationClick = rawCity => {
    const loc = savedLocations.find(
      l => l.city.toLowerCase() === rawCity.toLowerCase()
    )
    if (loc) {
      setSelectedMapLocation(loc)
      addToast(
        language === 'mr'
          ? `${translateCity(loc.city)} चे हवामान लोड केले`
          : language === 'hi'
          ? `${translateCity(loc.city)} का मौसम लोड हुआ`
          : `${loc.city} weather view selected`,
        'info'
      )
    }
  }

  return (
    <div className='max-w-7xl mx-auto space-y-6 pb-12 select-none'>
      {/* =========================================================================
          1. HEADER BAR: Personalized Greeting & Sleek AI Search Capsule
          ========================================================================= */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2'>
            <h1 className='text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight'>
              {getGreeting()}, {userName}!
            </h1>
            <span className='text-2xl animate-pulse'>🌤️</span>
          </div>
          <p className='text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium'>
            {currentTime} • {translateCity(selectedLocation?.city || 'Pune')}
          </p>
        </div>

        {/* AI Weather Search Input */}
        <form onSubmit={handleSearchSubmit} className='w-full md:w-96'>
          <div className='relative flex items-center w-full rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 transition px-3.5 py-2'>
            <input
              type='text'
              placeholder={t('askAnything')}
              value={queryText}
              onChange={e => setQueryText(e.target.value)}
              className='w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none pr-2'
            />
            <div className='flex items-center gap-1.5 shrink-0'>
              <button
                type='button'
                onClick={handleVoiceSearch}
                className='w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition flex items-center justify-center cursor-pointer'
                title='Voice Query'
              >
                <Mic className='w-4 h-4' />
              </button>
              <button
                type='submit'
                className='w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xs transition cursor-pointer'
                title='Search'
              >
                <Send className='w-3.5 h-3.5' />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Suggestion Chips */}
      <div className='flex flex-wrap items-center gap-2'>
        <span className='text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 font-semibold pr-1'>
          <Sparkles className='w-3.5 h-3.5 text-amber-500' />
          {language === 'mr' ? 'सुचवलेले प्रश्न:' : language === 'hi' ? 'सुझावित सवाल:' : 'Quick ask:'}
        </span>
        {suggestionChips.map((chip, index) => (
          <button
            key={index}
            type='button'
            onClick={() => handleChipClick(chip)}
            className='px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/70 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer'
          >
            {chip}
          </button>
        ))}
      </div>

      {/* =========================================================================
          2. LIVE EMERGENCY ALERT BANNER (Active Hazard Ticker)
          ========================================================================= */}
      {activeAlertsList.length > 0 && (
        <div
          onClick={() => setCurrentPage('alerts')}
          className='flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-transparent dark:from-rose-950/40 dark:via-amber-950/20 dark:to-slate-900/40 border border-rose-200 dark:border-rose-900/60 hover:border-rose-400 transition cursor-pointer group shadow-2xs'
        >
          <div className='flex items-center gap-3 min-w-0'>
            <div className='w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition'>
              <AlertTriangle className='w-5 h-5 animate-pulse' />
            </div>
            <div className='min-w-0'>
              <div className='flex items-center gap-2 flex-wrap'>
                <span className='px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white'>
                  {activeAlertsList[0].severity === 'extreme' ? 'Extreme Alert' : 'Active Warning'}
                </span>
                <h4 className='text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate'>
                  {translateAlertTitle(activeAlertsList[0].title)}
                </h4>
              </div>
              <p className='text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5'>
                {activeAlertsList[0].location} • {translateAlertDescription(activeAlertsList[0].description)}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 shrink-0 ml-3'>
            <span>{t('viewAll')} ({activeAlertsList.length})</span>
            <ChevronRight className='w-4 h-4 group-hover:translate-x-0.5 transition' />
          </div>
        </div>
      )}

      {/* =========================================================================
          3. ROW 1: PRIMARY WEATHER INTELLIGENCE (Hero Card + 7-Day Outlook)
          ========================================================================= */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Left (7 cols): Hero Current Weather + 6 Metrics + Hourly Strip */}
        <div className='lg:col-span-7 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white p-6 sm:p-7 shadow-lg shadow-blue-500/10 flex flex-col justify-between relative overflow-hidden space-y-6'>
          {/* Ambient background glow */}
          <div className='absolute -top-24 -right-24 w-80 h-80 rounded-full bg-sky-400/20 blur-3xl pointer-events-none' />

          {/* Top: Location & Switcher */}
          <div className='flex items-center justify-between relative z-10 flex-wrap gap-2'>
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15'>
                <MapPin className='w-4 h-4 text-sky-300' />
                <span className='text-xs sm:text-sm font-bold tracking-wide'>
                  {locationLabel}
                </span>
              </div>
              <button
                type='button'
                onClick={() => detectCurrentLocation(true)}
                disabled={isDetectingLocation}
                className='flex items-center gap-1.5 text-xs font-semibold bg-white/15 hover:bg-white/25 active:scale-95 px-3 py-1.5 rounded-full transition cursor-pointer backdrop-blur-xs border border-white/15 disabled:opacity-50'
                title='Detect live GPS / network location'
              >
                <Crosshair className={`w-3.5 h-3.5 text-sky-200 ${isDetectingLocation ? 'animate-spin text-amber-300' : ''}`} />
                <span className='text-[11px] font-bold'>
                  {isDetectingLocation ? 'Detecting...' : 'My Location'}
                </span>
              </button>
            </div>

            <button
              onClick={() => setCurrentPage('weather-map')}
              className='flex items-center gap-1.5 text-xs font-semibold bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-full transition cursor-pointer backdrop-blur-xs'
            >
              <Compass className='w-3.5 h-3.5 text-sky-200' />
              <span>{t('weatherMap')}</span>
            </button>
          </div>

          {/* Center: Main Temp & Weather Art */}
          <div className='flex items-center justify-between relative z-10 my-1'>
            <div>
              <div className='flex items-baseline'>
                <span className='text-6xl sm:text-7xl font-black tracking-tighter'>
                  {formattedCurrentTemperature === '--'
                    ? '--'
                    : formattedCurrentTemperature.replace('°C', '').replace('°F', '')}
                </span>
                <span className='text-3xl sm:text-4xl font-bold text-sky-300 ml-1'>
                  °{formattedCurrentTemperature.endsWith('°F') ? 'F' : 'C'}
                </span>
              </div>
              <p className='text-base sm:text-lg font-bold text-sky-100 mt-1'>
                {translateCondition(weatherDescription)}
              </p>
              <p className='text-xs text-sky-200/80 mt-0.5'>
                {t('feelsLike', { temp: formatTemp(currentConditions?.apparentTemperature) })}
              </p>
            </div>

            {/* Weather Art */}
            <div className='relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center'>
              <div className='absolute w-20 h-20 rounded-full bg-amber-400/40 blur-xl animate-pulse' />
              <CloudSun className='w-20 h-20 sm:w-24 sm:h-24 text-amber-300 drop-shadow-lg relative z-10' />
            </div>
          </div>

          {/* 6 Essential Metrics Grid */}
          <div className='grid grid-cols-3 sm:grid-cols-6 gap-2 pt-4 border-t border-white/15 relative z-10'>
            {/* AQI */}
            <div
              onClick={() => setIsAirQualityOpen(true)}
              className='bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl p-2.5 text-center border border-white/10 transition cursor-pointer group'
            >
              <Activity className='w-3.5 h-3.5 text-emerald-400 mx-auto mb-1 group-hover:scale-110 transition' />
              <span className='text-[10px] text-sky-200 block'>AQI</span>
              <span className='text-xs font-black text-white'>{weatherData?.airQuality?.aqi != null ? `${weatherData.airQuality.aqi} ${weatherData.airQuality.label || ''}` : '--'}</span>
            </div>

            {/* Humidity */}
            <div className='bg-white/10 backdrop-blur-md rounded-2xl p-2.5 text-center border border-white/10'>
              <Droplets className='w-3.5 h-3.5 text-sky-300 mx-auto mb-1' />
              <span className='text-[10px] text-sky-200 block'>{t('humidity')}</span>
              <span className='text-xs font-black text-white'>
                {currentConditions?.humidity != null ? `${currentConditions.humidity}%` : '--'}
              </span>
            </div>

            {/* Wind */}
            <div className='bg-white/10 backdrop-blur-md rounded-2xl p-2.5 text-center border border-white/10'>
              <Wind className='w-3.5 h-3.5 text-sky-300 mx-auto mb-1' />
              <span className='text-[10px] text-sky-200 block'>{t('wind')}</span>
              <span className='text-xs font-black text-white'>
                {currentConditions?.windSpeed != null
                  ? formatWind(currentConditions.windSpeed)
                  : '--'}
              </span>
            </div>

            {/* Pressure */}
            <div className='bg-white/10 backdrop-blur-md rounded-2xl p-2.5 text-center border border-white/10'>
              <Gauge className='w-3.5 h-3.5 text-purple-300 mx-auto mb-1' />
              <span className='text-[10px] text-sky-200 block'>{t('pressure')}</span>
              <span className='text-xs font-black text-white truncate block'>
                {currentConditions?.pressure != null
                  ? formatPressure(currentConditions.pressure)
                  : '--'}
              </span>
            </div>

            {/* UV Index */}
            <div className='bg-white/10 backdrop-blur-md rounded-2xl p-2.5 text-center border border-white/10'>
              <Sun className='w-3.5 h-3.5 text-amber-300 mx-auto mb-1' />
              <span className='text-[10px] text-sky-200 block'>{t('uvIndex')}</span>
              <span className='text-xs font-black text-white'>{currentConditions?.uvIndex != null ? `${currentConditions.uvIndex} ${currentConditions.uvIndex <= 2 ? 'Low' : currentConditions.uvIndex <= 5 ? 'Moderate' : 'High'}` : '--'}</span>
            </div>

            {/* Visibility */}
            <div className='bg-white/10 backdrop-blur-md rounded-2xl p-2.5 text-center border border-white/10'>
              <Eye className='w-3.5 h-3.5 text-sky-300 mx-auto mb-1' />
              <span className='text-[10px] text-sky-200 block'>{t('visibility')}</span>
              <span className='text-xs font-black text-white'>
                {currentConditions?.visibility != null
                  ? `${Math.round(currentConditions.visibility / 1000)} km`
                  : '--'}
              </span>
            </div>
          </div>

          {/* Today's 7-Slot Hourly Strip */}
          <div className='pt-4 border-t border-white/15 relative z-10'>
            <div className='flex items-center justify-between pb-2.5'>
              <span className='text-xs font-bold uppercase tracking-wider text-sky-200'>
                {t('todaysForecast')}
              </span>
              <span className='text-[11px] text-sky-300'>
                {language === 'mr' ? 'पुढील ७ तास' : language === 'hi' ? 'अगले ७ घंटे' : 'Next 7 hours'}
              </span>
            </div>

            <div className='grid grid-cols-7 gap-2'>
              {hourlyData.map((item, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center justify-between py-2 px-1 rounded-xl text-center backdrop-blur-xs transition ${
                    item.isNow
                      ? 'bg-white/20 border border-white/30 font-bold shadow-xs'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <span className='text-[10px] text-sky-100 font-medium'>
                    {item.time}
                  </span>

                  <div className='my-1'>
                    {item.icon === 'rain' && (
                      <CloudRain className='w-4 h-4 text-sky-300' />
                    )}
                    {item.icon === 'cloud' && (
                      <Cloud className='w-4 h-4 text-slate-200' />
                    )}
                    {item.icon === 'sun-cloud' && (
                      <CloudSun className='w-4 h-4 text-amber-300' />
                    )}
                    {item.icon === 'sun' && (
                      <Sun className='w-4 h-4 text-amber-300' />
                    )}
                  </div>

                  <span className='text-xs font-black'>
                    {item.temp}
                  </span>

                  <span className='text-[9px] text-sky-200 mt-0.5 font-semibold'>
                    {item.pop}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right (5 cols): 7-Day Forecast Outlook Glance */}
        <div className='lg:col-span-5 bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/70 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4'>
          <div className='flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-700/60'>
            <div className='flex items-center gap-2'>
              <CalendarDays className='w-4 h-4 text-blue-600 dark:text-blue-400' />
              <h3 className='text-sm sm:text-base font-bold text-slate-900 dark:text-white'>
                {t('sevenDayForecast')}
              </h3>
            </div>
            <button
              onClick={() => setCurrentPage('forecast')}
              className='text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer'
            >
              <span>{t('viewFullForecast')}</span>
              <ChevronRight className='w-3.5 h-3.5' />
            </button>
          </div>

          {/* 7-Day Vertical Rows */}
          <div className='space-y-2.5 divide-y divide-slate-100 dark:divide-slate-700/50'>
            {weekGlance.map((d, index) => (
              <div
                key={index}
                className='flex items-center justify-between pt-2 first:pt-0 text-xs'
              >
                <div className='w-20 font-bold text-slate-800 dark:text-slate-200'>
                  {d.day}
                </div>

                <div className='flex items-center gap-2 text-slate-500 dark:text-slate-400'>
                  {d.icon === 'rain' && (
                    <CloudRain className='w-4 h-4 text-blue-500' />
                  )}
                  {d.icon === 'sun-cloud' && (
                    <CloudSun className='w-4 h-4 text-amber-500' />
                  )}
                  {d.icon === 'sun' && (
                    <Sun className='w-4 h-4 text-amber-500 fill-amber-400' />
                  )}
                  <span className='text-[11px] font-semibold text-blue-600 dark:text-blue-400'>
                    {d.pop}
                  </span>
                </div>

                {/* Min / Max Temperature Bar representation */}
                <div className='flex items-center gap-2'>
                  <span className='text-slate-400 dark:text-slate-500 font-medium'>
                    {d.min}
                  </span>
                  <div className='w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden'>
                    <div
                      className='h-full bg-gradient-to-r from-sky-400 to-amber-400 rounded-full'
                      style={{ width: `${60 + index * 5}%` }}
                    />
                  </div>
                  <span className='font-bold text-slate-900 dark:text-white'>
                    {d.max}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className='pt-2'>
            <div className='p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between text-xs'>
              <span className='text-slate-600 dark:text-slate-300 font-medium'>
                {language === 'mr' ? 'हवामान मॉडेल खात्री:' : language === 'hi' ? 'मॉडल सहमति:' : 'Model Confidence:'}
              </span>
              <span className='font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1'>
                <ShieldCheck className='w-3.5 h-3.5' />
                {forecastData?.confidence != null ? `${forecastData.confidence}% ${forecastData.confidence >= 75 ? 'High' : forecastData.confidence >= 50 ? 'Medium' : 'Low'}` : '--'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. ROW 2: FOCUSED THREE UTILITY CARDS (Alerts + Locations + AI Assistant)
          ========================================================================= */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* CARD 1: Active Alerts & Hazards Overview */}
        <div className='bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/70 p-5 shadow-xs flex flex-col justify-between space-y-3'>
          <div className='flex items-center justify-between pb-1'>
            <div className='flex items-center gap-2'>
              <AlertTriangle className='w-4 h-4 text-rose-500' />
              <h3 className='text-sm sm:text-base font-bold text-slate-900 dark:text-white'>
                {t('activeAlerts')}
              </h3>
            </div>
            <button
              onClick={() => setCurrentPage('alerts')}
              className='text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer'
            >
              {t('viewAll')}
            </button>
          </div>

          <div className='space-y-2'>
            {activeAlertsList.length > 0 ? (
              activeAlertsList.map((a, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentPage('alerts')}
                  className='p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 hover:border-rose-300 transition cursor-pointer'
                >
                  <div className='flex items-center justify-between'>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                      a.severity === 'extreme'
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-500 text-white'
                    }`}>
                      {a.severity}
                    </span>
                    <span className='text-[10px] text-slate-400 font-medium'>
                      {a.location.split(',')[0]}
                    </span>
                  </div>
                  <h4 className='text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5 truncate'>
                    {translateAlertTitle(a.title)}
                  </h4>
                  <p className='text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5'>
                    {translateAlertDescription(a.description)}
                  </p>
                </div>
              ))
            ) : (
              <p className='text-xs text-slate-500 py-4 text-center'>
                {t('noActiveAlerts')}
              </p>
            )}
          </div>

          <button
            onClick={() => setCurrentPage('advisory')}
            className='w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer'
          >
            <span>{language === 'mr' ? 'आपत्ती व्यवस्थापन सल्ला' : language === 'hi' ? 'आपदा प्रबंधन सलाह' : 'Disaster Advisory Hub'}</span>
            <ArrowRight className='w-3.5 h-3.5' />
          </button>
        </div>

        {/* CARD 2: Saved Locations Quick Switch */}
        <div className='bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/70 p-5 shadow-xs flex flex-col justify-between space-y-3'>
          <div className='flex items-center justify-between pb-1'>
            <div className='flex items-center gap-2'>
              <MapPin className='w-4 h-4 text-blue-600 dark:text-blue-400' />
              <h3 className='text-sm sm:text-base font-bold text-slate-900 dark:text-white'>
                {t('savedLocations')}
              </h3>
            </div>
            <button
              onClick={() => setCurrentPage('saved-locations')}
              className='text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
            >
              {t('viewAll')}
            </button>
          </div>

          <div className='space-y-2'>
            {savedLocations.slice(0, 3).map((loc, idx) => {
              const isSelected =
                (selectedLocation?.city || '').toLowerCase() ===
                loc.city.toLowerCase()

              return (
                <div
                  key={idx}
                  onClick={() => handleLocationClick(loc.city)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 shadow-2xs'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <div className='min-w-0 pr-2'>
                    <div className='flex items-center gap-1.5'>
                      <span className='text-xs font-bold text-slate-900 dark:text-white truncate'>
                        {translateCity(loc.city)}
                      </span>
                      {isSelected && (
                        <span className='w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0' />
                      )}
                    </div>
                    <p className='text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5'>
                      {translateRegion(loc.region || loc.state || loc.country)}
                    </p>
                  </div>

                  <div className='text-right shrink-0 flex items-center gap-2'>
                    <div>
                      <span className='text-sm font-black text-slate-900 dark:text-white'>
                        {loc.tempC != null ? `${Math.round(loc.tempC)}°` : '--'}
                      </span>
                      <p className='text-[9px] text-slate-500 dark:text-slate-400'>
                        {translateCondition(loc.condition || 'Clear')}
                      </p>
                    </div>
                    <Star className={`w-3.5 h-3.5 ${loc.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={() => setCurrentPage('saved-locations')}
            className='w-full py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer'
          >
            <span>{language === 'mr' ? 'स्थान व्यवस्थापित करा' : language === 'hi' ? 'स्थान प्रबंधित करें' : 'Manage Saved Places'}</span>
            <ArrowRight className='w-3.5 h-3.5' />
          </button>
        </div>

        {/* CARD 3: Weather Intelligence & Smart Agro Advisory */}
        <div className='bg-gradient-to-br from-indigo-50/70 via-white to-emerald-50/70 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-indigo-950/30 rounded-3xl border border-indigo-100 dark:border-slate-700/70 p-5 shadow-xs flex flex-col justify-between space-y-3'>
          <div>
            <div className='flex items-center justify-between pb-1'>
              <div className='flex items-center gap-2'>
                <div className='w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs'>
                  <Sprout className='w-4 h-4' />
                </div>
                <h3 className='text-sm sm:text-base font-bold text-slate-900 dark:text-white'>
                  {language === 'mr' ? 'हवामान व कृषी सल्ला' : language === 'hi' ? 'मौसम व कृषि सलाह' : 'Smart Weather Advisory'}
                </h3>
              </div>
              <span className='px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'>
                AI Live
              </span>
            </div>

            <p className='text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed'>
              {currentConditions?.precipitation > 0 || (currentHour?.precipitationProbability ?? 0) > 40
                ? language === 'mr'
                  ? 'पुढील २४ तासांत पावसाची शक्यता आहे. शेतातील फवारणी पुढे ढकला आणि पाण्याचा निचरा तपासा.'
                  : language === 'hi'
                  ? 'अगले 24 घंटों में बारिश की संभावना है। छिड़काव स्थगित करें और उचित जल निकासी सुनिश्चित करें।'
                  : 'Rainfall expected in next 24h. Postpone foliar spraying and inspect field drainage.'
                : language === 'mr'
                  ? 'हवामान अनुकूल आहे. सकाळच्या वेळी पिकांना पाणी देणे आणि शेतीची कामे करण्यासाठी उत्तम वेळ.'
                  : language === 'hi'
                  ? 'मौसम अनुकूल है। सुबह के समय सिंचाई और कृषि कार्यों के लिए उपयुक्त समय है।'
                  : 'Favorable atmospheric conditions. Morning irrigation and general field operations recommended.'}
            </p>
          </div>

          <div className='space-y-2 pt-2'>
            <button
              onClick={() => setCurrentPage('advisory')}
              className='w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer'
            >
              <Sprout className='w-3.5 h-3.5' />
              <span>{language === 'mr' ? 'सविस्तर पीक सल्ला पहा' : language === 'hi' ? 'विस्तृत फसल सलाह देखें' : 'View Crop Advisory'}</span>
              <ArrowRight className='w-3 h-3' />
            </button>

            <button
              onClick={() => setCurrentPage('chat')}
              className='w-full py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer'
            >
              <MessageSquare className='w-3.5 h-3.5' />
              <span>{language === 'mr' ? 'एआय हवामान चॅट सुरू करा' : language === 'hi' ? 'एआई मौसम चैट शुरू करें' : 'Ask WeatherGPT AI'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
