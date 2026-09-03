import React, { useState, useEffect } from 'react';
import { useWeather } from '../context/WeatherContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  Sprout,
  Droplets,
  Wind,
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sun,
  Activity,
  Layers,
  Thermometer,
  Sparkles,
  Leaf,
  Clock,
  Gauge
} from 'lucide-react';

const CROP_PROFILES = [
  {
    id: 'cotton',
    name: 'Cotton (कपास / कापूस)',
    icon: '🌱',
    stages: ['Sowing (0-20d)', 'Vegetative (21-50d)', 'Squaring / Flowering (51-90d)', 'Boll Formation (91-130d)', 'Harvest'],
    optimalMoisture: '30-45%',
    waterRequirement: 'High',
    sprayWindow: 'Dry morning with wind < 15 km/h'
  },
  {
    id: 'rice',
    name: 'Rice / Paddy (भात / धान)',
    icon: '🌾',
    stages: ['Nursery (0-25d)', 'Tillering (26-55d)', 'Panicle Initiation (56-80d)', 'Grain Filling', 'Maturity'],
    optimalMoisture: '70-90%',
    waterRequirement: 'Very High',
    sprayWindow: 'Clear sky between 8 AM - 11 AM'
  },
  {
    id: 'wheat',
    name: 'Wheat (गहू / गेहूं)',
    icon: '🌾',
    stages: ['Crown Root (20-25d)', 'Tillering', 'Jointing', 'Heading', 'Dough Stage'],
    optimalMoisture: '35-50%',
    waterRequirement: 'Moderate',
    sprayWindow: 'Early morning post-dew evaporation'
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane (ऊस / गन्ना)',
    icon: '🎋',
    stages: ['Germination', 'Formative Stage', 'Grand Growth', 'Maturity & Ripening'],
    optimalMoisture: '50-65%',
    waterRequirement: 'Heavy',
    sprayWindow: 'Favorable throughout sunny afternoons'
  },
  {
    id: 'soybean',
    name: 'Soybean (सोयाबीन)',
    icon: '🌿',
    stages: ['Emergence', 'Vegetative', 'Flowering', 'Pod Development', 'Harvest'],
    optimalMoisture: '35-48%',
    waterRequirement: 'Moderate',
    sprayWindow: 'Avoid spraying when rain probability > 40%'
  },
  {
    id: 'tomato',
    name: 'Tomato / Vegetables (टोमॅटो)',
    icon: '🍅',
    stages: ['Transplanting', 'Vegetative', 'First Flower', 'Fruit Setting', 'Harvest'],
    optimalMoisture: '40-55%',
    waterRequirement: 'Regular Drip',
    sprayWindow: 'Foliar spray favorable under mild sunlight'
  }
];

