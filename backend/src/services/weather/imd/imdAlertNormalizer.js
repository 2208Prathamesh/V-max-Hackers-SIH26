import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  trimValues: true,
});

function ensureArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parsePolygon(polygon) {
  if (!polygon) return [];

  const points = polygon.trim().split(/\s+/);

  return points
    .map((point) => {
      const [lat, lon] = point.split(",").map(Number);

      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        return null;
      }

      // GeoJSON uses [longitude, latitude]
      return [lon, lat];
    })
    .filter(Boolean);
}

export function normalizeImdCapAlert(xml, feedMetadata = {}) {
  const parsed = parser.parse(xml);

  const alert = parsed?.alert;

  if (!alert) {
    throw new Error("Invalid CAP XML: <alert> not found");
  }

  const info = alert.info;

  if (!info) {
    throw new Error("Invalid CAP XML: <info> not found");
  }

  const areas = ensureArray(info.area).map((area) => ({
    description: area.areaDesc ?? null,
    polygon: parsePolygon(area.polygon),
  }));

  return {
    id: alert.identifier ?? feedMetadata.guid ?? null,

    source: "IMD",
    sourceType: "official_alert",
    isOfficial: true,

    status: alert.status ?? null,
    messageType: alert.msgType ?? null,
    scope: alert.scope ?? null,

    category: info.category ?? null,
    event: info.event ?? null,

    headline: info.headline ?? feedMetadata.title ?? null,
    description: info.description ?? feedMetadata.description ?? null,
    instruction: info.instruction ?? null,

    severity: info.severity ?? null,
    urgency: info.urgency ?? null,
    certainty: info.certainty ?? null,

    issuedAt: alert.sent ?? null,
    onset: info.onset ?? null,
    expires: info.expires ?? null,

    sender: alert.sender ?? null,
    senderName: info.senderName ?? null,

    areas,

    sourceUrl: info.web ?? feedMetadata.url ?? null,
    feedPublishedAt: feedMetadata.publishedAt ?? null,
  };
}