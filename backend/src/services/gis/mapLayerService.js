import Station from '../../models/Station.js';
import FloodZone from '../../models/FloodZone.js';
import { getAllIMDWarnings } from '../imd/imdService.js';
import weatherService from '../weather/weatherService.js';

/**
 * Generate GeoJSON FeatureCollection for interactive weather layers
 * Reads station coordinates from MongoDB, enriches with live weather from Open-Meteo
 * @param {'temperature'|'precipitation'|'wind'|'clouds'} layerType
 * @returns {Promise<object>} GeoJSON FeatureCollection
 */
export async function getWeatherGeoJSON(layerType = 'temperature') {
  const stations = await Station.find({ isActive: true });

  // Fetch live weather for all stations concurrently
  const enrichedStations = await Promise.all(
    stations.map(async (station) => {
      try {
        const weather = await weatherService.getWeather(station.latitude, station.longitude);
        const current = weather?.forecast?.current || {};
        return {
          name: station.name,
          lat: station.latitude,
          lng: station.longitude,
          temp: current.temperature ?? null,
          rain: current.precipitation ?? 0,
          wind: current.windSpeed ?? null,
          clouds: current.cloudCover ?? null
        };
      } catch {
        return {
          name: station.name,
          lat: station.latitude,
          lng: station.longitude,
          temp: null,
          rain: null,
          wind: null,
          clouds: null
        };
      }
    })
  );

  const features = enrichedStations.map((station) => {
    let value = station.temp;
    let unit = '°C';
    let label = `${station.name}: ${station.temp ?? '--'}°C`;

    if (layerType === 'precipitation') {
      value = station.rain;
      unit = 'mm';
      label = `${station.name}: ${station.rain ?? '--'} mm`;
    } else if (layerType === 'wind') {
      value = station.wind;
      unit = 'km/h';
      label = `${station.name}: ${station.wind ?? '--'} km/h`;
    } else if (layerType === 'clouds') {
      value = station.clouds;
      unit = '%';
      label = `${station.name}: ${station.clouds ?? '--'}%`;
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
      source: 'WeatherGPT GIS Integration Engine (Live Open-Meteo)'
    },
    features
  };
}

/**
 * Generate GeoJSON FeatureCollection for active IMD Alert Zones
 * @returns {Promise<object>} GeoJSON FeatureCollection
 */
export async function getAlertsGeoJSON() {
  const [imdWarnings, stations] = await Promise.all([
    getAllIMDWarnings(),
    Station.find({ isActive: true })
  ]);

  const colorMap = {
    Red: '#EF4444',
    Orange: '#F97316',
    Yellow: '#EAB308',
    Green: '#22C55E'
  };

  const features = imdWarnings.map((warning) => {
    const station = stations.find(
      (s) => s.name.toLowerCase() === warning.district.toLowerCase()
    );
    const lat = station?.latitude ?? 18.5204;
    const lng = station?.longitude ?? 73.8567;

    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lng, lat]
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
 * Reads flood zones from MongoDB FloodZone collection
 * @returns {Promise<object>} GeoJSON FeatureCollection
 */
export async function getFloodRiskGeoJSON() {
  const floodZones = await FloodZone.find({ isActive: true });

  const features = floodZones.map((zone) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [zone.longitude, zone.latitude]
    },
    properties: {
      zoneName: zone.name,
      riskLevel: zone.riskLevel,
      estimatedFloodDepthM: zone.estimatedFloodDepthM,
      advisory: zone.advisory
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
