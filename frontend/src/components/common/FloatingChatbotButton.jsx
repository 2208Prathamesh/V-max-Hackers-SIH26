import React, { useState } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles } from 'lucide-react';

/**
 * WeatherBotEmblem:
 * Seamless fusion of the WeatherGPT App Logo (Golden Sun + 3D Puffy Cloud)
 * and an intelligent AI Chatbot (Antenna + Cyber Digital Visor + Glowing LED Eyes & Smile).
 */
const WeatherBotEmblem = ({ isDark }) => (
  <div className="relative w-10 h-10 flex items-center justify-center select-none">
    <svg 
      className="w-full h-full drop-shadow-md transition-transform duration-300 group-hover:scale-110" 
      viewBox="-4 -10 68 56" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Sun Radial Gradient */}
        <radialGradient id="fabSunGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>

        {/* Cloud-Bot Body Gradient matching Light/Dark Mode */}
        <linearGradient id="fabCloudBotGrad" x1="5" y1="5" x2="55" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={isDark ? '#BAE6FD' : '#FFFFFF'} />
          <stop offset="50%" stopColor={isDark ? '#38BDF8' : '#93C5FD'} />
          <stop offset="100%" stopColor={isDark ? '#1D4ED8' : '#2563EB'} />
        </linearGradient>

        {/* Visor Glass Gradient */}
        <linearGradient id="fabVisorGrad" x1="16" y1="18" x2="42" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B1329" />
          <stop offset="100%" stopColor="#030712" />
        </linearGradient>

        {/* Eye LED Glow Filter */}
        <filter id="fabEyeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.8" result="glow" />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>
      </defs>

      {/* 1. Golden Glowing Sun (from Weather App Logo) */}
      <g>
        {/* Ambient Sun Glow */}
        <circle cx="44" cy="9" r="13" fill="#FBBF24" opacity="0.35" filter="blur(2.5px)" />
        {/* Main Sun Orb */}
        <circle cx="44" cy="9" r="9.5" fill="url(#fabSunGrad)" />
        {/* Subtle Sun Flare Ray Accents */}
        <path d="M44 -3.5L44 -0.5" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
        <path d="M56.5 9L53.5 9" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
        <path d="M52.5 0.5L50.5 2.5" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
      </g>

      {/* 2. Bot Antenna emerging from Cloud Crown */}
      <g>
        <line 
          x1="28" 
          y1="2.5" 
          x2="28" 
          y2="-4" 
          stroke={isDark ? '#67E8F9' : '#38BDF8'} 
          strokeWidth="2.2" 
          strokeLinecap="round" 
        />
        {/* Glowing Antenna Transmitter Orb */}
        <circle cx="28" cy="-6" r="3.2" fill={isDark ? '#22D3EE' : '#38BDF8'} />
        <circle cx="28" cy="-6" r="1.3" fill="#FFFFFF" />
      </g>

      {/* 3. Cyber Ear / Headphone Nodes on flanks */}
      <rect x="0.5" y="21" width="3.5" height="7" rx="1.75" fill={isDark ? '#0284C7' : '#1E40AF'} opacity="0.85" />
      <rect x="52" y="21" width="3.5" height="7" rx="1.75" fill={isDark ? '#0284C7' : '#1E40AF'} opacity="0.85" />

      {/* 4. 3D Puffy Cloud Body (from Weather App Logo) */}
      <path
        d="M44 36H14C7.5 36 2.5 30.8 2.5 24.5C2.5 18.5 7 13.5 13 13C15.5 6.8 21.8 2.5 29 2.5C37.5 2.5 44.5 8.5 46 16.5C51 17.5 54.5 22 54.5 27.2C54.5 32 50.8 36 46 36H44Z"
        fill="url(#fabCloudBotGrad)"
        filter="drop-shadow(0 3px 6px rgba(0,0,0,0.2))"
      />

      {/* 5. Robot Digital Visor Face (from Chatbot) */}
      <rect 
        x="15" 
        y="18" 
        width="26" 
        height="12" 
        rx="6" 
        fill="url(#fabVisorGrad)" 
        stroke={isDark ? '#38BDF8' : '#60A5FA'} 
        strokeWidth="1.2" 
        opacity="0.95" 
      />

      {/* 6. Glowing Expressive Cyan LED Eyes & Friendly Smile */}
      <g filter="url(#fabEyeGlow)">
        {/* Left LED Eye */}
        <circle cx="22.5" cy="23.5" r="2.2" fill="#38BDF8" />
        <circle cx="23.2" cy="22.8" r="0.75" fill="#FFFFFF" />

        {/* Right LED Eye */}
        <circle cx="33.5" cy="23.5" r="2.2" fill="#38BDF8" />
        <circle cx="34.2" cy="22.8" r="0.75" fill="#FFFFFF" />

        {/* Friendly AI Smile */}
        <path 
          d="M25.5 26.2 Q 28 28.2 30.5 26.2" 
          stroke="#38BDF8" 
          strokeWidth="1.3" 
          strokeLinecap="round" 
          fill="none" 
        />
      </g>
    </svg>
  </div>
);

