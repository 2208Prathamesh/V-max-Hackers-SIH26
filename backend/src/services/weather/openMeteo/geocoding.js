import { findCatalogLocationByName } from '../locationCatalog.js';

const BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

/**
 * Search geographic coordinates by location/city name
 * Attempts search globally with prioritized language formatting
 * @param {string} name - City or location name
 * @param {string} [countryCode] - Optional 2-letter country code filter (e.g. 'IN')
 * @returns {Promise<{ results?: Array<object> }>}
 */
async function searchLocation(name, countryCode) {
  if (!name || !name.trim()) {
    return { results: [] };
  }

  const queryParams = {
    name: name.trim(),
    count: '5',
    language: 'en'
  };

  if (countryCode) {
    queryParams.countryCode = countryCode;
  }

  const params = new URLSearchParams(queryParams);
  try {
    const response = await fetch(`${BASE_URL}?${params}`);

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const payload = await response.json();
    if (payload?.results?.length) {
      return payload;
    }
  } catch (error) {
    const fallbackLocation = findCatalogLocationByName(name, countryCode);
    if (fallbackLocation) {
      return {
        results: [
          {
            ...fallbackLocation,
            source: 'WeatherGPT Offline Location Catalog',
            isFallback: true
          }
        ]
      };
    }

    return { results: [] };
  }

  const fallbackLocation = findCatalogLocationByName(name, countryCode);
  if (fallbackLocation) {
    return {
      results: [
        {
          ...fallbackLocation,
          source: 'WeatherGPT Offline Location Catalog',
          isFallback: true
        }
      ]
    };
  }

  return { results: [] };
}

export { searchLocation };
export default { searchLocation };
