const BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";

async function searchLocation(name) {
    const params = new URLSearchParams({
        name,
        count: "5",
        language: "en",
        countryCode: "IN"
    });

    const response = await fetch(`${BASE_URL}?${params}`);

    if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
    }

    return response.json();
}

export { searchLocation };