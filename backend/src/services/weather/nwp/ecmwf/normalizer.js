const TARGET_LAT = 18.51957
const TARGET_LON = 73.85535

function getNearestIndex (message, latitude, longitude) {
  const { latitude: latitudes, longitude: longitudes } = message.latlng

  let nearestRow = 0
  let nearestCol = 0

  let minLatDistance = Infinity
  let minLonDistance = Infinity

  // Find nearest latitude row
  for (let row = 0; row < latitudes.length; row++) {
    const distance = Math.abs(latitudes[row] - latitude)

    if (distance < minLatDistance) {
      minLatDistance = distance
      nearestRow = row
    }
  }

  // Find nearest longitude column
  for (let col = 0; col < longitudes.length; col++) {
    const gridLongitude = longitudes[col]
    const distance = Math.min(
      Math.abs(gridLongitude - longitude),
      Math.abs(gridLongitude - (longitude + 360)),
      Math.abs(gridLongitude - (longitude - 360))
    )

    if (distance < minLonDistance) {
      minLonDistance = distance
      nearestCol = col
    }
  }

  const index = nearestRow * message.gridShape.cols + nearestCol

  const gridLongitude = longitudes[nearestCol]

  return {
    index,

    latitude: latitudes[nearestRow],

    longitude: normalizeLongitude(gridLongitude)
  }
}

function normalizeLongitude (longitude) {
  const normalized = ((((longitude + 180) % 360) + 360) % 360) - 180
  return Number(normalized.toFixed(6))
}

function getValue (message, location) {
  const point = getNearestIndex(message, location.latitude, location.longitude)

  return {
    value: message.data[point.index],
    latitude: point.latitude,
    longitude: point.longitude
  }
}

function calculateRelativeHumidity (temperatureC, dewPointC) {
  const a = 17.625
  const b = 243.04

  const saturation = Math.exp((a * temperatureC) / (b + temperatureC))

  const actual = Math.exp((a * dewPointC) / (b + dewPointC))

  return Math.min(100, Math.max(0, (100 * actual) / saturation))
}

function normalizeECMWF (
  messages,
  location = {
    latitude: TARGET_LAT,
    longitude: TARGET_LON
  }
) {
  const temperature = getValue(messages.temperature, location)

  const dewPoint = getValue(messages.dewPoint, location)

  const uWind = getValue(messages.uWind, location)

  const vWind = getValue(messages.vWind, location)

  const pressure = getValue(messages.pressure, location)

  const precipitation = messages.precipitation
    ? getValue(messages.precipitation, location)
    : null

  // Kelvin → Celsius
  const temperatureC = temperature.value - 273.15

  const dewPointC = dewPoint.value - 273.15

  // Calculate wind speed from U/V components
  const windSpeed =
    Math.sqrt(Math.pow(uWind.value, 2) + Math.pow(vWind.value, 2)) * 3.6

  // Convert U/V components to meteorological direction
  const windDirection =
    ((Math.atan2(-uWind.value, -vWind.value) * 180) / Math.PI + 360) % 360

  // Calculate relative humidity from
  // temperature and dew point
  const humidity = calculateRelativeHumidity(temperatureC, dewPointC)

  // Pa → hPa
  const pressureHpa = pressure.value / 100

  return {
    timestamp:
      messages.timestamp ||
      temperature.message?.forecastDate?.toISOString?.() ||
      null,
    source: 'ECMWF-IFS',

    location: {
      requestedLatitude: location.latitude,

      requestedLongitude: location.longitude,

      gridLatitude: temperature.latitude,

      gridLongitude: temperature.longitude
    },

    forecast: {
      temperature: Number(temperatureC.toFixed(2)),

      dewPoint: Number(dewPointC.toFixed(2)),

      humidity: Number(humidity.toFixed(1)),

      pressure: Number(pressureHpa.toFixed(2)),

      windSpeed: Number(windSpeed.toFixed(2)),

      windDirection: Number(windDirection.toFixed(2)),

      precipitation: precipitation
        ? Number(Math.max(0, precipitation.value * 1000).toFixed(3))
        : null
    }
  }
}

export { calculateRelativeHumidity, getNearestIndex, normalizeECMWF }
