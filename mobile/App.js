import React, { useState, useEffect } from 'react'
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  Platform
} from 'react-native'
import { Header } from './src/components/Header'
import { Sidebar } from './src/components/Sidebar'
import { DashboardScreen } from './src/screens/DashboardScreen'
import { WeatherMapScreen } from './src/screens/WeatherMapScreen'
import { ChatScreen } from './src/screens/ChatScreen'
import { AlertsScreen } from './src/screens/AlertsScreen'
import { ForecastScreen } from './src/screens/ForecastScreen'
import { HistoryScreen } from './src/screens/HistoryScreen'
import { SavedLocationsScreen } from './src/screens/SavedLocationsScreen'
import { SettingsScreen } from './src/screens/SettingsScreen'
import { LoginScreen } from './src/screens/LoginScreen'
import { alertsData } from './src/data/mockData'
import { getColors } from './src/theme/colors'
import { api, isBackendAvailable } from './src/services/api'

export default function App () {
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [currentScreen, setCurrentScreen] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [unit, setUnit] = useState('C')
  const [language, setLanguage] = useState('en')
  const [toastMessage, setToastMessage] = useState('')
  const [backendReady, setBackendReady] = useState(false)

  const c = getColors(isDark)

  useEffect(() => {
    let isMounted = true
    api
      .health()
      .then(() => {
        if (isMounted) setBackendReady(true)
      })
      .catch(() => {
        if (isMounted) setBackendReady(false)
      })

    return () => {
      isMounted = false
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
      if (backendReady) {
        const result = await api.login({ email, password })
        if (result?.token) {
          globalThis.__weathergpt_token = result.token
          if (result.user) {
            globalThis.__weathergpt_user = JSON.stringify(result.user)
          }
          setIsLoggedIn(true)
          showToast('Connected to backend')
          return
        }
      }
      setIsLoggedIn(true)
      showToast('Using local demo session')
    } catch (error) {
      setIsLoggedIn(true)
      showToast(error?.message || 'Login fallback activated')
    }
  }

  const handleNavigate = screenId => {
    setCurrentScreen(screenId)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentScreen('dashboard')
    setIsSidebarOpen(false)
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />
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
        return <ChatScreen isDark={isDark} unit={unit} />
      case 'alerts':
        return (
          <AlertsScreen
            isDark={isDark}
            onNotification={showToast}
            backendReady={backendReady}
          />
        )
      case 'forecast':
        return (
          <ForecastScreen
            isDark={isDark}
            unit={unit}
            backendReady={backendReady}
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
    <SafeAreaView style={[styles.root, { backgroundColor: c.bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={c.card}
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
        alerts={alertsData}
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

      {/* Toast Notification Banner */}
      {toastMessage ? (
        <View
          style={[
            styles.toastContainer,
            { backgroundColor: isDark ? '#1E293B' : '#0F172A' }
          ]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  screenContainer: {
    flex: 1
  },
  toastContainer: {
    position: 'absolute',
    bottom: 20,
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
  }
})
