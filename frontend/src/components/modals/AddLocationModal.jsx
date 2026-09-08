import React, { useState, useEffect } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { X, Search, MapPin, Plus, Check, Loader2 } from 'lucide-react';

export const AddLocationModal = () => {
  const { isAddLocationOpen, setIsAddLocationOpen, savedLocations, addLocation } = useWeather();
  const { t, translateCity, translateRegion } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await api.searchLocations(searchTerm.trim());
        setSearchResults(Array.isArray(results) ? results : []);
      } catch (err) {
        console.error('Failed to search locations:', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isAddLocationOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('addNewLocation')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('searchSaveCityDesc')}
            </p>
          </div>
          <button
            onClick={() => setIsAddLocationOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
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
              placeholder={t('searchCityPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {searching && (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
            )}
          </div>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto px-6 py-2 divide-y divide-slate-100 dark:divide-slate-800/60 min-h-[220px]">
          {searchResults.length > 0 ? (
            searchResults.map(city => {
              const isSaved = savedLocations.some(
                l => l.city.toLowerCase() === city.city.toLowerCase()
              );
              return (
                <div
                  key={city.id}
                  className="flex items-center justify-between py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 px-2 rounded-xl transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {translateCity(city.city)}{city.region ? `, ${translateRegion(city.region)}` : ''}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {city.country ? `${city.country} • ` : ''}Lat {Number(city.lat).toFixed(2)}°, Lon {Number(city.lng).toFixed(2)}°
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={isSaved}
                    onClick={async () => {
                      await addLocation({
                        city: city.city,
                        region: city.region || city.country || '',
                        lat: city.lat,
                        lng: city.lng,
                        isFavorite: false
                      });
                      setIsAddLocationOpen(false);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      isSaved
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-default'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        {t('saved')}
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        {t('addCity')}
                      </>
                    )}
                  </button>
                </div>
              );
            })
          ) : searchTerm.trim() ? (
            <div className="text-center py-10 text-slate-400">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">{t('noSavedLocations')} "{searchTerm}"</p>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs text-slate-500">{t('searchCityPlaceholder')}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setIsAddLocationOpen(false)}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLocationModal;
