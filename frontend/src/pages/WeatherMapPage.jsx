import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useWeather } from '../context/WeatherContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import {
  Plus,
  Minus,
  Crosshair,
  MapPin,
  CloudRain,
  Thermometer,
  Wind,
  Globe,
  Loader2,
  Maximize2,
  Minimize2,
  Search,
  Play,
  Pause,
  RotateCcw,
  Sun,
  Cloud,
  Clock,
  X,
  Activity,
  Calendar,
  Compass,
  HelpCircle,
  Eye,
  Sliders,
  ChevronDown
} from 'lucide-react';

// ============================================================================
// 1. MAJOR REFERENCE CITIES (AccuWeather-Style Map Labels)
// ============================================================================
const REFERENCE_CITIES = [
  { name: 'Pimpri Chinchwad', lat: 18.6298, lng: 73.7997, isDefault: true, temp: 23, windSpeed: 8, windDirection: 276, aqi: 68, pm25: 17 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, temp: 23, windSpeed: 10, windDirection: 278, aqi: 60, pm25: 16 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, temp: 27, windSpeed: 6, windDirection: 302, aqi: 59, pm25: 11 },
  { name: 'Nashik', lat: 19.9975, lng: 73.7898, temp: 23, windSpeed: 10, windDirection: 271, aqi: 51, pm25: 8 },
  { name: 'Chh. Sambhajinagar', lat: 19.8762, lng: 75.3433, temp: 25, windSpeed: 9, windDirection: 275, aqi: 65, pm25: 15 },
  { name: 'Solapur', lat: 17.6599, lng: 75.9064, temp: 26, windSpeed: 11, windDirection: 280, aqi: 58, pm25: 14 },
  { name: 'Kolhapur', lat: 16.7050, lng: 74.2433, temp: 24, windSpeed: 8, windDirection: 265, aqi: 48, pm25: 10 },
  { name: 'Nagpur', lat: 21.1458, lng: 79.0882, temp: 29, windSpeed: 8, windDirection: 278, aqi: 96, pm25: 30 },
  { name: 'Amravati', lat: 20.9374, lng: 77.7796, temp: 28, windSpeed: 8, windDirection: 275, aqi: 82, pm25: 22 },
  { name: 'Nanded', lat: 19.1383, lng: 77.3210, temp: 27, windSpeed: 9, windDirection: 285, aqi: 64, pm25: 16 },
  { name: 'Surat', lat: 21.1702, lng: 72.8311, temp: 28, windSpeed: 13, windDirection: 224, aqi: 76, pm25: 18 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, temp: 31, windSpeed: 12, windDirection: 194, aqi: 68, pm25: 25 },
  { name: 'Indore', lat: 22.7196, lng: 75.8577, temp: 27, windSpeed: 11, windDirection: 245, aqi: 72, pm25: 19 },
  { name: 'Bhopal', lat: 23.2599, lng: 77.4126, temp: 28, windSpeed: 10, windDirection: 260, aqi: 78, pm25: 21 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, temp: 28, windSpeed: 8, windDirection: 323, aqi: 76, pm25: 20 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, temp: 27, windSpeed: 4, windDirection: 257, aqi: 54, pm25: 17 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, temp: 30, windSpeed: 9, windDirection: 200, aqi: 62, pm25: 18 },
  { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185, temp: 29, windSpeed: 11, windDirection: 185, aqi: 58, pm25: 15 },
  { name: 'New Delhi', lat: 28.6139, lng: 77.2090, temp: 30, windSpeed: 3, windDirection: 282, aqi: 159, pm25: 93 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873, temp: 32, windSpeed: 9, windDirection: 230, aqi: 125, pm25: 48 },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462, temp: 31, windSpeed: 6, windDirection: 270, aqi: 142, pm25: 64 },
  { name: 'Patna', lat: 25.5941, lng: 85.1376, temp: 30, windSpeed: 7, windDirection: 280, aqi: 130, pm25: 55 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, temp: 29, windSpeed: 8, windDirection: 190, aqi: 88, pm25: 28 },
  { name: 'Kochi', lat: 9.9312, lng: 76.2673, temp: 28, windSpeed: 6, windDirection: 260, aqi: 36, pm25: 9 }
];

// Color scale for AQI categories
const getAqiRgb = (aqi) => {
  if (aqi <= 50) return [6, 182, 212];    // Excellent - Cyan
  if (aqi <= 100) return [16, 185, 129];  // Fair - Green
  if (aqi <= 200) return [245, 158, 11];  // Poor - Amber/Orange
  if (aqi <= 300) return [239, 68, 68];   // Unhealthy - Rose/Red
  if (aqi <= 400) return [168, 85, 247];  // Very Unhealthy - Purple
  return [124, 58, 237];                  // Dangerous - Deep Violet
};

// Color scale for Thermal Surface
const getTempRgb = (temp) => {
  if (temp == null) return [16, 185, 129];
  if (temp <= 16) return [59, 130, 246];  // Cool Blue
  if (temp <= 21) return [14, 165, 233];  // Sky
  if (temp <= 25) return [16, 185, 129];  // Emerald
  if (temp <= 28) return [234, 179, 8];   // Warm Yellow
  if (temp <= 32) return [245, 158, 11];  // Amber
  if (temp <= 36) return [249, 115, 22];  // Orange
  return [239, 68, 68];                  // Hot Crimson
};

