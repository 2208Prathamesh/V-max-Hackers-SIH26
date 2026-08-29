import mosdacService from '../services/satellite/mosdacService.js';
import { successResponse } from '../utils/response.js';

/**
 * Get MOSDAC satellite imagery layer metadata
 */
export const getLayers = async (req, res, next) => {
  try {
    const layers = await mosdacService.getSatelliteLayers();
    return successResponse(res, layers, 'MOSDAC satellite layers retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get cyclone tracking paths & storm intensity
 */
export const getCycloneTracks = async (req, res, next) => {
  try {
    const tracks = await mosdacService.getCycloneTracks();
    return successResponse(res, tracks, 'Cyclone tracks retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

export default {
  getLayers,
  getCycloneTracks
};
