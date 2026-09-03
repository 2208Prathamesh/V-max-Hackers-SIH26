import React, { useState } from 'react'
import { useWeather } from '../context/WeatherContext'
import { useTheme } from '../context/ThemeContext'
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
} from 'lucide-react'
import { Switch } from '../components/common/Switch'
import { api } from '../services/api'

export const SettingsPage = () => {
  const {
    user,
    settings,
    setSettings,
    updateUnits,
    updateNotifications,
    setIsEditProfileOpen,
    setIsPremiumModalOpen,
    addToast
  } = useWeather()
  const { theme, toggleTheme } = useTheme()

  const [activeTab, setActiveTab] = useState('general')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const handlePasswordUpdate = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError('Please fill in both current and new password.')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.')
      return
    }
    setPasswordLoading(true)
    setPasswordError('')
    try {
      await api.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword:
          passwordForm.confirmPassword || passwordForm.newPassword
      })
      setShowPasswordModal(false)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      addToast('Password updated successfully!', 'success')
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const navTabs = [
    { id: 'general', label: 'General', icon: Sliders },
    { id: 'units', label: 'Units & Format', icon: Thermometer },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'weather-prefs', label: 'Weather Preferences', icon: Cloud },
    { id: 'privacy', label: 'Privacy & Data', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'connected', label: 'Connected Accounts', icon: LinkIcon },
    { id: 'about', label: 'About', icon: Info }
  ]

  const handleTimezoneChange = e => {
    setSettings(prev => ({ ...prev, timeZone: e.target.value }))
    addToast(`Time zone updated to ${e.target.value}`, 'success')
  }

  return (
    <div className='space-y-6'>
      {/* Sub Tabs navigation matching screenshot */}
      <div className='flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none'>
        {navTabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
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
              <Icon className='w-3.5 h-3.5' />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Main 2-Column Grid matching Screenshot 1 */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
        {/* Left Column: Settings Sections (8 cols) */}
        <div className='lg:col-span-8 space-y-6'>
          {/* 1. General Section Card */}
          <div className='bg-white dark:bg-[#151F32] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-card space-y-6'>
            <h2 className='text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200'>
              General
            </h2>

            <div className='space-y-5 divide-y divide-slate-100 dark:divide-slate-800/60'>
              {/* Profile Information */}
              <div className='flex items-center justify-between pt-1'>
                <div className='flex items-center gap-3.5'>
                  <div className='w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0'>
                    <User className='w-5 h-5' />
                  </div>
                  <div>
                    <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>
                      Profile Information
                    </h3>
                    <p className='text-xs text-slate-500 dark:text-slate-400'>
                      Update your name, email and profile picture.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className='px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl transition'
                >
                  Edit Profile
                </button>
              </div>

              {/* Change Password */}
              <div className='flex items-center justify-between pt-5'>
                <div className='flex items-center gap-3.5'>
                  <div className='w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0'>
                    <Lock className='w-5 h-5' />
                  </div>
                  <div>
                    <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>
                      Change Password
                    </h3>
                    <p className='text-xs text-slate-500 dark:text-slate-400'>
                      Update your password to keep your account secure.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className='px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl transition'
                >
                  Change
                </button>
              </div>

              {/* Time Zone */}
              <div className='flex items-center justify-between pt-5'>
                <div className='flex items-center gap-3.5'>
                  <div className='w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0'>
                    <Clock className='w-5 h-5' />
                  </div>
                  <div>
                    <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>
                      Time Zone
                    </h3>
                    <p className='text-xs text-slate-500 dark:text-slate-400'>
                      Set your default time zone for accurate updates.
                    </p>
                  </div>
                </div>
                <select
                  value={settings.timeZone}
                  onChange={handleTimezoneChange}
                  className='px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer'
                >
                  <option value='(UTC+05:30) Asia/Kolkata'>
                    (UTC+05:30) Asia/Kolkata
                  </option>
                  <option value='(UTC+00:00) London (GMT)'>
                    (UTC+00:00) London (GMT)
                  </option>
                  <option value='(UTC-05:00) New York (EST)'>
                    (UTC-05:00) New York (EST)
                  </option>
                  <option value='(UTC-08:00) San Francisco (PST)'>
                    (UTC-08:00) San Francisco (PST)
                  </option>
                  <option value='(UTC+08:00) Singapore / Tokyo'>
                    (UTC+08:00) Singapore / Tokyo
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Units & Format Section Card */}
          <div className='bg-white dark:bg-[#151F32] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-card space-y-6'>
            <h2 className='text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200'>
              Units & Format
            </h2>

            <div className='space-y-5 divide-y divide-slate-100 dark:divide-slate-800/60'>
              {/* Temperature */}
              <div className='flex items-center justify-between pt-1'>
                <div className='flex items-center gap-3.5'>
                  <div className='w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0'>
                    <Thermometer className='w-5 h-5' />
                  </div>
                  <div>
                    <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>
                      Temperature
                    </h3>
                    <p className='text-xs text-slate-500 dark:text-slate-400'>
                      Choose your preferred temperature unit.
                    </p>
                  </div>
                </div>
                <select
                  value={settings.units.temperature}
                  onChange={e => updateUnits('temperature', e.target.value)}
                  className='px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer'
                >
                  <option value='C'>°C (Celsius)</option>
                  <option value='F'>°F (Fahrenheit)</option>
                </select>
              </div>

              {/* Wind Speed */}
              <div className='flex items-center justify-between pt-5'>
                <div className='flex items-center gap-3.5'>
                  <div className='w-10 h-10 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0'>
                    <Wind className='w-5 h-5' />
                  </div>
                  <div>
                    <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>
                      Wind Speed
                    </h3>
                    <p className='text-xs text-slate-500 dark:text-slate-400'>
                      Choose your preferred wind speed unit.
                    </p>
                  </div>
                </div>
                <select
                  value={settings.units.windSpeed}
                  onChange={e => updateUnits('windSpeed', e.target.value)}
                  className='px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer'
                >
                  <option value='kmh'>km/h</option>
                  <option value='mph'>mph</option>
                  <option value='ms'>m/s</option>
                  <option value='knots'>knots</option>
                </select>
              </div>

              {/* Pressure */}
              <div className='flex items-center justify-between pt-5'>
                <div className='flex items-center gap-3.5'>
                  <div className='w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0'>
                    <Gauge className='w-5 h-5' />
                  </div>
                  <div>
                    <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>
                      Pressure
                    </h3>
                    <p className='text-xs text-slate-500 dark:text-slate-400'>
                      Choose your preferred pressure unit.
                    </p>
                  </div>
                </div>
                <select
                  value={settings.units.pressure}
                  onChange={e => updateUnits('pressure', e.target.value)}
                  className='px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer'
                >
                  <option value='hPa'>hPa</option>
                  <option value='inHg'>inHg</option>
                  <option value='mmHg'>mmHg</option>
                  <option value='bar'>bar</option>
                </select>
              </div>

              {/* Precipitation */}
              <div className='flex items-center justify-between pt-5'>
                <div className='flex items-center gap-3.5'>
                  <div className='w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0'>
                    <Droplets className='w-5 h-5' />
                  </div>
                  <div>
                    <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>
                      Precipitation
                    </h3>
                    <p className='text-xs text-slate-500 dark:text-slate-400'>
                      Choose your preferred precipitation unit.
                    </p>
                  </div>
                </div>
                <select
                  value={settings.units.precipitation}
                  onChange={e => updateUnits('precipitation', e.target.value)}
                  className='px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer'
                >
                  <option value='mm'>mm</option>
                  <option value='in'>inches</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Notifications Section Card */}
          <div className='bg-white dark:bg-[#151F32] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-card space-y-6'>
            <h2 className='text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200'>
              Notifications
            </h2>

            <div className='space-y-5 divide-y divide-slate-100 dark:divide-slate-800/60'>
              {/* Weather Alerts */}
              <div className='flex items-center justify-between pt-1'>
                <div className='flex items-center gap-3.5'>
                  <div className='w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0'>
                    <AlertTriangle className='w-5 h-5' />
                  </div>
                  <div>
                    <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>
                      Weather Alerts
                    </h3>
                    <p className='text-xs text-slate-500 dark:text-slate-400'>
                      Receive severe weather alerts and warnings.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.weatherAlerts}
                  onChange={val => updateNotifications('weatherAlerts', val)}
                />
              </div>

              {/* Daily Forecast */}
              <div className='flex items-center justify-between pt-5'>
                <div className='flex items-center gap-3.5'>
                  <div className='w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0'>
                    <Calendar className='w-5 h-5' />
                  </div>
                  <div>
                    <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>
                      Daily Forecast
                    </h3>
                    <p className='text-xs text-slate-500 dark:text-slate-400'>
                      Get your daily weather forecast every morning.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.dailyForecast}
                  onChange={val => updateNotifications('dailyForecast', val)}
                />
              </div>

              {/* Weekly Summary */}
              <div className='flex items-center justify-between pt-5'>
                <div className='flex items-center gap-3.5'>
                  <div className='w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0'>
                    <Mail className='w-5 h-5' />
                  </div>
                  <div>
                    <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>
                      Weekly Summary
                    </h3>
                    <p className='text-xs text-slate-500 dark:text-slate-400'>
                      Receive weekly weather summary and outlook.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.weeklySummary}
                  onChange={val => updateNotifications('weeklySummary', val)}
                />
              </div>

              {/* Breaking News */}
              <div className='flex items-center justify-between pt-5'>
                <div className='flex items-center gap-3.5'>
                  <div className='w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0'>
                    <Zap className='w-5 h-5' />
                  </div>
                  <div>
                    <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>
                      Breaking News
                    </h3>
                    <p className='text-xs text-slate-500 dark:text-slate-400'>
                      Important weather news and updates.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.breakingNews}
                  onChange={val => updateNotifications('breakingNews', val)}
                />
              </div>
            </div>
          </div>

          {/* 4. Delete Account Danger Card */}
          <div className='bg-rose-50/70 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
            <div>
              <h3 className='text-sm font-bold text-rose-600 dark:text-rose-400'>
                Delete Account
              </h3>
              <p className='text-xs text-slate-600 dark:text-slate-400 mt-0.5'>
                Permanently delete your account and all your data.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className='px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-300 dark:border-rose-800 rounded-xl transition bg-white dark:bg-rose-900/30 shrink-0'
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* Right Column: Account Summary, Data & Privacy, Need Help (4 cols) */}
        <div className='lg:col-span-4 space-y-6'>
          {/* Account Summary Card */}
          <div className='bg-white dark:bg-[#151F32] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-card space-y-5'>
            <h2 className='text-sm font-bold text-slate-900 dark:text-white'>
              Account Summary
            </h2>

            <div className='flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800/80'>
              <div className='w-14 h-14 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-md'>
                {user.avatarInitials || 'SP'}
              </div>
              <div>
                <h3 className='text-base font-bold text-slate-900 dark:text-white'>
                  {user.name}
                </h3>
                <p className='text-xs text-slate-500 dark:text-slate-400'>
                  {user.email}
                </p>
                <div className='mt-1'>
                  <span className='inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'>
                    {user.plan}
                  </span>
                </div>
              </div>
            </div>

            <div className='space-y-3 text-xs'>
              <div className='flex items-center justify-between text-slate-600 dark:text-slate-400'>
                <span>Member Since</span>
                <span className='font-semibold text-slate-900 dark:text-white'>
                  {user.memberSince}
                </span>
              </div>
              <div className='flex items-center justify-between text-slate-600 dark:text-slate-400'>
                <span>Locations Saved</span>
                <span className='font-semibold text-slate-900 dark:text-white'>
                  {user.stats.locationsSaved}
                </span>
              </div>
              <div className='flex items-center justify-between text-slate-600 dark:text-slate-400'>
                <span>Conversations</span>
                <span className='font-semibold text-slate-900 dark:text-white'>
                  {user.stats.conversations}
                </span>
              </div>
              <div className='flex items-center justify-between text-slate-600 dark:text-slate-400'>
                <span>Alerts Set</span>
                <span className='font-semibold text-slate-900 dark:text-white'>
                  {user.stats.alertsSet}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsPremiumModalOpen(true)}
              className='w-full py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition'
            >
              Manage Subscription
            </button>
          </div>

          {/* Data & Privacy Card */}
          <div className='bg-white dark:bg-[#151F32] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-card space-y-4'>
            <div className='flex items-center gap-2'>
              <Shield className='w-5 h-5 text-blue-600 dark:text-blue-400' />
              <h2 className='text-sm font-bold text-slate-900 dark:text-white'>
                Data & Privacy
              </h2>
            </div>
            <p className='text-xs text-slate-500 dark:text-slate-400 leading-relaxed'>
              We respect your privacy and keep your data secure.
            </p>

            <div className='space-y-1.5 pt-1'>
              {[
                {
                  label: 'Manage Data',
                  action: () =>
                    addToast('Opening Data Management panel', 'info')
                },
                {
                  label: 'Download My Data',
                  action: () =>
                    addToast('Exporting your JSON data archive...', 'success')
                },
                {
                  label: 'Privacy Policy',
                  action: () =>
                    addToast('Opening Privacy Policy in new tab', 'info')
                },
                {
                  label: 'Terms of Service',
                  action: () =>
                    addToast('Opening Terms of Service in new tab', 'info')
                }
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  className='w-full flex items-center justify-between py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 group transition'
                >
                  <span>{item.label}</span>
                  <ChevronRight className='w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition' />
                </button>
              ))}
            </div>
          </div>

          {/* Need Help? Card */}
          <div className='bg-white dark:bg-[#151F32] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-card space-y-4'>
            <div className='flex items-center gap-2'>
              <HelpCircle className='w-5 h-5 text-blue-600 dark:text-blue-400' />
              <h2 className='text-sm font-bold text-slate-900 dark:text-white'>
                Need Help?
              </h2>
            </div>
            <p className='text-xs text-slate-500 dark:text-slate-400 leading-relaxed'>
              We're here to help you with any questions.
            </p>

            <div className='space-y-2 pt-1'>
              {[
                { label: 'Help Center', href: '#' },
                { label: 'Contact Support', href: '#' },
                { label: 'Send Feedback', href: '#' }
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  onClick={e => {
                    e.preventDefault()
                    addToast(`Connecting to ${item.label}...`, 'info')
                  }}
                  className='flex items-center justify-between py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline'
                >
                  <span>{item.label}</span>
                  <ExternalLink className='w-3.5 h-3.5' />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
          <div className='bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4'>
            <h3 className='text-base font-bold text-slate-900 dark:text-white'>
              Change Password
            </h3>
            {passwordError ? (
              <p className='text-xs text-rose-500 font-medium bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl'>
                {passwordError}
              </p>
            ) : null}
            <div className='space-y-3'>
              <div>
                <label className='text-xs text-slate-500 block mb-1'>
                  Current Password
                </label>
                <input
                  type='password'
                  value={passwordForm.currentPassword}
                  onChange={e =>
                    setPasswordForm(p => ({
                      ...p,
                      currentPassword: e.target.value
                    }))
                  }
                  placeholder='••••••••'
                  className='w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='text-xs text-slate-500 block mb-1'>
                  New Password
                </label>
                <input
                  type='password'
                  value={passwordForm.newPassword}
                  onChange={e =>
                    setPasswordForm(p => ({
                      ...p,
                      newPassword: e.target.value
                    }))
                  }
                  placeholder='At least 8 characters'
                  className='w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordError('')
                }}
                className='px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300'
              >
                Cancel
              </button>
              <button
                disabled={passwordLoading}
                onClick={handlePasswordUpdate}
                className='px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition'
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
          <div className='bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-rose-200 dark:border-rose-900 shadow-2xl space-y-4'>
            <div className='w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto'>
              <Trash2 className='w-5 h-5' />
            </div>
            <h3 className='text-base font-bold text-center text-slate-900 dark:text-white'>
              Confirm Account Deletion
            </h3>
            <p className='text-xs text-center text-slate-500'>
              Are you sure you want to permanently delete your account? All
              saved locations, chat history, and alerts will be lost forever.
            </p>
            <div className='flex justify-end gap-2 pt-2'>
              <button
                onClick={() => setShowDeleteModal(false)}
                className='px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300'
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  addToast('Account deletion cancelled (Demo Mode)', 'warning')
                }}
                className='px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs'
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
