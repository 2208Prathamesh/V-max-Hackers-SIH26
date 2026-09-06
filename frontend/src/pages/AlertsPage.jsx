import React, { useState, useMemo } from 'react';
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
  Plus, 
  Minus, 
  Settings as SettingsIcon,
  Globe,
  Radio
} from 'lucide-react';
import { AlertDetailsModal } from '../components/modals/AlertDetailsModal';

// 3D Weather Graphic Illustrations
const RainCloudArt = () => (
  <div className="relative w-20 h-16 sm:w-24 sm:h-20 flex items-center justify-center select-none pointer-events-none">
    <div className="relative z-10 filter drop-shadow-md">
      <svg className="w-16 h-12 sm:w-20 sm:h-14" viewBox="0 0 80 56" fill="none">
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
      {/* Rainfall lines */}
      <div className="flex justify-center gap-2 mt-1 -ml-2">
        <div className="w-0.5 h-3 bg-blue-500 rounded-full transform -rotate-12 animate-pulse" />
        <div className="w-0.5 h-4 bg-sky-400 rounded-full transform -rotate-12 animate-pulse delay-75" />
        <div className="w-0.5 h-3 bg-blue-500 rounded-full transform -rotate-12 animate-pulse delay-150" />
      </div>
    </div>
  </div>
);

const WindBreezeArt = () => (
  <div className="relative w-20 h-16 sm:w-24 sm:h-20 flex items-center justify-center select-none pointer-events-none">
    <svg className="w-14 h-12 text-sky-500" viewBox="0 0 64 48" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
      <path d="M6 14h36a8 8 0 1 0-8-8" />
      <path d="M2 24h48a7 7 0 1 1-7 7" />
      <path d="M12 34h28a6 6 0 1 0-6-6" />
    </svg>
  </div>
);

const SunArt = () => (
  <div className="relative w-20 h-16 sm:w-24 sm:h-20 flex items-center justify-center select-none pointer-events-none">
    <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-yellow-200 shadow-[0_0_18px_rgba(250,204,21,0.8)] flex items-center justify-center animate-pulse-subtle">
      <Sun className="w-7 h-7 text-amber-900/30" />
    </div>
  </div>
);

