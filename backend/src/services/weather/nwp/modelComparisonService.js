import { getForecast as getOpenMeteoForecast } from '../openMeteo/client.js';
import { getECMWFWeather } from './ecmwf/service.js';
import { getECMWFForecast as getOpenMeteoECMWF } from '../openMeteo/ecmwf.js';
import { getGFSForecast } from '../openMeteo/gfs.js';
import { normalizeForecast } from '../normalizers/weatherNormalizer.js';

/**
 * Fetch ECMWF weather with fallback
 */
async function fetchECMWF(latitude, longitude) {
  try {
    return await getECMWFWeather(latitude, longitude);
  } catch (err) {
    try {
      const fallback = await getOpenMeteoECMWF(latitude, longitude);
      return normalizeForecast(fallback, 'ECMWF (Open-Meteo)');
    } catch {
      return null;
    }
  }
}

function extractEcmwfPoint(ecmwfData) {
  if (!ecmwfData) {
    return null;
  }

  if (ecmwfData.current) {
    return {
      temperatureC: ecmwfData.current.temperature ?? null,
      feelsLikeC: ecmwfData.current.apparentTemperature ?? null,
      humidity: ecmwfData.current.humidity ?? null,
      windSpeedKmh: ecmwfData.current.windSpeed ?? null,
      precipitationMm: ecmwfData.current.precipitation ?? 0,
      pressureHpa: ecmwfData.current.pressure ?? null
    };
  }

  if (ecmwfData.forecast) {
    return {
      temperatureC: ecmwfData.forecast.temperature ?? null,
      feelsLikeC: ecmwfData.forecast.temperature ?? null,
      humidity: ecmwfData.forecast.humidity ?? null,
      windSpeedKmh: ecmwfData.forecast.windSpeed ?? null,
      precipitationMm: 0,
      pressureHpa: ecmwfData.forecast.pressure ?? null
    };
  }

  return {
    temperatureC: ecmwfData.temperature?.celsius ?? ecmwfData.temperature ?? null,
    feelsLikeC: ecmwfData.feelsLike?.celsius ?? null,
    humidity: ecmwfData.humidity?.relative ?? null,
    windSpeedKmh: ecmwfData.wind?.speedKmh ?? null,
    precipitationMm: ecmwfData.precipitation?.mm ?? 0,
    pressureHpa: ecmwfData.pressure?.hpa ?? null
  };
}

/**
 * Compare Multi-Model Numerical Weather Predictions (ECMWF vs NOAA GFS vs Open-Meteo)
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<object>}
 */
export async function compareNWPModels(latitude, longitude) {
  const [openMeteoRaw, ecmwfData, gfsRaw] = await Promise.all([
    getOpenMeteoForecast(latitude, longitude).catch(() => null),
    fetchECMWF(latitude, longitude),
    getGFSForecast(latitude, longitude).catch(() => null)
  ]);

  const openMeteoNorm = openMeteoRaw ? normalizeForecast(openMeteoRaw, 'Open-Meteo') : null;
  const gfsNorm = gfsRaw ? normalizeForecast(gfsRaw, 'NOAA GFS') : null;

  // Extract model comparison parameters
  const models = [];

  if (openMeteoNorm?.current) {
    models.push({
      modelName: 'Open-Meteo Global Best Match',
      provider: 'Open-Meteo Consortium',
      temperatureC: openMeteoNorm.current.temperature ?? null,
      feelsLikeC: openMeteoNorm.current.apparentTemperature ?? null,
      humidity: openMeteoNorm.current.humidity ?? null,
      windSpeedKmh: openMeteoNorm.current.windSpeed ?? null,
      precipitationMm: openMeteoNorm.current.precipitation ?? 0,
      pressureHpa: openMeteoNorm.current.pressure ?? null
    });
  }

  const ecmwfPoint = extractEcmwfPoint(ecmwfData);

  if (ecmwfPoint) {
    models.push({
      modelName: 'ECMWF IFS (Integrated Forecast System)',
      provider: 'European Centre for Medium-Range Weather Forecasts',
      temperatureC: ecmwfPoint.temperatureC,
      feelsLikeC: ecmwfPoint.feelsLikeC,
      humidity: ecmwfPoint.humidity,
      windSpeedKmh: ecmwfPoint.windSpeedKmh,
      precipitationMm: ecmwfPoint.precipitationMm,
      pressureHpa: ecmwfPoint.pressureHpa
    });
  }

  if (gfsNorm?.current) {
    models.push({
      modelName: 'NOAA GFS (Global Forecast System)',
      provider: 'National Oceanic and Atmospheric Administration (USA)',
      temperatureC: gfsNorm.current.temperature ?? null,
      feelsLikeC: gfsNorm.current.apparentTemperature ?? null,
      humidity: gfsNorm.current.humidity ?? null,
      windSpeedKmh: gfsNorm.current.windSpeed ?? null,
      precipitationMm: gfsNorm.current.precipitation ?? 0,
      pressureHpa: gfsNorm.current.pressure ?? null
    });
  }

  // Calculate statistics across models
  const validTemps = models.map((m) => m.temperatureC).filter((t) => t !== null && !Number.isNaN(t));
  const validRains = models.map((m) => m.precipitationMm).filter((r) => r !== null && !Number.isNaN(r));
  const validWinds = models.map((m) => m.windSpeedKmh).filter((w) => w !== null && !Number.isNaN(w));

  const meanTemp = validTemps.length > 0
    ? parseFloat((validTemps.reduce((a, b) => a + b, 0) / validTemps.length).toFixed(1))
    : null;

  const tempSpread = validTemps.length > 1
    ? parseFloat((Math.max(...validTemps) - Math.min(...validTemps)).toFixed(1))
    : 0;

  const maxRain = validRains.length > 0 ? Math.max(...validRains) : 0;
  const minRain = validRains.length > 0 ? Math.min(...validRains) : 0;
  const rainSpread = parseFloat((maxRain - minRain).toFixed(1));

  const avgWind = validWinds.length > 0
    ? parseFloat((validWinds.reduce((a, b) => a + b, 0) / validWinds.length).toFixed(1))
    : null;

  // Calculate Forecast Confidence Score (0 - 100%)
  // Tighter spread between models = higher confidence score
  let confidenceScore = 95;
  if (tempSpread > 1.5) confidenceScore -= (tempSpread - 1.5) * 8;
  if (rainSpread > 5) confidenceScore -= (rainSpread - 5) * 3;
  confidenceScore = Math.max(40, Math.min(99, Math.round(confidenceScore)));

  let confidenceCategory = 'High';
  if (confidenceScore < 65) confidenceCategory = 'Low';
  else if (confidenceScore < 80) confidenceCategory = 'Moderate';

  let agreementSummary = `Models are in strong consensus. Both ECMWF and GFS indicate a mean temperature of ${meanTemp}°C.`;
  if (tempSpread > 2.5) {
    agreementSummary = `Moderate divergence observed between GFS and ECMWF (Spread: ${tempSpread}°C). ECMWF is projecting slightly different atmospheric cooling.`;
  }

  return {
    location: {
      latitude,
      longitude
    },
    consensus: {
      temperatureC: meanTemp,
      temperatureSpreadC: tempSpread,
      avgWindSpeedKmh: avgWind,
      maxExpectedRainMm: maxRain,
      confidenceScore,
      confidenceCategory,
      agreementSummary
    },
    comparedModelsCount: models.length,
    models
  };
}

export default {
  compareNWPModels
};
