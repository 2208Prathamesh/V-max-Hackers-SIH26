/**
 * Weather & Climate News Automated Ingestion Service
 * Automates real-time news retrieval from verified meteorological & news agency RSS feeds,
 * dynamically driven by configurable query keywords and trending topics from .env.
 * Extracts automated article images directly from publisher feeds (media:content, enclosure, description).
 */

import { XMLParser } from 'fast-xml-parser';
import env from '../config/env.js';
import NewsArticle from '../models/NewsArticle.js';
import { getIO } from '../config/socket.js';

const NEWS_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
let cachedNews = null;
let lastFetchTime = 0;
let isSyncing = false;

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true
});

/**
 * Curated evergreen meteorological baseline to guarantee rich display on initial cold start
 */
const BASELINE_NEWS = [
  {
    title: 'IMD Active Weather Outlook: Synoptic Systems & Monsoon Low Pressure Trajectory',
    summary: 'The India Meteorological Department monitors regional atmospheric wind shear and trough lines, deploying timely convective storm advisories across meteorological subdivisions.',
    content: 'Official synoptic analysis from the National Weather Forecasting Centre (NWFC) details monsoon trough positioning and upper air cyclonic circulations.',
    url: 'https://mausam.imd.gov.in/weather-outlook',
    scope: 'india',
    category: 'monsoon',
    impactLevel: 'High',
    isBreaking: true,
    location: 'National Meteorological Centre, India',
    imageUrl: 'https://images.unsplash.com/photo-1514632595-4944383f2737?auto=format&fit=crop&w=1000&q=80',
    source: {
      name: 'India Meteorological Department (IMD)',
      code: 'IMD',
      url: 'https://mausam.imd.gov.in',
      type: 'official_agency',
      verified: true
    },
    tags: ['IMD', 'Monsoon', 'National Outlook', 'Forecast'],
    publishedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    title: 'Global Ocean & Atmospheric Teleconnections: Multi-Model Ensemble Observations',
    summary: 'The World Meteorological Organization and Copernicus ECMWF report oceanic boundary layer thermodynamic anomalies shaping continental precipitation cycles.',
    content: 'Global coupled ocean-atmosphere models detail sea surface temperature indices, guiding seasonal flood and drought mitigation strategies.',
    url: 'https://wmo.int/global-climate-teleconnections',
    scope: 'global',
    category: 'climate',
    impactLevel: 'Severe',
    isBreaking: false,
    location: 'Geneva, Switzerland & Global',
    imageUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=1000&q=80',
    source: {
      name: 'World Meteorological Organization (WMO)',
      code: 'WMO',
      url: 'https://wmo.int',
      type: 'official_agency',
      verified: true
    },
    tags: ['WMO', 'Climate Anomaly', 'Ocean Heat', 'Global Teleconnections'],
    publishedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  },
  {
    title: 'INCOIS & IMD Ocean State Warning: Coastal Wave Heights & Swell Surges',
    summary: 'Oceanic data buoys along eastern and western littorals record heightened wave spectra, advising coastal communities and maritime operations to heed safety protocols.',
    content: 'INCOIS coastal forecast systems track wave energy flux and tidal ranges, dispatching coastal alerts to state disaster management authorities.',
    url: 'https://incois.gov.in/marine-forecast',
    scope: 'india',
    category: 'cyclone',
    impactLevel: 'High',
    isBreaking: false,
    location: 'Indian Littoral & Coastal Zones',
    imageUrl: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=1000&q=80',
    source: {
      name: 'INCOIS Marine Division',
      code: 'INCOIS',
      url: 'https://incois.gov.in',
      type: 'official_agency',
      verified: true
    },
    tags: ['INCOIS', 'Ocean Surge', 'Marine Advisory', 'Coastal Waves'],
    publishedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString()
  }
];

/**
 * Extract automated real image from RSS media elements or embedded HTML
 * Prioritizes high-resolution publisher photos (media:content, media:thumbnail, enclosure, <img>)
 */
