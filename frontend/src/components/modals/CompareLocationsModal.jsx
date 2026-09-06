import React, { useState } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { useLanguage } from '../../context/LanguageContext';
import { X, ArrowRightLeft } from 'lucide-react';

export const CompareLocationsModal = ({ isOpen, onClose }) => {
  const { savedLocations, formatTemp } = useWeather();
  const { t, translateCondition, translateCity, translateRegion } = useLanguage();
  const [city1Id, setCity1Id] = useState(savedLocations[0]?.id || 'loc-1');
  const [city2Id, setCity2Id] = useState(savedLocations[1]?.id || 'loc-2');

  if (!isOpen) return null;

  const city1 = savedLocations.find(l => l.id === city1Id) || savedLocations[0];
  const city2 = savedLocations.find(l => l.id === city2Id) || savedLocations[1] || savedLocations[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('compareWeatherLocations')}
              </h3>
              <p className="text-xs text-slate-500">{t('sideBySideDesc')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* City Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('firstLocation')}
              </label>
              <select
                value={city1Id}
                onChange={(e) => setCity1Id(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {savedLocations.map(l => (
                  <option key={l.id} value={l.id}>{translateCity(l.city)}, {translateRegion(l.region)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('secondLocation')}
              </label>
              <select
                value={city2Id}
                onChange={(e) => setCity2Id(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {savedLocations.map(l => (
                  <option key={l.id} value={l.id}>{translateCity(l.city)}, {translateRegion(l.region)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Location 1 Card */}
            <div className="p-4 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl space-y-3 text-center">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{translateCity(city1.city)}</span>
              <div className="text-4xl font-black text-slate-900 dark:text-white">{formatTemp(city1.tempC)}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">{translateCondition(city1.condition)}</p>

              <div className="space-y-1.5 pt-2 border-t border-blue-100 dark:border-blue-900/30 text-xs text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('humidity')}:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{city1.humidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('wind')}:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{city1.windSpeedKmh} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('pressure')}:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{city1.pressureHpa} hPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">AQI:</span>
                  <span className="font-bold text-emerald-600">{city1.aqi || 68}</span>
                </div>
              </div>
            </div>

            {/* Location 2 Card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl space-y-3 text-center">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{translateCity(city2.city)}</span>
              <div className="text-4xl font-black text-slate-900 dark:text-white">{formatTemp(city2.tempC)}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">{translateCondition(city2.condition)}</p>

              <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/40 text-xs text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('humidity')}:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{city2.humidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('wind')}:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{city2.windSpeedKmh} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('pressure')}:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{city2.pressureHpa} hPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">AQI:</span>
                  <span className="font-bold text-emerald-600">{city2.aqi || 68}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompareLocationsModal;
