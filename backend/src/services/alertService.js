import Alert from '../models/Alert.js';
import Notification from '../models/Notification.js';
import SavedLocation from '../models/SavedLocation.js';
import imdService from './weather/imd/imdService.js';
import { SEVERITY_LEVELS } from '../config/constants.js';

let lastOfficialSyncAt = 0;
const OFFICIAL_SYNC_TTL_MS = 10 * 60 * 1000;

function normalizeAlertType(hazard = '') {
  const text = String(hazard).toLowerCase();

  if (text.includes('thunder') || text.includes('lightning')) return 'lightning';
  if (text.includes('cyclone') || text.includes('storm')) return 'cyclone';
  if (text.includes('flood')) return 'flood';
  if (text.includes('heat')) return 'heatwave';
  if (text.includes('cold')) return 'coldwave';
  if (text.includes('wind') || text.includes('squall')) return 'strong_wind';
  if (text.includes('fog')) return 'fog';
  if (text.includes('drought')) return 'drought';
  if (text.includes('rain') || text.includes('shower')) return 'rain';
  return 'other';
}

function normalizeSeverity(level = 'low') {
  const normalized = String(level).toLowerCase();
  if (Object.values(SEVERITY_LEVELS).includes(normalized)) {
    return normalized;
  }

  if (normalized.includes('extreme') || normalized.includes('red')) {
    return SEVERITY_LEVELS.EXTREME;
  }

  if (normalized.includes('high') || normalized.includes('orange')) {
    return SEVERITY_LEVELS.HIGH;
  }

  if (normalized.includes('moderate') || normalized.includes('yellow')) {
    return SEVERITY_LEVELS.MODERATE;
  }

  return SEVERITY_LEVELS.LOW;
}

async function notifyMatchedUsers(alert) {
  const matchTerms = [
    alert.location,
    ...(alert.affectedAreas || [])
  ]
    .map(value => String(value || '').trim().toLowerCase())
    .filter(Boolean);

  if (matchTerms.length === 0) {
    return;
  }

  const savedLocations = await SavedLocation.find({});
  const matchingLocations = savedLocations.filter(location => {
    const searchable = [
      location.name,
      location.city,
      location.state,
      location.country
    ]
      .map(value => String(value || '').trim().toLowerCase())
      .filter(Boolean);

    return matchTerms.some(term =>
      searchable.some(value => value.includes(term) || term.includes(value))
    );
  });

  await Promise.all(
    matchingLocations.map(async location => {
      const existing = await Notification.findOne({
        userId: location.userId,
        relatedAlertId: alert._id
      });

      if (existing) {
        return existing;
      }

      return Notification.create({
        userId: location.userId,
        type: 'weather_alert',
        title: alert.title,
        message: alert.description,
        relatedAlertId: alert._id,
        isRead: false
      });
    })
  );
}

async function upsertOfficialWarning(warning) {
  const payload = {
    title: `${warning.warningLevel} alert for ${warning.district}`,
    description: `${warning.hazard}. ${warning.advice}`.trim(),
    type: normalizeAlertType(warning.hazard),
    severity: normalizeSeverity(warning.colorDetails?.severity || warning.warningLevel),
    location: warning.district,
    latitude: warning.latitude ?? 20.5937,
    longitude: warning.longitude ?? 78.9629,
    startTime: new Date(warning.validFrom || Date.now()),
    endTime: new Date(
      warning.validTo || Date.now() + 24 * 3600 * 1000
    ),
    source: warning.source || 'India Meteorological Department (IMD)',
    sourceType: warning.sourceType || 'official',
    externalId:
      warning.externalId ||
      `${warning.source || 'IMD'}:${warning.district}:${warning.warningLevel}`,
    isOfficial: !warning.isFallback,
    affectedAreas: [warning.district, warning.state].filter(Boolean),
    rawSourceUrl: warning.sourceUrl || null,
    issuedAt: warning.validFrom ? new Date(warning.validFrom) : null,
    metadata: {
      warningLevel: warning.warningLevel,
      action: warning.action,
      isFallback: warning.isFallback
    },
    status:
      new Date(warning.validTo || Date.now() + 1) >= new Date()
        ? 'active'
        : 'expired'
  };

  const alert = await Alert.findOneAndUpdate(
    {
      externalId: payload.externalId
    },
    {
      $set: payload
    },
    {
      upsert: true,
      returnDocument: 'after',
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );

  await notifyMatchedUsers(alert);
  return alert;
}

async function expireMissingOfficialAlerts(activeExternalIds) {
  await Alert.updateMany(
    {
      source: { $regex: /imd/i },
      status: 'active',
      externalId: { $nin: activeExternalIds }
    },
    {
      $set: {
        status: 'expired'
      }
    }
  );
}

/**
 * Synchronize official or fallback IMD warnings into the persistent alerts collection.
 * This keeps `/api/alerts` backed by the same warning intelligence used elsewhere.
 */
const syncOfficialAlerts = async (options = {}) => {
  const now = Date.now();
  const force = Boolean(options.force);

  if (!force && now - lastOfficialSyncAt < OFFICIAL_SYNC_TTL_MS) {
    return { skipped: true };
  }

  const warnings = await imdService.getAllIMDWarnings();
  const activeWarnings = warnings.filter(warning => warning.hasActiveWarning);
  const externalIds = [];

  for (const warning of activeWarnings) {
    const alert = await upsertOfficialWarning(warning);
    if (alert.externalId) {
      externalIds.push(alert.externalId);
    }
  }

  await expireMissingOfficialAlerts(externalIds);
  lastOfficialSyncAt = now;

  return {
    skipped: false,
    syncedCount: activeWarnings.length
  };
};

/**
 * Get all alerts
 * @returns {Promise<Array<object>>}
 */
const getAlerts = async () => {
  return await Alert.find().sort({ createdAt: -1 });
};

/**
 * Get alert by ID
 * @param {string} alertId 
 * @returns {Promise<object>}
 */
const getAlert = async (alertId) => {
  const alert = await Alert.findById(alertId);

  if (!alert) {
    const error = new Error('Alert not found');
    error.statusCode = 404;
    throw error;
  }

  return alert;
};

/**
 * Get active alerts
 * @returns {Promise<Array<object>>}
 */
const getActiveAlerts = async () => {
  const now = new Date();

  return await Alert.find({
    status: 'active',
    startTime: { $lte: now },
    endTime: { $gte: now }
  }).sort({
    severity: -1,
    startTime: 1
  });
};

/**
 * Create alert
 * @param {object} alertData 
 * @returns {Promise<object>}
 */
const createAlert = async (alertData) => {
  return await Alert.create(alertData);
};

/**
 * Update alert status
 * @param {string} alertId 
 * @param {string} status 
 * @returns {Promise<object>}
 */
const updateAlertStatus = async (alertId, status) => {
  return await Alert.findByIdAndUpdate(
    alertId,
    { status },
    {
      returnDocument: 'after',
      runValidators: true
    }
  );
};

export {
  getAlerts,
  getAlert,
  getActiveAlerts,
  createAlert,
  updateAlertStatus,
  syncOfficialAlerts
};

export default {
  getAlerts,
  getAlert,
  getActiveAlerts,
  createAlert,
  updateAlertStatus,
  syncOfficialAlerts
};
