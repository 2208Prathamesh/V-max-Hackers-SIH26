import React from 'react';
import { useWeather } from '../../context/WeatherContext';
import { useLanguage } from '../../context/LanguageContext';
import { X, Wind, Activity, CheckCircle2, ShieldAlert } from 'lucide-react';

export const AirQualityModal = () => {
  const { isAirQualityOpen, setIsAirQualityOpen, selectedMapLocation, savedLocations } = useWeather();
  const { t, language, translateCity, translateRegion } = useLanguage();
  const city = selectedMapLocation || savedLocations[0];

  if (!isAirQualityOpen || !city) return null;

  const aqiValue = city.aqi || 68;

  const getAqiCategory = (val) => {
    if (val <= 50) {
      return {
        label: t('aqiGood'),
        color: 'emerald',
        text: t('aqiGoodDesc'),
        advice: t('favorableAirOutdoor')
      };
    }
    if (val <= 100) {
      return {
        label: t('moderate'),
        color: 'amber',
        text: t('aqiModerateDesc'),
        advice: t('moderateAirAdvice')
      };
    }
    if (val <= 150) {
      return {
        label: t('aqiUnhealthySensitive'),
        color: 'orange',
        text: t('aqiUnhealthySensitiveDesc'),
        advice: t('moderateAirAdvice')
      };
    }
    return {
      label: t('aqiUnhealthy'),
      color: 'rose',
      text: t('aqiUnhealthyDesc'),
      advice: t('unhealthyAirAdvice')
    };
  };

  const aqiInfo = getAqiCategory(aqiValue);

  const pollutants = [
    { name: 'PM2.5', value: '18.2 µg/m³', percentage: 36 },
    { name: 'PM10', value: '42.0 µg/m³', percentage: 55 },
    { name: 'NO₂', value: '14.5 ppb', percentage: 25 },
    { name: 'O₃ (Ozone)', value: '28.1 ppb', percentage: 40 },
    { name: 'SO₂', value: '3.2 ppb', percentage: 15 },
    { name: 'CO', value: '0.4 ppm', percentage: 10 }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('airQuality')}
              </h3>
              <p className="text-xs text-slate-500">{translateCity(city.city)}, {translateRegion(city.region || city.state || 'India')}</p>
            </div>
          </div>
          <button
            onClick={() => setIsAirQualityOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Main Score Card */}
          <div className="bg-gradient-to-br from-purple-50 via-indigo-50/50 to-white dark:from-purple-950/20 dark:to-slate-800/40 border border-purple-100 dark:border-purple-900/30 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                {t('liveAqiScore')}
              </span>
              <div className="text-5xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {aqiValue}
              </div>
              <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{aqiInfo.label}</span>
              </div>
            </div>
            <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-purple-100 dark:border-purple-900/40 flex flex-col items-center justify-center text-center p-2">
              <Activity className="w-6 h-6 text-purple-500 mb-1" />
              <span className="text-[10px] text-slate-400 font-medium">{t('standardAqi')}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            {aqiInfo.text}
          </p>

          {/* Pollutant breakdown */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              {t('pollutantConcentrations')}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {pollutants.map((p, i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{p.name}</span>
                    <span className="text-slate-500 font-medium">{p.value}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full"
                      style={{ width: `${p.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Health Advice */}
          <div className="flex items-start gap-3 p-3.5 bg-blue-50/80 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/30 text-xs text-blue-900 dark:text-blue-200">
            <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              {aqiInfo.advice} ({translateCity(city.city)})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirQualityModal;
