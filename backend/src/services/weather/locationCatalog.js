const LOCATION_CATALOG = [
  {
    name: 'Pune',
    admin1: 'Maharashtra',
    country: 'India',
    countryCode: 'IN',
    latitude: 18.5204,
    longitude: 73.8567,
    aliases: ['pune', 'poona', 'pune india', 'pune maharashtra']
  },
  {
    name: 'Mumbai',
    admin1: 'Maharashtra',
    country: 'India',
    countryCode: 'IN',
    latitude: 19.076,
    longitude: 72.8777,
    aliases: ['mumbai', 'bombay', 'mumbai india', 'mumbai maharashtra']
  },
  {
    name: 'Delhi',
    admin1: 'Delhi',
    country: 'India',
    countryCode: 'IN',
    latitude: 28.6139,
    longitude: 77.209,
    aliases: ['delhi', 'new delhi', 'delhi india']
  },
  {
    name: 'Bengaluru',
    admin1: 'Karnataka',
    country: 'India',
    countryCode: 'IN',
    latitude: 12.9716,
    longitude: 77.5946,
    aliases: ['bengaluru', 'bangalore', 'bengaluru india', 'bangalore india']
  },
  {
    name: 'Chennai',
    admin1: 'Tamil Nadu',
    country: 'India',
    countryCode: 'IN',
    latitude: 13.0827,
    longitude: 80.2707,
    aliases: ['chennai', 'madras', 'chennai india']
  },
  {
    name: 'Kolkata',
    admin1: 'West Bengal',
    country: 'India',
    countryCode: 'IN',
    latitude: 22.5726,
    longitude: 88.3639,
    aliases: ['kolkata', 'calcutta', 'kolkata india']
  },
  {
    name: 'Hyderabad',
    admin1: 'Telangana',
    country: 'India',
    countryCode: 'IN',
    latitude: 17.385,
    longitude: 78.4867,
    aliases: ['hyderabad', 'hyderabad india']
  },
  {
    name: 'Ahmedabad',
    admin1: 'Gujarat',
    country: 'India',
    countryCode: 'IN',
    latitude: 23.0225,
    longitude: 72.5714,
    aliases: ['ahmedabad', 'ahmedabad india']
  },
  {
    name: 'Jaipur',
    admin1: 'Rajasthan',
    country: 'India',
    countryCode: 'IN',
    latitude: 26.9124,
    longitude: 75.7873,
    aliases: ['jaipur', 'jaipur india']
  },
  {
    name: 'Guwahati',
    admin1: 'Assam',
    country: 'India',
    countryCode: 'IN',
    latitude: 26.1445,
    longitude: 91.7362,
    aliases: ['guwahati', 'guwahati india']
  },
  {
    name: 'Nagpur',
    admin1: 'Maharashtra',
    country: 'India',
    countryCode: 'IN',
    latitude: 21.1458,
    longitude: 79.0882,
    aliases: ['nagpur', 'nagpur india']
  },
  {
    name: 'Bhopal',
    admin1: 'Madhya Pradesh',
    country: 'India',
    countryCode: 'IN',
    latitude: 23.2599,
    longitude: 77.4126,
    aliases: ['bhopal', 'bhopal india']
  },
  {
    name: 'Srinagar',
    admin1: 'Jammu and Kashmir',
    country: 'India',
    countryCode: 'IN',
    latitude: 34.0837,
    longitude: 74.7973,
    aliases: ['srinagar', 'srinagar india']
  },
  {
    name: 'Kochi',
    admin1: 'Kerala',
    country: 'India',
    countryCode: 'IN',
    latitude: 9.9312,
    longitude: 76.2673,
    aliases: ['kochi', 'cochin', 'kochi india']
  },
  {
    name: 'Ratnagiri',
    admin1: 'Maharashtra',
    country: 'India',
    countryCode: 'IN',
    latitude: 16.9902,
    longitude: 73.312,
    aliases: ['ratnagiri', 'ratnagiri india']
  }
]

function normalizeQuery(query = '') {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function scoreLocation(location, normalizedQuery) {
  if (!normalizedQuery) {
    return 0
  }

  const aliases = [
    location.name,
    location.admin1,
    `${location.name} ${location.admin1}`,
    `${location.name} ${location.country}`,
    ...(location.aliases || [])
  ].map(normalizeQuery)

  if (aliases.includes(normalizedQuery)) {
    return 100
  }

  if (aliases.some(alias => alias.startsWith(normalizedQuery))) {
    return 85
  }

  if (aliases.some(alias => alias.includes(normalizedQuery))) {
    return 70
  }

  if (normalizedQuery.includes(normalizeQuery(location.name))) {
    return 60
  }

  return 0
}

export function getLocationCatalog() {
  return LOCATION_CATALOG.map(location => ({
    ...location,
    aliases: [...location.aliases]
  }))
}

export function findCatalogLocationByName(name, countryCode) {
  const normalizedQuery = normalizeQuery(name)
  const normalizedCountryCode = countryCode
    ? countryCode.toUpperCase()
    : null

  const candidates = LOCATION_CATALOG
    .filter(location => {
      if (!normalizedCountryCode) {
        return true
      }

      return location.countryCode === normalizedCountryCode
    })
    .map(location => ({
      location,
      score: scoreLocation(location, normalizedQuery)
    }))
    .filter(candidate => candidate.score > 0)
    .sort((left, right) => right.score - left.score)

  return candidates[0]?.location || null
}

export function findNearestCatalogLocation(latitude, longitude) {
  const lat = Number(latitude)
  const lon = Number(longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return LOCATION_CATALOG[0]

  let closest = LOCATION_CATALOG[0]
  let minDist = Infinity

  for (const loc of LOCATION_CATALOG) {
    const dLat = (loc.latitude - lat) * 111
    const dLon = (loc.longitude - lon) * 111 * Math.cos((lat * Math.PI) / 180)
    const dist = Math.sqrt(dLat * dLat + dLon * dLon)
    if (dist < minDist) {
      minDist = dist
      closest = loc
    }
  }

  return {
    ...closest,
    distanceKm: Math.round(minDist)
  }
}

export default {
  getLocationCatalog,
  findCatalogLocationByName,
  findNearestCatalogLocation
}
