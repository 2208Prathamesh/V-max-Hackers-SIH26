export function parseAndValidateCoordinates(latitude, longitude) {
  const lat = Number(latitude)
  const lon = Number(longitude)

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    const error = new Error('Latitude and longitude must be valid numbers')
    error.statusCode = 400
    throw error
  }

  if (lat < -90 || lat > 90) {
    const error = new Error('Latitude must be between -90 and 90')
    error.statusCode = 400
    throw error
  }

  if (lon < -180 || lon > 180) {
    const error = new Error('Longitude must be between -180 and 180')
    error.statusCode = 400
    throw error
  }

  return {
    latitude: lat,
    longitude: lon
  }
}

export default {
  parseAndValidateCoordinates
}