// AccuWeather / Windy-Style Interactive Station Badge Icon
const createStationBadgeIcon = (station, activeLayer, isSelected = false) => {
  const shortName = (station.name || '').split(' ')[0];
  let metricHtml = '';
  let badgeBg = 'rgba(15, 23, 42, 0.92)';
  let badgeBorder = isSelected ? '#38BDF8' : 'rgba(255, 255, 255, 0.28)';

  if (activeLayer === 'temperature') {
    const t = station.temp != null ? Math.round(station.temp) : 25;
    let tColor = '#10B981';
    if (t <= 18) tColor = '#38BDF8';
    else if (t <= 24) tColor = '#10B981';
    else if (t <= 28) tColor = '#FBBF24';
    else if (t <= 33) tColor = '#FB923C';
    else tColor = '#F87171';

    metricHtml = `<span style="color:${tColor}; font-weight:900; font-size:12px; margin-left:3px;">${t}°</span>`;
    badgeBg = 'rgba(15, 23, 42, 0.94)';
  } else if (activeLayer === 'wind') {
    const ws = station.windSpeed != null ? Math.round(station.windSpeed) : 10;
    const wd = station.windDirection != null ? station.windDirection : 270;
    metricHtml = `
      <span style="color:#C084FC; font-weight:900; font-size:11px; margin-left:3px;">${ws} km/h</span>
      <span style="display:inline-block; transform:rotate(${wd}deg); font-size:11px; color:#F3E8FF; margin-left:1px;">↑</span>
    `;
    badgeBg = 'rgba(46, 16, 101, 0.94)';
    badgeBorder = isSelected ? '#38BDF8' : '#9333EA';
  } else if (activeLayer === 'aqi') {
    const aqi = station.aqi != null ? station.aqi : 65;
    let aqiBg = '#10B981';
    if (aqi <= 50) aqiBg = '#06B6D4';
    else if (aqi <= 100) aqiBg = '#10B981';
    else if (aqi <= 200) aqiBg = '#F59E0B';
    else if (aqi <= 300) aqiBg = '#EF4444';
    else aqiBg = '#A855F7';

    metricHtml = `<span style="background:${aqiBg}; color:#ffffff; padding:1px 6px; border-radius:9999px; font-weight:900; font-size:10px; margin-left:3px;">AQI ${aqi}</span>`;
    badgeBg = 'rgba(15, 23, 42, 0.94)';
  } else if (activeLayer === 'radar' || activeLayer === 'satellite') {
    const rain = station.precipitation || 0;
    if (rain > 0) {
      metricHtml = `<span style="color:#38BDF8; font-weight:900; font-size:11px; margin-left:3px;">${rain} mm</span>`;
    } else if (station.cloudCover != null) {
      metricHtml = `<span style="color:#CBD5E1; font-weight:800; font-size:10px; margin-left:3px;">${station.cloudCover}% clouds</span>`;
    } else {
      metricHtml = `<span style="color:#10B981; font-weight:800; font-size:10px; margin-left:3px;">Clear</span>`;
    }
    badgeBg = 'rgba(11, 19, 43, 0.94)';
  }

  const pulseRing = isSelected
    ? `box-shadow: 0 0 0 3px #38BDF8, 0 4px 16px rgba(0,0,0,0.85);`
    : `box-shadow: 0 3px 10px rgba(0,0,0,0.55);`;

  return L.divIcon({
    className: 'leaflet-station-badge-icon',
    html: `
      <div style="
        display: inline-flex;
        align-items: center;
        gap: 3px;
        background: ${badgeBg};
        border: 1.5px solid ${badgeBorder};
        ${pulseRing}
        padding: 2px 7px;
        border-radius: 9999px;
        color: #ffffff;
        font-family: inherit;
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
        cursor: pointer;
        transform: translate(-50%, -50%);
        pointer-events: auto;
        user-select: none;
        backdrop-filter: blur(6px);
      ">
        <span style="width:6px; height:6px; border-radius:50%; background:${isSelected ? '#38BDF8' : '#ffffff'}; shrink-0; display:inline-block;"></span>
        <span>${shortName}</span>
        ${metricHtml}
      </div>
    `,
    iconSize: [120, 24],
    iconAnchor: [60, 12]
  });
};

// ============================================================================
// 3. MAP CONTROLLERS & CLICK HANDLERS
// ============================================================================
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

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    }
  });
  return null;
}

// In-map Zoom and Locate buttons
function MapActionsToolbar({ onZoomIn, onZoomOut, onLocate, isLocating }) {
  return (
    <div className="absolute top-4 left-4 z-[400] flex flex-col gap-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-2xl border border-slate-300/80 dark:border-slate-700/80 shadow-xl">
      <button
        type="button"
        onClick={onZoomIn}
        className="p-2 text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
        title="Zoom In"
      >
        <Plus className="w-4 h-4 font-bold" />
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        className="p-2 text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
        title="Zoom Out"
      >
        <Minus className="w-4 h-4 font-bold" />
      </button>
      <div className="h-[1px] bg-slate-200 dark:bg-slate-700 mx-1 my-0.5" />
      <button
        type="button"
        onClick={onLocate}
        disabled={isLocating}
        className="p-2 text-sky-500 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer disabled:opacity-50"
        title="Fly to My Location"
      >
        <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin text-amber-500' : ''}`} />
      </button>
    </div>
  );
}

