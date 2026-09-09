import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

/**
 * Validated and structured environment configuration
 */
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/weathergpt',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_key_change_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  // AI / LLM
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',

  // Official Meteorological & Satellite APIs
  IMD_API_KEY: process.env.IMD_API_KEY || '',
  MOSDAC_API_KEY: process.env.MOSDAC_API_KEY || '',
  PASSWORD_RESET_TOKEN_TTL_MINUTES: parseInt(
    process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES || '30',
    10
  ),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || '900000',
    10
  ), // 15 mins
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),

  // Automated News Crawler & Trending Topics
  NEWS_INDIA_QUERY:
    process.env.NEWS_INDIA_QUERY ||
    'India weather OR monsoon OR flood OR cyclone OR cloudburst OR IMD',
  NEWS_GLOBAL_QUERY:
    process.env.NEWS_GLOBAL_QUERY ||
    'extreme weather OR cyclone OR hurricane OR typhoon OR heatwave OR flood disaster OR climate emergency',
  NEWS_TRENDING_TOPICS: (
    process.env.NEWS_TRENDING_TOPICS ||
    'monsoon,flood,cyclone,cloudburst,heatwave,hurricane,typhoon,landslide,drought,wildfire,storm'
  )
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(Boolean),

  // Redis & Weather Cache Configuration
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  REDIS_HOST: process.env.REDIS_HOST || '',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
  REDIS_ENABLED: process.env.REDIS_ENABLED !== 'false',
  CACHE_COORDINATE_PRECISION: parseInt(
    process.env.CACHE_COORDINATE_PRECISION || '2',
    10
  ),

  // Cache Freshness & Retention TTLs (in seconds)
  REDIS_TTL_CURRENT_FRESH_S: parseInt(
    process.env.REDIS_TTL_CURRENT_FRESH_S || '600',
    10
  ),
  REDIS_TTL_CURRENT_RETENTION_S: parseInt(
    process.env.REDIS_TTL_CURRENT_RETENTION_S || '86400',
    10
  ),
  REDIS_TTL_HOURLY_FRESH_S: parseInt(
    process.env.REDIS_TTL_HOURLY_FRESH_S || '1800',
    10
  ),
  REDIS_TTL_HOURLY_RETENTION_S: parseInt(
    process.env.REDIS_TTL_HOURLY_RETENTION_S || '1209600',
    10
  ),
  REDIS_TTL_FORECAST_FRESH_S: parseInt(
    process.env.REDIS_TTL_FORECAST_FRESH_S || '3600',
    10
  ),
  REDIS_TTL_FORECAST_RETENTION_S: parseInt(
    process.env.REDIS_TTL_FORECAST_RETENTION_S || '2592000',
    10
  ),
  REDIS_TTL_RUN_RETENTION_S: parseInt(
    process.env.REDIS_TTL_RUN_RETENTION_S || '604800',
    10
  ),
  REDIS_TTL_ALERTS_FRESH_S: parseInt(
    process.env.REDIS_TTL_ALERTS_FRESH_S || '600',
    10
  ),
  REDIS_TTL_ALERTS_RETENTION_S: parseInt(
    process.env.REDIS_TTL_ALERTS_RETENTION_S || '2592000',
    10
  ),

  // Maximum usable age for stale data fallback
  MAX_STALE_AGE_CURRENT_HOURS: parseInt(
    process.env.MAX_STALE_AGE_CURRENT_HOURS || '24',
    10
  ),
  MAX_STALE_AGE_HOURLY_HOURS: parseInt(
    process.env.MAX_STALE_AGE_HOURLY_HOURS || '48',
    10
  ),
  MAX_STALE_AGE_DAILY_DAYS: parseInt(
    process.env.MAX_STALE_AGE_DAILY_DAYS || '14',
    10
  ),

  // Environment Flags
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: (process.env.NODE_ENV || 'development') === 'development',
  IS_TEST: process.env.NODE_ENV === 'test'
}

export default env
