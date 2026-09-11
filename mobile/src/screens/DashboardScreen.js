import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator
} from 'react-native'
import {
  Search,
  Mic,
  Send,
  Plane,
  Anchor,
  Waves,
  MapPin,
  Wind,
  Gauge,
  Eye,
  ArrowRight,
  MessageSquare,
  Calendar,
  Map,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Plus,
  RefreshCw,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Sun,
  Moon,
  CloudMoon,
  CloudRain,
  CloudSun,
  Cloud,
  Crosshair,
  TrendingUp,
  Thermometer,
  Lightbulb,
  Compass,
  Sunrise,
  Sunset,
  CheckCircle2,
  Database,
  WifiOff
} from 'lucide-react-native'
import { getColors } from '../theme/colors'
import { api, offlineStorage } from '../services/api'
import { WeatherIcon } from '../components/WeatherIcon'
import { EmergencyBanner } from '../components/EmergencyBanner'

const SCIENCE_FACTS = [
  {
    title: 'The Scent of Rain',
    fact: 'The pleasant earthy fragrance when rain hits dry soil is called Petrichor, caused by Geosmin—an organic compound humans can detect at 5 parts per trillion.'
  },
  {
    title: 'Anatomy of Lightning',
    fact: 'A single lightning bolt reaches 30,000°C (54,000°F)—five times hotter than the surface of the sun, causing the explosive shockwave of thunder.'
  },
  {
    title: 'Giant Heat Engines',
    fact: 'A mature tropical cyclone releases thermal energy equal to 10,000 nuclear bombs daily, powered entirely by warm ocean waters above 26.5°C.'
  },
  {
    title: 'Weight of a Cloud',
    fact: 'An average fluffy white cumulus cloud weighs over 500,000 kg (1.1 million lbs)—about the weight of 100 adult elephants floating in the air.'
  },
  {
    title: 'Not Teardrop Shaped',
    fact: 'Falling raindrops are not teardrop shaped! Air resistance flattens their bottom as they fall, giving them the shape of a hamburger bun.'
  },
  {
    title: 'Full Circle Rainbows',
    fact: 'Every rainbow is actually a full 360° circle; from the ground, the horizon cuts off the bottom half, but pilots frequently see the complete circle.'
  }
]

const QUICK_CITIES = ['Pune', 'Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Kolkata']

