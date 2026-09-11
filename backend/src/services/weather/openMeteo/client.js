import { buildOfflineForecastPayload } from '../offlineWeather.js';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Fetch comprehensive forecast data from Open-Meteo with offline fallback
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} [days=7]
 * @returns {Promise<object>}
 */
async function getForecast(latitude, longitude, days = 7) {
  const params = new URLSearchParams({
    latitude,
    longitude,

    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,is_day',

    hourly:
      'temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,weather_code,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,soil_temperature_0cm,soil_temperature_6cm,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,uv_index,is_day,et0_fao_evapotranspiration',

    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,showers_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,et0_fao_evapotranspiration',

    forecast_days: String(Math.min(Math.max(days, 1), 16)),
    timezone: 'auto'
  });

  try {
    const response = await fetch(`${BASE_URL}?${params}`, {
      headers: {
        'User-Agent': 'WeatherGPT/2.0 (SIH-2026; Smart India Hackathon; contact@weathergpt.ai)',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(12000)
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(`[Open-Meteo] Request failed (${error.message}); utilizing high-fidelity offline NWP fallback for (${latitude}, ${longitude})`);
    return buildOfflineForecastPayload(Number(latitude), Number(longitude), {
      days,
      hours: Math.max(days * 24, 72),
      providerName: 'WeatherGPT Synoptic Engine'
    });
  }
}

export { getForecast };
export default { getForecast };
