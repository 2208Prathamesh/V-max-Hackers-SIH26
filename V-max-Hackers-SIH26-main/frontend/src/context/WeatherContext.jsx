import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  initialUser,
  authorityUser,
  defaultSettings,
  initialSavedLocations,
  initialConversations,
  activeAlerts,
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
  const [alerts, setAlerts] = useState(activeAlerts)
  const [weatherData, setWeatherData] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [forecastData, setForecastData] = useState(null)
  const [forecastLoading, setForecastLoading] = useState(false)

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

  useEffect(() => {
    if (!isAuthenticated) return

    api
      .conversations()
      .then(serverConversations => {
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
      })
      .catch(() => addToast('Could not load your conversations', 'warning'))

    api
      .alerts()
      .then(setAlerts)
      .catch(() => addToast('Could not load weather alerts', 'warning'))

    api
      .locations()
      .then(serverLocations => {
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
  }, [isAuthenticated])

  const refreshWeather = async (latitude = 18.5204, longitude = 73.8567) => {
    setWeatherLoading(true)
    try {
      const data = await api.weather({ latitude, longitude })
      setWeatherData(data)
      return data
    } catch (error) {
      addToast(error.message || 'Could not load current weather', 'warning')
      return null
    } finally {
      setWeatherLoading(false)
    }
  }

  const refreshForecast = async (latitude = 18.5204, longitude = 73.8567) => {
    setForecastLoading(true)
    try {
      const data = await api.forecast({ latitude, longitude, days: 7 })
      setForecastData(data)
      return data
    } catch (error) {
      addToast(error.message || 'Could not load forecast', 'warning')
      return null
    } finally {
      setForecastLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) refreshWeather()
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return

    const latitude = selectedMapLocation?.lat ?? selectedMapLocation?.latitude
    const longitude = selectedMapLocation?.lng ?? selectedMapLocation?.longitude
    if (latitude !== undefined && longitude !== undefined) {
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
    setUser(prev => ({
      ...prev,
      ...updatedProfile
    }))
    addToast('Profile updated successfully!', 'success')
  }

  const sendChatMessage = async text => {
    if (!text.trim()) return

    let convId = activeConversationId
    if (!conversations.some(conversation => conversation.id === convId)) {
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

  const deleteConversation = id => {
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
  const login = async (email, password, role = 'user') => {
    const isAuthority =
      role === 'authority' ||
      email?.toLowerCase() === 'authority@weathergpt.com' ||
      email?.toLowerCase().endsWith('.gov.in')

    try {
      const result = await api.login({ email, password })
      localStorage.setItem('weathergpt_token', result.token)
      const loggedUser = normalizeUser({
        ...result.user,
        role: result.user.role || (isAuthority ? 'authority' : 'user'),
        ...(isAuthority
          ? {
              department: result.user.department || authorityUser.department,
              state: result.user.state || authorityUser.state,
              badge: 'Authority'
            }
          : {})
      })
      setUser(loggedUser)
      setIsAuthenticated(true)
      setCurrentPage('dashboard')
      addToast(
        isAuthority
          ? `Welcome, ${loggedUser.name || 'Authority Admin'} (Official Access)`
          : `Welcome back to WeatherGPT!`,
        'success'
      )
      return result
    } catch (apiError) {
      // Fallback mock authentication if backend API server is offline or in client-only demo mode
      if (isAuthority) {
        if (
          email?.toLowerCase() === 'authority@weathergpt.com' ||
          email?.toLowerCase().endsWith('.gov.in') ||
          password === 'AuthorityPassword123!'
        ) {
          const authObj = normalizeUser({
            ...authorityUser,
            email: email || authorityUser.email
          })
          localStorage.setItem('weathergpt_token', 'mock_authority_token_' + Date.now())
          setUser(authObj)
          setIsAuthenticated(true)
          setCurrentPage('dashboard')
          addToast(`Welcome, Authority Admin (Official Access)`, 'success')
          return { user: authObj, token: 'mock_authority_token' }
        } else {
          throw new Error(apiError.message || 'Invalid authority credentials. Check email and password.')
        }
      } else {
        if (email === 'sidpatil@gmail.com' && (password === 'password123' || !password)) {
          const userObj = normalizeUser(initialUser)
          localStorage.setItem('weathergpt_token', 'mock_user_token_' + Date.now())
          setUser(userObj)
          setIsAuthenticated(true)
          setCurrentPage('dashboard')
          addToast(`Welcome back to WeatherGPT!`, 'success')
          return { user: userObj, token: 'mock_user_token' }
        }
        throw apiError
      }
    }
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
        weatherData,
        weatherLoading,
        refreshWeather,
        forecastData,
        forecastLoading,
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
