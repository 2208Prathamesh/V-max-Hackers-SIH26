import React, { useState } from 'react';
import { useWeather } from '../context/WeatherContext';
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
  Sun
} from 'lucide-react';
import { ForgotPasswordModal } from '../components/modals/ForgotPasswordModal';
import confetti from 'canvas-confetti';

// Google Brand Icon
const GoogleIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

// Apple Brand Icon
const AppleIcon = () => (
  <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 170 170">
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.31-5.83-8.81-10.37-18.79-13.62-29.93-3.25-11.14-4.88-21.95-4.88-32.43 0-14.02 3.69-25.59 11.07-34.72 7.38-9.13 16.54-13.82 27.48-14.07 4.58 0 9.83 1.25 15.75 3.75 5.92 2.5 9.77 3.82 11.55 3.96 1.35-.2 5.37-1.6 12.06-4.21 6.69-2.61 12.39-3.72 17.1-3.32 12.63 1.01 22.45 6.06 29.46 15.15-11.08 6.74-16.51 16.03-16.3 27.87.21 9.4 3.82 17.17 10.82 23.32 7 6.15 15.11 9.75 24.32 10.8-2.22 6.54-4.88 12.82-7.98 18.84zM119.22 33.36c-.11 4.58-1.58 8.92-4.41 13.01-2.83 4.09-6.49 7.21-10.98 9.36-.64-3.8-1.02-7.14-1.14-10.02-.12-4.81 1.4-9.33 4.57-13.56 3.17-4.23 7.15-7.3 11.96-9.21.32 3.49.32 6.96 0 10.42z" />
  </svg>
);

// Microsoft Brand Icon
const MicrosoftIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 21 21">
    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
  </svg>
);

// 3D Styled Cloud & Sun Logo matching the mockup
const WeatherGPTLogo = () => (
  <div className="flex items-center gap-3 select-none">
    <div className="relative w-12 h-10 flex items-center justify-center">
      {/* Golden Glowing Sun behind cloud */}
      <div className="absolute top-0.5 right-1 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-400 to-yellow-200 shadow-[0_0_12px_rgba(250,204,21,0.85)] animate-pulse-subtle flex items-center justify-center">
        <Sun className="w-3.5 h-3.5 text-amber-800/40" />
      </div>
      {/* 3D Puffy Cloud */}
      <div className="relative z-10 filter drop-shadow-md">
        <svg className="w-10 h-7" viewBox="0 0 64 44" fill="none">
          <path
            d="M48 38H16C8.82 38 3 32.18 3 25C3 18.23 8.16 12.67 14.85 12.06C17.65 5.16 24.47 0.5 32.5 0.5C42.06 0.5 49.98 7.37 51.64 16.48C57.48 17.58 61.5 22.68 61.5 28.5C61.5 33.75 57.25 38 52 38H48Z"
            fill="url(#cloudGrad)"
          />
          <defs>
            <linearGradient id="cloudGrad" x1="10" y1="5" x2="55" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="0.6" stopColor="#F1F5F9" />
              <stop offset="1" stopColor="#CBD5E1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
    <span className="text-2xl font-bold tracking-tight text-white drop-shadow-sm font-sans">
      WeatherGPT
    </span>
  </div>
);

