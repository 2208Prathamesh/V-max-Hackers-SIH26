import { IMD_WARNING_LEVELS } from '../../../config/constants.js'
import { getImdAlerts } from './imdAlertService.js'
import { findCatalogLocationByName } from '../locationCatalog.js'

const FALLBACK_DISTRICT_WARNINGS = [
  {
    district: 'Pune',
    state: 'Maharashtra',
    warningLevel: 'Orange',
    hazard: 'Heavy to very heavy rainfall with gusty winds',
    advice:
      'Avoid ghat roads and low-lying river bank areas due to waterlogging potential.',
    issuedBy: 'Regional Meteorological Centre, Mumbai'
  },
  {
    district: 'Mumbai',
    state: 'Maharashtra',
    warningLevel: 'Orange',
    hazard: 'Heavy to very heavy rainfall and high tide advisory',
    advice:
      'Fishermen are advised not to venture along and off Maharashtra-Goa coasts.',
    issuedBy: 'Regional Meteorological Centre, Mumbai'
  },
  {
    district: 'Ratnagiri',
    state: 'Maharashtra',
    warningLevel: 'Red',
    hazard: 'Extremely heavy rainfall and squally winds up to 65 kmph',
    advice: 'High alert for flash flooding and landslide-prone hill slopes.',
    issuedBy: 'IMD Coastal Warning Center'
  },
  {
    district: 'Delhi',
    state: 'Delhi NCR',
    warningLevel: 'Yellow',
    hazard: 'Moderate thunderstorm with lightning and light rain',
    advice: 'Take shelter in safe structures during lightning strikes.',
    issuedBy: 'Regional Meteorological Centre, New Delhi'
  },
  {
    district: 'Chennai',
    state: 'Tamil Nadu',
    warningLevel: 'Yellow',
    hazard: 'Isolated heavy rain with localized thunderstorms',
    advice: 'Keep updated with city nowcasts.',
    issuedBy: 'Regional Meteorological Centre, Chennai'
  },
  {
    district: 'Kolkata',
    state: 'West Bengal',
    warningLevel: 'Yellow',
    hazard: 'Thunderstorm accompanied with lightning and gusty wind',
    advice: 'Avoid taking shelter under tall trees during lightning.',
    issuedBy: 'Regional Meteorological Centre, Kolkata'
  }
]

function normalizeWarningLevel(level) {
  const normalized = String(level || '').toLowerCase()

  if (normalized.includes('extreme') || normalized.includes('severe')) {
    return 'Red'
  }

  if (normalized.includes('moderate')) {
    return 'Orange'
  }

  if (normalized.includes('minor') || normalized.includes('watch')) {
    return 'Yellow'
  }

  return 'Yellow'
}

function resolveDistrictCoordinates(district, state) {
  return (
    findCatalogLocationByName(`${district} ${state || ''}`.trim(), 'IN') ||
    findCatalogLocationByName(district, 'IN') || {
      latitude: 20.5937,
      longitude: 78.9629
    }
  )
}

function enrichWarning(item, extras = {}) {
  const warningLevel = item.warningLevel || 'Green'
  const coordinates = resolveDistrictCoordinates(item.district, item.state)
  const colorDetails =
    IMD_WARNING_LEVELS[warningLevel.toUpperCase()] || IMD_WARNING_LEVELS.GREEN

  return {
    district: item.district,
    state: item.state || 'India',
    hasActiveWarning: warningLevel !== 'Green',
    warningLevel,
    action: item.action || colorDetails.action,
    hazard: item.hazard,
    advice: item.advice,
    validFrom: item.validFrom,
    validTo: item.validTo,
    issuedBy: item.issuedBy,
    colorDetails,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    source: extras.source || 'India Meteorological Department (IMD)',
    sourceType: extras.sourceType || 'official',
    isFallback: extras.isFallback || false,
    externalId: extras.externalId || null,
    sourceUrl: extras.sourceUrl || null
  }
}

function buildFallbackWarnings() {
  const now = Date.now()

  return FALLBACK_DISTRICT_WARNINGS.map((item, index) =>
    enrichWarning(
      {
        ...item,
        validFrom: new Date(now).toISOString(),
        validTo: new Date(now + (24 + index * 6) * 3600 * 1000).toISOString()
      },
      {
        source: 'WeatherGPT IMD fallback registry',
        sourceType: 'fallback_official_summary',
        isFallback: true,
        externalId: `fallback-${item.district.toLowerCase()}`
      }
    )
  )
}