export const AlertsPage = () => {
  const { setCurrentPage, addToast } = useWeather();
  const { 
    t, 
    translateAlertTitle,
    translateAlertDescription,
    translateSeverity,
    translateCity,
    formatUntil
  } = useLanguage();

  // Active Tab state: 'all' | 'active' | 'warnings' | 'watch' | 'information'
  const [activeTab, setActiveTab] = useState('all');

  // Filters State
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [alertTypeFilters, setAlertTypeFilters] = useState({
    all: true,
    warnings: true,
    watch: true,
    information: true
  });
  const [severityFilters, setSeverityFilters] = useState({
    severe: true,
    moderate: true,
    watch: true,
    info: true
  });

  // Modal State
  const [selectedAlertForDetails, setSelectedAlertForDetails] = useState(null);

  // Subscriptions Toggle state
  const [subscriptions, setSubscriptions] = useState({
    pune: true,
    mumbai: true,
    nagpur: false
  });

  // Live IMD District Warning Search State
  const [imdDistrictQuery, setImdDistrictQuery] = useState('');
  const [imdDistrictResult, setImdDistrictResult] = useState(null);

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
        hazard: 'Heavy Rain Warning',
        action: 'Be Prepared. Avoid unnecessary travel.',
        issuedTime: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      });
      addToast(`${t('search')}: ${name}`, 'info');
    }
  };



  // Master Alerts dataset matching mockup
  const activeAlertsList = [
    {
      id: 'alert-1',
      title: 'Heavy Rainfall Warning',
      location: 'Pune, Maharashtra',
      region: 'Pune, Maharashtra',
      type: 'warning',
      severity: 'Severe',
      severityLevel: 'high',
      time: '21 May 2025, 8:20 AM',
      effectiveTime: '21 May 2025, 8:20 AM',
      untilTime: '22 May 2025, 8:00 AM',
      probability: '80%',
      source: 'IMD',
      description: 'Heavy rainfall expected in the next 24 hours. Widespread rainfall may cause waterlogging in low lying areas and traffic disruptions.',
      art: 'rain'
    },
    {
      id: 'alert-2',
      title: 'Strong Winds',
      location: 'Mumbai, Maharashtra',
      region: 'Mumbai, Maharashtra',
      type: 'warning',
      severity: 'Moderate',
      severityLevel: 'medium',
      time: '21 May 2025, 9:00 AM',
      effectiveTime: '21 May 2025, 9:00 AM',
      untilTime: '21 May 2025, 8:00 PM',
      probability: '60%',
      source: 'IMD',
      description: 'Strong surface winds with speed reaching 40-50 kmph likely to prevail over Mumbai and nearby areas.',
      art: 'wind'
    },
    {
      id: 'alert-3',
      title: 'Heatwave Conditions',
      location: 'Nagpur, Maharashtra',
      region: 'Nagpur, Maharashtra',
      type: 'watch',
      severity: 'Watch',
      severityLevel: 'low',
      time: '21 May 2025, 1:00 PM',
      effectiveTime: '21 May 2025, 1:00 PM',
      untilTime: '24 May 2025, 5:00 PM',
      probability: '45%',
      source: 'IMD',
      description: 'Heatwave conditions likely in isolated places over Vidarbha region. Stay hydrated and avoid direct sunlight.',
      art: 'sun'
    }
  ];

  const recentAlertsList = [
    {
      id: 'recent-1',
      title: 'Thunderstorm with Lightning',
      location: 'Aurangabad, Maharashtra',
      region: 'Aurangabad, Maharashtra',
      type: 'information',
      severity: 'Info',
      tag: 'Information',
      time: '20 May 2025, 6:30 PM',
      description: 'Scattered light to moderate thunderstorms observed with surface lightning. No property damage reported.'
    },
    {
      id: 'recent-2',
      title: 'Moderate Rainfall',
      location: 'Nashik, Maharashtra',
      region: 'Nashik, Maharashtra',
      type: 'information',
      severity: 'Info',
      tag: 'Information',
      time: '20 May 2025, 10:10 AM',
      description: 'Passing monsoon clouds bringing light to moderate showers across Godavari river catchment areas.'
    }
  ];

  // Filtering Logic
  const filteredActiveAlerts = useMemo(() => {
    return activeAlertsList.filter(item => {
      // Tab filter
      if (activeTab === 'warnings' && item.type !== 'warning') return false;
      if (activeTab === 'watch' && item.type !== 'watch') return false;
      if (activeTab === 'information' && item.type !== 'information') return false;

      // Location filter
      if (selectedLocation !== 'All' && !item.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
        return false;
      }

      // Severity filter
      if (item.severity === 'Severe' && !severityFilters.severe) return false;
      if (item.severity === 'Moderate' && !severityFilters.moderate) return false;
      if (item.severity === 'Watch' && !severityFilters.watch) return false;

      return true;
    });
  }, [activeTab, selectedLocation, severityFilters]);

  const handleClearFilters = () => {
    setSelectedLocation('All');
    setActiveTab('all');
    setAlertTypeFilters({ all: true, warnings: true, watch: true, information: true });
    setSeverityFilters({ severe: true, moderate: true, watch: true, info: true });
    addToast("Filters reset to default", "info");
  };

  const handleSubscriptionToggle = (cityKey) => {
    setSubscriptions(prev => {
      const updated = { ...prev, [cityKey]: !prev[cityKey] };
      addToast(`${cityKey.toUpperCase()} alert subscription ${updated[cityKey] ? 'enabled' : 'disabled'}`, 'info');
      return updated;
    });
  };

  return (
    <div className="space-y-6 pb-10 select-none">
      
      {/* Alert Details Modal */}
      <AlertDetailsModal
        alert={selectedAlertForDetails}
        isOpen={Boolean(selectedAlertForDetails)}
        onClose={() => setSelectedAlertForDetails(null)}
        onShare={() => addToast("Alert advisory link copied!", "success")}
      />

      {/* =========================================================================
          HEADER SECTION: Title & Description
          ========================================================================= */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('alerts')}
          </h1>
          <ShieldCheck className="w-6 h-6 text-blue-600 fill-blue-50" />
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('alertsSubtitle')}
        </p>

        {/* 5 Filter Tabs */}
        <div className="flex items-center gap-6 mt-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
          {/* Tab 1: All Alerts */}
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

          {/* Tab 2: Active (3) */}
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
              3
            </span>
          </button>

          {/* Tab 3: Warnings (2) */}
          <button
            onClick={() => setActiveTab('warnings')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'warnings'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>{t('warnings')}</span>
            <span className="w-4.5 h-4.5 rounded-full bg-[#F59E0B] text-white text-[10px] flex items-center justify-center font-bold">
              2
            </span>
          </button>

          {/* Tab 4: Watch (1) */}
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
              1
            </span>
          </button>

          {/* Tab 5: Information (2) */}
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
              2
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAIN 2-COLUMN LAYOUT: Alerts Stream (Left) + Filters & Map (Right)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* =====================================================================
            LEFT COLUMN (Span 8): Active Alerts & Recent Alerts
            ===================================================================== */}
        <div className="lg:col-span-8 space-y-6">

          {/* Official IMD Warning & District Nowcast Search Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/60 to-slate-900 border border-blue-500/30 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>{t('imdOfficialWarning')}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {t('liveNowcast')}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">{t('imdMinistrySubtitle')}</p>
                </div>
              </div>

              {/* District Search Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={t('searchDistrict')}
                  value={imdDistrictQuery}
                  onChange={(e) => setImdDistrictQuery(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-40 sm:w-48"
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
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                imdDistrictResult.warningLevel === 'Red'
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  : imdDistrictResult.warningLevel === 'Orange'
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  : imdDistrictResult.warningLevel === 'Yellow'
                  ? 'bg-yellow-950/40 border-yellow-500/40 text-yellow-200'
                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      {imdDistrictResult.district}, {imdDistrictResult.state}
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
          
          {/* Active Alerts Subheading */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t('activeAlerts')} ({filteredActiveAlerts.length})
            </h2>
            <button
              onClick={() => setActiveTab('active')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {t('viewAllActive')}
            </button>
          </div>

          {/* Active Alert Cards Stream */}
          <div className="space-y-4">
            {filteredActiveAlerts.map((alert) => {
              const isSevere = alert.severity === 'Severe';
              const isModerate = alert.severity === 'Moderate';

              return (
                <div
                  key={alert.id}
                  className={`rounded-3xl p-6 transition shadow-xs border ${
                    isSevere
                      ? 'bg-[#FFF5F5] dark:bg-rose-950/20 border-rose-200/90 dark:border-rose-900/60'
                      : isModerate
                      ? 'bg-[#FFFBEB] dark:bg-amber-950/20 border-amber-200/90 dark:border-amber-900/60'
                      : 'bg-[#FEFDF0] dark:bg-yellow-950/20 border-amber-200/80 dark:border-yellow-900/60'
                  }`}
                >
                  {/* Top Row: Icon, Title, Timestamps, 3D Art */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="shrink-0 mt-0.5">
                        <AlertTriangle className={`w-7 h-7 ${
                          isSevere 
                            ? 'text-[#EF4444] fill-[#EF4444]/20' 
                            : isModerate 
                            ? 'text-[#F59E0B] fill-[#F59E0B]/20' 
                            : 'text-[#EAB308] fill-[#EAB308]/20'
                        }`} />
                      </div>
                      <div>
                        <h3 className={`text-base sm:text-lg font-black tracking-tight ${
                          isSevere 
                            ? 'text-[#DC2626] dark:text-rose-400' 
                            : isModerate 
                            ? 'text-[#D97706] dark:text-amber-400' 
                            : 'text-[#CA8A04] dark:text-yellow-400'
                        }`}>
                          {translateAlertTitle(alert.title)}
                        </h3>
                        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          {alert.location}
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
                      {alert.art === 'rain' && <RainCloudArt />}
                      {alert.art === 'wind' && <WindBreezeArt />}
                      {alert.art === 'sun' && <SunArt />}
                    </div>
                  </div>

                  {/* Description Paragraph */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
                    {translateAlertDescription(alert.description)}
                  </p>

                  {/* Bottom Meta & Action Button Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 mt-4 border-t border-black/5 dark:border-white/5 gap-3">
                    <div className="flex items-center gap-5 text-xs">
                      {/* Severity */}
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className={`w-3.5 h-3.5 ${
                          isSevere ? 'text-rose-500' : isModerate ? 'text-amber-500' : 'text-yellow-500'
                        }`} />
                        <span className="text-slate-500">{t('severity')}</span>
                        <span className={`font-bold ${
                          isSevere ? 'text-rose-600' : isModerate ? 'text-amber-600' : 'text-yellow-600'
                        }`}>
                          {translateSeverity(alert.severity)}
                        </span>
                      </div>

                      {/* Probability */}
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-500">{t('probability')}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {alert.probability}
                        </span>
                      </div>

                      {/* Source */}
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-500">{t('source')}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {alert.source}
                        </span>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={() => setSelectedAlertForDetails(alert)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer border ${
                        isSevere
                          ? 'border-rose-300 text-rose-600 hover:bg-rose-100/60 bg-white dark:bg-slate-900'
                          : isModerate
                          ? 'border-amber-300 text-amber-600 hover:bg-amber-100/60 bg-white dark:bg-slate-900'
                          : 'border-yellow-400 text-yellow-700 hover:bg-yellow-100/60 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <span>{t('viewDetails')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Alerts Section */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('recentAlerts')}
              </h2>
              <button
                onClick={() => addToast("Displaying archived 30-day meteorological alerts", "info")}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {t('viewAll')}
              </button>
            </div>

            <div className="bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 shadow-2xs overflow-hidden">
              {recentAlertsList.map((recent) => (
                <div
                  key={recent.id}
                  onClick={() => setSelectedAlertForDetails(recent)}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      {recent.id === 'recent-1' ? <MapPin className="w-4 h-4" /> : <CloudRain className="w-4 h-4" />}
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
                      {recent.tag === 'Watch' ? t('watch') : recent.tag === 'Advisory' ? t('advisory') : recent.tag}
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

          {/* Footer Citation */}
          <div className="flex items-center justify-center gap-1.5 pt-4 text-xs text-slate-400 dark:text-slate-500">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>{t('alertsProvidedByImd')}</span>
          </div>

        </div>

        {/* =====================================================================
            RIGHT COLUMN (Span 4): Alert Filters, Alert Map, Alert Subscriptions
            ===================================================================== */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Alert Filters */}
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
                  <option value="All">{t('allTypes')} - {translateCity('Pune, Maharashtra')}</option>
                  <option value="Pune">{translateCity('Pune, Maharashtra')}</option>
                  <option value="Mumbai">{translateCity('Mumbai, Maharashtra')}</option>
                  <option value="Nagpur">{translateCity('Nagpur, Maharashtra')}</option>
                  <option value="Aurangabad">{translateCity('Aurangabad, Maharashtra')}</option>
                  <option value="Delhi">{translateCity('Delhi, India')}</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Alert Type Checkboxes */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('alertType')}
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alertTypeFilters.all}
                    onChange={(e) => setAlertTypeFilters({ ...alertTypeFilters, all: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
                  />
                  <span>{t('allTypes')}</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alertTypeFilters.warnings}
                    onChange={(e) => setAlertTypeFilters({ ...alertTypeFilters, warnings: e.target.checked })}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 accent-red-600"
                  />
                  <span>{t('warnings')}</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alertTypeFilters.watch}
                    onChange={(e) => setAlertTypeFilters({ ...alertTypeFilters, watch: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500"
                  />
                  <span>{t('watch')}</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alertTypeFilters.information}
                    onChange={(e) => setAlertTypeFilters({ ...alertTypeFilters, information: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500 accent-blue-500"
                  />
                  <span>{t('information')}</span>
                </label>
              </div>
            </div>

            {/* Severity Checkboxes */}
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('severity')}
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={severityFilters.severe}
                    onChange={(e) => setSeverityFilters({ ...severityFilters, severe: e.target.checked })}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 accent-red-600"
                  />
                  <span>{t('severe')}</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={severityFilters.moderate}
                    onChange={(e) => setSeverityFilters({ ...severityFilters, moderate: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500"
                  />
                  <span>{t('moderate')}</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={severityFilters.watch}
                    onChange={(e) => setSeverityFilters({ ...severityFilters, watch: e.target.checked })}
                    className="w-4 h-4 rounded text-yellow-500 focus:ring-yellow-500 accent-yellow-500"
                  />
                  <span>{t('watch')}</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={severityFilters.info}
                    onChange={(e) => setSeverityFilters({ ...severityFilters, info: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500 accent-blue-500"
                  />
                  <span>{t('info')}</span>
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

          {/* Card 2: Alert Map Snapshot */}
          <div className="bg-white dark:bg-[#111C2E] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('alertMap')}
              </h3>
              <button
                onClick={() => setCurrentPage('weather-map')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {t('viewFullMap')}
              </button>
            </div>

            {/* Interactive Map Visual Container */}
            <div 
              onClick={() => setCurrentPage('weather-map')}
              className="relative h-56 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-emerald-50/50 dark:bg-slate-800/80 cursor-pointer group"
            >
              {/* Map background tiles artwork */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-85 group-hover:scale-105 transition duration-500"
                style={{
                  backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px), radial-gradient(#CBD5E1 1px, #E2E8F0 1px)`,
                  backgroundSize: '20px 20px',
                  backgroundColor: '#D1FAE5'
                }}
              />
              {/* Coastline shape illustration */}
              <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" viewBox="0 0 200 200">
                <path d="M 40,0 Q 30,50 45,90 T 55,160 Q 60,190 70,200 L 0,200 L 0,0 Z" fill="#93C5FD" />
              </svg>

              {/* Alert Pin 1: Pune (Severe Red Pin) */}
              <div className="absolute top-[48%] left-[34%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group-hover:scale-110 transition">
                <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md shadow-rose-600/50 animate-bounce">
                  ⚠️
                </div>
                <span className="text-[9px] font-extrabold text-slate-900 bg-white/90 px-1 py-0.2 rounded-sm shadow-2xs mt-0.5">
                  {translateCity('Pune')}
                </span>
              </div>

              {/* Alert Pin 2: Mumbai (Amber Pin) */}
              <div className="absolute top-[38%] left-[22%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[8px] font-bold shadow-xs">
                  💨
                </div>
                <span className="text-[8px] font-bold text-slate-800 bg-white/80 px-1 rounded-xs mt-0.5">
                  {translateCity('Mumbai')}
                </span>
              </div>

              {/* Alert Pin 3: Nagpur (Yellow Pin) */}
              <div className="absolute top-[22%] right-[18%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-yellow-500 text-white flex items-center justify-center text-[8px] font-bold shadow-xs">
                  ☀️
                </div>
                <span className="text-[8px] font-bold text-slate-800 bg-white/80 px-1 rounded-xs mt-0.5">
                  {translateCity('Nagpur')}
                </span>
              </div>

              {/* Alert Pin 4: Aurangabad */}
              <div className="absolute top-[30%] left-[48%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[8px] font-bold">
                  ⚡
                </div>
                <span className="text-[8px] font-bold text-slate-800 bg-white/80 px-1 rounded-xs mt-0.5">
                  {translateCity('Aurangabad')}
                </span>
              </div>

              {/* Alert Pin 5: Solapur */}
              <div className="absolute bottom-[24%] left-[62%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[8px] font-bold">
                  •
                </div>
                <span className="text-[8px] font-bold text-slate-800 bg-white/80 px-1 rounded-xs mt-0.5">
                  {translateCity('Solapur')}
                </span>
              </div>

              {/* Alert Pin 6: Kolhapur */}
              <div className="absolute bottom-[16%] left-[32%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold">
                  •
                </div>
                <span className="text-[8px] font-bold text-slate-800 bg-white/80 px-1 rounded-xs mt-0.5">
                  {translateCity('Kolhapur')}
                </span>
              </div>

              {/* Zoom Buttons Controls */}
              <div className="absolute bottom-3 right-3 flex flex-col gap-1 bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); addToast(t('mapZoomIn'), "info"); }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title={t('zoomIn')}
                >
                  <Plus className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                </button>
                <div className="h-px bg-slate-200 dark:bg-slate-800" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); addToast(t('mapZoomOut'), "info"); }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title={t('zoomOut')}
                >
                  <Minus className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                </button>
              </div>

            </div>
          </div>

          {/* Card 3: Alert Subscriptions */}
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
              
              {/* Pune, Maharashtra */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {translateCity('Pune, Maharashtra')}
                  </h4>
                  <p className="text-[10px] text-slate-400">{t('pushEmail')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSubscriptionToggle('pune')}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                    subscriptions.pune ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-200 ease-in-out shadow-xs ${
                      subscriptions.pune ? 'translate-x-4.5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Mumbai, Maharashtra */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {translateCity('Mumbai, Maharashtra')}
                  </h4>
                  <p className="text-[10px] text-slate-400">{t('push')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSubscriptionToggle('mumbai')}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                    subscriptions.mumbai ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-200 ease-in-out shadow-xs ${
                      subscriptions.mumbai ? 'translate-x-4.5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Nagpur, Maharashtra */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {translateCity('Nagpur, Maharashtra')}
                  </h4>
                  <p className="text-[10px] text-slate-400">{t('email')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSubscriptionToggle('nagpur')}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                    subscriptions.nagpur ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-200 ease-in-out shadow-xs ${
                      subscriptions.nagpur ? 'translate-x-4.5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

            </div>

            {/* Manage Subscriptions Button */}
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
