import React, { useState, useEffect } from 'react'
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  Platform,
  Pressable,
  ActivityIndicator
} from 'react-native'
import { Header } from './src/components/Header'
import { Sidebar } from './src/components/Sidebar'
import { BottomNav } from './src/components/BottomNav'
import { DashboardScreen } from './src/screens/DashboardScreen'
import { WeatherMapScreen } from './src/screens/WeatherMapScreen'
import { ChatScreen } from './src/screens/ChatScreen'
import { AlertsScreen } from './src/screens/AlertsScreen'
import { ForecastScreen } from './src/screens/ForecastScreen'
import { HistoryScreen } from './src/screens/HistoryScreen'
import { SavedLocationsScreen } from './src/screens/SavedLocationsScreen'
import { SettingsScreen } from './src/screens/SettingsScreen'
import { LoginScreen } from './src/screens/LoginScreen'
import { AirQualityScreen } from './src/screens/AirQualityScreen'
import { CompareLocationsScreen } from './src/screens/CompareLocationsScreen'
import { AddLocationScreen } from './src/screens/AddLocationScreen'
import { AlertDetailsScreen } from './src/screens/AlertDetailsScreen'
import { PremiumScreen } from './src/screens/PremiumScreen'
import { ProfileScreen } from './src/screens/ProfileScreen'
import { AviationScreen } from './src/screens/AviationScreen'
import { MarineScreen } from './src/screens/MarineScreen'
import { UrbanFloodScreen } from './src/screens/UrbanFloodScreen'
import { getColors } from './src/theme/colors'
import {
  api,
  setAuthToken,
  getAuthToken,
  isBackendAvailable,
  getApiBaseUrl
} from './src/services/api'

