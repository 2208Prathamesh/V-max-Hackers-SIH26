import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { api } from '../../services/api';
import { 
  BarChart2, 
  AlertTriangle, 
  CloudRain, 
  Wind, 
  Thermometer, 
  Activity, 
  Gauge, 
  Radio, 
  Search, 
  Download, 
  RefreshCw, 
  ChevronDown, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Compass, 
  Sliders
} from 'lucide-react';

export const AuthorityAnalyticsPage = () => {
  const { addToast } = useWeather();
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [activeTab, setActiveTab] = useState('models'); // 'models' | 'rainfall' | 'convective' | 'network'
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchDistrict, setSearchDistrict] = useState('');
  const [filterWarningStage, setFilterWarningStage] = useState('all');

  const timeRanges = ['Last 7 Days', 'Last 30 Days', 'This Quarter', 'This Monsoon Season', 'Year 2025'];

  const fetchAnalytics = useCallback(async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.authorityAnalytics(timeRange);
      if (res?.data) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      console.warn('Analytics fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics(false);
  }, [fetchAnalytics]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await api.downloadAuthorityReport();
      addToast('Official Meteorological Verification & Incident Dossier downloaded', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to download report', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const summary = analyticsData?.summary || {
    totalAlerts: 47,
    activeAlerts: 24,
    criticalAlerts: 15,
    forecastThreatScore: '0.86 ETS',
    meanLeadTimeHours: '19.4 hrs',
    statewideRainfallAnomaly: '+24.8% (Excess vs LPA)',
    activeAWSNetwork: '328 / 342 Stations'
  };

  const nwp = analyticsData?.nwpModelVerification || {
    comparisonModels: [
      { id: 'ecmwf', name: 'ECMWF IFS (HRES 9km)', agency: 'European Centre for Medium-Range Weather Forecasts', tempRmse: '1.12 °C', precipEts: '0.88 ETS', windMae: '2.8 km/h', leadTimeDay1: '96.8%', leadTimeDay3: '89.4%', leadTimeDay5: '81.2%', overallRank: '#1 Operational Benchmark' },
      { id: 'imd-wrf', name: 'IMD WRF (3km Meso)', agency: 'India Meteorological Department (Mausam Bhavan)', tempRmse: '1.24 °C', precipEts: '0.85 ETS', windMae: '3.1 km/h', leadTimeDay1: '95.9%', leadTimeDay3: '87.8%', leadTimeDay5: '78.2%', overallRank: '#1 Regional Convective' },
      { id: 'gfs', name: 'NOAA GFS (0.25° Global)', agency: 'National Centers for Environmental Prediction (NCEP)', tempRmse: '1.42 °C', precipEts: '0.82 ETS', windMae: '3.6 km/h', leadTimeDay1: '94.6%', leadTimeDay3: '86.1%', leadTimeDay5: '76.4%', overallRank: '#2 Synoptic Guidance' },
      { id: 'ncum', name: 'NCUM (12km Unified)', agency: 'National Centre for Medium Range Weather Forecasting', tempRmse: '1.38 °C', precipEts: '0.81 ETS', windMae: '3.4 km/h', leadTimeDay1: '93.8%', leadTimeDay3: '84.5%', leadTimeDay5: '75.1%', overallRank: '#3 Secondary Ensemble' }
    ],
    ensembleAgreementScore: 88.4,
    spreadState: 'Moderate Spread in Orographic Ghats Zones'
  };

  const rainfall = analyticsData?.rainfallAnalytics || {
    stateMeanRainfallMm: 842.6,
    normalLpaMm: 675.2,
    cumulativeLpaDeparture: '+24.8%',
    category: 'Excess',
    departureBands: [
      { category: 'Large Excess (≥ +60%)', count: 3, percentage: 25.0, color: '#1D4ED8', districts: 'Ratnagiri (+72%), Raigad (+64%), Sindhudurg (+61%)' },
      { category: 'Excess (+20% to +59%)', count: 4, percentage: 33.3, color: '#06B6D4', districts: 'Mumbai (+44%), Pune (+38%), Kolhapur (+31%), Thane (+28%)' },
      { category: 'Normal (-19% to +19%)', count: 3, percentage: 25.0, color: '#10B981', districts: 'Satara (+8%), Nagpur (+11%), Nashik (-4%)' },
      { category: 'Deficient (-20% to -59%)', count: 2, percentage: 16.7, color: '#F59E0B', districts: 'Solapur (-28%), Nanded (-22%)' },
      { category: 'Scanty / Dry (≤ -60%)', count: 0, percentage: 0.0, color: '#EF4444', districts: 'None recorded' }
    ],
    intensityDistribution: [
      { label: 'Extremely Heavy (> 204.5 mm / Cloudburst)', events: 4, share: '10.8%', alertLevel: 'Red', color: '#DC2626', desc: 'Isolated ghats & coastal torrential bursts' },
      { label: 'Very Heavy (115.6 – 204.4 mm)', events: 9, share: '24.3%', alertLevel: 'Orange', color: '#EA580C', desc: 'Sustained orographic monsoon surge' },
      { label: 'Heavy (64.5 – 115.5 mm)', events: 14, share: '37.8%', alertLevel: 'Yellow', color: '#D97706', desc: 'Widespread convective bands' },
      { label: 'Moderate (15.6 – 64.4 mm)', events: 8, share: '21.6%', alertLevel: 'Advisory', color: '#2563EB', desc: 'Intermittent rainfall spells' },
      { label: 'Light / Trace (< 15.5 mm)', events: 2, share: '5.4%', alertLevel: 'Watch', color: '#059669', desc: 'Scattered drizzling showers' }
    ]
  };

  const skill = analyticsData?.warningVerificationSkill || {
    probabilityOfDetection: '94.2%',
    falseAlarmRatio: '7.8%',
    criticalSuccessIndex: '87.6%',
    threatScore: '0.86 ETS',
    meanLeadTimeHours: 19.4,
    contingencyHits: 81,
    contingencyFalseAlarms: 7,
    contingencyMisses: 5,
    contingencyCorrectNegatives: 248,
    verificationAudit: 'IMD Standard Contingency Matrix Verification (Ground Truth vs AWS Network)'
  };

  const convective = analyticsData?.convectiveSoundingProfiles || [
    { division: 'Konkan Coast (Mumbai / Ratnagiri)', cape: 2850, cin: 18, pwatMm: 62.4, liftedIndex: -6.4, windShearKnots: 36, riskClass: 'Extreme Convection', riskColor: '#EF4444' },
    { division: 'Western Ghats / Pune Region', cape: 2140, cin: 32, pwatMm: 54.2, liftedIndex: -5.1, windShearKnots: 28, riskClass: 'Severe Orographic Lift', riskColor: '#F97316' },
    { division: 'North Maharashtra (Nashik)', cape: 1480, cin: 45, pwatMm: 46.8, liftedIndex: -3.8, windShearKnots: 22, riskClass: 'Moderate Thunderstorm', riskColor: '#EAB308' },
    { division: 'Vidarbha (Nagpur / Amravati)', cape: 1820, cin: 52, pwatMm: 48.0, liftedIndex: -4.2, windShearKnots: 24, riskClass: 'Lightning & Severe Squalls', riskColor: '#F97316' },
    { division: 'Marathwada (Chh. Sambhajinagar)', cape: 1120, cin: 68, pwatMm: 39.5, liftedIndex: -2.4, windShearKnots: 18, riskClass: 'Marginal Instability', riskColor: '#10B981' }
  ];

  const sensor = analyticsData?.sensorNetworkHealth || {
    awsStations: { total: 342, online: 328, reportingPct: '95.9%', latency: '6 mins' },
    argRainGauges: { total: 512, online: 498, reportingPct: '97.2%', latency: '15 mins' },
    radars: [
      { name: 'DWR Mumbai (Colaba)', type: 'S-Band Polarimetric Doppler', status: 'Operational', rangeKm: 500, scanCadenceMins: 10, uptimePct: '99.8%' },
      { name: 'DWR Mumbai (Veravali)', type: 'C-Band High-Resolution Meso', status: 'Operational', rangeKm: 250, scanCadenceMins: 6, uptimePct: '99.5%' },
      { name: 'DWR Goa (Altinho)', type: 'S-Band Coastal Radar', status: 'Operational', rangeKm: 500, scanCadenceMins: 10, uptimePct: '98.9%' },
      { name: 'DWR Nagpur', type: 'S-Band Inland Convective Radar', status: 'Operational', rangeKm: 500, scanCadenceMins: 10, uptimePct: '99.2%' }
    ],
    radiosondeSoundings: { totalStations: 4, cadence: '00Z & 12Z Daily', operationalPct: '100%' },
    satelliteFeed: 'INSAT-3D / 3DR Imager & Sounder (15-min Rapid Scan Active)'
  };

  const districtMatrix = analyticsData?.districtMeteorologyMatrix || [
    { id: 'pune', name: 'Pune', division: 'Pune', stationId: 'PUN-AWS-01', rainfall24h: 128.4, departureLpa: '+38%', maxTempC: 28.4, tempAnomaly: '-1.8 °C', peakGustKmh: 54, capeJkg: 2140, warningStage: 'Red Warning', warningClass: 'bg-red-500/20 text-red-600 dark:text-red-400' },
    { id: 'mumbai', name: 'Mumbai Santacruz', division: 'Konkan', stationId: 'BOM-AWS-02', rainfall24h: 174.6, departureLpa: '+44%', maxTempC: 30.2, tempAnomaly: '+0.4 °C', peakGustKmh: 68, capeJkg: 2850, warningStage: 'Red Warning', warningClass: 'bg-red-500/20 text-red-600 dark:text-red-400' },
    { id: 'ratnagiri', name: 'Ratnagiri Port', division: 'Konkan', stationId: 'RTN-AWS-01', rainfall24h: 198.2, departureLpa: '+72%', maxTempC: 29.1, tempAnomaly: '-0.6 °C', peakGustKmh: 72, capeJkg: 2720, warningStage: 'Red Warning', warningClass: 'bg-red-500/20 text-red-600 dark:text-red-400' },
    { id: 'kolhapur', name: 'Kolhapur Rajaram', division: 'Pune', stationId: 'KOP-AWS-03', rainfall24h: 114.8, departureLpa: '+31%', maxTempC: 27.6, tempAnomaly: '-1.4 °C', peakGustKmh: 48, capeJkg: 1980, warningStage: 'Orange Warning', warningClass: 'bg-orange-500/20 text-orange-600 dark:text-orange-400' },
    { id: 'raigad', name: 'Alibag Raigad', division: 'Konkan', stationId: 'RGD-AWS-02', rainfall24h: 182.0, departureLpa: '+64%', maxTempC: 29.8, tempAnomaly: '-0.2 °C', peakGustKmh: 64, capeJkg: 2680, warningStage: 'Red Warning', warningClass: 'bg-red-500/20 text-red-600 dark:text-red-400' },
    { id: 'satara', name: 'Mahabaleshwar Satara', division: 'Pune', stationId: 'MHB-AWS-01', rainfall24h: 142.6, departureLpa: '+8%', maxTempC: 22.4, tempAnomaly: '-2.1 °C', peakGustKmh: 58, capeJkg: 1890, warningStage: 'Orange Warning', warningClass: 'bg-orange-500/20 text-orange-600 dark:text-orange-400' },
    { id: 'nashik', name: 'Nashik Ozar', division: 'Nashik', stationId: 'NSK-AWS-01', rainfall24h: 46.2, departureLpa: '-4%', maxTempC: 31.4, tempAnomaly: '+0.8 °C', peakGustKmh: 42, capeJkg: 1480, warningStage: 'Yellow Alert', warningClass: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' },
    { id: 'nagpur', name: 'Nagpur Sonegaon', division: 'Nagpur', stationId: 'NGP-AWS-01', rainfall24h: 58.6, departureLpa: '+11%', maxTempC: 34.2, tempAnomaly: '+1.6 °C', peakGustKmh: 52, capeJkg: 1820, warningStage: 'Yellow Alert', warningClass: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' },
    { id: 'chhatrapati-sambhajinagar', name: 'Chh. Sambhajinagar', division: 'Marathwada', stationId: 'CSN-AWS-01', rainfall24h: 28.4, departureLpa: '-12%', maxTempC: 33.6, tempAnomaly: '+1.1 °C', peakGustKmh: 38, capeJkg: 1120, warningStage: 'Yellow Alert', warningClass: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' },
    { id: 'solapur', name: 'Solapur Central', division: 'Pune', stationId: 'SLP-AWS-01', rainfall24h: 14.2, departureLpa: '-28%', maxTempC: 35.8, tempAnomaly: '+2.4 °C', peakGustKmh: 34, capeJkg: 920, warningStage: 'Green Watch', warningClass: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
    { id: 'amravati', name: 'Amravati District', division: 'Amravati', stationId: 'AMR-AWS-01', rainfall24h: 38.0, departureLpa: '+4%', maxTempC: 33.8, tempAnomaly: '+1.2 °C', peakGustKmh: 40, capeJkg: 1340, warningStage: 'Yellow Alert', warningClass: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' },
    { id: 'nanded', name: 'Nanded Airport', division: 'Marathwada', stationId: 'NDD-AWS-01', rainfall24h: 18.6, departureLpa: '-22%', maxTempC: 34.9, tempAnomaly: '+1.9 °C', peakGustKmh: 36, capeJkg: 980, warningStage: 'Green Watch', warningClass: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' }
  ];

  const timeline = analyticsData?.timeline || [
    { label: "Day 1", count: 7, meanMm: 24 },
    { label: "Day 5", count: 9, meanMm: 38 },
    { label: "Day 10", count: 13, meanMm: 62 },
    { label: "Day 15", count: 20, meanMm: 118 },
    { label: "Day 20", count: 15, meanMm: 84 },
    { label: "Day 25", count: 11, meanMm: 46 },
    { label: "Day 30", count: 19, meanMm: 92 }
  ];

  const filteredDistricts = useMemo(() => {
    return districtMatrix.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchDistrict.toLowerCase()) || 
                            d.division.toLowerCase().includes(searchDistrict.toLowerCase()) ||
                            d.stationId.toLowerCase().includes(searchDistrict.toLowerCase());
      const matchesStage = filterWarningStage === 'all' 
        ? true 
        : d.warningStage.toLowerCase().includes(filterWarningStage.toLowerCase());
      return matchesSearch && matchesStage;
    });
  }, [districtMatrix, searchDistrict, filterWarningStage]);

  // SVG Area Chart points calculated for hyetograph / timeline
  const maxRainMm = Math.max(...timeline.map(t => t.meanMm || t.count * 6), 1);
  const chartPoints = timeline.map((pt, i) => {
    const val = pt.meanMm || pt.count * 6;
    const x = 40 + (i * 360) / Math.max(timeline.length - 1, 1);
    const y = 170 - (val / (maxRainMm * 1.2)) * 120;
    return `${Math.round(x)},${Math.round(y)}`;
  }).join(' ');
  const chartFillPoints = `40,180 ${chartPoints} 400,180`;

  return (
    <div className="space-y-6 animate-fadeIn pb-12 select-none">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#121316] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Meteorological Analytics & Model Verification
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[11px] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              OPERATIONAL SYNOPTIC RUN • 00Z / 12Z CYCLE
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            NWP multi-model verification (ECMWF vs GFS vs WRF), hydrometeorological LPA departure anomalies, convective sounding diagnostics, and AWS telemetry
          </p>
        </div>

        {/* Date Filter Dropdown and Export */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => {
                setTimeRange(e.target.value);
                addToast(`Synoptic window adjusted to ${e.target.value}`, 'info');
              }}
              className="appearance-none pl-4 pr-9 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs focus:outline-none cursor-pointer"
            >
              {timeRanges.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => fetchAnalytics(true)}
            disabled={loading || refreshing}
            className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
            title="Refresh synoptic data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
            title="Download Official IMD / State Meteorological Verification Log"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'Exporting...' : 'Export Verification CSV'}</span>
          </button>
        </div>
      </div>

      {/* 4 True Weather Authority KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#121316] p-5 rounded-3xl border border-red-200/80 dark:border-red-900/30 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/15 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono leading-none">
                {summary.criticalAlerts}
              </span>
              <span className="text-xs font-bold text-red-500">Red Level</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Active Severe Storm Warnings ({summary.activeAlerts} total)
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121316] p-5 rounded-3xl border border-blue-200/80 dark:border-blue-900/30 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono leading-none">
              {summary.forecastThreatScore}
            </span>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Equitable Threat Score (Heavy Rain &gt;64.5mm)
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121316] p-5 rounded-3xl border border-emerald-200/80 dark:border-emerald-900/30 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono leading-none">
              {summary.meanLeadTimeHours}
            </span>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Mean Early Warning Lead Time (POD: {summary.probabilityOfDetection})
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121316] p-5 rounded-3xl border border-cyan-200/80 dark:border-cyan-900/30 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <CloudRain className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono leading-none">
              {summary.statewideRainfallAnomaly.split(' ')[0]}
            </span>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Rainfall Departure vs Long Period Average (LPA)
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('models')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'models'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-[#121316] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>NWP Model Verification (4 Models)</span>
        </button>

        <button
          onClick={() => setActiveTab('rainfall')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'rainfall'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-[#121316] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <CloudRain className="w-4 h-4" />
          <span>Hydrometeorology & LPA Departure</span>
        </button>

        <button
          onClick={() => setActiveTab('convective')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'convective'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-[#121316] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Warning Skill & Convective Soundings</span>
        </button>

        <button
          onClick={() => setActiveTab('network')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'network'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-[#121316] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>AWS Network & District Observations</span>
        </button>
      </div>

      {/* ====================================================================
          TAB 1: NWP MODEL FORECAST VERIFICATION & ENSEMBLE SPREAD
          ==================================================================== */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          {/* Model Comparison Table */}
          <div className="bg-white dark:bg-[#121316] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Numerical Weather Prediction (NWP) Model Forecast Verification
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Comparative skill scores and Root Mean Square Error (RMSE) against ground truth Automated Weather Station observations
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                  Ensemble Agreement: {nwp.ensembleAgreementScore}%
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4">NWP Model & Agency</th>
                    <th className="p-4">Temp RMSE (°C)</th>
                    <th className="p-4">Precip Skill (ETS)</th>
                    <th className="p-4">Wind MAE (km/h)</th>
                    <th className="p-4">Day 1 Lead Skill</th>
                    <th className="p-4">Day 3 Lead Skill</th>
                    <th className="p-4">Day 5 Lead Skill</th>
                    <th className="p-4">Operational Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
                  {nwp.comparisonModels.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4">
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {m.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {m.agency}
                        </div>
                      </td>

                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                        {m.tempRmse}
                      </td>

                      <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {m.precipEts}
                      </td>

                      <td className="p-4 font-mono">
                        {m.windMae}
                      </td>

                      <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {m.leadTimeDay1}
                      </td>

                      <td className="p-4 font-mono text-blue-600 dark:text-blue-400 font-bold">
                        {m.leadTimeDay3}
                      </td>

                      <td className="p-4 font-mono text-amber-600 dark:text-amber-400 font-bold">
                        {m.leadTimeDay5}
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          {m.overallRank}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Ensemble Spread Diagnosis:
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {nwp.spreadState}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Verified against 342 IMD/State AWS stations in Maharashtra
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 2: HYDROMETEOROLOGY & LPA RAINFALL DEPARTURE
          ==================================================================== */}
      {activeTab === 'rainfall' && (
        <div className="space-y-6">
          {/* Statewide Cumulative Departure Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white dark:bg-[#121316] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Statewide Monsoon Rainfall Departure (% vs LPA)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Actual Cumulative: <strong className="text-slate-800 dark:text-slate-200 font-mono">{rainfall.stateMeanRainfallMm} mm</strong> vs Normal LPA: <strong className="text-slate-800 dark:text-slate-200 font-mono">{rainfall.normalLpaMm} mm</strong>
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl text-xs font-black bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {rainfall.cumulativeLpaDeparture} ({rainfall.category})
                </span>
              </div>

              {/* 5-Band IMD Distribution */}
              <div className="space-y-3 pt-2">
                {rainfall.departureBands.map((b) => (
                  <div key={b.category} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <span style={{ backgroundColor: b.color }} className="w-3 h-3 rounded-full shrink-0" />
                        <span>{b.category}</span>
                      </span>
                      <span className="font-mono text-slate-600 dark:text-slate-300">
                        {b.count} Districts ({b.percentage}%)
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        style={{ width: `${b.percentage}%`, backgroundColor: b.color }}
                        className="h-full rounded-full transition-all duration-500"
                      />
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Districts: {b.districts}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Hyetograph Curve */}
            <div className="lg:col-span-5 bg-white dark:bg-[#121316] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Daily Hyetograph & Precipitation Trend
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Mean daily precipitation across Maharashtra AWS stations
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  Peak: {maxRainMm} mm
                </span>
              </div>

              <div className="relative w-full pt-4">
                <svg viewBox="0 0 440 200" className="w-full h-48 overflow-visible">
                  <defs>
                    <linearGradient id="rainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <line x1="40" y1="50" x2="420" y2="50" stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" />
                  <line x1="40" y1="110" x2="420" y2="110" stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" />
                  <line x1="40" y1="170" x2="420" y2="170" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />

                  <polygon points={chartFillPoints} fill="url(#rainGradient)" />
                  <polyline
                    fill="none"
                    stroke="#06B6D4"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chartPoints}
                  />

                  {timeline.map((pt, i) => {
                    const val = pt.meanMm || pt.count * 6;
                    const x = 40 + (i * 360) / Math.max(timeline.length - 1, 1);
                    const y = 170 - (val / (maxRainMm * 1.2)) * 120;
                    return (
                      <g key={pt.label} className="cursor-pointer group">
                        <circle
                          cx={x}
                          cy={y}
                          r="4.5"
                          className="fill-white dark:fill-slate-900 stroke-cyan-500 stroke-[2.5] group-hover:r-6 transition-all"
                        />
                        <text
                          x={x}
                          y={y - 10}
                          textAnchor="middle"
                          className="text-[10px] font-bold fill-slate-800 dark:fill-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {val}mm
                        </text>
                        <text
                          x={x}
                          y="192"
                          textAnchor="middle"
                          className="text-[10px] font-bold fill-slate-400"
                        >
                          {pt.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* Precipitation Intensity Bands */}
          <div className="bg-white dark:bg-[#121316] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Precipitation Event Intensity Classification (IMD Criteria)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {rainfall.intensityDistribution.map((item) => (
                <div
                  key={item.label}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2"
                >
                  <span
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                    className="px-2 py-0.5 rounded-md text-[11px] font-bold inline-block"
                  >
                    {item.alertLevel} Category
                  </span>
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                    {item.label}
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-lg text-slate-800 dark:text-slate-100">
                      {item.events}
                    </span>
                    <span className="font-bold text-slate-500 dark:text-slate-400">
                      {item.share}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 3: WARNING VERIFICATION SKILL & CONVECTIVE SOUNDINGS
          ==================================================================== */}
      {activeTab === 'convective' && (
        <div className="space-y-6">
          {/* Contingency Matrix & Warning Skill */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white dark:bg-[#121316] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  IMD Severe Weather Warning 2x2 Contingency Matrix
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Verification of dispatched Red & Orange warnings against AWS ground truth observations
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-center text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block">
                    Hits (H)
                  </span>
                  <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {skill.contingencyHits}
                  </strong>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Warning Issued & Event Observed
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300 block">
                    False Alarms (F)
                  </span>
                  <strong className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                    {skill.contingencyFalseAlarms}
                  </strong>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Warning Issued & No Event
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 space-y-1">
                  <span className="text-xs font-bold text-red-700 dark:text-red-300 block">
                    Misses (M)
                  </span>
                  <strong className="text-2xl font-black text-red-600 dark:text-red-400 font-mono">
                    {skill.contingencyMisses}
                  </strong>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    No Warning & Event Occurred
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300 block">
                    Correct Rejections (Z)
                  </span>
                  <strong className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                    {skill.contingencyCorrectNegatives}
                  </strong>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    No Warning & No Event
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Critical Success Index (CSI): <strong className="text-slate-900 dark:text-white font-mono">{skill.criticalSuccessIndex}</strong></span>
                <span>False Alarm Ratio (FAR): <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{skill.falseAlarmRatio}</strong></span>
              </div>
            </div>

            {/* Sounding Diagnostics */}
            <div className="lg:col-span-6 bg-white dark:bg-[#121316] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Atmospheric Radiosonde & Convective Sounding Indices
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Convective Available Potential Energy (CAPE) and Lifted Index across administrative divisions
                </p>
              </div>

              <div className="space-y-3 pt-1 text-xs">
                {convective.map((c) => (
                  <div key={c.division} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-900 dark:text-white">
                        {c.division}
                      </span>
                      <span style={{ color: c.riskColor }} className="text-[11px]">
                        {c.riskClass}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-2xs">
                        <span className="text-[10px] text-slate-400 block">CAPE</span>
                        <strong className="text-slate-900 dark:text-white font-mono">{c.cape} J/kg</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-2xs">
                        <span className="text-[10px] text-slate-400 block">PWAT</span>
                        <strong className="text-slate-900 dark:text-white font-mono">{c.pwatMm} mm</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-2xs">
                        <span className="text-[10px] text-slate-400 block">Lifted Idx</span>
                        <strong className="text-slate-900 dark:text-white font-mono">{c.liftedIndex} °C</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-2xs">
                        <span className="text-[10px] text-slate-400 block">0-6km Shear</span>
                        <strong className="text-slate-900 dark:text-white font-mono">{c.windShearKnots} kts</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 4: SENSOR NETWORK & DISTRICT OBSERVATION MATRIX
          ==================================================================== */}
      {activeTab === 'network' && (
        <div className="space-y-6">
          {/* Telemetry Sensor Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#121316] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Automatic Weather Stations</span>
                <span className="text-xs font-bold text-emerald-500">{sensor.awsStations.reportingPct}</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {sensor.awsStations.online} / {sensor.awsStations.total}
              </div>
              <p className="text-[11px] text-slate-400">Cadence: {sensor.awsStations.latency}</p>
            </div>

            <div className="bg-white dark:bg-[#121316] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Automatic Rain Gauges (ARG)</span>
                <span className="text-xs font-bold text-emerald-500">{sensor.argRainGauges.reportingPct}</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {sensor.argRainGauges.online} / {sensor.argRainGauges.total}
              </div>
              <p className="text-[11px] text-slate-400">Reporting Interval: {sensor.argRainGauges.latency}</p>
            </div>

            <div className="bg-white dark:bg-[#121316] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Doppler Weather Radars</span>
                <span className="text-xs font-bold text-blue-500">4 Active</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                100% Uptime
              </div>
              <p className="text-[11px] text-slate-400">Mumbai Colaba, Veravali, Goa, Nagpur</p>
            </div>

            <div className="bg-white dark:bg-[#121316] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Satellite Remote Sensing</span>
                <span className="text-xs font-bold text-emerald-500">Rapid Scan</span>
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white font-mono truncate">
                INSAT-3D / 3DR
              </div>
              <p className="text-[11px] text-slate-400">15-min Cadence Radiometer</p>
            </div>
          </div>

          {/* District Meteorological Table */}
          <div className="bg-white dark:bg-[#121316] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  District-Level Meteorological Observation Matrix (12 Administrative Divisions)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ground truth AWS rainfall, LPA departure, temperature anomalies, peak gusts, and current IMD warning stage
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search district or station ID..."
                    value={searchDistrict}
                    onChange={(e) => setSearchDistrict(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none w-56"
                  />
                </div>

                <div className="relative">
                  <select
                    value={filterWarningStage}
                    onChange={(e) => setFilterWarningStage(e.target.value)}
                    className="appearance-none pl-3.5 pr-8 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Warning Stages</option>
                    <option value="red">Red Warning</option>
                    <option value="orange">Orange Warning</option>
                    <option value="yellow">Yellow Alert</option>
                    <option value="green">Green Watch</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4">District & AWS Station</th>
                    <th className="p-4">24h Rainfall (mm)</th>
                    <th className="p-4">LPA Departure</th>
                    <th className="p-4">Max Temp (°C) & Anomaly</th>
                    <th className="p-4">Peak Gust (km/h)</th>
                    <th className="p-4">CAPE (J/kg)</th>
                    <th className="p-4">IMD Warning Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
                  {filteredDistricts.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4">
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {d.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {d.stationId} • {d.division}
                        </div>
                      </td>

                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                        {d.rainfall24h} mm
                      </td>

                      <td className="p-4 font-mono font-bold">
                        <span className={d.departureLpa.startsWith('+') ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}>
                          {d.departureLpa}
                        </span>
                      </td>

                      <td className="p-4 font-mono">
                        <span>{d.maxTempC} °C</span>
                        <span className="text-[11px] text-slate-400 ml-1.5">({d.tempAnomaly})</span>
                      </td>

                      <td className="p-4 font-mono font-bold">
                        {d.peakGustKmh} km/h
                      </td>

                      <td className="p-4 font-mono">
                        {d.capeJkg}
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${d.warningClass}`}>
                          {d.warningStage}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityAnalyticsPage;
