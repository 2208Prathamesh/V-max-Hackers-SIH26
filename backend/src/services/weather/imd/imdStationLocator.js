import { getStations } from "./imdClient.js";

/**
 * Calculate distance between two coordinates using Haversine formula.
 * Returns distance in kilometers.
 */
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

let stationsCache = null;
let stationsCacheTime = 0;

const STATIONS_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

async function getImdStationsCached() {
  const now = Date.now();

  if (
    stationsCache &&
    now - stationsCacheTime < STATIONS_CACHE_TTL
  ) {
    return stationsCache;
  }

  const data = await getStations({
    limit: 500,
  });

  const stations = data?.features || [];

  if (stations.length === 0) {
    throw new Error("No IMD stations found");
  }

  stationsCache = stations;
  stationsCacheTime = now;

  return stations;
}

/**
 * Find the nearest operational IMD station
 * for a given latitude and longitude.
 */
export async function findNearestImdStation(latitude, longitude) {
  const lat = Number(latitude);
  const lon = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error("Invalid latitude or longitude");
  }

  const stations = await getImdStationsCached();

  let nearestStation = null;
  let nearestDistance = Infinity;

  for (const feature of stations) {
    const coordinates = feature?.geometry?.coordinates;
    const properties = feature?.properties;

    if (!coordinates || coordinates.length < 2) {
      continue;
    }

    if (properties?.status !== "operational") {
      continue;
    }

    const stationLon = Number(coordinates[0]);
    const stationLat = Number(coordinates[1]);

    if (
      !Number.isFinite(stationLat) ||
      !Number.isFinite(stationLon)
    ) {
      continue;
    }

    const distance = distanceKm(
      lat,
      lon,
      stationLat,
      stationLon
    );

    if (distance < nearestDistance) {
      nearestDistance = distance;

      nearestStation = {
        stationId: properties?.wigos_station_identifier,
        name: properties?.name,
        traditionalStationId:
          properties?.traditional_station_identifier,
        latitude: stationLat,
        longitude: stationLon,
        distanceKm: Number(distance.toFixed(2)),
      };
    }
  }

  if (!nearestStation) {
    throw new Error("No operational IMD station found");
  }

  return nearestStation;
}