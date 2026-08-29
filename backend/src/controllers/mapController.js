import mapLayerService from '../services/gis/mapLayerService.js';

/**
 * Get GeoJSON map layer for temperature, precipitation, wind, or clouds
 */
export const getWeatherMapLayer = (req, res, next) => {
  try {
    const layer = req.query.layer || 'temperature';
    const geojson = mapLayerService.getWeatherGeoJSON(layer);
    return res.status(200).json(geojson);
  } catch (error) {
    next(error);
  }
};

/**
 * Get GeoJSON map layer for active IMD alert zones
 */
export const getAlertsMapLayer = async (req, res, next) => {
  try {
    const geojson = await mapLayerService.getAlertsGeoJSON();
    return res.status(200).json(geojson);
  } catch (error) {
    next(error);
  }
};

/**
 * Get GeoJSON map layer for flood risk zones
 */
export const getFloodRiskMapLayer = (req, res, next) => {
  try {
    const geojson = mapLayerService.getFloodRiskGeoJSON();
    return res.status(200).json(geojson);
  } catch (error) {
    next(error);
  }
};

export default {
  getWeatherMapLayer,
  getAlertsMapLayer,
  getFloodRiskMapLayer
};
