import React, { useState } from 'react'
import { useWeather } from '../../context/WeatherContext'
import { useTheme } from '../../context/ThemeContext'
import { api } from '../../services/api'
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
} from 'lucide-react'

export const Header = ({ isMobileOpen, setIsMobileOpen }) => {
  const {
    currentPage,
    user,
    notifications,
    setCurrentPage,
    settings,
    setSettings,
    addToast,
    logout
  } = useWeather()
  const { isDark, toggleTheme } = useTheme()
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [isAlertsOpen, setIsAlertsOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  const getPageInfo = () => {
    switch (currentPage) {
      case 'settings':
        return {
          title: 'Settings',
          subtitle: 'Manage your preferences and account settings'
        }
      case 'saved-locations':
        return {
          title: 'Saved Locations',
          subtitle: 'Quickly access weather updates for your saved locations'
        }
      case 'history':
        return {
          title: 'History',
          subtitle: 'View and manage your past conversations with WeatherGPT'
        }
      case 'weather-map':
        return {
          title: 'Weather Map',
          subtitle: 'Explore real-time weather conditions across India'
        }
      case 'dashboard':
        return {
          title: 'Dashboard',
          subtitle: 'Real-time AI weather intelligence & environmental metrics'
        }
      case 'chat':
        return {
          title: 'WeatherGPT AI Assistant',
          subtitle:
            'Ask any meteorological or climate query with real-time analysis'
        }
      case 'alerts':
        return {
          title: 'Active Weather Alerts',
          subtitle:
            'Severe weather warnings, radar advisories, and emergency bulletins'
        }
      case 'forecast':
        return {
          title: 'Extended Forecast',
          subtitle: '14-day precision meteorological projections'
        }
      default:
        return { title: 'WeatherGPT', subtitle: 'AI Weather Intelligence' }
    }
  }

  const { title, subtitle } = getPageInfo()

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi (हिन्दी)' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' }
  ]

  const currentLangLabel =
    languages.find(l => l.code === (settings.language || 'en'))?.label ||
    'English'

  const handleSelectLang = (code, label) => {
    setSettings(prev => ({ ...prev, language: code }))
    setIsLangOpen(false)
    api
      .updateSettings({ language: code })
      .then(() => addToast(`Language changed to ${label}`, 'info'))
      .catch(error =>
        addToast(error.message || 'Could not update language', 'warning')
      )
  }

  return (
    <header className='sticky top-0 z-30 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-4 flex items-center justify-between transition-colors duration-200'>
      {/* Left Title & Mobile Menu Button */}
      <div className='flex items-center gap-3'>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className='lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition'
        >
          {isMobileOpen ? (
            <X className='w-5 h-5' />
          ) : (
            <Menu className='w-5 h-5' />
          )}
        </button>

        {currentPage !== 'dashboard' && (
          <div>
            <h1 className='text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white'>
              {title}
            </h1>
            <p className='text-xs md:text-sm text-slate-500 dark:text-slate-400'>
              {subtitle}
            </p>
          </div>
        )}
      </div>

      {/* Right Action Icons: Language, Dark Mode, Alerts Bell, User Avatar */}
      <div className='flex items-center gap-2.5 sm:gap-3'>
        {/* Language Dropdown */}
        <div className='relative'>
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-xs'
          >
            <Globe className='w-3.5 h-3.5 text-slate-500' />
            <span className='hidden sm:inline'>{currentLangLabel}</span>
            <ChevronDown className='w-3 h-3 text-slate-400' />
          </button>

          {isLangOpen && (
            <div className='absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-fadeIn'>
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLang(lang.code, lang.label)}
                  className='w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition'
                >
                  <span>{lang.label}</span>
                  {settings.language === lang.code && (
                    <Check className='w-3.5 h-3.5 text-blue-600 dark:text-blue-400' />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          aria-label='Toggle Theme'
          className='p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-xs'
        >
          {isDark ? (
            <Sun className='w-4 h-4 text-amber-400 fill-amber-400' />
          ) : (
            <Moon className='w-4 h-4 text-slate-600 fill-slate-200' />
          )}
        </button>

        {/* Notifications Bell */}
        <div className='relative'>
          <button
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            aria-label='Notifications'
            className='relative p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-xs'
          >
            <Bell className='w-4 h-4' />
            {notifications.filter(notification => !notification.isRead).length >
              0 && (
              <span className='absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold'>
                {
                  notifications.filter(notification => !notification.isRead)
                    .length
                }
              </span>
            )}
          </button>

          {isAlertsOpen && (
            <div className='absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-fadeIn'>
              <div className='flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800'>
                <span className='text-xs font-bold text-slate-900 dark:text-white'>
                  Notifications ({notifications.length})
                </span>
                <button
                  onClick={() => {
                    setCurrentPage('alerts')
                    setIsAlertsOpen(false)
                  }}
                  className='text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline'
                >
                  View all
                </button>
              </div>
              <div className='space-y-2 mt-2 max-h-60 overflow-y-auto'>
                {notifications.length === 0 && (
                  <p className='text-xs text-slate-500 dark:text-slate-400 py-3'>
                    No notifications
                  </p>
                )}
                {notifications.map(notification => (
                  <div
                    key={notification._id || notification.id}
                    onClick={async () => {
                      try {
                        if (!notification.isRead) {
                          await api.markNotificationRead(
                            notification._id || notification.id
                          )
                        }
                        setIsAlertsOpen(false)
                        setCurrentPage(
                          notification.relatedAlertId ? 'alerts' : 'settings'
                        )
                      } catch (error) {
                        addToast(
                          error.message ||
                            'Could not mark notification as read',
                          'warning'
                        )
                      }
                    }}
                    className='p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition border border-slate-100 dark:border-slate-800'
                  >
                    <div className='flex items-start gap-2'>
                      <AlertTriangle className='w-4 h-4 text-rose-500 shrink-0 mt-0.5' />
                      <div>
                        <p className='text-xs font-semibold text-slate-800 dark:text-slate-200'>
                          {notification.title}
                        </p>
                        <p className='text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1'>
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Initials / Photo Badge & Dropdown */}
        <div className='relative'>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className='flex items-center gap-1.5 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer'
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className='w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs'
              />
            ) : (
              <div className='w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs'>
                {user.avatarInitials || 'SP'}
              </div>
            )}
            <ChevronDown className='w-3.5 h-3.5 text-slate-400' />
          </button>

          {isProfileMenuOpen && (
            <div className='absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-fadeIn space-y-1'>
              <div className='px-3 py-2 border-b border-slate-100 dark:border-slate-800'>
                <p className='text-xs font-bold text-slate-900 dark:text-white truncate'>
                  {user.name}
                </p>
                <p className='text-[11px] text-slate-500 truncate'>
                  {user.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setCurrentPage('settings')
                  setIsProfileMenuOpen(false)
                }}
                className='w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition'
              >
                <SettingsIcon className='w-3.5 h-3.5 text-slate-400' />
                <span>Account Settings</span>
              </button>
              <div className='border-t border-slate-100 dark:border-slate-800 my-1' />
              <button
                onClick={() => {
                  logout()
                  setIsProfileMenuOpen(false)
                }}
                className='w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition'
              >
                <LogOut className='w-3.5 h-3.5 text-rose-500' />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
