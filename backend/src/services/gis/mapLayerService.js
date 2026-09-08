import mongoose from 'mongoose';
import Station from '../../models/Station.js';
import FloodZone from '../../models/FloodZone.js';
import { getAllIMDWarnings } from '../imd/imdService.js';
import weatherService from '../weather/weatherService.js';
import { stationsSeedData } from '../../../../seed/data/stations.seed.js';
import { floodZonesSeedData } from '../../../../seed/data/flood-zones.seed.js';

/**
 * Generate GeoJSON FeatureCollection for interactive weather layers
 * Reads station coordinates from MongoDB (or seed fallback), enriches with live weather from Open-Meteo
 * @param {'temperature'|'precipitation'|'wind'|'clouds'} layerType
 * @returns {Promise<object>} GeoJSON FeatureCollection
 */
export async function getWeatherGeoJSON(layerType = 'temperature') {
  let stations = [];
  if (mongoose.connection.readyState === 1) {
    try {
      stations = await Station.find({ isActive: true });
    } catch {
      stations = [];
    }
  }

  if (!stations || stations.length === 0) {
    stations = stationsSeedData.map(s => ({
      name: s.name,
      latitude: s.latitude,
      longitude: s.longitude
    }));
  }

  // Fetch live weather for all stations in a single fast Open-Meteo batch call
  let enrichedStations = [];
  try {
    const lats = stations.map(s => s.latitude).join(',');
    const lngs = stations.map(s => s.longitude).join(',');
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,precipitation,wind_speed_10m,cloud_cover`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const batchData = await res.json();
      const list = Array.isArray(batchData) ? batchData : [batchData];
      enrichedStations = stations.map((station, idx) => {
        const cur = list[idx]?.current || {};
        return {
          name: station.name,
          lat: station.latitude,
          lng: station.longitude,
          temp: cur.temperature_2m ?? null,
          rain: cur.precipitation ?? 0,
          wind: cur.wind_speed_10m ?? null,
          clouds: cur.cloud_cover ?? null
        };
      });
    }
  } catch (err) {
    console.warn('Fast batch station weather query failed, using station metadata:', err.message);
    enrichedStations = stations.map(station => ({
      name: station.name,
      lat: station.latitude,
      lng: station.longitude,
      temp: null,
      rain: null,
      wind: null,
      clouds: null
    }));
  }

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
  let stations = [];
  if (mongoose.connection.readyState === 1) {
    try {
      stations = await Station.find({ isActive: true });
    } catch {
      stations = [];
    }
  }

  if (!stations || stations.length === 0) {
    stations = stationsSeedData.map(s => ({
      name: s.name,
      latitude: s.latitude,
      longitude: s.longitude
    }));
  }

  const imdWarnings = await getAllIMDWarnings();

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
 * Reads flood zones from MongoDB FloodZone collection (or seed fallback)
 * @returns {Promise<object>} GeoJSON FeatureCollection
 */
export async function getFloodRiskGeoJSON() {
  let floodZones = [];
  if (mongoose.connection.readyState === 1) {
    try {
      floodZones = await FloodZone.find({ isActive: true });
    } catch {
      floodZones = [];
    }
  }

  if (!floodZones || floodZones.length === 0) {
    floodZones = floodZonesSeedData.map(z => ({
      name: z.name,
      latitude: z.latitude,
      longitude: z.longitude,
      riskLevel: z.riskLevel,
      estimatedFloodDepthM: z.estimatedFloodDepthM,
      advisory: z.advisory
    }));
  }

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
