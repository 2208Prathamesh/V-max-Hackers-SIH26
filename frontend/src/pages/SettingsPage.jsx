import React, { useState } from 'react';
import { useWeather } from '../context/WeatherContext';
import { useTheme } from '../context/ThemeContext';
import { 
  User, 
  Lock, 
  Clock, 
  Thermometer, 
  Wind, 
  Gauge, 
  Droplets, 
  AlertTriangle, 
  Calendar, 
  Mail, 
  Zap, 
  Shield, 
  HelpCircle, 
  ExternalLink, 
  ChevronRight, 
  Sliders, 
  Bell, 
  Cloud, 
  Palette, 
  Globe, 
  Link as LinkIcon, 
  Info,
  Check,
  Trash2
} from 'lucide-react';
import { Switch } from '../components/common/Switch';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export const SettingsPage = () => {
  const { 
    user, 
    settings, 
    setSettings, 
    updateUnits, 
    updateNotifications, 
    setIsEditProfileOpen, 
    addToast 
  } = useWeather();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t, supportedLanguages } = useLanguage();

  const [activeTab, setActiveTab] = useState('general');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const navTabs = [
    { id: 'general', label: t('general'), icon: Sliders },
    { id: 'units', label: t('unitsAndFormat'), icon: Thermometer },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'weather-prefs', label: t('weatherPreferences'), icon: Cloud },
    { id: 'privacy', label: t('privacyAndData'), icon: Lock },
    { id: 'appearance', label: t('appearance'), icon: Palette },
    { id: 'language', label: t('language'), icon: Globe },
    { id: 'connected', label: t('connectedAccounts'), icon: LinkIcon },
    { id: 'about', label: t('about'), icon: Info },
  ];

  const handleTimezoneChange = (e) => {
    setSettings(prev => ({ ...prev, timeZone: e.target.value }));
    addToast(`Time zone updated to ${e.target.value}`, 'success');
  };

  const handleLanguageChange = async (langCode) => {
    setLanguage(langCode);
    setSettings(prev => ({ ...prev, language: langCode }));
    try {
      await api.updateSettings({ language: langCode });
    } catch {}
    const matched = supportedLanguages.find(l => l.code === langCode);
    addToast(`Language updated to ${matched?.name || langCode} (${matched?.nativeName})`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs navigation matching screenshot */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {navTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold border border-blue-100 dark:border-blue-900/40 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main 2-Column Grid matching Screenshot 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Settings Sections (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. General Section Card */}
          <div className="bg-white dark:bg-[#121316] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-card space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              {t('general')}
            </h2>

            <div className="space-y-5 divide-y divide-slate-100 dark:divide-slate-800/60">
              {/* Profile Information */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('profileInfo')}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('profileInfoDesc')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl transition cursor-pointer"
                >
                  {t('editProfile')}
                </button>
              </div>

              {/* Change Password */}
              <div className="flex items-center justify-between pt-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('changePassword')}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('changePasswordDesc')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl transition cursor-pointer"
                >
                  {t('change')}
                </button>
              </div>

              {/* Time Zone */}
              <div className="flex items-center justify-between pt-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('timeZone')}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('timeZoneDesc')}</p>
                  </div>
                </div>
                <select
                  value={settings.timeZone}
                  onChange={handleTimezoneChange}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                >
                  <option value="(UTC+05:30) Asia/Kolkata">(UTC+05:30) Asia/Kolkata (IST)</option>
                  <option value="(UTC+00:00) UTC">(UTC+00:00) UTC</option>
                  <option value="(UTC-05:00) America/New_York">(UTC-05:00) America/New_York</option>
                  <option value="(UTC+08:00) Asia/Singapore">(UTC+08:00) Asia/Singapore</option>
                </select>
              </div>

              {/* Theme Mode Toggle */}
              <div className="flex items-center justify-between pt-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {language === 'mr' ? 'थीम मोड (डार्क / लाइट)' : language === 'hi' ? 'थीम मोड (डार्क / लाइट)' : 'Theme Mode (Dark / Light)'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {theme === 'dark' ? (language === 'mr' ? 'डार्क मोड सक्रिय' : language === 'hi' ? 'डार्क मोड सक्रिय' : 'Dark mode active') : (language === 'mr' ? 'लाइट मोड सक्रिय' : language === 'hi' ? 'लाइट मोड सक्रिय' : 'Light mode active')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl transition cursor-pointer"
                >
                  {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                </button>
              </div>
            </div>
          </div>

          {/* 2. Units & Format Section Card */}
          <div className="bg-white dark:bg-[#121316] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-card space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              {t('unitsAndFormat')}
            </h2>

            <div className="space-y-5 divide-y divide-slate-100 dark:divide-slate-800/60">
              {/* Temperature */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Thermometer className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('temperature')}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('chooseTempUnit')}</p>
                  </div>
                </div>
                <select
                  value={settings.units.temperature}
                  onChange={e => updateUnits('temperature', e.target.value)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                >
                  <option value="C">°C (Celsius)</option>
                  <option value="F">°F (Fahrenheit)</option>
                </select>
              </div>

              {/* Wind Speed */}
              <div className="flex items-center justify-between pt-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <Wind className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('windSpeed')}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('chooseWindUnit')}</p>
                  </div>
                </div>
                <select
                  value={settings.units.windSpeed}
                  onChange={e => updateUnits('windSpeed', e.target.value)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                >
                  <option value="kmh">km/h</option>
                  <option value="mph">mph</option>
                  <option value="ms">m/s</option>
                  <option value="knots">knots</option>
                </select>
              </div>

              {/* Pressure */}
              <div className="flex items-center justify-between pt-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('pressure')}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('choosePressureUnit')}</p>
                  </div>
                </div>
                <select
                  value={settings.units.pressure}
                  onChange={e => updateUnits('pressure', e.target.value)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                >
                  <option value="hPa">hPa</option>
                  <option value="inHg">inHg</option>
                  <option value="mmHg">mmHg</option>
                  <option value="bar">bar</option>
                </select>
              </div>

              {/* Precipitation */}
              <div className="flex items-center justify-between pt-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Precipitation</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Choose your preferred precipitation unit.</p>
                  </div>
                </div>
                <select
                  value={settings.units.precipitation}
                  onChange={e => updateUnits('precipitation', e.target.value)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                >
                  <option value="mm">mm</option>
                  <option value="in">inches</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Notifications Section Card */}
          <div className="bg-white dark:bg-[#121316] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-card space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Notifications
            </h2>

            <div className="space-y-5 divide-y divide-slate-100 dark:divide-slate-800/60">
              {/* Weather Alerts */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('alerts')}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('instantAlertsDesc')}</p>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.weatherAlerts}
                  onChange={val => updateNotifications('weatherAlerts', val)}
                />
              </div>

              {/* Daily Forecast */}
              <div className="flex items-center justify-between pt-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('dailyForecast')}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('dailyForecastDesc')}</p>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.dailyForecast}
                  onChange={val => updateNotifications('dailyForecast', val)}
                />
              </div>

              {/* Weekly Summary */}
              <div className="flex items-center justify-between pt-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('weeklySummary')}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('weeklySummaryDesc')}</p>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.weeklySummary}
                  onChange={val => updateNotifications('weeklySummary', val)}
                />
              </div>

              {/* Breaking News */}
              <div className="flex items-center justify-between pt-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('breakingNews')}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('breakingNewsDesc')}</p>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.breakingNews}
                  onChange={val => updateNotifications('breakingNews', val)}
                />
              </div>
            </div>
          </div>

          {/* 4. Language Selection Card */}
          <div id="language-section" className="bg-white dark:bg-[#121316] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {t('languageSettingsTitle')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t('languageSettingsDesc')}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {supportedLanguages.map(lang => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 shadow-sm'
                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <div>
                        <div className="text-xs sm:text-sm font-bold">
                          {lang.nativeName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {lang.name}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Delete Account Danger Card */}
          <div className="bg-rose-50/70 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">{t('deleteAccount')}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {t('deleteAccountDesc')}
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-300 dark:border-rose-800 rounded-xl transition bg-white dark:bg-rose-900/30 shrink-0 cursor-pointer"
            >
              {t('deleteAccount')}
            </button>
          </div>
        </div>

        {/* Right Column: Account Summary, Data & Privacy, Need Help (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Account Summary Card */}
          <div className="bg-white dark:bg-[#121316] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-card space-y-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('accountSummary')}</h2>

            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                {user.avatarInitials || 'SP'}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{user.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                <div className="mt-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {language === 'mr' ? 'सर्व वैशिष्ट्ये खुली (Full Access)' : language === 'hi' ? 'सभी सुविधाएं सक्रिय (Full Access)' : 'Full Access · Open Intelligence'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>{t('memberSince')}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{user.memberSince}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>{t('locationsSavedCount')}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{user.stats.locationsSaved}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>{t('conversationsTab')}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{user.stats.conversations}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>{t('alerts')}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{user.stats.alertsSet}</span>
              </div>
            </div>

            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <User className="w-4 h-4 text-blue-500" />
              <span>{t('editProfile')}</span>
            </button>
          </div>

          {/* Data & Privacy Card */}
          <div className="bg-white dark:bg-[#121316] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('dataAndPrivacy')}</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {language === 'mr' ? 'आम्ही तुमच्या गोपनीयतेचा आदर करतो आणि तुमचा डेटा सुरक्षित ठेवतो.' : language === 'hi' ? 'हम आपकी गोपनीयता का सम्मान करते हैं और आपका डेटा सुरक्षित रखते हैं।' : 'We respect your privacy and keep your data secure.'}
            </p>

            <div className="space-y-1.5 pt-1">
              {[
                { label: language === 'mr' ? 'डेटा व्यवस्थापन' : language === 'hi' ? 'डेटा प्रबंधन' : 'Manage Data', action: () => addToast('Opening Data Management panel', 'info') },
                { label: language === 'mr' ? 'माझा डेटा डाउनलोड करा' : language === 'hi' ? 'मेरा डेटा डाउनलोड करें' : 'Download My Data', action: () => addToast('Exporting your JSON data archive...', 'success') },
                { label: language === 'mr' ? 'गोपनीयता धोरण' : language === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy', action: () => addToast('Opening Privacy Policy in new tab', 'info') },
                { label: language === 'mr' ? 'सेवा अटी' : language === 'hi' ? 'सेवा की शर्तें' : 'Terms of Service', action: () => addToast('Opening Terms of Service in new tab', 'info') },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  className="w-full flex items-center justify-between py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 group transition cursor-pointer"
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition" />
                </button>
              ))}
            </div>
          </div>

          {/* Need Help? Card */}
          <div className="bg-white dark:bg-[#121316] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('needHelp')}</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {language === 'mr' ? 'आम्ही तुम्हाला कोणत्याही हवामान प्रश्नासाठी मदत करण्यास तयार आहोत.' : language === 'hi' ? 'हम आपके किसी भी मौसम प्रश्न में सहायता के लिए यहाँ हैं।' : "We're here to help you with any questions."}
            </p>

            <div className="space-y-2 pt-1">
              {[
                { label: language === 'mr' ? 'मदत केंद्र' : language === 'hi' ? 'सहायता केंद्र' : 'Help Center', href: '#' },
                { label: t('contactSupport'), href: '#' },
                { label: language === 'mr' ? 'अभिप्राय पाठवा' : language === 'hi' ? 'प्रतिक्रिया भेजें' : 'Send Feedback', href: '#' },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  onClick={(e) => { e.preventDefault(); addToast(`Connecting to ${item.label}...`, 'info'); }}
                  className="flex items-center justify-between py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <span>{item.label}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Change Password</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowPasswordModal(false)} className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300">Cancel</button>
              <button 
                onClick={() => { setShowPasswordModal(false); addToast("Password updated successfully!", "success"); }}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-rose-200 dark:border-rose-900 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-center text-slate-900 dark:text-white">Confirm Account Deletion</h3>
            <p className="text-xs text-center text-slate-500">
              Are you sure you want to permanently delete your account? All saved locations, chat history, and alerts will be lost forever.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300">Cancel</button>
              <button 
                onClick={() => { setShowDeleteModal(false); addToast("Account deletion cancelled (Demo Mode)", "warning"); }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
