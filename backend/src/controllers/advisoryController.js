import advisoryService from '../services/advisory/advisoryService.js';
import { searchLocation } from '../services/weather/openMeteo/geocoding.js';
import { successResponse } from '../utils/response.js';
import { parseAndValidateCoordinates } from '../utils/coordinates.js';

/**
 * Resolve coordinates helper
 */
async function resolveCoords(req) {
  const { city, latitude, longitude } = req.query;

  if (latitude && longitude && !Number.isNaN(Number(latitude)) && !Number.isNaN(Number(longitude))) {
    const coordinates = parseAndValidateCoordinates(latitude, longitude);
    return {
      lat: coordinates.latitude,
      lon: coordinates.longitude,
      cityName: city || 'Custom Coordinates'
    };
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
 * Get agriculture crop advisory
 */
export const getAgroAdvisory = async (req, res, next) => {
  try {
    const { lat, lon, cityName } = await resolveCoords(req);
    const crop = req.query.crop || 'general';
    const sowingDate = req.query.sowingDate || null;
    const das = req.query.das ? parseInt(req.query.das, 10) : null;

    const advisory = await advisoryService.getAgricultureAdvisory(lat, lon, crop, {
      sowingDate,
      das,
      cityName
    });
    return successResponse(res, { cityName, ...advisory }, `Crop advisory for ${crop} generated successfully`, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get disaster emergency safety advisory
 */
export const getDisasterAdvisory = async (req, res, next) => {
  try {
    const { lat, lon, cityName } = await resolveCoords(req);
    const advisory = await advisoryService.getDisasterSafetyAdvisory(cityName, lat, lon);
    return successResponse(res, advisory, `Disaster safety checklist for ${cityName} retrieved`, 200);
  } catch (error) {
    next(error);
  }
};

export default {
  getAgroAdvisory,
  getDisasterAdvisory
};