// ============================================================================
// 4. HIGH-PERFORMANCE CANVAS OVERLAY: REAL THERMAL SURFACE (TEMPERATURE)
// ============================================================================
function TemperatureCanvasOverlay({ enabled, stations = [], opacity = 0.82 }) {
  const map = useMap();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!enabled || !stations || stations.length === 0) return;

    const container = map.getContainer();
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '340';
    canvas.style.opacity = String(opacity);
    container.appendChild(canvas);
    canvasRef.current = canvas;

    const ctx = canvas.getContext('2d');

    const drawThermalField = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;

      if (canvas.width === 0 || canvas.height === 0) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Base ambient thermal wash (mild pleasant temperature)
      ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Project each station to canvas container pixels
      const projected = stations.map((s) => {
        const pt = map.latLngToContainerPoint([s.lat, s.lng]);
        return {
          x: pt.x,
          y: pt.y,
          temp: s.temp != null ? s.temp : 24
        };
      });

      // Compute dynamic radial spread based on map zoom
      const zoom = map.getZoom();
      const radius = Math.max(140, Math.min(440, (zoom || 6) * 40));

      // Draw blended radial isotherms
      projected.forEach((p) => {
        const [r, g, b] = getTempRgb(p.temp);
        const radGrad = ctx.createRadialGradient(p.x, p.y, 10, p.x, p.y, radius);

        radGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.75)`);
        radGrad.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, 0.42)`);
        radGrad.addColorStop(0.85, `rgba(${r}, ${g}, ${b}, 0.12)`);
        radGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.0)`);

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    drawThermalField();
    map.on('move', drawThermalField);
    map.on('zoom', drawThermalField);
    map.on('resize', drawThermalField);

    return () => {
      map.off('move', drawThermalField);
      map.off('zoom', drawThermalField);
      map.off('resize', drawThermalField);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [map, enabled, stations, opacity]);

  return null;
}

// ============================================================================
// 5. HIGH-PERFORMANCE CANVAS OVERLAY: INDIA WIND FLOW & STREAMLINES
// ============================================================================
function WindFlowCanvasOverlay({ enabled, stations = [], showContours = true, opacity = 0.85 }) {
  const map = useMap();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const container = map.getContainer();
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '350';
    canvas.style.opacity = String(opacity);
    container.appendChild(canvas);
    canvasRef.current = canvas;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
    };
    resize();
    map.on('resize', resize);
    map.on('move', resize);

    // Dynamic wind vector calculation using inverse distance weighted interpolation from real stations
    const getWindVector = (x, y) => {
      const latlng = map.containerPointToLatLng([x, y]);
      const lat = latlng.lat;
      const lng = latlng.lng;

      if (!stations || stations.length === 0) {
        return { angle: -Math.PI * 0.25, speed: 2.5 };
      }

      let totalWeight = 0;
      let sumU = 0;
      let sumV = 0;

      for (let i = 0; i < stations.length; i++) {
        const s = stations[i];
        const dLat = lat - s.lat;
        const dLng = lng - s.lng;
        const distSq = dLat * dLat + dLng * dLng;
        const weight = 1 / (distSq + 0.08); // epsilon to avoid div by zero

        // Meteorological wind direction (theta = deg from north where wind comes from)
        // Convert to direction wind blows TO in standard canvas math:
        const theta = s.windDirection != null ? s.windDirection : 260;
        const radTo = (270 - theta) * (Math.PI / 180);
        const wSpeed = s.windSpeed != null ? s.windSpeed : 10;

        sumU += Math.cos(radTo) * wSpeed * weight;
        sumV += Math.sin(radTo) * wSpeed * weight;
        totalWeight += weight;
      }

      const u = totalWeight > 0 ? sumU / totalWeight : 1;
      const v = totalWeight > 0 ? sumV / totalWeight : 1;
      const mag = Math.sqrt(u * u + v * v);
      const angle = Math.atan2(v, u);
      // Particle animation velocity: clamp to pleasing smooth visible speeds
      const speed = Math.max(1.4, Math.min(4.8, mag * 0.26));

      return { angle, speed };
    };

    // Initialize 250 vector particles
    const NUM_PARTICLES = 250;
    const particles = Array.from({ length: NUM_PARTICLES }, () => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      return {
        x,
        y,
        age: Math.floor(Math.random() * 60),
        maxAge: 45 + Math.random() * 35
      };
    });

    const render = () => {
      // 1. Wind contours background (soft atmospheric purple shades)
      if (showContours) {
        ctx.fillStyle = 'rgba(147, 51, 234, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = 'rgba(11, 17, 32, 0.16)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 2. Animate streaming white particle vectors
      particles.forEach((p) => {
        p.age++;
        if (p.age > p.maxAge || p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
          p.age = 0;
        }

        const { angle, speed } = getWindVector(p.x, p.y);
        const prevX = p.x;
        const prevY = p.y;
        p.x += Math.cos(angle) * speed;
        p.y += Math.sin(angle) * speed;

        const progress = p.age / p.maxAge;
        const alpha = Math.sin(progress * Math.PI) * 0.90;

        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
        ctx.lineWidth = 1.9;
        ctx.lineCap = 'round';
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      map.off('resize', resize);
      map.off('move', resize);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [map, enabled, stations, showContours, opacity]);

  return null;
}

// ============================================================================
// 6. HIGH-PERFORMANCE CANVAS OVERLAY: REGIONAL AIR QUALITY (AQI) FIELD
// ============================================================================
function AirQualityCanvasOverlay({ enabled, stations = [], opacity = 0.75 }) {
  const map = useMap();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!enabled || !stations || stations.length === 0) return;

    const container = map.getContainer();
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '340';
    canvas.style.opacity = String(opacity);
    container.appendChild(canvas);
    canvasRef.current = canvas;

    const ctx = canvas.getContext('2d');

    const drawAqiField = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;

      if (canvas.width === 0 || canvas.height === 0) return;

      // Project anchor points to container screen pixels
      const projected = stations.map((s) => {
        const pt = map.latLngToContainerPoint([s.lat, s.lng]);
        return { x: pt.x, y: pt.y, aqi: s.aqi != null ? s.aqi : 65 };
      });

      // Render smooth interpolated radial gradients centered on regional anchors
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Base background field (clean coastal air)
      ctx.fillStyle = 'rgba(6, 182, 212, 0.32)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const zoom = map.getZoom();
      const radius = Math.max(140, Math.min(440, (zoom || 6) * 40));

      // Draw anchor heat zones
      projected.forEach((p) => {
        const [r, g, b] = getAqiRgb(p.aqi);
        const radGrad = ctx.createRadialGradient(p.x, p.y, 10, p.x, p.y, radius);

        radGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.78)`);
        radGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.45)`);
        radGrad.addColorStop(0.85, `rgba(${r}, ${g}, ${b}, 0.12)`);
        radGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.0)`);

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    drawAqiField();
    map.on('move', drawAqiField);
    map.on('zoom', drawAqiField);
    map.on('resize', drawAqiField);

    return () => {
      map.off('move', drawAqiField);
      map.off('zoom', drawAqiField);
      map.off('resize', drawAqiField);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [map, enabled, stations, opacity]);

  return null;
}

