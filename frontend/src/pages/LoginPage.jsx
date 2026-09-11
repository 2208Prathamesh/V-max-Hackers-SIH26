import React, { useState, useMemo } from 'react'
import { useWeather } from '../context/WeatherContext'
import { useLanguage } from '../context/LanguageContext'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  MessageSquare,
  Bell,
  MapPin,
  TrendingUp,
  User,
  Sparkles,
  Sun,
  Globe,
  CheckCircle,
  Sprout,
  ShieldAlert,
  Cpu,
  ArrowRight
} from 'lucide-react'
import { ForgotPasswordModal } from '../components/modals/ForgotPasswordModal'
import { SocialAuthModal } from '../components/modals/SocialAuthModal'
import confetti from 'canvas-confetti'

// Google Brand Icon
const GoogleIcon = () => (
  <svg className='w-4 h-4 flex-shrink-0' viewBox='0 0 24 24'>
    <path
      fill='#4285F4'
      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
    />
    <path
      fill='#34A853'
      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
    />
    <path
      fill='#FBBC05'
      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z'
    />
    <path
      fill='#EA4335'
      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z'
    />
  </svg>
)

// Apple Brand Icon
const AppleIcon = () => (
  <svg className='w-4 h-4 fill-current flex-shrink-0' viewBox='0 0 170 170'>
    <path d='M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.31-5.83-8.81-10.37-18.79-13.62-29.93-3.25-11.14-4.88-21.95-4.88-32.43 0-14.02 3.69-25.59 11.07-34.72 7.38-9.13 16.54-13.82 27.48-14.07 4.58 0 9.83 1.25 15.75 3.75 5.92 2.5 9.77 3.82 11.55 3.96 1.35-.2 5.37-1.6 12.06-4.21 6.69-2.61 12.39-3.72 17.1-3.32 12.63 1.01 22.45 6.06 29.46 15.15-11.08 6.74-16.51 16.03-16.3 27.87.21 9.4 3.82 17.17 10.82 23.32 7 6.15 15.11 9.75 24.32 10.8-2.22 6.54-4.88 12.82-7.98 18.84zM119.22 33.36c-.11 4.58-1.58 8.92-4.41 13.01-2.83 4.09-6.49 7.21-10.98 9.36-.64-3.8-1.02-7.14-1.14-10.02-.12-4.81 1.4-9.33 4.57-13.56 3.17-4.23 7.15-7.3 11.96-9.21.32 3.49.32 6.96 0 10.42z' />
  </svg>
)

// Microsoft Brand Icon
const MicrosoftIcon = () => (
  <svg className='w-4 h-4 flex-shrink-0' viewBox='0 0 21 21'>
    <rect x='1' y='1' width='9' height='9' fill='#f25022' />
    <rect x='1' y='11' width='9' height='9' fill='#00a4ef' />
    <rect x='11' y='1' width='9' height='9' fill='#7fba00' />
    <rect x='11' y='11' width='9' height='9' fill='#ffb900' />
  </svg>
)

// 3D Styled Cloud & Sun Logo matching the mockup
const WeatherGPTLogo = () => (
  <div className='flex items-center gap-3 select-none'>
    <div className='relative w-12 h-10 flex items-center justify-center'>
      {/* Golden Glowing Sun behind cloud */}
      <div className='absolute top-0.5 right-1 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-400 to-yellow-200 shadow-[0_0_12px_rgba(250,204,21,0.85)] animate-pulse-subtle flex items-center justify-center'>
        <Sun className='w-3.5 h-3.5 text-amber-800/40' />
      </div>
      {/* 3D Puffy Cloud */}
      <div className='relative z-10 filter drop-shadow-md'>
        <svg className='w-10 h-7' viewBox='0 0 64 44' fill='none'>
          <path
            d='M48 38H16C8.82 38 3 32.18 3 25C3 18.23 8.16 12.67 14.85 12.06C17.65 5.16 24.47 0.5 32.5 0.5C42.06 0.5 49.98 7.37 51.64 16.48C57.48 17.58 61.5 22.68 61.5 28.5C61.5 33.75 57.25 38 52 38H48Z'
            fill='url(#cloudGrad)'
          />
          <defs>
            <linearGradient
              id='cloudGrad'
              x1='10'
              y1='5'
              x2='55'
              y2='40'
              gradientUnits='userSpaceOnUse'
            >
              <stop stopColor='#FFFFFF' />
              <stop offset='0.6' stopColor='#F1F5F9' />
              <stop offset='1' stopColor='#CBD5E1' />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
    <span className='text-2xl font-bold tracking-tight text-white drop-shadow-sm font-sans'>
      WeatherGPT
    </span>
  </div>
)