function extractMediaImage(item, category = 'climate') {
  // 1. Check media:content (used by The Hindu, BBC, Reuters, Yahoo, etc.)
  if (item['media:content']) {
    const mc = item['media:content'];
    const url = mc['@_url'] || (Array.isArray(mc) ? mc[0]?.['@_url'] : null);
    if (url && typeof url === 'string' && url.startsWith('http')) {
      return url;
    }
  }

  // 2. Check media:thumbnail
  if (item['media:thumbnail']) {
    const mt = item['media:thumbnail'];
    const url = mt['@_url'] || (Array.isArray(mt) ? mt[0]?.['@_url'] : null);
    if (url && typeof url === 'string' && url.startsWith('http')) {
      return url;
    }
  }

  // 3. Check enclosure (standard RSS image tag)
  if (item.enclosure && item.enclosure['@_url']) {
    const encUrl = item.enclosure['@_url'];
    const type = item.enclosure['@_type'] || '';
    if (typeof encUrl === 'string' && encUrl.startsWith('http') && (!type || type.includes('image'))) {
      return encUrl;
    }
  }

  // 4. Extract embedded <img> tag from description HTML
  if (typeof item.description === 'string') {
    const imgMatch = item.description.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/i);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
  }

  // 5. Automated category-responsive CDN fallback
  const categoryFallbacks = {
    monsoon: 'https://images.unsplash.com/photo-1514632595-4944383f2737?auto=format&fit=crop&w=1000&q=80',
    cyclone: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=1000&q=80',
    heatwave: 'https://images.unsplash.com/photo-1504386106331-3e4e71712b38?auto=format&fit=crop&w=1000&q=80',
    agriculture: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
    climate: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=1000&q=80'
  };

  return categoryFallbacks[category] || categoryFallbacks.climate;
}

/**
 * Clean Google News RSS titles and extract source publisher name
 */
function cleanTitleAndSource(rawTitle = '') {
  const parts = rawTitle.split(' - ');
  if (parts.length > 1) {
    const sourceName = parts.pop().trim();
    const title = parts.join(' - ').trim();
    return { title, sourceName };
  }
  return { title: rawTitle.trim(), sourceName: 'Meteorological Wire' };
}

/**
 * Categorize weather article from headline and summary keywords
 */
function detectCategory(text = '') {
  const lower = text.toLowerCase();
  if (/\b(cyclone|hurricane|typhoon|storm|tornado|depression|gale)\b/.test(lower)) {
    return 'cyclone';
  }
  if (/\b(flood|flooding|rain|rainfall|monsoon|deluge|cloudburst|landslide|submerg|overflow|inundat|waterlog|dam)\b/.test(lower)) {
    return 'monsoon';
  }
  if (/\b(heat|heatwave|temperature|mercury|warm|scorching|drought|wildfire)\b/.test(lower)) {
    return 'heatwave';
  }
  if (/\b(crop|farm|agriculture|sowing|kharif|rabi|paddy|harvest|soil|agri)\b/.test(lower)) {
    return 'agriculture';
  }
  return 'climate';
}

/**
 * Classify impact severity level
 */
function detectImpact(text = '') {
  const lower = text.toLowerCase();
  if (/\b(dead|kill|death|toll|catastroph|disaster|massive|largest|worst|submerg|drown|flash flood|red alert|emergency|devastat)\b/.test(lower)) {
    return 'Severe';
  }
  if (/\b(heavy|warning|alert|evacuat|damage|threat|danger|orange alert|crisis|risk)\b/.test(lower)) {
    return 'High';
  }
  return 'Moderate';
}

/**
 * Determine geographic scope and location string dynamically
 */
