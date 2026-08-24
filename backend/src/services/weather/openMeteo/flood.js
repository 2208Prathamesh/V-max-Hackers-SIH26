const BASE_URL = "https://flood-api.open-meteo.com/v1/flood";

async function getFloodForecast(latitude, longitude) {
    const params = new URLSearchParams({
        latitude,
        longitude,

        daily:
            "river_discharge,river_discharge_mean,river_discharge_median,river_discharge_max",

        forecast_days: "30",
        timezone: "auto"
    });

    const response = await fetch(`${BASE_URL}?${params}`);

    if (!response.ok) {
        throw new Error(`Flood API error: ${response.status}`);
    }

    return response.json();
}

export { getFloodForecast };