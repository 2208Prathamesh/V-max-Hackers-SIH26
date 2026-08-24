const BASE_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

async function getAirQuality(latitude, longitude) {
    const params = new URLSearchParams({
        latitude,
        longitude,

        current:
            "european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone",

        hourly:
            "pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi,us_aqi",

        forecast_days: "5",
        timezone: "auto"
    });

    const response = await fetch(`${BASE_URL}?${params}`);

    if (!response.ok) {
        throw new Error(`Air Quality API error: ${response.status}`);
    }

    return response.json();
}

export { getAirQuality };