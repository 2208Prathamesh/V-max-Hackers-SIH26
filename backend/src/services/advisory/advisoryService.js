import weatherService from '../weather/weatherService.js'
import imdService from '../weather/imd/imdService.js'
import { CROPS } from '../../config/constants.js'

/**
 * Generate Agro-Meteorological Crop Advisory
 * @param {number} latitude
 * @param {number} longitude
 * @param {string} [cropName='general']
 * @returns {Promise<object>}
 */
export async function getAgricultureAdvisory (
  latitude,
  longitude,
  cropName = 'general'
) {
  const crop = (cropName || 'general').toLowerCase()
  const weatherData = await weatherService.getWeather(latitude, longitude)

  const current = weatherData?.forecast?.current || {}
  const hourly = weatherData?.forecast?.hourly || []
  const daily = weatherData?.forecast?.daily || []
  const next3DaysRain = daily
    .slice(0, 3)
    .reduce((acc, d) => acc + (d.precipitationSum ?? d.precipitation ?? 0), 0)

  // Extract soil and atmospheric values
  const currentHour = hourly[0] || {}
  const temp = current.temperature ?? 28
  const humidity = current.humidity ?? 60
  const windSpeed = current.windSpeed ?? 12
  const soilMoisture =
    currentHour.soil_moisture_0_to_1cm ?? currentHour.soilMoisture ?? 0.28 // m³/m³
  const soilTemp =
    currentHour.soil_temperature_0cm ?? currentHour.soilTemperature ?? temp
  const evapotranspiration = currentHour.et0_fao_evapotranspiration ?? 4.2 // mm/day

  // Irrigation Analysis
  let irrigationRecommendation = 'Normal schedule'
  let irrigationStatus = 'MODERATE'

  if (next3DaysRain > 25) {
    irrigationRecommendation =
      'Postpone irrigation. Significant rainfall (>25mm) expected in the next 72 hours.'
    irrigationStatus = 'DELAY_IRRIGATION'
  } else if (soilMoisture < 0.18) {
    irrigationRecommendation =
      'Immediate light irrigation recommended. Topsoil moisture is critically low.'
    irrigationStatus = 'IRRIGATE_SOON'
  } else if (soilMoisture > 0.38) {
    irrigationRecommendation =
      'Adequate soil moisture available. Ensure proper field drainage to prevent root rot.'
    irrigationStatus = 'ADEQUATE'
  }

  // Pesticide / Fertilizer Spray Advisory
  let sprayWindow = 'FAVORABLE'
  let sprayAdvice =
    'Weather conditions are optimal for foliar spray and fertilizer application.'

  if (windSpeed > 20) {
    sprayWindow = 'UNFAVORABLE'
    sprayAdvice =
      'High wind speed (>20 km/h) can cause spray drift. Delay spraying operations until winds subside.'
  } else if (next3DaysRain > 10) {
    sprayWindow = 'UNFAVORABLE'
    sprayAdvice =
      'Rain expected within 48 hours. Postpone chemical application to prevent rain washout.'
  }

  // Crop-Specific Insights
  let cropSpecificNote =
    'General field crops: Monitor soil moisture and maintain drainage channels.'

  if (crop === 'cotton') {
    if (humidity > 75 && temp > 28) {
      cropSpecificNote =
        'High humidity combined with warm temperatures increases risk of bollworm and sucking pests. Inspect lower canopy.'
    } else {
      cropSpecificNote =
        'Optimal growing conditions. Maintain 15-20 days irrigation interval.'
    }
  } else if (crop === 'wheat') {
    if (temp > 32) {
      cropSpecificNote =
        'Terminal heat stress risk detected (>32°C). Apply light irrigation or potassium nitrate spray to mitigate heat shock.'
    } else {
      cropSpecificNote =
        'Favorable cool temperatures for tillering and grain filling.'
    }
  } else if (crop === 'rice') {
    if (next3DaysRain > 50) {
      cropSpecificNote =
        'Excessive rainfall forecasted. Ensure field bunds and outlets are cleared to prevent submergence of young seedlings.'
    } else {
      cropSpecificNote =
        'Maintain 3-5 cm standing water in paddy fields during panicle initiation.'
    }
  } else if (crop === 'sugarcane') {
    cropSpecificNote =
      'Irrigate according to evapotranspiration demand. Apply trash mulching to conserve moisture.'
  } else if (crop === 'tomato' || crop === 'vegetables') {
    if (humidity > 80) {
      cropSpecificNote =
        'High risk of early blight and fruit rot due to sustained atmospheric moisture. Stake plants properly.'
    }
  }

  return {
    location: {
      latitude,
      longitude
    },
    cropSelected: crop,
    supportedCrops: CROPS,
    fieldConditions: {
      temperatureC: temp,
      relativeHumidityPercent: humidity,
      windSpeedKmh: windSpeed,
      soilMoistureM3M3: soilMoisture,
      soilTemperatureC: soilTemp,
      dailyEvapotranspirationMm: evapotranspiration,
      forecastedRainfallNext3DaysMm: parseFloat(next3DaysRain.toFixed(1))
    },
    recommendations: {
      irrigation: {
        status: irrigationStatus,
        advice: irrigationRecommendation
      },
      pesticideSpraying: {
        status: sprayWindow,
        advice: sprayAdvice
      },
      cropSpecificAdvisory: cropSpecificNote
    }
  }
}

/**
 * Generate Disaster Emergency & Safety Action Checklist
 * @param {string} locationName
 * @param {number} [latitude]
 * @param {number} [longitude]
 * @returns {Promise<object>}
 */
export async function getDisasterSafetyAdvisory (
  locationName,
  latitude,
  longitude
) {
  const districtWarning = await imdService.getDistrictWarning(
    locationName || 'Pune'
  )

  const checklist = []
  const emergencyHotlines = [
    { name: 'National Disaster Emergency Helpline', number: '112 / 1078' },
    { name: 'State Disaster Management Authority (SDMA)', number: '1070' },
    { name: 'District Disaster Control Room', number: '1077' },
    { name: 'Ambulance', number: '108' }
  ]

  if (
    districtWarning.warningLevel === 'Red' ||
    districtWarning.warningLevel === 'Orange'
  ) {
    checklist.push(
      'Stay indoors and avoid non-essential travel through waterlogged roads or ghat sections.',
      'Charge essential communication devices, emergency flashlights, and power banks.',
      'Store 48-hour supply of drinking water, non-perishable food, and first-aid supplies.',
      'Unplug sensitive electrical equipment during active thunderstorms and lightning.',
      'Keep cattle and livestock in sheltered, elevated sheds away from low-lying streams.'
    )
  } else if (districtWarning.warningLevel === 'Yellow') {
    checklist.push(
      'Stay updated with regular meteorological bulletins and local news.',
      'Check outdoor drainage spouts and roof clearings for debris.',
      'Avoid parking vehicles under large trees or weak overhead structures.'
    )
  } else {
    checklist.push(
      'No immediate disaster hazards detected in your area.',
      'Maintain standard safety preparedness and follow routine daily weather updates.'
    )
  }

  return {
    location: locationName,
    activeWarning: districtWarning,
    alertLevel: districtWarning.warningLevel,
    safetyActionChecklist: checklist,
    emergencyHotlines
  }
}

export default {
  getAgricultureAdvisory,
  getDisasterSafetyAdvisory
}
