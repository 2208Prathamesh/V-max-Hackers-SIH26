const BASE_URL = "https://api.open-meteo.com/v1/elevation";

async function getElevation(latitude, longitude) {
    const params = new URLSearchParams({
        latitude,
        longitude
    });

    const response = await fetch(`${BASE_URL}?${params}`);

    if (!response.ok) {
        throw new Error(`Elevation API error: ${response.status}`);
    }

    return response.json();
}

export { getElevation };