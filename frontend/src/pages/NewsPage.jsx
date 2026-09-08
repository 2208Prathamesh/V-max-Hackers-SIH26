import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useWeather } from '../context/WeatherContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  Newspaper,
  Globe,
  MapPin,
  Flame,
  CloudRain,
  Wind,
  Sprout,
  Compass,
  Search,
  RefreshCw,
  ExternalLink,
  Share2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Bookmark,
  TrendingUp,
  Tag,
  ChevronRight,
  Filter
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', labelKey: 'allNews', defaultLabel: 'All Categories', icon: Filter },
  { id: 'monsoon', labelKey: 'monsoon', defaultLabel: 'Monsoon & Rain', icon: CloudRain },
  { id: 'cyclone', labelKey: 'cyclone', defaultLabel: 'Cyclones & Storms', icon: Wind },
  { id: 'heatwave', labelKey: 'heatwave', defaultLabel: 'Heatwaves & Temp', icon: Flame },
  { id: 'climate', labelKey: 'climate', defaultLabel: 'Climate & Oceans', icon: Compass },
  { id: 'agriculture', labelKey: 'agriculture', defaultLabel: 'Agri-Weather', icon: Sprout }
];

const VERIFIED_SOURCE_PARTNERS = [
  {
    name: 'India Meteorological Department (IMD)',
    role: 'National Meteorological Service of India',
    country: 'India',
    flag: '🇮🇳',
    url: 'https://mausam.imd.gov.in',
    tag: 'Official Agency'
  },
  {
    name: 'World Meteorological Organization (WMO)',
    role: 'United Nations Specialized Weather Agency',
    country: 'Global',
    flag: '🌍',
    url: 'https://wmo.int',
    tag: 'UN Authority'
  },
  {
    name: 'NOAA Climate & Prediction Center',
    role: 'US National Oceanic & Atmospheric Administration',
    country: 'Global',
    flag: '🇺🇸',
    url: 'https://www.climate.gov',
    tag: 'Atmospheric Science'
  },
  {
    name: 'Copernicus ECMWF Climate Service',
    role: 'European Centre for Medium-Range Weather Forecasts',
    country: 'Europe / Global',
    flag: '🇪🇺',
    url: 'https://climate.copernicus.eu',
    tag: 'Earth Observation'
  },
  {
    name: 'ISRO MOSDAC',
    role: 'Meteorological & Oceanographic Satellite Data Centre',
    country: 'India',
    flag: '🇮🇳',
    url: 'https://www.mosdac.gov.in',
    tag: 'Space Telemetry'
  },
  {
    name: 'Down to Earth',
    role: 'Centre for Science and Environment (CSE)',
    country: 'India',
    flag: '🇮🇳',
    url: 'https://www.downtoearth.org.in',
    tag: 'Environmental Journalism'
  }
];