function splitAreaDescriptions(areaDescription = '') {
  return areaDescription
    .split(/[,;/]| and /i)
    .map(part => part.trim())
    .filter(Boolean)
}

function normalizeOfficialAlerts(alerts = []) {
  const warnings = []

  for (const alert of alerts) {
    const warningLevel = normalizeWarningLevel(alert.severity)
    const areaNames = alert.areas?.length
      ? alert.areas.flatMap(area => splitAreaDescriptions(area.description))
      : ['India']

    for (const areaName of areaNames) {
      warnings.push(
        enrichWarning(
          {
            district: areaName,
            state: 'India',
            warningLevel,
            hazard: alert.event || alert.headline || 'Official weather warning',
            advice:
              alert.instruction ||
              alert.description ||
              'Follow the latest IMD instructions for your district.',
            validFrom: alert.onset || alert.issuedAt || new Date().toISOString(),
            validTo:
              alert.expires ||
              new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
            issuedBy:
              alert.senderName || alert.sender || 'India Meteorological Department'
          },
          {
            source: alert.source || 'India Meteorological Department (IMD)',
            sourceType: alert.sourceType || 'official_alert',
            isFallback: false,
            externalId: `${alert.id || 'imd-alert'}:${areaName.toLowerCase()}`,
            sourceUrl: alert.sourceUrl || null
          }
        )
      )
    }
  }

  return warnings
}

async function getLiveWarnings(limit = 12) {
  const alerts = await getImdAlerts(limit)
  const warnings = normalizeOfficialAlerts(alerts)
  return warnings.filter(warning => warning.warningLevel !== 'Green')
}

export async function getAllIMDWarnings() {
  try {
    const liveWarnings = await getLiveWarnings()
    if (liveWarnings.length > 0) {
      return liveWarnings
    }
  } catch (error) {
    console.warn('Official IMD alert fetch failed:', error.message)
  }

  return buildFallbackWarnings()
}

export async function getDistrictWarning(districtName) {
  if (!districtName || !districtName.trim()) {
    throw new Error('District name is required')
  }

  const query = districtName.trim().toLowerCase()
  const warnings = await getAllIMDWarnings()
  const match = warnings.find(
    item =>
      item.district.toLowerCase() === query ||
      query.includes(item.district.toLowerCase()) ||
      item.district.toLowerCase().includes(query)
  )

  if (match) {
    return match
  }

  const fallbackWarnings = buildFallbackWarnings()
  const fallbackMatch = fallbackWarnings.find(
    item =>
      item.district.toLowerCase() === query ||
      query.includes(item.district.toLowerCase()) ||
      item.district.toLowerCase().includes(query)
  )

  if (fallbackMatch) {
    return fallbackMatch
  }

  return enrichWarning(
    {
      district: districtName.trim(),
      state: 'India',
      warningLevel: 'Green',
      hazard: 'No severe weather warning issued',
      advice:
        'Normal weather conditions prevail. Regular daily activities can proceed.',
      validFrom: new Date().toISOString(),
      validTo: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      issuedBy: 'India Meteorological Department (IMD)'
    },
    {
      source: 'India Meteorological Department (IMD)',
      sourceType: 'official',
      isFallback: false
    }
  )
}

export async function getIMDBulletin() {
  const warnings = await getAllIMDWarnings()
  const officialWarnings = warnings.filter(warning => !warning.isFallback)

  return {
    title: 'All India Weather Summary and Forecast Bulletin',
    issueDate: new Date().toISOString(),
    source:
      officialWarnings.length > 0
        ? 'India Meteorological Department (IMD) CAP feed'
        : 'WeatherGPT IMD fallback registry',
    sourceType:
      officialWarnings.length > 0 ? 'official' : 'fallback_official_summary',
    isFallback: officialWarnings.length === 0,
    synopticFeatures: [
      'Official CAP alerts are converted into district-level warning summaries when available.',
      'District warnings preserve their source and fallback status for downstream advisory and alert handling.',
      'Use district-specific warnings for impact-based responses and public safety messaging.'
    ],
    activeRedAlertCount: warnings.filter(d => d.warningLevel === 'Red').length,
    activeOrangeAlertCount: warnings.filter(d => d.warningLevel === 'Orange').length,
    activeYellowAlertCount: warnings.filter(d => d.warningLevel === 'Yellow').length,
    warningsSample: warnings.slice(0, 5).map(warning => ({
      district: warning.district,
      warningLevel: warning.warningLevel,
      hazard: warning.hazard,
      isFallback: warning.isFallback
    }))
  }
}

export default {
  getAllIMDWarnings,
  getDistrictWarning,
  getIMDBulletin
}
