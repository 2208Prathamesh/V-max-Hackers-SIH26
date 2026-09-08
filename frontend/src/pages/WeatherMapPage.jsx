import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useWeather } from '../context/WeatherContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import {
  Plus,
  Minus,
  Crosshair,
  Layers,
  MapPin,
  CloudRain,
  Thermometer,
  Wind,
  ShieldAlert,
  Radio,
  Eye,
  Navigation,
  Globe,
  Loader2,
  Maximize2
} from 'lucide-react';

// Controller to smoothly fly the map viewport on location/center state change
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && typeof center.lat === 'number' && typeof center.lng === 'number') {
      map.flyTo([center.lat, center.lng], zoom || map.getZoom(), {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [center, zoom, map]);
  return null;
}

// In-map Zoom and Locate buttons
function MapActionsToolbar({ onZoomIn, onZoomOut, onLocate, isLocating }) {
  return (
    <div className="absolute top-4 left-4 z-[400] flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-2xl">
      <button
        type="button"
        onClick={onZoomIn}
        className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
        title="Zoom In"
      >
        <Plus className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
        title="Zoom Out"
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="h-[1px] bg-slate-700/80 mx-1 my-0.5" />
      <button
        type="button"
        onClick={onLocate}
        disabled={isLocating}
        className="p-2 text-sky-400 hover:text-sky-300 hover:bg-slate-800 rounded-xl transition cursor-pointer disabled:opacity-50"
        title="Fly to My Location"
      >
        <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin text-amber-400' : ''}`} />
      </button>
    </div>
  );
}

// Factory for customized station divIcons
const createStationIcon = (stationName, val, unit, isSelected, activeLayer) => {
  let badgeColor = 'text-amber-400';
  if (activeLayer === 'precipitation') {
    badgeColor = 'text-blue-400';
  } else if (activeLayer === 'wind') {
    badgeColor = 'text-sky-300';
  } else {
    const num = Number(val);
    if (!isNaN(num)) {
      if (num >= 35) badgeColor = 'text-rose-400';
      else if (num >= 28) badgeColor = 'text-amber-400';
      else if (num >= 20) badgeColor = 'text-emerald-400';
      else badgeColor = 'text-sky-400';
    }
  }

  const selectedClass = isSelected
    ? 'ring-4 ring-blue-500/60 scale-110 shadow-blue-500/40 bg-blue-600 border-white'
    : 'bg-slate-900/90 text-white border-slate-700 hover:scale-105';

  return L.divIcon({
    className: 'leaflet-custom-div-icon',
    html: `
      <div style="display:inline-flex; align-items:center; gap:5px; padding:3px 8px; border-radius:9999px; font-size:11px; font-weight:700; border-width:1px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.4); white-space:nowrap; transition:all 0.15s ease;" class="${selectedClass}">
        <span style="width:6px; height:6px; border-radius:9999px; background:#10B981;"></span>
        <span style="color:#F1F5F9;">${stationName}</span>
        <span class="${badgeColor}" style="font-weight:800;">${val != null ? val : '--'}${unit}</span>
      </div>
    `,
    iconSize: [110, 26],
    iconAnchor: [55, 13],
    popupAnchor: [0, -14]
  });
};

// Factory for User's live GPS marker
const createUserIcon = () => {
  return L.divIcon({
    className: 'leaflet-custom-user-icon',
    html: `
      <div style="position:relative; display:flex; align-items:center; justify-content:center; width:28px; height:28px;">
        <span style="position:absolute; width:28px; height:28px; border-radius:9999px; background:rgba(59,130,246,0.35); animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>
        <span style="width:14px; height:14px; border-radius:9999px; background:#2563EB; border:2.5px solid #ffffff; box-shadow:0 0 10px rgba(37,99,235,0.8);"></span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

// Factory for IMD Alert marker
const createAlertIcon = (warningLevel) => {
  const bg = warningLevel === 'Red' ? '#EF4444' : warningLevel === 'Orange' ? '#F97316' : '#EAB308';
  return L.divIcon({
    className: 'leaflet-custom-alert-icon',
    html: `
      <div style="display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:9999px; font-size:10px; font-weight:800; background:${bg}; color:#ffffff; border:1px solid rgba(255,255,255,0.6); box-shadow:0 4px 10px rgba(0,0,0,0.3);">
        <span>⚠️</span>
        <span>${warningLevel}</span>
      </div>
    `,
    iconSize: [75, 22],
    iconAnchor: [37, 11]
  });
};

// Factory for Flood Zone marker
const createFloodIcon = (depth) => {
  return L.divIcon({
    className: 'leaflet-custom-flood-icon',
    html: `
      <div style="display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:9999px; font-size:10px; font-weight:800; background:#0284C7; color:#ffffff; border:1px solid #7DD3FC; box-shadow:0 4px 10px rgba(0,0,0,0.3);">
        <span>🌊</span>
        <span>${depth != null ? `${depth}m` : 'Flood'}</span>
      </div>
    `,
    iconSize: [75, 22],
    iconAnchor: [37, 11]
  });
};

export const WeatherMapPage = () => {
  const {
    selectedMapLocation,
    setSelectedMapLocation,
    savedLocations,
    formatTemp,
    formatWind,
    addToast,
    detectCurrentLocation,
    isDetectingLocation
  } = useWeather();
  const { t, language, translateCity, translateRegion } = useLanguage();
  const { isDark } = useTheme();

  const [activeLayer, setActiveLayer] = useState('temperature'); // 'temperature' | 'precipitation' | 'wind' | 'alerts' | 'flood-risk' | 'satellite'
  const [mapStyle, setMapStyle] = useState('dark'); // 'dark' | 'voyager' | 'osm'
  const [mapCenter, setMapCenter] = useState({
    lat: selectedMapLocation?.lat || 20.5937,
    lng: selectedMapLocation?.lng || 78.9629,
    zoom: selectedMapLocation?.lat ? 8 : 5
  });
  const [stationsData, setStationsData] = useState([]);
  const [alertsGeoData, setAlertsGeoData] = useState([]);
  const [floodGeoData, setFloodGeoData] = useState([]);
  const [cycloneData, setCycloneData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const mapRef = useRef(null);

  // Fetch real GIS GeoJSON data from backend APIs
  const fetchMapLayers = async () => {
    setLoading(true);
    try {
      const [weatherGeo, alertsGeo, floodGeo, cyclones] = await Promise.all([
        api.mapWeatherLayer(activeLayer === 'precipitation' ? 'precipitation' : activeLayer === 'wind' ? 'wind' : 'temperature').catch(() => null),
        api.mapAlertsLayer().catch(() => null),
        api.mapFloodRiskLayer().catch(() => null),
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
      const rawCyclones = cyclones?.data || cyclones;
      if (rawCyclones?.systems && rawCyclones.systems.length > 0) {
        setCycloneData(rawCyclones.systems[0]);
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

  // Center on user's live location
  const handleLocateMe = async () => {
    try {
      const loc = await detectCurrentLocation(true);
      if (loc && loc.lat && loc.lng) {
        setMapCenter({ lat: loc.lat, lng: loc.lng, zoom: 10 });
      } else if (selectedMapLocation?.lat && selectedMapLocation?.lng) {
        setMapCenter({ lat: selectedMapLocation.lat, lng: selectedMapLocation.lng, zoom: 10 });
      }
    } catch (err) {
      addToast('Could not resolve location', 'warning');
    }
  };

  const handleFocusCity = (city) => {
    const lat = Number(city.lat ?? city.latitude ?? 20.5937);
    const lng = Number(city.lng ?? city.longitude ?? 78.9629);
    setMapCenter({ lat, lng, zoom: 9 });
    setSelectedMapLocation({
      city: city.city || city.name || city.stationName,
      region: city.region || city.state || '',
      country: 'India',
      lat,
      lng
    });
    setSelectedStation({
      name: city.city || city.name || city.stationName,
      lat,
      lng,
      temp: city.tempC ?? city.temperatureC ?? city.temp ?? '--',
      rain: city.precipitationMm ?? city.rain ?? 0,
      wind: city.windSpeedKmh ?? city.wind ?? 12,
      clouds: city.cloudCoverPercent ?? city.clouds ?? 20
    });
    addToast(`${t('search')}: ${city.city || city.name || city.stationName}`, 'info');
  };

  // Watermark-Free Base Map Tile URL selection
  const getTileUrl = () => {
    if (mapStyle === 'satellite') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
    if (mapStyle === 'streets') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
    }
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Layer & Style Switcher Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#151F32] p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t('weatherMap')}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                {t('liveGIS')}
              </span>
              {loading && <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
            </h1>
            <p className="text-xs text-slate-400">{t('mapSubtitle')}</p>
          </div>
        </div>

        {/* Right Controls: Layer Buttons & Basemap Style Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Layer Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap border cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : layer.color}`} />
                  <span>{layer.label}</span>
                </button>
              );
            })}
          </div>

          {/* Basemap Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
            <button
              onClick={() => setMapStyle('dark')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                mapStyle === 'dark' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setMapStyle('streets')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                mapStyle === 'streets' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Streets
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                mapStyle === 'satellite' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapStyle('osm')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                mapStyle === 'osm' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              OSM
            </button>
          </div>
        </div>
      </div>

      {/* Main Map & Interactive Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Real Interactive Leaflet Slippy Map Canvas (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative h-[560px] md:h-[640px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 shadow-xl z-0">
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={mapCenter.zoom}
              scrollWheelZoom={true}
              zoomControl={false}
              className={`w-full h-full z-0 ${mapStyle === 'dark' ? 'leaflet-map-dark' : ''}`}
              ref={mapRef}
            >
              <MapController center={mapCenter} zoom={mapCenter.zoom} />

              {/* Base Slippy Tile Layer */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                url={getTileUrl()}
              />

              {/* Radar Precipitation Layer Overlay */}
              {activeLayer === 'precipitation' && (
                <TileLayer
                  url="https://tilecache.rainviewer.com/v2/radar/nowcast/256/{z}/{x}/{y}/2/1_1.png"
                  opacity={0.65}
                  zIndex={300}
                />
              )}

              {/* User Live GPS Marker */}
              {selectedMapLocation?.lat && selectedMapLocation?.lng && (
                <Marker
                  position={[selectedMapLocation.lat, selectedMapLocation.lng]}
                  icon={createUserIcon()}
                >
                  <Popup className="custom-leaflet-popup">
                    <div className="p-1 font-bold text-xs text-slate-900">
                      <span>📍 {selectedMapLocation.city || 'My Location'}</span>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Weather Observation Stations (Temperature, Precipitation, Wind) */}
              {(activeLayer === 'temperature' || activeLayer === 'precipitation' || activeLayer === 'wind') &&
                stationsData.map((feature, idx) => {
                  const [lng, lat] = feature.geometry.coordinates;
                  const props = feature.properties || {};
                  const isSelected = selectedStation?.name === props.stationName;

                  let val = props.temperatureC;
                  let unit = '°C';
                  if (activeLayer === 'precipitation') {
                    val = props.precipitationMm ?? 0;
                    unit = 'mm';
                  } else if (activeLayer === 'wind') {
                    val = props.windSpeedKmh;
                    unit = 'km/h';
                  }

                  const icon = createStationIcon(
                    props.stationName,
                    val,
                    unit,
                    isSelected,
                    activeLayer
                  );

                  return (
                    <Marker
                      key={idx}
                      position={[lat, lng]}
                      icon={icon}
                      eventHandlers={{
                        click: () => {
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
                            region: '',
                            country: 'India',
                            lat,
                            lng
                          });
                        }
                      }}
                    >
                      <Popup className="custom-leaflet-popup">
                        <div className="p-2 space-y-1.5 min-w-[160px] text-slate-900 font-sans">
                          <h4 className="font-bold text-xs flex items-center gap-1 text-blue-600">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{props.stationName}</span>
                          </h4>
                          <div className="grid grid-cols-2 gap-1 text-[11px] pt-1">
                            <div className="bg-slate-100 p-1.5 rounded-lg">
                              <span className="text-slate-500 block text-[9px]">Temp</span>
                              <span className="font-extrabold text-amber-600">{formatTemp(props.temperatureC)}</span>
                            </div>
                            <div className="bg-slate-100 p-1.5 rounded-lg">
                              <span className="text-slate-500 block text-[9px]">Rain</span>
                              <span className="font-extrabold text-blue-600">{props.precipitationMm ?? 0} mm</span>
                            </div>
                            <div className="bg-slate-100 p-1.5 rounded-lg">
                              <span className="text-slate-500 block text-[9px]">Wind</span>
                              <span className="font-extrabold text-emerald-600">{props.windSpeedKmh ?? '--'} km/h</span>
                            </div>
                            <div className="bg-slate-100 p-1.5 rounded-lg">
                              <span className="text-slate-500 block text-[9px]">Clouds</span>
                              <span className="font-extrabold text-slate-700">{props.cloudCoverPercent ?? '--'}%</span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

              {/* Active IMD Weather Alerts Layer */}
              {activeLayer === 'alerts' &&
                alertsGeoData.map((feature, idx) => {
                  const [lng, lat] = feature.geometry.coordinates;
                  const props = feature.properties || {};
                  return (
                    <Marker
                      key={`alert-${idx}`}
                      position={[lat, lng]}
                      icon={createAlertIcon(props.warningLevel)}
                    >
                      <Popup>
                        <div className="p-2 max-w-xs space-y-1 text-slate-900">
                          <div className="flex items-center gap-1 text-rose-600 font-bold text-xs">
                            <ShieldAlert className="w-4 h-4" />
                            <span>{props.district} ({props.warningLevel} Alert)</span>
                          </div>
                          <p className="text-[11px] font-semibold text-slate-700">{props.action}: {props.hazard}</p>
                          <p className="text-[10px] text-slate-500 whitespace-pre-line">{props.advice}</p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

              {/* Flood Risk Zones Layer */}
              {activeLayer === 'flood-risk' &&
                floodGeoData.map((feature, idx) => {
                  const [lng, lat] = feature.geometry.coordinates;
                  const props = feature.properties || {};
                  return (
                    <React.Fragment key={`flood-${idx}`}>
                      <CircleMarker
                        center={[lat, lng]}
                        radius={28}
                        pathOptions={{
                          color: '#0284C7',
                          fillColor: '#38BDF8',
                          fillOpacity: 0.35,
                          weight: 2
                        }}
                      />
                      <Marker
                        position={[lat, lng]}
                        icon={createFloodIcon(props.estimatedFloodDepthM)}
                      >
                        <Popup>
                          <div className="p-2 space-y-1 text-slate-900">
                            <h4 className="font-bold text-xs text-blue-700">{props.zoneName}</h4>
                            <p className="text-[11px] text-slate-700">Risk: <b>{props.riskLevel}</b> | Depth: <b>{props.estimatedFloodDepthM}m</b></p>
                            <p className="text-[10px] text-slate-500">{props.advisory}</p>
                          </div>
                        </Popup>
                      </Marker>
                    </React.Fragment>
                  );
                })}

              {/* Cyclone Synoptic Storm Track */}
              {(activeLayer === 'satellite' || activeLayer === 'wind') &&
                cycloneData?.trackPoints &&
                cycloneData.trackPoints.length > 0 && (
                  <>
                    <Polyline
                      positions={cycloneData.trackPoints.map((tp) => [tp.latitude, tp.longitude])}
                      pathOptions={{ color: '#EF4444', weight: 4, dashArray: '6, 8' }}
                    />
                    {cycloneData.trackPoints.map((tp, idx) => (
                      <CircleMarker
                        key={`track-${idx}`}
                        center={[tp.latitude, tp.longitude]}
                        radius={idx === cycloneData.trackPoints.length - 1 ? 9 : 5}
                        pathOptions={{
                          color: '#B91C1C',
                          fillColor: idx === cycloneData.trackPoints.length - 1 ? '#EF4444' : '#F87171',
                          fillOpacity: 0.9,
                          weight: 2
                        }}
                      >
                        <Popup>
                          <div className="p-1 text-xs text-slate-900">
                            <p className="font-bold">{cycloneData.systemName}</p>
                            <p className="text-[11px]">Wind: {tp.windSpeedKmh} km/h | Pressure: {tp.pressureHpa} hPa</p>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </>
                )}
            </MapContainer>

            {/* In-Map Floating Action Toolbar */}
            <MapActionsToolbar
              onZoomIn={() => mapRef.current?.zoomIn()}
              onZoomOut={() => mapRef.current?.zoomOut()}
              onLocate={handleLocateMe}
              isLocating={isDetectingLocation}
            />

            {/* Selected Station Live Detail Popup Pill in Bottom-Left */}
            {selectedStation && (
              <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 p-4 rounded-3xl shadow-2xl z-[400] animate-fadeIn space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span>{translateCity(selectedStation.name)}, {t('india')}</span>
                  </div>
                  <button
                    onClick={() => setSelectedStation(null)}
                    className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block">{t('temperature')}</span>
                    <span className="text-sm font-extrabold text-amber-400">
                      {formatTemp(selectedStation.temp)}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block">{t('precipitation')}</span>
                    <span className="text-sm font-extrabold text-blue-400">
                      {selectedStation.rain ?? '0'} mm
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 block">{t('windSpeed')}</span>
                    <span className="text-sm font-extrabold text-emerald-400">
                      {selectedStation.wind ?? '12'} km/h
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Info Column (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Quick City Switcher */}
          <div className="bg-white dark:bg-[#151F32] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-500" /> {t('quickCityTelemetry')}
              </h3>
              <button
                onClick={handleLocateMe}
                disabled={isDetectingLocation}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Crosshair className={`w-3 h-3 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                <span>{isDetectingLocation ? 'Locating...' : 'My Location'}</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-[320px] overflow-y-auto scrollbar-thin">
              {(stationsData.length > 0
                ? stationsData.map((f) => ({
                    city: f.properties.stationName || f.properties.name,
                    state: f.properties.state || '',
                    lat: f.geometry.coordinates[1],
                    lng: f.geometry.coordinates[0],
                    temp: f.properties.temperatureC ?? f.properties.tempC,
                    rain: f.properties.precipitationMm,
                    wind: f.properties.windSpeedKmh
                  }))
                : savedLocations.length > 0
                ? savedLocations.map((l) => ({
                    city: l.city,
                    state: l.region || '',
                    lat: l.lat,
                    lng: l.lng,
                    temp: l.tempC,
                    rain: l.rain,
                    wind: l.windSpeedKmh
                  }))
                : []
              ).map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => handleFocusCity(c)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition border text-left cursor-pointer ${
                    selectedStation?.name === c.city
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 dark:border-blue-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate">
                      {translateCity(c.city)}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {c.state ? translateRegion(c.state) : 'Live Station'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0 ml-2">
                    {c.temp != null ? formatTemp(c.temp) : '--'}
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
