import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
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
import { LoginPage } from './pages/LoginPage';
import { ToastContainer } from './components/common/Toast';

const AppContent = () => {
  const { currentPage, isAuthenticated } = useWeather();

  // If not authenticated or on login page, display the WeatherGPT Login Page
  if (!isAuthenticated || currentPage === 'login') {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'chat':
        return <ChatPage />;
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
      <WeatherProvider>
        <AppContent />
      </WeatherProvider>
    </ThemeProvider>
  );
}

