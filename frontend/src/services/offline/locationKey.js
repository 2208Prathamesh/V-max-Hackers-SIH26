/**
 * Canonical location key and coordinate utilities for client-side weather caching.
 */

/**
 * Format latitude and longitude into a canonical coordinate-based location key.
 * Uses 2 decimal places precision (~1.1 km), identical to backend cache keys.
 *
 * @param {number|string} latitude
 * @param {number|string} longitude
 * @param {number} [precision=2]
 * @returns {string} e.g. "18.52_73.86"
 */
export const formatLocationKey = (latitude, longitude, precision = 2) => {
  const lat = Number(latitude)
  const lon = Number(longitude)

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    throw new Error(`Invalid coordinates: lat=${latitude}, lon=${longitude}`)
  }

  const prec = Math.max(0, Math.min(precision, 6))
  return `${lat.toFixed(prec)}_${lon.toFixed(prec)}`
}

/**
 * Validates that a cached record's coordinates are compatible with requested coordinates.
 * Requires matching canonical locationKey and coordinate difference within maxDelta (default 0.01° ~1.1km).
 * Prevents returning weather for Location A when Location B was requested.
 *
 * @param {number} reqLat
 * @param {number} reqLon
 * @param {number} recordLat
 * @param {number} recordLon
 * @param {number} [maxDelta=0.01] ~1.1km max acceptable distance
 * @returns {boolean}
 */
export const isLocationCompatible = (
  reqLat,
  reqLon,
  recordLat,
  recordLon,
  maxDelta = 0.01
) => {
  const rLat = Number(reqLat)
  const rLon = Number(reqLon)
  const cLat = Number(recordLat)
  const cLon = Number(recordLon)

  if ([rLat, rLon, cLat, cLon].some(Number.isNaN)) {
    return false
  }

  try {
    if (formatLocationKey(rLat, rLon) !== formatLocationKey(cLat, cLon)) {
      return false
    }
  } catch {
    return false
  }

  const dLat = Math.abs(rLat - cLat)
  const dLon = Math.abs(rLon - cLon)
  return dLat <= maxDelta && dLon <= maxDelta
}
