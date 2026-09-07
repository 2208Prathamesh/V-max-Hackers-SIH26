import { getHistoricalWeather, getClimateTrends } from '../services/weather/historicalService.js';
import { searchLocation } from '../services/weather/openMeteo/geocoding.js';
import { successResponse } from '../utils/response.js';
import { parseAndValidateCoordinates } from '../utils/coordinates.js';

/**
 * Helper to resolve coordinates
 */
async function resolveCoords(req) {
  const { city, latitude, longitude } = req.query;

  if (latitude && longitude && !Number.isNaN(Number(latitude)) && !Number.isNaN(Number(longitude))) {
    const coordinates = parseAndValidateCoordinates(latitude, longitude);
    return { lat: coordinates.latitude, lon: coordinates.longitude, cityName: city || null };
  }

  if (city && city.trim()) {
    const geo = await searchLocation(city.trim());
    if (geo?.results && geo.results.length > 0) {
      const match = geo.results[0];
      return {
        lat: match.latitude,
        lon: match.longitude,
        cityName: `${match.name}, ${match.country}`
      };
    }

    const error = new Error(`Location not found: "${city.trim()}"`);
    error.statusCode = 404;
    throw error;
  }

  // Default to Pune
  return { lat: 18.5204, lon: 73.8567, cityName: 'Pune, India' };
}

/**
 * Aggregate daily historical data into monthly summaries
 */
function aggregateMonthlyData(daily) {
  if (!daily || !daily.temperature_2m_max) return [];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyStats = Array.from({ length: 12 }, () => ({
    max: [],
    avg: [],
    min: []
  }));

  daily.time.forEach((time, index) => {
    const month = new Date(time).getMonth();
    monthlyStats[month].max.push(daily.temperature_2m_max[index]);
    monthlyStats[month].avg.push(daily.temperature_2m_mean[index]);
    monthlyStats[month].min.push(daily.temperature_2m_min[index]);
  });

  return months.map((month, i) => ({
    month,
    max: monthlyStats[i].max.length > 0 ? Math.max(...monthlyStats[i].max) : null,
    avg: monthlyStats[i].avg.length > 0 ? monthlyStats[i].avg.reduce((a, b) => a + b, 0) / monthlyStats[i].avg.length : null,
    min: monthlyStats[i].min.length > 0 ? Math.min(...monthlyStats[i].min) : null,
  }));
}

/**
 * Get historical weather range
 */
export const getHistory = async (req, res, next) => {
  try {
    const { lat, lon, cityName } = await resolveCoords(req);
    const startDate = req.query.startDate || '2023-01-01';
    const endDate = req.query.endDate || '2023-12-31';

    const history = await getHistoricalWeather(lat, lon, startDate, endDate);
    const monthly = aggregateMonthlyData(history);
    return successResponse(res, { cityName, monthly }, 'Historical weather retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get 20-year climate trends and anomalies
 */
export const getTrends = async (req, res, next) => {
  try {
    const { lat, lon, cityName } = await resolveCoords(req);
    const startYear = req.query.startYear ? parseInt(req.query.startYear, 10) : undefined;
    const endYear = req.query.endYear ? parseInt(req.query.endYear, 10) : undefined;

    const trends = await getClimateTrends(lat, lon, startYear, endYear);
    return successResponse(res, { cityName, ...trends }, 'Climate trends and anomalies calculated successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get full climate data (history + trends) in one call
 */
export const getFullClimateData = async (req, res, next) => {
  try {
    const { lat, lon, cityName } = await resolveCoords(req);
    const startDate = req.query.startDate || '2024-01-01';
    const endDate = req.query.endDate || '2024-12-31';

    // Parallel fetch for efficiency
    const [history, trends] = await Promise.all([
      getHistoricalWeather(lat, lon, startDate, endDate),
      getClimateTrends(lat, lon)
    ]);

    const monthly = aggregateMonthlyData(history);

    return successResponse(res, {
      cityName,
      history: monthly,
      trends: trends
    }, 'Full climate data retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

export default {
  getHistory,
  getTrends,
  getFullClimateData
};
