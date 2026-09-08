import React, { createContext, useContext, useState, useEffect } from 'react'
import { DEFAULT_SETTINGS, DEFAULT_USER_STATS } from '../config/defaults'
import { api } from '../services/api'

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

  const [savedLocations, setSavedLocations] = useState([])
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [selectedMapLocation, setSelectedMapLocation] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [weatherData, setWeatherData] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [forecastData, setForecastData] = useState(null)
  const [forecastLoading, setForecastLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  // Modals state
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [isAirQualityOpen, setIsAirQualityOpen] = useState(false)
  const [toasts, setToasts] = useState([])

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

  const refreshAlerts = async () => {
    try {
      const serverAlerts = await api.alerts()
      if (Array.isArray(serverAlerts)) {
        setAlerts(serverAlerts)
      }
    } catch (err) {
      console.warn('Could not refresh alerts from API:', err)
    }
  }

  // Load live alerts from database on mount
  useEffect(() => {
    refreshAlerts()
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setDataLoading(false)
      return
    }

    setDataLoading(true)

    const loadData = async () => {
      try {
        // Load conversations
        const serverConversations = await api.conversations().catch(() => [])
        if (Array.isArray(serverConversations)) {
          setConversations(
            serverConversations.map(conversation => ({
              id: conversation._id,
              title: conversation.title,
              preview: conversation.title,
              tag: conversation.category || 'General Query',
              tagColor: 'blue',
              icon: 'sun-cloud',
              messages: []
            }))
          )
        }

        // Load locations
        const serverLocations = await api.locations().catch(() => [])
        if (Array.isArray(serverLocations) && serverLocations.length > 0) {
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
            forecast3Day:
              Array.isArray(location.forecast3Day) &&
              location.forecast3Day.some(day => day.temp != null)
                ? location.forecast3Day
                : []
          }))
          setSavedLocations(locations)
          setSelectedMapLocation(locations[0])
        }

        // Load settings
        const serverSettings = await api.settings().catch(() => null)
        if (serverSettings) {
          setSettings(prev => ({
            ...prev,
            ...serverSettings,
            units: {
              ...prev.units,
              ...(serverSettings.units || {})
            }
          }))
          if (serverSettings.language) {
            localStorage.setItem('weathergpt_language', serverSettings.language)
          }
        }
      } catch (err) {
        console.warn('Error loading initial data:', err)
      } finally {
        setDataLoading(false)
      }
    }

    loadData()
  }, [isAuthenticated])

  const refreshWeather = async (latitude, longitude) => {
    if (latitude === undefined || longitude === undefined) return null
    setWeatherLoading(true)
    try {
      const data = await api.weather({ latitude, longitude })
      setWeatherData(data)
      return data
    } catch (error) {
      addToast(
        settings.language === 'mr' ? 'हवामान डेटा लोड होऊ शकला नाही' :
        settings.language === 'hi' ? 'मौसम डेटा लोड नहीं हो सका' :
        (error.message || 'Could not load current weather'), 'warning'
      )
      return null
    } finally {
      setWeatherLoading(false)
    }
  }

  const refreshForecast = async (latitude, longitude) => {
    if (latitude === undefined || longitude === undefined) return null
    setForecastLoading(true)
    try {
      const data = await api.forecast({ latitude, longitude, days: 7 })
      setForecastData(data)
      return data
    } catch (error) {
      addToast(
        settings.language === 'mr' ? 'हवामान अंदाज लोड होऊ शकला नाही' :
        settings.language === 'hi' ? 'पूर्वानुमान लोड नहीं हो सका' :
        (error.message || 'Could not load forecast'), 'warning'
      )
      return null
    } finally {
      setForecastLoading(false)
    }
  }

  // Fetch weather when location is selected
  useEffect(() => {
    if (!isAuthenticated || !selectedMapLocation) return
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
      state: cityData.region || cityData.state,
      country: cityData.country,
      latitude: cityData.lat ?? cityData.latitude,
      longitude: cityData.lng ?? cityData.longitude,
      isFavorite: cityData.isFavorite || false
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
    setUser(prev => prev ? ({
      ...prev,
      stats: { ...prev.stats, locationsSaved: updated.length }
    }) : prev)
    addToast(`${cityData.city} added to saved locations!`, 'success')
  }

  const removeLocation = async id => {
    const loc = savedLocations.find(l => l.id === id)
    await api.deleteLocation(id)
    const updated = savedLocations.filter(l => l.id !== id)
    setSavedLocations(updated)
    setUser(prev => prev ? ({
      ...prev,
      stats: { ...prev.stats, locationsSaved: updated.length }
    }) : prev)
    addToast(`Removed ${loc ? loc.city : 'location'}`, 'info')
  }

  const toggleFavorite = async id => {
    await api.favoriteLocation(id)
    setSavedLocations(prev =>
      prev.map(l => (l.id === id ? { ...l, isFavorite: !l.isFavorite } : l))
    )
  }

  // Settings update helpers
  const updateUnits = (key, value) => {
    setSettings(prev => ({
      ...prev,
      units: { ...prev.units, [key]: value }
    }))
    addToast(`Updated unit: ${key} to ${value}`, 'info')
  }

  const updateNotifications = (key, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }))
  }

  const updateProfile = updatedProfile => {
    setUser(prev => prev ? ({
      ...prev,
      ...updatedProfile
    }) : updatedProfile)
    addToast('Profile updated successfully!', 'success')
  }

  const sendChatMessage = async text => {
    if (!text.trim()) return

    let convId = activeConversationId
    if (!convId || !conversations.some(conversation => conversation.id === convId)) {
      const conversation = await api.createConversation({
        title: text.slice(0, 32),
        category: 'general'
      })
      convId = conversation._id
      setActiveConversationId(convId)
      setConversations(prev => [
        {
          id: convId,
          title: conversation.title,
          preview: text,
          tag: 'General Query',
          tagColor: 'blue',
          icon: 'sun-cloud',
          messages: []
        },
        ...prev
      ])
    }

    const result = await api.sendMessage({
      conversationId: convId,
      content: text.trim()
    })
    const toMessage = message => ({
      sender: message.sender === 'user' ? 'user' : 'assistant',
      text: message.content,
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
    const now = new Date()
    const newConv = {
      id: newId,
      dateGroup: now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }),
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

  const deleteConversation = id => {
    setConversations(prev => prev.filter(c => c.id !== id))

    setUser(prev => prev ? ({
      ...prev,
      stats: {
        ...DEFAULT_USER_STATS,
        ...(prev.stats || {}),
        conversations: Math.max(0, (prev.stats?.conversations ?? 0) - 1)
      }
    }) : prev)

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
        conversations,
        activeConversationId,
        setActiveConversationId,
        sendChatMessage,
        createNewChat,
        deleteConversation,
        alerts,
        refreshAlerts,
        weatherData,
        weatherLoading,
        refreshWeather,
        forecastData,
        forecastLoading,
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