export default function App () {
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [user, setUser] = useState(null)
  const [currentScreen, setCurrentScreen] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const [unit, setUnit] = useState('C')
  const [language, setLanguage] = useState('en')
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [backendReady, setBackendReady] = useState(false)
  const [liveAlerts, setLiveAlerts] = useState([])

  const c = getColors(isDark)

  // Keep mobile connected to backend with automatic heartbeat/polling
  useEffect(() => {
    let isMounted = true

    const checkBackend = async () => {
      try {
        await api.detectServer()
        await api.health()
        if (!isMounted) return
        setBackendReady(true)

        // Ensure session with database
        await api.ensureAuth()
        const token = getAuthToken()
        if (token) {
          try {
            const profile = await api.currentUser()
            if (isMounted && profile) setUser(profile)
          } catch {}
        }

        // Fetch real-time active alerts directly from backend
        try {
          const alerts = await api.activeAlerts()
          if (isMounted && Array.isArray(alerts) && alerts.length > 0) {
            setLiveAlerts(alerts)
          }
        } catch {}
      } catch {
        if (isMounted) setBackendReady(false)
      }
    }

    checkBackend()
    const interval = setInterval(checkBackend, 5000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  const showToast = message => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage('')
    }, 2500)
  }

  const handleLogin = async (email, password) => {
    try {
      const result = await api.login({ email, password })
      if (result?.token) {
        setAuthToken(result.token)
        if (result.user) setUser(result.user)
        setIsLoggedIn(true)
        showToast(`Signed in as ${result.user?.name || email}`)
        return
      }
      setIsLoggedIn(true)
      showToast('Connected to session')
    } catch (error) {
      setIsLoggedIn(true)
      showToast(error?.message || 'Login fallback activated')
    }
  }

  const handleRegister = async (name, email, password) => {
    try {
      const result = await api.register({ name, email, password })
      if (result?.token) {
        setAuthToken(result.token)
        if (result.user) setUser(result.user)
        setIsLoggedIn(true)
        showToast(`Account created for ${result.user?.name || name}`)
        return
      }
      setIsLoggedIn(true)
      showToast('Account created successfully')
    } catch (error) {
      setIsLoggedIn(true)
      showToast(error?.message || 'Created local demo account')
    }
  }

  const handleNavigate = screenId => {
    setCurrentScreen(screenId)
  }

  const handleLogout = async () => {
    try {
      await api.logout().catch(() => {})
    } catch {}
    setAuthToken(null)
    setUser(null)
    setIsLoggedIn(false)
    setCurrentScreen('dashboard')
    setIsSidebarOpen(false)
    showToast('Logged out successfully')
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} onRegister={handleRegister} />
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'weather-map':
        return (
          <WeatherMapScreen
            isDark={isDark}
            unit={unit}
            onNotification={showToast}
            backendReady={backendReady}
          />
        )
      case 'chat':
        return (
          <ChatScreen
            isDark={isDark}
            unit={unit}
            backendReady={backendReady}
            onNotification={showToast}
          />
        )
      case 'air-quality':
        return (
          <AirQualityScreen
            isDark={isDark}
            onNavigate={handleNavigate}
            onNotification={showToast}
          />
        )
      case 'compare':
        return (
          <CompareLocationsScreen
            isDark={isDark}
            unit={unit}
            onNavigate={handleNavigate}
          />
        )
      case 'add-location':
        return (
          <AddLocationScreen
            isDark={isDark}
            unit={unit}
            onNavigate={handleNavigate}
            onNotification={showToast}
            backendReady={backendReady}
          />
        )
      case 'alert-details':
        return (
          <AlertDetailsScreen
            isDark={isDark}
            alertData={selectedAlert}
            onNavigate={handleNavigate}
            onNotification={showToast}
          />
        )
      case 'premium':
        return (
          <PremiumScreen
            isDark={isDark}
            onNavigate={handleNavigate}
            onNotification={showToast}
          />
        )
      case 'profile':
        return (
          <ProfileScreen
            isDark={isDark}
            user={user}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            onNotification={showToast}
            backendReady={backendReady}
          />
        )
      case 'alerts':
        return (
          <AlertsScreen
            isDark={isDark}
            onNotification={showToast}
            backendReady={backendReady}
            onNavigate={handleNavigate}
            onSelectAlert={setSelectedAlert}
          />
        )
      case 'aviation':
        return (
          <AviationScreen
            isDark={isDark}
            onNotification={showToast}
            backendReady={backendReady}
            onNavigate={handleNavigate}
          />
        )
      case 'marine':
        return (
          <MarineScreen
            isDark={isDark}
            onNotification={showToast}
            backendReady={backendReady}
            onNavigate={handleNavigate}
          />
        )
      case 'urban-flood':
        return (
          <UrbanFloodScreen
            isDark={isDark}
            onNotification={showToast}
            backendReady={backendReady}
            onNavigate={handleNavigate}
          />
        )
      case 'forecast':
        return (
          <ForecastScreen
            isDark={isDark}
            unit={unit}
            backendReady={backendReady}
            onNavigate={handleNavigate}
          />
        )
      case 'history':
        return (
          <HistoryScreen
            isDark={isDark}
            onNavigate={handleNavigate}
            backendReady={backendReady}
          />
        )
      case 'saved-locations':
        return (
          <SavedLocationsScreen
            isDark={isDark}
            unit={unit}
            onNavigate={handleNavigate}
            onNotification={showToast}
            backendReady={backendReady}
          />
        )
      case 'settings':
        return (
          <SettingsScreen
            isDark={isDark}
            onToggleTheme={() => setIsDark(!isDark)}
            unit={unit}
            onToggleUnit={setUnit}
            language={language}
            onSelectLanguage={setLanguage}
            onLogout={handleLogout}
            onNotification={showToast}
            backendReady={backendReady}
          />
        )
      case 'dashboard':
      default:
        return (
          <DashboardScreen
            isDark={isDark}
            unit={unit}
            onNavigate={handleNavigate}
            backendReady={backendReady}
          />
        )
    }
  }

  return (
    <SafeAreaView
      style={[
        styles.root,
        { backgroundColor: isDark ? '#050608' : '#EAEEF3' }
      ]}
    >
      <View
        style={[
          styles.deviceWrapper,
          {
            backgroundColor: c.bg,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#D1D5DB'
          }
        ]}
      >
        {/* Ambient atmospheric glassmorphism mesh glows */}
        <View
          style={[
            styles.ambientOrbTop,
            { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.12)' : 'rgba(147, 197, 253, 0.28)' }
          ]}
          pointerEvents='none'
        />
        <View
          style={[
            styles.ambientOrbMid,
            { backgroundColor: isDark ? 'rgba(6, 182, 212, 0.08)' : 'rgba(165, 243, 252, 0.22)' }
          ]}
          pointerEvents='none'
        />
        <View
          style={[
            styles.ambientOrbBottom,
            { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(216, 180, 254, 0.22)' }
          ]}
          pointerEvents='none'
        />

        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={isDark ? '#0A0B0E' : '#F8F9FA'}
        />

        {/* Universal Header - Available on each and every page */}
        <Header
          currentScreen={currentScreen}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          onOpenMenu={() => setIsSidebarOpen(true)}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          language={language}
          onSelectLanguage={setLanguage}
          alerts={liveAlerts}
        />

        {/* Universal Sidebar Drawer - Accessible across the whole app */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
        />

        {/* Screen Content Body */}
        <View style={styles.screenContainer}>{renderScreen()}</View>

        {/* Modern Bottom Navigation Bar */}
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          onOpenMenu={() => setIsSidebarOpen(true)}
          isDark={isDark}
          alertCount={liveAlerts.length}
        />

        {/* Toast Notification Banner */}
        {toastMessage ? (
          <View
            style={[
              styles.toastContainer,
              {
                backgroundColor: isDark ? '#181A20' : '#121316',
                borderColor: isDark ? '#282A30' : '#E5E7EB',
                borderWidth: 1
              }
            ]}
          >
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  deviceWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : '100%',
    alignSelf: 'center',
    borderLeftWidth: Platform.OS === 'web' ? 1 : 0,
    borderRightWidth: Platform.OS === 'web' ? 1 : 0,
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'web' ? 0.35 : 0,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    position: 'relative',
    overflow: 'hidden'
  },
  screenContainer: {
    flex: 1
  },
  toastContainer: {
    position: 'absolute',
    bottom: 74,
    left: 16,
    right: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 8,
    zIndex: 99
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  ambientOrbTop: {
    position: 'absolute',
    top: -40,
    right: -50,
    width: 260,
    height: 260,
    borderRadius: 130,
    zIndex: 0
  },
  ambientOrbMid: {
    position: 'absolute',
    top: 360,
    left: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    zIndex: 0
  },
  ambientOrbBottom: {
    position: 'absolute',
    bottom: 60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    zIndex: 0
  }
})