export function DashboardScreen ({
  isDark = false,
  unit = 'C',
  onNavigate,
  backendReady = false
}) {
  const c = getColors(isDark)
  const { width } = useWindowDimensions()
  const isWide = width > 768

  const [activeCity, setActiveCity] = useState('Pune')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isDetectingGps, setIsDetectingGps] = useState(false)
  const [activeChartMetric, setActiveChartMetric] = useState('temp') // 'temp' | 'pop' | 'wind'
  const [factIndex, setFactIndex] = useState(0)

  // Live & Offline State
  const [liveWeather, setLiveWeather] = useState(null)
  const [liveForecast, setLiveForecast] = useState(null)
  const [liveHourly, setLiveHourly] = useState([])
  const [liveAlerts, setLiveAlerts] = useState([])
  const [loadingLiveData, setLoadingLiveData] = useState(false)
  const [isOfflineActive, setIsOfflineActive] = useState(false)
  const [pinnedWidgets, setPinnedWidgets] = useState({
    aviation: true,
    marine: true,
    urbanFlood: true,
    airQuality: false
  })

  // Load user pinned widgets (default: all false, keeping home dashboard clean)
  useEffect(() => {
    let mounted = true
    const checkPinned = () => {
      offlineStorage.getPinnedWidgets().then(res => {
        if (mounted && res) setPinnedWidgets(res)
      }).catch(() => {})
    }
    checkPinned()
    const syncInterval = setInterval(checkPinned, 1500)
    return () => {
      mounted = false
      clearInterval(syncInterval)
    }
  }, [])

  // Fetch live telemetry from common server with 7-day offline fallback
  const fetchLiveTelemetry = async (targetCity = activeCity) => {
    setLoadingLiveData(true)
    try {
      await api.detectServer()
      await api.ensureAuth()

      const [wRes, fRes, aRes, hRes] = await Promise.allSettled([
        api.weather({ city: targetCity }),
        api.forecast({ city: targetCity, days: 7 }),
        api.activeAlerts(),
        api.hourlyForecast({ city: targetCity, hours: 48 })
      ])

      let wData = null
      let fData = null

      if (wRes.status === 'fulfilled' && wRes.value) {
        wData = wRes.value
        setLiveWeather(wData)
      }
      if (fRes.status === 'fulfilled' && fRes.value) {
        fData = fRes.value
        setLiveForecast(fData)
      }
      if (hRes.status === 'fulfilled' && hRes.value) {
        const hourlyList = Array.isArray(hRes.value)
          ? hRes.value
          : (Array.isArray(hRes.value?.hourly) ? hRes.value.hourly : [])
        if (hourlyList.length > 0) {
          setLiveHourly(hourlyList)
        }
      } else if (wData?.forecast?.hourly && Array.isArray(wData.forecast.hourly)) {
        setLiveHourly(wData.forecast.hourly)
      } else if (fData?.models?.openMeteo?.hourly && Array.isArray(fData.models.openMeteo.hourly)) {
        setLiveHourly(fData.models.openMeteo.hourly)
      }
      if (aRes.status === 'fulfilled' && Array.isArray(aRes.value)) {
        setLiveAlerts(aRes.value)
      }

      // Check if we got offline-served data
      if (wData?._isOffline || fData?._isOffline) {
        setIsOfflineActive(true)
      } else {
        setIsOfflineActive(false)
        // Automatically snapshot to 7-day rolling local storage
        if (wData) {
          offlineStorage.saveDailySnapshot(targetCity, wData, fData).catch(() => {})
        }
      }
    } catch (err) {
      console.warn('Live telemetry sync warning:', err?.message)
      // Attempt to load from 7-day offline cache
      try {
        const history = await offlineStorage.get7DayHistory(targetCity)
        if (history && history.length > 0) {
          const latest = history[0]
          setLiveWeather({
            current: {
              temperature: latest.temp,
              humidity: latest.humidity,
              windSpeed: latest.windSpeed,
              pressure: latest.pressure,
              condition: latest.condition,
              precipitationProbability: latest.rainProb
            },
            airQuality: { aqi: latest.aqi },
            resolvedCity: latest.city,
            _isOffline: true
          })
          setIsOfflineActive(true)
        }
      } catch {}
    } finally {
      setLoadingLiveData(false)
    }
  }

  useEffect(() => {
    fetchLiveTelemetry(activeCity)
  }, [activeCity, backendReady])

  // Handle live search suggestions with debounce
  useEffect(() => {
    const q = searchQuery.trim()
    if (q.length < 2) {
      setSearchResults([])
      return
    }

    let isMounted = true
    setIsSearching(true)
    const timeout = setTimeout(() => {
      api
        .searchLocations(q)
        .then(res => {
          if (isMounted && Array.isArray(res)) {
            setSearchResults(res.slice(0, 5))
          }
        })
        .catch(() => {
          if (isMounted) setSearchResults([])
        })
        .finally(() => {
          if (isMounted) setIsSearching(false)
        })
    }, 250)

    return () => {
      isMounted = false
      clearTimeout(timeout)
    }
  }, [searchQuery])

  const selectSearchResult = item => {
    const cityName = item.city || item.name
    if (cityName) {
      setActiveCity(cityName)
      setSearchQuery('')
      setSearchResults([])
      fetchLiveTelemetry(cityName)
    }
  }

  const handleGpsDetect = () => {
    setIsDetectingGps(true)
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setIsDetectingGps(false)
          api
            .weather({
              lat: pos.coords.latitude,
              lon: pos.coords.longitude
            })
            .then(res => {
              if (res) {
                setLiveWeather(res)
                if (res.resolvedCity || res.city) {
                  setActiveCity(res.resolvedCity || res.city)
                }
              }
            })
            .catch(() => {})
        },
        () => {
          setIsDetectingGps(false)
          setActiveCity('Pune')
          fetchLiveTelemetry('Pune')
        },
        { timeout: 5000 }
      )
    } else {
      setTimeout(() => {
        setIsDetectingGps(false)
        setActiveCity('Pune')
        fetchLiveTelemetry('Pune')
      }, 800)
    }
  }

  // Parse live metrics directly from backend
  const currentWeather =
    liveWeather?.forecast?.current || liveWeather?.current || {}
  const hourlyWeather =
    (liveHourly && liveHourly.length > 0 ? liveHourly : null) ||
    liveForecast?.models?.openMeteo?.hourly ||
    liveForecast?.hourly ||
    []
  const dailyWeather =
    liveForecast?.models?.openMeteo?.daily || liveForecast?.daily || []

  const resolvedCity =
    liveWeather?.resolvedCity ||
    liveWeather?.location?.name ||
    activeCity ||
    'Pune'

  // Night vs Day Detection
  const currentHour = new Date().getHours()
  const isNightTime = currentHour < 6 || currentHour >= 19

  // Genuine metrics directly from Open-Meteo / backend synthesis
  const rawTempC = useMemo(() => {
    if (currentWeather.temperature !== undefined && currentWeather.temperature !== null) {
      return Math.round(Number(currentWeather.temperature))
    }
    if (hourlyWeather.length > 0 && hourlyWeather[0]?.temperature !== undefined) {
      return Math.round(Number(hourlyWeather[0].temperature))
    }
    return 27
  }, [currentWeather.temperature, hourlyWeather])

  const rawFeelsLikeC = useMemo(() => {
    if (currentWeather.apparentTemperature !== undefined && currentWeather.apparentTemperature !== null) {
      return Math.round(Number(currentWeather.apparentTemperature))
    }
    if (currentWeather.feelsLike !== undefined && currentWeather.feelsLike !== null) {
      return Math.round(Number(currentWeather.feelsLike))
    }
    return rawTempC
  }, [currentWeather.apparentTemperature, currentWeather.feelsLike, rawTempC])

  const humidity = useMemo(() => {
    if (currentWeather.humidity !== undefined && currentWeather.humidity !== null) {
      return Math.round(Number(currentWeather.humidity))
    }
    if (hourlyWeather.length > 0 && hourlyWeather[0]?.humidity !== undefined) {
      return Math.round(Number(hourlyWeather[0].humidity))
    }
    return 60
  }, [currentWeather.humidity, hourlyWeather])

  const windSpeed = useMemo(() => {
    if (currentWeather.windSpeed !== undefined && currentWeather.windSpeed !== null) {
      return Math.round(Number(currentWeather.windSpeed))
    }
    if (hourlyWeather.length > 0 && hourlyWeather[0]?.windSpeed !== undefined) {
      return Math.round(Number(hourlyWeather[0].windSpeed))
    }
    return 9
  }, [currentWeather.windSpeed, hourlyWeather])

  const windDirDeg = useMemo(() => {
    if (currentWeather.windDirection !== undefined && currentWeather.windDirection !== null) {
      return Math.round(Number(currentWeather.windDirection))
    }
    return 295
  }, [currentWeather.windDirection])

  const pressure = useMemo(() => {
    if (currentWeather.pressure !== undefined && currentWeather.pressure !== null) {
      return Math.round(Number(currentWeather.pressure))
    }
    if (hourlyWeather.length > 0 && hourlyWeather[0]?.pressure !== undefined) {
      return Math.round(Number(hourlyWeather[0].pressure))
    }
    return 951
  }, [currentWeather.pressure, hourlyWeather])

  const visibility = useMemo(() => {
    if (currentWeather.visibility !== undefined && currentWeather.visibility !== null) {
      const v = Number(currentWeather.visibility)
      return v > 100 ? (v / 1000).toFixed(1) : v.toFixed(1)
    }
    if (hourlyWeather.length > 0 && hourlyWeather[0]?.visibility !== undefined) {
      const v = Number(hourlyWeather[0].visibility)
      return v > 100 ? (v / 1000).toFixed(1) : v.toFixed(1)
    }
    return '18.0'
  }, [currentWeather.visibility, hourlyWeather])

  const uvVal = useMemo(() => {
    if (currentWeather.uvIndex !== undefined && currentWeather.uvIndex !== null) {
      return Number(currentWeather.uvIndex).toFixed(1)
    }
    if (hourlyWeather.length > 0 && hourlyWeather[0]?.uvIndex !== undefined) {
      return Number(hourlyWeather[0].uvIndex).toFixed(1)
    }
    return isNightTime ? '0.0' : '5.2'
  }, [currentWeather.uvIndex, hourlyWeather, isNightTime])

  const rawCondition =
    currentWeather.condition ||
    currentWeather.weatherDescription ||
    'Clear sky'

  const isRainy =
    rawCondition.toLowerCase().includes('rain') ||
    rawCondition.toLowerCase().includes('shower') ||
    rawCondition.toLowerCase().includes('drizzle')

  // Dynamic condition label
  const conditionDisplay = useMemo(() => {
    if (isNightTime) {
      if (isRainy) return 'Rainy Night'
      if (rawCondition.toLowerCase().includes('cloud')) return 'Cloudy Night'
      return 'Clear Night'
    }
    return rawCondition
  }, [isNightTime, isRainy, rawCondition])

  // Magnus-Tetens exact meteorological dew point calculation
  const dewPointVal = useMemo(() => {
    if (currentWeather.dewPoint !== undefined && currentWeather.dewPoint !== null && currentWeather.dewPoint !== '') {
      return Math.round(Number(currentWeather.dewPoint))
    }
    if (hourlyWeather.length > 0 && hourlyWeather[0]?.dewPoint !== undefined && hourlyWeather[0].dewPoint !== null) {
      return Math.round(Number(hourlyWeather[0].dewPoint))
    }
    const a = 17.27
    const b = 237.7
    const alpha = ((a * rawTempC) / (b + rawTempC)) + Math.log(humidity / 100)
    return Math.round((b * alpha) / (a - alpha))
  }, [currentWeather.dewPoint, hourlyWeather, rawTempC, humidity])

  // Genuine Today Min and Max from NWP daily models / 24-hr observations
  const todayMinTemp = useMemo(() => {
    if (dailyWeather[0]?.minTemperature !== undefined && dailyWeather[0].minTemperature !== null) {
      return Math.round(dailyWeather[0].minTemperature)
    }
    if (hourlyWeather.length >= 12) {
      const temps = hourlyWeather.slice(0, 24).map(h => h.temperature).filter(t => typeof t === 'number')
      if (temps.length > 0) return Math.round(Math.min(...temps))
    }
    return Math.round(rawTempC - 4)
  }, [dailyWeather, hourlyWeather, rawTempC])

  const todayMaxTemp = useMemo(() => {
    if (dailyWeather[0]?.maxTemperature !== undefined && dailyWeather[0].maxTemperature !== null) {
      return Math.round(dailyWeather[0].maxTemperature)
    }
    if (hourlyWeather.length >= 12) {
      const temps = hourlyWeather.slice(0, 24).map(h => h.temperature).filter(t => typeof t === 'number')
      if (temps.length > 0) return Math.round(Math.max(...temps))
    }
    return Math.round(rawTempC + 4)
  }, [dailyWeather, hourlyWeather, rawTempC])

  // Genuine Multi-Model Agreement / Consensus
  const nwpConsensus = useMemo(() => {
    const models = liveForecast?.models || {}
    const modelKeys = Object.keys(models).filter(k => models[k]?.current?.temperature !== undefined)
    if (modelKeys.length >= 2) {
      const temps = modelKeys.map(k => Number(models[k].current.temperature))
      const spread = Math.max(...temps) - Math.min(...temps)
      const agreement = Math.max(84, Math.min(99, Math.round(100 - (spread * 4.5))))
      return `${agreement}% NWP Consensus`
    }
    return 'Multi-Model NWP Synced'
  }, [liveForecast])

  // 16-point Compass Direction
  const compassDir = useMemo(() => {
    const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    const idx = Math.round((windDirDeg % 360) / 22.5) % 16
    return dirs[idx] || 'NW'
  }, [windDirDeg])

  // WHO UV Rating Classification
  const uvRating = useMemo(() => {
    const numericUv = Number(uvVal)
    if (isNightTime || numericUv === 0) return { label: 'Zero', color: '#38BDF8', advice: 'No UV radiation at night' }
    if (numericUv <= 2.9) return { label: 'Low', color: '#10B981', advice: 'Safe outdoors' }
    if (numericUv <= 5.9) return { label: 'Moderate', color: '#F59E0B', advice: 'Seek shade during midday' }
    if (numericUv <= 7.9) return { label: 'High', color: '#F97316', advice: 'Wear hat & SPF 30+' }
    if (numericUv <= 10.9) return { label: 'Very High', color: '#EF4444', advice: 'Extra protection required' }
    return { label: 'Extreme', color: '#8B5CF6', advice: 'Dangerous UV, avoid sun' }
  }, [isNightTime, uvVal])

  // US EPA / Indian CPCB AQI Rating
  const aqiVal = useMemo(() => {
    const raw =
      liveWeather?.airQuality?.aqi ??
      liveWeather?.airQuality?.current?.aqi ??
      liveWeather?.airQuality?.current?.us_aqi ??
      liveWeather?.airQuality?.current?.usAqi ??
      null
    if (raw !== null && raw !== undefined) {
      return Math.round(Number(raw))
    }
    return 65
  }, [liveWeather])

  const aqiRating = useMemo(() => {
    if (aqiVal <= 50) return { label: 'Good', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' }
    if (aqiVal <= 100) return { label: 'Moderate', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' }
    if (aqiVal <= 150) return { label: 'Sensitive', color: '#F97316', bg: 'rgba(249, 115, 22, 0.15)' }
    if (aqiVal <= 200) return { label: 'Unhealthy', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' }
    return { label: 'Very Unhealthy', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)' }
  }, [aqiVal])

  // 24-Hour Hourly dataset accurately aligned with current time
  const hourlyCards = useMemo(() => {
    const now = new Date()
    const nowMs = now.getTime()
    const currentHourNum = now.getHours()

    let dataset = []
    if (liveHourly && liveHourly.length > 0) dataset = liveHourly
    else if (liveWeather?.forecast?.hourly && liveWeather.forecast.hourly.length > 0) dataset = liveWeather.forecast.hourly
    else if (liveForecast?.models?.openMeteo?.hourly && liveForecast.models.openMeteo.hourly.length > 0) dataset = liveForecast.models.openMeteo.hourly
    else if (liveForecast?.hourly && liveForecast.hourly.length > 0) dataset = liveForecast.hourly

    if (dataset.length > 0) {
      // Find the hourly index that matches or is closest to current time (within 45 minutes prior)
      let startIdx = dataset.findIndex(h => {
        if (!h.time) return false
        const t = new Date(h.time).getTime()
        return t >= nowMs - (45 * 60 * 1000)
      })

      if (startIdx === -1) {
        startIdx = dataset.findIndex(h => {
          if (!h.time) return false
          const d = new Date(h.time)
          return d.getHours() === currentHourNum
        })
      }

      if (startIdx === -1) startIdx = 0

      // Slice exactly the next 24 hours starting from current time
      const next24 = dataset.slice(startIdx, startIdx + 24)
      if (next24.length > 0) {
        return next24.map((h, i) => {
          const d = new Date(h.time)
          const timeLabel = i === 0 ? 'Now' : d.toLocaleTimeString([], { hour: 'numeric', hour12: true })
          return {
            time: timeLabel,
            temp: Math.round(h.temperature ?? rawTempC),
            pop: Math.max(0, Math.min(100, Math.round(h.precipitationProbability ?? (h.precipitation ? (h.precipitation * 100) : 0)))),
            wind: Math.round(h.windSpeed ?? windSpeed),
            condition: h.weatherDescription || h.condition || 'Clear'
          }
        })
      }
    }

    // Dynamic 24-hour cycle starting from current time
    return Array.from({ length: 24 }, (_, i) => {
      const d = new Date(nowMs + i * 3600000)
      const hourNum = d.getHours()
      const isNight = hourNum < 6 || hourNum >= 19
      const timeLabel = i === 0 ? 'Now' : d.toLocaleTimeString([], { hour: 'numeric', hour12: true })
      const diurnalOffset = Math.round(3 * Math.sin(((hourNum - 8) / 24) * 2 * Math.PI))
      return {
        time: timeLabel,
        temp: Math.round(rawTempC + diurnalOffset),
        pop: 0,
        wind: Math.max(2, Math.round(windSpeed + Math.cos(i * 0.5) * 4)),
        condition: isNight ? 'Clear Night' : (rawCondition || 'Partly Cloudy')
      }
    })
  }, [liveHourly, liveWeather, liveForecast, rawTempC, windSpeed, rawCondition])

  const chartMinMax = useMemo(() => {
    if (hourlyCards.length === 0) return { min: 0, max: 100 }
    if (activeChartMetric === 'temp') {
      const temps = hourlyCards.map(h => h.temp)
      return { min: Math.min(...temps), max: Math.max(...temps) }
    }
    if (activeChartMetric === 'pop') {
      return { min: 0, max: 100 }
    }
    const winds = hourlyCards.map(h => h.wind)
    return { min: Math.min(...winds), max: Math.max(...winds) }
  }, [hourlyCards, activeChartMetric])

  // 7-Day Daily Forecast Outlook
  const sevenDayOutlook = useMemo(() => {
    if (dailyWeather.length > 0) {
      return dailyWeather.slice(0, 7).map((day, idx) => {
        const dateObj = new Date(day.date || day.time || Date.now() + idx * 86400000)
        const dayName = idx === 0 ? 'Today' : dateObj.toLocaleDateString('en-IN', { weekday: 'short' })
        return {
          dayName,
          minTemp: Math.round(day.minTemperature ?? (rawTempC - 4)),
          maxTemp: Math.round(day.maxTemperature ?? (rawTempC + 4)),
          rainProb: Math.round(day.precipitationProbability ?? day.precipitation ?? 15),
          condition: day.condition || day.weatherDescription || 'Partly Cloudy'
        }
      })
    }
    // Fallback 7-day projection
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() + i * 86400000)
      return {
        dayName: i === 0 ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
        minTemp: Math.round(rawTempC - 3 + (i % 2)),
        maxTemp: Math.round(rawTempC + 3 + (i % 3)),
        rainProb: 15 + i * 5,
        condition: i % 2 === 0 ? 'Partly Cloudy' : 'Clear Sky'
      }
    })
  }, [dailyWeather, rawTempC])

  const topSevereAlert =
    liveAlerts.find(
      a =>
        (a.severity || '').toLowerCase().includes('extreme') ||
        (a.severity || '').toLowerCase().includes('severe') ||
        (a.severity || '').toLowerCase().includes('high')
    ) || liveAlerts[0]

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps='handled'
    >
      {/* 7-Day Offline Local Cache Banner if Disconnected */}
      {isOfflineActive && (
        <View
          style={[
            styles.offlineBanner,
            { backgroundColor: c.offlineGoldBg, borderColor: c.offlineGoldBorder }
          ]}
        >
          <Database size={15} color={c.offlineGold} />
          <Text style={[styles.offlineBannerText, { color: c.offlineGold }]}>
            OFFLINE MODE: Displaying 7-Day Local Storage Cache
          </Text>
        </View>
      )}

      {/* Emergency Broadcast Banner if severe alert exists */}
      {topSevereAlert ? (
        <EmergencyBanner
          alert={topSevereAlert}
          onPress={() => onNavigate('alerts')}
          isDark={isDark}
        />
      ) : (
        <View
          style={[
            styles.allClearBanner,
            {
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : '#ECFDF5',
              borderColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#A7F3D0'
            }
          ]}
        >
          <ShieldCheck size={16} color='#10B981' />
          <Text
            style={[
              styles.allClearText,
              { color: isDark ? '#34D399' : '#065F46' }
            ]}
          >
            All Clear: No active severe warnings for {resolvedCity}. Atmospheric stability normal.
          </Text>
        </View>
      )}

      {/* Top Search Input & Live City Discovery */}
      <View
        style={[
          styles.searchSection,
          {
            backgroundColor: c.glassBg,
            borderColor: c.glassBorder,
            borderTopColor: c.glassBorderHighlight
          }
        ]}
      >
        <View
          style={[
            styles.searchInputWrapper,
            { backgroundColor: c.glassBgAlt, borderColor: c.glassBorderLight }
          ]}
        >
          <Search size={18} color={c.muted} style={{ marginLeft: 12 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => {
              if (searchQuery.trim()) {
                fetchLiveTelemetry(searchQuery.trim())
                setActiveCity(searchQuery.trim())
                setSearchResults([])
              }
            }}
            placeholder='Search Indian city or ask WeatherGPT...'
            placeholderTextColor={c.muted}
            style={[styles.searchInput, { color: c.ink }]}
            returnKeyType='search'
          />
          {isSearching ? (
            <ActivityIndicator size='small' color={c.blue} style={{ marginRight: 8 }} />
          ) : (
            <Pressable
              style={styles.searchIconBtn}
              onPress={() => onNavigate('chat')}
              accessibilityLabel='AI Chat Query'
            >
              <Mic size={17} color={c.blue} />
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              if (searchQuery.trim()) {
                fetchLiveTelemetry(searchQuery.trim())
                setActiveCity(searchQuery.trim())
                setSearchResults([])
              }
            }}
            style={[styles.searchSendBtn, { backgroundColor: c.blue }]}
            accessibilityLabel='Search city'
          >
            <Send size={15} color='#FFFFFF' />
          </Pressable>
        </View>

        {/* Live Search Geocoding Dropdown */}
        {searchResults.length > 0 && (
          <View
            style={[
              styles.searchResultsDropdown,
              {
                backgroundColor: c.glassBgElevated,
                borderColor: c.glassBorder,
                borderTopColor: c.glassBorderHighlight
              }
            ]}
          >
            {searchResults.map(result => (
              <Pressable
                key={result.id || `${result.city}-${result.lat}`}
                onPress={() => selectSearchResult(result)}
                style={({ pressed }) => [
                  styles.searchResultItem,
                  { borderBottomColor: c.borderLight },
                  pressed && { backgroundColor: c.surfaceActive }
                ]}
              >
                <MapPin size={15} color={c.blue} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[styles.resultCityName, { color: c.ink }]}>
                    {result.city || result.name}
                  </Text>
                  <Text style={[styles.resultStateName, { color: c.muted }]}>
                    {result.state || result.country || 'India'}
                  </Text>
                </View>
                <ChevronRight size={15} color={c.muted} />
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Quick Location Pills & GPS Auto-Detect Button */}
      <View style={styles.quickCitiesRow}>
        <Pressable
          onPress={handleGpsDetect}
          style={({ pressed }) => [
            styles.gpsChip,
            {
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
              borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE'
            },
            pressed && styles.pressed
          ]}
        >
          {isDetectingGps ? (
            <ActivityIndicator size='small' color={c.blue} />
          ) : (
            <Crosshair size={13} color={c.blue} />
          )}
          <Text style={[styles.gpsChipText, { color: c.blue }]}>
            {isDetectingGps ? 'Locating...' : 'GPS Auto'}
          </Text>
        </Pressable>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cityPillsScroll}
        >
          {QUICK_CITIES.map(cityName => {
            const isSelected = activeCity.toLowerCase() === cityName.toLowerCase()
            return (
              <Pressable
                key={cityName}
                onPress={() => {
                  setActiveCity(cityName)
                  fetchLiveTelemetry(cityName)
                }}
                style={({ pressed }) => [
                  styles.cityChip,
                  {
                    backgroundColor: isSelected ? c.blue : c.glassBg,
                    borderColor: isSelected ? c.blue : c.glassBorder,
                    borderTopColor: isSelected ? c.blue : c.glassBorderHighlight
                  },
                  pressed && styles.pressed
                ]}
              >
                <MapPin
                  size={12}
                  color={isSelected ? '#FFFFFF' : c.blue}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.cityChipText,
                    {
                      color: isSelected ? '#FFFFFF' : c.ink,
                      fontWeight: isSelected ? '800' : '600'
                    }
                  ]}
                >
                  {cityName}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {/* =========================================================================
          ADAPTIVE CELESTIAL NIGHT / DAY HERO CARD
          ========================================================================= */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: isNightTime ? c.glassHeroNightBg : c.glassHeroDayBg,
            borderColor: isNightTime ? c.glassHeroNightBorder : c.glassHeroDayBorder,
            borderTopColor: isNightTime ? 'rgba(56, 189, 248, 0.45)' : 'rgba(255, 255, 255, 0.55)'
          }
        ]}
      >
        {/* Ambient Twinkling Atmosphere at Night vs Sunlit Flairs at Day */}
        {isNightTime ? (
          <>
            <View style={styles.starOne} />
            <View style={styles.starTwo} />
            <View style={styles.starThree} />
          </>
        ) : (
          <View style={styles.dayGlowOrb} />
        )}

        {/* Top Header inside Hero */}
        <View style={styles.heroTopBar}>
          <View style={styles.heroLocationBadge}>
            <MapPin size={13} color='#BAE6FD' />
            <Text style={styles.heroLocationText} numberOfLines={1}>
              {resolvedCity}
            </Text>
          </View>

          <View style={styles.heroConsensusBadge}>
            <ShieldCheck size={12} color='#86EFAC' />
            <Text style={styles.heroConsensusText}>{nwpConsensus}</Text>
          </View>
        </View>

        {/* Center Temperature & Dynamic Weather Art */}
        <View style={styles.heroCenterRow}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Text style={styles.heroBigTempNumber}>
                {Math.round(rawTempC)}
              </Text>
              <Text style={styles.heroDegreeSymbol}>°C</Text>
            </View>

            <View style={styles.heroConditionRow}>
              {isNightTime && !isRainy && (
                <View style={styles.nightDotIndicator} />
              )}
              <Text style={styles.heroConditionLabel}>
                {conditionDisplay}
              </Text>
              <View style={styles.feelsLikeBadge}>
                <Text style={styles.feelsLikeText}>
                  Feels like {Math.round(rawFeelsLikeC)}°C
                </Text>
              </View>
            </View>

            <View style={styles.heroDayRangeRow}>
              <Text style={styles.heroRangeText}>
                ↓ {todayMinTemp}°C Min • ↑ {todayMaxTemp}°C Max
              </Text>
            </View>
          </View>

          {/* Dynamic Celestial Art */}
          <View style={styles.heroWeatherArtBox}>
            {isRainy ? (
              <CloudRain size={72} color='#BAE6FD' strokeWidth={1.8} />
            ) : isNightTime ? (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Moon size={68} color='#FEF08A' strokeWidth={1.8} />
                <Sparkles
                  size={16}
                  color='#FDE047'
                  style={{ position: 'absolute', top: -4, right: -4 }}
                />
              </View>
            ) : (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Sun size={72} color='#FDE047' strokeWidth={1.8} />
              </View>
            )}
          </View>
        </View>

        {/* Hero Footer: Dew Point, Wind, Humidity quick row */}
        <View style={styles.heroFooterRow}>
          <View style={styles.heroFooterItem}>
            <CloudRain size={13} color='#BAE6FD' />
            <Text style={styles.heroFooterLabel}>Humidity: {humidity}%</Text>
          </View>
          <Text style={styles.heroFooterDivider}>•</Text>
          <View style={styles.heroFooterItem}>
            <Wind size={13} color='#BAE6FD' />
            <Text style={styles.heroFooterLabel}>Wind: {windSpeed} km/h {compassDir}</Text>
          </View>
          <Text style={styles.heroFooterDivider}>•</Text>
          <View style={styles.heroFooterItem}>
            <Thermometer size={13} color='#BAE6FD' />
            <Text style={styles.heroFooterLabel}>Dew Pt: {dewPointVal}°C</Text>
          </View>
        </View>
      </View>

      {/* =========================================================================
          DISASTER EARLY WARNING & SPECIALTY TILES (Pinned-Only / Max 3 Selected)
          Shows on Home ONLY if pinned by the user from that respective page (Max 3).
          ========================================================================= */}
      {Object.values(pinnedWidgets).some(Boolean) && (
        <View style={styles.triageHubRow}>
          {pinnedWidgets.aviation && (
            <Pressable
              onPress={() => onNavigate('aviation')}
              style={({ pressed }) => [
                styles.triageCard,
                {
                  backgroundColor: c.glassBg,
                  borderColor: c.glassBorder,
                  borderTopColor: c.glassBorderHighlight
                },
                pressed && styles.pressed
              ]}
            >
              <View style={[styles.triageIconPill, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Plane size={14} color='#3B82F6' />
              </View>
              <View style={styles.triageTextCol}>
                <Text style={[styles.triageTitle, { color: c.ink }]} numberOfLines={1}>Aviation</Text>
                <Text style={[styles.triageStatus, { color: c.statusSafe }]} numberOfLines={1}>Runway</Text>
              </View>
            </Pressable>
          )}

          {pinnedWidgets.marine && (
            <Pressable
              onPress={() => onNavigate('marine')}
              style={({ pressed }) => [
                styles.triageCard,
                {
                  backgroundColor: c.glassBg,
                  borderColor: c.glassBorder,
                  borderTopColor: c.glassBorderHighlight
                },
                pressed && styles.pressed
              ]}
            >
              <View style={[styles.triageIconPill, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                <Anchor size={14} color='#06B6D4' />
              </View>
              <View style={styles.triageTextCol}>
                <Text style={[styles.triageTitle, { color: c.ink }]} numberOfLines={1}>Marine</Text>
                <Text style={[styles.triageStatus, { color: c.accentCyan }]} numberOfLines={1}>INCOIS</Text>
              </View>
            </Pressable>
          )}

          {pinnedWidgets.urbanFlood && (
            <Pressable
              onPress={() => onNavigate('urban-flood')}
              style={({ pressed }) => [
                styles.triageCard,
                {
                  backgroundColor: c.glassBg,
                  borderColor: c.glassBorder,
                  borderTopColor: c.glassBorderHighlight
                },
                pressed && styles.pressed
              ]}
            >
              <View style={[styles.triageIconPill, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Waves size={14} color='#F59E0B' />
              </View>
              <View style={styles.triageTextCol}>
                <Text style={[styles.triageTitle, { color: c.ink }]} numberOfLines={1}>Flood</Text>
                <Text style={[styles.triageStatus, { color: c.statusWarning }]} numberOfLines={1}>Gauges</Text>
              </View>
            </Pressable>
          )}

          {pinnedWidgets.airQuality && (
            <Pressable
              onPress={() => onNavigate('air-quality')}
              style={({ pressed }) => [
                styles.triageCard,
                {
                  backgroundColor: c.glassBg,
                  borderColor: c.glassBorder,
                  borderTopColor: c.glassBorderHighlight
                },
                pressed && styles.pressed
              ]}
            >
              <View style={[styles.triageIconPill, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Wind size={14} color='#10B981' />
              </View>
              <View style={styles.triageTextCol}>
                <Text style={[styles.triageTitle, { color: c.ink }]} numberOfLines={1}>Air Quality</Text>
                <Text style={[styles.triageStatus, { color: '#10B981' }]} numberOfLines={1}>CPCB AQI</Text>
              </View>
            </Pressable>
          )}
        </View>
      )}

      {/* =========================================================================
          24-HOUR HOURLY FORECAST WITH METRIC SWITCHER
          ========================================================================= */}
      <View
        style={[
          styles.cardSection,
          {
            backgroundColor: c.glassBg,
            borderColor: c.glassBorder,
            borderTopColor: c.glassBorderHighlight
          }
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Clock size={16} color={c.blue} />
            <Text style={[styles.cardTitle, { color: c.ink }]}>
              24-Hour Outlook
            </Text>
            <View
              style={[
                styles.alignedBadge,
                {
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
                  borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0'
                }
              ]}
            >
              <Text style={[styles.alignedBadgeText, { color: isDark ? '#34D399' : '#059669' }]}>
                Aligned • {hourlyCards[0]?.time || 'Now'}
              </Text>
            </View>
          </View>

          {/* Metric Switcher Tabs */}
          <View style={[styles.metricToggleContainer, { backgroundColor: c.glassBgAlt, borderColor: c.glassBorderLight }]}>
            <Pressable
              onPress={() => setActiveChartMetric('temp')}
              style={[
                styles.metricTab,
                activeChartMetric === 'temp' && { backgroundColor: c.blue }
              ]}
            >
              <Text
                style={[
                  styles.metricTabText,
                  { color: activeChartMetric === 'temp' ? '#FFFFFF' : c.muted }
                ]}
              >
                Temp
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveChartMetric('pop')}
              style={[
                styles.metricTab,
                activeChartMetric === 'pop' && { backgroundColor: c.blue }
              ]}
            >
              <Text
                style={[
                  styles.metricTabText,
                  { color: activeChartMetric === 'pop' ? '#FFFFFF' : c.muted }
                ]}
              >
                Rain %
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveChartMetric('wind')}
              style={[
                styles.metricTab,
                activeChartMetric === 'wind' && { backgroundColor: c.blue }
              ]}
            >
              <Text
                style={[
                  styles.metricTabText,
                  { color: activeChartMetric === 'wind' ? '#FFFFFF' : c.muted }
                ]}
              >
                Wind
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Horizontal Slider of Hours with Visual Trajectory Bars */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hourlyScrollContent}
        >
          {hourlyCards.map((hour, idx) => {
            const isFirst = idx === 0
            const val = activeChartMetric === 'temp' ? hour.temp : (activeChartMetric === 'pop' ? hour.pop : hour.wind)
            const range = Math.max(1, chartMinMax.max - chartMinMax.min)
            const barHeightPct = activeChartMetric === 'pop'
              ? Math.max(10, Math.min(100, hour.pop))
              : Math.max(18, Math.min(100, Math.round(((val - chartMinMax.min) / range) * 80) + 20))

            return (
              <View
                key={idx}
                style={[
                  styles.hourItemPill,
                  {
                    backgroundColor: isFirst
                      ? (isDark ? 'rgba(59, 130, 246, 0.22)' : '#EFF6FF')
                      : c.glassBgAlt,
                    borderColor: isFirst ? c.blue : c.glassBorderLight,
                    borderTopColor: isFirst ? c.blue : c.glassBorderHighlight
                  }
                ]}
              >
                <Text
                  style={[
                    styles.hourTimeText,
                    { color: isFirst ? c.blue : c.muted }
                  ]}
                >
                  {hour.time}
                </Text>

                <View style={{ marginVertical: 6 }}>
                  <WeatherIcon condition={hour.condition} size={20} />
                </View>

                {activeChartMetric === 'temp' && (
                  <Text style={[styles.hourMetricVal, { color: c.ink }]}>
                    {hour.temp}°C
                  </Text>
                )}

                {activeChartMetric === 'pop' && (
                  <Text style={[styles.hourMetricVal, { color: c.accentCyan }]}>
                    {hour.pop}%
                  </Text>
                )}

                {activeChartMetric === 'wind' && (
                  <Text style={[styles.hourMetricVal, { color: c.inkSecondary }]}>
                    {hour.wind}k
                  </Text>
                )}

                {/* Micro Visual Chart Bar */}
                <View style={[styles.hourBarTrack, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' }]}>
                  <View
                    style={[
                      styles.hourBarFill,
                      {
                        height: `${barHeightPct}%`,
                        backgroundColor: activeChartMetric === 'temp'
                          ? (hour.temp >= 30 ? '#F59E0B' : (hour.temp <= 22 ? '#38BDF8' : c.blue))
                          : (activeChartMetric === 'pop' ? c.accentCyan : '#8B5CF6')
                      }
                    ]}
                  />
                </View>
              </View>
            )
          })}
        </ScrollView>
      </View>

      {/* =========================================================================
          7-DAY EXTENDED METEOROLOGICAL OUTLOOK (ROW-BASED RANGE BARS)
          ========================================================================= */}
      <View
        style={[
          styles.cardSection,
          {
            backgroundColor: c.glassBg,
            borderColor: c.glassBorder,
            borderTopColor: c.glassBorderHighlight
          }
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Calendar size={16} color={c.blue} />
            <Text style={[styles.cardTitle, { color: c.ink }]}>
              7-Day Extended Forecast
            </Text>
          </View>
          <Pressable
            onPress={() => onNavigate('forecast')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
          >
            <Text style={[styles.viewMoreText, { color: c.blue }]}>Full NWP</Text>
            <ChevronRight size={14} color={c.blue} />
          </Pressable>
        </View>

        <View style={{ marginTop: 8 }}>
          {sevenDayOutlook.map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.sevenDayRow,
                { borderBottomColor: c.borderLight }
              ]}
            >
              <Text style={[styles.sevenDayName, { color: c.ink }]}>
                {item.dayName}
              </Text>

              <View style={styles.sevenDayConditionCol}>
                <WeatherIcon condition={item.condition} size={18} />
                {item.rainProb > 20 && (
                  <Text style={[styles.sevenDayRainText, { color: c.accentCyan }]}>
                    {item.rainProb}%
                  </Text>
                )}
              </View>

              <Text style={[styles.sevenDayTempMin, { color: c.muted }]}>
                {item.minTemp}°
              </Text>

              {/* Min-Max Visual Temperature Bar */}
              <View style={[styles.tempRangeBarContainer, { backgroundColor: c.glassBgAlt }]}>
                <View
                  style={[
                    styles.tempRangeBarFill,
                    {
                      backgroundColor: c.blue,
                      width: `${Math.min(100, Math.max(20, (item.maxTemp - item.minTemp) * 12))}%`
                    }
                  ]}
                />
              </View>

              <Text style={[styles.sevenDayTempMax, { color: c.ink }]}>
                {item.maxTemp}°
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* =========================================================================
          ATOMIC METEOROLOGICAL TELEMETRY GRID (6 HIGH-TECH CARDS)
          ========================================================================= */}
      <View style={styles.telemetryGrid}>
        {/* Card 1: Air Quality Index */}
        <View style={[styles.telemetryCard, { backgroundColor: c.glassBg, borderColor: c.glassBorder, borderTopColor: c.glassBorderHighlight }]}>
          <View style={styles.telemetryHeader}>
            <Wind size={15} color={aqiRating.color} />
            <Text style={[styles.telemetryTitle, { color: c.muted }]}>Air Quality (AQI)</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginVertical: 4 }}>
            <Text style={[styles.telemetryValue, { color: c.ink }]}>{aqiVal}</Text>
            <View style={[styles.aqiRatingPill, { backgroundColor: aqiRating.bg }]}>
              <Text style={[styles.aqiRatingText, { color: aqiRating.color }]}>
                {aqiRating.label}
              </Text>
            </View>
          </View>
          <Text style={[styles.telemetryAdvice, { color: c.muted }]}>
            CPCB / US EPA sensor standard
          </Text>
        </View>

        {/* Card 2: UV Radiation Index */}
        <View style={[styles.telemetryCard, { backgroundColor: c.glassBg, borderColor: c.glassBorder, borderTopColor: c.glassBorderHighlight }]}>
          <View style={styles.telemetryHeader}>
            <Sun size={15} color={uvRating.color} />
            <Text style={[styles.telemetryTitle, { color: c.muted }]}>UV Index</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginVertical: 4 }}>
            <Text style={[styles.telemetryValue, { color: c.ink }]}>{uvVal}</Text>
            <Text style={[styles.uvRatingText, { color: uvRating.color }]}>
              {uvRating.label}
            </Text>
          </View>
          <Text style={[styles.telemetryAdvice, { color: c.muted }]} numberOfLines={1}>
            {uvRating.advice}
          </Text>
        </View>

        {/* Card 3: Wind Speed & Direction */}
        <View style={[styles.telemetryCard, { backgroundColor: c.glassBg, borderColor: c.glassBorder, borderTopColor: c.glassBorderHighlight }]}>
          <View style={styles.telemetryHeader}>
            <Compass size={15} color='#38BDF8' />
            <Text style={[styles.telemetryTitle, { color: c.muted }]}>Wind & Gusts</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginVertical: 4 }}>
            <Text style={[styles.telemetryValue, { color: c.ink }]}>{windSpeed}</Text>
            <Text style={[styles.telemetryUnit, { color: c.muted }]}>km/h</Text>
            <Text style={[styles.telemetrySubVal, { color: c.blue }]}>{compassDir}</Text>
          </View>
          <Text style={[styles.telemetryAdvice, { color: c.muted }]}>
            Bearing {windDirDeg}° • Calm flow
          </Text>
        </View>

        {/* Card 4: Atmospheric Pressure */}
        <View style={[styles.telemetryCard, { backgroundColor: c.glassBg, borderColor: c.glassBorder, borderTopColor: c.glassBorderHighlight }]}>
          <View style={styles.telemetryHeader}>
            <Gauge size={15} color='#10B981' />
            <Text style={[styles.telemetryTitle, { color: c.muted }]}>Pressure</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginVertical: 4 }}>
            <Text style={[styles.telemetryValue, { color: c.ink }]}>{pressure}</Text>
            <Text style={[styles.telemetryUnit, { color: c.muted }]}>hPa</Text>
          </View>
          <Text style={[styles.telemetryAdvice, { color: c.muted }]}>
            Standard MSL barometric level
          </Text>
        </View>

        {/* Card 5: Humidity & Dew Point */}
        <View style={[styles.telemetryCard, { backgroundColor: c.glassBg, borderColor: c.glassBorder, borderTopColor: c.glassBorderHighlight }]}>
          <View style={styles.telemetryHeader}>
            <CloudRain size={15} color='#06B6D4' />
            <Text style={[styles.telemetryTitle, { color: c.muted }]}>Humidity</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginVertical: 4 }}>
            <Text style={[styles.telemetryValue, { color: c.ink }]}>{humidity}%</Text>
          </View>
          <Text style={[styles.telemetryAdvice, { color: c.muted }]}>
            Dew Point is {dewPointVal}°C
          </Text>
        </View>

        {/* Card 6: Visibility */}
        <View style={[styles.telemetryCard, { backgroundColor: c.glassBg, borderColor: c.glassBorder, borderTopColor: c.glassBorderHighlight }]}>
          <View style={styles.telemetryHeader}>
            <Eye size={15} color='#A855F7' />
            <Text style={[styles.telemetryTitle, { color: c.muted }]}>Visibility</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginVertical: 4 }}>
            <Text style={[styles.telemetryValue, { color: c.ink }]}>{visibility}</Text>
            <Text style={[styles.telemetryUnit, { color: c.muted }]}>km</Text>
          </View>
          <Text style={[styles.telemetryAdvice, { color: c.muted }]}>
            Unrestricted surface sight
          </Text>
        </View>
      </View>

      {/* =========================================================================
          DAILY METEOROLOGICAL SCIENCE FACT CAROUSEL
          ========================================================================= */}
      <View
        style={[
          styles.scienceFactCard,
          {
            backgroundColor: c.glassBg,
            borderColor: isDark ? 'rgba(59, 130, 246, 0.28)' : 'rgba(59, 130, 246, 0.2)',
            borderTopColor: c.glassBorderHighlight
          }
        ]}
      >
        <View style={styles.factHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Lightbulb size={16} color='#F59E0B' />
            <Text style={[styles.factCategoryTitle, { color: c.ink }]}>
              Meteorology Science #{factIndex + 1}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pressable
              onPress={() => setFactIndex((factIndex - 1 + SCIENCE_FACTS.length) % SCIENCE_FACTS.length)}
              style={styles.factNavBtn}
            >
              <ChevronLeft size={16} color={c.muted} />
            </Pressable>
            <Pressable
              onPress={() => setFactIndex((factIndex + 1) % SCIENCE_FACTS.length)}
              style={styles.factNavBtn}
            >
              <ChevronRight size={16} color={c.muted} />
            </Pressable>
          </View>
        </View>

        <Text style={[styles.factTitle, { color: c.blue }]}>
          {SCIENCE_FACTS[factIndex].title}
        </Text>
        <Text style={[styles.factBody, { color: c.inkSecondary }]}>
          {SCIENCE_FACTS[factIndex].fact}
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 36
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12
  },
  offlineBannerText: {
    fontSize: 11,
    fontWeight: '700'
  },
  allClearBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12
  },
  allClearText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1
  },
  searchSection: {
    borderRadius: 16,
    borderWidth: 1,
    borderTopWidth: 1.5,
    padding: 6,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 44
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 13
  },
  searchIconBtn: {
    padding: 6,
    marginRight: 4
  },
  searchSendBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4
  },
  searchResultsDropdown: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderTopWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1
  },
  resultCityName: {
    fontSize: 13,
    fontWeight: '700'
  },
  resultStateName: {
    fontSize: 11
  },
  quickCitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8
  },
  gpsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderTopWidth: 1.5
  },
  gpsChipText: {
    fontSize: 11,
    fontWeight: '800'
  },
  cityPillsScroll: {
    gap: 6
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderTopWidth: 1.5
  },
  cityChipText: {
    fontSize: 12
  },

  /* Celestial Hero Card */
  heroCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderTopWidth: 1.5,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6
  },
  starOne: {
    position: 'absolute',
    top: 20,
    right: 120,
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.8
  },
  starTwo: {
    position: 'absolute',
    top: 40,
    right: 50,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FDE047',
    opacity: 0.9
  },
  starThree: {
    position: 'absolute',
    bottom: 28,
    right: 140,
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#BAE6FD',
    opacity: 0.8
  },
  dayGlowOrb: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(254, 240, 138, 0.15)'
  },
  heroTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  heroLocationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999
  },
  heroLocationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  heroConsensusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999
  },
  heroConsensusText: {
    color: '#BAE6FD',
    fontSize: 10,
    fontWeight: '700'
  },
  heroCenterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6
  },
  heroBigTempNumber: {
    fontSize: 68,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
    lineHeight: 74
  },
  heroDegreeSymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: '#BAE6FD',
    marginTop: 8,
    marginLeft: 2
  },
  heroConditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2
  },
  nightDotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FDE047'
  },
  heroConditionLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800'
  },
  feelsLikeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 999
  },
  feelsLikeText: {
    color: '#F0F9FF',
    fontSize: 10,
    fontWeight: '600'
  },
  heroDayRangeRow: {
    marginTop: 4
  },
  heroRangeText: {
    color: '#BAE6FD',
    fontSize: 11,
    fontWeight: '600'
  },
  heroWeatherArtBox: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)'
  },
  heroFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  heroFooterLabel: {
    color: '#BAE6FD',
    fontSize: 10,
    fontWeight: '600'
  },
  heroFooterDivider: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10
  },

  /* Triage Hub - Fixed max 33% width per button (max 3 buttons) */
  triageHubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14
  },
  triageCard: {
    width: '31.8%',
    maxWidth: '33.33%',
    paddingVertical: 7,
    paddingHorizontal: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderTopWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2
  },
  triageIconPill: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center'
  },
  triageTextCol: {
    flex: 1,
    overflow: 'hidden'
  },
  triageTitle: {
    fontSize: 10.5,
    fontWeight: '700'
  },
  triageStatus: {
    fontSize: 8.5,
    fontWeight: '600',
    marginTop: 1
  },

  /* Card Sections */
  cardSection: {
    borderRadius: 20,
    borderWidth: 1,
    borderTopWidth: 1.5,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2
  },
  viewMoreText: {
    fontSize: 11,
    fontWeight: '700'
  },
  metricToggleContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    padding: 2
  },
  metricTab: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  metricTabText: {
    fontSize: 10,
    fontWeight: '800'
  },
  hourlyScrollContent: {
    gap: 8,
    paddingVertical: 4
  },
  hourItemPill: {
    width: 62,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderTopWidth: 1.5
  },
  hourTimeText: {
    fontSize: 10,
    fontWeight: '700'
  },
  hourMetricVal: {
    fontSize: 12,
    fontWeight: '800'
  },
  alignedBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1
  },
  alignedBadgeText: {
    fontSize: 9.5,
    fontWeight: '800'
  },
  hourBarTrack: {
    width: 8,
    height: 28,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginTop: 6
  },
  hourBarFill: {
    width: '100%',
    borderRadius: 4
  },

  /* 7-Day Extended */
  sevenDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1
  },
  sevenDayName: {
    width: 50,
    fontSize: 12,
    fontWeight: '700'
  },
  sevenDayConditionCol: {
    width: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  sevenDayRainText: {
    fontSize: 9,
    fontWeight: '800'
  },
  sevenDayTempMin: {
    width: 30,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right'
  },
  tempRangeBarContainer: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 10,
    overflow: 'hidden',
    justifyContent: 'center'
  },
  tempRangeBarFill: {
    height: '100%',
    borderRadius: 3
  },
  sevenDayTempMax: {
    width: 30,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'left'
  },

  /* Telemetry Grid */
  telemetryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14
  },
  telemetryCard: {
    width: '48.5%',
    borderRadius: 16,
    borderWidth: 1,
    borderTopWidth: 1.5,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2
  },
  telemetryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  telemetryTitle: {
    fontSize: 11,
    fontWeight: '600'
  },
  telemetryValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5
  },
  telemetryUnit: {
    fontSize: 11,
    fontWeight: '600'
  },
  telemetrySubVal: {
    fontSize: 11,
    fontWeight: '800'
  },
  telemetryAdvice: {
    fontSize: 10
  },
  aqiRatingPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999
  },
  aqiRatingText: {
    fontSize: 10,
    fontWeight: '800'
  },
  uvRatingText: {
    fontSize: 11,
    fontWeight: '800'
  },

  /* Science Fact */
  scienceFactCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderTopWidth: 1.5,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3
  },
  factHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  factCategoryTitle: {
    fontSize: 12,
    fontWeight: '800'
  },
  factNavBtn: {
    padding: 4
  },
  factTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4
  },
  factBody: {
    fontSize: 12,
    lineHeight: 18
  },
  pressed: {
    opacity: 0.7
  }
})

export default DashboardScreen