export const LoginPage = () => {
  const {
    login,
    loginDemo,
    signUp,
    socialLogin,
    setIsForgotPasswordOpen,
    addToast,
    setUser,
    setIsAuthenticated,
    setCurrentPage
  } = useWeather()
  const { language, setLanguage, t, supportedLanguages } = useLanguage()

  const [isSignUpMode, setIsSignUpMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFarmer, setIsFarmer] = useState(false)
  const [selectedSocialProvider, setSelectedSocialProvider] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleDemoLogin = async (persona) => {
    setIsLoading(true)
    try {
      await loginDemo(persona)
      triggerLoginSuccessConfetti()
    } catch (err) {
      addToast(err.message || 'Demo login failed', 'error')
    } finally {
      setIsLoading(false)
    }
  }


  // Password strength calculator
  const passwordStrength = useMemo(() => {
    const pwd = formData.password
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200' }
    let score = 0
    if (pwd.length >= 8) score += 1
    if (/[A-Z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' }
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' }
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' }
  }, [formData.password])

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const triggerLoginSuccessConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#2563EB', '#38BDF8', '#F59E0B', '#10B981']
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUpMode) {
        await signUp({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          isFarmer,
          role: isFarmer ? 'farmer' : 'user',
          language
        })
        triggerLoginSuccessConfetti()
      } else {
        await login(formData.email, formData.password)
        triggerLoginSuccessConfetti()
      }
    } catch (error) {
      addToast(error.message || 'Authentication failed', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenSocialModal = providerName => {
    setSelectedSocialProvider(providerName)
  }

  const handleSocialSuccess = async payload => {
    try {
      await socialLogin(payload)
      triggerLoginSuccessConfetti()
      setSelectedSocialProvider(null)
    } catch (error) {
      addToast(error.message || `${payload.provider} sign-in failed`, 'error')
    }
  }

  return (
    <div className='min-h-screen w-full bg-[#EBF2FA] dark:bg-[#070D18] flex items-center justify-center p-3 sm:p-6 md:p-8 lg:p-10 select-none'>
      {/* Forgot Password Modal (with instant SMTP reset flow) */}
      <ForgotPasswordModal />

      {/* Social OAuth Modal (Google, Microsoft, Apple) */}
      <SocialAuthModal
        provider={selectedSocialProvider}
        isOpen={Boolean(selectedSocialProvider)}
        onClose={() => setSelectedSocialProvider(null)}
        onSuccess={handleSocialSuccess}
        isFarmer={isFarmer}
        prefilledEmail={formData.email}
      />

      {/* Main Container Card */}
      <div className='w-full max-w-6xl min-h-[780px] bg-white dark:bg-[#0B0B0E] rounded-[28px] sm:rounded-[36px] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-200/80 dark:border-slate-800'>
        {/* =========================================================================
            LEFT PANEL: Atmospheric Landscape & Features
            ========================================================================= */}
        <div className='lg:col-span-5 relative flex flex-col justify-between p-7 sm:p-10 lg:p-12 overflow-hidden bg-[#2563EB] text-white'>
          {/* Background image & gradient overlay */}
          <div
            className='absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105'
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop')`
            }}
          />
          <div className='absolute inset-0 bg-gradient-to-b from-[#2563EB]/95 via-[#1D4ED8]/90 to-[#0B0B0E]/95 mix-blend-multiply' />
          <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-blue-600/30' />

          {/* Foreground Left Content */}
          <div className='relative z-10 flex flex-col h-full justify-between space-y-6'>
            <div>
              <WeatherGPTLogo />

              {/* Main Headline & Subtitle */}
              <div className='mt-8 max-w-md'>
                <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100 mb-3'>
                  <span className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse' />
                  <span>IMD & INSAT-3D Live Telemetry Active</span>
                </div>
                <h1 className='text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight'>
                  {t('loginHeroTitle') || 'Next-Gen Climate Intelligence & Early Warning'}
                </h1>
                <p className='mt-2.5 text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal'>
                  {t('loginHeroSubtitle') || 'Empowering citizens, farmers, and disaster response teams with hyper-localized forecasts.'}
                </p>
              </div>

              {/* 4 Feature Items */}
              <div className='mt-6 sm:mt-8 space-y-3.5'>
                {/* Feature 1: Agro Advisory */}
                <div className='flex items-start gap-3 group bg-white/5 hover:bg-white/10 p-2.5 rounded-2xl border border-white/10 transition duration-200'>
                  <div className='w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center flex-shrink-0'>
                    <Sprout className='w-4 h-4' />
                  </div>
                  <div>
                    <h3 className='text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5'>
                      <span>Farmer Agro-Advisory</span>
                      <span className='px-1.5 py-0.2 text-[9px] bg-emerald-500/30 text-emerald-200 rounded font-mono'>🌾 KRISHI</span>
                    </h3>
                    <p className='text-[11px] text-blue-100/80 leading-relaxed mt-0.5'>
                      Crop advisories, harvest forecast, and mandi weather intelligence.
                    </p>
                  </div>
                </div>

                {/* Feature 2: Instant Alerts */}
                <div className='flex items-start gap-3 group bg-white/5 hover:bg-white/10 p-2.5 rounded-2xl border border-white/10 transition duration-200'>
                  <div className='w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center justify-center flex-shrink-0'>
                    <Bell className='w-4 h-4' />
                  </div>
                  <div>
                    <h3 className='text-xs sm:text-sm font-bold text-white tracking-tight'>
                      {t('instantAlerts') || 'Official IMD Severe Weather Alerts'}
                    </h3>
                    <p className='text-[11px] text-blue-100/80 leading-relaxed mt-0.5'>
                      Red & Orange emergency warnings for flash floods and cyclones.
                    </p>
                  </div>
                </div>

                {/* Feature 3: Authority Command */}
                <div className='flex items-start gap-3 group bg-white/5 hover:bg-white/10 p-2.5 rounded-2xl border border-white/10 transition duration-200'>
                  <div className='w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center flex-shrink-0'>
                    <ShieldAlert className='w-4 h-4' />
                  </div>
                  <div>
                    <h3 className='text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5'>
                      <span>Disaster Authority Portal</span>
                      <span className='px-1.5 py-0.2 text-[9px] bg-amber-500/30 text-amber-200 rounded font-mono'>🏛️ GOV</span>
                    </h3>
                    <p className='text-[11px] text-blue-100/80 leading-relaxed mt-0.5'>
                      Publish bulletins, coordinate district SOPs, and broadcast alerts.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Glassmorphic Quote Card */}
            <div className='pt-2'>
              <div className='bg-slate-900/40 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 text-white shadow-xl max-w-md'>
                <div className='flex items-start gap-2'>
                  <span className='text-xl font-serif text-white/90 leading-none select-none'>“</span>
                  <p className='text-xs text-white/95 font-medium leading-relaxed italic'>
                    {t('weatherQuote') || 'Precision weather forecasts protect lives, boost harvests, and build resilient communities.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT PANEL: Enhanced Authentication Form & Role Engine
            ========================================================================= */}
        <div className='lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 bg-white dark:bg-[#121316] relative overflow-y-auto max-h-[90vh] lg:max-h-none'>
          {/* Top Bar: Language Selector */}
          <div className='w-full max-w-lg flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800'>
            <div className='flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400'>
              <Globe className='w-3.5 h-3.5 text-blue-500' />
              <span>{t('preferredLanguage') || 'Language'}:</span>
            </div>
            <div className='flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700'>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className='bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer'
              >
                {supportedLanguages.map(l => (
                  <option key={l.code} value={l.code} className='bg-slate-900 text-white'>
                    {l.flag} {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='w-full max-w-lg'>
            {/* =========================================================================
                SIH 2026 JUDGE PORTAL — 1-CLICK DEMO ACCESS
                ========================================================================= */}
            <div className='mb-6 p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 border border-blue-500/20 dark:border-blue-400/20 shadow-sm'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-2'>
                  <span className='w-2 h-2 rounded-full bg-emerald-500 animate-ping' />
                  <span className='text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300'>
                    SIH 2026 Judge Portal • 1-Click Demo
                  </span>
                </div>
                <span className='text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold'>
                  No Password Needed
                </span>
              </div>
              <p className='text-[11px] text-slate-600 dark:text-slate-400 mb-3'>
                Select an official demo persona to immediately experience role-tailored decision intelligence:
              </p>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-2.5'>
                {/* Citizen Persona */}
                <button
                  type='button'
                  onClick={() => handleDemoLogin('citizen')}
                  disabled={isLoading}
                  className='flex flex-col items-start p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition text-left cursor-pointer group disabled:opacity-50'
                >
                  <div className='flex items-center justify-between w-full mb-1'>
                    <div className='w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center'>
                      <User className='w-3.5 h-3.5' />
                    </div>
                    <span className='text-[10px] font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform'>→</span>
                  </div>
                  <span className='text-xs font-bold text-slate-900 dark:text-white'>Citizen Demo</span>
                  <span className='text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5'>Priya • Timeline, Risk & AI Chat</span>
                </button>

                {/* Farmer Persona */}
                <button
                  type='button'
                  onClick={() => handleDemoLogin('farmer')}
                  disabled={isLoading}
                  className='flex flex-col items-start p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-md transition text-left cursor-pointer group disabled:opacity-50'
                >
                  <div className='flex items-center justify-between w-full mb-1'>
                    <div className='w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center'>
                      <Sprout className='w-3.5 h-3.5' />
                    </div>
                    <span className='text-[10px] font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform'>→</span>
                  </div>
                  <span className='text-xs font-bold text-slate-900 dark:text-white'>Farmer Demo 🌾</span>
                  <span className='text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5'>Ramesh • Crop, Spraying & Krishi</span>
                </button>

                {/* Authority Persona */}
                <button
                  type='button'
                  onClick={() => handleDemoLogin('authority')}
                  disabled={isLoading}
                  className='flex flex-col items-start p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-400 hover:shadow-md transition text-left cursor-pointer group disabled:opacity-50'
                >
                  <div className='flex items-center justify-between w-full mb-1'>
                    <div className='w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center'>
                      <ShieldAlert className='w-3.5 h-3.5' />
                    </div>
                    <span className='text-[10px] font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform'>→</span>
                  </div>
                  <span className='text-xs font-bold text-slate-900 dark:text-white'>Authority Demo 🏛️</span>
                  <span className='text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5'>Dr. Sharma • EOC, Radar & Triage</span>
                </button>
              </div>
            </div>

            <div className='relative mb-5'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-slate-200 dark:border-slate-700/60' />
              </div>
              <div className='relative flex justify-center text-xs'>
                <span className='bg-white dark:bg-[#121316] px-3 text-slate-400 font-medium'>
                  or sign in with credentials
                </span>
              </div>
            </div>

            {/* Mode Toggle Tabs: Sign In / Create Account */}
            <div className='flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-6 border border-slate-200 dark:border-slate-700/60'>
              <button
                type='button'
                onClick={() => setIsSignUpMode(false)}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  !isSignUpMode
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LogIn className='w-4 h-4' />
                <span>{t('signIn') || 'Sign In'}</span>
              </button>

              <button
                type='button'
                onClick={() => setIsSignUpMode(true)}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  isSignUpMode
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <User className='w-4 h-4' />
                <span>{t('createAccount') || 'Create Account'}</span>
              </button>
            </div>

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className='space-y-4'>
              {/* Full Name in Sign Up Mode */}
              {isSignUpMode && (
                <div className='animate-fadeIn'>
                  <label className='block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1'>
                    {t('fullName') || 'Full Name'}
                  </label>
                  <div className='relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition shadow-2xs'>
                    <User className='w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2' />
                    <input
                      type='text'
                      name='name'
                      required
                      placeholder='e.g. Ramesh Patil / Officer Sharma'
                      value={formData.name}
                      onChange={handleChange}
                      className='w-full pl-10 pr-4 py-2.5 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none rounded-xl'
                    />
                  </div>
                </div>
              )}

              {/* Email Address or Username */}
              <div>
                <label className='block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1'>
                  {isSignUpMode
                    ? (t('emailAddress') || 'Email Address')
                    : (t('emailOrUsername') || 'Email or Username')}
                </label>
                <div className='relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition shadow-2xs'>
                  <Mail className='w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2' />
                  <input
                    type={isSignUpMode ? 'email' : 'text'}
                    name='email'
                    required
                    autoComplete='username'
                    placeholder={isSignUpMode ? 'yourname@domain.com' : 'Email or username (e.g. admin)'}
                    value={formData.email}
                    onChange={handleChange}
                    className='w-full pl-10 pr-4 py-2.5 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none rounded-xl'
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className='flex items-center justify-between mb-1'>
                  <label className='block text-xs font-semibold text-slate-700 dark:text-slate-300'>
                    {t('password') || 'Password'}
                  </label>
                  {!isSignUpMode && (
                    <button
                      type='button'
                      onClick={() => setIsForgotPasswordOpen(true)}
                      className='text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
                    >
                      {t('forgotPassword') || 'Forgot Password?'}
                    </button>
                  )}
                </div>
                <div className='relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition shadow-2xs'>
                  <Lock className='w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2' />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name='password'
                    required
                    minLength={isSignUpMode ? 6 : 1}
                    autoComplete={isSignUpMode ? 'new-password' : 'current-password'}
                    placeholder={isSignUpMode ? 'At least 6 characters' : 'Enter your password'}
                    value={formData.password}
                    onChange={handleChange}
                    className='w-full pl-10 pr-10 py-2.5 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none rounded-xl'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1 cursor-pointer'
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                  </button>
                </div>

                {/* Password strength indicator in Sign Up mode */}
                {isSignUpMode && formData.password.length > 0 && (
                  <div className='mt-2 animate-fadeIn'>
                    <div className='flex items-center justify-between text-[11px] mb-1'>
                      <span className='text-slate-500'>Password Strength:</span>
                      <span className='font-bold text-slate-700 dark:text-slate-300'>{passwordStrength.label}</span>
                    </div>
                    <div className='w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden'>
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* =========================================================================
                  ARE YOU A FARMER? YES / NO TOGGLE SECTION
                  ========================================================================= */}
              {isSignUpMode && (
                <div className='p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 animate-fadeIn transition-all'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <span className='text-lg'>🌾</span>
                      <span className='text-xs sm:text-sm font-bold text-slate-900 dark:text-white'>
                        {language === 'mr'
                          ? 'तुम्ही शेतकरी आहात का?'
                          : language === 'hi'
                          ? 'क्या आप किसान हैं?'
                          : 'Are you a farmer?'}
                      </span>
                    </div>

                    {/* Yes / No Toggle Button */}
                    <div className='flex items-center bg-slate-200 dark:bg-slate-700 p-1 rounded-xl'>
                      <button
                        type='button'
                        onClick={() => setIsFarmer(false)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          !isFarmer
                            ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {language === 'mr' ? 'नाही' : language === 'hi' ? 'नहीं' : 'No'}
                      </button>
                      <button
                        type='button'
                        onClick={() => setIsFarmer(true)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                          isFarmer
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <span>{language === 'mr' ? 'होय' : language === 'hi' ? 'हाँ' : 'Yes'}</span>
                        {isFarmer && <span className='text-[10px]'>✓</span>}
                      </button>
                    </div>
                  </div>

                  {/* Single Line Description */}
                  <p className='text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-normal'>
                    {language === 'mr'
                      ? 'पिकांसाठी हवामान सल्लागार, पेरणी/कापणी अंदाज आणि कृषी सूचना थेट मिळवा.'
                      : language === 'hi'
                      ? 'फसलों के लिए मौसम परामर्श, बुवाई/कटाई का पूर्वानुमान और कृषि अलर्ट सीधे प्राप्त करें।'
                      : 'Access crop advisory, weather forecasts & mandi alerts.'}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type='submit'
                disabled={isLoading}
                className='w-full mt-3 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/25 transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75'
              >
                {isLoading ? (
                  <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                ) : (
                  <>
                    <LogIn className='w-5 h-5' />
                    <span>
                      {isSignUpMode
                        ? isFarmer
                          ? 'Create Farmer Account 🌾'
                          : 'Create Account'
                        : t('signIn') || 'Sign In to WeatherGPT'}
                    </span>
                  </>
                )}
              </button>


            </form>

            {/* Social Divider */}
            <div className='relative my-6'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-slate-200 dark:border-slate-700/80' />
              </div>
              <div className='relative flex justify-center text-xs'>
                <span className='bg-white dark:bg-[#121316] px-4 text-slate-500 dark:text-slate-400 font-medium'>
                  {t('orContinueWith') || 'Or continue with'}
                </span>
              </div>
            </div>

            {/* 3 Social Buttons */}
            <div className='grid grid-cols-3 gap-2.5'>
              <button
                type='button'
                onClick={() => handleOpenSocialModal('Google')}
                className='flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-750 transition shadow-2xs font-semibold text-xs text-slate-700 dark:text-slate-200 group cursor-pointer'
              >
                <GoogleIcon />
                <span>Google</span>
              </button>

              <button
                type='button'
                onClick={() => handleOpenSocialModal('Apple')}
                className='flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-750 transition shadow-2xs font-semibold text-xs text-slate-700 dark:text-slate-200 group cursor-pointer'
              >
                <AppleIcon />
                <span>Apple</span>
              </button>

              <button
                type='button'
                onClick={() => handleOpenSocialModal('Microsoft')}
                className='flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-750 transition shadow-2xs font-semibold text-xs text-slate-700 dark:text-slate-200 group cursor-pointer'
              >
                <MicrosoftIcon />
                <span>Microsoft</span>
              </button>
            </div>

            {/* Switch between Login and Sign up */}
            <p className='text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-6'>
              {isSignUpMode
                ? (t('haveAccount') || 'Already have an account?')
                : (t('noAccount') || "Don't have an account?")}{' '}
              <button
                type='button'
                onClick={() => setIsSignUpMode(!isSignUpMode)}
                className='text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer'
              >
                {isSignUpMode ? (t('signIn') || 'Sign In') : (t('signUp') || 'Create Account')}
              </button>
            </p>

            {/* Trust Footer */}
            <div className='flex items-center justify-center gap-2 mt-5 text-[11px] text-slate-400 dark:text-slate-500'>
              <ShieldCheck className='w-4 h-4 text-emerald-500' />
              <span>Encrypted with SHA-256 & Argon2 Standards • Ministry of Earth Sciences Sync</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
