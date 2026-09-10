import React, { useEffect, Suspense, lazy } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { WeatherProvider, useWeather } from './context/WeatherContext'
import { Layout } from './components/layout/Layout'
import { LoginPage } from './pages/LoginPage'
import { ToastContainer } from './components/common/Toast'
import { ErrorBoundary } from './components/common/ErrorBoundary'

// ---------------------------------------------------------------------------
// Route-Level Code Splitting — reduces initial JS bundle by >90%
// ---------------------------------------------------------------------------

// Shared / Citizen / Farmer pages
const WeatherMapPage = lazy(() => import('./pages/WeatherMapPage').then(m => ({ default: m.WeatherMapPage })))
const SavedLocationsPage = lazy(() => import('./pages/SavedLocationsPage').then(m => ({ default: m.SavedLocationsPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const ChatPage = lazy(() => import('./pages/ChatPage').then(m => ({ default: m.ChatPage })))
const AlertsPage = lazy(() => import('./pages/AlertsPage').then(m => ({ default: m.AlertsPage })))
const ClimateHistorical = lazy(() => import('./pages/ClimateHistorical'))
const ForecastPage = lazy(() => import('./pages/ForecastPage').then(m => ({ default: m.ForecastPage })))
const AdvisoryPage = lazy(() => import('./pages/AdvisoryPage').then(m => ({ default: m.AdvisoryPage })))
const NewsPage = lazy(() => import('./pages/NewsPage').then(m => ({ default: m.NewsPage })))
const DisasterSopPage = lazy(() => import('./pages/DisasterSopPage').then(m => ({ default: m.DisasterSopPage })))

// Authority pages
const AuthorityDashboardPage = lazy(() => import('./pages/authority/AuthorityDashboardPage').then(m => ({ default: m.AuthorityDashboardPage })))
const AuthorityAlertsPage = lazy(() => import('./pages/authority/AuthorityAlertsPage').then(m => ({ default: m.AuthorityAlertsPage })))
const AuthorityWeatherMapPage = lazy(() => import('./pages/authority/AuthorityWeatherMapPage').then(m => ({ default: m.AuthorityWeatherMapPage })))
const AuthorityAnalyticsPage = lazy(() => import('./pages/authority/AuthorityAnalyticsPage').then(m => ({ default: m.AuthorityAnalyticsPage })))

// Admin pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })))
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage').then(m => ({ default: m.AdminAnalyticsPage })))
const AdminSystemPage = lazy(() => import('./pages/admin/AdminSystemPage').then(m => ({ default: m.AdminSystemPage })))

// Maintenance Page
const MaintenancePage = lazy(() => import('./pages/MaintenancePage').then(m => ({ default: m.MaintenancePage })))

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      <span className="text-sm font-medium text-slate-400 animate-pulse">Loading view...</span>
    </div>
  </div>
)

const AppContent = () => {
  const { currentPage, setCurrentPage, isAuthenticated, user, settings, maintenanceMode } = useWeather()
  const { language, setLanguage } = useLanguage()

  // Keep language in sync with authenticated user's preferred language
  useEffect(() => {
    const preferred = user?.language || settings?.language
    if (preferred && preferred !== language) {
      setLanguage(preferred)
    }
  }, [user?.language, settings?.language])

  const isAuthorityOrAdmin = user?.role === 'admin' || user?.role === 'authority'
  const isAccessRoute = currentPage === 'access' || (typeof window !== 'undefined' && window.location.hash.replace(/^#\/?/, '') === 'access')

  // 1. Maintenance Mode Interlock Gate
  if (maintenanceMode?.enabled && !isAuthorityOrAdmin) {
    if (isAccessRoute || currentPage === 'login') {
      return (
        <>
          <div className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-black tracking-wide flex items-center justify-center gap-2">
            <span>🛡️ Platform Maintenance Active — Authorized Personnel Login (/access)</span>
          </div>
          <LoginPage />
          <ToastContainer />
        </>
      )
    }
    return (
      <Suspense fallback={<PageLoader />}>
        <MaintenancePage
          maintenance={maintenanceMode}
          onStaffAccess={() => setCurrentPage('access')}
        />
        <ToastContainer />
      </Suspense>
    )
  }

  // 2. Standard Login Gate (if not authenticated or explicitly on login/access page)
  if (!isAuthenticated || currentPage === 'login' || (currentPage === 'access' && !isAuthenticated)) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    )
  }

  const renderCurrentPage = () => {
    const role = user?.role || 'user'

    // -----------------------------------------------------------------------
    // ADMIN — System management portal
    // -----------------------------------------------------------------------
    if (role === 'admin') {
      switch (currentPage) {
        case 'admin-users':
          return <AdminUsersPage />
        case 'admin-analytics':
          return <AdminAnalyticsPage />
        case 'admin-system':
          return <AdminSystemPage />
        case 'settings':
          return <SettingsPage />
        case 'dashboard':
        default:
          return <AdminDashboardPage />
      }
    }

    // -----------------------------------------------------------------------
    // AUTHORITY — Disaster management portal + full citizen weather access
    // -----------------------------------------------------------------------
    if (role === 'authority') {
      switch (currentPage) {
        // Authority-specific pages
        case 'authority-alerts':
        case 'alerts':
          return <AuthorityAlertsPage />
        case 'authority-map':
          return <AuthorityWeatherMapPage />
        case 'authority-analytics':
        case 'analytics':
          return <AuthorityAnalyticsPage />

        // Shared citizen weather pages (available to authority too)
        case 'weather-dashboard':
        case 'citizen-dashboard':
          return <DashboardPage />
        case 'weather-map':
          return <WeatherMapPage />
        case 'forecast':
          return <ForecastPage />
        case 'news':
          return <NewsPage />
        case 'climate-historical':
        case 'history':
          return <ClimateHistorical />
        case 'saved-locations':
          return <SavedLocationsPage />
        case 'chat':
          return <ChatPage />
        case 'disaster-sops':
          return <DisasterSopPage />
        case 'settings':
          return <SettingsPage />
        case 'authority-dashboard':
        case 'dashboard':
        default:
          return <AuthorityDashboardPage />
      }
    }

    // -----------------------------------------------------------------------
    // FARMER — Citizen pages + agro advisory
    // -----------------------------------------------------------------------
    if (role === 'farmer') {
      switch (currentPage) {
        case 'chat':
          return <ChatPage />
        case 'advisory':
          return <AdvisoryPage />
        case 'alerts':
          return <AlertsPage />
        case 'disaster-sops':
          return <DisasterSopPage />
        case 'weather-map':
          return <WeatherMapPage />
        case 'forecast':
          return <ForecastPage />
        case 'news':
          return <NewsPage />
        case 'climate-historical':
        case 'history':
          return <ClimateHistorical />
        case 'saved-locations':
          return <SavedLocationsPage />
        case 'settings':
          return <SettingsPage />
        case 'dashboard':
        default:
          return <DashboardPage />
      }
    }

    // -----------------------------------------------------------------------
    // CITIZEN (user) — Standard weather information portal
    // -----------------------------------------------------------------------
    switch (currentPage) {
      case 'chat':
        return <ChatPage />
      case 'alerts':
        return <AlertsPage />
      case 'disaster-sops':
        return <DisasterSopPage />
      case 'weather-map':
        return <WeatherMapPage />
      case 'forecast':
        return <ForecastPage />
      case 'news':
        return <NewsPage />
      case 'climate-historical':
      case 'history':
        return <ClimateHistorical />
      case 'saved-locations':
        return <SavedLocationsPage />
      case 'settings':
        return <SettingsPage />
      case 'dashboard':
      default:
        return <DashboardPage />
    }
  }

  return (
    <Layout>
      {maintenanceMode?.enabled && isAuthorityOrAdmin && (
        <div className='bg-amber-500/90 text-slate-950 px-4 py-2 text-center text-xs font-black tracking-wide flex items-center justify-center gap-2 shadow-xs'>
          <span>🛠️ Maintenance Mode Active — Site restricted to Authorized Staff ({user?.role?.toUpperCase()}). Public traffic is blocked.</span>
        </div>
      )}
      <Suspense fallback={<PageLoader />}>
        {renderCurrentPage()}
      </Suspense>
    </Layout>
  )
}

export default function App () {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <WeatherProvider>
            <AppContent />
          </WeatherProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
