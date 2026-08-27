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
  const response = await fetch(`${BASE_URL}?${params}`);

  if (!response.ok) {
    throw new Error(`Geocoding API error: ${response.status}`);
  }

  return response.json();
}

export { searchLocation };
export default { searchLocation };