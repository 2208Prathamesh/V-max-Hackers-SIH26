const BASE_URL = "https://api.open-meteo.com/v1/gfs";
import { buildOfflineForecastPayload } from '../offlineWeather.js';

async function getGFSForecast(latitude, longitude, days = 7) {
    const params = new URLSearchParams({
        latitude,
        longitude,

        hourly:
            "temperature_2m,relative_humidity_2m,precipitation,precipitation_probability,wind_speed_10m,wind_direction_10m,surface_pressure",

        daily:
            "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max",

        forecast_days: String(Math.min(Math.max(days, 1), 16)),
        timezone: "auto"
    });

    try {
        const response = await fetch(`${BASE_URL}?${params}`);

        if (!response.ok) {
            throw new Error(`GFS API error: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        return buildOfflineForecastPayload(Number(latitude), Number(longitude), {
            days,
            hours: Math.max(days * 24, 48),
            providerName: 'WeatherGPT Offline GFS',
            modelBias: {
                temperature: 0.8,
                precipitationProbability: 5,
                precipitation: 0.2,
                windSpeed: 1.5
            }
        });
    }
}

export { getGFSForecast };
