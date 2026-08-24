const BASE_URL = "https://marine-api.open-meteo.com/v1/marine";

async function getMarineForecast(latitude, longitude) {
    const params = new URLSearchParams({
        latitude,
        longitude,

        hourly:
            "wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period,sea_surface_temperature",

        daily:
            "wave_height_max,wave_direction_dominant,wave_period_max",

        forecast_days: "7",
        timezone: "auto"
    });

    const response = await fetch(`${BASE_URL}?${params}`);

    if (!response.ok) {
        throw new Error(`Marine API error: ${response.status}`);
    }

    return response.json();
}

export { getMarineForecast };