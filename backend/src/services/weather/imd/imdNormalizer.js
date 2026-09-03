export function normalizeImdObservation(features = []) {
  if (!features.length) {
    return null;
  }

  // Find the latest report
  const latestReportTime = features.reduce((latest, feature) => {
    const time = feature.properties?.reportTime;

    if (!time) return latest;

    if (!latest || new Date(time) > new Date(latest)) {
      return time;
    }

    return latest;
  }, null);

  if (!latestReportTime) {
    return null;
  }

  // Only measurements belonging to the latest report
  const latestFeatures = features.filter(
    (feature) =>
      feature.properties?.reportTime === latestReportTime
  );

  const measurements = {};

  for (const feature of latestFeatures) {
    const properties = feature.properties;

    if (!properties?.name) continue;

    measurements[properties.name] = {
      value: properties.value,
      description: properties.description,
      units: properties.units,
    };
  }

  // Coordinates from the observation
  const coordinates =
    latestFeatures[0]?.geometry?.coordinates || [];

  return {
    stationId:
      latestFeatures[0]?.properties?.wigos_station_identifier ||
      null,

    observedAt: latestReportTime,

    location: {
      longitude: coordinates[0] ?? null,
      latitude: coordinates[1] ?? null,
    },

    temperatureC:
      measurements.air_temperature?.value ?? null,

    dewPointC:
      measurements.dewpoint_temperature?.value ?? null,

    pressureHpa:
      measurements.non_coordinate_pressure?.value ?? null,

    visibilityM:
      measurements.horizontal_visibility?.value ?? null,

    cloudCoverPct:
      measurements.cloud_cover_total?.value ?? null,

    windSpeedMs:
      measurements.wind_speed?.value ?? null,

    windDirectionDeg:
      measurements.wind_direction?.value ?? null,

    precipitationMm:
      measurements.total_precipitation_or_total_water_equivalent
        ?.value ?? null,

    weatherDescription:
      measurements.present_weather?.description ?? null,

    source: "IMD",
    sourceType: "observation",
  };
}