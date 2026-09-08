import React, { useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { WeatherProvider, useWeather } from './context/WeatherContext';
import { Layout } from './components/layout/Layout';
import { WeatherMapPage } from './pages/WeatherMapPage';
import { SavedLocationsPage } from './pages/SavedLocationsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { AlertsPage } from './pages/AlertsPage';
import ClimateHistorical from './pages/ClimateHistorical';
import { ForecastPage } from './pages/ForecastPage';
import { AdvisoryPage } from './pages/AdvisoryPage';
import { LoginPage } from './pages/LoginPage';
<<<<<<< HEAD
import { AuthorityDashboardPage } from './pages/authority/AuthorityDashboardPage';
import { AuthorityAlertsPage } from './pages/authority/AuthorityAlertsPage';
import { AuthorityWeatherMapPage } from './pages/authority/AuthorityWeatherMapPage';
import { AuthorityAnalyticsPage } from './pages/authority/AuthorityAnalyticsPage';
=======
import { NewsPage } from './pages/NewsPage';
>>>>>>> d55472b6f3372486c9b67169682caa0f93fcdf11
import { ToastContainer } from './components/common/Toast';

const AppContent = () => {
  const { currentPage, isAuthenticated, user, settings } = useWeather();
  const { language, setLanguage } = useLanguage();

  // Keep language in sync with authenticated user's preferred language
  useEffect(() => {
    const preferred = user?.language || settings?.language;
    if (preferred && preferred !== language) {
      setLanguage(preferred);
    }
  }, [user?.language, settings?.language]);

  // If not authenticated or on login page, display the WeatherGPT Login Page
  if (!isAuthenticated || currentPage === 'login') {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  };

  const renderCurrentPage = () => {
    const isAuthority = user?.role === 'authority';

    // Authority Specific Routing
    if (isAuthority) {
      switch (currentPage) {
        case 'dashboard':
          return <AuthorityDashboardPage />;
        case 'alerts':
          return <AuthorityAlertsPage />;
        case 'weather-map':
          return <AuthorityWeatherMapPage />;
        case 'analytics':
          return <AuthorityAnalyticsPage />;
        case 'settings':
          return <SettingsPage />;
        default:
          return <AuthorityDashboardPage />;
      }
    }

    // Standard User Routing (Preserved 100%)
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'chat':
        return <ChatPage />;
      case 'advisory':
        return <AdvisoryPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'weather-map':
        return <WeatherMapPage />;
      case 'forecast':
        return <ForecastPage />;
      case 'saved-locations':
        return <SavedLocationsPage />;
      case 'history':
        return <HistoryPage />;
      case 'climate-historical':
        return <ClimateHistorical />;
      case 'news':
        return <NewsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return <Layout>{renderCurrentPage()}</Layout>;
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <WeatherProvider>
          <AppContent />
        </WeatherProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
