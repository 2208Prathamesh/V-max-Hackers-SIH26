/**
 * Cyclone Tracks seed dataset
 * Moved from hardcoded ACTIVE_CYCLONE_TRACKS array in mosdacService.js
 */
export const cycloneTracksSeedData = [
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
      { step: '-12h', latitude: 16.2, longitude: 70.5, intensity: 'Depression', windKmh: 45 },
      { step: '-6h', latitude: 16.8, longitude: 70.1, intensity: 'Deep Depression', windKmh: 50 },
      { step: 'Current', latitude: 17.4, longitude: 69.8, intensity: 'Deep Depression', windKmh: 55 },
      { step: '+6h (Forecast)', latitude: 18.0, longitude: 69.4, intensity: 'Deep Depression', windKmh: 60 },
      { step: '+12h (Forecast)', latitude: 18.7, longitude: 69.0, intensity: 'Cyclonic Storm', windKmh: 65 }
    ],
    status: 'active'
  }
];
