import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  
  // Automated News Crawler & Trending Topics
  NEWS_INDIA_QUERY: process.env.NEWS_INDIA_QUERY || 'India weather OR monsoon OR flood OR cyclone OR cloudburst OR IMD',
  NEWS_GLOBAL_QUERY: process.env.NEWS_GLOBAL_QUERY || 'extreme weather OR cyclone OR hurricane OR typhoon OR heatwave OR flood disaster OR climate emergency',
  NEWS_TRENDING_TOPICS: (process.env.NEWS_TRENDING_TOPICS || 'monsoon,flood,cyclone,cloudburst,heatwave,hurricane,typhoon,landslide,drought,wildfire,storm')
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(Boolean),

  // Environment Flags
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: (process.env.NODE_ENV || 'development') === 'development',
  IS_TEST: process.env.NODE_ENV === 'test'
};

export default env;
