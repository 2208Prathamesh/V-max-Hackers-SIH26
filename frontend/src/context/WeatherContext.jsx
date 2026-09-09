import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef
} from 'react'
import {
  DEFAULT_SETTINGS,
  DEFAULT_USER_STATS,
  DEFAULT_LOCATION
} from '../config/defaults'
import { api } from '../services/api'
import {
  weatherCache,
  alertCache,
  offlineManager,
  getAlertScopeKey
} from '../services/offline'

const WeatherContext = createContext()

const normalizeUser = user => ({
  ...user,
  stats: {
    ...DEFAULT_USER_STATS,
    ...(user?.stats || {})
  }
})

export const WeatherProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('weathergpt_token') !== null
  })

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('weathergpt_user')
    try {
      return saved ? normalizeUser(JSON.parse(saved)) : null
    } catch {
      return null
    }
  })

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('weathergpt_settings')
    try {
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  const [savedLocations, setSavedLocations] = useState(() => {
    const saved = localStorage.getItem('weathergpt_saved_locations')
    try {
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('weathergpt_conversations')
    try {
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [activeConversationId, setActiveConversationId] = useState(null)
  const [isSending, setIsSending] = useState(false)
  const [selectedMapLocation, setSelectedMapLocation] = useState(() => {
    const saved = localStorage.getItem('weathergpt_selected_location')
    try {
      return saved ? JSON.parse(saved) : DEFAULT_LOCATION
    } catch {
      return DEFAULT_LOCATION
    }
  })
  const [alerts, setAlerts] = useState([])
  const [notifications, setNotifications] = useState([])
  const [isOffline, setIsOffline] = useState(() => !offlineManager.isOnline())
  const selectedLocationRef = useRef(selectedMapLocation)

  useEffect(() => {
    selectedLocationRef.current = selectedMapLocation
  }, [selectedMapLocation])

  const [weatherData, setWeatherData] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState(null)

  const [forecastData, setForecastData] = useState(null)
  const [forecastLoading, setForecastLoading] = useState(false)
  const [forecastError, setForecastError] = useState(null)
  const [dataLoading, setDataLoading] = useState(false)

  const weatherRequestRef = useRef({ key: null, version: 0 })
  const forecastRequestRef = useRef({ key: null, version: 0, promise: null })
  const forecastStateRef = useRef({ key: null, data: null })

  // Modals state
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [isAirQualityOpen, setIsAirQualityOpen] = useState(false)
  const [toasts, setToasts] = useState([])

  const [isDetectingLocation, setIsDetectingLocation] = useState(false)

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('weathergpt_auth', JSON.stringify(isAuthenticated))
  }, [isAuthenticated])

  useEffect(() => {
    if (user) {
      localStorage.setItem('weathergpt_user', JSON.stringify(user))
    }
  }, [user])

  useEffect(() => {
    localStorage.setItem('weathergpt_settings', JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    localStorage.setItem(
      'weathergpt_saved_locations',
      JSON.stringify(savedLocations)
    )
  }, [savedLocations])

  useEffect(() => {
    localStorage.setItem(
      'weathergpt_conversations',
      JSON.stringify(conversations)
    )
  }, [conversations])

  useEffect(() => {
    if (selectedMapLocation) {
      localStorage.setItem(
        'weathergpt_selected_location',
        JSON.stringify(selectedMapLocation)
      )
    }
  }, [selectedMapLocation])

  // Legit GPS & Reverse Geocoding Detection
  const detectCurrentLocation = async (showToast = true) => {
    setIsDetectingLocation(true)

    const resolveAndApply = async (coords = null) => {
      try {
        const resolved = await api.reverseGeocode(
          coords
            ? { latitude: coords.latitude, longitude: coords.longitude }
            : {}
        )
        if (resolved && (resolved.city || resolved.lat)) {
          const loc = {
            city: resolved.city || 'Current Location',
            region: resolved.region || '',
            country: resolved.country || 'India',
            lat:
              resolved.latitude ||
              resolved.lat ||
              coords?.latitude ||
              DEFAULT_LOCATION.lat,
            lng:
              resolved.longitude ||
              resolved.lng ||
              coords?.longitude ||
              DEFAULT_LOCATION.lng
          }
          setSelectedMapLocation(loc)
          if (showToast) {
            addToast(
              `📍 ${loc.city}${loc.region ? `, ${loc.region}` : ''}`,
              'success'
            )
          }
          return loc
        }
      } catch (err) {
        console.warn('Reverse geocode error:', err.message)
      }
      return null
    }

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async pos => {
          await resolveAndApply(pos.coords)
          setIsDetectingLocation(false)
        },
        async err => {
          console.warn(
            'Browser geolocation denied or timed out, falling back to network IP location:',
            err.message
          )
          await resolveAndApply(null)
          setIsDetectingLocation(false)
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      )
    } else {
      await resolveAndApply(null)
      setIsDetectingLocation(false)
    }
  }

  // Initial detection if no prior location is set in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('weathergpt_selected_location')
    if (!saved) {
      detectCurrentLocation(false)
    }
  }, [])

  const refreshAlerts = async () => {
    const token = localStorage.getItem('weathergpt_token')
    const scope = getAlertScopeKey(Boolean(token))

    // 1. If offline, use IndexedDB directly
    if (!offlineManager.isOnline()) {
      try {
        const cached = await alertCache.getAlerts(scope)
        if (Array.isArray(cached) && cached.length > 0) {
          setAlerts(cached)
        }
      } catch (_) {}
      return
    }

    // 2. If online, try network
    try {
      const token = localStorage.getItem('weathergpt_token')
      const serverAlerts = token
        ? await api.myAlerts().catch(() => api.alerts())
        : await api.alerts()
      if (Array.isArray(serverAlerts)) {
        setAlerts(serverAlerts)
        alertCache.saveAlerts(scope, serverAlerts).catch(() => {})
      }
    } catch (err) {
      console.warn('Could not refresh alerts from API:', err)
      // 3. Network failed — fallback to cached alerts
      try {
        const cached = await alertCache.getAlerts(scope)
        if (Array.isArray(cached) && cached.length > 0) {
          setAlerts(cached)
        }
      } catch (_) {}
    }
  }

  // Load live alerts from database on mount
  useEffect(() => {
    refreshAlerts()
  }, [])

  // Hydrate auth status and user profile from backend on initial mount
  useEffect(() => {
    const token = localStorage.getItem('weathergpt_token')
    if (token) {
      api
        .currentUser()
        .then(userData => {
          setIsAuthenticated(true)
          if (userData) {
            setUser(prev => ({
              ...prev,
              ...userData,
              avatarUrl: userData.profileImage || userData.avatarUrl,
              stats: {
                ...DEFAULT_USER_STATS,
                ...(prev?.stats || {}),
                ...(userData.stats || {})
              }
            }))
          }
        })
        .catch(err => {
          // 401 Unauthorized is handled globally by api.js via 'weathergpt:unauthorized'.
          // Transient network errors or rate limits should not kick the user out.
          console.warn(
            'Could not hydrate user profile from backend:',
            err?.message || err
          )
        })
    }

    const handleUnauthorized = () => {
      setIsAuthenticated(false)
      addToast('Session expired. Please log in again.', 'warning')
    }
    window.addEventListener('weathergpt:unauthorized', handleUnauthorized)
    return () =>
      window.removeEventListener('weathergpt:unauthorized', handleUnauthorized)
  }, [])

  // Load initial user data once authenticated
  useEffect(() => {
    if (!isAuthenticated) return
    setDataLoading(true)

    // 1. Fetch Conversations
    api
      .conversations()
      .then(serverConversations => {
        if (!Array.isArray(serverConversations)) return
        setConversations(prevConvs =>
          serverConversations.map(conversation => {
            const existing = prevConvs.find(c => c.id === conversation._id)
            return {
              id: conversation._id,
              title: conversation.title,
              preview: conversation.title,
              tag: conversation.category || 'General Query',
              tagColor: 'blue',
              icon: 'sun-cloud',
              messages: existing?.messages?.length ? existing.messages : []
            }
          })
        )
      })
      .catch(() => {})
      .finally(() => setDataLoading(false))

    // 2. Fetch Notifications
    api
      .notifications()
      .then(serverNotifications => {
        if (Array.isArray(serverNotifications)) {
          setNotifications(serverNotifications)
        }
      })
      .catch(() => {})

    // 3. Fetch Saved Locations
    api
      .locations()
      .then(serverLocations => {
        if (!Array.isArray(serverLocations)) return
        const locations = serverLocations.map(location => ({
          ...location,
          id: location._id || location.id,
          region: location.region || location.state,
          lat: location.lat ?? location.latitude,
          lng: location.lng ?? location.longitude,
          condition:
            location.condition && location.condition !== 'Unknown'
              ? location.condition
              : 'Weather unavailable',
          tempC: location.tempC ?? null,
          feelsLikeC: location.feelsLikeC ?? null,
          humidity: location.humidity ?? null,
          windSpeedKmh: location.windSpeedKmh ?? null,
          windDirection: location.windDirection || '',
          forecast3Day: Array.isArray(location.forecast3Day)
            ? location.forecast3Day
            : []
        }))
        setSavedLocations(locations)
        if (locations.length > 0 && !selectedMapLocation) {
          setSelectedMapLocation(locations[0])
        }
      })
      .catch(() => {})

    // 4. Fetch User Settings
    api
      .getSettings()
      .then(serverSettings => {
        if (serverSettings) {
          setSettings(prev => ({
            ...prev,
            ...serverSettings,
            units: {
              temperature:
                serverSettings.temperatureUnit === 'fahrenheit' ? 'F' : 'C',
              windSpeed:
                serverSettings.windUnit === 'mph'
                  ? 'mph'
                  : serverSettings.windUnit === 'm/s'
                  ? 'ms'
                  : serverSettings.windUnit === 'knots'
                  ? 'knots'
                  : 'kmh',
              pressure: serverSettings.pressureUnit || 'hPa',
              precipitation: serverSettings.precipitationUnit || 'mm'
            },
            appearance: serverSettings.appearance || 'system',
            notifications: {
              ...prev.notifications,
              ...(serverSettings.notifications || {})
            }
          }))
        }
      })
      .catch(() => {})
  }, [isAuthenticated])

  // Load conversation messages when switching conversations
  useEffect(() => {
    if (!isAuthenticated || !activeConversationId) return
    if (activeConversationId.startsWith('conv-')) return // local new unsaved chat

    api
      .messages(activeConversationId)
      .then(msgList => {
        if (!Array.isArray(msgList)) return
        const formatted = msgList.map(message => ({
          id: message._id,
          sender: message.sender === 'user' ? 'user' : 'assistant',
          text: message.content,
          messageType: message.messageType,
          metadata: message.metadata,
          cardData: message.metadata?.current
            ? {
                city: message.metadata.location,
                temp: message.metadata.current.temperature,
                condition: message.metadata.current.condition,
                rainProb: message.metadata.current.precipitation,
                humidity: message.metadata.current.humidity,
                wind: message.metadata.current.windSpeed
              }
            : undefined,
          time: new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
        }))
        setConversations(prev =>
          prev.map(c => {
            if (c.id !== activeConversationId) return c
            const hasOptimistic = c.messages.some(
              m => m.status === 'sending' || m.status === 'loading'
            )
            if (hasOptimistic) return c
            return { ...c, messages: formatted }
          })
        )
      })
      .catch(() => {})
  }, [isAuthenticated, activeConversationId])

  const refreshWeather = async (latitude = 18.5204, longitude = 73.8567) => {
    const requestKey = `${latitude}:${longitude}`
    const requestVersion = weatherRequestRef.current.version + 1
    weatherRequestRef.current = { key: requestKey, version: requestVersion }

    setWeatherLoading(true)
    setWeatherError(null)

    // 1. If offline, use IndexedDB directly
    if (!offlineManager.isOnline()) {
      try {
        const cached = await weatherCache.getCurrentWeather(latitude, longitude)
        if (weatherRequestRef.current.version === requestVersion) {
          if (cached) {
            setWeatherData(cached)
          } else {
            setWeatherError(
              'You are offline and no cached weather data is available for this location.'
            )
          }
        }
        return cached
      } finally {
        if (weatherRequestRef.current.version === requestVersion) {
          setWeatherLoading(false)
        }
      }
    }

    // 2. If online, try backend request
    try {
      const data = await api.weather({ latitude, longitude })
      if (weatherRequestRef.current.version === requestVersion) {
        setWeatherData(data)
        weatherCache
          .saveCurrentWeather(latitude, longitude, data)
          .catch(() => {})
      }
      return data
    } catch (error) {
      // 3. Backend failed — attempt fallback to IndexedDB
      try {
        const cached = await weatherCache.getCurrentWeather(latitude, longitude)
        if (weatherRequestRef.current.version === requestVersion && cached) {
          setWeatherData(cached)
          addToast('Network unavailable. Displaying cached weather.', 'warning')
          return cached
        }
      } catch (_) {}

      // 4. Both failed — preserve existing error state
      if (weatherRequestRef.current.version === requestVersion) {
        setWeatherError(error.message || 'Could not load current weather')
        addToast(error.message || 'Could not load current weather', 'warning')
      }
      return null
    } finally {
      if (weatherRequestRef.current.version === requestVersion) {
        setWeatherLoading(false)
      }
    }
  }

  const refreshForecast = async (latitude = 18.5204, longitude = 73.8567) => {
    const requestKey = `${latitude}:${longitude}`
    const activeRequest = forecastRequestRef.current

    if (activeRequest.key === requestKey && activeRequest.promise) {
      return activeRequest.promise
    }

    const requestVersion = activeRequest.version + 1
    const requestPromise = (async () => {
      setForecastLoading(true)
      setForecastError(null)

      // 1. If offline, use IndexedDB directly
      if (!offlineManager.isOnline()) {
        try {
          const cached = await weatherCache.getForecast(latitude, longitude)
          if (forecastRequestRef.current.version === requestVersion) {
            if (cached) {
              forecastStateRef.current = { key: requestKey, data: cached }
              setForecastData(cached)
            } else {
              setForecastError(
                'You are offline and no cached forecast is available for this location.'
              )
            }
          }
          return cached
        } finally {
          if (forecastRequestRef.current.version === requestVersion) {
            forecastRequestRef.current.promise = null
            setForecastLoading(false)
          }
        }
      }

      // 2. If online, try backend request
      try {
        const data = await api.forecast({ latitude, longitude, days: 7 })
        const latestRequest = forecastRequestRef.current
        const currentState = forecastStateRef.current
        const isFallback = data?.models?.openMeteo?.isFallback === true
        const hasLiveDataForLocation =
          currentState.key === requestKey &&
          currentState.data?.models?.openMeteo?.isFallback !== true

        if (latestRequest.version !== requestVersion) return data
        if (isFallback && hasLiveDataForLocation) return data

        forecastStateRef.current = { key: requestKey, data }
        setForecastData(data)
        weatherCache.saveForecast(latitude, longitude, data).catch(() => {})
        return data
      } catch (error) {
        // 3. Backend failed — attempt fallback to IndexedDB
        try {
          const cached = await weatherCache.getForecast(latitude, longitude)
          if (forecastRequestRef.current.version === requestVersion && cached) {
            forecastStateRef.current = { key: requestKey, data: cached }
            setForecastData(cached)
            return cached
          }
        } catch (_) {}

        // 4. Both failed — preserve existing error state
        if (forecastRequestRef.current.version === requestVersion) {
          setForecastError(error.message || 'Could not load forecast')
          addToast(error.message || 'Could not load forecast', 'warning')
        }
        return null
      } finally {
        if (forecastRequestRef.current.version === requestVersion) {
          forecastRequestRef.current.promise = null
          setForecastLoading(false)
        }
      }
    })()

    forecastRequestRef.current = {
      key: requestKey,
      version: requestVersion,
      promise: requestPromise
    }

    return requestPromise
  }

  // Fetch weather whenever location changes or on mount
  useEffect(() => {
    const loc = selectedMapLocation || DEFAULT_LOCATION
    const latitude = loc?.lat ?? loc?.latitude ?? DEFAULT_LOCATION.lat
    const longitude = loc?.lng ?? loc?.longitude ?? DEFAULT_LOCATION.lng
    if (latitude !== undefined && longitude !== undefined) {
      refreshWeather(latitude, longitude)
      refreshForecast(latitude, longitude)
    }
  }, [selectedMapLocation])

  // Subscribe to network online/offline changes
  useEffect(() => {
    const unsubscribe = offlineManager.subscribe(({ isOnline }) => {
      setIsOffline(!isOnline)
      if (isOnline) {
        addToast('Back online. Refreshing weather data...', 'info')
        const loc = selectedLocationRef.current || DEFAULT_LOCATION
        const latitude = loc?.lat ?? loc?.latitude ?? DEFAULT_LOCATION.lat
        const longitude = loc?.lng ?? loc?.longitude ?? DEFAULT_LOCATION.lng
        if (latitude !== undefined && longitude !== undefined) {
          refreshWeather(latitude, longitude)
          refreshForecast(latitude, longitude)
        }
        refreshAlerts()
      } else {
        addToast('You are offline. Showing cached weather.', 'warning')
      }
    })

    return () => unsubscribe()
  }, [])

  // Toast Notification helper
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }

  const removeToast = id => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  // Temperature unit conversion
  const formatTemp = tempInCelsius => {
    if (tempInCelsius === undefined || tempInCelsius === null) return '--'
    if (settings?.units?.temperature === 'F') {
      const f = Math.round((tempInCelsius * 9) / 5 + 32)
      return `${f}°F`
    }
    return `${Math.round(tempInCelsius)}°C`
  }

  const formatTempRaw = tempInCelsius => {
    if (tempInCelsius === undefined || tempInCelsius === null) return '--'
    if (settings?.units?.temperature === 'F') {
      return Math.round((tempInCelsius * 9) / 5 + 32)
    }
    return Math.round(tempInCelsius)
  }

  // Wind speed conversion
  const formatWind = speedKmh => {
    if (speedKmh === undefined || speedKmh === null) return '--'
    const unit = settings?.units?.windSpeed
    if (unit === 'mph') {
      return `${Math.round(speedKmh * 0.621371)} mph`
    }
    if (unit === 'ms') {
      return `${Math.round(speedKmh / 3.6)} m/s`
    }
    if (unit === 'knots') {
      return `${Math.round(speedKmh * 0.539957)} kn`
    }
    return `${speedKmh} km/h`
  }

  // Pressure conversion
  const formatPressure = pressureHpa => {
    if (!pressureHpa) return '--'
    const unit = settings?.units?.pressure
    if (unit === 'inHg') {
      return `${(pressureHpa * 0.02953).toFixed(2)} inHg`
    }
    if (unit === 'mmHg') {
      return `${Math.round(pressureHpa * 0.750062)} mmHg`
    }
    if (unit === 'bar') {
      return `${(pressureHpa / 1000).toFixed(3)} bar`
    }
    return `${pressureHpa} hPa`
  }

  // Saved location actions
  const addLocation = async cityData => {
    const exists = savedLocations.some(
      l => l.city.toLowerCase() === cityData.city.toLowerCase()
    )
    if (exists) {
      addToast(
        `${cityData.city} is already in your saved locations!`,
        'warning'
      )
      return
    }
    const newLoc = await api.addLocation({
      name: cityData.name || `${cityData.city} Location`,
      city: cityData.city,
      state: cityData.region || cityData.state || '',
      country: cityData.country || 'India',
      latitude: Number(cityData.lat ?? cityData.latitude ?? 18.5204),
      longitude: Number(cityData.lng ?? cityData.longitude ?? 73.8567),
      isFavorite: Boolean(cityData.isFavorite)
    })
    const updatedLocation = {
      ...cityData,
      ...newLoc,
      id: newLoc._id || newLoc.id,
      region: newLoc.state || cityData.region,
      lat: newLoc.latitude,
      lng: newLoc.longitude,
      updatedTime: 'Just now'
    }
    const updated = [...savedLocations, updatedLocation]
    setSavedLocations(updated)
    setUser(prev =>
      prev
        ? {
            ...prev,
            stats: { ...prev.stats, locationsSaved: updated.length }
          }
        : prev
    )
    addToast(`${cityData.city} added to saved locations!`, 'success')
  }

  const removeLocation = async id => {
    const loc = savedLocations.find(l => l.id === id)
    await api.deleteLocation(id)
    const updated = savedLocations.filter(l => l.id !== id)
    setSavedLocations(updated)
    setUser(prev =>
      prev
        ? {
            ...prev,
            stats: {
              ...DEFAULT_USER_STATS,
              ...(prev.stats || {}),
              locationsSaved: Math.max(0, (prev.stats?.locationsSaved ?? 1) - 1)
            }
          }
        : prev
    )
    addToast(`Removed ${loc ? loc.city : 'location'}`, 'info')
  }

  const toggleFavorite = async id => {
    const favoriteLocation = await api.favoriteLocation(id)
    setSavedLocations(prev =>
      prev.map(location => ({
        ...location,
        isFavorite:
          location.id === (favoriteLocation._id || favoriteLocation.id)
      }))
    )
  }

  // Settings update helpers connected to backend
  const updateUnits = async (key, value) => {
    setSettings(prev => ({
      ...prev,
      units: { ...prev.units, [key]: value }
    }))
    addToast(`Updated unit: ${key} to ${value}`, 'info')

    if (!isAuthenticated) return
    try {
      const tempUnit =
        key === 'temperature'
          ? value === 'F'
            ? 'fahrenheit'
            : 'celsius'
          : settings.units.temperature === 'F'
          ? 'fahrenheit'
          : 'celsius'
      const windUnit =
        key === 'windSpeed'
          ? value === 'ms'
            ? 'm/s'
            : value
          : settings.units.windSpeed === 'ms'
          ? 'm/s'
          : settings.units.windSpeed
      const pressureUnit = key === 'pressure' ? value : settings.units.pressure
      const precipitationUnit =
        key === 'precipitation' ? value : settings.units.precipitation

      await api.updateSettings({
        temperatureUnit: tempUnit,
        windUnit,
        pressureUnit,
        precipitationUnit
      })
    } catch (error) {
      addToast(error.message || 'Could not update weather units', 'warning')
    }
  }

  const updateNotifications = async (key, value) => {
    const updated = { ...settings.notifications, [key]: value }
    setSettings(prev => ({
      ...prev,
      notifications: updated
    }))

    if (!isAuthenticated) return
    try {
      await api.updateSettings({ notifications: updated })
    } catch (error) {
      addToast(
        error.message || 'Could not update notification settings',
        'warning'
      )
    }
  }

  const updateProfile = async updatedProfile => {
    if (isAuthenticated) {
      try {
        const profile = await api.updateProfile({
          name: updatedProfile.name,
          language: updatedProfile.language,
          timezone: updatedProfile.timezone,
          profileImage: updatedProfile.profileImage
        })
        setUser(prev => ({
          ...prev,
          ...profile,
          avatarUrl:
            profile.profileImage || profile.avatarUrl || prev?.avatarUrl,
          avatarInitials: updatedProfile.avatarInitials || prev?.avatarInitials
        }))
        addToast('Profile updated successfully!', 'success')
        return profile
      } catch (err) {
        addToast(err.message || 'Failed to sync profile with server', 'warning')
        throw err
      }
    }
    setUser(prev =>
      prev
        ? {
            ...prev,
            ...updatedProfile
          }
        : updatedProfile
    )
    addToast('Profile updated successfully!', 'success')
    return updatedProfile
  }

  const sendChatMessage = async text => {
    if (!text.trim() || isSending) return

    const userMessageText = text.trim()
    const tempUserMsgId = `msg-user-${Date.now()}`
    const tempAiMsgId = `msg-ai-${Date.now()}`

    let currentConvId = activeConversationId
    const isNewConv = !currentConvId || currentConvId.startsWith('conv-')

    // 1. Optimistic Update
    setIsSending(true)

    const userMsg = {
      id: tempUserMsgId,
      sender: 'user',
      text: userMessageText,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'sending'
    }

    const aiLoadingMsg = {
      id: tempAiMsgId,
      sender: 'assistant',
      text: 'Thinking...',
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'loading'
    }

    if (isNewConv) {
      const tempConvId = currentConvId || `conv-${Date.now()}`
      const tempConv = {
        id: tempConvId,
        title: userMessageText.slice(0, 32),
        preview: userMessageText,
        tag: 'General Query',
        tagColor: 'blue',
        icon: 'sun-cloud',
        messages: [userMsg, aiLoadingMsg]
      }
      setConversations(prev => [tempConv, ...prev])
      setActiveConversationId(tempConvId)
      currentConvId = tempConvId
    } else {
      setConversations(prev =>
        prev.map(c =>
          c.id === currentConvId
            ? {
                ...c,
                messages: [...c.messages, userMsg, aiLoadingMsg],
                preview: userMessageText
              }
            : c
        )
      )
    }

    let finalConvId = currentConvId
    try {
      // 2. Handle Conversation Creation
      if (isNewConv) {
        const conversation = await api.createConversation({
          title: userMessageText.slice(0, 32),
          category: 'general'
        })
        finalConvId = conversation._id

        setConversations(prev =>
          prev.map(c =>
            c.id === currentConvId ? { ...c, id: finalConvId } : c
          )
        )
        setActiveConversationId(finalConvId)
      }

      // 3. Send Message
      const result = await api.sendMessage({
        conversationId: finalConvId,
        content: userMessageText
      })

      const toMessage = message => ({
        id: message?._id || `msg-${Date.now()}`,
        sender: message?.sender === 'user' ? 'user' : 'assistant',
        text: message?.content || message?.text || 'No response received',
        messageType: message?.messageType || 'text',
        metadata: message?.metadata || {},
        cardData: message?.metadata?.current
          ? {
              city: message.metadata.location,
              temp: message.metadata.current.temperature,
              condition: message.metadata.current.condition,
              rainProb: message.metadata.current.precipitation,
              humidity: message.metadata.current.humidity,
              wind: message.metadata.current.windSpeed
            }
          : undefined,
        time: message?.createdAt
          ? new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })
          : new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })
      })

      const assistantMsg = toMessage(result.aiMessage)

      // 4. Final Reconciliation
      setConversations(prev => {
        return prev.map(conversation => {
          const hasTempMessages = conversation.messages.some(
            m => m.id === tempUserMsgId || m.id === tempAiMsgId
          )

          if (hasTempMessages || conversation.id === finalConvId) {
            const newMessages = conversation.messages.map(m => {
              if (m.id === tempUserMsgId) return toMessage(result.userMessage)
              if (m.id === tempAiMsgId) return assistantMsg
              return m
            })
            return {
              ...conversation,
              id: finalConvId,
              messages: newMessages
            }
          }
          return conversation
        })
      })
    } catch (error) {
      console.error('CHAT SEND ERROR:', error)
      addToast(error.message || 'Failed to send message', 'warning')

      setConversations(prev =>
        prev.map(conversation =>
          conversation.id === finalConvId
            ? {
                ...conversation,
                messages: conversation.messages.map(m =>
                  m.id === tempAiMsgId
                    ? {
                        ...m,
                        status: 'error',
                        text: 'Failed to send message. Please try again.',
                        originalText: userMessageText
                      }
                    : m
                )
              }
            : conversation
        )
      )
    } finally {
      setIsSending(false)
    }
  }

  const createNewChat = () => {
    const newId = `conv-${Date.now()}`
    const now = new Date()
    const newConv = {
      id: newId,
      dateGroup: now.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      time: now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      title: 'New Conversation',
      preview: "Start asking about any city's weather...",
      tag: 'General Query',
      tagColor: 'blue',
      icon: 'sun-cloud',
      messages: []
    }
    setConversations(prev => [newConv, ...prev])
    setActiveConversationId(newId)
    setCurrentPage('chat')
    addToast('Started new chat session', 'info')
  }

  const deleteConversation = async id => {
    if (isAuthenticated && !id.startsWith('conv-')) {
      try {
        await api.deleteConversation(id)
      } catch {
        // Continue local cleanup
      }
    }
    setConversations(prev => prev.filter(c => c.id !== id))

    setUser(prev =>
      prev
        ? {
            ...prev,
            stats: {
              ...DEFAULT_USER_STATS,
              ...(prev.stats || {}),
              conversations: Math.max(0, (prev.stats?.conversations ?? 0) - 1)
            }
          }
        : prev
    )

    addToast('Conversation deleted', 'info')
  }

  // Auth methods
  const login = async (email, password) => {
    const result = await api.login({ email, password })
    localStorage.setItem('weathergpt_token', result.token)
    const normalized = normalizeUser(result.user)
    setUser(normalized)
    if (result.user?.language) {
      localStorage.setItem('weathergpt_language', result.user.language)
      setSettings(prev => ({ ...prev, language: result.user.language }))
    }
    setIsAuthenticated(true)
    setCurrentPage('dashboard')
    addToast(`Welcome back to WeatherGPT!`, 'success')
    return result
  }

  const signUp = async ({ name, email, password, language }) => {
    const lang = language || localStorage.getItem('weathergpt_language') || 'en'
    const result = await api.register({ name, email, password, language: lang })
    localStorage.setItem('weathergpt_token', result.token)
    const normalized = normalizeUser(result.user)
    setUser(normalized)
    localStorage.setItem('weathergpt_language', lang)
    setSettings(prev => ({ ...prev, language: lang }))
    setIsAuthenticated(true)
    setCurrentPage('dashboard')
    addToast(
      `Account created successfully! Welcome, ${result.user.name}`,
      'success'
    )
    return result
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch {
      // A stateless token can still be cleared when the API is unavailable.
    }
    localStorage.removeItem('weathergpt_token')
    localStorage.removeItem('weathergpt_user')
    setUser(null)
    setSavedLocations([])
    setConversations([])
    setAlerts([])
    setWeatherData(null)
    setForecastData(null)
    setSelectedMapLocation(null)
    setActiveConversationId(null)
    setIsAuthenticated(false)
    setCurrentPage('login')
    addToast('Logged out successfully', 'info')
  }

  return (
    <WeatherContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        login,
        signUp,
        logout,
        currentPage,
        setCurrentPage,
        user,
        setUser,
        updateProfile,
        settings,
        setSettings,
        updateUnits,
        updateNotifications,
        savedLocations,
        addLocation,
        removeLocation,
        toggleFavorite,
        selectedMapLocation,
        setSelectedMapLocation,
        isDetectingLocation,
        detectCurrentLocation,
        conversations,
        activeConversationId,
        setActiveConversationId,
        sendChatMessage,
        isSending,
        createNewChat,
        deleteConversation,
        alerts,
        refreshAlerts,
        notifications,
        isOffline,
        weatherData,
        weatherLoading,
        weatherError,
        refreshWeather,
        forecastData,
        forecastLoading,
        forecastError,
        refreshForecast,
        dataLoading,
        formatTemp,
        formatTempRaw,
        formatWind,
        formatPressure,
        // Modals
        isAddLocationOpen,
        setIsAddLocationOpen,
        isEditProfileOpen,
        setIsEditProfileOpen,
        isForgotPasswordOpen,
        setIsForgotPasswordOpen,
        isAirQualityOpen,
        setIsAirQualityOpen,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </WeatherContext.Provider>
  )
}

export const useWeather = () => {
  const context = useContext(WeatherContext)
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider')
  }
  return context
}
export default WeatherContext
