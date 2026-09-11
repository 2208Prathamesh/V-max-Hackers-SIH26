import React, { useState } from 'react'
import { useWeather } from '../context/WeatherContext'
import { useLanguage } from '../context/LanguageContext'
import {
  LayoutGrid,
  List,
  Plus,
  MoreVertical,
  Umbrella,
  ChevronRight,
  ArrowRight,
  Lightbulb,
  MapPin,
  Trash2,
  Star,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import { WeatherIcon } from '../components/common/WeatherIcon'

export const SavedLocationsPage = () => {
  const {
    savedLocations,
    removeLocation,
    toggleFavorite,
    setIsAddLocationOpen,
    setCurrentPage,
    setSelectedMapLocation,
    formatTemp,
    formatWind,
    addToast
  } = useWeather()
  const { t, translateCondition, formatDay, language, translateCity, translateRegion } = useLanguage()

  const [viewMode, setViewMode] = useState('list') // 'list' | 'grid'
  const [sortBy, setSortBy] = useState('updated') // 'updated' | 'temp' | 'name'
  const [activeMenuId, setActiveMenuId] = useState(null)

  const normalizedLocations = savedLocations.map(location => ({
    ...location,
    id: location.id || location._id,
    region: location.region || location.state || '',
    tempC: location.tempC ?? null,
    feelsLikeC: location.feelsLikeC ?? null,
    condition: location.condition || t('weatherUnavailable'),
    humidity: location.humidity ?? null,
    windSpeedKmh: location.windSpeedKmh ?? null,
    windDirection: location.windDirection || '',
    forecast3Day: Array.isArray(location.forecast3Day)
      ? location.forecast3Day
      : []
  }))

  // Sorting
  const sortedLocations = [...normalizedLocations].sort((a, b) => {
    if (sortBy === 'temp')
      return (b.tempC ?? -Infinity) - (a.tempC ?? -Infinity)
    if (sortBy === 'name') return a.city.localeCompare(b.city)
    return 0 // Default original
  })

  // Calculate summary metrics
  const warmest = [...normalizedLocations].sort(
    (a, b) => (b.tempC ?? -Infinity) - (a.tempC ?? -Infinity)
  )[0]
  const coolest = [...normalizedLocations].sort(
    (a, b) => (a.tempC ?? Infinity) - (b.tempC ?? Infinity)
  )[0]
  const rainy =
    normalizedLocations.find(l => l.condition.toLowerCase().includes('rain')) ||
    normalizedLocations[1]

  const handleLocationClick = loc => {
    setSelectedMapLocation(loc)
    setCurrentPage('weather-map')
  }

  return (
    <div className='space-y-6'>
      {/* Top Action controls bar */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-bold text-slate-900 dark:text-white'>
            {t('savedLocations')} ({savedLocations.length})
          </span>
          <span className='text-slate-300 dark:text-slate-700'>•</span>
          <div className='flex items-center gap-1.5 text-xs text-slate-500'>
            <span>{t('alertFilters')}:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className='bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer'
            >
              <option value='updated'>{t('refresh')}</option>
              <option value='temp'>{t('maxTemp')}</option>
              <option value='name'>{t('location')}</option>
            </select>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          {/* View mode toggle */}
          <div className='flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700'>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className='w-4 h-4' />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <List className='w-4 h-4' />
            </button>
          </div>

          {/* + Add Location Button */}
          <button
            onClick={() => setIsAddLocationOpen(true)}
            className='flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition'
          >
            <Plus className='w-4 h-4' />
            <span>{t('addCity')}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Locations List & Right Column */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
        {/* Left Column: Locations List / Grid (8 cols) */}
        <div className='lg:col-span-8 space-y-4'>
          {viewMode === 'list' ? (
            <div className='space-y-3.5'>
              {sortedLocations.map(loc => (
                <div
                  key={loc.id}
                  className='bg-white dark:bg-[#121316] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-card hover:shadow-md transition-all duration-200 relative group'
                >
                  <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                    {/* Left: Location header & Condition */}
                    <div className='flex items-start gap-4'>
                      <div className='w-2.5 h-2.5 rounded-full bg-blue-600 mt-1.5 shrink-0' />
                      <div>
                        <div className='flex items-center gap-2'>
                          <h3
                            onClick={() => handleLocationClick(loc)}
                            className='text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition'
                          >
                            {translateCity(loc.city)}, {translateRegion(loc.region)}
                          </h3>
                        </div>
                        <p className='text-xs text-slate-400 dark:text-slate-500'>
                          {loc.country}
                        </p>
                        <span className='text-[11px] text-slate-400 dark:text-slate-500 block mt-2'>
                          {loc.updatedTime}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Weather condition badge & temperature */}
                    <div className='flex items-center gap-4'>
                      <div className='w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center shrink-0'>
                        <WeatherIcon
                          condition={loc.condition}
                          className='w-8 h-8'
                        />
                      </div>
                      <div>
                        <div className='text-2xl font-bold tracking-tight text-slate-900 dark:text-white'>
                          {formatTemp(loc.tempC)}
                        </div>
                        <div className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                          {translateCondition(loc.condition)}
                        </div>
                      </div>
                    </div>

                    {/* Key Metrics: Feels like, Humidity, Wind */}
                    <div className='text-xs space-y-1 text-slate-500 dark:text-slate-400 border-l border-slate-100 dark:border-slate-800/80 pl-4'>
                      <div>
                        {t('feelsLike')}{' '}
                        <span className='font-semibold text-slate-800 dark:text-slate-200'>
                          {formatTemp(loc.feelsLikeC)}
                        </span>
                      </div>
                      <div>
                        {t('humidity')}{' '}
                        <span className='font-semibold text-slate-800 dark:text-slate-200'>
                          {loc.humidity}%
                        </span>
                      </div>
                      <div>
                        {t('wind')}{' '}
                        <span className='font-semibold text-slate-800 dark:text-slate-200'>
                          {formatWind(loc.windSpeedKmh)} {loc.windDirection}
                        </span>
                      </div>
                    </div>

                    {/* 3-day mini forecast */}
                    <div className='flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60'>
                      {loc.forecast3Day.map((fc, idx) => (
                        <div key={idx} className='text-center px-1.5'>
                          <span className='text-[10px] font-semibold text-slate-400 block'>
                            {formatDay(fc.day)}
                          </span>
                          <div className='my-1 flex justify-center'>
                            <WeatherIcon
                              condition={fc.condition}
                              className='w-4 h-4'
                            />
                          </div>
                          <span className='text-xs font-bold text-slate-700 dark:text-slate-300'>
                            {formatTemp(fc.temp)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action button menu */}
                    <div className='relative'>
                      <button
                        onClick={() =>
                          setActiveMenuId(
                            activeMenuId === loc.id ? null : loc.id
                          )
                        }
                        className='p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition'
                      >
                        <MoreVertical className='w-4 h-4' />
                      </button>

                      {activeMenuId === loc.id && (
                        <div className='absolute right-0 top-10 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-30 animate-fadeIn'>
                          <button
                            onClick={() => {
                              handleLocationClick(loc)
                              setActiveMenuId(null)
                            }}
                            className='w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition'
                          >
                            <MapPin className='w-3.5 h-3.5' />
                            <span>{t('viewOnMap')}</span>
                          </button>
                          <button
                            onClick={() => {
                              toggleFavorite(loc.id)
                              setActiveMenuId(null)
                              addToast(
                                loc.isFavorite
                                  ? t('removedFromFavorites')
                                  : t('addedToFavorites'),
                                'info'
                              )
                            }}
                            className='w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition'
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                loc.isFavorite
                                  ? 'fill-amber-400 text-amber-400'
                                  : ''
                              }`}
                            />
                            <span>
                              {loc.isFavorite
                                ? t('unstarLocation')
                                : t('starLocation')}
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              removeLocation(loc.id)
                              setActiveMenuId(null)
                            }}
                            className='w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition'
                          >
                            <Trash2 className='w-3.5 h-3.5' />
                            <span>{t('deleteLocation')}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Grid View */
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {sortedLocations.map(loc => (
                <div
                  key={loc.id}
                  onClick={() => handleLocationClick(loc)}
                  className='bg-white dark:bg-[#121316] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-card hover:border-blue-500/50 cursor-pointer transition space-y-4'
                >
                  <div className='flex items-start justify-between'>
                    <div>
                      <h3 className='font-bold text-slate-900 dark:text-white text-base'>
                        {translateCity(loc.city)}, {translateRegion(loc.region)}
                      </h3>
                      <span className='text-xs text-slate-400'>
                        {loc.country}
                      </span>
                    </div>
                    <WeatherIcon
                      condition={loc.condition}
                      className='w-8 h-8'
                    />
                  </div>
                  <div className='flex items-baseline gap-2'>
                    <span className='text-3xl font-bold text-slate-900 dark:text-white'>
                      {formatTemp(loc.tempC)}
                    </span>
                    <span className='text-xs text-slate-500 font-medium'>
                      {translateCondition(loc.condition)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800'>
                    <span>{t('humidity')}: {loc.humidity}%</span>
                    <span>{t('wind')}: {formatWind(loc.windSpeedKmh)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Location bottom card button */}
          <button
            onClick={() => setIsAddLocationOpen(true)}
            className='w-full py-6 px-4 bg-white dark:bg-[#121316]/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 border-2 border-dashed border-blue-200 dark:border-blue-900/60 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition text-center group cursor-pointer'
          >
            <div className='flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:scale-105 transition'>
              <Plus className='w-4 h-4' />
              <span>{t('addNewLocation')}</span>
            </div>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              {t('addNewLocationDesc')}
            </p>
          </button>
        </div>

        {/* Right Column: Location Map Preview, Weather Summary, Tips (4 cols) */}
        <div className='lg:col-span-4 space-y-6'>
          {/* Location Map Preview Card */}
          <div className='bg-white dark:bg-[#121316] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-card space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
                {t('locationMap')}
              </h3>
              <button
                onClick={() => setCurrentPage('weather-map')}
                className='text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
              >
                {t('viewFullMap')}
              </button>
            </div>

            {/* Visual Interactive Map Preview of India */}
            <div
              onClick={() => setCurrentPage('weather-map')}
              className='relative h-64 rounded-2xl overflow-hidden bg-gradient-to-b from-sky-100 to-emerald-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700/60 cursor-pointer group'
            >
              {/* Map Outline & Pins */}
              <div className='absolute inset-0 opacity-80 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]' />

              {/* City Pins on Map Preview */}
              <div className='absolute top-[20%] left-[48%] -translate-x-1/2 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-full shadow-md text-[10px] font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'>
                <MapPin className='w-2.5 h-2.5 text-blue-600' /> {translateCity('New Delhi')}
              </div>
              <div className='absolute top-[32%] left-[32%] -translate-x-1/2 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-full shadow-md text-[10px] font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'>
                <MapPin className='w-2.5 h-2.5 text-blue-600' /> {translateCity('Jaipur')}
              </div>
              <div className='absolute top-[52%] left-[35%] -translate-x-1/2 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-full shadow-md text-[10px] font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'>
                <MapPin className='w-2.5 h-2.5 text-blue-600' /> {translateCity('Mumbai')}
              </div>
              <div className='absolute top-[58%] left-[38%] -translate-x-1/2 flex items-center gap-1 bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-md text-[10px] font-bold animate-pulse'>
                <MapPin className='w-2.5 h-2.5' /> {translateCity('Pune')}
              </div>
              <div className='absolute top-[75%] left-[45%] -translate-x-1/2 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-full shadow-md text-[10px] font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'>
                <MapPin className='w-2.5 h-2.5 text-blue-600' /> {translateCity('Bengaluru')}
              </div>

              {/* Hover overlay */}
              <div className='absolute inset-0 bg-blue-600/10 dark:bg-blue-600/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center'>
                <span className='px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 shadow-md text-xs font-bold text-blue-600 dark:text-blue-400'>
                  {t('openInteractiveMap')}
                </span>
              </div>
            </div>
          </div>

          {/* Weather Summary Card */}
          <div className='bg-white dark:bg-[#121316] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-card space-y-4'>
            <div>
              <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
                {t('weatherSummary')}
              </h3>
              <p className='text-xs text-slate-400'>{t('acrossLocations')}</p>
            </div>

            <div className='space-y-3 pt-1'>
              <div className='flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl'>
                <div>
                  <span className='text-[11px] text-slate-400 block'>
                    {t('warmestLocation')}
                  </span>
                  <span className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                    {translateCity(warmest?.city || 'Jaipur')}
                  </span>
                </div>
                <span className='text-base font-extrabold text-amber-500'>
                  {formatTemp(warmest?.tempC || 35)}
                </span>
              </div>

              <div className='flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl'>
                <div>
                  <span className='text-[11px] text-slate-400 block'>
                    {t('coolestLocation')}
                  </span>
                  <span className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                    {translateCity(coolest?.city || 'Bengaluru')}
                  </span>
                </div>
                <span className='text-base font-extrabold text-blue-500'>
                  {formatTemp(coolest?.tempC || 24)}
                </span>
              </div>

              <div className='flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl'>
                <div>
                  <span className='text-[11px] text-slate-400 block'>
                    {t('rainyLocation')}
                  </span>
                  <span className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                    {translateCity(rainy?.city || 'Mumbai')}
                  </span>
                </div>
                <span className='text-base font-extrabold text-sky-500'>
                  {formatTemp(rainy?.tempC || 28)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setCurrentPage('forecast')}
              className='flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-1 cursor-pointer'
            >
              <span>{t('viewDetailedSummary')}</span>
              <ArrowRight className='w-3.5 h-3.5' />
            </button>
          </div>

          {/* Tips Card */}
          <div className='bg-white dark:bg-[#121316] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-card space-y-4'>
            <div className='flex items-center gap-2'>
              <Lightbulb className='w-4 h-4 text-amber-500' />
              <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
                {t('tips')}
              </h3>
            </div>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              {t('personalizedTipsDesc')}
            </p>

            <div className='p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl flex items-start gap-3'>
              <div className='p-2 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 shrink-0'>
                <Umbrella className='w-4 h-4' />
              </div>
              <p className='text-xs text-slate-700 dark:text-slate-300 leading-relaxed'>
                {t('umbrellaTip')}
              </p>
            </div>

            <button
              onClick={() =>
                addToast(
                  language === 'mr'
                    ? 'सर्व जतन केलेल्या शहरांसाठी वैयक्तिकृत हवामान अलर्ट सुरू केले आहेत'
                    : language === 'hi'
                    ? 'सभी सहेजे गए स्थानों के लिए व्यक्तिगत मौसम अलर्ट सक्रिय किए गए'
                    : 'Personalized weather alerts enabled for all saved locations',
                  'info'
                )
              }
              className='flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
            >
              <span>{t('viewAllTips')}</span>
              <ArrowRight className='w-3.5 h-3.5' />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
