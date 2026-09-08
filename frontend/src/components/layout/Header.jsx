import React, { useState, useCallback } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import NotificationListener from '../NotificationListener';
import {
  Globe,
  Moon,
  Sun,
  Bell,
  Menu,
  X,
  ChevronDown,
  Check,
  AlertTriangle,
  LogOut,
  Settings as SettingsIcon,
  ShieldAlert
} from 'lucide-react';

export const Header = ({ isMobileOpen, setIsMobileOpen }) => {
  const {
    currentPage,
    user,
    alerts,
    setCurrentPage,
    setSettings,
    addToast,
    logout
  } = useWeather();

  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t, supportedLanguages } = useLanguage();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Receive notification from Socket.IO
  const handleNotification = useCallback((notification) => {
    setNotifications((previous) => [notification, ...previous]);

    if (addToast) {
      addToast(
        `${notification.title}: ${notification.message}`,
        'warning'
      );
    }

    // Browser notification
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      new Notification(notification.title, {
        body: notification.message
      });
    }
  }, [addToast]);

  const requestNotificationPermission = async () => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.error('Notification permission error:', error);
      }
    }
  };

  const getPageInfo = () => {
    if (user?.role === 'authority') {
      switch (currentPage) {
        case 'dashboard':
          return {
            title: t('authorityDashboardTitle') || `Welcome, ${user?.name || 'Dr. A. Sharma'}`,
            subtitle: t('authorityDashboardSubtitle') || `${user?.state || 'Maharashtra State'} Authority • Live Overview`
          };
        case 'alerts':
          return {
            title: t('authorityAlertsTitle') || 'Weather Alerts',
            subtitle: t('authorityAlertsSubtitle') || 'View and manage all active and past alerts'
          };
        case 'weather-map':
          return {
            title: t('authorityWeatherMap') || 'Weather Map',
            subtitle: t('mapSubtitle') || 'Real-time weather conditions, alerts and forecasts'
          };
        case 'analytics':
          return {
            title: t('authorityAnalyticsTitle') || 'Analytics',
            subtitle: t('authorityAnalyticsSubtitle') || 'Insights and trends for better decision making'
          };
        case 'settings':
          return {
            title: t('authoritySettings') || 'Authority Settings',
            subtitle: t('settingsSubtitle') || 'Manage administrative preferences and authority profile'
          };
        default:
          return {
            title: 'WeatherGPT Authority',
            subtitle: 'State Disaster Management Operations'
          };
      }
    }

    switch (currentPage) {
      case 'settings':
        return { title: t('settings'), subtitle: t('settingsSubtitle') };
      case 'saved-locations':
        return { title: t('savedLocations'), subtitle: t('savedLocationsSubtitle') };
      case 'history':
        return { title: t('history'), subtitle: t('historySubtitle') };
      case 'weather-map':
        return { title: t('weatherMap'), subtitle: t('mapSubtitle') };
      case 'dashboard':
        return { title: t('dashboard'), subtitle: t('dashboardSubtitle') };
      case 'chat':
        return { title: t('chat'), subtitle: t('chatSubtitle') };
      case 'advisory':
        return { title: t('advisory'), subtitle: t('advisorySubtitle') };
      case 'alerts':
        return { title: t('alerts'), subtitle: t('alertsSubtitle') };
      case 'forecast':
        return { title: t('forecast'), subtitle: t('forecastSubtitle') };
      case 'news':
        return { title: t('newsTitle') || 'Weather & Climate News', subtitle: t('newsSubtitle') || 'Trending meteorological dispatches, severe weather reports & global climate intelligence' };
      case 'climate':
      case 'climate-historical':
        return { title: t('climate') || 'Climate Analysis', subtitle: t('climateSubtitle') || 'Historical climate & environmental trends' };
      default:
        return { title: 'WeatherGPT', subtitle: t('dashboardSubtitle') };
    }
  };

  const { title, subtitle } = getPageInfo();
  const currentLangObj = supportedLanguages.find(l => l.code === language) || supportedLanguages[0];

  const handleSelectLang = (code, name) => {
    setLanguage(code);
    setSettings(prev => ({ ...prev, language: code }));
    setIsLangOpen(false);
    const prefix = t('languageSwitchedToast') || (code === 'mr' ? 'भाषा बदलली:' : code === 'hi' ? 'भाषा बदली गई:' : 'Language switched to');
    addToast(`${prefix} ${name}`, 'info');
  };

  const totalNotificationCount = alerts.length + notifications.length;

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between transition-colors duration-200">
      {/* Real-time Socket Connection */}
      <NotificationListener
        userId={user?._id || user?.id}
        onNotification={handleNotification}
      />

      {/* Left Title & Mobile Menu Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          {isMobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        {currentPage !== 'dashboard' && (
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        )}
      </div>

      {/* Right Action Icons: High-UX Language Segmented Control, Dark Mode, Alerts Bell, User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Desktop 1-Click Segmented Language Switcher (Gov & Top App UX) */}
        <div className="hidden sm:flex items-center p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
          {supportedLanguages.map(lang => {
            const isActive = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelectLang(lang.code, lang.nativeName)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs scale-102'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title={`Switch to ${lang.name}`}
              >
                <span className="text-sm leading-none">{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Compact Language Dropdown */}
        <div className="relative sm:hidden">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-xs cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>{currentLangObj.nativeName}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-fadeIn">
              {supportedLanguages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLang(lang.code, lang.nativeName)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition cursor-pointer ${
                    language === lang.code
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </div>
                  {language === lang.code && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dark / Light Mode */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-xs cursor-pointer"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 fill-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 fill-slate-200" />
          )}
        </button>

        {/* Live Emergency Broadcast Quick Access */}
        <button
          onClick={() => {
            setCurrentPage('alerts');
            addToast(t('emergencyBroadcast') || 'Emergency Alert Center', 'info');
          }}
          className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition shadow-xs cursor-pointer"
          title={t('emergencyBroadcast') || 'Emergency Broadcast'}
          aria-label={t('emergencyBroadcast') || 'Emergency Broadcast'}
        >
          <ShieldAlert className="w-4 h-4 animate-pulse" />
        </button>

        {/* Real-Time Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setIsAlertsOpen(!isAlertsOpen);
              requestNotificationPermission();
            }}
            className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-xs cursor-pointer"
            aria-label={t('alerts')}
          >
            <Bell className="w-4 h-4" />
            {totalNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {totalNotificationCount > 99 ? '99+' : totalNotificationCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isAlertsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-fadeIn">
              {/* Live Real-time notifications */}
              {notifications.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      New Notifications ({notifications.length})
                    </span>
                    <button
                      onClick={() => setNotifications([])}
                      className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                    {notifications.map((notification, index) => (
                      <div
                        key={notification._id || `notification-${index}`}
                        className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30"
                      >
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {notification.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weather Alerts */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{t('alerts')}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                    Live
                  </span>
                </h3>
                <button
                  onClick={() => {
                    setCurrentPage('alerts');
                    setIsAlertsOpen(false);
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                >
                  {language === 'mr' ? 'सर्व पहा' : language === 'hi' ? 'सभी देखें' : 'View all'}
                </button>
              </div>

              <div className="space-y-2 mt-2 max-h-56 overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No active weather alerts</p>
                ) : (
                  alerts.slice(0, 4).map((alert) => (
                    <div
                      key={alert.id || alert._id}
                      onClick={() => {
                        setCurrentPage('alerts');
                        setIsAlertsOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {alert.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {alert.region || alert.area}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-1.5 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-fadeIn space-y-1">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user?.email || 'user@weathergpt.io'}
                </p>
                {user?.role && (
                  <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-md uppercase">
                    {user.role}
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  setCurrentPage('settings');
                  setIsProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('settings')}</span>
              </button>

              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

              <button
                onClick={() => {
                  logout();
                  setIsProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>{t('logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
