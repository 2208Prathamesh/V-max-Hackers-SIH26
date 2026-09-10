const IMD_BASE_URL = "https://wis2box.imd.gov.in/oapi/collections";
const OBSERVATION_COLLECTION = "urn:wmo:md:in-imd:surface-based-observations.synop";

async function imdGet(url, params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      query.set(key, String(value));
    }
  }
  const queryString = query.toString();
  const fullUrl = queryString ? `${url}?${queryString}` : url;

  const response = await fetch(fullUrl, {
    signal: AbortSignal.timeout(6000),
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`IMD request failed with status ${response.status}`);
  }

  return response.json();
}

export async function getObservations(params = {}) {
  const url = `${IMD_BASE_URL}/${encodeURIComponent(OBSERVATION_COLLECTION)}/items`;

  return imdGet(url, {
    f: "json",
    limit: 10,
    ...params
  });
}

export async function getStations(params = {}) {
  const url = `${IMD_BASE_URL}/stations/items`;

  return imdGet(url, {
    f: "json",
    limit: 10,
    ...params
  });
}

export async function getStationObservations(stationId, params = {}) {
  const url = `${IMD_BASE_URL}/${encodeURIComponent(OBSERVATION_COLLECTION)}/items`;

  return imdGet(url, {
    f: "json",
    limit: 100,
    wigos_station_identifier: stationId,
    ...params
  });
}