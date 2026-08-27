/**
 * MOSDAC / ISRO Satellite & WMO WIS 2.0 Metadata Service
 */

const MOSDAC_SATELLITE_PRODUCTS = [
  {
    id: 'insat3d_ir1',
    name: 'INSAT-3D Thermal Infrared (TIR-1)',
    satellite: 'INSAT-3D',
    sensor: 'Imager',
    spectralBand: '10.8 µm (Thermal IR)',
    resolutionKm: 4.0,
    updateFrequency: 'Every 30 minutes',
    coverage: 'Indian Ocean & South Asia (0°N-40°N, 40°E-110°E)',
    description: 'Cloud top temperature, deep convective storm monitoring and cyclone cloud system intensity.',
    latestImageUrl: 'https://mosdac.gov.in/live_images/insat3d_ir1_latest.jpg'
  },
  {
    id: 'insat3d_vis',
    name: 'INSAT-3D Visible (VIS)',
    satellite: 'INSAT-3D',
    sensor: 'Imager',
    spectralBand: '0.65 µm (Visible)',
    resolutionKm: 1.0,
    updateFrequency: 'Every 30 minutes (Daytime)',
    coverage: 'South Asian Subcontinent',
    description: 'High-resolution daytime cloud patterns, fog, and aerosol detection.',
    latestImageUrl: 'https://mosdac.gov.in/live_images/insat3d_vis_latest.jpg'
  },
  {
    id: 'insat3d_wv',
    name: 'INSAT-3D Water Vapor (WV)',
    satellite: 'INSAT-3D',
    sensor: 'Imager',
    spectralBand: '6.8 µm (Water Vapor)',
    resolutionKm: 8.0,
    updateFrequency: 'Every 30 minutes',
    coverage: 'Full Asian Sector',
    description: 'Upper tropospheric moisture, jet streams, and atmospheric vortex circulations.',
    latestImageUrl: 'https://mosdac.gov.in/live_images/insat3d_wv_latest.jpg'
  }
];

const ACTIVE_CYCLONE_TRACKS = [
  {
    systemName: 'Depression ARB-02 (Simulated Synoptic Track)',
    basin: 'Arabian Sea',
    currentIntensity: 'Deep Depression',
    estimatedCentralPressureHpa: 994,
    maximumSustainedWindKmh: 55,
    gustsKmh: 75,
    movementDirection: 'North-Northwest',
    movementSpeedKmh: 14,
    trackPoints: [
      { step: '-12h', lat: 16.2, lng: 70.5, intensity: 'Depression', windKmh: 45 },
      { step: '-6h', lat: 16.8, lng: 70.1, intensity: 'Deep Depression', windKmh: 50 },
      { step: 'Current', lat: 17.4, lng: 69.8, intensity: 'Deep Depression', windKmh: 55 },
      { step: '+6h (Forecast)', lat: 18.0, lng: 69.4, intensity: 'Deep Depression', windKmh: 60 },
      { step: '+12h (Forecast)', lat: 18.7, lng: 69.0, intensity: 'Cyclonic Storm', windKmh: 65 }
    ]
  }
];

/**
 * Get available MOSDAC / ISRO satellite imagery feeds & layer metadata
 * @returns {Promise<object>}
 */
export async function getSatelliteLayers() {
  return {
    source: 'MOSDAC (Meteorological and Oceanographic Satellite Data Archival Centre, ISRO)',
    status: 'ACTIVE',
    productsCount: MOSDAC_SATELLITE_PRODUCTS.length,
    products: MOSDAC_SATELLITE_PRODUCTS,
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
 * @returns {Promise<object>}
 */
export async function getCycloneTracks() {
  return {
    source: 'RSMC New Delhi - Tropical Cyclone Centre / ISRO MOSDAC',
    activeSystemsCount: ACTIVE_CYCLONE_TRACKS.length,
    systems: ACTIVE_CYCLONE_TRACKS
  };
}

export default {
  getSatelliteLayers,
  getCycloneTracks
};
