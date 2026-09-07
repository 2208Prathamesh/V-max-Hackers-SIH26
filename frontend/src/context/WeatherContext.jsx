import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef
} from 'react'
import {
  initialUser,
  defaultSettings,
  initialSavedLocations,
  initialConversations,
  allCityDatabase
} from '../data/mockData'
import { api } from '../services/api'

const WeatherContext = createContext()

const defaultUserStats = {
  conversations: 0,
  thisWeek: 0,
  thisMonth: 0,
  totalMessages: 0,
  storageUsedPercent: 0,
  locationsSaved: 0
}

const normalizeUser = user => ({
  ...user,
  stats: {
    ...defaultUserStats,
    ...(user?.stats || {})
  }
})

export const WeatherProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('dashboard') // 'dashboard' | 'chat' | 'alerts' | 'weather-map' | 'forecast' | 'history' | 'saved-locations' | 'settings' | 'login'
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('weathergpt_token') !== null
  })

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('weathergpt_user')

    try {
      return normalizeUser(saved ? JSON.parse(saved) : initialUser)
    } catch {
      return normalizeUser(initialUser)
    }
  })

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('weathergpt_settings')
    return saved ? JSON.parse(saved) : defaultSettings
  })

  const [savedLocations, setSavedLocations] = useState(() => {
    const saved = localStorage.getItem('weathergpt_saved_locations')
    return saved ? JSON.parse(saved) : initialSavedLocations
  })

  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('weathergpt_conversations')
    return saved ? JSON.parse(saved) : initialConversations
  })

  const [activeConversationId, setActiveConversationId] = useState('conv-1')
  const [selectedMapLocation, setSelectedMapLocation] = useState(
    initialSavedLocations[0]
  ) // Default Pune
  const [alerts, setAlerts] = useState([])
  const [notifications, setNotifications] = useState([])
  const [weatherData, setWeatherData] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState(null)
  const [forecastData, setForecastData] = useState(null)
  const [forecastLoading, setForecastLoading] = useState(false)
  const [forecastError, setForecastError] = useState(null)
  const weatherRequestRef = useRef({ key: null, version: 0 })
  const forecastRequestRef = useRef({ key: null, version: 0, promise: null })
  const forecastStateRef = useRef({ key: null, data: null })

  // Modals state
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false)
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [isAirQualityOpen, setIsAirQualityOpen] = useState(false)
  const [toasts, setToasts] = useState([])

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('weathergpt_auth', JSON.stringify(isAuthenticated))
  }, [isAuthenticated])
  useEffect(() => {
    localStorage.setItem('weathergpt_user', JSON.stringify(user))
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
                ...defaultUserStats,
                ...(prev.stats || {}),
                ...(userData.stats || {})
              }
            }))
          }
        })
        .catch(() => {
          localStorage.removeItem('weathergpt_token')
          localStorage.removeItem('weathergpt_user')
          setIsAuthenticated(false)
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

  useEffect(() => {
    if (!isAuthenticated) return

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
      .catch(() => addToast('Could not load your conversations', 'warning'))

    // 2. Fetch Alerts
    api
      .alerts()
      .then(result => {
        if (Array.isArray(result) && result.length > 0) {
          setAlerts(result)
        }
      })
      .catch(() => addToast('Could not load weather alerts', 'warning'))

    api
      .notifications()
      .then(serverNotifications => {
        if (Array.isArray(serverNotifications))
          setNotifications(serverNotifications)
      })
      .catch(() => addToast('Could not load notifications', 'warning'))

    // 3. Fetch Saved Locations
    api
      .locations()
      .then(serverLocations => {
        if (!Array.isArray(serverLocations)) return
        const locations = serverLocations.map(location => {
          const fallback = savedLocations.find(
            previous =>
              previous.city.toLowerCase() === location.city.toLowerCase()
          )
          const liveForecast =
            Array.isArray(location.forecast3Day) &&
            location.forecast3Day.some(day => day.temp != null)

          return {
            ...fallback,
            ...location,
            id: location._id,
            region: location.region || location.state || fallback?.region,
            lat: location.lat ?? location.latitude ?? fallback?.lat,
            lng: location.lng ?? location.longitude ?? fallback?.lng,
            condition:
              location.condition && location.condition !== 'Unknown'
                ? location.condition
                : fallback?.condition || 'Weather unavailable',
            tempC: location.tempC ?? fallback?.tempC ?? null,
            feelsLikeC: location.feelsLikeC ?? fallback?.feelsLikeC ?? null,
            humidity: location.humidity ?? fallback?.humidity ?? null,
            windSpeedKmh:
              location.windSpeedKmh ?? fallback?.windSpeedKmh ?? null,
            windDirection:
              location.windDirection || fallback?.windDirection || '',
            forecast3Day: liveForecast
              ? location.forecast3Day
              : fallback?.forecast3Day || []
          }
        })
        setSavedLocations(locations)
        if (locations.length > 0) setSelectedMapLocation(locations[0])
      })
      .catch(() => addToast('Could not load saved locations', 'warning'))

    // 4. Fetch User Settings
    api
      .getSettings()
      .then(serverSettings => {
        if (serverSettings) {
          setSettings(prev => ({
            ...prev,
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
      .catch(error =>
        addToast(error.message || 'Could not load your settings', 'warning')
      )
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
          prev.map(c =>
            c.id === activeConversationId ? { ...c, messages: formatted } : c
          )
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
    setWeatherData(null)
    try {
      const data = await api.weather({ latitude, longitude })
      if (weatherRequestRef.current.version === requestVersion) {
        setWeatherData(data)
      }
      return data
    } catch (error) {
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
      setForecastData(null)
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
        return data
      } catch (error) {
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

  useEffect(() => {
    if (!isAuthenticated) return

    const latitude = selectedMapLocation?.lat ?? selectedMapLocation?.latitude
    const longitude = selectedMapLocation?.lng ?? selectedMapLocation?.longitude
    if (latitude !== undefined && longitude !== undefined) {
      refreshWeather(latitude, longitude)
      refreshForecast(latitude, longitude)
    }
  }, [isAuthenticated, selectedMapLocation])

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
    if (settings.units.temperature === 'F') {
      const f = Math.round((tempInCelsius * 9) / 5 + 32)
      return `${f}°F`
    }
    return `${Math.round(tempInCelsius)}°C`
  }

  const formatTempRaw = tempInCelsius => {
    if (tempInCelsius === undefined || tempInCelsius === null) return '--'
    if (settings.units.temperature === 'F') {
      return Math.round((tempInCelsius * 9) / 5 + 32)
    }
    return Math.round(tempInCelsius)
  }

  // Wind speed conversion
  const formatWind = speedKmh => {
    if (speedKmh === undefined || speedKmh === null) return '--'
    const unit = settings.units.windSpeed
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
    const unit = settings.units.pressure
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
    setUser(prev => ({
      ...prev,
      stats: { ...prev.stats, locationsSaved: updated.length }
    }))
    addToast(`${cityData.city} added to saved locations!`, 'success')
  }

  const removeLocation = async id => {
    const loc = savedLocations.find(l => l.id === id)
    await api.deleteLocation(id)
    const updated = savedLocations.filter(l => l.id !== id)
    setSavedLocations(updated)
    setUser(prev => ({
      ...prev,
      stats: { ...prev.stats, locationsSaved: updated.length }
    }))
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
            profile.profileImage || profile.avatarUrl || prev.avatarUrl,
          avatarInitials: updatedProfile.avatarInitials || prev.avatarInitials
        }))
        addToast('Profile updated successfully!', 'success')
        return profile
      } catch (err) {
        addToast(err.message || 'Failed to sync profile with server', 'warning')
        throw err
      }
    }
    setUser(prev => ({
      ...prev,
      ...updatedProfile
    }))
    addToast('Profile updated successfully!', 'success')
    return updatedProfile
  }

  const sendChatMessage = async text => {
    if (!text.trim()) return

    let convId = activeConversationId

    // Create the conversation in MongoDB if this is a new/local chat
    if (!convId || convId.startsWith('conv-')) {
      const conversation = await api.createConversation({
        title: text.slice(0, 32),
        category: 'general'
      })

      convId = conversation._id

      // Replace the temporary local conversation with the real MongoDB conversation
      setConversations(prev =>
        prev.map(c =>
          c.id === activeConversationId
            ? {
                ...c,
                id: convId,
                title: conversation.title,
                preview: text,
                messages: []
              }
            : c
        )
      )

      setActiveConversationId(convId)
    }

    const result = await api.sendMessage({
      conversationId: convId,
      content: text.trim()
    })

    const toMessage = message => ({
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
    })

    setConversations(prev =>
      prev.map(conversation =>
        conversation.id === convId
          ? {
              ...conversation,
              messages: [
                ...conversation.messages,
                toMessage(result.userMessage),
                toMessage(result.aiMessage)
              ],
              preview: text
            }
          : conversation
      )
    )
  }

  const createNewChat = () => {
    const newId = `conv-${Date.now()}`
    const newConv = {
      id: newId,
      dateGroup: 'Today – 21 May 2025',
      time: new Date().toLocaleTimeString([], {
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

    setUser(prev => ({
      ...prev,
      stats: {
        ...defaultUserStats,
        ...(prev.stats || {}),
        conversations: Math.max(0, (prev.stats?.conversations ?? 0) - 1)
      }
    }))

    addToast('Conversation deleted', 'info')
  }

  // Auth methods
  const login = async (email, password) => {
    const result = await api.login({ email, password })
    localStorage.setItem('weathergpt_token', result.token)
    setUser(normalizeUser(result.user))
    setIsAuthenticated(true)
    setCurrentPage('dashboard')
    addToast(`Welcome back to WeatherGPT!`, 'success')
    return result
  }

  const signUp = async ({ name, email, password }) => {
    const result = await api.register({ name, email, password })
    localStorage.setItem('weathergpt_token', result.token)
    setUser(normalizeUser(result.user))
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
        allCityDatabase,
        addLocation,
        removeLocation,
        toggleFavorite,
        selectedMapLocation,
        setSelectedMapLocation,
        conversations,
        activeConversationId,
        setActiveConversationId,
        sendChatMessage,
        createNewChat,
        deleteConversation,
        alerts,
        notifications,
        weatherData,
        weatherLoading,
        weatherError,
        refreshWeather,
        forecastData,
        forecastLoading,
        forecastError,
        refreshForecast,
        formatTemp,
        formatTempRaw,
        formatWind,
        formatPressure,
        // Modals
        isAddLocationOpen,
        setIsAddLocationOpen,
        isPremiumModalOpen,
        setIsPremiumModalOpen,
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
