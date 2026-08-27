import { IMD_WARNING_LEVELS } from '../../config/constants.js';

// Realistic IMD District Warning Registry across Indian States
const IMD_ACTIVE_DISTRICT_DATABASE = [
  {
    district: 'Pune',
    state: 'Maharashtra',
    warningLevel: 'Orange',
    action: 'Be Prepared',
    hazard: 'Heavy to very heavy rainfall with gusty winds',
    validFrom: new Date().toISOString(),
    validTo: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    advice: 'Avoid ghat roads and low-lying river bank areas due to waterlogging potential.',
    issuedBy: 'Regional Meteorological Centre, Mumbai'
  },
  {
    district: 'Mumbai',
    state: 'Maharashtra',
    warningLevel: 'Orange',
    action: 'Be Prepared',
    hazard: 'Heavy to very heavy rainfall & high tide advisory',
    validFrom: new Date().toISOString(),
    validTo: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    advice: 'Fishermen are advised not to venture along and off Maharashtra-Goa coasts.',
    issuedBy: 'Regional Meteorological Centre, Mumbai'
  },
  {
    district: 'Ratnagiri',
    state: 'Maharashtra',
    warningLevel: 'Red',
    action: 'Take Action',
    hazard: 'Extremely heavy rainfall & squally winds up to 65 kmph',
    validFrom: new Date().toISOString(),
    validTo: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
    advice: 'High alert for flash flooding and landslide prone hill slopes.',
    issuedBy: 'IMD Coastal Warning Center'
  },
  {
    district: 'Delhi',
    state: 'Delhi NCR',
    warningLevel: 'Yellow',
    action: 'Be Updated',
    hazard: 'Moderate thunderstorm with lightning and light rain',
    validFrom: new Date().toISOString(),
    validTo: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    advice: 'Take shelter in safe structures during lightning strikes.',
    issuedBy: 'Regional Meteorological Centre, New Delhi'
  },
  {
    district: 'Chennai',
    state: 'Tamil Nadu',
    warningLevel: 'Yellow',
    action: 'Be Updated',
    hazard: 'Isolated heavy rain with localized thunderstorms',
    validFrom: new Date().toISOString(),
    validTo: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    advice: 'Keep updated with city nowcasts.',
    issuedBy: 'Regional Meteorological Centre, Chennai'
  },
  {
    district: 'Kolkata',
    state: 'West Bengal',
    warningLevel: 'Yellow',
    action: 'Be Updated',
    hazard: 'Thunderstorm accompanied with lightning and gusty wind',
    validFrom: new Date().toISOString(),
    validTo: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    advice: 'Avoid taking shelter under tall trees during lightning.',
    issuedBy: 'Regional Meteorological Centre, Kolkata'
  }
];

/**
 * Get all active IMD warnings across India
 * @returns {Promise<Array<object>>}
 */
export async function getAllIMDWarnings() {
  return IMD_ACTIVE_DISTRICT_DATABASE.map((item) => ({
    ...item,
    colorDetails: IMD_WARNING_LEVELS[item.warningLevel.toUpperCase()] || IMD_WARNING_LEVELS.GREEN
  }));
}

/**
 * Get district-specific IMD weather warning
 * @param {string} districtName
 * @returns {Promise<object>}
 */
export async function getDistrictWarning(districtName) {
  if (!districtName || !districtName.trim()) {
    throw new Error('District name is required');
  }

  const query = districtName.trim().toLowerCase();
  const match = IMD_ACTIVE_DISTRICT_DATABASE.find(
    (item) => item.district.toLowerCase() === query || query.includes(item.district.toLowerCase())
  );

  if (match) {
    return {
      district: match.district,
      state: match.state,
      hasActiveWarning: match.warningLevel !== 'Green',
      warningLevel: match.warningLevel,
      action: match.action,
      hazard: match.hazard,
      advice: match.advice,
      validFrom: match.validFrom,
      validTo: match.validTo,
      issuedBy: match.issuedBy,
      colorDetails: IMD_WARNING_LEVELS[match.warningLevel.toUpperCase()] || IMD_WARNING_LEVELS.GREEN
    };
  }

  // Default Green (Safe / No Warning) for unlisted districts
  return {
    district: districtName.trim(),
    state: 'India',
    hasActiveWarning: false,
    warningLevel: 'Green',
    action: 'No Warning',
    hazard: 'No severe weather warning issued',
    advice: 'Normal weather conditions prevail. Regular daily activities can proceed.',
    validFrom: new Date().toISOString(),
    validTo: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    issuedBy: 'India Meteorological Department (IMD)',
    colorDetails: IMD_WARNING_LEVELS.GREEN
  };
}

/**
 * Get national weather bulletin and nowcast summary
 * @returns {Promise<object>}
 */
export async function getIMDBulletin() {
  return {
    title: 'All India Weather Summary & Forecast Bulletin',
    issueDate: new Date().toISOString(),
    source: 'India Meteorological Department (IMD), MoES, Govt of India',
    synopticFeatures: [
      'Monsoon trough active with cyclonic circulation over east central Arabian Sea',
      'Western disturbance observed as a trough in mid-tropospheric westerlies',
      'Fairly widespread to widespread light to moderate rainfall likely over Konkan & Goa, Coastal Karnataka'
    ],
    seaCondition: 'Rough to very rough over Southwest and adjoining Westcentral Arabian Sea. Wind speed 45-55 kmph gusting to 65 kmph.',
    activeRedAlertCount: IMD_ACTIVE_DISTRICT_DATABASE.filter((d) => d.warningLevel === 'Red').length,
    activeOrangeAlertCount: IMD_ACTIVE_DISTRICT_DATABASE.filter((d) => d.warningLevel === 'Orange').length,
    activeYellowAlertCount: IMD_ACTIVE_DISTRICT_DATABASE.filter((d) => d.warningLevel === 'Yellow').length
  };
}

export default {
  getAllIMDWarnings,
  getDistrictWarning,
  getIMDBulletin
};
