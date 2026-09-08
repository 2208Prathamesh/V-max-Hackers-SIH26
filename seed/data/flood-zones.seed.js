/**
 * Flood Risk Zones seed dataset
 * Moved from hardcoded floodZones array in mapLayerService.js
 */
export const floodZonesSeedData = [
  {
    name: 'Konkan Coastal Belt',
    latitude: 18.9,
    longitude: 73.0,
    riskLevel: 'HIGH',
    estimatedFloodDepthM: 1.2,
    advisory: 'Low-lying riparian zones along Konkan coast. Maintain high alert during monsoon and avoid crossing waterlogged causeways.'
  },
  {
    name: 'Assam Brahmaputra Basin',
    latitude: 26.2,
    longitude: 92.5,
    riskLevel: 'EXTREME',
    estimatedFloodDepthM: 2.5,
    advisory: 'Brahmaputra floodplain area. Annual flooding risk is extreme. Evacuate to higher ground when river levels rise beyond danger mark.'
  },
  {
    name: 'Odisha Mahanadi Delta',
    latitude: 20.4,
    longitude: 85.8,
    riskLevel: 'MODERATE',
    estimatedFloodDepthM: 0.8,
    advisory: 'Mahanadi delta region subject to seasonal inundation. Monitor dam releases and river gauge levels.'
  },
  {
    name: 'Kerala Western Ghats Outflow',
    latitude: 10.1,
    longitude: 76.3,
    riskLevel: 'HIGH',
    estimatedFloodDepthM: 1.4,
    advisory: 'Heavy orographic rainfall causes rapid water accumulation in valleys. Watch for landslide warnings on steep slopes.'
  },
  {
    name: 'Bihar Kosi River Basin',
    latitude: 25.6,
    longitude: 86.9,
    riskLevel: 'EXTREME',
    estimatedFloodDepthM: 3.0,
    advisory: 'The Kosi river has a history of devastating floods. Follow SDMA evacuation orders during monsoon peak.'
  },
  {
    name: 'West Bengal Sundarbans Delta',
    latitude: 21.9,
    longitude: 88.8,
    riskLevel: 'HIGH',
    estimatedFloodDepthM: 1.8,
    advisory: 'Tidal surge and storm surge risk during cyclone season. Low-lying settlements must prepare for evacuation.'
  }
];
