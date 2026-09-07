import React, { useState, useEffect, useRef } from 'react';
import { useWeather } from '../context/WeatherContext';
import { 
  Play, 
  Pause, 
  Maximize2, 
  Plus, 
  Minus, 
  Crosshair, 
  Layers, 
  Star, 
  RefreshCw, 
  Info, 
  MapPin, 
  CloudRain, 
  Thermometer, 
  Wind, 
  Cloud, 
  Gauge, 
  Zap, 
  Activity, 
  Disc,
  ChevronDown
} from 'lucide-react';
import { Switch } from '../components/common/Switch';
import { WeatherIcon } from '../components/common/WeatherIcon';

export const WeatherMapPage = () => {
  const { 
    selectedMapLocation, 
    setSelectedMapLocation, 
    savedLocations, 
    allCityDatabase, 
    toggleFavorite, 
    formatTemp, 
    formatWind, 
    formatPressure,
    addToast 
  } = useWeather();

  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'rainfall' | 'temp' | 'wind' | 'clouds' | 'pressure' | 'air'
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineIndex, setTimelineIndex] = useState(2); // 'Now'
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapContainerRef = useRef(null);

  // Map layer toggles
  const [layersState, setLayersState] = useState({
    rainfall: true,
    temperature: false,
    wind: false,
    clouds: false,
    pressure: false,
    airQuality: false,
    lightning: false,
    cycloneTracks: false,
  });

  const timelineSteps = [
    { label: "8:00 AM", sub: "-4h" },
    { label: "10:00 AM", sub: "-2h" },
    { label: "Now", sub: "Live", isCurrent: true },
    { label: "1:00 PM", sub: "+2h" },
    { label: "4:00 PM", sub: "+5h" },
    { label: "7:00 PM", sub: "+8h" },
    { label: "10:00 PM", sub: "+11h" },
  ];

  // Auto timeline playback animation
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setTimelineIndex(prev => (prev + 1) % timelineSteps.length);
      }, 1400);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timelineSteps.length]);

  const toggleLayer = (key) => {
    setLayersState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCitySelect = (city) => {
    setSelectedMapLocation(city);
    addToast(`Focusing weather radar on ${city.city}`, 'info');
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (mapContainerRef.current?.requestFullscreen) {
        mapContainerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Map Category Layer Tabs matching screenshot */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200/80 dark:border-slate-800/80">
        {[
          { id: 'live', label: 'Live Map' },
          { id: 'rainfall', label: 'Rainfall' },
          { id: 'temp', label: 'Temperature' },
          { id: 'wind', label: 'Wind' },
          { id: 'clouds', label: 'Clouds' },
          { id: 'pressure', label: 'Pressure' },
          { id: 'air', label: 'Air Quality' },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-semibold whitespace-nowrap transition relative ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-[-5px] left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Map & Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Doppler Radar Map (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div
            ref={mapContainerRef}
            className="relative h-[540px] md:h-[620px] rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-card select-none group"
          >
            {/* Satellite Background Layer with geographical terrain */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1600&auto=format&fit=crop&q=80')`,
                filter: 'brightness(0.7) contrast(1.15)',
                transform: `scale(${zoomLevel})`
              }}
            />

            {/* Atmospheric Cloud & Satellite Topo Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-slate-950/60 pointer-events-none" />

            {/* Doppler Rain / Storm Radar Overlay (Animated SVG & Canvas Simulation) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Cyclone Spiral over Bay of Bengal */}
              <div 
                className="absolute top-[52%] right-[24%] w-64 h-64 rounded-full opacity-75 blur-md"
                style={{
                  background: 'radial-gradient(circle, rgba(239,68,68,0.8) 0%, rgba(249,115,22,0.7) 30%, rgba(234,179,8,0.6) 50%, rgba(34,197,94,0.4) 70%, transparent 85%)',
                  transform: `rotate(${timelineIndex * 40}deg) scale(${1 + timelineIndex * 0.05})`,
                  transition: 'transform 0.8s ease'
                }}
              />

              {/* Rain Band along Konkan & Western Ghats */}
              <div 
                className="absolute top-[48%] left-[30%] w-36 h-72 rounded-full opacity-70 blur-md"
                style={{
                  background: 'radial-gradient(ellipse, rgba(59,130,246,0.8) 0%, rgba(6,182,212,0.6) 40%, rgba(34,197,94,0.4) 70%, transparent 90%)',
                  transform: `translateY(${timelineIndex * 4}px) rotate(-15deg)`,
                  transition: 'transform 0.8s ease'
                }}
              />

              {/* Northeast Storm Cluster */}
              <div 
                className="absolute top-[28%] right-[28%] w-52 h-44 rounded-full opacity-65 blur-lg"
                style={{
                  background: 'radial-gradient(circle, rgba(234,179,8,0.7) 0%, rgba(34,197,94,0.6) 40%, rgba(59,130,246,0.3) 70%, transparent 85%)',
                  transform: `scale(${0.9 + timelineIndex * 0.08})`,
                  transition: 'transform 0.8s ease'
                }}
              />

              {/* Live animated sweeping radar beam */}
              {isPlaying && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-blue-500/20 rounded-full animate-radar pointer-events-none">
                  <div className="w-1/2 h-1/2 bg-gradient-to-br from-blue-500/20 to-transparent" />
                </div>
              )}
            </div>

            {/* Interactive City Weather Markers across India matching screenshot */}
            <div className="absolute inset-0">
              {[
                { city: "Srinagar", temp: 22, top: "14%", left: "42%", data: allCityDatabase.find(c => c.city === 'Srinagar') },
                { city: "New Delhi", temp: 32, top: "28%", left: "44%", data: allCityDatabase.find(c => c.city === 'New Delhi') },
                { city: "Jaipur", temp: 31, top: "34%", left: "37%", data: allCityDatabase.find(c => c.city === 'Jaipur') },
                { city: "Lucknow", temp: 33, top: "33%", left: "54%", data: allCityDatabase.find(c => c.city === 'Lucknow') },
                { city: "Kolkata", temp: 30, top: "42%", left: "68%", data: allCityDatabase.find(c => c.city === 'Kolkata') },
                { city: "Mumbai", temp: 28, top: "54%", left: "34%", data: allCityDatabase.find(c => c.city === 'Mumbai') },
                { city: "Pune", temp: 27, top: "59%", left: "37%", data: allCityDatabase.find(c => c.city === 'Pune') },
                { city: "Hyderabad", temp: 29, top: "58%", left: "50%", data: allCityDatabase.find(c => c.city === 'Hyderabad') },
                { city: "Bengaluru", temp: 25, top: "74%", left: "45%", data: allCityDatabase.find(c => c.city === 'Bengaluru') },
                { city: "Chennai", temp: 30, top: "72%", left: "54%", data: allCityDatabase.find(c => c.city === 'Chennai') },
              ].map((pin, i) => {
                const isSelected = selectedMapLocation?.city === pin.city;
                return (
                  <button
                    key={i}
                    onClick={() => pin.data && handleCitySelect(pin.data)}
                    style={{ top: pin.top, left: pin.left }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200 shadow-lg cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white ring-4 ring-blue-500/40 scale-110 z-20'
                        : 'bg-slate-900/85 hover:bg-slate-800 text-white border border-slate-600/60 hover:scale-105 z-10'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{pin.city}</span>
                    <span className="text-amber-300 font-extrabold">{formatTemp(pin.temp)}</span>
                  </button>
                );
              })}
            </div>

            {/* Map Controls: Floating Top-Left (+ / - Zoom, Target, Layer Switcher) */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-xl">
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 1.8))}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="Zoom In"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="Zoom Out"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="h-[1px] bg-slate-700 mx-1 my-0.5" />
              <button
                onClick={() => {
                  const pune = allCityDatabase.find(c => c.city === 'Pune');
                  if (pune) handleCitySelect(pune);
                }}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="My Location"
              >
                <Crosshair className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleLayer('rainfall')}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="Toggle Radar"
              >
                <Layers className="w-4 h-4" />
              </button>
            </div>

            {/* Floating Top-Right: Country Selector & Fullscreen */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedCountry}
                  onChange={e => setSelectedCountry(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl text-xs font-semibold text-white cursor-pointer focus:outline-none shadow-xl"
                >
                  <option value="India">India</option>
                  <option value="Global">Global Radar</option>
                  <option value="USA">United States</option>
                  <option value="Europe">Europe</option>
                </select>
              </div>

              <button
                onClick={toggleFullscreen}
                className="p-2 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl text-slate-300 hover:text-white shadow-xl transition"
                title="Toggle Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom-Left: My Location pill button */}
            <div className="absolute bottom-4 left-4 z-20">
              <button
                onClick={() => {
                  const pune = allCityDatabase.find(c => c.city === 'Pune');
                  if (pune) handleCitySelect(pune);
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl text-xs font-bold text-white shadow-xl hover:bg-slate-800 transition"
              >
                <Crosshair className="w-4 h-4 text-blue-400" />
                <span>My Location</span>
              </button>
            </div>

            {/* Right Overlay: Rainfall (mm) Gradient Legend matching screenshot */}
            <div className="absolute right-4 bottom-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl text-[10px] text-slate-200 flex flex-col items-center gap-1">
              <span className="font-bold text-slate-300 text-[10px] mb-1">Rainfall (mm)</span>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-36 rounded-md bg-gradient-to-t from-transparent via-cyan-500 to-purple-600 border border-slate-700" />
                <div className="flex flex-col justify-between h-36 font-semibold text-[9px] text-slate-300">
                  <span>200+</span>
                  <span>100</span>
                  <span>50</span>
                  <span>20</span>
                  <span>10</span>
                  <span>5</span>
                  <span>2</span>
                  <span>1</span>
                  <span>0.5</span>
                  <span>0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Map Timeline Scrubber Card */}
          <div className="bg-white dark:bg-[#151F32] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Map Timeline (Rainfall)
                </h4>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Auto Update</span>
                <Switch checked={autoUpdate} onChange={setAutoUpdate} />
                <Info className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Timeline Controls & Scrubber */}
            <div className="flex items-center gap-4 pt-1">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20 transition shrink-0"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              {/* Scrubber Line */}
              <div className="flex-1 relative flex items-center justify-between">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 rounded-full" />
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 rounded-full transition-all duration-300"
                  style={{ width: `${(timelineIndex / (timelineSteps.length - 1)) * 100}%` }}
                />

                {timelineSteps.map((step, idx) => {
                  const isSelected = timelineIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setTimelineIndex(idx);
                        setIsPlaying(false);
                      }}
                      className="relative z-10 flex flex-col items-center group cursor-pointer"
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                          isSelected
                            ? 'bg-blue-600 border-white dark:border-slate-900 scale-125 shadow-md ring-2 ring-blue-500/50'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:scale-110'
                        }`}
                      />
                      <span
                        className={`text-[11px] mt-2 font-medium transition ${
                          step.isCurrent
                            ? 'px-2 py-0.5 bg-blue-600 text-white rounded-md font-bold text-[10px]'
                            : isSelected
                            ? 'text-blue-600 dark:text-blue-400 font-bold'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Source info matching screenshot */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400 dark:text-slate-500 gap-2">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Source: India Meteorological Department (IMD)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>Last updated: 10:20 AM</span>
                <RefreshCw 
                  onClick={() => addToast("Doppler radar refreshed", "info")}
                  className="w-3.5 h-3.5 cursor-pointer hover:rotate-180 transition-transform duration-500" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Location, Map Layers, Quick Locations (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Selected Location Card matching screenshot 5 */}
          <div className="bg-white dark:bg-[#151F32] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Selected Location</span>
              </div>
              <button
                onClick={() => {
                  toggleFavorite(selectedMapLocation?.id);
                  addToast(selectedMapLocation?.isFavorite ? 'Removed from favorites' : 'Marked as favorite', 'info');
                }}
                className="text-slate-400 hover:text-amber-500 transition"
              >
                <Star className={`w-4 h-4 ${selectedMapLocation?.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            </div>

            {/* Location Title & Big Temp */}
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedMapLocation?.city}, {selectedMapLocation?.region}
              </h3>
            </div>

            <div className="flex items-center justify-between py-2 border-y border-slate-100 dark:border-slate-800/80">
              <div>
                <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {formatTemp(selectedMapLocation?.tempC)}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  {selectedMapLocation?.condition}
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
                <WeatherIcon condition={selectedMapLocation?.condition} className="w-9 h-9" />
              </div>
            </div>

            {/* Weather Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Feels like</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formatTemp(selectedMapLocation?.feelsLikeC)}</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Humidity</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedMapLocation?.humidity}%</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Wind</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatWind(selectedMapLocation?.windSpeedKmh)} {selectedMapLocation?.windDirection}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Pressure</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatPressure(selectedMapLocation?.pressureHpa)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>{selectedMapLocation?.updatedTime || "Updated 10:20 AM"}</span>
              <RefreshCw className="w-3.5 h-3.5 cursor-pointer hover:rotate-180 transition-transform duration-300" />
            </div>
          </div>

          {/* Map Layers Toggle List matching screenshot 5 */}
          <div className="bg-white dark:bg-[#151F32] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-card space-y-3.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Map Layers</h3>

            <div className="space-y-3">
              {[
                { key: 'rainfall', label: 'Rainfall', icon: CloudRain },
                { key: 'temperature', label: 'Temperature', icon: Thermometer },
                { key: 'wind', label: 'Wind', icon: Wind },
                { key: 'clouds', label: 'Clouds', icon: Cloud },
                { key: 'pressure', label: 'Pressure', icon: Gauge },
                { key: 'airQuality', label: 'Air Quality', icon: Activity },
                { key: 'lightning', label: 'Lightning', icon: Zap },
                { key: 'cycloneTracks', label: 'Cyclone Tracks', icon: Disc },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{item.label}</span>
                    </div>
                    <Switch
                      checked={layersState[item.key]}
                      onChange={() => toggleLayer(item.key)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Locations Card */}
          <div className="bg-white dark:bg-[#151F32] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quick Locations</h3>
              <button 
                onClick={() => addToast("Showing all quick locations", "info")}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-2">
              {[
                { city: "Pune, Maharashtra", fav: true, key: "Pune" },
                { city: "Mumbai, Maharashtra", fav: false, key: "Mumbai" },
                { city: "New Delhi, Delhi", fav: false, key: "New Delhi" },
                { city: "Chennai, Tamil Nadu", fav: false, key: "Chennai" },
              ].map((loc, idx) => {
                const isCurrent = selectedMapLocation?.city === loc.key;
                const locData = allCityDatabase.find(c => c.city === loc.key);
                return (
                  <div
                    key={idx}
                    onClick={() => locData && handleCitySelect(locData)}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
                      isCurrent
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{loc.city}</span>
                    </div>
                    <Star className={`w-3.5 h-3.5 ${loc.fav ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
