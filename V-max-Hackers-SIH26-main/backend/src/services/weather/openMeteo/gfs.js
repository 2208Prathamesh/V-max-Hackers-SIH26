const BASE_URL = "https://api.open-meteo.com/v1/gfs";

async function getGFSForecast(latitude, longitude) {
    const params = new URLSearchParams({
        latitude,
        longitude,

        hourly:
            "temperature_2m,relative_humidity_2m,precipitation,precipitation_probability,wind_speed_10m,wind_direction_10m,surface_pressure",

        daily:
            "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max",

        forecast_days: "7",
        timezone: "auto"
    });

    const response = await fetch(`${BASE_URL}?${params}`);

    if (!response.ok) {
        throw new Error(`GFS API error: ${response.status}`);
    }

    return response.json();
}

export { getGFSForecast };