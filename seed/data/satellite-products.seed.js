/**
 * MOSDAC Satellite Products seed dataset
 * Moved from hardcoded MOSDAC_SATELLITE_PRODUCTS array in mosdacService.js
 */
export const satelliteProductsSeedData = [
  {
    productId: 'insat3d_ir1',
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
    productId: 'insat3d_vis',
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
    productId: 'insat3d_wv',
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