export const FloatingChatbotButton = () => {
  const { currentPage, setCurrentPage } = useWeather();
  const { isDark } = useTheme();
  const { language, t } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  // Hide when already on the full chat page
  if (currentPage === 'chat') return null;

  const tooltipText = 
    language === 'mr'
      ? 'WeatherGPT AI ला विचारा'
      : language === 'hi'
        ? 'WeatherGPT AI से पूछें'
        : t('askWeatherGPT') || 'Ask WeatherGPT AI';

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center select-none">
      {/* Interactive Tooltip Pill (Left of button) */}
      <div
        className={`mr-3 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-xl border text-xs font-bold flex items-center gap-2 transition-all duration-300 pointer-events-none ${
          isDark 
            ? 'bg-[#111C2E]/95 text-slate-100 border-slate-700/80 shadow-blue-950/40' 
            : 'bg-white/95 text-slate-800 border-slate-200/90 shadow-slate-300/40'
        } ${
          isHovered
            ? 'opacity-100 translate-x-0 scale-100'
            : 'opacity-0 translate-x-2 scale-95'
        }`}
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span>{tooltipText}</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400/40 animate-pulse" />
      </div>

      {/* Main Floating Circular Button - Theme Matched */}
      <button
        onClick={() => setCurrentPage('chat')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative group w-14 h-14 sm:w-15 sm:h-15 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
          isDark
            ? 'bg-gradient-to-tr from-indigo-800 via-blue-600 to-slate-900 border-2 border-blue-400/40 hover:border-blue-400/80 shadow-[0_8px_28px_rgba(30,58,138,0.55)] hover:shadow-[0_12px_36px_rgba(37,99,235,0.7)]'
            : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 border-2 border-white/70 hover:border-white shadow-[0_8px_25px_rgba(37,99,235,0.38)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.55)]'
        } hover:scale-105 active:scale-95`}
        title={tooltipText}
        aria-label="Open WeatherGPT AI Chatbot"
      >
        {/* Ambient Pulsing Aura tuned to Theme */}
        <div 
          className={`absolute inset-0 rounded-full blur-md -z-10 animate-pulse ${
            isDark ? 'bg-indigo-500/35' : 'bg-blue-400/30'
          }`} 
        />

        {/* Live Status Online Indicator Badge */}
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className={`relative inline-flex rounded-full h-4 w-4 bg-emerald-500 ring-2 items-center justify-center ${
            isDark ? 'ring-[#111C2E]' : 'ring-white'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </span>
        </span>

        {/* Merged Weather App Logo + Bot Emblem */}
        <WeatherBotEmblem isDark={isDark} />
      </button>
    </div>
  );
};

export default FloatingChatbotButton;