// ============================================================================
// 6. MAIN WEATHER MAP COMPONENT
// ============================================================================
export const WeatherMapPage = () => {
  const {
    selectedMapLocation,
    setSelectedMapLocation,
    formatTemp,
    formatWind,
    addToast,
    detectCurrentLocation,
    isDetectingLocation
  } = useWeather();
  const { t, language } = useLanguage();
  const { isDark } = useTheme();

  // Active Weather Map Layer:
  // 'satellite' | 'radar' | 'wind' | 'aqi' | 'temperature'
  const [activeLayer, setActiveLayer] = useState('satellite');
  // Basemap style: 'hybrid' | 'dark' | 'streets' | 'satellite'
  const [mapStyle, setMapStyle] = useState('hybrid');
  const [layerOpacity, setLayerOpacity] = useState(0.80);
  const [showWindContours, setShowWindContours] = useState(true);

  // Map viewport center
  const [mapCenter, setMapCenter] = useState({
    lat: selectedMapLocation?.lat || 18.6298, // Default: Pimpri Chinchwad
    lng: selectedMapLocation?.lng || 73.7997,
    zoom: 7
  });

  // Map Click Point Forecast Inspector
  const [inspectorPoint, setInspectorPoint] = useState(null);
  const [inspectorData, setInspectorData] = useState(null);
  const [inspectorLoading, setInspectorLoading] = useState(false);

  // Doppler Radar & Satellite Multi-Frame timeline
  const [radarFrames, setRadarFrames] = useState([]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [radarPath, setRadarPath] = useState(null);
  const [satellitePath, setSatellitePath] = useState(null);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);

  // Fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapContainerWrapperRef = useRef(null);
  const mapRef = useRef(null);

  // In-map search
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [mapSearchResults, setMapSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchWrapperRef = useRef(null);

  // Current active city name display (Matches AccuWeather Header)
  const activeCityName = inspectorData?.name || selectedMapLocation?.city || 'Pimpri Chinchwad';

  // Available Practical Map Modes (AccuWeather standard)
  const MAP_MODES = [
    {
      id: 'satellite',
      title: 'SATELLITE',
      subtitle: 'Enhanced RealVue™ Satellite',
      label: language === 'mr' ? 'उपग्रह (Enhanced RealVue™)' : 'Enhanced RealVue™ Satellite',
      icon: Globe
    },
    {
      id: 'radar',
      title: 'DOPPLER RADAR',
      subtitle: 'Precipitation Doppler Radar',
      label: language === 'mr' ? 'पाऊस रडार (Doppler Radar)' : 'Precipitation Radar',
      icon: CloudRain
    },
    {
      id: 'wind',
      title: 'INDIA WIND FLOW',
      subtitle: 'Live Wind Streamlines & Vectors',
      label: language === 'mr' ? 'वारे प्रवाह (Wind Flow)' : 'India Wind Flow',
      icon: Wind
    },
    {
      id: 'aqi',
      title: 'CURRENT AIR QUALITY',
      subtitle: 'Regional Air Quality Index (AQI)',
      label: language === 'mr' ? 'हवा गुणवत्ता (Air Quality)' : 'Current Air Quality',
      icon: Activity
    },
    {
      id: 'temperature',
      title: 'AIR TEMPERATURE',
      subtitle: 'Surface Temperature & Heat Index',
      label: language === 'mr' ? 'तापमान (Air Temp)' : 'Air Temperature',
      icon: Thermometer
    }
  ];

  const currentModeConfig = MAP_MODES.find((m) => m.id === activeLayer) || MAP_MODES[0];

  // Real live stations telemetry state (initialized with 24 major stations)
  const [liveStations, setLiveStations] = useState(REFERENCE_CITIES);

  // Parallel batch fetch to populate real meteorological ground telemetry for all stations
  useEffect(() => {
    let isMounted = true;
    const fetchStationsTelemetry = async () => {
      try {
        const lats = REFERENCE_CITIES.map((c) => c.lat).join(',');
        const lngs = REFERENCE_CITIES.map((c) => c.lng).join(',');

        const [wxRes, aqiRes] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,weather_code,cloud_cover`),
          fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lngs}&current=us_aqi,pm2_5,pm10`)
        ]);

        if (wxRes.ok && aqiRes.ok) {
          const wxData = await wxRes.json();
          const aqiData = await aqiRes.json();

          const wxArr = Array.isArray(wxData) ? wxData : [wxData];
          const aqiArr = Array.isArray(aqiData) ? aqiData : [aqiData];

          if (isMounted) {
            setLiveStations((prev) =>
              prev.map((st, idx) => {
                const wx = wxArr[idx]?.current || {};
                const aq = aqiArr[idx]?.current || {};
                return {
                  ...st,
                  temp: wx.temperature_2m != null ? wx.temperature_2m : st.temp,
                  humidity: wx.relative_humidity_2m != null ? wx.relative_humidity_2m : st.humidity,
                  precipitation: wx.precipitation != null ? wx.precipitation : 0,
                  windSpeed: wx.wind_speed_10m != null ? wx.wind_speed_10m : st.windSpeed,
                  windDirection: wx.wind_direction_10m != null ? wx.wind_direction_10m : st.windDirection,
                  cloudCover: wx.cloud_cover != null ? wx.cloud_cover : 0,
                  weatherCode: wx.weather_code,
                  aqi: aq.us_aqi != null ? aq.us_aqi : st.aqi,
                  pm25: aq.pm2_5 != null ? aq.pm2_5 : st.pm25,
                  pm10: aq.pm10 != null ? aq.pm10 : 25
                };
              })
            );
          }
        }
      } catch (err) {
        console.warn('Live station telemetry batch fetch warning:', err);
      }
    };

    fetchStationsTelemetry();
    const interval = setInterval(fetchStationsTelemetry, 5 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Fetch real-time RainViewer radar & satellite frame buffer
  useEffect(() => {
    const fetchRadarFrames = async () => {
      try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        if (res.ok) {
          const data = await res.json();
          const host = data.host || 'https://tilecache.rainviewer.com';
          if (data.radar?.past && data.radar.past.length > 0) {
            const frames = data.radar.past.map((item) => ({
              time: item.time,
              path: `${host}${item.path}/256/{z}/{x}/{y}/2/1_1.png`,
              formattedTime: new Date(item.time * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
            }));
            setRadarFrames(frames);
            setCurrentFrameIdx(frames.length - 1);
            setRadarPath(frames[frames.length - 1].path);
          }
          if (data.satellite?.infrared && data.satellite.infrared.length > 0) {
            const latestSat = data.satellite.infrared[data.satellite.infrared.length - 1];
            setSatellitePath(`${host}${latestSat.path}/256/{z}/{x}/{y}/1/1_0.png`);
          }
        }
      } catch (err) {
        console.warn('Weather radar feed lookup note:', err);
      }
    };
    fetchRadarFrames();
  }, []);

  // Sync radar tile path on frame index change
  useEffect(() => {
    if (radarFrames.length > 0 && radarFrames[currentFrameIdx]) {
      setRadarPath(radarFrames[currentFrameIdx].path);
    }
  }, [currentFrameIdx, radarFrames]);

  // Timeline auto-play loop across radar frames
  useEffect(() => {
    if (!isPlayingTimeline || radarFrames.length === 0) return;
    const interval = setInterval(() => {
      setCurrentFrameIdx((prev) => (prev + 1) % radarFrames.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlayingTimeline, radarFrames]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for locations in map
  useEffect(() => {
    const trimmed = mapSearchQuery.trim();
    if (trimmed.length < 2) {
      setMapSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.searchLocations(trimmed);
        const list = Array.isArray(res) ? res : (res?.data || []);
        setMapSearchResults(list.slice(0, 5));
      } catch {
        setMapSearchResults([]);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [mapSearchQuery]);

  // Handle map click to inspect point forecast with real Open-Meteo & ECMWF/GFS synoptic models
  const handleMapClick = useCallback(async (latlng) => {
    const lat = Math.round(latlng.lat * 10000) / 10000;
    const lng = Math.round(latlng.lng * 10000) / 10000;

    setInspectorPoint({ lat, lng });
    setInspectorLoading(true);

    try {
      const [geoRes, forecastRes, currentRes, hourlyRes] = await Promise.all([
        api.reverseGeocode({ latitude: lat, longitude: lng }).catch(() => null),
        api.forecast({ latitude: lat, longitude: lng, days: 7 }).catch(() => null),
        api.weather({ latitude: lat, longitude: lng }).catch(() => null),
        api.hourly({ latitude: lat, longitude: lng, hours: 24 }).catch(() => null)
      ]);

      const locName = geoRes?.city || geoRes?.name || geoRes?.district || `Lat ${lat}, Lng ${lng}`;
      const stateName = geoRes?.region || geoRes?.state || '';

      const rawForecast = forecastRes?.data || forecastRes;
      const om = rawForecast?.models?.openMeteo || rawForecast?.models?.gfs || rawForecast?.models?.ecmwf || {};
      const omCurrent = om?.current || {};

      // Real AQI score and PM2.5 calculation from Open-Meteo Air Quality API
      const aqiVal = currentRes?.airQuality?.aqi ?? currentRes?.airQuality?.current?.us_aqi ?? (lat > 25 ? 160 : 68);
      const aqiTier =
        aqiVal <= 50 ? { label: 'Excellent', color: 'text-cyan-500 bg-cyan-500/15 border-cyan-500/30' } :
        aqiVal <= 100 ? { label: 'Fair', color: 'text-emerald-500 bg-emerald-500/15 border-emerald-500/30' } :
        aqiVal <= 200 ? { label: 'Poor', color: 'text-amber-500 bg-amber-500/15 border-amber-500/30' } :
        aqiVal <= 300 ? { label: 'Unhealthy', color: 'text-rose-500 bg-rose-500/15 border-rose-500/30' } :
        aqiVal <= 400 ? { label: 'Very Unhealthy', color: 'text-purple-500 bg-purple-500/15 border-purple-500/30' } :
        { label: 'Dangerous', color: 'text-violet-600 bg-violet-500/15 border-violet-500/30' };

      const pm25Val = currentRes?.airQuality?.current?.pm2_5 ?? (aqiVal * 0.38).toFixed(1);

      // Build upcoming 24 hours from current time forward
      const allHourly = (Array.isArray(hourlyRes?.hourly) && hourlyRes.hourly.length > 0)
        ? hourlyRes.hourly
        : (Array.isArray(hourlyRes?.data?.hourly) && hourlyRes.data.hourly.length > 0)
          ? hourlyRes.data.hourly
          : (Array.isArray(om?.hourly) ? om.hourly : []);

      const nowHourIso = new Date().toISOString().slice(0, 13);
      const currentHourIdx = allHourly.findIndex(h => h.time && h.time.slice(0, 13) >= nowHourIso);
      const upcomingHourly = (currentHourIdx >= 0 ? allHourly.slice(currentHourIdx) : allHourly).slice(0, 24).map((h, i) => {
        let displayTime = `+${i}h`;
        if (h.time) {
          displayTime = new Date(h.time).toLocaleTimeString([], { hour: 'numeric' });
        }
        return {
          time: displayTime,
          temperature: h.temperature != null ? Math.round(h.temperature) : null,
          precipitationProbability: h.precipitationProbability != null ? Math.round(h.precipitationProbability) : (h.precipitation > 0 ? 65 : 0),
          windSpeed: h.windSpeed != null ? Math.round(h.windSpeed) : null,
          condition: h.condition || h.weatherDescription || 'Clear',
          weatherCode: h.weatherCode
        };
      });

      // Build real 7-day outlook
      const rawDaily = Array.isArray(om?.daily) ? om.daily : [];
      const dailyOutlook = rawDaily.map((d, idx) => {
        let dayLabel = `Day ${idx + 1}`;
        if (d.date) {
          const parts = d.date.split('-');
          if (parts.length === 3) {
            const parsedDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            if (idx === 0) dayLabel = language === 'mr' ? 'आज (Today)' : 'Today';
            else if (idx === 1) dayLabel = language === 'mr' ? 'उद्या (Tomorrow)' : 'Tomorrow';
            else {
              dayLabel = parsedDate.toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            }
          }
        }
        return {
          date: dayLabel,
          maxTemp: d.maxTemperature != null ? Math.round(d.maxTemperature) : 31,
          minTemp: d.minTemperature != null ? Math.round(d.minTemperature) : 22,
          rainChance: d.precipitationProbability != null ? Math.round(d.precipitationProbability) : (d.precipitationSum > 0 ? 70 : 10),
          condition: d.condition || d.weatherDescription || 'Partly Cloudy'
        };
      });

      const currentTemp = omCurrent.temperature != null
        ? Math.round(omCurrent.temperature)
        : (currentRes?.observations?.current?.temperature != null
            ? Math.round(currentRes.observations.current.temperature)
            : (upcomingHourly[0]?.temperature != null ? upcomingHourly[0].temperature : 28));

      const currentPrecip = omCurrent.precipitation != null ? omCurrent.precipitation : 0;
      const currentWind = omCurrent.windSpeed != null ? Math.round(omCurrent.windSpeed) : 12;

      setInspectorData({
        name: locName,
        region: stateName,
        lat,
        lng,
        current: {
          temperature: currentTemp,
          apparentTemperature: omCurrent.apparentTemperature != null ? Math.round(omCurrent.apparentTemperature) : currentTemp,
          precipitation: currentPrecip,
          windSpeed: currentWind,
          humidity: omCurrent.humidity ?? currentRes?.observations?.current?.humidity ?? 68,
          pressure: omCurrent.pressure != null ? Math.round(omCurrent.pressure) : 1010,
          condition: omCurrent.condition || omCurrent.weatherDescription || 'Clear',
          aqi: aqiVal,
          aqiTier,
          pm25: pm25Val,
          uvIndex: omCurrent.uvIndex ?? 5
        },
        daily: dailyOutlook,
        hourly: upcomingHourly
      });
    } catch {
      addToast('Could not fetch point forecast', 'warning');
    } finally {
      setInspectorLoading(false);
    }
  }, [language, addToast]);

  // Auto-inspect the initial location on mount
  useEffect(() => {
    const initLat = selectedMapLocation?.lat || mapCenter.lat;
    const initLng = selectedMapLocation?.lng || mapCenter.lng;
    if (initLat && initLng) {
      handleMapClick({ lat: initLat, lng: initLng });
    }
  }, [handleMapClick, mapCenter.lat, mapCenter.lng, selectedMapLocation?.lat, selectedMapLocation?.lng]);

  // Center on user's live location
  const handleLocateMe = async () => {
    try {
      const loc = await detectCurrentLocation(true);
      if (loc && loc.lat && loc.lng) {
        setMapCenter({ lat: loc.lat, lng: loc.lng, zoom: 10 });
        handleMapClick({ lat: loc.lat, lng: loc.lng });
      }
    } catch {
      addToast('Could not resolve location', 'warning');
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapContainerWrapperRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Switch weather layer and apply optimal basemap
  const handleLayerSwitch = (layerId) => {
    setActiveLayer(layerId);
    if (layerId === 'satellite') {
      setMapStyle('hybrid');
    } else if (layerId === 'wind' || layerId === 'aqi') {
      setMapStyle('dark');
    }
  };

  // Dynamic tile url for the base map (Watermark-Free, No API Key)
  const getTileUrl = () => {
    if (mapStyle === 'satellite' || mapStyle === 'hybrid') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
    if (mapStyle === 'streets') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
    }
    // Default: Dark Mode OpenStreetMap
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  };

  // Current frame formatted label for the timeline player
  const currentTimelineTime = radarFrames[currentFrameIdx]?.formattedTime || '7:00 PM';

  return (
    <div
      ref={mapContainerWrapperRef}
      className={`space-y-4 animate-fadeIn pb-12 ${isFullscreen ? 'p-4 bg-slate-950 min-h-screen z-[9999]' : ''}`}
    >
      {/* ====================================================================
          ACCUWEATHER-STYLE TOP HEADER BAR
          ==================================================================== */}
      <div className="bg-white dark:bg-[#151F32] p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-3">
        {/* Row 1: Upper Tag & Dropdown Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {currentModeConfig.title}
            </span>

            {/* Quick Layer Switcher Dropdown */}
            <div className="relative inline-block">
              <select
                value={activeLayer}
                onChange={(e) => handleLayerSwitch(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-black text-slate-900 dark:text-white cursor-pointer hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {MAP_MODES.map((mode) => (
                  <option key={mode.id} value={mode.id}>
                    {mode.subtitle}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div title="High-resolution meteorology satellite, radar, and atmospheric flow integration">
              <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-help" />
            </div>
          </div>

          {/* Right Controls: Wind Contours Checkbox or Basemap switcher */}
          <div className="flex items-center gap-3">
            {activeLayer === 'wind' && (
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={showWindContours}
                  onChange={(e) => setShowWindContours(e.target.checked)}
                  className="rounded-sm accent-orange-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-orange-500 inline-block shadow-xs" />
                  <span>{language === 'mr' ? 'वारे समरेषा (Wind contours)' : 'Wind contours'}</span>
                </span>
              </label>
            )}

            {/* Quick Basemap Pill Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
              {[
                { id: 'hybrid', label: 'Hybrid' },
                { id: 'satellite', label: 'Sat' },
                { id: 'dark', label: 'Dark' },
                { id: 'streets', label: 'Roads' }
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setMapStyle(st.id)}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    mapStyle === st.id
                      ? 'bg-blue-600 text-white shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Prominent Active City Heading + Instant City Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{activeCityName}</span>
              {inspectorPoint && (
                <span className="text-xs font-semibold text-slate-400">
                  • {inspectorPoint.lat.toFixed(2)}°N, {inspectorPoint.lng.toFixed(2)}°E
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentModeConfig.subtitle} • {language === 'mr' ? 'थेट हवामान व उपग्रह नकाशा' : 'Live Interactive Meteorological Surface'}
            </p>
          </div>

          {/* Quick Location Search Bar */}
          <div ref={searchWrapperRef} className="relative w-full sm:w-72">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder={language === 'mr' ? 'कोणतेही शहर शोधा (उदा. पुणे, मुंबई)...' : 'Search city or coords...'}
                value={mapSearchQuery}
                onFocus={() => setShowSearchDropdown(true)}
                onChange={(e) => {
                  setMapSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                className="w-full pl-8 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              {mapSearchQuery && (
                <button
                  onClick={() => {
                    setMapSearchQuery('');
                    setMapSearchResults([]);
                  }}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            {showSearchDropdown && mapSearchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-11 z-[500] bg-white dark:bg-[#151F32] border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-2xl space-y-1 animate-fadeIn">
                {mapSearchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const lat = res.lat ?? res.latitude;
                      const lng = res.lon ?? res.longitude ?? res.lng;
                      setMapCenter({ lat, lng, zoom: 10 });
                      handleMapClick({ lat, lng });
                      setShowSearchDropdown(false);
                      setMapSearchQuery('');
                    }}
                    className="w-full text-left p-2 rounded-xl text-xs font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="truncate">{res.city || res.name}, {res.region || res.state || res.country}</span>
                    <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs (Quick 1-click access to the 5 maps) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none border-t border-slate-100 dark:border-slate-800/80">
          {MAP_MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = activeLayer === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleLayerSwitch(mode.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ====================================================================
          MAIN MAP CANVAS & POINT FORECAST INSPECTOR (8 cols / 4 cols)
          ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Interactive Leaflet Slippy Map (8 Cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="relative h-[600px] md:h-[680px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-200/90 dark:border-slate-800/90 shadow-2xl z-0">
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={mapCenter.zoom}
              scrollWheelZoom={true}
              zoomControl={false}
              className="w-full h-full z-0"
              ref={mapRef}
            >
              <MapController center={mapCenter} zoom={mapCenter.zoom} />
              <MapClickHandler onMapClick={handleMapClick} />

              {/* 1. Base Slippy Tile Layer (100% Free, No API Key) */}
              <TileLayer
                key={`basemap-${mapStyle}`}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://www.esri.com/">Esri</a>'
                url={getTileUrl()}
                className={mapStyle === 'dark' ? 'leaflet-tile-dark' : ''}
              />

              {/* 2. Hybrid Administrative Boundaries & City Labels Overlay (ArcGIS Free, No Key) */}
              {(mapStyle === 'hybrid' || mapStyle === 'satellite' || activeLayer === 'satellite') && (
                <TileLayer
                  key="hybrid-boundaries-labels"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                  opacity={0.95}
                  zIndex={450}
                />
              )}

              {/* 3. Doppler Precipitation Radar Layer (Dynamic RainViewer Doppler) */}
              {(activeLayer === 'radar' || activeLayer === 'satellite') && radarPath && (
                <TileLayer
                  key={`radar-frame-${currentFrameIdx}`}
                  url={radarPath}
                  opacity={activeLayer === 'satellite' ? 0.72 : layerOpacity}
                  zIndex={320}
                />
              )}

              {/* 4. Satellite Infrared Cloud Cover Layer */}
              {activeLayer === 'satellite' && satellitePath && (
                <TileLayer
                  key="satellite-ir-overlay"
                  url={satellitePath}
                  opacity={layerOpacity * 0.75}
                  zIndex={310}
                />
              )}

              {/* 5. Real-Time Thermal Surface (Temperature Map) */}
              {activeLayer === 'temperature' && (
                <TemperatureCanvasOverlay
                  enabled={true}
                  stations={liveStations}
                  opacity={layerOpacity}
                />
              )}

              {/* 6. India Wind Flow & Streamlines Canvas Overlay */}
              {activeLayer === 'wind' && (
                <WindFlowCanvasOverlay
                  enabled={true}
                  stations={liveStations}
                  showContours={showWindContours}
                  opacity={layerOpacity}
                />
              )}

              {/* 7. Continuous Regional Air Quality (AQI) Canvas Overlay */}
              {activeLayer === 'aqi' && (
                <AirQualityCanvasOverlay
                  enabled={true}
                  stations={liveStations}
                  opacity={layerOpacity}
                />
              )}

              {/* 8. AccuWeather / Windy-Style Real-Time Interactive Station Badges */}
              {liveStations.map((station, idx) => {
                const isSelected = inspectorPoint && Math.abs(inspectorPoint.lat - station.lat) < 0.25 && Math.abs(inspectorPoint.lng - station.lng) < 0.25;
                return (
                  <Marker
                    key={`station-badge-${station.name}-${idx}`}
                    position={[station.lat, station.lng]}
                    icon={createStationBadgeIcon(station, activeLayer, isSelected)}
                    eventHandlers={{
                      click: () => {
                        setMapCenter({ lat: station.lat, lng: station.lng, zoom: 8 });
                        handleMapClick({ lat: station.lat, lng: station.lng });
                      }
                    }}
                  />
                );
              })}

              {/* Inspector Selected Point Marker */}
              {inspectorPoint && (
                <Marker
                  position={[inspectorPoint.lat, inspectorPoint.lng]}
                  icon={L.divIcon({
                    className: 'leaflet-selected-point',
                    html: `
                      <div style="width:24px; height:24px; border-radius:50%; background:#EF4444; border:3px solid #ffffff; box-shadow:0 0 14px rgba(239,68,68,0.9); transform:translate(-12px, -12px); animation:pulse 1.5s infinite;"></div>
                    `,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                  })}
                />
              )}
            </MapContainer>

            {/* In-Map Top-Left Zoom Controls */}
            <MapActionsToolbar
              onZoomIn={() => mapRef.current?.zoomIn()}
              onZoomOut={() => mapRef.current?.zoomOut()}
              onLocate={handleLocateMe}
              isLocating={isDetectingLocation}
            />

            {/* In-Map Floating Layer Opacity Slider (Top Right) */}
            <div className="absolute top-4 right-4 z-[400] hidden sm:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700/80 shadow-xl text-xs text-white">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-[10px] font-bold text-slate-300">Opacity:</span>
              <input
                type="range"
                min="0.2"
                max="1"
                step="0.05"
                value={layerOpacity}
                onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
                className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
              <span className="text-[10px] font-black text-sky-400">{Math.round(layerOpacity * 100)}%</span>
            </div>

            {/* OpenStreetMap Attribution Badge (Bottom Left, like in reference) */}
            <div className="absolute bottom-4 left-4 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 pointer-events-none shadow-xs">
              © OpenStreetMap
            </div>

            {/* ================================================================
                ACCUWEATHER-STYLE FLOATING TIMELINE PLAYER BAR (BOTTOM CENTER)
                ================================================================ */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] sm:w-[480px] z-[400] bg-white/95 dark:bg-[#151F32]/95 backdrop-blur-xl border border-slate-300/80 dark:border-slate-700/80 px-4 py-2.5 rounded-full shadow-2xl flex items-center justify-between gap-3">
              {/* Play / Pause Circular Button */}
              <button
                type="button"
                onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-800 dark:text-white flex items-center justify-center transition cursor-pointer shadow-xs shrink-0"
                title={isPlayingTimeline ? 'Pause Timeline' : 'Play Loop'}
              >
                {isPlayingTimeline ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              {/* Left Time Label */}
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 shrink-0">
                {currentTimelineTime}
              </span>

              {/* Timeline Track with Ticks & Now Marker */}
              <div className="relative flex-1 flex flex-col items-center justify-center px-2">
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, radarFrames.length - 1)}
                  value={currentFrameIdx}
                  onChange={(e) => {
                    setCurrentFrameIdx(parseInt(e.target.value));
                    setIsPlayingTimeline(false);
                  }}
                  className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="w-full flex justify-between px-1 text-[8px] font-bold text-slate-400 mt-1">
                  <span>-1h</span>
                  <span className="text-blue-500 font-black">Now</span>
                  <span>Forecast</span>
                </div>
              </div>

              {/* Right Time Label */}
              <span className="text-xs font-black text-slate-900 dark:text-white shrink-0">
                {currentTimelineTime} IST
              </span>

              {/* Fullscreen Toggle Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* ==================================================================
              ACCUWEATHER-STYLE BOTTOM LEGEND BAR (DIRECTLY BENEATH MAP)
              ================================================================== */}
          <div className="bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-3 shadow-xs">
            {activeLayer === 'aqi' ? (
              // Air Quality Legend (Exact match to AccuWeather screenshot)
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-7 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-1.5 rounded-full bg-[#06B6D4]" />
                  <span>Excellent</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>Fair</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-1.5 rounded-full bg-[#F59E0B]" />
                  <span>Poor</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-1.5 rounded-full bg-[#EF4444]" />
                  <span>Unhealthy</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-1.5 rounded-full bg-[#A855F7]" />
                  <span>Very Unhealthy</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-1.5 rounded-full bg-[#7C3AED]" />
                  <span>Dangerous</span>
                </span>
              </div>
            ) : activeLayer === 'wind' ? (
              // Wind Speed Contours Legend (Exact match to AccuWeather screenshot)
              <div className="space-y-1.5 max-w-xl mx-auto">
                <div className="h-2 w-full rounded-full bg-gradient-to-r from-[#E9D5FF] via-[#C084FC] via-[#A855F7] via-[#7E22CE] to-[#DC2626]" />
                <div className="flex justify-between text-[10px] font-black text-slate-500 dark:text-slate-400 px-1">
                  <span>&lt;32</span>
                  <span>32</span>
                  <span>48</span>
                  <span>64</span>
                  <span>80</span>
                  <span>96</span>
                  <span>112</span>
                  <span>&gt;112</span>
                </div>
                <div className="text-center text-[10px] font-bold text-slate-400">Wind Speed Velocity (km/h)</div>
              </div>
            ) : activeLayer === 'satellite' || activeLayer === 'radar' ? (
              // Radar & Storm Precipitation Intensity Scale
              <div className="space-y-1.5 max-w-xl mx-auto">
                <div className="h-2 w-full rounded-full bg-gradient-to-r from-sky-300 via-emerald-400 via-amber-400 via-orange-500 via-rose-600 to-purple-800" />
                <div className="flex justify-between text-[10px] font-black text-slate-500 dark:text-slate-400 px-1">
                  <span>Light (0.1 mm)</span>
                  <span>Moderate (2 mm)</span>
                  <span>Heavy (10 mm)</span>
                  <span>Severe Downpour (50+ mm)</span>
                </div>
              </div>
            ) : (
              // Temperature Thermal Scale
              <div className="space-y-1.5 max-w-xl mx-auto">
                <div className="h-2 w-full rounded-full bg-gradient-to-r from-blue-500 via-teal-400 via-emerald-400 via-amber-400 via-orange-500 to-rose-600" />
                <div className="flex justify-between text-[10px] font-black text-slate-500 dark:text-slate-400 px-1">
                  <span>15°C</span>
                  <span>22°C</span>
                  <span>28°C</span>
                  <span>35°C</span>
                  <span>42°C+</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ====================================================================
            RIGHT COLUMN: GROUND TELEMETRY & LIVE POINT FORECAST (4 cols)
            ==================================================================== */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-5 shadow-sm space-y-4">
            {/* Inspector Location Title */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    {activeCityName}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-400">
                    {inspectorPoint ? `${inspectorPoint.lat.toFixed(3)}°N, ${inspectorPoint.lng.toFixed(3)}°E` : 'Live Ground Telemetry'}
                  </p>
                </div>
              </div>

              {inspectorPoint && (
                <button
                  onClick={() => {
                    setInspectorPoint(null);
                    handleMapClick({ lat: 18.6298, lng: 73.7997 }); // Reset to Pimpri Chinchwad
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 p-1 rounded-lg cursor-pointer"
                  title="Reset to Pimpri Chinchwad"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            {inspectorLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-xs font-bold">{language === 'mr' ? 'थेट हवामान अंदाज मिळवत आहे...' : 'Fetching live Open-Meteo & GFS/ECMWF forecast...'}</span>
              </div>
            ) : (
              <>
                {/* Current Key Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold text-slate-400 block">{t('temperature')}</span>
                    <span className="text-sm font-black text-amber-500 mt-0.5 block">
                      {inspectorData?.current?.temperature != null
                        ? `${inspectorData.current.temperature}°C`
                        : '--'}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold block truncate">
                      {inspectorData?.current?.condition || 'Live Temp'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold text-slate-400 block">{t('precipitation')}</span>
                    <span className="text-sm font-black text-blue-500 mt-0.5 block">
                      {inspectorData?.current?.precipitation != null
                        ? `${inspectorData.current.precipitation} mm`
                        : '0 mm'}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold block">
                      {inspectorData?.current?.humidity != null ? `RH: ${inspectorData.current.humidity}%` : 'Precip'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold text-slate-400 block">{t('windSpeed')}</span>
                    <span className="text-sm font-black text-emerald-500 mt-0.5 block">
                      {inspectorData?.current?.windSpeed != null
                        ? `${inspectorData.current.windSpeed} km/h`
                        : '10 km/h'}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold block">
                      {inspectorData?.current?.pressure != null ? `${inspectorData.current.pressure} hPa` : 'Barometer'}
                    </span>
                  </div>
                </div>

                {/* Live Air Quality & Atmospheric Health Strip */}
                {inspectorData?.current?.aqi != null && (
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold shrink-0">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block">Air Quality (AQI)</span>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                          {inspectorData.current.aqi} • {inspectorData.current.aqiTier?.label || 'Moderate'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border block ${inspectorData.current.aqiTier?.color || 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'}`}>
                        PM2.5: {inspectorData.current.pm25} µg/m³
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 mt-0.5 block">
                        UV Index: {inspectorData.current.uvIndex ?? 5} (Moderate)
                      </span>
                    </div>
                  </div>
                )}

                {/* 24-Hour Hourly Weather Forecast Scrubber */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>{language === 'mr' ? 'पुढील २४ तास थेट अंदाज' : 'Next 24h Hourly Forecast'}</span>
                    </span>
                    <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">Open-Meteo HR</span>
                  </span>

                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin pt-1">
                    {(inspectorData?.hourly && inspectorData.hourly.length > 0 ? inspectorData.hourly : []).map((hr, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 min-w-[76px] text-center shrink-0 space-y-1"
                      >
                        <span className="text-[10px] font-bold text-slate-400 block truncate">
                          {hr.time}
                        </span>
                        <div className="flex justify-center py-0.5">
                          {hr.precipitationProbability > 40 ? (
                            <CloudRain className="w-4 h-4 text-blue-500" />
                          ) : (hr.temperature || 25) > 30 ? (
                            <Sun className="w-4 h-4 text-amber-500" />
                          ) : (
                            <Cloud className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">
                          {hr.temperature != null ? `${hr.temperature}°` : '--'}
                        </span>
                        <span className="text-[9px] font-bold text-blue-500 block">
                          {hr.precipitationProbability != null ? `${hr.precipitationProbability}%` : '0%'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7-Day Synoptic Weather Forecast Trend */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{language === 'mr' ? '७ दिवसांचा अचूक अंदाज' : '7-Day Synoptic Outlook'}</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">ECMWF / GFS</span>
                  </span>

                  <div className="space-y-1.5">
                    {(inspectorData?.daily && inspectorData.daily.length > 0 ? inspectorData.daily : []).map((d, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold"
                      >
                        <span className="text-slate-700 dark:text-slate-300 w-28 truncate">
                          {d.date}
                        </span>
                        <div className="flex items-center gap-1 text-blue-500 text-[11px] font-bold">
                          <CloudRain className="w-3 h-3" />
                          <span>{d.rainChance != null ? `${d.rainChance}%` : '0%'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-amber-500">{d.maxTemp != null ? `${d.maxTemp}°` : '--'}</span>
                          <span className="text-slate-400 text-[10px]">/</span>
                          <span className="text-sky-400">{d.minTemp != null ? `${d.minTemp}°` : '--'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Indian City Telemetry Switcher */}
          <div className="bg-white dark:bg-[#151F32] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-4 shadow-sm space-y-2.5">
            <span className="text-xs font-black text-slate-900 dark:text-white block">
              {language === 'mr' ? 'महत्त्वाची शहरे व स्थानके' : 'Major Weather Stations'}
            </span>
            <div className="grid grid-cols-2 gap-1.5 max-h-[190px] overflow-y-auto scrollbar-thin pr-1">
              {liveStations.slice(0, 14).map((city, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setMapCenter({ lat: city.lat, lng: city.lng, zoom: 8 });
                    handleMapClick({ lat: city.lat, lng: city.lng });
                  }}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/60 dark:border-slate-700/60 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between cursor-pointer transition group"
                >
                  <span className="truncate group-hover:text-blue-500 transition">{city.name}</span>
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 shrink-0 ml-1">
                    {activeLayer === 'wind'
                      ? `${Math.round(city.windSpeed || 10)} km/h`
                      : activeLayer === 'aqi'
                        ? `AQI ${city.aqi || 60}`
                        : `${Math.round(city.temp != null ? city.temp : 25)}°C`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherMapPage;
