function normalizeLongitude (longitude) {
  return ((((longitude + 180) % 360) + 360) % 360) - 180
}

function getNearestGridPoint (message, latitude, longitude) {
  const latitudes = message.latlng.latitude
  const longitudes = message.latlng.longitude
  let nearestRow = 0
  let nearestCol = 0
  let minimumLatitudeDistance = Infinity
  let minimumLongitudeDistance = Infinity

  for (let row = 0; row < latitudes.length; row++) {
    const distance = Math.abs(latitudes[row] - latitude)
    if (distance < minimumLatitudeDistance) {
      minimumLatitudeDistance = distance
      nearestRow = row
    }
  }

  for (let col = 0; col < longitudes.length; col++) {
    const gridLongitude = longitudes[col]
    const distance = Math.min(
      Math.abs(gridLongitude - longitude),
      Math.abs(gridLongitude - (longitude + 360)),
      Math.abs(gridLongitude - (longitude - 360))
    )
    if (distance < minimumLongitudeDistance) {
      minimumLongitudeDistance = distance
      nearestCol = col
    }
  }

  return {
    index: nearestRow * message.gridShape.cols + nearestCol,
    latitude: latitudes[nearestRow],
    longitude: normalizeLongitude(longitudes[nearestCol])
  }
}

function getValue (message, location) {
  if (!message) return null
  if (typeof message.value === 'number') return message
  const point = getNearestGridPoint(
    message,
    location.latitude,
    location.longitude
  )
  return { value: message.data[point.index], ...point }
}

function normalizeGFS (messages, location, timestamp = null) {
  const temperature = getValue(messages.temperature, location)
  const humidity = getValue(messages.humidity, location)
  const dewPoint = getValue(messages.dewPoint, location)
  const uWind = getValue(messages.uWind, location)
  const vWind = getValue(messages.vWind, location)
  const pressure = getValue(messages.pressure, location)
  const precipitation = getValue(messages.precipitation, location)

  if (!temperature || !humidity || !uWind || !vWind || !pressure) {
    throw new Error('Required NOAA GFS parameters are missing')
  }

  const u = uWind.value
  const v = vWind.value
  const temperatureC = temperature.value - 273.15
  const windSpeed = Math.sqrt(u * u + v * v) * 3.6
  const windDirection = ((Math.atan2(-u, -v) * 180) / Math.PI + 360) % 360

  return {
    timestamp,
    source: 'NOAA-GFS',
    location: {
      requestedLatitude: location.latitude,
      requestedLongitude: location.longitude,
      gridLatitude: temperature.latitude,
      gridLongitude: temperature.longitude
    },
    forecast: {
      temperature: Number(temperatureC.toFixed(2)),
      dewPoint: dewPoint ? Number((dewPoint.value - 273.15).toFixed(2)) : null,
      humidity: Number(humidity.value.toFixed(1)),
      pressure: Number((pressure.value / 100).toFixed(2)),
      windSpeed: Number(windSpeed.toFixed(2)),
      windDirection: Number(windDirection.toFixed(2)),
      precipitation: precipitation
        ? Number(Math.max(0, precipitation.value).toFixed(3))
        : 0
    }
  }
}

export { getNearestGridPoint, normalizeGFS, normalizeLongitude, getValue }