export const LoginPage = () => {
  const { login, signUp, setIsForgotPasswordOpen } = useWeather();

  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const triggerLoginSuccessConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#2563EB', '#38BDF8', '#F59E0B', '#10B981']
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      triggerLoginSuccessConfetti();
      if (isSignUpMode) {
        signUp({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
      } else {
        login(formData.email, formData.password);
      }
    }, 750);
  };

  const handleSocialLogin = (providerName) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      triggerLoginSuccessConfetti();
      login(`${providerName.toLowerCase()}user@weathergpt.ai`, 'social123');
    }, 600);
  };

  const handleQuickDemoLogin = () => {
    setFormData({
      name: 'Sid Patil',
      email: 'sidpatil@gmail.com',
      password: 'password123'
    });
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      triggerLoginSuccessConfetti();
      login('sidpatil@gmail.com', 'password123');
    }, 500);
  };

  return (
    <div className="min-h-screen w-full bg-[#EBF2FA] dark:bg-[#070D18] flex items-center justify-center p-3 sm:p-6 md:p-8 lg:p-10 select-none">
      {/* Forgot Password Modal */}
      <ForgotPasswordModal />

      {/* Main Split-Screen Container Card matching the design */}
      <div className="w-full max-w-6xl min-h-[760px] bg-white dark:bg-[#0F172A] rounded-[28px] sm:rounded-[36px] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-200/80 dark:border-slate-800">
        
        {/* =========================================================================
            LEFT PANEL: Scenic Weather Landscape + Feature Points + Quote Card
            ========================================================================= */}
        <div className="lg:col-span-6 relative flex flex-col justify-between p-7 sm:p-10 lg:p-12 overflow-hidden bg-[#2563EB] text-white">
          {/* Background image & gradient overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop')`
            }}
          />
          {/* Scenic atmospheric blue top-to-bottom atmospheric overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#2563EB]/95 via-[#1D4ED8]/85 to-[#0F172A]/90 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-blue-600/30" />

          {/* Foreground Left Content */}
          <div className="relative z-10 flex flex-col h-full justify-between space-y-8">
            
            {/* Top Branding */}
            <div>
              <WeatherGPTLogo />

              {/* Main Headline & Subtitle */}
              <div className="mt-8 md:mt-10 max-w-md">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Your AI Weather Companion
                </h1>
                <p className="mt-3 text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal">
                  Real-time forecasts, smart alerts and personalized insights — all in one place.
                </p>
              </div>

              {/* 4 Feature Items */}
              <div className="mt-8 sm:mt-10 space-y-5">
                
                {/* Feature 1: Chat Naturally */}
                <div className="flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-2xl bg-white/95 text-blue-600 shadow-md shadow-blue-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition duration-200">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      Chat Naturally
                    </h3>
                    <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed mt-0.5">
                      Ask anything about weather in natural language.
                    </p>
                  </div>
                </div>

                {/* Feature 2: Instant Alerts */}
                <div className="flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-2xl bg-white/95 text-blue-600 shadow-md shadow-blue-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition duration-200">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      Instant Alerts
                    </h3>
                    <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed mt-0.5">
                      Get notified about severe weather and important updates.
                    </p>
                  </div>
                </div>

                {/* Feature 3: Location Based */}
                <div className="flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-2xl bg-white/95 text-blue-600 shadow-md shadow-blue-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition duration-200">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      Location Based
                    </h3>
                    <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed mt-0.5">
                      Accurate weather updates for any location you care about.
                    </p>
                  </div>
                </div>

                {/* Feature 4: Smart Insights */}
                <div className="flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-2xl bg-white/95 text-blue-600 shadow-md shadow-blue-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition duration-200">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      Smart Insights
                    </h3>
                    <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed mt-0.5">
                      Get climate trends and helpful recommendations.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Glassmorphic Quote Card */}
            <div className="pt-6">
              <div className="bg-slate-900/40 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 text-white shadow-xl max-w-md">
                <div className="flex items-start gap-2">
                  <span className="text-2xl font-serif text-white/90 leading-none select-none">
                    “
                  </span>
                  <p className="text-xs sm:text-sm text-white/95 font-medium leading-relaxed italic">
                    The best time to plant a tree was 20 years ago. The second best time is now.”
                  </p>
                </div>
                <p className="text-[11px] text-white/75 mt-2.5 font-normal tracking-wide pl-4">
                  — Weather wisdom
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* =========================================================================
            RIGHT PANEL: Clean Modern Authentication Form
            ========================================================================= */}
        <div className="lg:col-span-6 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-14 bg-white dark:bg-[#111C2E]">
          <div className="w-full max-w-md">
            
            {/* Form Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {isSignUpMode ? 'Create Account' : 'Welcome Back!'}
                </h2>
                {/* 1-Click Quick Demo Pill */}
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/60 transition"
                  title="Auto-fill and login with demo credentials"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Demo Login</span>
                </button>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                {isSignUpMode 
                  ? 'Sign up to start receiving AI weather forecasts' 
                  : 'Login to continue to WeatherGPT'}
              </p>
            </div>

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Optional Full Name in Sign Up Mode */}
              {isSignUpMode && (
                <div className="animate-fadeIn">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition shadow-2xs">
                    <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition shadow-2xs">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="username"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none rounded-xl"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition shadow-2xs">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    autoComplete={isSignUpMode ? 'new-password' : 'current-password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-11 py-3 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Forgot Password Link */}
                {!isSignUpMode && (
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordOpen(true)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/25 transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>{isSignUpMode ? 'Sign Up' : 'Login'}</span>
                  </>
                )}
              </button>

            </form>

            {/* Social Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700/80" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-[#111C2E] px-4 text-slate-500 dark:text-slate-400 font-medium">
                  or continue with
                </span>
              </div>
            </div>

            {/* 3 Social Buttons */}
            <div className="grid grid-cols-3 gap-3">
              {/* Google */}
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-2xs font-semibold text-xs text-slate-700 dark:text-slate-200 group"
              >
                <GoogleIcon />
                <span>Google</span>
              </button>

              {/* Apple */}
              <button
                type="button"
                onClick={() => handleSocialLogin('Apple')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-2xs font-semibold text-xs text-slate-700 dark:text-slate-200 group"
              >
                <AppleIcon />
                <span>Apple</span>
              </button>

              {/* Microsoft */}
              <button
                type="button"
                onClick={() => handleSocialLogin('Microsoft')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600 transition shadow-2xs font-semibold text-xs text-slate-700 dark:text-slate-200 group"
              >
                <MicrosoftIcon />
                <span>Microsoft</span>
              </button>
            </div>

            {/* Switch between Login and Sign up */}
            <p className="text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-7">
              {isSignUpMode ? 'Already have an account? ' : "Don't have an account? "}
              <button
                type="button"
                onClick={() => setIsSignUpMode(!isSignUpMode)}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
              >
                {isSignUpMode ? 'Login' : 'Sign up'}
              </button>
            </p>

            {/* Trust Footer */}
            <div className="flex items-center justify-center gap-2 mt-8 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Your data is safe and secure with us.</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
