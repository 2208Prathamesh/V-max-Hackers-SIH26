import React, { useState } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
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
  Settings as SettingsIcon
} from 'lucide-react';

export const Header = ({ isMobileOpen, setIsMobileOpen }) => {
  const { currentPage, user, alerts, setCurrentPage, settings, setSettings, addToast, logout } = useWeather();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t, supportedLanguages } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const getPageInfo = () => {
    switch (currentPage) {
      case 'settings':
        return { title: t('settings'), subtitle: 'Manage your preferences and account settings' };
      case 'saved-locations':
        return { title: t('savedLocations'), subtitle: 'Quickly access weather updates for your saved locations' };
      case 'history':
        return { title: t('history'), subtitle: 'View and manage your past conversations & 20-year climate trends' };
      case 'weather-map':
        return { title: t('weatherMap'), subtitle: 'Explore real-time weather conditions & Doppler radar across India' };
      case 'dashboard':
        return { title: t('dashboard'), subtitle: 'Real-time AI weather intelligence & environmental metrics' };
      case 'chat':
        return { title: t('chat'), subtitle: 'Ask any meteorological or climate query with grounded AI reasoning' };
      case 'advisory':
        return { title: t('advisory'), subtitle: 'Soil moisture agronomy guide & emergency disaster action plan' };
      case 'alerts':
        return { title: t('alerts'), subtitle: 'Severe weather warnings, radar advisories, and IMD bulletins' };
      case 'forecast':
        return { title: t('forecast'), subtitle: '7-14 day precision meteorological projections & NWP models' };
      default:
        return { title: 'WeatherGPT', subtitle: 'AI Weather Intelligence' };
    }
  };

  const { title, subtitle } = getPageInfo();

  const currentLangObj = supportedLanguages.find(l => l.code === language) || supportedLanguages[0];

  const handleSelectLang = (code, name) => {
    setLanguage(code);
    setSettings(prev => ({ ...prev, language: code }));
    setIsLangOpen(false);
    addToast(`Language switched to ${name}`, 'info');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-4 flex items-center justify-between transition-colors duration-200">
      {/* Left Title & Mobile Menu Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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

      {/* Right Action Icons: Language, Dark Mode, Alerts Bell, User Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Language Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-xs"
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-semibold">{currentLangObj.flag} {currentLangObj.nativeName}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-fadeIn">
              {supportedLanguages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLang(lang.code, lang.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition ${
                    language === lang.code
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name} ({lang.nativeName})</span>
                  </div>
                  {language === lang.code && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-xs"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 fill-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 fill-slate-200" />
          )}
        </button>

        {/* Alerts Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-xs"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </button>

          {isAlertsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{t('alerts')}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                    Live
                  </span>
                </h3>
                <button
                  onClick={() => {
                    setCurrentPage('alerts');
                    setIsAlertsOpen(false);
                  }}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  View all
                </button>
              </div>

              <div className="space-y-2 mt-3 max-h-60 overflow-y-auto">
                <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl">
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Heavy Rainfall Warning (IMD Orange Alert)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Pune & Konkan: Expect heavy showers and localized waterlogging over next 24h.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-fadeIn">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'user@weathergpt.com'}</p>
              </div>
              <button
                onClick={() => {
                  setCurrentPage('settings');
                  setIsProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition mt-1"
              >
                <SettingsIcon className="w-3.5 h-3.5" />
                <span>{t('settings')}</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  setIsProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
              >
                <LogOut className="w-3.5 h-3.5" />
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
