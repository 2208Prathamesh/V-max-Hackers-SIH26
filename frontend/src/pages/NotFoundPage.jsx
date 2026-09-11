import React from 'react'
import {
  Compass,
  Home,
  MapPin,
  AlertTriangle,
  MessageSquare,
  ArrowLeft,
  CloudRain,
  Radio,
  Wind
} from 'lucide-react'
import { useWeather } from '../context/WeatherContext'
import { useLanguage } from '../context/LanguageContext'

export const NotFoundPage = () => {
  const { setCurrentPage, setSelectedLocation } = useWeather()
  const { language } = useLanguage()

  const quickCities = [
    { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
    { name: 'Pune', lat: 18.5204, lon: 73.8567 },
    { name: 'Nagpur', lat: 21.1458, lon: 79.0882 },
    { name: 'Bengaluru', lat: 12.9716, lon: 77.5946 }
  ]

  const handleCityClick = (city) => {
    if (setSelectedLocation) {
      setSelectedLocation({
        name: city.name,
        latitude: city.lat,
        longitude: city.lon
      })
    }
    setCurrentPage('dashboard')
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-2xl w-full text-center">
        {/* Animated Meteorological 404 Graphic */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-600/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-b from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex flex-col items-center justify-center shadow-xl">
            <div className="relative">
              <Radio className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500 animate-pulse" />
              <CloudRain className="w-6 h-6 text-amber-500 absolute -bottom-1 -right-1" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-1 tracking-tighter">
              404
            </span>
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-4">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>
            {language === 'mr' ? 'हवामान रडार कक्षेत सापडले नाही' : language === 'hi' ? 'रडार सीमा से बाहर' : 'Radar Blindspot • Page Not Found'}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          {language === 'mr'
            ? 'हे पृष्ठ उपलब्ध नाही किंवा हलवण्यात आले आहे'
            : language === 'hi'
              ? 'यह पृष्ठ उपलब्ध नहीं है या स्थानांतरित कर दिया गया है'
              : 'Atmospheric Signal Lost'}
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-lg mx-auto mb-8">
          {language === 'mr'
            ? 'तुम्ही शोधत असलेला पृष्ठ, अंदाज किंवा जिल्हा डॅशबोर्ड उपलब्ध नाही. कृपया खालील पर्यायांचा वापर करा.'
            : language === 'hi'
              ? 'आप जिस पृष्ठ या मौसम पूर्वानुमान की तलाश कर रहे हैं, वह रडार पर उपलब्ध नहीं है। कृपया मुख्य पोर्टल पर लौटें।'
              : 'The weather forecast, district bulletin, or intelligence view you requested does not exist or has moved outside our radar range.'}
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{language === 'mr' ? 'मुख्य डॅशबोर्ड' : language === 'hi' ? 'मुख्य डैशबोर्ड' : 'Live Dashboard'}</span>
          </button>

          <button
            onClick={() => setCurrentPage('alerts')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>{language === 'mr' ? 'इशारे व चेतावणी' : language === 'hi' ? 'आपदा अलर्ट' : 'Active Alerts'}</span>
          </button>

          <button
            onClick={() => setCurrentPage('weather-map')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <Compass className="w-4 h-4 text-blue-500" />
            <span>{language === 'mr' ? 'हवामान नकाशा' : language === 'hi' ? 'मौसम मानचित्र' : 'Weather Map'}</span>
          </button>

          <button
            onClick={() => setCurrentPage('chat')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            <span>WeatherGPT Chat</span>
          </button>
        </div>

        {/* Quick Jump Stations */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            {language === 'mr' ? 'किंवा थेट शहराचे हवामान पहा:' : language === 'hi' ? 'या प्रमुख शहर का मौसम देखें:' : 'Or jump directly to major weather stations:'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {quickCities.map(city => (
              <button
                key={city.name}
                onClick={() => handleCityClick(city)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-blue-50 dark:bg-slate-800/80 dark:hover:bg-blue-900/30 text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700/60 transition cursor-pointer"
              >
                <MapPin className="w-3 h-3 text-blue-500" />
                <span>{city.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Browser History Back */}
        <div className="mt-8">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'मागील पानावर जा' : language === 'hi' ? 'पिछले पृष्ठ पर वापस जाएं' : 'Go back to previous page'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