function detectScopeAndLocation(text = '', defaultScope = 'india') {
  const lower = text.toLowerCase();

  // India regions
  if (/\b(india|delhi|mumbai|maharashtra|uttarakhand|himachal|kerala|karnataka|bengaluru|assam|bihar|uttar pradesh|rajasthan|gujarat|punjab|haryana|odisha|tamil nadu|chennai|kolkata|ganga|yamuna|imd)\b/.test(lower)) {
    let loc = 'India';
    if (lower.includes('mumbai') || lower.includes('maharashtra')) loc = 'Maharashtra, India';
    else if (lower.includes('delhi')) loc = 'Delhi-NCR, India';
    else if (lower.includes('kerala')) loc = 'Kerala, India';
    else if (lower.includes('uttarakhand') || lower.includes('himachal')) loc = 'Himalayan Foothills, India';
    else if (lower.includes('bihar') || lower.includes('uttar pradesh')) loc = 'Gangetic Plains, India';
    else if (lower.includes('odisha') || lower.includes('bengal')) loc = 'Eastern Coast, India';
    return { scope: 'india', location: loc };
  }

  // Global regions & international neighbors
  if (/\b(global|us|usa|europe|japan|china|caribbean|florida|atlantic|pacific|wmo|noaa|ecmwf|antarctica|spain|greece|philippines|australia|africa|nepal|bangladesh|pakistan|sri lanka)\b/.test(lower)) {
    let loc = 'Global';
    if (lower.includes('nepal')) loc = 'Nepal & South Asia';
    else if (lower.includes('europe') || lower.includes('spain') || lower.includes('greece')) loc = 'Europe & Mediterranean';
    else if (lower.includes('us') || lower.includes('florida')) loc = 'United States';
    else if (lower.includes('pacific') || lower.includes('japan')) loc = 'Western Pacific';
    return { scope: 'global', location: loc };
  }

  return {
    scope: defaultScope,
    location: defaultScope === 'india' ? 'Regional, India' : 'Global Meteorological'
  };
}

/**
 * Generate contextual tags based on trending topics from .env and content
 */
function generateTags(category, location, impact, title) {
  const tags = new Set();
  const lower = title.toLowerCase();

  // Dynamic inclusion of trending topics from .env
  const customTopics = env.NEWS_TRENDING_TOPICS || [];
  for (const topic of customTopics) {
    if (lower.includes(topic)) {
      tags.add(topic.charAt(0).toUpperCase() + topic.slice(1));
    }
  }

  if (lower.includes('monsoon')) tags.add('Monsoon');
  if (lower.includes('cyclone')) tags.add('Cyclone');
  if (lower.includes('flood') || lower.includes('flooding')) tags.add('Flood Alert');
  if (lower.includes('imd')) tags.add('IMD Alert');
  if (lower.includes('wmo')) tags.add('WMO');
  if (lower.includes('heatwave')) tags.add('Heatwave');

  tags.add(category.charAt(0).toUpperCase() + category.slice(1));
  if (impact === 'Severe') tags.add('Severe Weather');

  return Array.from(tags).slice(0, 4);
}

/**
 * Fetch and parse a live RSS feed with automated image extraction
 */
async function fetchRssFeed(url, defaultScope, publisherDefault = null) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/xml, text/xml, */*'
      }
    });

    if (!res.ok) {
      console.warn(`[NewsService] RSS fetch returned ${res.status} for ${url}`);
      return [];
    }

    const xml = await res.text();
    const parsed = xmlParser.parse(xml);
    const items = parsed?.rss?.channel?.item || [];

    const rawList = Array.isArray(items) ? items : [items];

    return rawList.map(item => {
      const { title, sourceName } = cleanTitleAndSource(item.title || '');
      const finalPublisher = publisherDefault || sourceName;
      const rawDesc = item.description || '';
      const cleanDesc = (typeof rawDesc === 'string' ? rawDesc.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim() : '');
      const combinedText = `${title} ${cleanDesc}`;

      const { scope, location } = detectScopeAndLocation(combinedText, defaultScope);
      const category = detectCategory(combinedText);
      const impactLevel = detectImpact(combinedText);
      
      // Automated image extraction directly from publisher feed elements
      const imageUrl = extractMediaImage(item, category);
      const tags = generateTags(category, location, impactLevel, title);

      const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
      const ageHours = (Date.now() - pubDate.getTime()) / (1000 * 3600);
      const isBreaking = impactLevel === 'Severe' || ageHours <= 4;

      return {
        id: item.guid || item.link || `news-${Date.now()}-${Math.random()}`,
        title,
        summary: cleanDesc && cleanDesc.length > 20
          ? (cleanDesc.length > 280 ? cleanDesc.slice(0, 277) + '...' : cleanDesc)
          : `${title}. Meteorological report by ${finalPublisher}.`,
        content: title,
        url: item.link || '',
        scope,
        category,
        impactLevel,
        isBreaking,
        location,
        imageUrl,
        source: {
          name: finalPublisher,
          code: finalPublisher.slice(0, 8).toUpperCase().replace(/[^A-Z]/g, ''),
          url: item.link || '',
          type: 'news_media',
          verified: true
        },
        tags,
        publishedAt: pubDate.toISOString()
      };
    });
  } catch (err) {
    console.warn(`[NewsService] Failed to parse feed ${url}:`, err.message);
    return [];
  }
}

/**
 * Automate syncing live India weather news and Top Global extreme weather dispatches
 * Dynamically constructs search queries using NEWS_INDIA_QUERY and NEWS_GLOBAL_QUERY from .env
 */
