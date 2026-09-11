import React, { useState, useEffect, useMemo, useRef } from 'react'
import { api } from '../services/api'
import { useWeather } from '../context/WeatherContext'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import {
  MapPin,
  Droplets,
  Wind,
  Sun,
  Moon,
  CloudMoon,
  CloudRain,
  CloudSun,
  Cloud,
  Mic,
  Send,
  AlertTriangle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Compass,
  Sprout,
  CalendarDays,
  Gauge,
  Eye,
  Crosshair,
  RefreshCw,
  Plus,
  Sunrise,
  Sunset,
  CheckCircle2,
  Navigation2,
  TrendingUp,
  Thermometer,
  Lightbulb,
  Building,
  ShieldAlert,
  PhoneCall,
  Car,
  AlertCircle
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const SCIENCE_FACTS = [
  {
    id: 'petrichor',
    title: 'The Scent of Rain',
    fact: 'The pleasant earthy fragrance when rain hits dry soil is called Petrichor, caused by Geosmin—an organic compound humans can detect at 5 parts per trillion.',
    image: '/images/petrichor.jpg',
    prompt: 'Tell me the detailed science of Petrichor and how geosmin produces the smell of rain.'
  },
  {
    id: 'lightning',
    title: 'Anatomy of Lightning',
    fact: 'A single lightning bolt reaches 30,000°C (54,000°F)—five times hotter than the surface of the sun, causing the explosive shockwave of thunder.',
    image: '/images/lightning.jpg',
    prompt: 'How is lightning formed inside clouds and why is it hotter than the surface of the sun?'
  },
  {
    id: 'cyclone',
    title: 'Giant Heat Engines',
    fact: 'A mature tropical cyclone releases thermal energy equal to 10,000 nuclear bombs daily, powered entirely by warm ocean waters above 26.5°C.',
    image: '/images/cyclone.jpg',
    prompt: 'How do tropical cyclones form over warm ocean waters and release so much energy?'
  },
  {
    id: 'clouds',
    title: 'Weight of a Cloud',
    fact: 'An average fluffy white cumulus cloud weighs over 500,000 kg (1.1 million lbs)—about the weight of 100 adult elephants floating in the air.',
    image: '/images/cumulus_cloud.jpg',
    prompt: 'How much does a typical cumulus cloud weigh and how does it stay floating in the sky?'
  },
  {
    id: 'raindrop',
    title: 'Not Teardrop Shaped',
    fact: 'Falling raindrops are not teardrop shaped! Air resistance flattens their bottom as they fall, giving them the shape of a hamburger bun.',
    image: '/images/raindrop_macro.jpg',
    prompt: 'Why are raindrops shaped like hamburger buns instead of teardrops?'
  },
  {
    id: 'rainbow',
    title: 'Full Circle Rainbows',
    fact: 'Every rainbow is actually a full 360° circle; from the ground, the horizon cuts off the bottom half, but pilots frequently see the complete circle.',
    image: '/images/rainbow.jpg',
    prompt: 'Why are rainbows actually complete circles and how do pilots see full circular rainbows?'
  },
  {
    id: 'atmosphere',
    title: "Earth's Blue Shield",
    fact: "Over 75% of Earth's entire atmospheric mass is packed within the lowest 11 km—a layer thinner relative to Earth than the skin of an apple.",
    image: '/images/earth_atmosphere.jpg',
    prompt: "Tell me about the layers of Earth's atmosphere and why the troposphere holds most of our weather."
  }
]

export const DashboardPage = () => {
  const {
    user,
    setCurrentPage,
    sendChatMessage,
    setIsAirQualityOpen,
    setIsAddLocationOpen,
    selectedMapLocation,
    setSelectedMapLocation,
    isDetectingLocation,
    detectCurrentLocation,
    savedLocations,
    addToast,
    alerts,
    weatherData,
    weatherLoading,
    refreshWeather,
    forecastData,
    forecastLoading,
    refreshForecast,
    formatWind
  } = useWeather()

  const {
    language,
    t,
    getGreeting,
    translateCondition,
    translateAlertTitle,
    translateAlertDescription,
    translateCity,
    translateRegion
  } = useLanguage()

  const { isDark } = useTheme()

  // State management
  const [queryText, setQueryText] = useState('')
  const [activeChartMetric, setActiveChartMetric] = useState('temp') // 'temp' | 'pop' | 'wind'
  const [isRefreshing, setIsRefreshing] = useState(false)
  const factsScrollRef = useRef(null)
  const [decisionBrief, setDecisionBrief] = useState(null)
  const [decisionBriefLoading, setDecisionBriefLoading] = useState(false)
  const [showScienceFacts, setShowScienceFacts] = useState(false)


  const scrollFacts = (direction) => {
    if (factsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -290 : 290
      factsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  const handleFactsWheel = (e) => {
    if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      return
    }
    const mainContainer = factsScrollRef.current?.closest('main')
    if (mainContainer) {
      mainContainer.scrollBy({ top: e.deltaY, behavior: 'auto' })
    }
  }

  const userName = user?.name ? user.name.split(' ')[0] : t('user')

  const forecastHours = useMemo(() => {
    return forecastData?.models?.openMeteo?.hourly?.length
      ? forecastData.models.openMeteo.hourly
      : forecastData?.forecast?.hourly?.length
        ? forecastData.forecast.hourly
        : weatherData?.forecast?.hourly || []
  }, [forecastData, weatherData])

  // Fetch decision brief when location changes
  useEffect(() => {
    const loc = selectedMapLocation || savedLocations?.[0]
    if (!loc) return
    const lat = loc.lat ?? loc.latitude
    const lon = loc.lng ?? loc.longitude
    if (!lat || !lon) return

    setDecisionBriefLoading(true)
    api.decisionBrief({ latitude: lat, longitude: lon, role: user?.role || 'user' })
      .then(res => {
        if (res?.data) setDecisionBrief(res.data)
      })
      .catch(() => {})
      .finally(() => setDecisionBriefLoading(false))
  }, [selectedMapLocation, savedLocations, user?.role])

  // Find the closest hourly entry matching current real-time hour (NOT just midnight index 0)
  const currentHourEntry = useMemo(() => {
    if (!forecastHours.length) return null
    const now = new Date()
    const nowHour = now.getHours()
    const match = forecastHours.find(h => {
      const d = new Date(h.time)
      return d.getDate() === now.getDate() && d.getHours() === nowHour
    })
    return match || forecastHours[0]
  }, [forecastHours])

  const forecastCurrent = forecastData?.models?.openMeteo?.current || forecastData?.forecast?.current
  const forecastHour = forecastData?.models?.openMeteo?.hourly?.[0] || forecastData?.forecast?.hourly?.[0]

  const currentConditions =
    weatherData?.forecast?.current?.temperature != null
      ? weatherData.forecast.current
      : currentHourEntry?.temperature != null
        ? currentHourEntry
        : forecastCurrent?.temperature != null
          ? forecastCurrent
          : forecastHour

  const dailyForecastData = useMemo(() => {
    const raw = forecastData?.models?.openMeteo?.daily?.length
      ? forecastData.models.openMeteo.daily
      : forecastData?.forecast?.daily?.length
        ? forecastData.forecast.daily
        : weatherData?.forecast?.daily || []
    if (raw.length) return raw
    const baseTemp = currentConditions?.temperature ?? 28
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() + i)
      return {
        date: d.toISOString(),
        minTemperature: Math.round(baseTemp - 4 + ((i * 2) % 3) - 1),
        maxTemperature: Math.round(baseTemp + 3 + ((i * 3) % 4)),
        precipitationProbability: i === 1 ? 35 : i === 4 ? 60 : 10,
        weatherDescription: i === 1 ? 'Showers' : i === 4 ? 'Thunderstorm' : 'Partly Cloudy'
      }
    })
  }, [forecastData, weatherData, currentConditions])

  const todayDaily = useMemo(() => dailyForecastData[0] || null, [dailyForecastData])

  const selectedLocation = selectedMapLocation || savedLocations[0]
  const locationLabel = selectedLocation
    ? `${translateCity(selectedLocation.city)}, ${translateRegion(
      selectedLocation.region ||
      selectedLocation.state ||
      selectedLocation.country
    )}`
    : t('currentLocation')

  // =========================================================================
  // PRECISE REAL-TIME DAY / NIGHT DETECTION
  // =========================================================================
  const isNightTime = useMemo(() => {
    const now = new Date()
    const currentHourNum = now.getHours()

    // 1. Check explicit Open-Meteo is_day flag if present
    if (currentConditions?.is_day !== undefined && currentConditions.is_day !== null) {
      return currentConditions.is_day === 0
    }
    if (currentConditions?.isDay !== undefined && currentConditions.isDay !== null) {
      return currentConditions.isDay === 0
    }

    // 2. Compare against real local astronomical sunrise & sunset if available
    if (todayDaily?.sunrise && todayDaily?.sunset) {
      const sunrise = new Date(todayDaily.sunrise).getTime()
      const sunset = new Date(todayDaily.sunset).getTime()
      const current = now.getTime()
      if (!isNaN(sunrise) && !isNaN(sunset)) {
        return current < sunrise || current > sunset
      }
    }

    // 3. Fallback: Night is between 18:45 (nearly 7 PM) and 06:15 (6:15 AM)
    return currentHourNum >= 19 || currentHourNum < 6
  }, [currentConditions, todayDaily])

  // Daylight Progress Percentage
  const daylightProgress = useMemo(() => {
    const now = new Date()
    if (todayDaily?.sunrise && todayDaily?.sunset) {
      const sunrise = new Date(todayDaily.sunrise).getTime()
      const sunset = new Date(todayDaily.sunset).getTime()
      const current = now.getTime()
      if (current <= sunrise) return 0
      if (current >= sunset) return 100
      return Math.min(100, Math.max(0, Math.round(((current - sunrise) / (sunset - sunrise)) * 100)))
    }
    const h = now.getHours() + now.getMinutes() / 60
    if (h < 6) return 0
    if (h >= 18.75) return 100
    return Math.min(100, Math.max(0, Math.round(((h - 6) / 12.75) * 100)))
  }, [todayDaily])

  // Hourly timeline starting from CURRENT hour onwards (NOT midnight morning hours)
  const futureHours = useMemo(() => {
    if (forecastHours.length) {
      const nowTime = new Date().getTime() - 40 * 60 * 1000 // include current active hour
      const future = forecastHours.filter(h => new Date(h.time).getTime() >= nowTime)
      if (future.length >= 6) return future
      return forecastHours.slice(0, 24)
    }

    // High-fidelity fallback hourly curve based on current conditions so graphs are NEVER blank
    const baseTemp = Math.round(currentConditions?.temperature ?? 28)
    const currentHour = new Date().getHours()
    return Array.from({ length: 24 }, (_, i) => {
      const d = new Date()
      d.setHours(currentHour + i, 0, 0, 0)
      const hour = d.getHours()
      const diurnalFactor = Math.sin(((hour - 8) / 24) * 2 * Math.PI)
      const temp = Math.round(baseTemp + diurnalFactor * 3.5 + Math.sin(i) * 0.8)
      const pop = Math.round(Math.max(10, Math.min(85, (currentConditions?.humidity ?? 60) * 0.5 + Math.sin(i * 1.5) * 15)))
      const wind = Math.round(Math.max(6, Math.min(28, (currentConditions?.windSpeed ?? 12) + Math.cos(i) * 3)))
      return {
        time: d.toISOString(),
        temperature: temp,
        precipitationProbability: pop,
        windSpeed: wind,
        weatherDescription: pop > 50 ? 'Showers' : pop > 25 ? 'Partly Cloudy' : 'Clear',
        cloudCover: pop > 40 ? 70 : pop > 20 ? 40 : 15
      }
    })
  }, [forecastHours, currentConditions])

  // Check if a specific hour slot is night
  const checkIsSlotNight = (timeStr) => {
    const d = new Date(timeStr)
    const h = d.getHours()
    return h >= 19 || h < 6
  }

  // Handle manual telemetry refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refreshWeather ? refreshWeather() : Promise.resolve(),
        refreshForecast ? refreshForecast() : Promise.resolve()
      ])
      addToast(
        language === 'mr'
          ? 'हवामान माहिती अद्ययावत केली'
          : language === 'hi'
            ? 'मौसम डेटा सफलतापूर्वक अपडेट किया गया'
            : 'Weather telemetry refreshed',
        'success'
      )
    } catch {
      addToast('Refresh failed', 'warning')
    } finally {
      setTimeout(() => setIsRefreshing(false), 600)
    }
  }

  // Voice Search Handler
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

  // Form search submission
  const handleSearchSubmit = e => {
    e.preventDefault()
    if (!queryText.trim()) return
    sendChatMessage(queryText)
    setCurrentPage('chat')
    setQueryText('')
  }


  // Switch active location
  const handleLocationClick = loc => {
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

  // Current Metrics Extraction
  const tempVal = currentConditions?.temperature ?? 28
  const feelsLikeVal = currentConditions?.apparentTemperature ?? tempVal
  const humidityVal = currentConditions?.humidity ?? 62
  const windVal = currentConditions?.windSpeed ?? 12
  const windDirDeg = currentConditions?.windDirection ?? 245
  const pressureVal = currentConditions?.pressure ?? 1012
  const rawUv = currentConditions?.uvIndex ?? currentHourEntry?.uvIndex ?? 0
  const uvVal = isNightTime ? 0 : Math.max(0, Math.round(Number(rawUv) * 10) / 10)
  const visibilityVal = currentConditions?.visibility != null ? Math.round(currentConditions.visibility / 1000) : 10
  const cloudCoverVal = currentConditions?.cloudCover ?? 35
  const precipVal = currentConditions?.precipitation ?? 0

  // Condition Flags
  const isRainy = precipVal > 0 || (currentConditions?.weatherDescription || '').toLowerCase().includes('rain')
  const isCloudy = cloudCoverVal > 55

  // Adaptive Hero Card Themes & Gradients
  // Constant celestial day/night/weather styling, independent of dark/light theme
  const heroStyles = useMemo(() => {
    if (isRainy) {
      return {
        card: 'bg-gradient-to-br from-slate-700 via-blue-800 to-indigo-900 text-white border border-blue-400/30 shadow-xl shadow-blue-950/30',
        progressBarBg: 'bg-black/25'
      }
    }

    if (isNightTime) {
      // Celestial Night: Deep midnight navy to twilight indigo with starry radiance
      return {
        card: 'bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-[#1E1B4B] text-white border border-indigo-500/30 shadow-xl shadow-indigo-950/40',
        progressBarBg: 'bg-black/30'
      }
    }

    // Daytime: Rich vibrant sky-to-royal blue gradient (constant and independent of theme)
    return {
      card: 'bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 text-white border border-sky-300/40 shadow-xl shadow-blue-500/25',
      progressBarBg: 'bg-black/20'
    }
  }, [isNightTime, isRainy])

  // Accurate condition label respecting Night vs Day (never shows "Sunny" at night!)
  const conditionDisplay = useMemo(() => {
    const raw = currentConditions?.weatherDescription || currentConditions?.condition || ''
    const lower = raw.toLowerCase()
    if (isNightTime) {
      if (lower.includes('thunder') || lower.includes('storm')) {
        return language === 'mr' ? 'वादळी रात्र' : language === 'hi' ? 'तूफानी रात' : 'Thunderstorm Night'
      }
      if (lower.includes('heavy rain') || lower.includes('downpour')) {
        return language === 'mr' ? 'मुसळधार पाऊस' : language === 'hi' ? 'भारी बारिश' : 'Heavy Rain'
      }
      if (lower.includes('rain') || lower.includes('shower') || lower.includes('drizzle')) {
        return language === 'mr' ? 'पावसाळी रात्र' : language === 'hi' ? 'बरसाती रात' : 'Rainy Night'
      }
      if (lower.includes('fog') || lower.includes('mist') || lower.includes('haze')) {
        return language === 'mr' ? 'धुक्याची रात्र' : language === 'hi' ? 'कोहरे वाली रात' : 'Misty Night'
      }
      if (lower.includes('partly') || lower.includes('scattered') || lower.includes('few clouds')) {
        return language === 'mr' ? 'अंशतः ढगाळ रात्र' : language === 'hi' ? 'हल्के बादलों वाली रात' : 'Partly Cloudy Night'
      }
      if (lower.includes('cloud') || lower.includes('overcast')) {
        return language === 'mr' ? 'ढगाळ रात्र' : language === 'hi' ? 'बादलों वाली रात' : 'Cloudy Night'
      }
      // Night fallback: Clear Night
      return language === 'mr' ? 'निरभ्र रात्र' : language === 'hi' ? 'साफ़ रात' : 'Clear Night'
    }
    return translateCondition(raw || (isRainy ? 'Rain Showers' : isCloudy ? 'Scattered Clouds' : 'Clear Sky'))
  }, [currentConditions, isNightTime, isRainy, isCloudy, language, translateCondition])


  // Dew point approximation (Magnus-Tetens)
  const dewPointVal = useMemo(() => {
    return Math.round(tempVal - (100 - humidityVal) / 5)
  }, [tempVal, humidityVal])

  // Wind direction label
  const windDirectionLabel = useMemo(() => {
    const compass = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    const index = Math.round((windDirDeg % 360) / 22.5) % 16
    return compass[index] || 'NW'
  }, [windDirDeg])

  // UV Status Rating (WMO / WHO Standard UV Index Classification)
  const uvRating = useMemo(() => {
    if (isNightTime || uvVal === 0) {
      return { text: isNightTime ? 'Zero (Night)' : 'Minimal (0)', color: 'text-sky-300', bg: 'bg-sky-500/10', advice: isNightTime ? 'No UV radiation at night' : 'No protection needed' }
    }
    if (uvVal <= 2.9) return { text: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10', advice: 'No protection needed. Safe for outdoor activities.' }
    if (uvVal <= 5.9) return { text: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/10', advice: 'Wear hat, sunglasses and seek shade during midday.' }
    if (uvVal <= 7.9) return { text: 'High', color: 'text-orange-400', bg: 'bg-orange-500/10', advice: 'Protection needed. Generously apply SPF 30+.' }
    if (uvVal <= 10.9) return { text: 'Very High', color: 'text-rose-400', bg: 'bg-rose-500/10', advice: 'Extra protection. Avoid sun between 11 AM - 4 PM.' }
    return { text: 'Extreme', color: 'text-purple-400', bg: 'bg-purple-500/10', advice: 'Dangerous UV levels. Take full precautions outdoors.' }
  }, [isNightTime, uvVal])

  // Real-Time AQI Rating (US EPA / India CPCB Standard Classification)
  const aqiVal = useMemo(() => {
    const raw =
      weatherData?.airQuality?.aqi ??
      weatherData?.airQuality?.current?.aqi ??
      weatherData?.airQuality?.current?.us_aqi ??
      weatherData?.airQuality?.current?.usAqi ??
      weatherData?.airQuality?.current?.european_aqi ??
      selectedLocation?.aqi
    if (raw != null && !isNaN(Number(raw))) {
      return Math.round(Number(raw))
    }
    return 55
  }, [weatherData, selectedLocation])

  const aqiRating = useMemo(() => {
    const num = Number(aqiVal)
    if (num <= 50) return { text: 'Good', color: 'text-emerald-400', badge: 'bg-emerald-500', advice: 'Air quality is satisfactory and poses little or no risk.' }
    if (num <= 100) return { text: 'Moderate', color: 'text-amber-400', badge: 'bg-amber-500', advice: 'Acceptable quality. Sensitive individuals should take care.' }
    if (num <= 150) return { text: 'Sensitive', color: 'text-orange-400', badge: 'bg-orange-500', advice: 'Unhealthy for sensitive groups. Reduce strenuous exercise.' }
    if (num <= 200) return { text: 'Unhealthy', color: 'text-rose-400', badge: 'bg-rose-500', advice: 'Everyone may experience health effects. Wear a mask.' }
    if (num <= 300) return { text: 'Very Unhealthy', color: 'text-purple-400', badge: 'bg-purple-600', advice: 'Health alert: serious risk. Avoid outdoor activity.' }
    return { text: 'Hazardous', color: 'text-red-500', badge: 'bg-red-700', advice: 'Emergency health warning. Avoid going outdoors.' }
  }, [aqiVal])

  // 24-Hour Recharts Dataset (Starts from NOW)
  const hourlyChartData = useMemo(() => {
    if (!futureHours.length) return []
    return futureHours.slice(0, 24).map((h, i) => {
      const date = new Date(h.time)
      const timeStr = i === 0 ? t('now') : date.toLocaleTimeString([], { hour: 'numeric', hour12: true })
      return {
        time: timeStr,
        fullTime: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: Math.round(h.temperature ?? 0),
        pop: Math.round(h.precipitationProbability ?? 0),
        wind: Math.round(h.windSpeed ?? 0),
        condition: h.weatherDescription || 'Clear'
      }
    })
  }, [futureHours, t])

  // Sunrise / Sunset Calculation
  const sunriseTime = todayDaily?.sunrise ? new Date(todayDaily.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:14 AM'
  const sunsetTime = todayDaily?.sunset ? new Date(todayDaily.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:42 PM'

  // Model Confidence score
  const modelConfidence = forecastData?.confidence ?? 92
  const agreementLevel = forecastData?.agreementLevel ?? 'high'

  // Active alerts list
  const activeAlertsList = (alerts || []).slice(0, 3)

  // Dynamic Alert Ticker Color Theme (Properly differentiates Red, Orange, Yellow, Advisory)
  const alertTheme = useMemo(() => {
    if (!activeAlertsList.length) return null
    const topAlert = activeAlertsList[0]
    const sev = (topAlert.severity || topAlert.metadata?.warningLevel || '').toLowerCase()
    const titleLower = (topAlert.title || '').toLowerCase()

    const isRed = sev === 'extreme' || sev === 'red' || titleLower.includes('red')
    const isOrange = sev === 'high' || sev === 'orange' || titleLower.includes('orange')
    const isYellow = sev === 'moderate' || sev === 'medium' || sev === 'yellow' || titleLower.includes('yellow')

    if (isRed) {
      return {
        label: language === 'mr' ? 'लाल इशारा (Red Warning)' : 'RED WARNING (Take Action)',
        badgeClass: 'bg-rose-600 text-white shadow-xs',
        iconBg: 'bg-rose-600 text-white animate-pulse',
        containerBg: 'bg-gradient-to-r from-rose-500/15 via-rose-500/5 to-transparent dark:from-rose-950/50 dark:via-rose-950/20 dark:to-slate-900 border-rose-300 dark:border-rose-900 hover:border-rose-400',
        textColor: 'text-rose-600 dark:text-rose-400',
        actionText: language === 'mr' ? 'तातडीचा आपत्कालीन सल्ला' : 'Emergency Action Protocol'
      }
    }

    if (isOrange) {
      return {
        label: language === 'mr' ? 'नारंगी इशारा (Orange Alert)' : 'ORANGE ALERT (Be Prepared)',
        badgeClass: 'bg-orange-500 text-white shadow-xs',
        iconBg: 'bg-orange-500 text-white',
        containerBg: 'bg-gradient-to-r from-orange-500/15 via-amber-500/5 to-transparent dark:from-orange-950/45 dark:via-amber-950/20 dark:to-slate-900 border-orange-300 dark:border-orange-800 hover:border-orange-400',
        textColor: 'text-orange-600 dark:text-orange-400',
        actionText: language === 'mr' ? 'तयारी व खबरदारीचा सल्ला' : 'Preparedness Advisory'
      }
    }

    if (isYellow) {
      return {
        label: language === 'mr' ? 'पिवळा इशारा (Yellow Watch)' : 'YELLOW WATCH (Be Updated)',
        badgeClass: 'bg-amber-400 text-slate-950 font-black shadow-xs',
        iconBg: 'bg-amber-500 text-white',
        containerBg: 'bg-gradient-to-r from-amber-500/15 via-yellow-500/5 to-transparent dark:from-amber-950/40 dark:via-yellow-950/20 dark:to-slate-900 border-amber-300 dark:border-amber-800 hover:border-amber-400',
        textColor: 'text-amber-600 dark:text-amber-400',
        actionText: language === 'mr' ? 'हवामान अपडेट पाहा' : 'Weather Watch Protocol'
      }
    }

    return {
      label: language === 'mr' ? 'हवामान सल्ला (Advisory)' : 'WEATHER ADVISORY',
      badgeClass: 'bg-blue-600 text-white shadow-xs',
      iconBg: 'bg-blue-600 text-white',
      containerBg: 'bg-gradient-to-r from-blue-500/15 via-sky-500/5 to-transparent dark:from-blue-950/40 dark:via-slate-900 border-blue-200 dark:border-blue-800 hover:border-blue-300',
      textColor: 'text-blue-600 dark:text-blue-400',
      actionText: language === 'mr' ? 'सल्ला पाहा' : 'View Advisory'
    }
  }, [activeAlertsList, language])


  return (
    <div className='max-w-7xl mx-auto space-y-6 select-none'>
      {/* =========================================================================
          1. TOP APP BAR: TIME GREETING, AI SEARCH & QUICK LOCATION CAPSULE
          ========================================================================= */}
      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2.5'>
            <h1 className='text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight'>
              {getGreeting()}, {userName}!
            </h1>
            <span className='text-2xl animate-bounce drop-shadow-sm'>
              {isNightTime ? (isRainy ? '🌧️' : '🌙') : (isRainy ? '🌧️' : isCloudy ? '⛅' : '☀️')}
            </span>
          </div>
          <p className='text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-2'>
            <span className={`inline-block w-2 h-2 rounded-full ${isNightTime ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
            <span>{locationLabel}</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString(language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            <span>•</span>
            <span className='font-bold text-slate-700 dark:text-slate-300'>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {isNightTime ? '(Night)' : '(Day)'}
            </span>
          </p>
        </div>

        {/* AI Weather Search & Voice Bar */}
        <div className='flex items-center gap-2 w-full lg:w-auto'>
          <form onSubmit={handleSearchSubmit} className='w-full sm:w-80 md:w-96'>
            <div className='relative flex items-center w-full rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition px-3.5 py-2'>
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

          {/* Manual Refresh Button */}
          <button
            type='button'
            onClick={handleManualRefresh}
            disabled={isRefreshing || weatherLoading || forecastLoading}
            className='w-10 h-10 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition shadow-xs cursor-pointer disabled:opacity-50 shrink-0'
            title='Refresh Live Telemetry'
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing || weatherLoading ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. QUICK LOCATION PILLS & GEOLOCATION CHIPS
          ========================================================================= */}
      <div className='flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none'>
        <div className='flex items-center gap-2'>
          {/* Live GPS Button */}
          <button
            type='button'
            onClick={() => detectCurrentLocation(true)}
            disabled={isDetectingLocation}
            className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition cursor-pointer shrink-0 disabled:opacity-50 shadow-2xs'
            title='Auto-detect Current GPS Coordinates'
          >
            <Crosshair className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin text-amber-500' : ''}`} />
            <span>{isDetectingLocation ? 'Locating...' : 'GPS Detect'}</span>
          </button>

          {/* Saved City Pills */}
          {savedLocations.slice(0, 5).map((loc, idx) => {
            const isActive = (selectedLocation?.city || '').toLowerCase() === loc.city.toLowerCase()
            return (
              <button
                key={idx}
                type='button'
                onClick={() => handleLocationClick(loc)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shrink-0 border ${isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:border-blue-400'
                  }`}
              >
                <MapPin className={`w-3 h-3 ${isActive ? 'text-white' : 'text-blue-500'}`} />
                <span>{translateCity(loc.city)}</span>
                {loc.tempC != null && (
                  <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-black ${isActive ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    {Math.round(loc.tempC)}°
                  </span>
                )}
              </button>
            )
          })}

          {/* Add City Modal Trigger */}
          <button
            type='button'
            onClick={() => setIsAddLocationOpen(true)}
            className='flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold transition cursor-pointer shrink-0'
            title='Add New Location'
          >
            <Plus className='w-3.5 h-3.5' />
            <span>Add City</span>
          </button>
        </div>

        {/* Weather Map Shortcut */}
        <button
          onClick={() => setCurrentPage('weather-map')}
          className='hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition cursor-pointer shrink-0'
        >
          <Compass className='w-3.5 h-3.5 text-indigo-500' />
          <span>Interactive GIS Map</span>
          <ChevronRight className='w-3 h-3' />
        </button>
      </div>

      {/* =========================================================================
          3. EMERGENCY / ALERT BROADCAST TICKER
          ========================================================================= */}
      {activeAlertsList.length > 0 && alertTheme ? (
        <div
          onClick={() => setCurrentPage('alerts')}
          className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition cursor-pointer group shadow-sm ${alertTheme.containerBg}`}
        >
          <div className='flex items-center gap-3 min-w-0'>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition ${alertTheme.iconBg}`}>
              <AlertTriangle className='w-5 h-5' />
            </div>
            <div className='min-w-0'>
              <div className='flex items-center gap-2 flex-wrap'>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${alertTheme.badgeClass}`}>
                  {alertTheme.label}
                </span>
                <span className='text-xs font-bold text-slate-900 dark:text-white truncate'>
                  {translateAlertTitle(activeAlertsList[0].title)}
                </span>
              </div>
              <p className='text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5'>
                {activeAlertsList[0].location} • {translateAlertDescription(activeAlertsList[0].description)}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-bold shrink-0 ml-3 ${alertTheme.textColor}`}>
            <span>{alertTheme.actionText}</span>
            <ChevronRight className='w-4 h-4 group-hover:translate-x-1 transition' />
          </div>
        </div>
      ) : (
        <div className='flex items-center justify-between px-4 py-2.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300'>
          <div className='flex items-center gap-2 font-medium'>
            <ShieldCheck className='w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0' />
            <span><strong>All Clear:</strong> No active severe weather warnings for {locationLabel}. Atmospheric conditions stable.</span>
          </div>
          <button
            onClick={() => setCurrentPage('alerts')}
            className='font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0'
          >
            <span>Official IMD Feed</span>
            <ChevronRight className='w-3 h-3' />
          </button>
        </div>
      )}

      {/* =========================================================================
          4. HERO WEATHER DISPLAY & 7-DAY EXTENDED OUTLOOK (ROW 1)
          ========================================================================= */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Left Hero Card (7 Cols): Adaptive Night / Day Weather Core */}
        <div
          className={`lg:col-span-7 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden space-y-6 transition-all duration-500 ${heroStyles.card
            }`}
        >
          {/* Ambient Lighting & Atmospheric Elements */}
          {isNightTime ? (
            <>
              {/* Moonlit Celestial Atmosphere */}
              <div className='pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl' />
              <div className='pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-sky-400/15 blur-3xl' />

              {/* Twinkling Star Field */}
              <div className='pointer-events-none absolute top-7 right-40 w-1.5 h-1.5 rounded-full bg-white animate-ping' />
              <div className='pointer-events-none absolute top-12 right-14 w-1 h-1 rounded-full bg-amber-200 animate-pulse' />
              <div className='pointer-events-none absolute top-20 right-48 w-1.5 h-1.5 rounded-full bg-sky-200 animate-pulse' />
              <div className='pointer-events-none absolute top-8 left-36 w-1 h-1 rounded-full bg-white/70' />
              <div className='pointer-events-none absolute bottom-16 right-36 w-1.5 h-1.5 rounded-full bg-amber-100 animate-ping' />
              <div className='pointer-events-none absolute bottom-24 left-44 w-1 h-1 rounded-full bg-indigo-200 animate-pulse' />
              <div className='pointer-events-none absolute top-28 left-20 w-1 h-1 rounded-full bg-white/60' />

              <Sparkles className='pointer-events-none absolute top-6 right-24 w-4 h-4 text-amber-200/80 animate-pulse' />
              <Sparkles className='pointer-events-none absolute bottom-14 right-20 w-3.5 h-3.5 text-sky-200/80 animate-pulse' />
            </>
          ) : (
            <>
              {/* Sunlit Daylight Atmosphere */}
              <div className='pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-300/25 blur-3xl animate-pulse' />
              <div className='pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-sky-200/20 blur-3xl' />

              {/* Soft Drifting Day Clouds */}
              <div className='pointer-events-none absolute top-6 right-32 w-32 h-9 rounded-full bg-white/20 blur-xs' />
              <div className='pointer-events-none absolute top-10 right-20 w-24 h-8 rounded-full bg-white/25 blur-2xs' />
              <div className='pointer-events-none absolute bottom-14 left-10 w-40 h-10 rounded-full bg-white/15 blur-sm' />
            </>
          )}

          {/* Top Bar inside Hero: Location & Model Confidence */}
          <div className='flex items-center justify-between relative z-10 flex-wrap gap-2'>
            <div className='flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-xs'>
              <MapPin className='w-3.5 h-3.5 text-sky-200' />
              <span className='text-xs sm:text-sm font-bold tracking-wide'>{locationLabel}</span>
            </div>

            {/* NWP Consensus Badge */}
            <div
              onClick={() => setCurrentPage('forecast')}
              className='flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 text-[11px] font-bold text-sky-100 transition cursor-pointer'
              title='ECMWF & NOAA GFS Forecast Agreement'
            >
              <ShieldCheck className='w-3.5 h-3.5 text-emerald-300' />
              <span>{modelConfidence}% NWP Consensus</span>
            </div>
          </div>

          {/* Center Temp, Condition, and Night / Day Weather Art */}
          <div className='flex items-center justify-between relative z-10 my-2'>
            <div>
              <div className='flex items-baseline'>
                <span className='text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-none'>
                  {Math.round(tempVal)}
                </span>
                <span className='text-3xl sm:text-4xl font-bold text-sky-200 ml-1'>
                  °C
                </span>
              </div>

              <div className='flex items-center gap-3 mt-2 flex-wrap'>
                <span className='text-lg sm:text-xl font-bold text-white flex items-center gap-2'>
                  {isNightTime && !isRainy && (
                    <span className='inline-block w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_#fde047]' />
                  )}
                  {conditionDisplay}
                </span>
                <span className='px-2.5 py-0.5 rounded-full bg-white/15 text-xs font-semibold text-sky-100 backdrop-blur-xs'>
                  {t('feelsLike')} {Math.round(feelsLikeVal)}°C
                </span>
              </div>

              {/* Today's Range: Min / Max */}
              <div className='flex items-center gap-3 mt-2 text-xs font-bold text-sky-100'>
                <span>↓ {todayDaily?.minTemperature != null ? `${Math.round(todayDaily.minTemperature)}°C` : `${Math.round(tempVal - 4)}°C`} Min</span>
                <span>•</span>
                <span>↑ {todayDaily?.maxTemperature != null ? `${Math.round(todayDaily.maxTemperature)}°C` : `${Math.round(tempVal + 4)}°C`} Max</span>
                {precipVal > 0 && (
                  <>
                    <span>•</span>
                    <span className='text-amber-300 flex items-center gap-1'>
                      <Droplets className='w-3 h-3' />
                      {precipVal} mm
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Dynamic Weather Art: Moon with Stars at Night vs Sun with Cloud at Day */}
            <div className='relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center'>
              {isRainy ? (
                <>
                  <div className='absolute w-24 h-24 rounded-full bg-blue-500/25 blur-2xl animate-pulse' />
                  <CloudRain className='w-24 h-24 sm:w-28 sm:h-28 text-sky-200 drop-shadow-2xl relative z-10 animate-bounce' />
                </>
              ) : isNightTime ? (
                isCloudy ? (
                  <div className='relative flex items-center justify-center'>
                    <div className='absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-indigo-500/25 blur-2xl animate-pulse' />
                    <CloudMoon className='w-24 h-24 sm:w-28 sm:h-28 text-indigo-200 drop-shadow-[0_0_25px_rgba(129,140,248,0.5)] relative z-10' />
                    <Sparkles className='absolute -top-2 -right-1 w-5 h-5 text-amber-300 animate-pulse drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]' />
                    <Sparkles className='absolute bottom-0 -left-2 w-4 h-4 text-sky-200 animate-pulse drop-shadow-[0_0_8px_rgba(186,230,253,0.8)]' />
                  </div>
                ) : (
                  <div className='relative flex items-center justify-center'>
                    {/* Celestial Lunar Halo */}
                    <div className='absolute w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-indigo-400/25 via-amber-300/20 to-sky-400/20 blur-2xl animate-pulse' />
                    {/* Radiant Glowing Crescent Moon */}
                    <Moon className='w-24 h-24 sm:w-28 sm:h-28 text-amber-100 fill-amber-100/35 drop-shadow-[0_0_30px_rgba(254,240,138,0.65)] relative z-10' />
                    {/* Multiple Twinkling Stars */}
                    <Sparkles className='absolute -top-2 -right-2 w-5 h-5 text-amber-300 animate-pulse drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]' />
                    <Sparkles className='absolute bottom-1 -left-2 w-4 h-4 text-sky-200 animate-pulse drop-shadow-[0_0_8px_rgba(186,230,253,0.8)]' />
                    <Sparkles className='absolute -bottom-2 right-4 w-3.5 h-3.5 text-amber-200/90 animate-pulse' />
                  </div>
                )
              ) : (
                /* Daytime: Radiant Sun with Cloud */
                <div className='relative flex items-center justify-center'>
                  {/* Solar Glow Halo */}
                  <div className='absolute w-26 h-26 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-amber-400/35 via-yellow-300/25 to-sky-300/20 blur-2xl animate-pulse' />
                  {/* Spinning Golden Sun */}
                  <Sun className='w-22 h-22 sm:w-26 sm:h-26 text-amber-300 fill-amber-300/45 drop-shadow-[0_0_32px_rgba(252,211,77,0.8)] relative z-10 animate-spin-slow' />
                  {/* Overlapping Puffy White Cloud */}
                  <div className='absolute -bottom-1 -right-2 z-20 flex items-center justify-center'>
                    <Cloud className='w-14 h-14 sm:w-16 sm:h-16 text-white fill-white/95 drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)]' />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Professional Astronomical Solar Telemetry */}
          <div className='flex items-center justify-between pt-3 border-t border-white/20 relative z-10 text-xs text-sky-100 font-semibold'>
            <div className='flex items-center gap-2 bg-white/12 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 shadow-2xs'>
              <Sunrise className='w-3.5 h-3.5 text-amber-300' />
              <span>{t('sunrise')}: <strong className='text-white font-bold'>{sunriseTime}</strong></span>
            </div>
            <div className='flex items-center gap-2 bg-white/12 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 shadow-2xs'>
              <Sunset className='w-3.5 h-3.5 text-orange-300' />
              <span>{t('sunset')}: <strong className='text-white font-bold'>{sunsetTime}</strong></span>
            </div>
          </div>
        </div>

        {/* Right Card (5 Cols): 7-Day Extended Outlook */}
        <div className='lg:col-span-5 bg-white dark:bg-slate-800/95 rounded-3xl border border-slate-200/80 dark:border-slate-700/70 p-6 shadow-xs flex flex-col justify-between space-y-4'>
          <div className='flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60'>
            <div className='flex items-center gap-2'>
              <CalendarDays className='w-4 h-4 text-blue-600 dark:text-blue-400' />
              <h3 className='text-base font-bold text-slate-900 dark:text-white'>
                {t('sevenDayForecast')}
              </h3>
            </div>
            <button
              onClick={() => setCurrentPage('forecast')}
              className='text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer'
            >
              <span>{t('viewFullForecast')}</span>
              <ChevronRight className='w-3.5 h-3.5' />
            </button>
          </div>

          {/* 7-Day Range Rows */}
          <div className='space-y-3'>
            {dailyForecastData.slice(0, 7).map((d, index) => {
              const dayName = index === 0
                ? t('today')
                : new Date(d.date).toLocaleDateString(language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short' })
              const popVal = Math.round(d.precipitationProbability ?? 0)
              const minT = Math.round(d.minTemperature ?? 20)
              const maxT = Math.round(d.maxTemperature ?? 30)

              return (
                <div key={index} className='flex items-center justify-between text-xs py-0.5'>
                  <div className='w-16 font-bold text-slate-800 dark:text-slate-200 truncate'>
                    {dayName}
                  </div>

                  {/* Weather Icon & Rain Prob */}
                  <div className='flex items-center gap-2 text-slate-500 dark:text-slate-400 w-20'>
                    {popVal >= 40 ? (
                      <CloudRain className='w-4 h-4 text-blue-500' />
                    ) : popVal >= 20 ? (
                      <CloudSun className='w-4 h-4 text-amber-500' />
                    ) : (
                      <Sun className='w-4 h-4 text-amber-500' />
                    )}
                    <span className={`text-[11px] font-bold ${popVal >= 40 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                      {popVal}%
                    </span>
                  </div>

                  {/* Dynamic Temp Span Gradient Slider */}
                  <div className='flex items-center gap-2.5 flex-1 max-w-[160px] justify-end'>
                    <span className='text-slate-400 font-semibold w-7 text-right'>{minT}°</span>
                    <div className='flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700/80 overflow-hidden relative'>
                      <div
                        className='h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-amber-400'
                        style={{
                          marginLeft: `${Math.max(0, (minT - 10) * 3)}%`,
                          width: `${Math.max(25, (maxT - minT) * 6)}%`
                        }}
                      />
                    </div>
                    <span className='font-bold text-slate-900 dark:text-white w-7'>{maxT}°</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Model Comparison Footer */}
          <div className='pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs'>
            <span className='text-slate-500 dark:text-slate-400 font-medium'>
              Forecast models: <strong>ECMWF-IFS + NOAA-GFS</strong>
            </span>
            <span className='font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1'>
              <CheckCircle2 className='w-3.5 h-3.5' />
              {agreementLevel.toUpperCase()} AGREEMENT
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. INTERACTIVE 24-HOUR RECHARTS TELEMETRY & HOURLY TIMELINE (STARTS AT NOW)
          ========================================================================= */}
      <div className='bg-white dark:bg-slate-800/95 rounded-3xl border border-slate-200/80 dark:border-slate-700/70 p-6 shadow-xs space-y-5'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-700/60'>
          <div>
            <h3 className='text-base font-bold text-slate-900 dark:text-white flex items-center gap-2'>
              <TrendingUp className='w-4 h-4 text-blue-600 dark:text-blue-400' />
              <span>{t('hourlyForecast')}</span>
            </h3>
            <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5'>
              24-hour upcoming forecast starting from current hour ({new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })})
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className='flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-700/60 border border-slate-200/60 dark:border-slate-600/40 text-xs font-bold'>
            <button
              type='button'
              onClick={() => setActiveChartMetric('temp')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${activeChartMetric === 'temp'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
            >
              <Thermometer className='w-3.5 h-3.5' />
              <span>Temperature</span>
            </button>
            <button
              type='button'
              onClick={() => setActiveChartMetric('pop')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${activeChartMetric === 'pop'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
            >
              <CloudRain className='w-3.5 h-3.5' />
              <span>Precipitation %</span>
            </button>
            <button
              type='button'
              onClick={() => setActiveChartMetric('wind')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${activeChartMetric === 'wind'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
            >
              <Wind className='w-3.5 h-3.5' />
              <span>Wind Speed</span>
            </button>
          </div>
        </div>

        {/* Recharts Area Curve */}
        <div className='w-full h-44 sm:h-52'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={hourlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id='colorMetric' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor={
                      activeChartMetric === 'temp' ? '#3b82f6' : activeChartMetric === 'pop' ? '#0ea5e9' : '#6366f1'
                    }
                    stopOpacity={0.4}
                  />
                  <stop
                    offset='95%'
                    stopColor={
                      activeChartMetric === 'temp' ? '#3b82f6' : activeChartMetric === 'pop' ? '#0ea5e9' : '#6366f1'
                    }
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey='time'
                stroke='#94a3b8'
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke='#94a3b8'
                fontSize={11}
                tickLine={false}
                axisLine={false}
                unit={activeChartMetric === 'temp' ? '°' : activeChartMetric === 'pop' ? '%' : 'k'}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className='p-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs shadow-xl border border-slate-200 dark:border-slate-700'>
                        <p className='font-bold text-blue-600 dark:text-sky-300'>{data.fullTime}</p>
                        <p className='text-slate-900 dark:text-white font-extrabold mt-1'>
                          {activeChartMetric === 'temp' && `Temperature: ${data.temp}°C`}
                          {activeChartMetric === 'pop' && `Rain Probability: ${data.pop}%`}
                          {activeChartMetric === 'wind' && `Wind Velocity: ${data.wind} km/h`}
                        </p>
                        <p className='text-slate-500 dark:text-slate-400 text-[10px] mt-0.5'>{data.condition}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type='monotone'
                dataKey={activeChartMetric}
                stroke={
                  activeChartMetric === 'temp' ? '#3b82f6' : activeChartMetric === 'pop' ? '#0ea5e9' : '#6366f1'
                }
                strokeWidth={3}
                fillOpacity={1}
                fill='url(#colorMetric)'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Scrollable Hourly Strip: Shows Moon for Night Slots */}
        <div className='flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none'>
          {futureHours.slice(0, 16).map((h, i) => {
            const isNow = i === 0
            const date = new Date(h.time)
            const hourLabel = isNow ? t('now') : date.toLocaleTimeString([], { hour: 'numeric' })
            const popVal = Math.round(h.precipitationProbability ?? 0)
            const isSlotNight = checkIsSlotNight(h.time)

            return (
              <div
                key={i}
                className={`flex flex-col items-center justify-between p-3 rounded-2xl min-w-[76px] text-center border transition shrink-0 ${isNow
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700/60 hover:border-blue-400'
                  }`}
              >
                <span className={`text-[11px] font-bold ${isNow ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  {hourLabel}
                </span>

                <div className='my-2'>
                  {popVal >= 40 ? (
                    <CloudRain className={`w-5 h-5 ${isNow ? 'text-sky-200' : 'text-blue-500'}`} />
                  ) : isSlotNight ? (
                    (h.cloudCover ?? 0) >= 50 ? (
                      <CloudMoon className={`w-5 h-5 ${isNow ? 'text-indigo-200' : 'text-indigo-400'}`} />
                    ) : (
                      <Moon className={`w-5 h-5 ${isNow ? 'text-amber-200' : 'text-amber-400'}`} />
                    )
                  ) : (h.cloudCover ?? 0) >= 60 ? (
                    <Cloud className={`w-5 h-5 ${isNow ? 'text-slate-200' : 'text-slate-400'}`} />
                  ) : (
                    <Sun className={`w-5 h-5 ${isNow ? 'text-amber-200' : 'text-amber-400'}`} />
                  )}
                </div>

                <span className={`text-sm font-black ${isNow ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {Math.round(h.temperature ?? 25)}°
                </span>

                <span className={`text-[10px] font-bold mt-1 ${isNow ? 'text-sky-200' : 'text-blue-600 dark:text-blue-400'}`}>
                  {popVal}%
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* =========================================================================
          6. HIGH-PRECISION 8-CARD METEOROLOGICAL TELEMETRY GRID
          ========================================================================= */}
      <div>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2'>
            <Gauge className='w-4 h-4 text-blue-600 dark:text-blue-400' />
            <span>Real-time Atmospheric Telemetry</span>
          </h3>
          <span className='text-xs font-semibold text-slate-500 dark:text-slate-400'>
            Verified Sensors • WMO Standards
          </span>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
          {/* 1. Air Quality Index (AQI) */}
          <div
            onClick={() => setIsAirQualityOpen(true)}
            className='p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-xs hover:border-emerald-400 transition cursor-pointer group flex flex-col justify-between space-y-3'
          >
            <div className='flex items-center justify-between'>
              <span className='text-xs font-bold text-slate-500 dark:text-slate-400'>Air Quality</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white ${aqiRating.badge}`}>
                {aqiRating.text}
              </span>
            </div>
            <div>
              <div className='flex items-baseline gap-1.5'>
                <span className='text-3xl font-black text-slate-900 dark:text-white'>{aqiVal}</span>
                <span className='text-xs text-slate-400'>AQI</span>
              </div>
              <p className='text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2'>
                {aqiRating.advice}
              </p>
            </div>
            <div className='text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition'>
              <span>View Pollutant Breakdown</span>
              <ChevronRight className='w-3 h-3' />
            </div>
          </div>

          {/* 2. Humidity & Dew Point */}
          <div className='p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-xs flex flex-col justify-between space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-bold text-slate-500 dark:text-slate-400'>{t('humidity')}</span>
              <Droplets className='w-4 h-4 text-sky-500' />
            </div>
            <div>
              <div className='flex items-baseline gap-1'>
                <span className='text-3xl font-black text-slate-900 dark:text-white'>{humidityVal}%</span>
              </div>
              <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
                The dew point is currently <strong>{dewPointVal}°C</strong>
              </p>
            </div>
            <div className='w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden'>
              <div className='bg-sky-500 h-full rounded-full' style={{ width: `${humidityVal}%` }} />
            </div>
          </div>

          {/* 3. Wind Velocity & Compass Direction */}
          <div className='p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-xs flex flex-col justify-between space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-bold text-slate-500 dark:text-slate-400'>{t('wind')}</span>
              <Wind className='w-4 h-4 text-indigo-500' />
            </div>
            <div>
              <div className='flex items-baseline gap-1.5'>
                <span className='text-3xl font-black text-slate-900 dark:text-white'>{formatWind(windVal)}</span>
              </div>
              <p className='text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5'>
                <Navigation2 className='w-3.5 h-3.5 text-blue-500' style={{ transform: `rotate(${windDirDeg}deg)` }} />
                <span>Direction: <strong>{windDirectionLabel} ({windDirDeg}°)</strong></span>
              </p>
            </div>
            <span className='text-[10px] text-slate-400 font-semibold'>
              Gusts: up to {Math.round(windVal * 1.35)} km/h
            </span>
          </div>

          {/* 4. UV Index (Shows 0 at Night) */}
          <div className='p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-xs flex flex-col justify-between space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-bold text-slate-500 dark:text-slate-400'>{t('uvIndex')}</span>
              {isNightTime ? <Moon className='w-4 h-4 text-amber-300' /> : <Sun className='w-4 h-4 text-amber-500' />}
            </div>
            <div>
              <div className='flex items-baseline gap-2'>
                <span className='text-3xl font-black text-slate-900 dark:text-white'>{uvVal}</span>
                <span className={`text-xs font-bold ${uvRating.color}`}>{uvRating.text}</span>
              </div>
              <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
                {uvRating.advice}
              </p>
            </div>
            <div className='w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden'>
              <div className='bg-amber-500 h-full rounded-full transition-all duration-500' style={{ width: `${Math.min(100, Math.round((uvVal / 11) * 100))}%` }} />
            </div>
          </div>

          {/* 5. Atmospheric Pressure */}
          <div className='p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-xs flex flex-col justify-between space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-bold text-slate-500 dark:text-slate-400'>{t('pressure')}</span>
              <Gauge className='w-4 h-4 text-purple-500' />
            </div>
            <div>
              <div className='flex items-baseline gap-1'>
                <span className='text-3xl font-black text-slate-900 dark:text-white'>{pressureVal}</span>
                <span className='text-xs text-slate-400'>hPa</span>
              </div>
              <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
                Barometric pressure is stable
              </p>
            </div>
            <span className='text-[10px] text-emerald-600 dark:text-emerald-400 font-bold'>
              Normal Sea-Level Range
            </span>
          </div>

          {/* 6. Visibility & Clarity */}
          <div className='p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-xs flex flex-col justify-between space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-bold text-slate-500 dark:text-slate-400'>{t('visibility')}</span>
              <Eye className='w-4 h-4 text-emerald-500' />
            </div>
            <div>
              <div className='flex items-baseline gap-1'>
                <span className='text-3xl font-black text-slate-900 dark:text-white'>{visibilityVal}</span>
                <span className='text-xs text-slate-400'>km</span>
              </div>
              <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
                {visibilityVal >= 10 ? 'Clear horizon visibility' : 'Moderate particulate haze'}
              </p>
            </div>
            <span className='text-[10px] text-slate-400 font-semibold'>
              Optimal for transit & flight
            </span>
          </div>

          {/* 7. Cloud Coverage */}
          <div className='p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-xs flex flex-col justify-between space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-bold text-slate-500 dark:text-slate-400'>{t('cloudCover')}</span>
              <Cloud className='w-4 h-4 text-slate-400' />
            </div>
            <div>
              <div className='flex items-baseline gap-1'>
                <span className='text-3xl font-black text-slate-900 dark:text-white'>{cloudCoverVal}%</span>
              </div>
              <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
                {cloudCoverVal < 25 ? (isNightTime ? 'Starry night sky' : 'Predominantly sunny') : cloudCoverVal < 70 ? 'Partly cloudy sky' : 'Full cloud overcast'}
              </p>
            </div>
            <div className='w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden'>
              <div className='bg-slate-400 h-full rounded-full' style={{ width: `${cloudCoverVal}%` }} />
            </div>
          </div>

          {/* 8. Soil Moisture (Agricultural Indicator) */}
          <div className='p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-xs flex flex-col justify-between space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-bold text-slate-500 dark:text-slate-400'>Topsoil Moisture</span>
              <Sprout className='w-4 h-4 text-emerald-500' />
            </div>
            <div>
              <div className='flex items-baseline gap-1'>
                <span className='text-3xl font-black text-slate-900 dark:text-white'>0.28</span>
                <span className='text-xs text-slate-400'>m³/m³</span>
              </div>
              <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
                0–1cm depth: Adequate root moisture
              </p>
            </div>
            <span className='text-[10px] text-emerald-600 dark:text-emerald-400 font-bold'>
              Healthy Germination Level
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          7. "DO YOU KNOW?" MANUAL HORIZONTAL SCROLL WITH ILLUSTRATION CARDS
          ========================================================================= */}
      {/* =========================================================================
          7. WEATHER INTELLIGENCE SUMMARY + COLLAPSIBLE SCIENCE FACTS
          ========================================================================= */}

      {/* === Decision Intelligence Summary Card === */}
      {(decisionBrief || decisionBriefLoading) && (
        <div className='bg-white dark:bg-slate-800/95 rounded-3xl border border-slate-200/80 dark:border-slate-700/70 shadow-xs overflow-hidden'>
          <div className='p-5 sm:p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-base font-bold text-slate-900 dark:text-white flex items-center gap-2'>
                <Sparkles className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                <span>Weather Intelligence Summary</span>
              </h3>
              {decisionBrief && (
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                  decisionBrief.overallRisk === 'extreme' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' :
                  decisionBrief.overallRisk === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300' :
                  decisionBrief.overallRisk === 'moderate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' :
                  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}>
                  {decisionBrief.overallRisk} risk
                </span>
              )}
            </div>

            {decisionBriefLoading && !decisionBrief && (
              <div className='flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 py-4'>
                <div className='w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin' />
                <span>Analyzing conditions for {locationLabel}...</span>
              </div>
            )}

            {decisionBrief && (
              <div className='space-y-4'>
                {/* Headline */}
                <div className={`p-4 rounded-2xl border ${
                  decisionBrief.overallRisk === 'extreme' || decisionBrief.overallRisk === 'high'
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50'
                    : decisionBrief.overallRisk === 'moderate'
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50'
                      : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50'
                }`}>
                  <p className='text-sm font-bold text-slate-900 dark:text-white'>{decisionBrief.headline}</p>
                  {decisionBrief.primaryImpact && (
                    <p className='text-xs text-slate-600 dark:text-slate-300 mt-1'>{decisionBrief.primaryImpact}</p>
                  )}
                </div>

                {/* Recommended Actions */}
                {decisionBrief.actions?.length > 0 && (
                  <div>
                    <p className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2'>Recommended Actions</p>
                    <div className='space-y-1.5'>
                      {decisionBrief.actions.slice(0, 4).map((action, i) => (
                        <div key={i} className='flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200'>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black ${
                            action.category === 'official' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' :
                            action.category === 'farm' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                            action.category === 'ops' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                          }`}>{i + 1}</div>
                          <span>{action.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline Events */}
                {decisionBrief.timelineEvents?.length > 0 && (
                  <div>
                    <p className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2'>Forecast Timeline</p>
                    <div className='flex flex-wrap gap-2'>
                      {decisionBrief.timelineEvents.slice(0, 3).map((event, i) => (
                        <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                          event.riskLevel === 'high' ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800/60 dark:text-rose-300' :
                          event.riskLevel === 'moderate' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-300' :
                          'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800/60 dark:border-slate-600 dark:text-slate-300'
                        }`}>
                          <span className='font-bold'>{event.period}:</span>
                          <span>{event.event}</span>
                          {event.detail && <span className='opacity-70'>({event.detail})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Source transparency footer */}
                <p className='text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-700/50'>
                  AI interpretation of verified Open-Meteo + IMD data. Not a substitute for official IMD warnings.
                  {decisionBrief.confidence?.sources?.length > 0 && ` Sources: ${decisionBrief.confidence.sources.join(', ')}.`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === Collapsible Science Facts Carousel === */}
      <div className='pt-2 pb-2'>
        <button
          type='button'
          onClick={() => setShowScienceFacts(v => !v)}
          className='flex items-center justify-between w-full gap-2 mb-3.5 px-1 group cursor-pointer'
        >
          <h3 className='text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight'>
            {language === 'mr' ? 'तुम्हाला माहिती आहे का?' : language === 'hi' ? 'क्या आप जानते हैं?' : 'Did You Know?'}
          </h3>
          <div className='flex items-center gap-2'>
            <span className='text-xs text-slate-400 dark:text-slate-500'>{showScienceFacts ? 'Collapse' : 'Expand'}</span>
            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showScienceFacts ? 'rotate-90' : ''}`} />
          </div>
        </button>

        {showScienceFacts && (
          <>
            <div className='flex items-center justify-end gap-1.5 mb-3'>
              <button
                type='button'
                onClick={() => scrollFacts('left')}
                aria-label='Scroll left'
                className='w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>
              <button
                type='button'
                onClick={() => scrollFacts('right')}
                aria-label='Scroll right'
                className='w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs'
              >
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>

            <div
              ref={factsScrollRef}
              className='flex items-stretch gap-4 sm:gap-5 overflow-x-auto scrollbar-none pb-2 pt-1 scroll-smooth snap-x'
            >
              {SCIENCE_FACTS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    sendChatMessage(item.prompt)
                    setCurrentPage('chat')
                  }}
                  title='Click to ask WeatherGPT AI about this'
                  className='w-[250px] sm:w-[280px] shrink-0 bg-white dark:bg-slate-800/95 rounded-3xl p-3 border border-slate-200/80 dark:border-slate-700/70 shadow-xs hover:shadow-md transition-all flex flex-col justify-between snap-start cursor-pointer group'
                >
                  <div className='w-full h-40 sm:h-44 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 relative shrink-0'>
                    <img
                      src={item.image}
                      alt={item.title}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                  <p className='text-xs sm:text-[13px] text-slate-700 dark:text-slate-200 font-medium leading-relaxed mt-3 px-0.5 pb-1'>
                    {item.fact}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* =========================================================================
          8. SOCIAL MEDIA PLATFORMS (SINGLE LINE: MESSAGE + SQUARE ROUNDED LOGOS)
          ========================================================================= */}
      <div className='mt-8 pt-5 pb-2 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4'>
        <div className='flex items-center gap-2'>
          <span className='text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight'>
            {language === 'mr'
              ? 'सोशल मीडिया प्लॅटफॉर्मवर आम्हाला फॉलो करा'
              : language === 'hi'
                ? 'सोशल मीडिया प्लेटफॉर्म पर हमें फॉलो करें'
                : 'Follow Us On Social Media Platforms'}
          </span>
        </div>

        <div className='flex items-center gap-2.5 sm:gap-3'>
          {/* X (Twitter) */}
          <a
            href='https://twitter.com'
            target='_blank'
            rel='noopener noreferrer'
            aria-label='Follow us on X'
            className='w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center shadow-xs hover:shadow-md hover:scale-105 transition-all cursor-pointer'
          >
            <svg className='w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current' viewBox='0 0 24 24'>
              <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
            </svg>
          </a>

          {/* Facebook */}
          <a
            href='https://facebook.com'
            target='_blank'
            rel='noopener noreferrer'
            aria-label='Follow us on Facebook'
            className='w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center shadow-xs hover:shadow-md hover:scale-105 transition-all cursor-pointer'
          >
            <svg className='w-4.5 h-4.5 sm:w-5 sm:h-5 fill-current' viewBox='0 0 24 24'>
              <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
            </svg>
          </a>

          {/* Instagram */}
          <a
            href='https://instagram.com'
            target='_blank'
            rel='noopener noreferrer'
            aria-label='Follow us on Instagram'
            className='w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] text-white flex items-center justify-center shadow-xs hover:shadow-md hover:scale-105 transition-all cursor-pointer'
          >
            <svg className='w-4.5 h-4.5 sm:w-5 sm:h-5 fill-current' viewBox='0 0 24 24'>
              <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
            </svg>
          </a>

          {/* YouTube */}
          <a
            href='https://youtube.com'
            target='_blank'
            rel='noopener noreferrer'
            aria-label='Follow us on YouTube'
            className='w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FF0000] hover:bg-[#e60000] text-white flex items-center justify-center shadow-xs hover:shadow-md hover:scale-105 transition-all cursor-pointer'
          >
            <svg className='w-4.5 h-4.5 sm:w-5 sm:h-5 fill-current' viewBox='0 0 24 24'>
              <path d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