export const AdvisoryPage = () => {
  const { selectedMapLocation, formatTemp, addToast } = useWeather();
  const { t, language } = useLanguage();

  const [selectedCropId, setSelectedCropId] = useState('cotton');
  const [activeTab, setActiveTab] = useState('agriculture'); // 'agriculture' | 'disaster'
  const [agroData, setAgroData] = useState(null);
  const [disasterData, setDisasterData] = useState(null);
  const [loading, setLoading] = useState(false);

  const cityName = selectedMapLocation?.city || 'Pune';
  const latitude = selectedMapLocation?.lat ?? selectedMapLocation?.latitude ?? 18.5204;
  const longitude = selectedMapLocation?.lng ?? selectedMapLocation?.longitude ?? 73.8567;

  const currentCrop = CROP_PROFILES.find((c) => c.id === selectedCropId) || CROP_PROFILES[0];

  const fetchAdvisories = async () => {
    setLoading(true);
    try {
      const [agro, disaster] = await Promise.all([
        api.agricultureAdvisory({ city: cityName, latitude, longitude, crop: selectedCropId }),
        api.disasterAdvisory({ city: cityName, latitude, longitude })
      ]);
      setAgroData(agro);
      setDisasterData(disaster);
    } catch (err) {
      addToast(err.message || 'Failed to fetch advisories', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisories();
  }, [cityName, selectedCropId]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900/40 via-slate-900/60 to-blue-900/40 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
            <Sprout className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
              <span>{t('decisionSupport')}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Target Zone: <span className="text-emerald-400 font-bold">{cityName}</span> ({latitude.toFixed(2)}°N, {longitude.toFixed(2)}°E)
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-700/80">
            <button
              onClick={() => setActiveTab('agriculture')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'agriculture'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🌾 {t('cropAdvisory')}
            </button>
            <button
              onClick={() => setActiveTab('disaster')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'disaster'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🚨 {t('disasterActionPlan')}
            </button>
          </div>

          <button
            onClick={fetchAdvisories}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title={t('refresh')}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {activeTab === 'agriculture' ? (
        /* Agriculture Tab */
        <div className="space-y-6">
          {/* Crop Profile Selection Strip */}
          <div className="bg-white dark:bg-[#151F32] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-500" /> {t('cropSelector')}:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {CROP_PROFILES.map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => setSelectedCropId(crop.id)}
                  className={`p-3.5 rounded-2xl text-left transition-all border flex flex-col justify-between gap-2 ${
                    selectedCropId === crop.id
                      ? 'bg-emerald-500/15 border-emerald-500/60 ring-2 ring-emerald-500/30 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-2xl">{crop.icon}</span>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block truncate">{crop.name}</span>
                    <span className="text-[10px] text-slate-400 block">{crop.optimalMoisture} moisture</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Growth Stage Progress Pipeline */}
          <div className="bg-white dark:bg-[#151F32] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" /> Phenological Crop Growth Stages ({currentCrop.name}):
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {currentCrop.stages.map((stage, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl border text-center transition ${
                    i === 1
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 font-extrabold shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 text-slate-400'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider block font-semibold text-slate-400">Stage {i + 1}</span>
                  <span className="text-xs mt-1 block truncate">{stage}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Core Agro Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Topsoil Moisture Card */}
            <div className="bg-white dark:bg-[#151F32] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">{t('topsoilMoisture')}</span>
                <Droplets className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {agroData?.fieldConditions?.soilMoistureM3M3 ? `${(agroData.fieldConditions.soilMoistureM3M3 * 100).toFixed(0)}%` : '32%'}
              </div>
              <p className="text-[11px] text-slate-400">Volumetric root zone (0–7 cm)</p>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (agroData?.fieldConditions?.soilMoistureM3M3 || 0.32) * 100 * 2)}%` }}
                />
              </div>
            </div>

            {/* Evapotranspiration Card */}
            <div className="bg-white dark:bg-[#151F32] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">{t('evapotranspiration')}</span>
                <Sun className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-500">
                {agroData?.fieldConditions?.dailyEvapotranspirationMm ?? '4.2'} <span className="text-xs font-normal text-slate-400">mm/day</span>
              </div>
              <p className="text-[11px] text-slate-400">FAO-56 reference crop water loss</p>
            </div>

            {/* Soil Temperature Card */}
            <div className="bg-white dark:bg-[#151F32] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">{t('soilTemperature')}</span>
                <Thermometer className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-500">
                {formatTemp(agroData?.fieldConditions?.soilTemperatureC ?? 26)}
              </div>
              <p className="text-[11px] text-slate-400">Seedbed thermal index</p>
            </div>

            {/* 3-Day Rain Forecast */}
            <div className="bg-white dark:bg-[#151F32] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">{t('rainForecast3Day')}</span>
                <Activity className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {agroData?.fieldConditions?.forecastedRainfallNext3DaysMm ?? '0'} <span className="text-xs font-normal text-slate-400">mm</span>
              </div>
              <p className="text-[11px] text-slate-400">Predicted 72-hour precipitation</p>
            </div>
          </div>

          {/* Actionable Recommendations Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Irrigation Card */}
            <div className="bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 rounded-3xl p-6 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-400" /> {t('irrigationAdvisory')}
                </h3>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {agroData?.recommendations?.irrigation?.status || 'NORMAL'}
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {agroData?.recommendations?.irrigation?.advice || 'Monitor field moisture regularly and adhere to standard irrigation schedules.'}
              </p>
            </div>

            {/* Spraying Window Card */}
            <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                  <Wind className="w-5 h-5 text-emerald-400" /> {t('sprayingWindow')}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  agroData?.recommendations?.pesticideSpraying?.status === 'FAVORABLE'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {agroData?.recommendations?.pesticideSpraying?.status || 'FAVORABLE'}
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {agroData?.recommendations?.pesticideSpraying?.advice || currentCrop.sprayWindow}
              </p>
            </div>
          </div>

          {/* Agronomic Protection Guidance */}
          <div className="bg-white dark:bg-[#151F32] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" /> {t('agronomicHealth')}:
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {agroData?.recommendations?.cropSpecificAdvisory ||
                `Maintain soil aeration and balanced NPK fertilizer application for ${currentCrop.name}. Ensure field drainage channels are clear to prevent waterlogging during monsoon showers.`}
            </p>
          </div>
        </div>
      ) : (
        /* Disaster Action Plan Tab */
        <div className="space-y-6">
          {/* Active Warning Status Banner */}
          <div className={`p-6 rounded-3xl border backdrop-blur-xl ${
            disasterData?.alertLevel === 'Red'
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              : disasterData?.alertLevel === 'Orange'
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : 'bg-slate-900/60 border-slate-800 text-slate-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <ShieldAlert className="w-7 h-7 text-rose-400" />
              <div>
                <h2 className="text-lg font-bold">
                  {disasterData?.activeWarning?.warningLevel || 'Green'} Alert Status – {disasterData?.activeWarning?.action || 'No Active Emergency'}
                </h2>
                <p className="text-xs opacity-90 mt-0.5">
                  {disasterData?.activeWarning?.hazard || 'No severe meteorological hazard detected.'} {disasterData?.activeWarning?.advice || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Action Checklist */}
          <div className="bg-white dark:bg-[#151F32] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {t('disasterChecklist')}:
            </h3>
            <div className="space-y-3">
              {disasterData?.safetyActionChecklist?.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clickable 24x7 Emergency Helplines */}
          <div className="bg-white dark:bg-[#151F32] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-blue-500" /> {t('emergencyHotlines')}:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {disasterData?.emergencyHotlines?.map((hotline, idx) => (
                <a
                  key={idx}
                  href={`tel:${hotline.number}`}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition group block"
                >
                  <p className="text-xs text-slate-400">{hotline.name}</p>
                  <p className="text-lg font-black text-emerald-500 group-hover:text-blue-500 transition mt-1">
                    {hotline.number} 📞
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvisoryPage;
