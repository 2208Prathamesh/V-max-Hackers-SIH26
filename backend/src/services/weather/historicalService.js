const ARCHIVE_BASE_URL = 'https://archive-api.open-meteo.com/v1/archive';

const historicalCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetch raw historical weather data from Open-Meteo Archive API
 * @param {number} latitude
 * @param {number} longitude
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {Promise<object>}
 */
export async function getHistoricalWeather(latitude, longitude, startDate, endDate) {
  const cacheKey = `hist_${Number(latitude).toFixed(3)}_${Number(longitude).toFixed(3)}_${startDate}_${endDate}`;
  const cached = historicalCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const params = new URLSearchParams({
    latitude,
    longitude,
    start_date: startDate,
    end_date: endDate,
    daily: 'temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,rain_sum,wind_speed_10m_max',
    timezone: 'auto'
  });

  const response = await fetch(`${ARCHIVE_BASE_URL}?${params}`);

  if (!response.ok) {
    throw new Error(`Open-Meteo Archive API error: ${response.status} (${response.statusText})`);
  }

  const data = await response.json();
  historicalCache.set(cacheKey, { timestamp: Date.now(), data });
  return data;
}

/**
 * Compute 10-year or 20-year climate trends, seasonal variance, and anomalies
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} [startYear]
 * @param {number} [endYear]
 * @returns {Promise<object>}
 */
export async function getClimateTrends(latitude, longitude, startYear, endYear) {
  const currentYear = new Date().getFullYear();
  const end = endYear || currentYear - 1;
  const start = startYear || Math.max(1980, end - 19); // Default: 20-year span

  const startDate = `${start}-01-01`;
  const endDate = `${end}-12-31`;

  const rawData = await getHistoricalWeather(latitude, longitude, startDate, endDate);
  const daily = rawData.daily || {};

  const times = daily.time || [];
  const tempMeans = daily.temperature_2m_mean || [];
  const tempMaxs = daily.temperature_2m_max || [];
  const precipitations = daily.precipitation_sum || [];

  // Group by year
  const yearlyStats = {};

  for (let i = 0; i < times.length; i++) {
    const year = times[i].slice(0, 4);
    if (!yearlyStats[year]) {
      yearlyStats[year] = {
        year: parseInt(year, 10),
        totalPrecipitation: 0,
        tempSum: 0,
        tempCount: 0,
        maxTempRecorded: -Infinity,
        extremeHeatDays: 0, // days > 40°C
        heavyRainDays: 0   // days > 50mm
      };
    }

    const rain = precipitations[i] ?? 0;
    const meanT = tempMeans[i];
    const maxT = tempMaxs[i];

    yearlyStats[year].totalPrecipitation += rain;

    if (meanT !== null && meanT !== undefined && !Number.isNaN(meanT)) {
      yearlyStats[year].tempSum += meanT;
      yearlyStats[year].tempCount += 1;
    }

    if (maxT !== null && maxT !== undefined) {
      if (maxT > yearlyStats[year].maxTempRecorded) {
        yearlyStats[year].maxTempRecorded = maxT;
      }
      if (maxT >= 40) {
        yearlyStats[year].extremeHeatDays += 1;
      }
    }

    if (rain >= 50) {
      yearlyStats[year].heavyRainDays += 1;
    }
  }

  // Format yearly summaries
  const yearsArray = Object.values(yearlyStats).map((stat) => ({
    year: stat.year,
    annualRainfallMm: parseFloat(stat.totalPrecipitation.toFixed(1)),
    averageTemperatureC: stat.tempCount > 0 ? parseFloat((stat.tempSum / stat.tempCount).toFixed(2)) : null,
    maxTemperatureC: stat.maxTempRecorded !== -Infinity ? stat.maxTempRecorded : null,
    extremeHeatDays: stat.extremeHeatDays,
    heavyRainDays: stat.heavyRainDays
  }));

  // Overall multi-year trend calculation
  const totalRainAllYears = yearsArray.reduce((acc, y) => acc + y.annualRainfallMm, 0);
  const avgAnnualRainfall = yearsArray.length > 0 ? parseFloat((totalRainAllYears / yearsArray.length).toFixed(1)) : 0;

  const validTemps = yearsArray.filter((y) => y.averageTemperatureC !== null);
  const avgAnnualTemp = validTemps.length > 0
    ? parseFloat((validTemps.reduce((acc, y) => acc + y.averageTemperatureC, 0) / validTemps.length).toFixed(2))
    : null;

  // Compare first half vs second half to determine long-term shift
  const half = Math.floor(yearsArray.length / 2);
  let tempShiftC = 0;
  let rainShiftPercent = 0;

  if (half > 0) {
    const firstHalfRain = yearsArray.slice(0, half).reduce((acc, y) => acc + y.annualRainfallMm, 0) / half;
    const secondHalfRain = yearsArray.slice(half).reduce((acc, y) => acc + y.annualRainfallMm, 0) / (yearsArray.length - half);
    rainShiftPercent = firstHalfRain > 0 ? parseFloat((((secondHalfRain - firstHalfRain) / firstHalfRain) * 100).toFixed(1)) : 0;

    const firstHalfTemps = validTemps.slice(0, half);
    const secondHalfTemps = validTemps.slice(half);

    if (firstHalfTemps.length > 0 && secondHalfTemps.length > 0) {
      const avgT1 = firstHalfTemps.reduce((acc, y) => acc + y.averageTemperatureC, 0) / firstHalfTemps.length;
      const avgT2 = secondHalfTemps.reduce((acc, y) => acc + y.averageTemperatureC, 0) / secondHalfTemps.length;
      tempShiftC = parseFloat((avgT2 - avgT1).toFixed(2));
    }
  }

  return {
    location: {
      latitude,
      longitude
    },
    timeSpan: {
      startYear: start,
      endYear: end,
      totalYears: yearsArray.length
    },
    baselineNormals: {
      avgAnnualRainfallMm: avgAnnualRainfall,
      avgAnnualTemperatureC: avgAnnualTemp
    },
    climateShift: {
      temperatureShiftC: tempShiftC,
      rainfallChangePercent: rainShiftPercent,
      warmingTrendDetected: tempShiftC > 0.2
    },
    yearlyTrends: yearsArray
  };
}

export default {
  getHistoricalWeather,
  getClimateTrends
};
