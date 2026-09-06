import React, { useState, useEffect } from 'react';
import { useWeather } from '../context/WeatherContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { 
  Search, 
  Calendar, 
  MoreVertical, 
  Clock, 
  BarChart2, 
  Cloud, 
  Trash2, 
  MessageSquare, 
  Sparkles,
  TrendingUp,
  Thermometer,
  CloudRain,
  Flame,
  RefreshCw,
  Layers
} from 'lucide-react';
import { WeatherIcon } from '../components/common/WeatherIcon';

export const HistoryPage = () => {
  const { 
    conversations, 
    user, 
    createNewChat, 
    setActiveConversationId, 
    setCurrentPage, 
    deleteConversation, 
    selectedMapLocation,
    formatTemp,
    addToast 
  } = useWeather();
  const { t } = useLanguage();

  const [activeMainTab, setActiveMainTab] = useState('conversations'); // 'conversations' | 'climate'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDateTab, setActiveDateTab] = useState('all');
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Climate Trends State
  const [climateCity, setClimateCity] = useState(selectedMapLocation?.city || 'Pune');
  const [climateData, setClimateData] = useState(null);
  const [climateLoading, setClimateLoading] = useState(false);

  const fetchClimateTrends = async (cityName) => {
    setClimateLoading(true);
    try {
      const result = await api.climateTrends({ city: cityName, startYear: 2004, endYear: 2024 });
      setClimateData(result);
    } catch {
      addToast(t('error'), 'warning');
    } finally {
      setClimateLoading(false);
    }
  };

  useEffect(() => {
    if (activeMainTab === 'climate') {
      fetchClimateTrends(climateCity);
    }
  }, [activeMainTab, climateCity]);

  const dateTabs = [
    { id: 'all', label: t('allConversations') },
    { id: 'today', label: t('today') },
    { id: 'yesterday', label: t('yesterday') },
    { id: 'week', label: t('thisWeek') },
    { id: 'month', label: t('thisMonth') },
  ];

  const handleOpenConversation = (convId) => {
    setActiveConversationId(convId);
    setCurrentPage('chat');
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          conv.preview.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeDateTab === 'today' && !conv.dateGroup?.includes('Today')) return false;
    if (activeDateTab === 'yesterday' && !conv.dateGroup?.includes('Yesterday')) return false;
    return true;
  });

  const grouped = filteredConversations.reduce((acc, conv) => {
    const group = conv.dateGroup || t('recentHistory');
    if (!acc[group]) acc[group] = [];
    acc[group].push(conv);
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-12 select-none animate-fadeIn">
      {/* Header with Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#151F32] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-card">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>{t('historicalClimateAnalysis')}</span>
            <BarChart2 className="w-6 h-6 text-blue-600" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('historySubtitle')}
          </p>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveMainTab('conversations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeMainTab === 'conversations'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            💬 {t('conversationsTab')}
          </button>
          <button
            onClick={() => setActiveMainTab('climate')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeMainTab === 'climate'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            📈 {t('climateTab')}
          </button>
        </div>
      </div>

      {activeMainTab === 'climate' ? (
        /* 20-Year Climate Analysis Section */
        <div className="space-y-6">
          {/* Search Location Bar */}
          <div className="flex items-center gap-3 bg-white dark:bg-[#151F32] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t('searchClimatePlaceholder')}
                value={climateCity}
                onChange={(e) => setClimateCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchClimateTrends(climateCity)}
                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search
                onClick={() => fetchClimateTrends(climateCity)}
                className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-indigo-500"
              />
            </div>

            <button
              onClick={() => fetchClimateTrends(climateCity)}
              disabled={climateLoading}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${climateLoading ? 'animate-spin' : ''}`} />
              <span>{t('recalculateTrends')}</span>
            </button>
          </div>

          {/* Anomaly Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#151F32] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs uppercase font-bold tracking-wider">{t('warmingShift20Yr')}</span>
                <TrendingUp className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-rose-500">
                {climateData?.climateShift?.warmingShiftC !== undefined
                  ? `+${climateData.climateShift.warmingShiftC}°C`
                  : '+0.85°C'}
              </div>
              <p className="text-[11px] text-slate-400">{t('relativeToNormal')}</p>
            </div>

            <div className="bg-white dark:bg-[#151F32] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs uppercase font-bold tracking-wider">{t('rainfallAnomaly')}</span>
                <CloudRain className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {climateData?.climateShift?.annualPrecipitationShiftMm !== undefined
                  ? `${climateData.climateShift.annualPrecipitationShiftMm > 0 ? '+' : ''}${climateData.climateShift.annualPrecipitationShiftMm} mm`
                  : '-38.4 mm'}
              </div>
              <p className="text-[11px] text-slate-400">{t('annualCumulativeDeviation')}</p>
            </div>

            <div className="bg-white dark:bg-[#151F32] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs uppercase font-bold tracking-wider">{t('extremeHeatDays')}</span>
                <Flame className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-500">
                {climateData?.extremeWeatherDaysCount?.heatDaysAbove40C ?? 18} <span className="text-xs font-normal text-slate-400">{t('days')}</span>
              </div>
              <p className="text-[11px] text-slate-400">{t('daysAbove40C')}</p>
            </div>

            <div className="bg-white dark:bg-[#151F32] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs uppercase font-bold tracking-wider">{t('heavyRainEvents')}</span>
                <Thermometer className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="text-2xl font-black text-cyan-500">
                {climateData?.extremeWeatherDaysCount?.heavyRainDaysAbove50mm ?? 12} <span className="text-xs font-normal text-slate-400">{t('days')}</span>
              </div>
              <p className="text-[11px] text-slate-400">{t('precipAbove50mm')}</p>
            </div>
          </div>

          {/* Historical Trend Narrative */}
          <div className="bg-gradient-to-r from-indigo-950/30 to-slate-900/60 p-6 rounded-3xl border border-indigo-500/20 space-y-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> {climateCity} {t('scientificSummaryFor')}:
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t('scientificSummaryBody')}
            </p>
          </div>
        </div>
      ) : (
        /* Conversations History Section */
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#151F32] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Date Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800/80 pb-2 overflow-x-auto scrollbar-none">
            {dateTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveDateTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition relative ${
                  activeDateTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grouped History List */}
          <div className="space-y-6">
            {Object.keys(grouped).length > 0 ? (
              Object.entries(grouped).map(([dateGroup, items]) => (
                <div key={dateGroup} className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
                    {dateGroup}
                  </h3>

                  <div className="space-y-2.5">
                    {items.map(conv => (
                      <div
                        key={conv.id}
                        className="bg-white dark:bg-[#151F32] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-card hover:shadow-md transition flex items-center justify-between gap-4 group"
                      >
                        <div 
                          onClick={() => handleOpenConversation(conv.id)}
                          className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition">
                              {conv.title}
                            </h4>
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              {conv.preview}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-slate-400 hidden sm:inline">
                            {conv.time || '10:30 AM'}
                          </span>

                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-600 border border-blue-200 dark:border-blue-900">
                            {conv.tag || t('chat')}
                          </span>

                          <button
                            onClick={() => deleteConversation(conv.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition"
                            title={t('deleteConversation')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                {t('noConversations')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