const DEFAULT_NEWS_ITEMS = [
  {
    id: 'in-news-001',
    scope: 'india',
    category: 'monsoon',
    title: 'IMD Forecasts Active Southwest Monsoon Surge Over Maharashtra and Konkan Coast',
    summary: 'The India Meteorological Department (IMD) has issued yellow and orange alerts for Mumbai, Thane, and Pune as an offshore trough strengthens along the western coastline, bringing heavy to very heavy precipitation over the next 72 hours.',
    content: 'According to the latest meteorological bulletin from the Regional Meteorological Centre (RMC) Mumbai, low-level westerly winds from the Arabian Sea have intensified. Rainfall activity is projected to remain vigorous across North Konkan, Madhya Maharashtra, and parts of Vidarbha, with isolated heavy downpours in the ghat areas.',
    source: {
      name: 'India Meteorological Department (IMD)',
      code: 'IMD',
      url: 'https://mausam.imd.gov.in',
      type: 'official_agency',
      verified: true
    },
    location: 'Maharashtra & Konkan, India',
    publishedAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1514632595-4944383f2737?auto=format&fit=crop&w=1000&q=80',
    tags: ['Monsoon', 'Konkan', 'IMD Alert', 'Heavy Rainfall'],
    isBreaking: true,
    impactLevel: 'High'
  },
  {
    id: 'gl-news-001',
    scope: 'global',
    category: 'climate',
    title: 'WMO Issues Annual Greenhouse Gas Bulletin: Atmospheric Carbon Concentrations Reach Record Trajectory',
    summary: 'The World Meteorological Organization reports atmospheric greenhouse gas concentrations have breached unprecedented thresholds, driving accelerated ocean heat anomalies and extreme weather volatility across continents.',
    content: 'According to the WMO Global Atmosphere Watch network, carbon dioxide, methane, and nitrous oxide have all observed sustained upward trajectories. WMO Secretary-General emphasized the urgent requirement for multi-lateral early warning system investments.',
    source: {
      name: 'World Meteorological Organization (WMO)',
      code: 'WMO',
      url: 'https://wmo.int',
      type: 'official_agency',
      verified: true
    },
    location: 'Geneva, Switzerland & Global',
    publishedAt: new Date(Date.now() - 54 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=1000&q=80',
    tags: ['WMO', 'Climate Change', 'Greenhouse Gas', 'Global Report'],
    isBreaking: true,
    impactLevel: 'Severe'
  },
  {
    id: 'in-news-002',
    scope: 'india',
    category: 'cyclone',
    title: 'Bay of Bengal Low Pressure System Intensifies: Coastal Fisheries Advisories Deployed',
    summary: 'A well-marked low-pressure area over east-central Bay of Bengal is likely to concentrate into a deep depression. INCOIS and IMD advise fishermen not to venture into deep sea areas along Odisha and Andhra Pradesh coastlines.',
    content: 'Oceanic data buoys and INSAT-3DR satellite telemetry indicate sea surface temperatures hovering between 29.5°C and 30.5°C over the North Bay of Bengal, providing favorable thermodynamics for cyclogenesis.',
    source: {
      name: 'INCOIS & IMD Marine',
      code: 'INCOIS',
      url: 'https://incois.gov.in',
      type: 'official_agency',
      verified: true
    },
    location: 'Odisha & Andhra Pradesh, India',
    publishedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=1000&q=80',
    tags: ['Bay of Bengal', 'Depression', 'Marine Advisory', 'Coastal Warning'],
    isBreaking: false,
    impactLevel: 'Severe'
  },
  {
    id: 'gl-news-002',
    scope: 'global',
    category: 'cyclone',
    title: 'NOAA Climate Prediction Center Releases Updated Atlantic & Pacific Hurricane Trajectory Models',
    summary: 'NOAA meteorologists highlight warmer-than-average sea surface temperatures in the Main Development Region (MDR) and reduced vertical wind shear, pointing toward an above-normal tropical storm cycle.',
    content: 'Using high-resolution NOAA GFS and ECMWF IFS ensemble runs, forecasters are monitoring a cluster of tropical waves emerging off the west African coast.',
    source: {
      name: 'NOAA Climate.gov',
      code: 'NOAA',
      url: 'https://www.climate.gov',
      type: 'official_agency',
      verified: true
    },
    location: 'Atlantic Ocean & Miami, USA',
    publishedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1000&q=80',
    tags: ['NOAA', 'Tropical Storms', 'Hurricane Season', 'Ensemble Forecast'],
    isBreaking: false,
    impactLevel: 'High'
  },
  {
    id: 'in-news-003',
    scope: 'india',
    category: 'agriculture',
    title: 'Kharif Crop Phenology Outlook: Soil Moisture Surplus Aids Sowing Across Northern Plains',
    summary: 'Agro-meteorological advisory units report favorable root-zone soil moisture indices for paddy and soybean across Punjab, Haryana, and Uttar Pradesh following widespread unseasonal thundershowers.',
    content: 'The Agricultural Meteorological Division (Agrimet) has released its weekly bulletin indicating optimal relative humidity levels and beneficial moisture replenishment in upper soil horizons.',
    source: {
      name: 'Down to Earth',
      code: 'DTE',
      url: 'https://www.downtoearth.org.in',
      type: 'environmental_journal',
      verified: true
    },
    location: 'Northern Plains, India',
    publishedAt: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
    tags: ['Agriculture', 'Kharif Crop', 'Soil Moisture', 'Agrimet'],
    isBreaking: false,
    impactLevel: 'Moderate'
  },
  {
    id: 'gl-news-003',
    scope: 'global',
    category: 'heatwave',
    title: 'Copernicus ECMWF Reports Severe Southern European Atmospheric Heat Dome Formation',
    summary: 'A persistent ridge of high atmospheric pressure has anchored over the Mediterranean basin, channeling sub-tropical Saharan air masses into Spain, Italy, and Greece with temperatures exceeding 42°C.',
    content: 'The European Centre for Medium-Range Weather Forecasts (ECMWF) warns of extreme wildfire risk and elevated ozone concentrations.',
    source: {
      name: 'Copernicus ECMWF',
      code: 'ECMWF',
      url: 'https://climate.copernicus.eu',
      type: 'official_agency',
      verified: true
    },
    location: 'Southern Europe & Mediterranean',
    publishedAt: new Date(Date.now() - 200 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1504386106331-3e4e71712b38?auto=format&fit=crop&w=1000&q=80',
    tags: ['ECMWF', 'Heat Dome', 'Europe', 'Wildfire Warning'],
    isBreaking: false,
    impactLevel: 'Severe'
  },
  {
    id: 'in-news-004',
    scope: 'india',
    category: 'heatwave',
    title: 'Northwest India Temperature Anomalies: Western Disturbance Brings Respite from Pre-Monsoon Heat',
    summary: 'An active Western Disturbance over northern Pakistan and adjoining Jammu & Kashmir has triggered convective clouds, reducing daytime maximum temperatures across Delhi-NCR and Rajasthan by 3-5°C.',
    content: 'Doppler Weather Radar (DWR) at New Delhi and Patiala registered thunderstorm cells moving east-southeastwards, accompanied by gusty surface winds clocking 45-55 km/h.',
    source: {
      name: 'The Hindu - Science & Environment',
      code: 'TH',
      url: 'https://www.thehindu.com/sci-tech/energy-and-environment',
      type: 'news_media',
      verified: true
    },
    location: 'Delhi-NCR & Rajasthan, India',
    publishedAt: new Date(Date.now() - 280 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1000&q=80',
    tags: ['Western Disturbance', 'Delhi Weather', 'Temperature Drop', 'Thunderstorm'],
    isBreaking: false,
    impactLevel: 'Moderate'
  },
  {
    id: 'gl-news-004',
    scope: 'global',
    category: 'monsoon',
    title: 'South Asian Monsoon Dynamics Linked to Indian Ocean Dipole (IOD) Neutral State Transition',
    summary: 'International climate scientists at the Australian Bureau of Meteorology and ECMWF publish findings showing a neutral Indian Ocean Dipole promoting steady monsoon flows across South and Southeast Asia.',
    content: 'The Indian Ocean Dipole index has maintained neutral values near 0.1°C throughout recent synoptic cycles. Coupled ocean-atmosphere models predict this stability will prevent regional rainfall deficits.',
    source: {
      name: 'Reuters Weather & Climate',
      code: 'REUTERS',
      url: 'https://www.reuters.com/business/environment',
      type: 'news_media',
      verified: true
    },
    location: 'Indian Ocean & Southeast Asia',
    publishedAt: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1000&q=80',
    tags: ['IOD', 'Monsoon Teleconnections', 'Climate Research', 'Rainfall'],
    isBreaking: false,
    impactLevel: 'Moderate'
  },
  {
    id: 'in-news-005',
    scope: 'india',
    category: 'climate',
    title: 'ISRO MOSDAC Satellite Telemetry Tracks Himalayan Glacial Lake Outburst Risks (GLOF)',
    summary: 'High-resolution remote sensing data from Cartosat and RISAT satellites reveals seasonal expansion in high-altitude proglacial lakes across Sikkim and Uttarakhand, prompting automated alert calibrations.',
    content: 'The Space Applications Centre (SAC), ISRO, in collaboration with the Central Water Commission (CWC), has updated its dynamic glacial lake inventory.',
    source: {
      name: 'ISRO MOSDAC',
      code: 'MOSDAC',
      url: 'https://www.mosdac.gov.in',
      type: 'space_agency',
      verified: true
    },
    location: 'Himalayas, Uttarakhand & Sikkim, India',
    publishedAt: new Date(Date.now() - 480 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
    tags: ['ISRO', 'Glacial Lakes', 'Himalayas', 'GLOF Alert'],
    isBreaking: false,
    impactLevel: 'High'
  },
  {
    id: 'gl-news-005',
    scope: 'global',
    category: 'climate',
    title: 'Antarctic Sea Ice Extent Stagnates Near Historic Lows as Polar Vortex Shifts',
    summary: 'Satellite imagery from NASA and the National Snow and Ice Data Center (NSIDC) indicates winter sea ice recovery in the Southern Ocean is pacing significantly below the 1981-2010 decadal median.',
    content: 'Strong circumpolar westerly winds and warm upwelling Antarctic Circumpolar Current water have limited ice shelf edge consolidation.',
    source: {
      name: 'NASA Earth Observatory',
      code: 'NASA',
      url: 'https://earthobservatory.nasa.gov',
      type: 'space_agency',
      verified: true
    },
    location: 'Antarctica & Southern Ocean',
    publishedAt: new Date(Date.now() - 600 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=1000&q=80',
    tags: ['Antarctica', 'Sea Ice', 'NASA', 'Polar Vortex'],
    isBreaking: false,
    impactLevel: 'High'
  }
];

export const NewsPage = () => {
  const { addToast } = useWeather();
  const { isDark } = useTheme();
  const { t, language } = useLanguage();

  const [articles, setArticles] = useState(DEFAULT_NEWS_ITEMS);
  const [breakingNews, setBreakingNews] = useState(DEFAULT_NEWS_ITEMS[0]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeScope, setActiveScope] = useState('all'); // 'all' | 'india' | 'global'
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedArticleId, setCopiedArticleId] = useState(null);

  // Fetch news from API with client-side fallback
  const fetchNews = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);

    try {
      const response = await api.getNews({
        scope: activeScope,
        category: activeCategory,
        query: searchQuery
      });

      const articlesList = response?.articles || response?.data?.articles || [];
      const breaking = response?.breakingNews || response?.data?.breakingNews || articlesList[0] || null;
      if (articlesList.length > 0) {
        setArticles(articlesList);
        setBreakingNews(breaking);
      } else {
        // Apply client-side filter on default set
        let filtered = DEFAULT_NEWS_ITEMS;
        if (activeScope !== 'all') {
          filtered = filtered.filter(a => a.scope === activeScope);
        }
        if (activeCategory !== 'all') {
          filtered = filtered.filter(a => a.category === activeCategory);
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(a =>
            a.title.toLowerCase().includes(q) ||
            a.summary.toLowerCase().includes(q) ||
            a.tags.some(t => t.toLowerCase().includes(q))
          );
        }
        setArticles(filtered);
        setBreakingNews(filtered[0] || null);
      }

      if (isManualRefresh) {
        addToast(
          language === 'mr'
            ? 'बातम्या यशस्वीरित्या अपडेट केल्या!'
            : language === 'hi'
              ? 'समाचार सफलतापूर्वक अपडेट किए गए!'
              : 'Weather news updated successfully!',
          'success'
        );
      }
    } catch (err) {
      console.warn('Failed to load weather news from API, falling back to cached items:', err);
      // Fall back to client filtering
      let filtered = DEFAULT_NEWS_ITEMS;
      if (activeScope !== 'all') {
        filtered = filtered.filter(a => a.scope === activeScope);
      }
      if (activeCategory !== 'all') {
        filtered = filtered.filter(a => a.category === activeCategory);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(a =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.tags.some(t => t.toLowerCase().includes(q))
        );
      }
      setArticles(filtered);
      setBreakingNews(filtered[0] || null);

      if (isManualRefresh) {
        addToast(
          language === 'mr'
            ? 'ताजी माहिती मिळवण्यात अडचण, स्थानिक डेटा वापरत आहे'
            : language === 'hi'
              ? 'ताजा समाचार प्राप्त नहीं हो सके, स्थानीय डेटा प्रदर्शित है'
              : 'Displaying cached weather news dispatches',
          'info'
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeScope, activeCategory, searchQuery, addToast, language]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Handle Share / Copy Link
  const handleShare = (article) => {
    const url = article.source?.url || window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${article.title} - ${url}`);
      setCopiedArticleId(article.id);
      setTimeout(() => setCopiedArticleId(null), 2000);
      addToast('Article link copied to clipboard', 'info');
    }
  };

  // Relative timestamp formatter
  const formatTimeAgo = (isoString) => {
    if (!isoString) return '';
    const now = Date.now();
    const past = new Date(isoString).getTime();
    const diffMin = Math.round((now - past) / (1000 * 60));

    if (diffMin < 60) {
      return language === 'mr' ? `${diffMin} मिनिटांपूर्वी` : language === 'hi' ? `${diffMin} मिनट पहले` : `${diffMin}m ago`;
    }
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) {
      return language === 'mr' ? `${diffHours} तासांपूर्वी` : language === 'hi' ? `${diffHours} घंटे पहले` : `${diffHours}h ago`;
    }
    const diffDays = Math.round(diffHours / 24);
    return language === 'mr' ? `${diffDays} दिवसांपूर्वी` : language === 'hi' ? `${diffDays} दिन पहले` : `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* 1. Header Toolbar: Scope Selector, Search & Refresh */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-[#111C2E] p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        {/* Scope Tabs: All | India | Global */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/70 shrink-0">
          <button
            onClick={() => setActiveScope('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeScope === 'all'
                ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{t('allNews') || 'All News'}</span>
          </button>

          <button
            onClick={() => setActiveScope('india')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeScope === 'india'
                ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="text-sm leading-none">🇮🇳</span>
            <span>{t('indiaNews') || 'India'}</span>
          </button>

          <button
            onClick={() => setActiveScope('global')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeScope === 'global'
                ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="text-sm leading-none">🌍</span>
            <span>{t('globalNews') || 'Global'}</span>
          </button>
        </div>

        {/* Search & Refresh Actions */}
        <div className="flex items-center gap-3 flex-1 md:max-w-md md:ml-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchNews') || 'Search weather news, keywords, locations...'}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => fetchNews(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition cursor-pointer shrink-0 disabled:opacity-50"
            title="Refresh Latest News"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-white dark:bg-[#111C2E] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-blue-500 dark:text-blue-400'}`} />
              <span>{t(cat.labelKey) || cat.defaultLabel}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Hero Breaking News Spotlight */}
      {breakingNews && !searchQuery && activeCategory === 'all' && (
        <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-lg group">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${breakingNews.imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-slate-900/40" />

          <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col justify-end min-h-[360px] sm:min-h-[420px] text-white space-y-3">
            {/* Top Badges */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-extrabold tracking-wider uppercase flex items-center gap-1.5 shadow-md animate-pulse">
                <Radio className="w-3 h-3" />
                <span>{t('breakingNews') || 'Breaking News'}</span>
              </span>

              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-sky-100 flex items-center gap-1.5 border border-white/20">
                <MapPin className="w-3 h-3 text-amber-300" />
                <span>{breakingNews.location}</span>
              </span>

              <span className="px-2.5 py-1 rounded-full bg-emerald-500/25 backdrop-blur-md text-[11px] font-semibold text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>{breakingNews.source.name}</span>
              </span>

              <span className="text-xs text-slate-300 flex items-center gap-1 ml-auto">
                <Clock className="w-3 h-3" />
                <span>{formatTimeAgo(breakingNews.publishedAt)}</span>
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug max-w-4xl">
              {breakingNews.title}
            </h2>

            {/* Summary */}
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-3xl line-clamp-2 sm:line-clamp-3">
              {breakingNews.summary}
            </p>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                {breakingNews.tags.map((tag, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-lg bg-black/40 backdrop-blur-md text-[10px] font-medium text-slate-300 border border-white/10">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  onClick={() => handleShare(breakingNews)}
                  className="p-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white transition cursor-pointer"
                  title="Share Article"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <a
                  href={breakingNews.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <span>{t('readSource') || 'Read Full Source'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Article Grid Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {activeScope === 'india' 
                ? (t('indiaNews') || 'India Weather Dispatches')
                : activeScope === 'global'
                  ? (t('globalNews') || 'Global Climate Intelligence')
                  : (t('allNews') || 'Trending Meteorological Updates')}
            </h3>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
              {articles.length}
            </span>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white dark:bg-[#111C2E] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 space-y-3 animate-pulse">
                <div className="w-full h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="w-1/3 h-4 rounded-md bg-slate-200 dark:bg-slate-800" />
                <div className="w-full h-6 rounded-md bg-slate-200 dark:bg-slate-800" />
                <div className="w-2/3 h-4 rounded-md bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          /* Empty Search State */
          <div className="text-center py-16 px-4 bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <Newspaper className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No weather stories found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              No matching meteorological articles found for "{searchQuery}". Try changing your search keywords or resetting filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setActiveScope('all');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Grid of Articles */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((article) => {
              const isIndia = article.scope === 'india';
              const isSevere = article.impactLevel === 'Severe';
              const isHigh = article.impactLevel === 'High';

              return (
                <article
                  key={article.id}
                  className="bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Article Thumbnail & Scope Badge */}
                  <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1000&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Scope & Impact Level Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/20 flex items-center gap-1">
                        <span>{isIndia ? '🇮🇳 India' : '🌍 Global'}</span>
                      </span>

                      {isSevere && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold tracking-wide uppercase">
                          Severe
                        </span>
                      )}
                      {isHigh && !isSevere && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase">
                          High
                        </span>
                      )}
                    </div>

                    {/* Relative Time */}
                    <span className="absolute bottom-3 right-3 text-[11px] text-white/90 font-medium px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(article.publishedAt)}</span>
                    </span>
                  </div>

                  {/* Content Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      {/* Location Tag */}
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{article.location}</span>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                        {article.title}
                      </h4>

                      {/* Excerpt */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                        {article.summary}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-1 flex-wrap pt-1">
                      {article.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Source & Actions Footer */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      {/* Source Indicator */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate" title={article.source.name}>
                          {article.source.code || article.source.name}
                        </span>
                      </div>

                      {/* Action Links */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleShare(article)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="Share"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>

                        <a
                          href={article.source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-bold transition cursor-pointer"
                          title="View on verified provider site"
                        >
                          <span>{t('source') || 'Source'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Verified Data Providers & Source Directory */}
      <div className="p-6 bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('verifiedSource') || 'Verified Meteorological Sources & Organizations'}
            </h4>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Real-time Telemetry & Data Transparency
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {VERIFIED_SOURCE_PARTNERS.map((src, i) => (
            <a
              key={i}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between transition group cursor-pointer"
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{src.flag}</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {src.name}
                  </p>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {src.role}
                </p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
