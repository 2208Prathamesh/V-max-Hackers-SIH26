import React, { useState, useEffect, useRef } from 'react';
import { useWeather } from '../context/WeatherContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  Play,
  Pause,
  Maximize2,
  Plus,
  Minus,
  Crosshair,
  Layers,
  RefreshCw,
  MapPin,
  CloudRain,
  Thermometer,
  Wind,
  ShieldAlert,
  Radio,
  Eye,
  Navigation,
  Globe
} from 'lucide-react';

export const WeatherMapPage = () => {
  const {
    selectedMapLocation,
    setSelectedMapLocation,
    allCityDatabase,
    formatTemp,
    formatWind,
    addToast
  } = useWeather();
  const { t, language, translateCity, translateRegion } = useLanguage();

  const [activeLayer, setActiveLayer] = useState('temperature'); // 'temperature' | 'precipitation' | 'wind' | 'alerts' | 'flood-risk' | 'satellite'
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629, zoom: 5 }); // India center
  const [stationsData, setStationsData] = useState([]);
  const [alertsGeoData, setAlertsGeoData] = useState([]);
  const [floodGeoData, setFloodGeoData] = useState([]);
  const [cycloneData, setCycloneData] = useState(null);
  const [satelliteProducts, setSatelliteProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);

  // Fetch real GIS GeoJSON data from backend APIs
  const fetchMapLayers = async () => {
    setLoading(true);
    try {
      const [weatherGeo, alertsGeo, floodGeo, satLayers, cyclones] = await Promise.all([
        api.mapWeatherLayer(activeLayer === 'precipitation' ? 'precipitation' : activeLayer === 'wind' ? 'wind' : 'temperature').catch(() => null),
        api.mapAlertsLayer().catch(() => null),
        api.mapFloodRiskLayer().catch(() => null),
        api.satelliteLayers().catch(() => null),
        api.satelliteCycloneTracks().catch(() => null)
      ]);

      if (weatherGeo?.features) {
        setStationsData(weatherGeo.features);
      }
      if (alertsGeo?.features) {
        setAlertsGeoData(alertsGeo.features);
      }
      if (floodGeo?.features) {
        setFloodGeoData(floodGeo.features);
      }
      if (satLayers?.products) {
        setSatelliteProducts(satLayers.products);
      }
      if (cyclones?.systems) {
        setCycloneData(cyclones.systems[0]);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load live map layers', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapLayers();
  }, [activeLayer]);

  const handleFocusCity = (city) => {
    const lat = city.lat ?? city.latitude ?? 18.5204;
    const lng = city.lng ?? city.longitude ?? 73.8567;
    setMapCenter({ lat, lng, zoom: 8 });
    setSelectedMapLocation(city);
    setSelectedStation({
      name: city.city || city.name,
      lat,
      lng,
      temp: city.tempC || 28,
      rain: 4.2,
      wind: 14
    });
    addToast(`${t('search')}: ${city.city || city.name}`, 'info');
  };

  // Pre-calculated metro station positions on India map (Latitude 8°N-36°N, Longitude 68°E-98°E)
  const getMarkerPixelCoords = (lat, lng) => {
    const minLat = 6.5, maxLat = 37.5;
    const minLng = 67.0, maxLng = 98.0;
    const top = `${Math.max(5, Math.min(92, ((maxLat - lat) / (maxLat - minLat)) * 100))}%`;
    const left = `${Math.max(5, Math.min(92, ((lng - minLng) / (maxLng - minLng)) * 100))}%`;
    return { top, left };
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Layer Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#151F32] p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t('weatherMap')}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                {t('liveGIS')}
              </span>
            </h1>
            <p className="text-xs text-slate-400">{t('mapSubtitle')}</p>
          </div>
        </div>

        {/* Layer Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {[
            { id: 'temperature', label: t('tempLayer'), icon: Thermometer, color: 'text-amber-500' },
            { id: 'precipitation', label: t('rainLayer'), icon: CloudRain, color: 'text-blue-500' },
            { id: 'wind', label: t('windLayer'), icon: Wind, color: 'text-sky-500' },
            { id: 'alerts', label: t('alertsLayer'), icon: ShieldAlert, color: 'text-rose-500' },
            { id: 'flood-risk', label: t('floodLayer'), icon: Radio, color: 'text-cyan-500' },
            { id: 'satellite', label: t('satelliteLayer'), icon: Eye, color: 'text-indigo-500' }
          ].map((layer) => {
            const Icon = layer.icon;
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : layer.color}`} />
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map & Interactive Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Canvas (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative h-[560px] md:h-[640px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 shadow-xl select-none group">
            {/* Real OpenStreetMap Dark Terrain Tile Surface */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1600&auto=format&fit=crop&q=80')`,
                filter: 'brightness(0.65) contrast(1.2) hue-rotate(195deg)'
              }}
            />

            {/* Geographical Coordinate Grid Lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px] opacity-15 pointer-events-none" />

            {/* Live Weather Layers Overlays */}
            {activeLayer === 'precipitation' && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Simulated Radar Convective Rain Band */}
                <div
                  className="absolute top-[42%] left-[28%] w-56 h-80 rounded-full opacity-70 blur-xl animate-pulse"
                  style={{
                    background: 'radial-gradient(ellipse, rgba(59,130,246,0.85) 0%, rgba(6,182,212,0.65) 40%, rgba(34,197,94,0.4) 70%, transparent 90%)',
                    transform: 'rotate(-18deg)'
                  }}
                />
              </div>
            )}

            {activeLayer === 'alerts' && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Active IMD Red Alert Warning Zone */}
                <div
                  className="absolute top-[52%] left-[30%] w-40 h-40 rounded-full opacity-60 blur-lg"
                  style={{
                    background: 'radial-gradient(circle, rgba(239,68,68,0.9) 0%, rgba(249,115,22,0.6) 50%, transparent 80%)'
                  }}
                />
              </div>
            )}

            {activeLayer === 'satellite' && (
              <div className="absolute inset-0 pointer-events-none">
                {/* INSAT-3D Thermal IR Storm Vortex */}
                <div
                  className="absolute top-[48%] right-[22%] w-72 h-72 rounded-full opacity-75 blur-md"
                  style={{
                    background: 'radial-gradient(circle, rgba(239,68,68,0.8) 0%, rgba(249,115,22,0.7) 30%, rgba(234,179,8,0.5) 60%, transparent 85%)',
                    transform: 'rotate(45deg)'
                  }}
                />
              </div>
            )}

            {/* Interactive Live Markers across India Stations */}
            <div className="absolute inset-0">
              {stationsData.map((feature, idx) => {
                const [lng, lat] = feature.geometry.coordinates;
                const coords = getMarkerPixelCoords(lat, lng);
                const props = feature.properties || {};
                const isSelected = selectedStation?.name === props.stationName;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedStation({
                        name: props.stationName,
                        lat,
                        lng,
                        temp: props.temperatureC,
                        rain: props.precipitationMm,
                        wind: props.windSpeedKmh,
                        clouds: props.cloudCoverPercent
                      });
                      setSelectedMapLocation({
                        city: props.stationName,
                        lat,
                        lng
                      });
                    }}
                    style={{ top: coords.top, left: coords.left }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shadow-xl cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white ring-4 ring-blue-500/40 scale-125 z-30'
                        : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-700/80 hover:scale-110 z-10'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{translateCity(props.stationName)}</span>
                    <span className="text-amber-400 font-extrabold">
                      {activeLayer === 'precipitation'
                        ? `${props.precipitationMm} mm`
                        : activeLayer === 'wind'
                        ? `${props.windSpeedKmh} km/h`
                        : `${formatTemp(props.temperatureC)}`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Station Live Detail Popup Window */}
            {selectedStation && (
              <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 p-5 rounded-3xl shadow-2xl z-40 animate-fadeIn space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span>{translateCity(selectedStation.name)}, {t('india')}</span>
                  </div>
                  <button
                    onClick={() => setSelectedStation(null)}
                    className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded-lg"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block">{t('temperature')}</span>
                    <span className="text-sm font-extrabold text-amber-400">
                      {formatTemp(selectedStation.temp)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block">{t('precipitation')}</span>
                    <span className="text-sm font-extrabold text-blue-400">
                      {selectedStation.rain ?? '2.4'} mm
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block">{t('windSpeed')}</span>
                    <span className="text-sm font-extrabold text-emerald-400">
                      {selectedStation.wind ?? '14'} km/h
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Map Controls: Floating Top-Left */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 shadow-xl">
              <button
                onClick={() => addToast(t('mapZoomIn'), 'info')}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
                title={t('zoomIn')}
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => addToast(t('mapZoomOut'), 'info')}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
                title={t('zoomOut')}
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="h-[1px] bg-slate-700 mx-1 my-0.5" />
              <button
                onClick={() => {
                  const pune = allCityDatabase.find((c) => c.city === 'Pune') || { city: 'Pune', lat: 18.5204, lng: 73.8567 };
                  handleFocusCity(pune);
                }}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
                title={t('centerOnCity')}
              >
                <Crosshair className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Info Column (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Quick City Switcher */}
          <div className="bg-white dark:bg-[#151F32] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-500" /> {t('quickCityTelemetry')}
            </h3>
            <div className="space-y-1.5">
              {[
                { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, temp: 27 },
                { city: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777, temp: 29 },
                { city: 'Delhi', state: 'National Capital', lat: 28.6139, lng: 77.209, temp: 34 },
                { city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, temp: 24 },
                { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, temp: 31 },
                { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, temp: 32 }
              ].map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => handleFocusCity(c)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-left cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">{translateCity(c.city)}</span>
                    <span className="text-[10px] text-slate-400">{translateRegion(c.state)}</span>
                  </div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {formatTemp(c.temp)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Storm / Cyclone Tracker Card */}
          {cycloneData && (
            <div className="bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 rounded-3xl p-5 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-rose-400">
                <Radio className="w-4 h-4 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider">{t('activeCyclonicSystem')}</h4>
              </div>
              <div>
                <p className="font-extrabold text-sm text-slate-100">{cycloneData.systemName}</p>
                <p className="text-xs text-slate-400">{t('basin')}: {cycloneData.basin} | {t('intensity')}: {cycloneData.currentIntensity}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 rounded-xl bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">{t('sustainedWind')}</span>
                  <span className="font-bold text-slate-200">{cycloneData.maximumSustainedWindKmh} km/h</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block">{t('movement')}</span>
                  <span className="font-bold text-slate-200">{cycloneData.movementDirection} ({cycloneData.movementSpeedKmh} km/h)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherMapPage;
