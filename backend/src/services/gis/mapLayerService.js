import { getAllIMDWarnings } from '../imd/imdService.js';

// Station coordinates for geospatial grid points across India
const METRO_STATIONS = [
  { name: 'Pune', lat: 18.5204, lng: 73.8567, temp: 27.5, rain: 4.2, wind: 14, clouds: 65 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, temp: 29.8, rain: 18.5, wind: 24, clouds: 85 },
  { name: 'Delhi', lat: 28.6139, lng: 77.2090, temp: 34.2, rain: 0.0, wind: 10, clouds: 20 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, temp: 24.1, rain: 8.0, wind: 16, clouds: 75 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, temp: 31.0, rain: 12.0, wind: 18, clouds: 70 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, temp: 32.5, rain: 1.5, wind: 22, clouds: 40 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, temp: 28.9, rain: 6.4, wind: 15, clouds: 60 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, temp: 36.4, rain: 0.0, wind: 12, clouds: 15 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873, temp: 35.0, rain: 0.0, wind: 11, clouds: 10 },
  { name: 'Guwahati', lat: 26.1445, lng: 91.7362, temp: 28.0, rain: 22.0, wind: 14, clouds: 90 },
  { name: 'Nagpur', lat: 21.1458, lng: 79.0882, temp: 32.0, rain: 5.0, wind: 13, clouds: 50 },
  { name: 'Bhopal', lat: 23.2599, lng: 77.4126, temp: 30.5, rain: 2.0, wind: 12, clouds: 45 },
  { name: 'Srinagar', lat: 34.0837, lng: 74.7973, temp: 18.2, rain: 0.0, wind: 8, clouds: 30 },
  { name: 'Kochi', lat: 9.9312, lng: 76.2673, temp: 28.4, rain: 16.0, wind: 20, clouds: 80 }
];

/**
 * Generate GeoJSON FeatureCollection for interactive weather layers (MapLibre GL JS)
 * @param {'temperature'|'precipitation'|'wind'|'clouds'} layerType
 * @returns {object} GeoJSON FeatureCollection
 */
export function getWeatherGeoJSON(layerType = 'temperature') {
  const features = METRO_STATIONS.map((station) => {
    let value = station.temp;
    let unit = '°C';
    let label = `${station.name}: ${station.temp}°C`;

    if (layerType === 'precipitation') {
      value = station.rain;
      unit = 'mm';
      label = `${station.name}: ${station.rain} mm`;
    } else if (layerType === 'wind') {
      value = station.wind;
      unit = 'km/h';
      label = `${station.name}: ${station.wind} km/h`;
    } else if (layerType === 'clouds') {
      value = station.clouds;
      unit = '%';
      label = `${station.name}: ${station.clouds}%`;
    }

    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [station.lng, station.lat]
      },
      properties: {
        stationName: station.name,
        layerType,
        value,
        unit,
        label,
        temperatureC: station.temp,
        precipitationMm: station.rain,
        windSpeedKmh: station.wind,
        cloudCoverPercent: station.clouds
      }
    };
  });

  return {
    type: 'FeatureCollection',
    metadata: {
      layerType,
      generatedAt: new Date().toISOString(),
      source: 'WeatherGPT GIS Integration Engine'
    },
    features
  };
}

/**
 * Generate GeoJSON FeatureCollection for active IMD Alert Zones
 * @returns {Promise<object>} GeoJSON FeatureCollection
 */
export async function getAlertsGeoJSON() {
  const imdWarnings = await getAllIMDWarnings();

  const colorMap = {
    Red: '#EF4444',
    Orange: '#F97316',
    Yellow: '#EAB308',
    Green: '#22C55E'
  };

  const features = imdWarnings.map((warning) => {
    const station = METRO_STATIONS.find((s) => s.name.toLowerCase() === warning.district.toLowerCase()) || {
      lat: 18.5204,
      lng: 73.8567
    };

    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [station.lng, station.lat]
      },
      properties: {
        district: warning.district,
        state: warning.state,
        warningLevel: warning.warningLevel,
        action: warning.action,
        hazard: warning.hazard,
        advice: warning.advice,
        colorHex: colorMap[warning.warningLevel] || '#22C55E',
        validFrom: warning.validFrom,
        validTo: warning.validTo
      }
    };
  });

  return {
    type: 'FeatureCollection',
    metadata: {
      layer: 'alerts',
      activeAlertsCount: imdWarnings.filter((w) => w.warningLevel !== 'Green').length,
      generatedAt: new Date().toISOString(),
      source: 'India Meteorological Department (IMD) / WeatherGPT'
    },
    features
  };
}

/**
 * Generate GeoJSON FeatureCollection for Flood & Coastal Inundation Risk
 * @returns {object} GeoJSON FeatureCollection
 */
export function getFloodRiskGeoJSON() {
  const floodZones = [
    { name: 'Konkan Coastal Belt', lat: 18.9, lng: 73.0, riskLevel: 'HIGH', floodDepthM: 1.2 },
    { name: 'Assam Brahmaputra Basin', lat: 26.2, lng: 92.5, riskLevel: 'EXTREME', floodDepthM: 2.5 },
    { name: 'Odisha Mahanadi Delta', lat: 20.4, lng: 85.8, riskLevel: 'MODERATE', floodDepthM: 0.8 },
    { name: 'Kerala Western Ghats Outflow', lat: 10.1, lng: 76.3, riskLevel: 'HIGH', floodDepthM: 1.4 }
  ];

  const features = floodZones.map((zone) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [zone.lng, zone.lat]
    },
    properties: {
      zoneName: zone.name,
      riskLevel: zone.riskLevel,
      estimatedFloodDepthM: zone.floodDepthM,
      advisory: 'Low-lying riparian zones. Maintain high alert and avoid crossing waterlogged causeways.'
    }
  }));

  return {
    type: 'FeatureCollection',
    metadata: {
      layer: 'flood-risk',
      generatedAt: new Date().toISOString()
    },
    features
  };
}

export default {
  getWeatherGeoJSON,
  getAlertsGeoJSON,
  getFloodRiskGeoJSON
};
