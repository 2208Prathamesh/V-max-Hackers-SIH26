import {
  getHistoricalWeather,
  getClimateTrends,
  getCompleteClimateProfile,
  findMatchingOrNearestProfile
} from '../services/weather/historicalService.js';
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

  const error = new Error('City name or latitude and longitude are required');
  error.statusCode = 400;
  throw error;
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
    min: [],
    rain: []
  }));

  daily.time.forEach((time, index) => {
    const month = new Date(time).getMonth();
    if (daily.temperature_2m_max[index] != null) monthlyStats[month].max.push(daily.temperature_2m_max[index]);
    if (daily.temperature_2m_mean[index] != null) monthlyStats[month].avg.push(daily.temperature_2m_mean[index]);
    if (daily.temperature_2m_min[index] != null) monthlyStats[month].min.push(daily.temperature_2m_min[index]);
    const rain = daily.precipitation_sum?.[index] ?? daily.rain_sum?.[index] ?? 0;
    monthlyStats[month].rain.push(rain);
  });

  return months.map((month, i) => {
    const maxVal = monthlyStats[i].max.length > 0 ? Math.max(...monthlyStats[i].max) : null;
    const minVal = monthlyStats[i].min.length > 0 ? Math.min(...monthlyStats[i].min) : null;
    const avgVal = monthlyStats[i].avg.length > 0 ? monthlyStats[i].avg.reduce((a, b) => a + b, 0) / monthlyStats[i].avg.length : null;
    const totalRain = monthlyStats[i].rain.length > 0 ? monthlyStats[i].rain.reduce((a, b) => a + b, 0) : 0;
    const rainyDays = monthlyStats[i].rain.filter(r => r >= 1.0).length;

    return {
      month,
      max: maxVal != null ? parseFloat(maxVal.toFixed(1)) : null,
      avg: avgVal != null ? parseFloat(avgVal.toFixed(1)) : null,
      min: minVal != null ? parseFloat(minVal.toFixed(1)) : null,
      rainfallMm: parseFloat(totalRain.toFixed(1)),
      rainyDays
    };
  });
}

/**
 * Get historical weather climatology
 */
export const getHistory = async (req, res, next) => {
  try {
    const { lat, lon, cityName } = await resolveCoords(req);
    const profile = await getCompleteClimateProfile(lat, lon, cityName);

    return successResponse(res, {
      cityName: cityName || profile.city,
      stationName: profile.stationName,
      zone: profile.zone,
      dataSource: profile.dataSource,
      monthly: profile.history
    }, 'Historical weather climatology retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get long-term climate trends and anomalies
 */
export const getTrends = async (req, res, next) => {
  try {
    const { lat, lon, cityName } = await resolveCoords(req);
    const profile = await getCompleteClimateProfile(lat, lon, cityName);

    return successResponse(res, {
      cityName: cityName || profile.city,
      stationName: profile.stationName,
      zone: profile.zone,
      dataSource: profile.dataSource,
      ...profile.trends,
      allTimeRecords: profile.allTimeRecords
    }, 'Climate trends and anomalies calculated successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get full climate data (history + trends + authentic records) in one consolidated call
 */
export const getFullClimateData = async (req, res, next) => {
  try {
    const { lat, lon, cityName } = await resolveCoords(req);
    const profile = await getCompleteClimateProfile(lat, lon, cityName);

    return successResponse(res, profile, 'Full authentic climate intelligence retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

export default {
  getHistory,
  getTrends,
  getFullClimateData
};