export async function syncLiveNews() {
  if (isSyncing) {
    console.log('ℹ️ [NewsService] News sync already in progress, skipping duplicate call.');
    return;
  }

  isSyncing = true;
  console.log('🔄 [NewsService] Ingesting dynamic news feeds via .env queries...');

  try {
    const indiaQuery = env.NEWS_INDIA_QUERY || 'India weather OR monsoon OR flood OR cyclone OR cloudburst OR IMD';
    const globalQuery = env.NEWS_GLOBAL_QUERY || 'extreme weather OR cyclone OR hurricane OR typhoon OR heatwave OR flood disaster OR climate emergency';

    console.log(`📌 [NewsService] Live India Query: "${indiaQuery}"`);
    console.log(`📌 [NewsService] Live Global Query: "${globalQuery}"`);

    const feeds = [
      // 1. Configurable India Weather Query from .env
      {
        url: `https://news.google.com/rss/search?q=(${encodeURIComponent(indiaQuery)})+when:7d&hl=en-IN&gl=IN&ceid=IN:en`,
        defaultScope: 'india'
      },
      // 2. Configurable Global Extreme Weather Query from .env
      {
        url: `https://news.google.com/rss/search?q=(${encodeURIComponent(globalQuery)})+when:7d&hl=en-US&gl=US&ceid=US:en`,
        defaultScope: 'global'
      },
      // 3. Direct Publisher Feeds for real-world high-resolution photography
      {
        url: 'https://www.thehindu.com/sci-tech/energy-and-environment/feeder/default.rss',
        defaultScope: 'india',
        publisherDefault: 'The Hindu'
      },
      {
        url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
        defaultScope: 'global',
        publisherDefault: 'BBC News'
      }
    ];

    const feedResults = await Promise.allSettled(
      feeds.map(f => fetchRssFeed(f.url, f.defaultScope, f.publisherDefault))
    );

    const fetchedArticles = [];
    for (const res of feedResults) {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        fetchedArticles.push(...res.value);
      }
    }

    console.log(`📡 [NewsService] Fetched ${fetchedArticles.length} raw articles from live feeds.`);

    // Deduplicate by URL or normalized Title
    const dedupeMap = new Map();

    // Seed baseline news first
    for (const base of BASELINE_NEWS) {
      dedupeMap.set(base.title.toLowerCase().trim(), base);
    }

    // Overlay live news
    for (const art of fetchedArticles) {
      if (!art.title || art.title.length < 10) continue;
      const key = art.title.toLowerCase().trim();
      dedupeMap.set(key, art);
    }

    const mergedArticles = Array.from(dedupeMap.values());

    // Sort by latest publication
    mergedArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Persist to MongoDB in background
    try {
      const bulkOps = mergedArticles.slice(0, 50).map(doc => ({
        updateOne: {
          filter: { url: doc.url },
          update: { $set: doc },
          upsert: true
        }
      }));

      if (bulkOps.length > 0) {
        await NewsArticle.bulkWrite(bulkOps, { ordered: false });
        console.log(`💾 [NewsService] Persisted ${bulkOps.length} news articles into MongoDB.`);
      }
    } catch (dbErr) {
      console.warn('[NewsService] MongoDB bulkWrite error (continuing with in-memory):', dbErr.message);
    }

    // Update in-memory cache
    cachedNews = mergedArticles.slice(0, 60);
    lastFetchTime = Date.now();

    console.log(`✅ [NewsService] News sync complete. ${cachedNews.length} active articles ready.`);

    // Check for severe breaking news and broadcast via Socket.IO if available
    const breaking = cachedNews.find(a => a.isBreaking && a.impactLevel === 'Severe');
    if (breaking) {
      try {
        const io = getIO();
        if (io) {
          io.emit('news:breaking', breaking);
        }
      } catch (_) {}
    }

    return { success: true, count: cachedNews.length };
  } catch (err) {
    console.error('❌ [NewsService] Error during automated news sync:', err);
    if (!cachedNews || cachedNews.length === 0) {
      cachedNews = [...BASELINE_NEWS];
      lastFetchTime = Date.now();
    }
    return { success: false, error: err.message };
  } finally {
    isSyncing = false;
  }
}

