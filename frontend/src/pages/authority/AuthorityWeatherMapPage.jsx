import React, { useState, useRef } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { 
  Maximize2, 
  ChevronDown, 
  MapPin, 
  Layers, 
  CloudRain, 
  Thermometer, 
  Wind, 
  Cloud, 
  Eye,
  AlertTriangle,
  Play,
  Pause,
  Plus,
  Minus
} from 'lucide-react';
import { authorityDistrictMapData } from '../../data/mockAuthorityData';

export const AuthorityWeatherMapPage = () => {
  const { addToast } = useWeather();
  const [selectedRegion, setSelectedRegion] = useState('Maharashtra');
  const [selectedLayer, setSelectedLayer] = useState('Rainfall');
  const [selectedTime, setSelectedTime] = useState('Now');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(authorityDistrictMapData[0]); // Default Pune
  const [zoomLevel, setZoomLevel] = useState(1);
  const mapContainerRef = useRef(null);

  // Checkbox layer state matching Image 4
  const [layers, setLayers] = useState({
    rainfall: true,
    temperature: false,
    wind: false,
    satellite: false,
    cloudCover: false
  });

  const toggleLayer = (key) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
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

  const regions = ['Maharashtra', 'Konkan Coast', 'Western Ghats', 'Vidarbha', 'Marathwada', 'North Maharashtra'];
  const layerOptions = ['Rainfall', 'Temperature', 'Wind Speed', 'Satellite Radar', 'Cloud Cover'];
  const timeOptions = ['Now', '+1 Hour', '+3 Hours', '+6 Hours', '+12 Hours', '+24 Hours'];

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Top Header & Dropdown Controls matching Image 4 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Weather Map
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Real-time weather conditions, alerts and forecasts
          </p>
        </div>

        {/* 3 Dropdowns + Fullscreen Icon */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Region Dropdown */}
          <div className="relative">
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                addToast(`Map centered on ${e.target.value}`, 'info');
              }}
              className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-white dark:bg-[#111C2E] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs focus:outline-none cursor-pointer"
            >
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Layer Dropdown */}
          <div className="relative">
            <select
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-white dark:bg-[#111C2E] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs focus:outline-none cursor-pointer"
            >
              {layerOptions.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Time Dropdown */}
          <div className="relative">
            <select
              value={selectedTime}
              onChange={(e) => {
                setSelectedTime(e.target.value);
                addToast(`Forecast timeline set to ${e.target.value}`, 'info');
              }}
              className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-white dark:bg-[#111C2E] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs focus:outline-none cursor-pointer"
            >
              {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white dark:bg-[#111C2E] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs cursor-pointer"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Map Container Card */}
      <div 
        ref={mapContainerRef}
        className="relative min-h-[580px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xl select-none flex"
      >
        {/* Topographic Satellite Texture Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1600&auto=format&fit=crop')`,
            transform: `scale(${zoomLevel})`,
            transition: 'transform 0.3s ease'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#08101E] via-[#0E1C33]/85 to-[#091426]/75" />

        {/* Dynamic Multi-Color Radar Weather Heatmap Overlays */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 900 600"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.3s ease' }}
        >
          <defs>
            {/* Precipitation Gradient Radials */}
            <radialGradient id="puneRadar" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#F97316" stopOpacity="0.7" />
              <stop offset="70%" stopColor="#EAB308" stopOpacity="0.5" />
              <stop offset="90%" stopColor="#22C55E" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="mumbaiRadar" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#EAB308" stopOpacity="0.6" />
              <stop offset="80%" stopColor="#06B6D4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="kolhapurRadar" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EAB308" stopOpacity="0.75" />
              <stop offset="60%" stopColor="#22C55E" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Precipitation Radar Layers */}
          {layers.rainfall && (
            <>
              {/* Pune High Rainfall Cloud */}
              <circle cx="340" cy="360" r="140" fill="url(#puneRadar)" className="animate-pulse-subtle" />
              {/* Mumbai Radar Cloud */}
              <circle cx="230" cy="290" r="110" fill="url(#mumbaiRadar)" />
              {/* Kolhapur & South Ghats Cloud */}
              <circle cx="350" cy="480" r="95" fill="url(#kolhapurRadar)" />
              {/* Satara Moderate Cloud */}
              <circle cx="360" cy="430" r="70" fill="url(#kolhapurRadar)" />
            </>
          )}

          {/* District Outline Links */}
          <path d="M230 290 L340 360 L360 430 L350 480" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M350 230 L340 360 L520 280 L550 440" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M520 280 L740 180" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4 4" />
        </svg>

        {/* District Pins & Weather Icons on Map matching Image 4 */}
        <div className="absolute inset-0 pointer-events-auto">
          {authorityDistrictMapData.map((d) => {
            const isSelected = selectedDistrict?.id === d.id;
            return (
              <div
                key={d.id}
                style={{ left: `${(d.x / 750) * 85 + 5}%`, top: `${(d.y / 500) * 80 + 8}%` }}
                onClick={() => {
                  setSelectedDistrict(d);
                  addToast(`District telemetry: ${d.name} (${d.condition})`, 'info');
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10 transition-transform duration-200 ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                }`}
              >
                {/* Warning Triangle Pin */}
                <div className="relative">
                  <div 
                    style={{ backgroundColor: d.severityColor }}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white ring-2 ring-black/50"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  {d.status.includes('Severe') && (
                    <span 
                      style={{ borderColor: d.severityColor }}
                      className="absolute -inset-1 rounded-full border-2 animate-ping pointer-events-none" 
                    />
                  )}
                </div>

                {/* District Label */}
                <div className={`mt-1 px-2.5 py-0.5 rounded-lg font-black text-xs shadow-lg transition ${
                  isSelected 
                    ? 'bg-blue-600 text-white ring-2 ring-white/60' 
                    : 'bg-slate-900/90 text-slate-100 border border-white/20'
                }`}>
                  {d.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Zoom Controls (Bottom Left) */}
        <div className="absolute bottom-5 left-5 flex flex-col bg-slate-900/90 rounded-2xl border border-white/20 shadow-xl overflow-hidden text-white z-20">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 1.8))}
            className="p-2.5 hover:bg-white/20 transition cursor-pointer"
            title="Zoom in"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="border-t border-white/10" />
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))}
            className="p-2.5 hover:bg-white/20 transition cursor-pointer"
            title="Zoom out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Selected District Stats Card (Top Left) */}
        {selectedDistrict && (
          <div className="absolute top-5 left-5 w-64 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/15 p-4 text-white shadow-2xl z-20 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-bold text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-400" />
                <span>{selectedDistrict.name} District</span>
              </span>
              <span 
                style={{ backgroundColor: selectedDistrict.severityColor }}
                className="px-2 py-0.5 rounded-md text-[10px] font-black text-white"
              >
                {selectedDistrict.status.split(' ')[0]}
              </span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Current Condition:</span>
                <span className="font-bold text-white">{selectedDistrict.condition}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Rainfall Recorded:</span>
                <span className="font-bold text-blue-400">{selectedDistrict.rainMm} mm</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Active Warnings:</span>
                <span className="font-bold text-orange-400">{selectedDistrict.alertCount} advisories</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Population at Risk:</span>
                <span className="font-bold text-slate-100">{selectedDistrict.population}</span>
              </div>
            </div>
          </div>
        )}

        {/* Layer Selection Panel & Rainfall Legend (Right Panel matching Image 4) */}
        <div className="absolute right-5 top-5 bottom-5 w-52 bg-slate-900/90 backdrop-blur-md rounded-3xl border border-white/15 p-4 text-white flex flex-col justify-between shadow-2xl z-20">
          
          {/* Checkboxes List */}
          <div className="space-y-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block pb-1 border-b border-white/10">
              Map Layers
            </span>

            <div className="space-y-2.5 text-xs font-semibold text-slate-200">
              <label className="flex items-center gap-2.5 cursor-pointer hover:text-white transition">
                <input
                  type="checkbox"
                  checked={layers.rainfall}
                  onChange={() => toggleLayer('rainfall')}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                />
                <span>Rainfall</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer hover:text-white transition">
                <input
                  type="checkbox"
                  checked={layers.temperature}
                  onChange={() => toggleLayer('temperature')}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                />
                <span>Temperature</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer hover:text-white transition">
                <input
                  type="checkbox"
                  checked={layers.wind}
                  onChange={() => toggleLayer('wind')}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                />
                <span>Wind</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer hover:text-white transition">
                <input
                  type="checkbox"
                  checked={layers.satellite}
                  onChange={() => toggleLayer('satellite')}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                />
                <span>Satellite</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer hover:text-white transition">
                <input
                  type="checkbox"
                  checked={layers.cloudCover}
                  onChange={() => toggleLayer('cloudCover')}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                />
                <span>Cloud Cover</span>
              </label>
            </div>
          </div>

          {/* Rainfall Intensity mm Scale Bar matching Image 4 */}
          <div className="pt-3 border-t border-white/10">
            <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">
              mm (Precipitation)
            </span>
            <div className="flex items-center gap-3">
              {/* Vertical Color Gradient Bar */}
              <div className="w-3.5 h-36 rounded-full bg-gradient-to-b from-[#EF4444] via-[#F97316] via-[#EAB308] via-[#84CC16] via-[#22C55E] via-[#06B6D4] to-[#3B82F6] shadow-sm border border-white/20" />
              
              {/* Legend Numerical Labels */}
              <div className="flex flex-col justify-between h-36 text-[10px] font-bold text-slate-300">
                <span>200</span>
                <span>100</span>
                <span>50</span>
                <span>20</span>
                <span>10</span>
                <span>5</span>
                <span>1</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
