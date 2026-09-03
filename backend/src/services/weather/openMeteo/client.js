const BASE_URL = 'https://api.open-meteo.com/v1/forecast';
import { buildOfflineForecastPayload } from '../offlineWeather.js';

/**
 * Fetch comprehensive forecast data from Open-Meteo
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
      'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m',

    hourly:
      'temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,weather_code,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,soil_temperature_0cm,soil_temperature_6cm,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,uv_index,et0_fao_evapotranspiration',

    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,showers_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,et0_fao_evapotranspiration',

    forecast_days: String(Math.min(Math.max(days, 1), 16)),
    timezone: 'auto'
  });

  try {
    const response = await fetch(`${BASE_URL}?${params}`);

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    return buildOfflineForecastPayload(Number(latitude), Number(longitude), {
      days,
      hours: Math.max(days * 24, 48),
      providerName: 'WeatherGPT Offline Forecast'
    });
  }
}

export { getForecast };
export default { getForecast };