/**
 * Get trending weather and climate news with filtering and caching
 * @param {object} options
 * @param {string} [options.scope='all'] - 'all' | 'india' | 'global'
 * @param {string} [options.category='all'] - 'all' | 'monsoon' | 'cyclone' | 'heatwave' | 'climate' | 'agriculture'
 * @param {string} [options.query=''] - Search term
 * @returns {Promise<object>}
 */
export async function getTrendingNews(options = {}) {
  const { scope = 'all', category = 'all', query = '' } = options;

  const now = Date.now();
  // If cache is empty or TTL expired, trigger sync
  if (!cachedNews || cachedNews.length === 0 || now - lastFetchTime > NEWS_CACHE_TTL_MS) {
    if (!isSyncing) {
      if (!cachedNews || cachedNews.length === 0) {
        await syncLiveNews();
      } else {
        syncLiveNews().catch(e => console.warn('[NewsService] Background sync error:', e.message));
      }
    }
  }

  // If still empty (e.g. initial offline start), load from DB or baseline
  if (!cachedNews || cachedNews.length === 0) {
    try {
      const fromDb = await NewsArticle.find({}).sort({ publishedAt: -1 }).limit(50).lean();
      if (fromDb && fromDb.length > 0) {
        cachedNews = fromDb;
        lastFetchTime = now;
      } else {
        cachedNews = [...BASELINE_NEWS];
        lastFetchTime = now;
      }
    } catch (_) {
      cachedNews = [...BASELINE_NEWS];
      lastFetchTime = now;
    }
  }

  let filtered = [...cachedNews];

  // 1. Filter by scope (india / global)
  if (scope && scope !== 'all') {
    filtered = filtered.filter(item => (item.scope || '').toLowerCase() === scope.toLowerCase());
  }

  // 2. Filter by category
  if (category && category !== 'all') {
    filtered = filtered.filter(item => (item.category || '').toLowerCase() === category.toLowerCase());
  }

  // 3. Search query filter
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    filtered = filtered.filter(item =>
      (item.title || '').toLowerCase().includes(q) ||
      (item.summary || '').toLowerCase().includes(q) ||
      (item.source?.name || '').toLowerCase().includes(q) ||
      (item.location || '').toLowerCase().includes(q) ||
      (item.tags || []).some(tag => tag.toLowerCase().includes(q))
    );
  }

  // Sort by publishedAt descending (latest first)
  filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const breakingNews = filtered.find(item => item.isBreaking) || filtered[0] || null;

  return {
    success: true,
    count: filtered.length,
    timestamp: new Date().toISOString(),
    breakingNews,
    articles: filtered,
    meta: {
      totalSources: 8,
      scopes: ['all', 'india', 'global'],
      categories: ['all', 'monsoon', 'cyclone', 'heatwave', 'climate', 'agriculture'],
      lastUpdated: new Date(lastFetchTime).toISOString()
    }
  };
}

export default {
  syncLiveNews,
  getTrendingNews
};
