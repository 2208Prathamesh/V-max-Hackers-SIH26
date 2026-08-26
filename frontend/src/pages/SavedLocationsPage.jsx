import React, { useState } from 'react'
import { useWeather } from '../context/WeatherContext'
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

  const [viewMode, setViewMode] = useState('list') // 'list' | 'grid'
  const [sortBy, setSortBy] = useState('updated') // 'updated' | 'temp' | 'name'
  const [activeMenuId, setActiveMenuId] = useState(null)

  const normalizedLocations = savedLocations.map(location => ({
    ...location,
    id: location.id || location._id,
    region: location.region || location.state || '',
    tempC: location.tempC ?? null,
    feelsLikeC: location.feelsLikeC ?? null,
    condition: location.condition || 'Weather unavailable',
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
            My Locations ({savedLocations.length})
          </span>
          <span className='text-slate-300 dark:text-slate-700'>•</span>
          <div className='flex items-center gap-1.5 text-xs text-slate-500'>
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className='bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer'
            >
              <option value='updated'>Last Updated</option>
              <option value='temp'>Highest Temperature</option>
              <option value='name'>City Name</option>
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
            <span>Add Location</span>
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
                  className='bg-white dark:bg-[#151F32] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-card hover:shadow-md transition-all duration-200 relative group'
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
                            {loc.city}, {loc.region}
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
                          {loc.condition}
                        </div>
                      </div>
                    </div>

                    {/* Key Metrics: Feels like, Humidity, Wind */}
                    <div className='text-xs space-y-1 text-slate-500 dark:text-slate-400 border-l border-slate-100 dark:border-slate-800/80 pl-4'>
                      <div>
                        Feels like{' '}
                        <span className='font-semibold text-slate-800 dark:text-slate-200'>
                          {formatTemp(loc.feelsLikeC)}
                        </span>
                      </div>
                      <div>
                        Humidity{' '}
                        <span className='font-semibold text-slate-800 dark:text-slate-200'>
                          {loc.humidity}%
                        </span>
                      </div>
                      <div>
                        Wind{' '}
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
                            {fc.day}
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
                            <span>View on Map</span>
                          </button>
                          <button
                            onClick={() => {
                              toggleFavorite(loc.id)
                              setActiveMenuId(null)
                              addToast(
                                loc.isFavorite
                                  ? 'Removed from favorites'
                                  : 'Added to favorites',
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
                                ? 'Unstar Location'
                                : 'Star Location'}
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
                            <span>Delete Location</span>
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
                  className='bg-white dark:bg-[#151F32] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-card hover:border-blue-500/50 cursor-pointer transition space-y-4'
                >
                  <div className='flex items-start justify-between'>
                    <div>
                      <h3 className='font-bold text-slate-900 dark:text-white text-base'>
                        {loc.city}, {loc.region}
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
                      {loc.condition}
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800'>
                    <span>Humidity: {loc.humidity}%</span>
                    <span>Wind: {formatWind(loc.windSpeedKmh)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Location bottom card button */}
          <button
            onClick={() => setIsAddLocationOpen(true)}
            className='w-full py-6 px-4 bg-white dark:bg-[#151F32]/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 border-2 border-dashed border-blue-200 dark:border-blue-900/60 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition text-center group'
          >
            <div className='flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:scale-105 transition'>
              <Plus className='w-4 h-4' />
              <span>Add New Location</span>
            </div>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Search and save any city to get real-time weather updates
            </p>
          </button>
        </div>

        {/* Right Column: Location Map Preview, Weather Summary, Tips (4 cols) */}
        <div className='lg:col-span-4 space-y-6'>
          {/* Location Map Preview Card */}
          <div className='bg-white dark:bg-[#151F32] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-card space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
                Location Map
              </h3>
              <button
                onClick={() => setCurrentPage('weather-map')}
                className='text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline'
              >
                View full map
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
                <MapPin className='w-2.5 h-2.5 text-blue-600' /> New Delhi
              </div>
              <div className='absolute top-[32%] left-[32%] -translate-x-1/2 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-full shadow-md text-[10px] font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'>
                <MapPin className='w-2.5 h-2.5 text-blue-600' /> Jaipur
              </div>
              <div className='absolute top-[52%] left-[35%] -translate-x-1/2 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-full shadow-md text-[10px] font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'>
                <MapPin className='w-2.5 h-2.5 text-blue-600' /> Mumbai
              </div>
              <div className='absolute top-[58%] left-[38%] -translate-x-1/2 flex items-center gap-1 bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-md text-[10px] font-bold animate-pulse'>
                <MapPin className='w-2.5 h-2.5' /> Pune
              </div>
              <div className='absolute top-[75%] left-[45%] -translate-x-1/2 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-full shadow-md text-[10px] font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'>
                <MapPin className='w-2.5 h-2.5 text-blue-600' /> Bengaluru
              </div>

              {/* Hover overlay */}
              <div className='absolute inset-0 bg-blue-600/10 dark:bg-blue-600/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center'>
                <span className='px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 shadow-md text-xs font-bold text-blue-600 dark:text-blue-400'>
                  Open Interactive Map ➔
                </span>
              </div>
            </div>
          </div>

          {/* Weather Summary Card */}
          <div className='bg-white dark:bg-[#151F32] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-card space-y-4'>
            <div>
              <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
                Weather Summary
              </h3>
              <p className='text-xs text-slate-400'>Across your locations</p>
            </div>

            <div className='space-y-3 pt-1'>
              <div className='flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl'>
                <div>
                  <span className='text-[11px] text-slate-400 block'>
                    Warmest Location
                  </span>
                  <span className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                    {warmest?.city || 'Jaipur'}
                  </span>
                </div>
                <span className='text-base font-extrabold text-amber-500'>
                  {formatTemp(warmest?.tempC || 35)}
                </span>
              </div>

              <div className='flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl'>
                <div>
                  <span className='text-[11px] text-slate-400 block'>
                    Coolest Location
                  </span>
                  <span className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                    {coolest?.city || 'Bengaluru'}
                  </span>
                </div>
                <span className='text-base font-extrabold text-blue-500'>
                  {formatTemp(coolest?.tempC || 24)}
                </span>
              </div>

              <div className='flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl'>
                <div>
                  <span className='text-[11px] text-slate-400 block'>
                    Rainy Location
                  </span>
                  <span className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                    {rainy?.city || 'Mumbai'}
                  </span>
                </div>
                <span className='text-base font-extrabold text-sky-500'>
                  {formatTemp(rainy?.tempC || 28)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setCurrentPage('forecast')}
              className='flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-1'
            >
              <span>View detailed summary</span>
              <ArrowRight className='w-3.5 h-3.5' />
            </button>
          </div>

          {/* Tips Card */}
          <div className='bg-white dark:bg-[#151F32] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-card space-y-4'>
            <div className='flex items-center gap-2'>
              <Lightbulb className='w-4 h-4 text-amber-500' />
              <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
                Tips
              </h3>
            </div>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Get personalized tips for your saved locations
            </p>

            <div className='p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl flex items-start gap-3'>
              <div className='p-2 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 shrink-0'>
                <Umbrella className='w-4 h-4' />
              </div>
              <p className='text-xs text-slate-700 dark:text-slate-300 leading-relaxed'>
                Carry an umbrella in Mumbai, light rain expected today.
              </p>
            </div>

            <button
              onClick={() =>
                addToast(
                  'Personalized weather alerts enabled for all saved locations',
                  'info'
                )
              }
              className='flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline'
            >
              <span>View all tips</span>
              <ArrowRight className='w-3.5 h-3.5' />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
