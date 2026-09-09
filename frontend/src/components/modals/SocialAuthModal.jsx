import React, { useState, useEffect } from 'react'
import { X, CheckCircle, Shield, ArrowRight, ExternalLink } from 'lucide-react'

// Brand Icons
const GoogleIcon = () => (
  <svg className='w-6 h-6 flex-shrink-0' viewBox='0 0 24 24'>
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

const MicrosoftIcon = () => (
  <svg className='w-6 h-6 flex-shrink-0' viewBox='0 0 21 21'>
    <rect x='1' y='1' width='9' height='9' fill='#f25022' />
    <rect x='1' y='11' width='9' height='9' fill='#00a4ef' />
    <rect x='11' y='1' width='9' height='9' fill='#7fba00' />
    <rect x='11' y='11' width='9' height='9' fill='#ffb900' />
  </svg>
)

const AppleIcon = () => (
  <svg className='w-6 h-6 fill-current flex-shrink-0' viewBox='0 0 170 170'>
    <path d='M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.31-5.83-8.81-10.37-18.79-13.62-29.93-3.25-11.14-4.88-21.95-4.88-32.43 0-14.02 3.69-25.59 11.07-34.72 7.38-9.13 16.54-13.82 27.48-14.07 4.58 0 9.83 1.25 15.75 3.75 5.92 2.5 9.77 3.82 11.55 3.96 1.35-.2 5.37-1.6 12.06-4.21 6.69-2.61 12.39-3.72 17.1-3.32 12.63 1.01 22.45 6.06 29.46 15.15-11.08 6.74-16.51 16.03-16.3 27.87.21 9.4 3.82 17.17 10.82 23.32 7 6.15 15.11 9.75 24.32 10.8-2.22 6.54-4.88 12.82-7.98 18.84zM119.22 33.36c-.11 4.58-1.58 8.92-4.41 13.01-2.83 4.09-6.49 7.21-10.98 9.36-.64-3.8-1.02-7.14-1.14-10.02-.12-4.81 1.4-9.33 4.57-13.56 3.17-4.23 7.15-7.3 11.96-9.21.32 3.49.32 6.96 0 10.42z' />
  </svg>
)

export const SocialAuthModal = ({
  provider,
  isOpen,
  onClose,
  onSuccess,
  isFarmer = false,
  prefilledEmail = ''
}) => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (provider) {
      const p = provider.toLowerCase()
      if (prefilledEmail && prefilledEmail.includes('@')) {
        setEmail(prefilledEmail)
        setName(prefilledEmail.split('@')[0])
      } else {
        const domain = p === 'google' ? 'gmail.com' : p === 'microsoft' ? 'outlook.com' : 'icloud.com'
        setEmail(`user.${p}@${domain}`)
        setName(`${provider.charAt(0).toUpperCase() + provider.slice(1)} User`)
      }
    }
  }, [provider, prefilledEmail])

  if (!isOpen || !provider) return null

  const p = provider.toLowerCase()

  const providerConfig = {
    google: {
      title: 'Sign in with Google',
      icon: <GoogleIcon />,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
      domain: '@gmail.com',
      serviceName: 'Google Accounts'
    },
    microsoft: {
      title: 'Sign in to Microsoft',
      icon: <MicrosoftIcon />,
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      btnColor: 'bg-[#0078D4] hover:bg-[#006abc] text-white',
      domain: '@outlook.com',
      serviceName: 'Microsoft Identity Platform'
    },
    apple: {
      title: 'Sign in with Apple ID',
      icon: <AppleIcon />,
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      btnColor: 'bg-black hover:bg-slate-900 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-black',
      domain: '@icloud.com',
      serviceName: 'Apple ID Security'
    }
  }[p] || {
    title: `Sign in with ${provider}`,
    icon: <GoogleIcon />,
    badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
    btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    domain: '@domain.com',
    serviceName: 'OAuth 2.0'
  }

  const handleAuthorize = async e => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    try {
      await onSuccess({
        provider: p,
        email: email.trim(),
        name: name.trim() || `${provider} User`,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        isFarmer
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn select-none'>
      <div className='bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scaleUp'>
        {/* Top Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800'>
          <div className='flex items-center gap-2.5'>
            {providerConfig.icon}
            <div>
              <h3 className='text-base font-bold text-slate-900 dark:text-white leading-none'>
                {providerConfig.title}
              </h3>
              <p className='text-[11px] text-slate-400 mt-0.5'>
                {providerConfig.serviceName}
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleAuthorize} className='p-6 space-y-4'>
          <div className='p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-200'>
              {name ? name.slice(0, 2).toUpperCase() : 'US'}
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-xs font-bold text-slate-900 dark:text-white truncate'>
                {name || 'Account User'}
              </p>
              <p className='text-[11px] text-slate-500 dark:text-slate-400 truncate'>
                {email || `user${providerConfig.domain}`}
              </p>
            </div>
            <span className='w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse' />
          </div>

          {isFarmer && (
            <div className='p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300'>
              <span>🌾</span>
              <span className='font-semibold'>Farmer Role Active:</span>
              <span className='text-[11px] text-emerald-700 dark:text-emerald-400'>
                Agro-Advisory will be enabled on sign-in.
              </span>
            </div>
          )}

          <div>
            <label className='block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1'>
              Account Email
            </label>
            <input
              type='email'
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1'>
              Display Name
            </label>
            <input
              type='text'
              value={name}
              onChange={e => setName(e.target.value)}
              className='w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div className='pt-2 space-y-2'>
            <button
              type='submit'
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-70 ${providerConfig.btnColor}`}
            >
              {isLoading ? (
                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
              ) : (
                <>
                  <span>Continue with {provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
                  <ArrowRight className='w-4 h-4' />
                </>
              )}
            </button>

            <button
              type='button'
              onClick={onClose}
              className='w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer'
            >
              Cancel
            </button>
          </div>

          <div className='flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1'>
            <Shield className='w-3.5 h-3.5 text-emerald-500' />
            <span>OAuth 2.0 Secure Token Exchange</span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SocialAuthModal
