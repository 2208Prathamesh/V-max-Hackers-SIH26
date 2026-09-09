import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useWeather } from '../context/WeatherContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Clock,
  Calendar,
  CloudRain,
  Sun,
  SlidersHorizontal,
  RotateCcw,
  Bell,
  ChevronRight,
  ChevronDown,
  Settings as SettingsIcon,
  Radio,
  Volume2,
  VolumeX,
  Share2,
  Phone,
  CheckCircle2,
  ListChecks,
  MessageSquare,
  ExternalLink,
  Copy,
  Compass,
  ShieldAlert,
  X,
  Send,
  PhoneCall,
  Sparkles,
  RefreshCw,
  Cpu,
  Landmark,
  Shield,
  Activity,
  Check
} from 'lucide-react';
import { AlertDetailsModal } from '../components/modals/AlertDetailsModal';
import { EmergencyBroadcastBanner } from '../components/common/EmergencyBroadcastBanner';

// ============================================================================
// 1. DISTRICT COORDINATES FOR REAL-TIME MAP PLACEMENT (MAHARASHTRA & BEYOND)
// ============================================================================
const DISTRICT_COORDS = {
  pune: { lat: 18.5204, lng: 73.8567 },
  pimpri: { lat: 18.6298, lng: 73.7997 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  nashik: { lat: 19.9975, lng: 73.7898 },
  nagpur: { lat: 21.1458, lng: 79.0882 },
  solapur: { lat: 17.6599, lng: 75.9064 },
  kolhapur: { lat: 16.7050, lng: 74.2433 },
  sambhajinagar: { lat: 19.8762, lng: 75.3433 },
  aurangabad: { lat: 19.8762, lng: 75.3433 },
  satara: { lat: 17.6805, lng: 74.0183 },
  mahabaleshwar: { lat: 17.9237, lng: 73.6586 },
  junnar: { lat: 19.2064, lng: 73.8767 },
  sangli: { lat: 16.8524, lng: 74.5815 },
  ratnagiri: { lat: 16.9902, lng: 73.3120 },
  sindhudurg: { lat: 16.1158, lng: 73.6934 },
  raigad: { lat: 18.5158, lng: 73.1822 },
  bhor: { lat: 18.1631, lng: 73.8441 },
  thane: { lat: 19.2183, lng: 72.9781 },
  palghar: { lat: 19.6967, lng: 72.7655 },
  ahmednagar: { lat: 19.0948, lng: 74.7480 },
  jalgaon: { lat: 21.0077, lng: 75.5626 },
  dhule: { lat: 20.9042, lng: 74.7749 },
  nandurbar: { lat: 21.3732, lng: 74.2404 },
  beed: { lat: 18.9891, lng: 75.7601 },
  latur: { lat: 18.4088, lng: 76.5604 },
  osmanabad: { lat: 18.1856, lng: 76.0419 },
  dharashiv: { lat: 18.1856, lng: 76.0419 },
  nanded: { lat: 19.1383, lng: 77.3210 },
  parbhani: { lat: 19.2686, lng: 76.7745 },
  hingoli: { lat: 19.7196, lng: 77.1477 },
  jalna: { lat: 19.8410, lng: 75.8864 },
  buldhana: { lat: 20.5312, lng: 76.1844 },
  akola: { lat: 20.7002, lng: 77.0082 },
  washim: { lat: 20.1098, lng: 77.1352 },
  amravati: { lat: 20.9374, lng: 77.7796 },
  yavatmal: { lat: 20.3888, lng: 78.1204 },
  wardha: { lat: 20.7453, lng: 78.6022 },
  chandrapur: { lat: 19.9615, lng: 79.2961 },
  bhandara: { lat: 21.1714, lng: 79.6544 },
  gondia: { lat: 21.4624, lng: 80.1961 },
  gadchiroli: { lat: 20.1809, lng: 79.9984 },
  odisha: { lat: 20.5937, lng: 78.9629 },
  puri: { lat: 19.8135, lng: 85.8312 },
  delhi: { lat: 28.6139, lng: 77.2090 }
};

const getAlertCoords = (alert) => {
  if (alert.latitude && alert.longitude && Math.abs(alert.latitude) > 0.1) {
    return { lat: alert.latitude, lng: alert.longitude };
  }
  const locStr = (alert.location || alert.region || '').toLowerCase();
  for (const [key, coords] of Object.entries(DISTRICT_COORDS)) {
    if (locStr.includes(key)) {
      return coords;
    }
  }
  return { lat: 18.5204, lng: 73.8567 }; // Default Pune
};

// ============================================================================
// 2. 3D WEATHER GRAPHIC ILLUSTRATIONS
// ============================================================================
const RainCloudArt = () => (
  <div className="relative w-16 h-14 sm:w-20 sm:h-16 flex items-center justify-center select-none pointer-events-none">
    <div className="relative z-10 filter drop-shadow-md">
      <svg className="w-14 h-11 sm:w-16 sm:h-12" viewBox="0 0 80 56" fill="none">
        <path
          d="M60 42H20C11.16 42 4 34.84 4 26C4 17.65 10.38 10.8 18.65 10.07C22.12 3.84 28.73 0 36 0C45.36 0 53.27 6.46 55.45 15.22C61.42 16.14 66 21.28 66 27.5C66 35.51 59.51 42 51.5 42H60Z"
          fill="url(#rainCloudGrad)"
        />
        <defs>
          <linearGradient id="rainCloudGrad" x1="10" y1="5" x2="65" y2="45" gradientUnits="userSpaceOnUse">
            <stop stopColor="#94A3B8" />
            <stop offset="0.5" stopColor="#64748B" />
            <stop offset="1" stopColor="#475569" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex justify-center gap-2 mt-1 -ml-2">
        <div className="w-0.5 h-3 bg-blue-500 rounded-full transform -rotate-12 animate-pulse" />
        <div className="w-0.5 h-4 bg-sky-400 rounded-full transform -rotate-12 animate-pulse delay-75" />
        <div className="w-0.5 h-3 bg-blue-500 rounded-full transform -rotate-12 animate-pulse delay-150" />
      </div>
    </div>
  </div>
);

const WindBreezeArt = () => (
  <div className="relative w-16 h-14 sm:w-20 sm:h-16 flex items-center justify-center select-none pointer-events-none">
    <svg className="w-12 h-10 text-sky-500" viewBox="0 0 64 48" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
      <path d="M6 14h36a8 8 0 1 0-8-8" />
      <path d="M2 24h48a7 7 0 1 1-7 7" />
      <path d="M12 34h28a6 6 0 1 0-6-6" />
    </svg>
  </div>
);

const SunArt = () => (
  <div className="relative w-16 h-14 sm:w-20 sm:h-16 flex items-center justify-center select-none pointer-events-none">
    <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-yellow-200 shadow-[0_0_18px_rgba(250,204,21,0.8)] flex items-center justify-center animate-pulse-subtle">
      <Sun className="w-6 h-6 text-amber-900/30" />
    </div>
  </div>
);

const NeuralAgiArt = () => (
  <div className="relative w-16 h-14 sm:w-20 sm:h-16 flex items-center justify-center select-none pointer-events-none">
    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 shadow-[0_0_16px_rgba(168,85,247,0.6)] flex items-center justify-center">
      <Cpu className="w-6 h-6 text-white" />
    </div>
  </div>
);

// ============================================================================
// 3. MINI REAL-TIME LEAFLET INCIDENT RADAR MAP COMPONENT
// ============================================================================
function MiniIncidentMap({ alerts = [], selectedLocation, onSelectAlert }) {
  const mapRef = useRef(null);
  const [radarPath, setRadarPath] = useState(null);

  useEffect(() => {
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then((r) => r.json())
      .then((data) => {
        const host = data.host || 'https://tilecache.rainviewer.com';
        if (data.radar?.past && data.radar.past.length > 0) {
          const latest = data.radar.past[data.radar.past.length - 1];
          setRadarPath(`${host}${latest.path}/256/{z}/{x}/{y}/2/1_1.png`);
        }
      })
      .catch(() => {});
  }, []);

  const center = useMemo(() => {
    if (selectedLocation && selectedLocation !== 'All') {
      const locStr = selectedLocation.toLowerCase();
      for (const [key, coords] of Object.entries(DISTRICT_COORDS)) {
        if (locStr.includes(key)) return [coords.lat, coords.lng];
      }
    }
    return [19.2, 75.5];
  }, [selectedLocation]);

  return (
    <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner z-0">
      <MapContainer
        center={center}
        zoom={selectedLocation !== 'All' ? 8 : 6}
        scrollWheelZoom={false}
        zoomControl={false}
        className="w-full h-full z-0"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        />
        {radarPath && (
          <TileLayer
            url={radarPath}
            opacity={0.65}
            zIndex={250}
          />
        )}
        {alerts.slice(0, 20).map((a) => {
          const coords = getAlertCoords(a);
          const isExtreme = a.rawSeverity === 'extreme';
          const isHigh = a.rawSeverity === 'high';
          const isModerate = a.rawSeverity === 'moderate';
          const color = isExtreme ? '#EF4444' : isHigh ? '#F97316' : isModerate ? '#EAB308' : '#10B981';

          return (
            <React.Fragment key={a.id}>
              <Circle
                center={[coords.lat, coords.lng]}
                radius={isExtreme ? 38000 : isHigh ? 28000 : 20000}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.25,
                  weight: 1.5
                }}
              />
              <Marker
                position={[coords.lat, coords.lng]}
                icon={L.divIcon({
                  className: 'leaflet-alert-mini-pin',
                  html: `
                    <div style="
                      background: ${color};
                      color: #ffffff;
                      width: 24px;
                      height: 24px;
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 11px;
                      font-weight: 900;
                      border: 2px solid #ffffff;
                      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
                      cursor: pointer;
                    ">!</div>
                  `,
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                })}
                eventHandlers={{
                  click: () => onSelectAlert(a)
                }}
              >
                <Popup>
                  <div className="p-1 text-xs">
                    <span className="font-black text-rose-600 uppercase text-[10px] block">{a.severity} Warning</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{a.location}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{a.title}</span>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
      <div className="absolute bottom-2 left-2 z-[400] bg-slate-900/85 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[9px] font-bold text-white pointer-events-none flex items-center gap-1.5 border border-white/10">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span>RainViewer Doppler Radar + Active Incident Epi-centers</span>
      </div>
    </div>
  );
}

// ============================================================================
// 4. MAIN ALERTS PAGE COMPONENT
// ============================================================================
export const AlertsPage = () => {
  const { setCurrentPage, addToast, alerts, refreshAlerts } = useWeather();
  const {
    language,
    t,
    translateAlertTitle,
    translateAlertDescription,
    translateCity,
    formatUntil
  } = useLanguage();

  // Auto-refresh countdown timer state
  const [countdown, setCountdown] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(Date.now());

  // 1-second interval for countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleManualRefresh(false);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = async (userInitiated = true) => {
    try {
      setIsRefreshing(true);
      if (refreshAlerts) {
        await refreshAlerts();
      }
      setLastRefreshedAt(Date.now());
      setCountdown(30);
      if (userInitiated) {
        addToast(
          language === 'mr' ? 'हवामान सूचना थेट अद्ययावत झाल्या!' : 'Real-time alert streams refreshed successfully!',
          'success'
        );
      }
    } catch {
      if (userInitiated) {
        addToast('Alerts stream sync error', 'error');
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Primary Source Channel Filter: 'all' | 'imd' | 'agi' | 'authority'
  const [sourceFilter, setSourceFilter] = useState('all');

  // Normalize alerts dynamically from MongoDB / API
  const normalizedAlerts = useMemo(() => {
    if (!alerts || alerts.length === 0) return [];

    return alerts.map((a, idx) => {
      const isExtreme = a.severity === 'extreme';
      const isHigh = a.severity === 'high';
      const isModerate = a.severity === 'moderate';

      // Keep distinct severities: Extreme (Red), High (Orange), Moderate (Yellow)
      const normSeverity = isExtreme ? 'Severe' : isHigh ? 'High' : isModerate ? 'Moderate' : 'Watch';
      const normSeverityLevel = isExtreme ? 'extreme' : isHigh ? 'high' : isModerate ? 'medium' : 'low';
      const normType = isExtreme || isHigh ? 'warning' : isModerate ? 'watch' : 'information';

      // Detect Source Stream Category
      const sType = (a.sourceType || '').toLowerCase();
      const sText = (a.source || '').toLowerCase();
      let streamCategory = 'imd'; // default

      if (sType === 'agi_analysis' || sText.includes('agi') || sText.includes('neural') || sText.includes('deepnet')) {
        streamCategory = 'agi';
      } else if (
        sType === 'authority_broadcast' ||
        sText.includes('authority') ||
        sText.includes('collector') ||
        sText.includes('disaster') ||
        sText.includes('sdma') ||
        sText.includes('ddma') ||
        sText.includes('irrigation') ||
        sText.includes('fisheries')
      ) {
        streamCategory = 'authority';
      } else {
        streamCategory = 'imd';
      }

      // Graphic Illustration category
      let art = 'rain';
      const tLower = ((a.title || '') + ' ' + (a.type || '')).toLowerCase();
      if (streamCategory === 'agi') {
        art = 'agi';
      } else if (tLower.includes('heat') || tLower.includes('sun')) {
        art = 'sun';
      } else if (tLower.includes('wind') || tLower.includes('squall') || tLower.includes('gale')) {
        art = 'wind';
      } else {
        art = 'rain';
      }

      // Safe date formatting
      const effectiveTime = a.startTime
        ? new Date(a.startTime).toLocaleString([], { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
        : (a.effectiveTime || a.time || 'Today');

      const untilTime = a.endTime
        ? new Date(a.endTime).toLocaleString([], { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
        : (a.untilTime || 'Tomorrow');

      return {
        id: a._id || a.id || `alert-${idx}`,
        title: a.title,
        location: a.location || a.region || 'Maharashtra, India',
        region: a.region || a.location || 'Maharashtra, India',
        type: normType,
        severity: normSeverity,
        severityLevel: normSeverityLevel,
        rawSeverity: a.severity,
        effectiveTime,
        untilTime,
        time: effectiveTime,
        probability: a.probability || (isExtreme ? '95%' : isHigh ? '88%' : isModerate ? '65%' : '40%'),
        source: a.source || 'IMD / WeatherGPT',
        sourceType: a.sourceType || 'official_alert',
        streamCategory,
        description: a.description,
        action: a.action,
        art,
        latitude: a.latitude,
        longitude: a.longitude,
        metadata: a.metadata || {},
        affectedAreas: a.affectedAreas || []
      };
    });
  }, [alerts]);

  // Source Stream Counts
  const imdCount = useMemo(() => normalizedAlerts.filter((a) => a.streamCategory === 'imd').length, [normalizedAlerts]);
  const agiCount = useMemo(() => normalizedAlerts.filter((a) => a.streamCategory === 'agi').length, [normalizedAlerts]);
  const authorityCount = useMemo(() => normalizedAlerts.filter((a) => a.streamCategory === 'authority').length, [normalizedAlerts]);

  // Dynamic streams: active alerts vs recent advisories
  const activeAlertsStream = useMemo(() => {
    return normalizedAlerts.filter((a) => a.rawSeverity !== 'low');
  }, [normalizedAlerts]);

  const recentAlertsStream = useMemo(() => {
    const lows = normalizedAlerts.filter((a) => a.rawSeverity === 'low');
    if (lows.length > 0) return lows;
    return normalizedAlerts.slice(-3);
  }, [normalizedAlerts]);

  // Dynamic severity triage counts
  const immediateDangerCount = useMemo(() => normalizedAlerts.filter((a) => a.rawSeverity === 'extreme').length, [normalizedAlerts]);
  const immediateDangerPlaces = useMemo(() => {
    const list = normalizedAlerts.filter((a) => a.rawSeverity === 'extreme').map((a) => a.location.split(',')[0].trim());
    return list.slice(0, 3).join(', ') || 'None';
  }, [normalizedAlerts]);

  const highRainCount = useMemo(() => normalizedAlerts.filter((a) => a.rawSeverity === 'high').length, [normalizedAlerts]);
  const highRainPlaces = useMemo(() => {
    const list = normalizedAlerts.filter((a) => a.rawSeverity === 'high').map((a) => a.location.split(',')[0].trim());
    return list.slice(0, 3).join(' & ') || 'None';
  }, [normalizedAlerts]);

  const moderateCount = useMemo(() => normalizedAlerts.filter((a) => a.rawSeverity === 'moderate').length, [normalizedAlerts]);
  const moderatePlaces = useMemo(() => {
    const list = normalizedAlerts.filter((a) => a.rawSeverity === 'moderate').map((a) => a.location.split(',')[0].trim());
    return list.slice(0, 3).join(', ') || 'None';
  }, [normalizedAlerts]);

  const lowCount = useMemo(() => normalizedAlerts.filter((a) => a.rawSeverity === 'low').length, [normalizedAlerts]);
  const lowPlaces = useMemo(() => {
    const list = normalizedAlerts.filter((a) => a.rawSeverity === 'low').map((a) => a.location.split(',')[0].trim());
    return list.slice(0, 3).join(', ') || 'None';
  }, [normalizedAlerts]);

  // Tab counts
  const warningCount = useMemo(() => normalizedAlerts.filter((a) => a.type === 'warning').length, [normalizedAlerts]);
  const watchCount = useMemo(() => normalizedAlerts.filter((a) => a.type === 'watch').length, [normalizedAlerts]);
  const infoCount = useMemo(() => normalizedAlerts.filter((a) => a.type === 'information').length, [normalizedAlerts]);

  // Available locations for filter
  const availableLocations = useMemo(() => {
    const locSet = new Set();
    normalizedAlerts.forEach((a) => {
      const city = a.location.split(',')[0].trim();
      if (city) locSet.add(city);
    });
    return Array.from(locSet);
  }, [normalizedAlerts]);

  // Active Tab state: 'all' | 'active' | 'warnings' | 'watch' | 'information'
  const [activeTab, setActiveTab] = useState('all');

  // Hazard Filter Pill state: 'all' | 'rain' | 'sun' | 'wind'
  const [hazardCategoryFilter, setHazardCategoryFilter] = useState('all');

  // Search input filter for district or keyword
  const [searchQuery, setSearchQuery] = useState('');

  // Filters State
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [severityFilters, setSeverityFilters] = useState({
    extreme: true,
    high: true,
    moderate: true,
    low: true
  });

  // Modal State for Alert Details
  const [selectedAlertForDetails, setSelectedAlertForDetails] = useState(null);

  // Subscriptions Toggle state for locations
  const [subscriptions, setSubscriptions] = useState({});

  // Live IMD District Warning Search State
  const [imdDistrictQuery, setImdDistrictQuery] = useState('');
  const [imdDistrictResult, setImdDistrictResult] = useState(null);

  // Audio Speech Synthesis state
  const [speakingAlertId, setSpeakingAlertId] = useState(null);

  // Farmer Defense Checklist state stored in localStorage
  const [checkedFarmTasks, setCheckedFarmTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('farm_defense_checklist') || '{}');
    } catch {
      return {};
    }
  });

  // Expand/collapse state for Farm Defense Protocol on each card
  const [expandedChecklists, setExpandedChecklists] = useState({});

  // Safety SOPs Tab State - Default to Flood
  const [activeSopTab, setActiveSopTab] = useState('flood');

  // Community Hazard Report Modal & list state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [communityReports, setCommunityReports] = useState(() => {
    try {
      const saved = localStorage.getItem('weather_community_reports');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'rep-1',
        type: 'Waterlogging in Field',
        village: 'Daund (Pune)',
        time: '35 mins ago',
        severity: 'Moderate',
        description: 'Over 45mm downpour recorded. Soil saturated; drainage channels cleared.'
      },
      {
        id: 'rep-2',
        type: 'Severe Hailstorm',
        village: 'Junnar (Pune)',
        time: '2 hours ago',
        severity: 'Critical',
        description: 'Grape and tomato trellis shade nets damaged. Seeking crop loss survey.'
      },
      {
        id: 'rep-3',
        type: 'Dam Release Water Influx',
        village: 'Haveli / Deccan (Pune)',
        time: '10 mins ago',
        severity: 'High',
        description: 'Mutha riverbed causeways submerged after Khadakwasla gate release.'
      }
    ];
  });

  const [newReport, setNewReport] = useState({
    type: 'Waterlogging in Field',
    village: '',
    severity: 'Moderate',
    description: ''
  });

  // Dynamic Farm Defense Protocols per hazard & source
  const getFarmDefenseProtocol = (alert) => {
    const tLower = ((alert.title || '') + ' ' + (alert.type || '') + ' ' + (alert.art || '')).toLowerCase();

    if (alert.streamCategory === 'agi' && tLower.includes('mildew')) {
      return [
        { id: 0, text: language === 'mr' ? 'पानांवरील ओलावा सुकताच सिस्टेमिक कॉपर किंवा सायमॉक्सॅनिल फवारणी घ्या' : 'Apply systemic copper-based or cymoxanil/mancozeb spray once canopy dries' },
        { id: 1, text: language === 'mr' ? 'द्राक्ष बागेत हवा खेळती राहण्यासाठी खालच्या फांद्यांची विरळणी करा' : 'Prune lower skirts and water shoots to enhance vine canopy ventilation' },
        { id: 2, text: language === 'mr' ? 'नत्रयुक्त (युरिया) खतांचा वापर थांबवून पोटॅशियम खते द्या' : 'Suspend nitrogenous foliar applications; apply potassium phosphite' },
        { id: 3, text: language === 'mr' ? 'तपशीलवार कीड मार्गदर्शनासाठी कृषी विज्ञान केंद्राशी संपर्क साधा' : 'Consult local Krishi Vigyan Kendra (KVK) agro-meteorologist' }
      ];
    } else if (alert.streamCategory === 'authority' && tLower.includes('dam')) {
      return [
        { id: 0, text: language === 'mr' ? 'नदीपात्रातील मोटार पंप व केबल्स सुरक्षित उंच जागेवर हलवा' : 'Move electrical submersible pumps and motors to higher plinths' },
        { id: 1, text: language === 'mr' ? 'नदीकाठच्या शेतातील जनावरे त्वरित सुरक्षित गोठ्यात बांधा' : 'Evacuate farm livestock from riverbank sheds to high-elevation corrals' },
        { id: 2, text: language === 'mr' ? 'काठावरील जलमार्गांवरून वाहतूक करणे पूर्णपणे टाळा' : 'Strictly halt tractor and vehicular movements across submerged causeways' },
        { id: 3, text: language === 'mr' ? 'आपत्कालीन संपर्कासाठी तालुका आपत्ती नियंत्रण कक्षाशी संपर्क ठेवा (१०७७)' : 'Keep Taluka Disaster Control Room (1077) on emergency speed dial' }
      ];
    } else if (tLower.includes('rain') || tLower.includes('flood') || tLower.includes('thunder') || alert.art === 'rain') {
      return [
        { id: 0, text: language === 'mr' ? 'कपाशी, सोयाबीन व भाजीपाला पिकांमधील पाण्याचा निचरा (Drainage) मोकळा करा' : 'Clear surface drainage trenches in Cotton, Soybean & Vegetables' },
        { id: 1, text: language === 'mr' ? 'कीटकनाशक व बुरशीनाशक फवारणी तात्काळ पुढे ढकला' : 'Immediately postpone pesticide spraying and foliar fertilization' },
        { id: 2, text: language === 'mr' ? 'काढणी केलेला शेतमाल (कांदा/धान्य) ताडपत्रीने सुरक्षित झाका' : 'Cover harvested crops (onion, grains) with waterproof tarpaulins' },
        { id: 3, text: language === 'mr' ? 'विहिरीच्या मोटार पंपांचे वीज कनेक्शन सुरक्षित बंद करा' : 'Turn off well pump electrical starters to prevent lightning surge' }
      ];
    } else if (tLower.includes('heat') || tLower.includes('sun') || alert.art === 'sun') {
      return [
        { id: 0, text: language === 'mr' ? 'पिकांना सकाळी किंवा संध्याकाळी हलके व वारंवार पाणी द्या' : 'Provide light, frequent irrigation early morning or late evening' },
        { id: 1, text: language === 'mr' ? 'बागेमध्ये व भाजीपाल्यात पालापाचोळ्याचे आच्छादन (Mulching) करा' : 'Apply organic straw mulching to conserve root-zone soil moisture' },
        { id: 2, text: language === 'mr' ? 'जनावरांना सावलीच्या ठिकाणी बांधा व मुबलक थंड पाणी व क्षारमिश्रण द्या' : 'Shelter livestock in ventilated sheds with ample electrolyte water' },
        { id: 3, text: language === 'mr' ? 'दुपारी १२ ते ३ दरम्यान शेतातील कष्टाची कामे टाळा' : 'Avoid heavy manual field operations between 12:00 PM and 3:00 PM' }
      ];
    } else if (tLower.includes('wind') || alert.art === 'wind') {
      return [
        { id: 0, text: language === 'mr' ? 'केळी व पपई पिकांना बांबू अथवा दोरीचा आधार (Staking) द्या' : 'Provide bamboo/wire staking support to Banana and Papaya orchards' },
        { id: 1, text: language === 'mr' ? 'शेडनेट व पॉलीहाऊसचे प्लॅस्टिक पडदे सुरक्षित घट्ट बांधा' : 'Fasten greenhouse shade nets and plastic covers securely against gale' },
        { id: 2, text: language === 'mr' ? 'मोठ्या झाडांखाली वाहने किंवा जनावरे बांधणे टाळा' : 'Do not tether farm animals or park equipment under tall old trees' },
        { id: 3, text: language === 'mr' ? 'विजेच्या सैल तारा व ट्रान्सफॉर्मरपासून सुरक्षित अंतरावर राहा' : 'Stay clear of loose overhead transmission lines and transformers' }
      ];
    } else {
      return [
        { id: 0, text: language === 'mr' ? 'हवामान अपडेट्ससाठी ग्रामपंचायतीच्या संपर्कात राहा' : 'Monitor local IMD and Gram Panchayat weather broadcasts' },
        { id: 1, text: language === 'mr' ? 'पिकांचे नुकसान झाल्यास ७२ तासांत विमा कंपनीला सूचित करा (१४४४७)' : 'Intimate crop damage within 72 hrs to PMFBY insurance (14447)' },
        { id: 2, text: language === 'mr' ? 'आपत्कालीन संपर्कासाठी फोन व बॅटरी बॅकअप चार्ज ठेवा' : 'Keep emergency mobile devices charged with backup power' }
      ];
    }
  };

  const toggleFarmTask = (alertId, taskId) => {
    const key = `${alertId}-${taskId}`;
    setCheckedFarmTasks((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('farm_defense_checklist', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Toggle speech synthesis reading for an alert card
  const handleToggleSpeech = (alert) => {
    if (!window.speechSynthesis) {
      addToast('Speech synthesis not available in this browser', 'warning');
      return;
    }

    if (speakingAlertId === alert.id) {
      window.speechSynthesis.cancel();
      setSpeakingAlertId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const isMr = language === 'mr';
    const sourceLabel =
      alert.streamCategory === 'agi'
        ? (isMr ? 'वेदरजीपीटी एआय विश्लेषण' : 'WeatherGPT AGI Analysis')
        : alert.streamCategory === 'authority'
        ? (isMr ? 'जिल्हा आपत्ती व्यवस्थापन आदेश' : 'District Disaster Authority Order')
        : (isMr ? 'भारतीय हवामान विभाग थेट इशारा' : 'India Meteorological Department Official Warning');

    const textToSpeak = isMr
      ? `${sourceLabel}! ${alert.severity === 'Severe' ? 'अतिदक्षतेचा इशारा' : alert.severity === 'High' ? 'तीव्र इशारा' : 'दक्षतेचा इशारा'}! ${alert.location} साठी: ${translateAlertTitle(alert.title)}. ${translateAlertDescription(alert.description)}. सुरक्षितता सल्ला: ${alert.action || 'कृपया योग्य ती काळजी घ्या.'}`
      : `${sourceLabel}. ${alert.severity} alert for ${alert.location}: ${alert.title}. ${alert.description || ''}. Safety instruction: ${alert.action || 'Please take precautions.'}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = isMr ? 'mr-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingAlertId(null);
    utterance.onerror = () => setSpeakingAlertId(null);

    setSpeakingAlertId(alert.id);
    window.speechSynthesis.speak(utterance);
    addToast(language === 'mr' ? 'ऑडिओ बुलेटिन सुरू झाले...' : 'Playing voice advisory bulletin...', 'info');
  };

  // Share alert formatted bulletin to WhatsApp
  const handleShareWhatsApp = (alert) => {
    const headerPrefix =
      alert.streamCategory === 'agi'
        ? '🧠 *WEATHERGPT AGI METEOROLOGICAL ANALYSIS* 🧠'
        : alert.streamCategory === 'authority'
        ? '🛡️ *OFFICIAL DISASTER AUTHORITY DIRECTIVE* 🛡️'
        : '🏛️ *IMD OFFICIAL WEATHER BULLETIN* 🏛️';

    const text =
      `${headerPrefix}\n\n` +
      `⚠️ *Severity:* ${alert.severity.toUpperCase()} ALERT\n` +
      `📍 *Location:* ${alert.location}\n` +
      `⚡ *Advisory:* ${alert.title}\n` +
      `🕒 *Valid Until:* ${alert.untilTime}\n` +
      `🔬 *Source:* ${alert.source}\n\n` +
      `📋 *Key Instructions:*\n${alert.action || alert.description}\n\n` +
      `📞 *Kisan Helpline:* 1800-180-1551 (Toll-Free)\n` +
      `📞 *Disaster Cell:* 1070 / 1077\n` +
      `🌐 *WeatherGPT Real-Time Decision Support*`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    addToast('Opened WhatsApp bulletin share', 'success');
  };

  const handleCopyBulletin = (alert) => {
    const text = `🚨 [${alert.streamCategory.toUpperCase()}] ${alert.title} in ${alert.location}. Severity: ${alert.severity}. Valid until: ${alert.untilTime}. Action: ${alert.action || alert.description}. Kisan Helpline: 1800-180-1551.`;
    navigator.clipboard.writeText(text);
    addToast('Emergency bulletin copied to clipboard!', 'success');
  };

  // Submit community hazard report
  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (!newReport.village.trim()) {
      addToast('Please enter your village or taluka name', 'warning');
      return;
    }

    const created = {
      id: `rep-${Date.now()}`,
      type: newReport.type,
      village: newReport.village.trim(),
      time: 'Just now',
      severity: newReport.severity,
      description: newReport.description.trim() || 'Reported by local farmer.'
    };

    const updated = [created, ...communityReports];
    setCommunityReports(updated);
    try {
      localStorage.setItem('weather_community_reports', JSON.stringify(updated));
    } catch {}

    setIsReportModalOpen(false);
    setNewReport({ type: 'Waterlogging in Field', village: '', severity: 'Moderate', description: '' });
    addToast(language === 'mr' ? 'स्थानिक संकट नोंद यशस्वीरित्या पाठवली!' : 'Community hazard report submitted successfully!', 'success');
  };

  const fetchImdDistrict = async (name) => {
    if (!name?.trim()) return;
    try {
      const data = await api.imdDistrictWarning(name);
      setImdDistrictResult(data);
      addToast(`${t('search')}: ${name}`, 'info');
    } catch {
      setImdDistrictResult({
        district: name,
        warningLevel: 'Orange',
        hazard: 'Heavy Rain & Convective Squall Advisory',
        action: 'Be Prepared. Avoid unnecessary travel in low-lying sections.',
        advice: 'Farmers advise checking field drainage outlets.',
        issuedTime: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      });
      addToast(`${t('search')}: ${name}`, 'info');
    }
  };

  // Dynamic Filtering Logic
  const filteredActiveAlerts = useMemo(() => {
    return activeAlertsStream.filter((item) => {
      // 1. Source Stream Filter (IMD vs AGI vs Authority)
      if (sourceFilter !== 'all' && item.streamCategory !== sourceFilter) {
        return false;
      }

      // 2. Tab filter
      if (activeTab === 'warnings' && item.type !== 'warning') return false;
      if (activeTab === 'watch' && item.type !== 'watch') return false;
      if (activeTab === 'information' && item.type !== 'information') return false;

      // 3. Hazard Category Pill filter
      if (hazardCategoryFilter === 'rain' && item.art !== 'rain') return false;
      if (hazardCategoryFilter === 'sun' && item.art !== 'sun') return false;
      if (hazardCategoryFilter === 'wind' && item.art !== 'wind') return false;

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          (item.title || '').toLowerCase().includes(q) ||
          (item.location || '').toLowerCase().includes(q) ||
          (item.description || '').toLowerCase().includes(q) ||
          (item.source || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      // 5. Location dropdown filter
      if (selectedLocation !== 'All' && !item.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
        return false;
      }

      // 6. Severity checkbox filter
      if (item.rawSeverity === 'extreme' && !severityFilters.extreme) return false;
      if (item.rawSeverity === 'high' && !severityFilters.high) return false;
      if (item.rawSeverity === 'moderate' && !severityFilters.moderate) return false;
      if (item.rawSeverity === 'low' && !severityFilters.low) return false;

      return true;
    });
  }, [activeAlertsStream, sourceFilter, activeTab, hazardCategoryFilter, searchQuery, selectedLocation, severityFilters]);

  const handleAlertDetails = async (alert) => {
    setSelectedAlertForDetails(alert);
    if (!/^[a-f\d]{24}$/i.test(String(alert.id))) return;

    try {
      const detail = await api.getAlertById(alert.id);
      setSelectedAlertForDetails((current) => ({
        ...current,
        description: detail.description || current.description,
        effectiveTime: detail.startTime
          ? new Date(detail.startTime).toLocaleString([], {
              dateStyle: 'medium',
              timeStyle: 'short'
            })
          : current.effectiveTime,
        untilTime: detail.endTime
          ? new Date(detail.endTime).toLocaleString([], {
              dateStyle: 'medium',
              timeStyle: 'short'
            })
          : current.untilTime,
        source: detail.source || current.source,
        metadata: detail.metadata || current.metadata,
        affectedAreas: detail.affectedAreas || current.affectedAreas
      }));
    } catch {}
  };

  const handleClearFilters = () => {
    setSelectedLocation('All');
    setActiveTab('all');
    setSourceFilter('all');
    setHazardCategoryFilter('all');
    setSearchQuery('');
    setSeverityFilters({ extreme: true, high: true, moderate: true, low: true });
    addToast('Filters reset to default', 'info');
  };

  const handleSubscriptionToggle = (cityKey) => {
    setSubscriptions((prev) => {
      const updated = { ...prev, [cityKey]: !prev[cityKey] };
      addToast(`${cityKey.toUpperCase()} alert subscription ${updated[cityKey] ? 'enabled' : 'disabled'}`, 'info');
      return updated;
    });
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Alert Details Modal */}
      <AlertDetailsModal
        alert={selectedAlertForDetails}
        isOpen={Boolean(selectedAlertForDetails)}
        onClose={() => setSelectedAlertForDetails(null)}
        onShare={() => addToast('Alert advisory link copied!', 'success')}
      />

      {/* Community Hazard Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#151F32] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {language === 'mr' ? 'स्थानिक संकट नोंदवा' : 'Report Local Weather Hazard'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Crowdsourced farmer advisory warning</p>
                </div>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'mr' ? 'संकटाचा प्रकार' : 'Hazard Type'}
                </label>
                <select
                  value={newReport.type}
                  onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Waterlogging in Field">🌧️ Waterlogging in Field (शेतात पाणी साचले)</option>
                  <option value="Severe Hailstorm">🧊 Severe Hailstorm (गारपीट)</option>
                  <option value="Tree / Pole Fallen on Road">🌳 Tree / Pole Fallen on Road (झाड/खांब पडले)</option>
                  <option value="Crop Lodging / Flat">🌾 Crop Lodging / Flattened (पीक आडवे झाले)</option>
                  <option value="Lightning Hazard">⚡ Lightning Activity (वीज पडल्याची घटना)</option>
                  <option value="Dam Release Influx">🌊 Dam Release River Surge (नदीला पूर आला)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'mr' ? 'गाव / तालुका' : 'Village / Taluka Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Junnar, Baramati, Niphad, Daund..."
                  value={newReport.village}
                  onChange={(e) => setNewReport({ ...newReport, village: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'mr' ? 'तीव्रता' : 'Severity Level'}
                </label>
                <div className="flex gap-2">
                  {['Moderate', 'Critical'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewReport({ ...newReport, severity: s })}
                      className={`flex-1 py-1.5 rounded-xl font-bold border transition ${
                        newReport.severity === s
                          ? s === 'Critical'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-amber-500 text-white border-amber-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'mr' ? 'तपशील / सल्ला' : 'Notes / Field Observations'}
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional details for neighboring farmers..."
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-md transition cursor-pointer"
                >
                  {language === 'mr' ? 'नोंद सादर करा' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          TOP SECTION: Title, Real-Time Status, Refresh Button, Helplines Tray
          ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t('alerts')}
              </h1>
              <ShieldCheck className="w-6 h-6 text-blue-600 fill-blue-50" />
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>LIVE FEED</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'mr'
                ? 'अधिकृत आयएमडी सूचना, वेदरजीपीटी एआय विश्लेषण आणि जिल्हा आपत्ती प्रशासन आदेश'
                : 'Live IMD official warnings, WeatherGPT AGI intelligence & district authority disaster directives'}
            </p>
          </div>

          {/* Right Top Controls: Auto-update pill, Refresh button, Report hazard */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Countdown & Refresh Button */}
            <button
              onClick={() => handleManualRefresh(true)}
              disabled={isRefreshing}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-xs flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              title="Refresh live alerts from backend and radar feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : `Refresh (${countdown}s)`}</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? 'स्थानिक संकट कळवा' : 'Report Local Hazard'}</span>
            </button>

            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center gap-1.5 border border-rose-200 dark:border-rose-900/60">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
              <span>{activeAlertsStream.length} {t('activeAlerts')}</span>
            </span>
          </div>
        </div>

        {/* 24/7 Verified Emergency Helplines Quick-Dial Tray */}
        <div className="bg-white dark:bg-[#151F32] p-3 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {language === 'mr' ? 'तातडीचे आपत्कालीन संपर्क (२४/७ टोल-फ्री)' : 'Verified Emergency Contacts (24x7 Toll-Free)'}
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Active Govt Hotlines
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <a
              href="tel:18001801551"
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/60 dark:border-slate-700/60 transition flex items-center justify-between group cursor-pointer"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-400 block truncate">Kisan Call Center</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 group-hover:underline">1800-180-1551</span>
              </div>
              <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1" />
            </a>

            <a
              href="tel:1070"
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/60 dark:border-slate-700/60 transition flex items-center justify-between group cursor-pointer"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-400 block truncate">Disaster Relief (NDRF)</span>
                <span className="text-xs font-black text-blue-600 dark:text-blue-400 group-hover:underline">1070 / 1077</span>
              </div>
              <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0 ml-1" />
            </a>

            <a
              href="tel:14447"
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200/60 dark:border-slate-700/60 transition flex items-center justify-between group cursor-pointer"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-400 block truncate">Crop Insurance (72h)</span>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 group-hover:underline">14447 (PMFBY)</span>
              </div>
              <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1" />
            </a>

            <a
              href="tel:112"
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200/60 dark:border-slate-700/60 transition flex items-center justify-between group cursor-pointer"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-400 block truncate">National Emergency</span>
                <span className="text-xs font-black text-rose-600 dark:text-rose-400 group-hover:underline">112 (Police/Fire)</span>
              </div>
              <Phone className="w-3.5 h-3.5 text-rose-500 shrink-0 ml-1" />
            </a>
          </div>
        </div>

        {/* Live Broadcast Banner & Spoken Audio Announcer */}
        <EmergencyBroadcastBanner
          onSelectDistrict={(dist) => {
            setSelectedLocation(dist.nameEn);
            fetchImdDistrict(dist.nameEn);
          }}
        />

        {/* =====================================================================
            PRIMARY SOURCE CATEGORY SWITCHER (IMD vs AGI vs Authority)
            ===================================================================== */}
        <div className="p-2 rounded-2xl bg-slate-100 dark:bg-[#151F32] border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-xs">
          <button
            onClick={() => setSourceFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              sourceFilter === 'all'
                ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'सर्व थेट प्रवाह' : 'All Live Streams'}</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-black/30">
              {normalizedAlerts.length}
            </span>
          </button>

          <button
            onClick={() => setSourceFilter('imd')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              sourceFilter === 'imd'
                ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-sky-500" />
            <span>{language === 'mr' ? '🏛️ आयएमडी हवामान सूचना' : '🏛️ IMD Official Warnings'}</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/15 text-sky-600 dark:text-sky-300">
              {imdCount}
            </span>
          </button>

          <button
            onClick={() => setSourceFilter('agi')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              sourceFilter === 'agi'
                ? 'bg-white dark:bg-purple-600 text-purple-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-purple-500" />
            <span>{language === 'mr' ? '🧠 वेदरजीपीटी एआय विश्लेषण' : '🧠 WeatherGPT AGI Analysis'}</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-300">
              {agiCount}
            </span>
          </button>

          <button
            onClick={() => setSourceFilter('authority')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              sourceFilter === 'authority'
                ? 'bg-white dark:bg-amber-600 text-amber-700 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'mr' ? '🛡️ प्रशासन व धरण विसर्ग आदेश' : '🛡️ Authority Operations (Dam/SDMA)'}</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
              {authorityCount}
            </span>
          </button>
        </div>

        {/* 4 Severity Triage Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400">{t('immediateDanger')} (Red)</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </div>
            <p className="text-xl font-black text-rose-600 dark:text-rose-300 mt-1">{immediateDangerCount}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{immediateDangerPlaces}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-700 dark:text-orange-400">{t('heavyRainfall')} (Orange)</span>
              <span className="w-2 h-2 rounded-full bg-orange-500" />
            </div>
            <p className="text-xl font-black text-orange-600 dark:text-orange-300 mt-1">{highRainCount}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{highRainPlaces}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-400">{t('heatwaveAdvisory')} (Yellow)</span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <p className="text-xl font-black text-amber-700 dark:text-amber-300 mt-1">{moderateCount}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{moderatePlaces}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{t('safeAreas')} (Normal)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-300 mt-1">{lowCount}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{lowPlaces}</p>
          </div>
        </div>

        {/* Quick Hazard Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-xs font-black text-slate-500 dark:text-slate-400 shrink-0 mr-1">
            {language === 'mr' ? 'संकट प्रकार:' : 'Hazard:'}
          </span>
          {[
            { id: 'all', label: 'All Hazards' },
            { id: 'rain', label: '🌧️ Heavy Rain & Floods' },
            { id: 'sun', label: '☀️ Heatwave & Thermal Stress' },
            { id: 'wind', label: '💨 Gale Wind & Squall' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setHazardCategoryFilter(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                hazardCategoryFilter === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Filter Tabs: All / Active / Warnings / Watch / Information */}
        <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t('allAlerts')}
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'active'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>{t('active')}</span>
            <span className="w-4.5 h-4.5 rounded-full bg-[#EF4444] text-white text-[10px] flex items-center justify-center font-bold">
              {activeAlertsStream.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('warnings')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'warnings'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>{t('warnings')}</span>
            <span className="w-4.5 h-4.5 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-bold">
              {warningCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('watch')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'watch'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>{t('watch')}</span>
            <span className="w-4.5 h-4.5 rounded-full bg-[#EAB308] text-white text-[10px] flex items-center justify-center font-bold">
              {watchCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('information')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'information'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>{t('information')}</span>
            <span className="w-4.5 h-4.5 rounded-full bg-[#0EA5E9] text-white text-[10px] flex items-center justify-center font-bold">
              {infoCount}
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAIN 2-COLUMN LAYOUT: Alerts Stream & Protocols (8) + Filters & Mini Map (4)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =====================================================================
            LEFT COLUMN (Span 8): Active Alerts, Farm Defense Checklist, SOPs
            ===================================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* IMD Official Warning & District Nowcast Search Banner */}
          <div className="p-5 rounded-3xl bg-blue-50/70 dark:bg-gradient-to-r dark:from-slate-900 dark:via-blue-950/60 dark:to-slate-900 border border-blue-200 dark:border-blue-500/30 shadow-xs dark:shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-500 dark:text-rose-400 flex items-center justify-center">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>{t('imdOfficialWarning')}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30">
                      {t('liveNowcast')}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{t('imdMinistrySubtitle')}</p>
                </div>
              </div>

              {/* District Search Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={t('searchDistrict')}
                  value={imdDistrictQuery}
                  onChange={(e) => setImdDistrictQuery(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500 w-40 sm:w-48"
                />
                <button
                  onClick={() => fetchImdDistrict(imdDistrictQuery)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  {t('search')}
                </button>
              </div>
            </div>

            {/* Live District Warning Result Card */}
            {imdDistrictResult && (
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  imdDistrictResult.warningLevel === 'Red'
                    ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                    : imdDistrictResult.warningLevel === 'Orange'
                    ? 'bg-orange-950/40 border-orange-500/40 text-orange-200'
                    : imdDistrictResult.warningLevel === 'Yellow'
                    ? 'bg-yellow-950/40 border-yellow-500/40 text-yellow-200'
                    : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      {imdDistrictResult.district}, {imdDistrictResult.state || 'Maharashtra'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-black/30 border border-current">
                      {imdDistrictResult.warningLevel} Alert ({imdDistrictResult.action})
                    </span>
                  </div>
                  <p className="text-xs mt-1 opacity-90">
                    {imdDistrictResult.hazard} — {imdDistrictResult.advice}
                  </p>
                </div>

                <span className="text-[11px] opacity-75 whitespace-nowrap shrink-0">
                  Valid: {imdDistrictResult.validTo || 'Next 24h'}
                </span>
              </div>
            )}
          </div>

          {/* Active Alerts Subheading with Search bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>
                {sourceFilter === 'imd'
                  ? '🏛️ IMD Official Alerts'
                  : sourceFilter === 'agi'
                  ? '🧠 WeatherGPT AGI Analysis'
                  : sourceFilter === 'authority'
                  ? '🛡️ Authority Operations & Directives'
                  : t('activeAlerts')}
              </span>
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                ({filteredActiveAlerts.length})
              </span>
            </h2>

            {/* Keyword Search Filter */}
            <input
              type="text"
              placeholder="Filter by district, hazard or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>

          {/* Active Alert Cards Stream */}
          <div className="space-y-4">
            {filteredActiveAlerts.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No active alerts match current criteria</h3>
                <p className="text-xs text-slate-400">All regions under this category are currently safe and monitored.</p>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold mt-2 cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredActiveAlerts.map((alert) => {
                const isExtreme = alert.rawSeverity === 'extreme';
                const isHigh = alert.rawSeverity === 'high';
                const isModerate = alert.rawSeverity === 'moderate';
                const isSpeaking = speakingAlertId === alert.id;
                const isChecklistOpen = expandedChecklists[alert.id];
                const farmProtocols = getFarmDefenseProtocol(alert);

                // Calculate farm readiness percentage
                const completedCount = farmProtocols.filter((p) => checkedFarmTasks[`${alert.id}-${p.id}`]).length;
                const readinessPct = Math.round((completedCount / farmProtocols.length) * 100);

                return (
                  <div
                    key={alert.id}
                    className={`rounded-3xl p-5 sm:p-6 transition shadow-xs border ${
                      isExtreme
                        ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                        : isHigh
                        ? 'bg-orange-50/70 dark:bg-orange-950/20 border-orange-300 dark:border-orange-900/60'
                        : isModerate
                        ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60'
                        : 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/60'
                    }`}
                  >
                    {/* Source Stream Pill & Verification Seal */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/5 dark:border-white/10 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {alert.streamCategory === 'agi' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-purple-600" />
                            <span>🧠 WeatherGPT AGI Analysis</span>
                          </span>
                        ) : alert.streamCategory === 'authority' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-amber-600" />
                            <span>🛡️ District Authority Order</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                            <Landmark className="w-3.5 h-3.5 text-blue-600" />
                            <span>🏛️ Official IMD Warning</span>
                          </span>
                        )}

                        {/* Model Confidence or Order No */}
                        {alert.metadata?.confidence && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                            ⚡ {alert.metadata.confidence} Confidence
                          </span>
                        )}
                        {alert.metadata?.orderNo && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                            Gazette: {alert.metadata.orderNo}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-bold text-slate-400">
                        {alert.source}
                      </span>
                    </div>

                    {/* Main Header: Icon, Title, Timestamps, 3D Art */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div className="shrink-0 mt-0.5">
                          <AlertTriangle
                            className={`w-7 h-7 ${
                              isExtreme
                                ? 'text-rose-600 fill-rose-600/20'
                                : isHigh
                                ? 'text-orange-500 fill-orange-500/20'
                                : isModerate
                                ? 'text-amber-500 fill-amber-500/20'
                                : 'text-emerald-500 fill-emerald-500/20'
                            }`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              className={`text-base sm:text-lg font-black tracking-tight ${
                                isExtreme
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : isHigh
                                  ? 'text-orange-600 dark:text-orange-400'
                                  : isModerate
                                  ? 'text-amber-700 dark:text-amber-400'
                                  : 'text-emerald-700 dark:text-emerald-400'
                              }`}
                            >
                              {translateAlertTitle(alert.title)}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white ${
                              isExtreme
                                ? 'bg-rose-600'
                                : isHigh
                                ? 'bg-orange-500'
                                : isModerate
                                ? 'bg-amber-500'
                                : 'bg-emerald-600'
                            }`}>
                              {alert.severity}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-blue-500" />
                            <span>{alert.location}</span>
                          </p>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {alert.effectiveTime}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {formatUntil(alert.untilTime)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right 3D Art Illustration */}
                      <div className="hidden sm:block shrink-0">
                        {alert.art === 'agi' && <NeuralAgiArt />}
                        {alert.art === 'rain' && <RainCloudArt />}
                        {alert.art === 'wind' && <WindBreezeArt />}
                        {alert.art === 'sun' && <SunArt />}
                      </div>
                    </div>

                    {/* Description Paragraph */}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-3.5">
                      {translateAlertDescription(alert.description)}
                    </p>

                    {/* Interactive Farmer Defense & Safety Checklist Section */}
                    <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedChecklists((prev) => ({
                              ...prev,
                              [alert.id]: !prev[alert.id]
                            }))
                          }
                          className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200 hover:text-blue-600 cursor-pointer"
                        >
                          <ListChecks className="w-4 h-4 text-emerald-600" />
                          <span>
                            {language === 'mr' ? '🌾 शेतकरी सुरक्षा कृती आराखडा (Farm Defense)' : '🌾 Farm Defense Action Checklist'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-extrabold">
                            {completedCount}/{farmProtocols.length} Done ({readinessPct}%)
                          </span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isChecklistOpen ? 'rotate-180' : ''}`}
                          />
                        </button>

                        <div className="w-24 sm:w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${readinessPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Expandable Checklist Items */}
                      {isChecklistOpen && (
                        <div className="p-3 bg-white/70 dark:bg-slate-900/60 rounded-2xl border border-black/5 dark:border-slate-800 space-y-2 animate-fadeIn">
                          {farmProtocols.map((p) => {
                            const isChecked = Boolean(checkedFarmTasks[`${alert.id}-${p.id}`]);
                            return (
                              <label
                                key={p.id}
                                className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer select-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleFarmTask(alert.id, p.id)}
                                  className="mt-0.5 rounded-sm accent-emerald-600 w-3.5 h-3.5 cursor-pointer"
                                />
                                <span className={isChecked ? 'line-through opacity-60' : ''}>
                                  {p.text}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Toolbar: Audio, WhatsApp Share, Copy, View Details */}
                    <div className="flex flex-wrap items-center justify-between pt-4 mt-4 border-t border-black/5 dark:border-white/5 gap-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* 1-Click Audio Speech Synthesis Readout */}
                        <button
                          type="button"
                          onClick={() => handleToggleSpeech(alert)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                            isSpeaking
                              ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title="Read advisory aloud in local voice"
                        >
                          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-blue-500" />}
                          <span>{isSpeaking ? (language === 'mr' ? 'थांबवा' : 'Stop') : (language === 'mr' ? 'ऐका (Audio)' : 'Listen')}</span>
                        </button>

                        {/* WhatsApp Village Share */}
                        <button
                          type="button"
                          onClick={() => handleShareWhatsApp(alert)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/30 transition flex items-center gap-1.5 cursor-pointer"
                          title="Share to WhatsApp Village Group"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>

                        {/* Copy text bulletin */}
                        <button
                          type="button"
                          onClick={() => handleCopyBulletin(alert)}
                          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer"
                          title="Copy text bulletin"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* View Details Button */}
                      <button
                        onClick={() => handleAlertDetails(alert)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer border ${
                          isExtreme
                            ? 'border-rose-300 text-rose-600 hover:bg-rose-100/60 bg-white dark:bg-slate-900'
                            : isHigh
                            ? 'border-orange-300 text-orange-600 hover:bg-orange-100/60 bg-white dark:bg-slate-900'
                            : isModerate
                            ? 'border-amber-300 text-amber-700 hover:bg-amber-100/60 bg-white dark:bg-slate-900'
                            : 'border-emerald-300 text-emerald-700 hover:bg-emerald-100/60 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <span>{t('viewDetails')}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Disaster Safety Standard Operating Procedures (SOPs) Accordion */}
          <div className="bg-white dark:bg-[#151F32] p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {language === 'mr' ? 'आपत्ती सुरक्षा मानक कार्यप्रणाली (SOP)' : 'Disaster Safety Operating Procedures (SOP)'}
                </h3>
              </div>
              <button
                onClick={() => setCurrentPage('disaster-sops')}
                className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-3.5 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <span>{language === 'mr' ? '🛡️ सविस्तर सुरक्षा नियमावली उघडा →' : '🛡️ Standard Operating Procedures (SOP) →'}</span>
              </button>
            </div>

            {/* SOP Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'flood', label: language === 'mr' ? '🌊 पूर व धरण विसर्ग' : '🌊 Flood & Dam' },
                { id: 'earthquake', label: language === 'mr' ? '🏢 भूकंप (Drop, Cover)' : '🏢 Earthquake' },
                { id: 'cyclone', label: language === 'mr' ? '🌀 चक्रीवादळ व वारे' : '🌀 Cyclone & Gale' },
                { id: 'lightning', label: language === 'mr' ? '⚡ वीज (३०-३० नियम)' : '⚡ Lightning' },
                { id: 'hailstorm', label: language === 'mr' ? '🧊 गारपीट संरक्षण' : '🧊 Hailstorm' },
                { id: 'heat', label: language === 'mr' ? '☀️ तीव्र उष्माघात' : '☀️ Heatwave' },
                { id: 'drought', label: language === 'mr' ? '💧 पाणी टंचाई' : '💧 Drought' },
                { id: 'firstaid', label: language === 'mr' ? '🩺 सर्पदंश व CPR' : '🩺 Snakebite & CPR' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSopTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeSopTab === tab.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Active SOP Instructions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-2.5">
              {activeSopTab === 'flood' && (
                <div className="space-y-2">
                  <div className="p-2 rounded-xl bg-blue-100/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold flex items-center justify-between gap-2">
                    <span>⚡ {language === 'mr' ? 'नियम: वाहत्या पाण्याचा ६ इंची प्रवाह माणसाला पाडतो; १२ इंची प्रवाह गाडी वाहून नेतो!' : 'Rule: Turn Around, Don’t Drown! 6 inches of water knocks an adult down; 12 inches sweeps a vehicle.'}</span>
                    <a href="tel:1077" className="text-[11px] underline text-blue-700 dark:text-blue-300 font-black">📞 1077</a>
                  </div>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300 leading-relaxed">
                    <li><strong>{language === 'mr' ? 'पाण्याखालील पूल:' : 'Submerged Causeways:'}</strong> {language === 'mr' ? 'पाण्याखाली गेलेले रस्ते व पूल कधीही ओलांडू नका; खाली रस्ता वाहून गेलेला असू शकतो.' : 'Never cross flooded causeways; low bridges collapse or conceal deep scouring pits.'}</li>
                    <li><strong>{language === 'mr' ? 'विद्युत पुरवठा:' : 'Main Breaker:'}</strong> {language === 'mr' ? 'घरात किंवा गोठ्यात पाणी शिरण्यापूर्वी मेन वीज स्वीच तात्काळ बंद करा.' : 'Disconnect main circuit breaker before floodwater touches electrical outlets.'}</li>
                    <li><strong>{language === 'mr' ? 'जनावरांचे दोर:' : 'Untie Livestock:'}</strong> {language === 'mr' ? 'जनावरांना गोठ्यात बांधून ठेवू नका; दोर सोडल्यास ते पोहून उंच जागी स्वतःचा जीव वाचवू शकतात.' : 'Untie cattle so animals can swim to higher ground during flash surges.'}</li>
                    <li><strong>{language === 'mr' ? 'पिण्याचे पाणी:' : 'Drinking Water:'}</strong> {language === 'mr' ? 'पाणी ५ मिनिटे उकळून प्या किंवा क्लोरीन गोळ्या वापरा; कॉलरा व जलजन्य आजार टाळा.' : 'Boil all drinking water vigorously for 5 minutes to prevent waterborne epidemic.'}</li>
                  </ul>
                </div>
              )}

              {activeSopTab === 'earthquake' && (
                <div className="space-y-2">
                  <div className="p-2 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold flex items-center justify-between gap-2">
                    <span>⚡ {language === 'mr' ? 'नियम: खाली वाका, डोके झाका, घट्ट धरा (Drop, Cover, Hold On)!' : 'Rule: DROP, COVER, HOLD ON! Drop to hands & knees, cover head under sturdy table.'}</span>
                    <a href="tel:112" className="text-[11px] underline text-amber-700 dark:text-amber-300 font-black">📞 112</a>
                  </div>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300 leading-relaxed">
                    <li><strong>{language === 'mr' ? 'घरामध्ये असल्यास:' : 'Indoor Shelter:'}</strong> {language === 'mr' ? 'मजबूत टेबलखाली डोके झाका व टेबलचा पाय घट्ट धरून ठेवा. खिडक्यांच्या काचांपासून लांब राहा.' : 'Drop beneath a heavy desk or table and hold on. Stay clear of glass windows and outer walls.'}</li>
                    <li><strong>{language === 'mr' ? 'धावपळ टाळा:' : 'Do Not Run Out:'}</strong> {language === 'mr' ? 'हादरे सुरू असताना बाहेर धावू नका; बाहेर पडताना पडणाऱ्या विटा व काचांमुळे सर्वाधिक मृत्यू होतात.' : 'Do not run outside during tremors; falling exterior masonry causes 80% of injuries.'}</li>
                    <li><strong>{language === 'mr' ? 'शेतात किंवा मोकळ्या जागी:' : 'Open Field:'}</strong> {language === 'mr' ? 'इमारती, विजेचे खांब व विहिरीच्या काठापासून लांब मोकळ्या मैदानात बसा.' : 'Move away from buildings, power pylons, and deep open well rims in agricultural fields.'}</li>
                    <li><strong>{language === 'mr' ? 'हादऱ्यांनंतर गॅस तपासणी:' : 'Gas & Electricity:'}</strong> {language === 'mr' ? 'हादरे थांबल्यावर गॅस सिलिंडर व्हॉल्व बंद करा; काडी पेटवू नका.' : 'Turn off LPG cylinder valves immediately; do not operate spark switches.'}</li>
                  </ul>
                </div>
              )}

              {activeSopTab === 'cyclone' && (
                <div className="space-y-2">
                  <div className="p-2 rounded-xl bg-sky-100/60 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 font-bold flex items-center justify-between gap-2">
                    <span>⚡ {language === 'mr' ? 'नियम: वारे शांत झाले तरी बाहेर पडू नका; वादळाचा डोळा पुढे जाताच उलट वारे धडकतात!' : 'Rule: Beware Eye of Storm! Calm winds mean the center is passing; reverse gales follow.'}</span>
                    <a href="tel:1070" className="text-[11px] underline text-sky-700 dark:text-sky-300 font-black">📞 1070</a>
                  </div>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300 leading-relaxed">
                    <li><strong>{language === 'mr' ? 'दारे-खिडक्या:' : 'Doors & Windows:'}</strong> {language === 'mr' ? 'सर्व दारे व खिडक्या घट्ट बंद ठेवा; वारा आत शिरल्यास छप्पर उडण्याचा धोका वाढतो.' : 'Keep windward doors and shutters firmly latched to avoid explosive roof lift.'}</li>
                    <li><strong>{language === 'mr' ? 'पिके व बागा:' : 'Orchard Staking:'}</strong> {language === 'mr' ? 'केळी, पपई व ऊस पिकाला बांबूचे टेकू द्या; छतावरील पत्रे तारेने बांधा.' : 'Stake banana and papaya plants with bamboo props; wire-tie tin roof sheets.'}</li>
                    <li><strong>{language === 'mr' ? 'तुटलेल्या तारा:' : 'Downed Cables:'}</strong> {language === 'mr' ? 'वादळानंतर तुटून पडलेल्या कोणत्याही तारेला हात लावू नका; १९१२ वर तक्रार करा.' : 'Treat every fallen wire as live. Report directly to power helpline 1912.'}</li>
                  </ul>
                </div>
              )}

              {activeSopTab === 'lightning' && (
                <div className="space-y-2">
                  <div className="p-2 rounded-xl bg-yellow-100/60 dark:bg-yellow-950/40 text-yellow-900 dark:text-yellow-200 font-bold flex items-center justify-between gap-2">
                    <span>⚡ {language === 'mr' ? '३०-३० नियम: वीज व गडगडाट यात ३० सेकंदांपेक्षा कमी अंतर असल्यास पक्क्या घरात जा!' : '30-30 Rule: If flash to bang is under 30s, take indoor shelter immediately.'}</span>
                    <a href="tel:108" className="text-[11px] underline text-yellow-700 dark:text-yellow-300 font-black">📞 108</a>
                  </div>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300 leading-relaxed">
                    <li><strong>{language === 'mr' ? 'एकाकी झाडे टाळा:' : 'Isolated Trees:'}</strong> {language === 'mr' ? 'मोठ्या एकट्या झाडाखाली उभे राहू नका; वीज जमिनीतून शरीरात प्रवेश करते.' : 'Never shelter beneath lone trees or near tall metal irrigation poles.'}</li>
                    <li><strong>{language === 'mr' ? 'विजेची बैठक:' : 'Lightning Crouch:'}</strong> {language === 'mr' ? 'शेतात अडकल्यास पायाच्या चवड्यांवर खाली वाका, कान झाका; जमिनीवर झोपू नका.' : 'If stranded in field, squat low on balls of feet with hands over ears; never lie flat.'}</li>
                    <li><strong>{language === 'mr' ? 'धातू व अवजारे:' : 'Metal Clearance:'}</strong> {language === 'mr' ? 'ट्रॅक्टर, तारांचे कुंपण व शेडनेटच्या लोखंडी पाईपपासून २० फूट लांब राहा.' : 'Step away from tractor implements, wire fencing, and water canals.'}</li>
                  </ul>
                </div>
              )}

              {activeSopTab === 'hailstorm' && (
                <div className="space-y-2">
                  <div className="p-2 rounded-xl bg-cyan-100/60 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-200 font-bold flex items-center justify-between gap-2">
                    <span>⚡ {language === 'mr' ? 'नियम: डोके व मान त्वरित झाका! गारांचा मारा कवटीला गंभीर दुखापत करतो.' : 'Rule: Shield Head & Neck! 80-120 km/h falling hail causes severe concussions.'}</span>
                    <a href="tel:14447" className="text-[11px] underline text-cyan-700 dark:text-cyan-300 font-black">📞 14447</a>
                  </div>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300 leading-relaxed">
                    <li><strong>{language === 'mr' ? 'पक्के छत:' : 'Solid Shelter:'}</strong> {language === 'mr' ? 'सिमेंटच्या छताखाली थांबा; पत्र्याचे छत गारांच्या माऱ्याने फाटू शकते.' : 'Take cover under concrete slabs; tin and asbestos roofs can crack or puncture.'}</li>
                    <li><strong>{language === 'mr' ? 'जनावरांचे रक्षण:' : 'Shield Livestock:'}</strong> {language === 'mr' ? 'जनावरांना आत आणा किंवा पाठीवर जाड गोणपाटाची पोती टाका.' : 'Bring cattle inside or drape heavy tarpaulins/gunny sacks over them.'}</li>
                    <li><strong>{language === 'mr' ? '७२ तासांत विमा नोंदणी:' : 'PMFBY 72h Claim:'}</strong> {language === 'mr' ? 'नुकसान झाल्यास ७२ तासांच्या आत १४४४७ वर तक्रार नोंदवा.' : 'Intimate crop damage on 14447 within 72 hours for PMFBY insurance survey.'}</li>
                  </ul>
                </div>
              )}

              {activeSopTab === 'heat' && (
                <div className="space-y-2">
                  <div className="p-2 rounded-xl bg-orange-100/60 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200 font-bold flex items-center justify-between gap-2">
                    <span>⚡ {language === 'mr' ? 'नियम: उष्माघात झाल्यास मान व बगलेत थंड पाण्याच्या पट्ट्या ठेवून शरीर थंड करा!' : 'Rule: Cool the Core! Apply cold compresses to neck and armpits; call 108.'}</span>
                    <a href="tel:108" className="text-[11px] underline text-orange-700 dark:text-orange-300 font-black">📞 108</a>
                  </div>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300 leading-relaxed">
                    <li><strong>{language === 'mr' ? 'कामकाजाची वेळ:' : 'Work Timing:'}</strong> {language === 'mr' ? 'सकाळी ६ ते १०:३० आणि संध्याकाळी ४:३० नंतरच शेतातील कामे करा.' : 'Schedule spraying and labor before 10:30 AM and after 4:30 PM.'}</li>
                    <li><strong>{language === 'mr' ? 'पाणी व ओआरएस:' : 'Hydration:'}</strong> {language === 'mr' ? 'तहान नसली तरी दर २० मिनिटांनी पाणी, ताक किंवा लिंबू पाणी प्या.' : 'Drink ample water with ORS, lemon juice, or buttermilk frequently.'}</li>
                    <li><strong>{language === 'mr' ? 'जनावरांची काळजी:' : 'Livestock Care:'}</strong> {language === 'mr' ? 'जनावरांना दुपारी थंड पाणी द्या; गोठ्याच्या छतावर चुना लावा.' : 'Provide 100L clean cool water per animal; paint barn roofs white.'}</li>
                  </ul>
                </div>
              )}

              {activeSopTab === 'drought' && (
                <div className="space-y-2">
                  <div className="p-2 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold flex items-center justify-between gap-2">
                    <span>⚡ {language === 'mr' ? 'नियम: पाणी ३०% खाली गेल्यास झाडे जिवंत ठेवण्यासाठी ५०% फळे विरळणी करा!' : 'Rule: Prioritize Orchards! Thin 50% fruit load to keep parent trees alive.'}</span>
                    <a href="tel:18001801551" className="text-[11px] underline text-amber-700 dark:text-amber-300 font-black">📞 1800-180-1551</a>
                  </div>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300 leading-relaxed">
                    <li><strong>{language === 'mr' ? 'रात्री सिंचन:' : 'Night Irrigation:'}</strong> {language === 'mr' ? 'बाष्पीभवन टाळण्यासाठी फक्त रात्री १० ते पहाटे ५ या वेळेत ठिबक सिंचनाने पाणी द्या.' : 'Run drip lines only between 10 PM and 5 AM to cut evaporation.'}</li>
                    <li><strong>{language === 'mr' ? 'आच्छादन (Mulching):' : 'Straw Mulch:'}</strong> {language === 'mr' ? 'झाडांच्या बुंध्याशी १०-१५ सेमी उसाचे पाचट किंवा पालापाचोळा पसरा.' : 'Apply 10-15cm straw mulch across root basins to preserve soil moisture.'}</li>
                    <li><strong>{language === 'mr' ? 'केओलिन फवारणी:' : 'Anti-Transpirant:'}</strong> {language === 'mr' ? 'पानांवर ५% केओलिन फवारा, यामुळे बाष्पीभवन ३०% कमी होते.' : 'Apply 5% kaolin canopy spray to reflect solar heat and reduce water loss.'}</li>
                  </ul>
                </div>
              )}

              {activeSopTab === 'firstaid' && (
                <div className="space-y-2">
                  <div className="p-2 rounded-xl bg-rose-100/60 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold flex items-center justify-between gap-2">
                    <span>⚡ {language === 'mr' ? 'नियम: सर्पदंश झाल्यास हात-पाय स्थिर ठेवा! दोरीने घट्ट बांधू नका, ब्लेडने कापू नका!' : 'Rule: Immobilize Snakebite Limb! Never tie tourniquets, never cut, never suck venom.'}</span>
                    <a href="tel:1800116117" className="text-[11px] underline text-rose-700 dark:text-rose-300 font-black">📞 1800-116-117</a>
                  </div>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300 leading-relaxed">
                    <li><strong>{language === 'mr' ? 'सर्पदंश स्थिर ठेवा:' : 'Immobilization:'}</strong> {language === 'mr' ? 'दंश झालेला अवयव लाकडी पट्टी लावून स्थिर बांधा; रुग्णाला पळू न देता झोपवूनच रुग्णालयात न्या.' : 'Splint the bitten limb with a stick. Transport patient lying flat to nearest PHC with ASV.'}</li>
                    <li><strong>{language === 'mr' ? 'सीपीआर (CPR):' : 'Hands-Only CPR:'}</strong> {language === 'mr' ? 'श्वास बंद पडलेल्या व्यक्तीसाठी छातीच्या मध्यभागी दर मिनिटाला १००-१२० वेळा जोरात दाबा.' : 'For non-breathing victims, compress center of chest hard and fast at 100-120 bpm.'}</li>
                    <li><strong>{language === 'mr' ? 'विजेचा धक्का:' : 'Electric Shock Rescue:'}</strong> {language === 'mr' ? 'रुग्णाला थेट स्पर्श करू नका; कोरड्या लाकडाने किंवा बांबूने तारेपासून वेगळे करा.' : 'Do not touch victim directly; push away from wire using dry wood or dry rubber.'}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Recent Alerts Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('recentAlerts')}
              </h2>
              <button
                onClick={() => addToast('Displaying recent past meteorological advisories', 'info')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {t('viewAll')}
              </button>
            </div>

            <div className="bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 shadow-2xs overflow-hidden">
              {recentAlertsStream.map((recent) => (
                <div
                  key={recent.id}
                  onClick={() => handleAlertDetails(recent)}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      {recent.art === 'rain' ? <CloudRain className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                        {translateAlertTitle(recent.title)}
                      </h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {recent.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="px-2.5 py-0.5 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60 rounded-md text-[10px] font-bold">
                      {recent.type === 'watch' ? t('watch') : t('advisory')}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                      {recent.time}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =====================================================================
            RIGHT COLUMN (Span 4): Mini Real Radar Map, Filters, Community Ticker
            ===================================================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Real Interactive Leaflet Mini Radar Map */}
          <div className="bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('alertMap')} (Live Radar)
                </h3>
              </div>
              <button
                onClick={() => setCurrentPage('weather-map')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{t('viewFullMap')}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Real Interactive Leaflet Slippy Map with RainViewer Radar & Warning Circles */}
            <MiniIncidentMap
              alerts={normalizedAlerts}
              selectedLocation={selectedLocation}
              onSelectAlert={(a) => {
                setSelectedLocation(a.location.split(',')[0].trim());
                handleAlertDetails(a);
              }}
            />
          </div>

          {/* Card 2: Community Weather Incident Ticker */}
          <div className="bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'mr' ? 'शेतकरी स्थानिक नोंदी' : 'Community Hazard Feed'}
                </h3>
              </div>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                + Report
              </button>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-thin pr-1">
              {communityReports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>{rep.type}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">{rep.time}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    📍 {rep.village}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {rep.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Alert Filters */}
          <div className="bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('alertFilters')}
              </h3>
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            </div>

            {/* Location Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('location')}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  <option value="All">{t('allTypes')} - {t('allLocations') || 'All Regions'}</option>
                  {availableLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {translateCity(loc)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Severity Checkboxes: Extreme, High, Moderate, Low */}
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('severity')}
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={severityFilters.extreme}
                    onChange={(e) => setSeverityFilters({ ...severityFilters, extreme: e.target.checked })}
                    className="w-4 h-4 rounded-sm text-red-600 focus:ring-red-500 accent-red-600 cursor-pointer"
                  />
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    <span>Red Alert (Extreme)</span>
                  </span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={severityFilters.high}
                    onChange={(e) => setSeverityFilters({ ...severityFilters, high: e.target.checked })}
                    className="w-4 h-4 rounded-sm text-orange-500 focus:ring-orange-500 accent-orange-500 cursor-pointer"
                  />
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>Orange Alert (High)</span>
                  </span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={severityFilters.moderate}
                    onChange={(e) => setSeverityFilters({ ...severityFilters, moderate: e.target.checked })}
                    className="w-4 h-4 rounded-sm text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                  />
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Yellow Alert (Moderate)</span>
                  </span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={severityFilters.low}
                    onChange={(e) => setSeverityFilters({ ...severityFilters, low: e.target.checked })}
                    className="w-4 h-4 rounded-sm text-emerald-500 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
                  />
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Green Advisory (Safe)</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Clear Filters Button */}
            <button
              onClick={handleClearFilters}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('clearFilters')}</span>
            </button>
          </div>

          {/* Card 4: Alert Subscriptions */}
          <div className="bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('alertSubscriptions')}
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('alertSubscriptionsDesc')}
            </p>

            {/* Subscribed Locations List */}
            <div className="space-y-3 pt-1">
              {availableLocations.slice(0, 3).map((city) => {
                const key = city.toLowerCase();
                const isSubscribed = subscriptions[key] !== false;

                return (
                  <div key={city} className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {translateCity(city)}
                      </h4>
                      <p className="text-[10px] text-slate-400">{t('pushEmail') || 'Push & SMS'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSubscriptionToggle(key)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                        isSubscribed ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-200 ease-in-out shadow-xs ${
                          isSubscribed ? 'translate-x-4.5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage('settings')}
              className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>{t('manageSubscriptions')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
