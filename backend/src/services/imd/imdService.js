import ImdWarning from '../../models/ImdWarning.js';
import { IMD_WARNING_LEVELS } from '../../config/constants.js';

/**
 * Get all active IMD warnings across India
 * Reads from MongoDB ImdWarning collection (seeded via seed/data/imd-warnings.seed.js)
 * @returns {Promise<Array<object>>}
 */
export async function getAllIMDWarnings() {
  const now = new Date();
  const warnings = await ImdWarning.find({
    status: 'active',
    validFrom: { $lte: now },
    validTo: { $gte: now }
  }).sort({ warningLevel: 1 });

  return warnings.map((item) => ({
    district: item.district,
    state: item.state,
    warningLevel: item.warningLevel,
    action: item.action,
    hazard: item.hazard,
    validFrom: item.validFrom.toISOString(),
    validTo: item.validTo.toISOString(),
    advice: item.advice,
    issuedBy: item.issuedBy,
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

  const query = districtName.trim();
  const now = new Date();

  const match = await ImdWarning.findOne({
    district: { $regex: new RegExp(`^${query}$`, 'i') },
    status: 'active',
    validFrom: { $lte: now },
    validTo: { $gte: now }
  });

  if (match) {
    return {
      district: match.district,
      state: match.state,
      hasActiveWarning: match.warningLevel !== 'Green',
      warningLevel: match.warningLevel,
      action: match.action,
      hazard: match.hazard,
      advice: match.advice,
      validFrom: match.validFrom.toISOString(),
      validTo: match.validTo.toISOString(),
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
  const now = new Date();
  const activeWarnings = await ImdWarning.find({
    status: 'active',
    validFrom: { $lte: now },
    validTo: { $gte: now }
  });

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
    activeRedAlertCount: activeWarnings.filter((d) => d.warningLevel === 'Red').length,
    activeOrangeAlertCount: activeWarnings.filter((d) => d.warningLevel === 'Orange').length,
    activeYellowAlertCount: activeWarnings.filter((d) => d.warningLevel === 'Yellow').length
  };
}

export default {
  getAllIMDWarnings,
  getDistrictWarning,
  getIMDBulletin
};
