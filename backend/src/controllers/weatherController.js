import weatherService from '../services/weather/weatherService.js';
import { searchLocation } from '../services/weather/openMeteo/geocoding.js';
import { compareNWPModels } from '../services/weather/nwp/modelComparisonService.js';
import { successResponse } from '../utils/response.js';
import { parseAndValidateCoordinates } from '../utils/coordinates.js';

/**
 * Helper to resolve coordinates from query (either city name or lat/lon)
 */
const resolveCoordinates = async (query) => {
  const { city, latitude, longitude, lat: altLat, lon: altLon, lng: altLng } = query;

  const rawLat = latitude !== undefined && latitude !== '' ? latitude : altLat;
  const rawLon =
    longitude !== undefined && longitude !== ''
      ? longitude
      : altLon !== undefined && altLon !== ''
      ? altLon
      : altLng;

  let lat = rawLat !== undefined && rawLat !== '' ? Number(rawLat) : undefined;
  let lon = rawLon !== undefined && rawLon !== '' ? Number(rawLon) : undefined;

  if (lat !== undefined && lon !== undefined && Number.isFinite(lat) && Number.isFinite(lon)) {
    return {
      ...parseAndValidateCoordinates(lat, lon),
      cityName: city || null
    };
  }

  if (city && city.trim()) {
    const geoData = await searchLocation(city.trim());
    if (!geoData?.results || geoData.results.length === 0) {
      const error = new Error(`Location not found: "${city}"`);
      error.statusCode = 404;
      throw error;
    }

    const firstMatch = geoData.results[0];
    return {
      latitude: firstMatch.latitude,
      longitude: firstMatch.longitude,
      cityName: `${firstMatch.name}${firstMatch.admin1 ? ', ' + firstMatch.admin1 : ''}, ${firstMatch.country}`
    };
  }

  const error = new Error('City name or latitude and longitude are required');
  error.statusCode = 400;
  throw error;
};

/**
 * Get current weather
 * GET /api/weather/current?city=Pune or ?latitude=18.52&longitude=73.85
 */
const getCurrentWeather = async (req, res, next) => {
  try {
    const { latitude, longitude, cityName } = await resolveCoordinates(req.query);

    const weather = await weatherService.getWeather(latitude, longitude, {
      includeNWP: false
    });
    if (cityName) {
      weather.resolvedCity = cityName;
    }

    return successResponse(res, weather, 'Current weather retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get weather forecast
 * GET /api/weather/forecast?city=Pune&days=7
 */
const getForecast = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const numberOfDays = Number(days);

    if (Number.isNaN(numberOfDays) || numberOfDays < 1 || numberOfDays > 14) {
      return res.status(400).json({
        success: false,
        message: 'Days must be a number between 1 and 14'
      });
    }

    const { latitude, longitude, cityName } = await resolveCoordinates(req.query);
    const forecast = await weatherService.getForecast(latitude, longitude, numberOfDays);
    if (cityName) {
      forecast.resolvedCity = cityName;
    }

    return successResponse(res, forecast, 'Weather forecast retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get hourly weather forecast
 * GET /api/weather/hourly?city=Pune&hours=24
 */
const getHourlyForecast = async (req, res, next) => {
  try {
    const { hours = 24 } = req.query;
    const numberOfHours = Number(hours);

    if (Number.isNaN(numberOfHours) || numberOfHours < 1 || numberOfHours > 48) {
      return res.status(400).json({
        success: false,
        message: 'Hours must be a number between 1 and 48'
      });
    }

    const { latitude, longitude, cityName } = await resolveCoordinates(req.query);
    const forecast = await weatherService.getHourlyForecast({
      latitude,
      longitude,
      hours: numberOfHours
    });
    if (cityName) {
      forecast.resolvedCity = cityName;
    }

    return successResponse(res, forecast, 'Hourly forecast retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Compare NWP Models (ECMWF vs NOAA GFS vs Open-Meteo)
 * GET /api/weather/compare?city=Pune or ?latitude=18.52&longitude=73.85
 */
const compareModels = async (req, res, next) => {
  try {
    const { latitude, longitude, cityName } = await resolveCoordinates(req.query);
    const comparison = await compareNWPModels(latitude, longitude);
    if (cityName) {
      comparison.resolvedCity = cityName;
    }

    return successResponse(res, comparison, 'NWP multi-model comparison completed successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Search locations via geocoding
 * GET /api/weather/search?q=Pune
 */
const searchLocations = async (req, res, next) => {
  try {
    const query = req.query.q || req.query.query || req.query.city || '';
    if (!query.trim()) {
      return successResponse(res, [], 'Empty query', 200);
    }
    const geoData = await searchLocation(query.trim());
    const results = (geoData?.results || []).map((r, idx) => ({
      id: `${r.id || idx}-${r.latitude}-${r.longitude}`,
      city: r.name,
      region: r.admin1 || r.country || '',
      country: r.country || '',
      countryCode: r.country_code || '',
      lat: r.latitude,
      lng: r.longitude,
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone
    }));
    return successResponse(res, results, 'Locations found', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Legit reverse geocoding for GPS or IP location
 * GET /api/weather/reverse-geocode?latitude=18.5204&longitude=73.8567
 */
const reverseGeocode = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.query;
    let url = 'https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en';
    if (latitude && longitude) {
      url += `&latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`;
    }
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      throw new Error(`Reverse geocode failed with status ${response.status}`);
    }
    const data = await response.json();
    const result = {
      city: data.city || data.locality || data.principalSubdivision || 'Current Location',
      locality: data.locality || '',
      region: data.principalSubdivision || '',
      country: data.countryName || 'India',
      countryCode: data.countryCode || 'IN',
      latitude: Number(data.latitude) || (latitude ? Number(latitude) : 18.5204),
      longitude: Number(data.longitude) || (longitude ? Number(longitude) : 73.8567),
      lat: Number(data.latitude) || (latitude ? Number(latitude) : 18.5204),
      lng: Number(data.longitude) || (longitude ? Number(longitude) : 73.8567)
    };
    return successResponse(res, result, 'Location resolved', 200);
  } catch (error) {
    next(error);
  }
};

export { getCurrentWeather, getForecast, getHourlyForecast, compareModels, searchLocations, reverseGeocode };
export default { getCurrentWeather, getForecast, getHourlyForecast, compareModels, searchLocations, reverseGeocode };
