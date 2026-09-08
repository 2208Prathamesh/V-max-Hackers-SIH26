import SatelliteProduct from '../../models/SatelliteProduct.js';
import CycloneTrack from '../../models/CycloneTrack.js';

/**
 * Get available MOSDAC / ISRO satellite imagery feeds & layer metadata
 * Reads from MongoDB SatelliteProduct collection (seeded via seed/data/satellite-products.seed.js)
 * @returns {Promise<object>}
 */
export async function getSatelliteLayers() {
  const products = await SatelliteProduct.find({ isActive: true });

  return {
    source: 'MOSDAC (Meteorological and Oceanographic Satellite Data Archival Centre, ISRO)',
    status: 'ACTIVE',
    productsCount: products.length,
    products: products.map((p) => ({
      id: p.productId,
      name: p.name,
      satellite: p.satellite,
      sensor: p.sensor,
      spectralBand: p.spectralBand,
      resolutionKm: p.resolutionKm,
      updateFrequency: p.updateFrequency,
      coverage: p.coverage,
      description: p.description,
      latestImageUrl: p.latestImageUrl
    })),
    wmoWis2Subscription: {
      protocol: 'MQTT 5.0 over WebSockets',
      brokerEndpoint: 'wis2.imd.gov.in/mqtt',
      topicPattern: 'origin/a/wis2/in-imd/data/core/weather/surface-based-obs/#',
      status: 'Ready'
    }
  };
}

/**
 * Get active cyclone trajectory tracks and storm intensity metadata
 * Reads from MongoDB CycloneTrack collection (seeded via seed/data/cyclone-tracks.seed.js)
 * @returns {Promise<object>}
 */
export async function getCycloneTracks() {
  const tracks = await CycloneTrack.find({ status: 'active' });

  return {
    source: 'RSMC New Delhi - Tropical Cyclone Centre / ISRO MOSDAC',
    activeSystemsCount: tracks.length,
    systems: tracks.map((t) => ({
      systemName: t.systemName,
      basin: t.basin,
      currentIntensity: t.currentIntensity,
      estimatedCentralPressureHpa: t.estimatedCentralPressureHpa,
      maximumSustainedWindKmh: t.maximumSustainedWindKmh,
      gustsKmh: t.gustsKmh,
      movementDirection: t.movementDirection,
      movementSpeedKmh: t.movementSpeedKmh,
      trackPoints: t.trackPoints.map((tp) => ({
        step: tp.step,
        lat: tp.latitude,
        lng: tp.longitude,
        intensity: tp.intensity,
        windKmh: tp.windKmh
      }))
    }))
  };
}

export default {
  getSatelliteLayers,
  getCycloneTracks
};
