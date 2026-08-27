import advisoryService from '../services/advisory/advisoryService.js';
import { searchLocation } from '../services/weather/openMeteo/geocoding.js';
import { successResponse } from '../utils/response.js';

/**
 * Resolve coordinates helper
 */
async function resolveCoords(req) {
  const { city, latitude, longitude } = req.query;

  if (latitude && longitude && !Number.isNaN(Number(latitude)) && !Number.isNaN(Number(longitude))) {
    return { lat: Number(latitude), lon: Number(longitude), cityName: city || 'Custom Coordinates' };
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
  }

  return { lat: 18.5204, lon: 73.8567, cityName: 'Pune, Maharashtra' };
}

/**
 * Get agriculture crop advisory
 */
export const getAgroAdvisory = async (req, res, next) => {
  try {
    const { lat, lon, cityName } = await resolveCoords(req);
    const crop = req.query.crop || 'general';

    const advisory = await advisoryService.getAgricultureAdvisory(lat, lon, crop);
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
