const BASE_URL = "https://api.open-meteo.com/v1/elevation";
const elevationCache = new Map();
const MAX_ELEVATION_ENTRIES = 1000;

async function getElevation(latitude, longitude) {
    const latNum = Number(latitude);
    const lonNum = Number(longitude);
    const cacheKey = `${latNum.toFixed(2)}_${lonNum.toFixed(2)}`;

    if (elevationCache.has(cacheKey)) {
        return elevationCache.get(cacheKey);
    }

    const params = new URLSearchParams({
        latitude: latNum,
        longitude: lonNum
    });

    const response = await fetch(`${BASE_URL}?${params}`, {
        signal: AbortSignal.timeout(6000)
    });

    if (!response.ok) {
        throw new Error(`Elevation API error: ${response.status}`);
    }

    const data = await response.json();
    if (elevationCache.size >= MAX_ELEVATION_ENTRIES) {
        const firstKey = elevationCache.keys().next().value;
        elevationCache.delete(firstKey);
    }
    elevationCache.set(cacheKey, data);

    return data;
}

export { getElevation };