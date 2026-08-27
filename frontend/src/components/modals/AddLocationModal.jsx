import React, { useState } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { X, Search, MapPin, Plus, Check } from 'lucide-react';
import { WeatherIcon } from '../common/WeatherIcon';

export const AddLocationModal = () => {
  const { isAddLocationOpen, setIsAddLocationOpen, allCityDatabase, savedLocations, addLocation, formatTemp } = useWeather();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isAddLocationOpen) return null;

  const filteredCities = allCityDatabase.filter(item =>
    item.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add New Location</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Search and save any city to get real-time weather</p>
          </div>
          <button
            onClick={() => setIsAddLocationOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 pb-2">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              placeholder="Search city, state or territory..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto px-6 py-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredCities.length > 0 ? (
            filteredCities.map(city => {
              const isSaved = savedLocations.some(l => l.city.toLowerCase() === city.city.toLowerCase());
              return (
                <div
                  key={city.id}
                  className="flex items-center justify-between py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 px-2 rounded-xl transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                      <WeatherIcon condition={city.condition} className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {city.city}, {city.region}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {city.condition} • {formatTemp(city.tempC)} (Feels like {formatTemp(city.feelsLikeC)})
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={isSaved}
                    onClick={() => {
                      addLocation(city);
                      setIsAddLocationOpen(false);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isSaved
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-default'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Add City
                      </>
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-400">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No locations found matching "{searchTerm}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setIsAddLocationOpen(false)}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
