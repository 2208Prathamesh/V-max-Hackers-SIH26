import axios from "axios";
import https from "https";

const IMD_BASE_URL =
  "https://wis2box.imd.gov.in/oapi/collections";

const OBSERVATION_COLLECTION =
  "urn:wmo:md:in-imd:surface-based-observations.synop";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

async function imdGet(url, params = {}) {
  const response = await axios.get(url, {
    httpsAgent,
    params,
    timeout: 15000,
  });

  return response.data;
}

export async function getObservations(params = {}) {
  const url =
    `${IMD_BASE_URL}/${encodeURIComponent(OBSERVATION_COLLECTION)}/items`;

  return imdGet(url, {
    f: "json",
    limit: 10,
    ...params,
  });
}

export async function getStations(params = {}) {
  const url = `${IMD_BASE_URL}/stations/items`;

  return imdGet(url, {
    f: "json",
    limit: 10,
    ...params,
  });
}

export async function getStationObservations(stationId, params = {}) {
  const url =
    `${IMD_BASE_URL}/${encodeURIComponent(OBSERVATION_COLLECTION)}/items`;

  return imdGet(url, {
    f: "json",
    limit: 100,
    wigos_station_identifier: stationId,
    ...params,
  });
}