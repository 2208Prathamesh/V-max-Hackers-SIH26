import Alert from '../models/Alert.js';
import { getIO } from '../config/socket.js';
import Notification from '../models/Notification.js';
import SavedLocation from '../models/SavedLocation.js';
import imdService from './weather/imd/imdService.js';
import { SEVERITY_LEVELS } from '../config/constants.js';

let lastOfficialSyncAt = 0;

const OFFICIAL_SYNC_TTL_MS = 10 * 60 * 1000;

/* =========================================================
   ALERT TYPE NORMALIZATION
   ========================================================= */

function normalizeAlertType(hazard = '') {
  const text = String(hazard).toLowerCase();

  if (text.includes('thunder') || text.includes('lightning')) {
    return 'lightning';
  }

  if (text.includes('cyclone') || text.includes('storm')) {
    return 'cyclone';
  }

  if (text.includes('flood')) {
    return 'flood';
  }

  if (text.includes('heat')) {
    return 'heatwave';
  }

  if (text.includes('cold')) {
    return 'coldwave';
  }

  if (text.includes('wind') || text.includes('squall')) {
    return 'strong_wind';
  }

  if (text.includes('fog')) {
    return 'fog';
  }

  if (text.includes('drought')) {
    return 'drought';
  }

  if (text.includes('rain') || text.includes('shower')) {
    return 'rain';
  }

  return 'other';
}

/* =========================================================
   SEVERITY NORMALIZATION
   ========================================================= */

function normalizeSeverity(level = 'low') {
  const normalized = String(level).toLowerCase();

  if (Object.values(SEVERITY_LEVELS).includes(normalized)) {
    return normalized;
  }

  if (
    normalized.includes('extreme') ||
    normalized.includes('red')
  ) {
    return SEVERITY_LEVELS.EXTREME;
  }

  if (
    normalized.includes('high') ||
    normalized.includes('orange')
  ) {
    return SEVERITY_LEVELS.HIGH;
  }

  if (
    normalized.includes('moderate') ||
    normalized.includes('yellow')
  ) {
    return SEVERITY_LEVELS.MODERATE;
  }

  return SEVERITY_LEVELS.LOW;
}

/* =========================================================
   REAL-TIME USER NOTIFICATION
   ========================================================= */

async function notifyMatchedUsers(alert) {
  if (!alert?._id) {
    console.log('⚠️ Cannot notify users: alert ID missing.');
    return;
  }

  /* ---------------------------------------------------------
     Build location matching terms
     --------------------------------------------------------- */

  const matchTerms = [
    alert.location,
    ...(alert.affectedAreas || [])
  ]
    .map((value) =>
      String(value || '')
        .trim()
        .toLowerCase()
    )
    .filter(Boolean);

  if (matchTerms.length === 0) {
    console.log(
      `ℹ️ No location information available for alert ${alert._id}`
    );

    return;
  }

  console.log(
    `📍 Searching users for alert location: ${matchTerms.join(', ')}`
  );

  /* ---------------------------------------------------------
     Get saved locations
     --------------------------------------------------------- */

  const savedLocations = await SavedLocation.find({ notificationsEnabled: true });

  const matchingLocations = savedLocations.filter(
    (location) => {
      const searchable = [
        location.name,
        location.city,
        location.state,
        location.country
      ]
        .map((value) =>
          String(value || '')
            .trim()
            .toLowerCase()
        )
        .filter(Boolean);

      return matchTerms.some((term) =>
        searchable.some(
          (value) =>
            value.includes(term) ||
            term.includes(value)
        )
      );
    }
  );

  console.log(
    `👥 Matching saved locations: ${matchingLocations.length}`
  );

  /* ---------------------------------------------------------
     Prevent duplicate notification for same user
     --------------------------------------------------------- */

  const notifiedUsers = new Set();

  await Promise.all(
    matchingLocations.map(async (location) => {
      if (!location.userId) {
        return;
      }

      const userId = String(location.userId);

      /* -----------------------------------------------------
         If user has multiple matching locations,
         notify only once.
         ----------------------------------------------------- */

      if (notifiedUsers.has(userId)) {
        return;
      }

      notifiedUsers.add(userId);

      /* -----------------------------------------------------
         Check whether this user already received
         notification for this alert.
         ----------------------------------------------------- */

      const existing = await Notification.findOne({
        userId: location.userId,
        relatedAlertId: alert._id
      });

      if (existing) {
        console.log(
          `ℹ️ Notification already exists for user ${userId}`
        );

        return existing;
      }

      /* -----------------------------------------------------
         Create notification in MongoDB
         ----------------------------------------------------- */

      const notification = await Notification.create({
        userId: location.userId,
        type: 'weather_alert',
        title: alert.title,
        message: alert.description,
        relatedAlertId: alert._id,
        isRead: false
      });

      console.log(
        `💾 Notification saved for user ${userId}`
      );

      /* -----------------------------------------------------
         Send REAL-TIME notification through Socket.IO
         ----------------------------------------------------- */

      try {
        const io = getIO();

        io.to(`user_${userId}`).emit(
          'weatherNotification',
          notification
        );

        console.log(
          `🔔 Real-time notification sent to user ${userId}`
        );
      } catch (socketError) {
        /*
         * Do not fail the whole alert process if
         * Socket.IO is temporarily unavailable.
         *
         * Notification is already saved in MongoDB.
         */
        console.error(
          `⚠️ Socket.IO notification failed for user ${userId}:`,
          socketError.message
        );
      }

      return notification;
    })
  );
}

/* =========================================================
   UPSERT OFFICIAL IMD WARNING
   ========================================================= */

async function upsertOfficialWarning(warning) {
  const payload = {
    title: `${warning.warningLevel} alert for ${warning.district}`,

    description:
      `${warning.hazard}. ${warning.advice}`.trim(),

    type: normalizeAlertType(
      warning.hazard
    ),

    severity: normalizeSeverity(
      warning.colorDetails?.severity ||
      warning.warningLevel
    ),

    location: warning.district,

    latitude:
      warning.latitude ?? 20.5937,

    longitude:
      warning.longitude ?? 78.9629,

    startTime:
      new Date(
        warning.validFrom || Date.now()
      ),

    endTime:
      new Date(
        warning.validTo ||
        Date.now() + 24 * 3600 * 1000
      ),

    source:
      warning.source ||
      'India Meteorological Department (IMD)',

    sourceType:
      warning.sourceType ||
      'official',

    externalId:
      warning.externalId ||
      `${warning.source || 'IMD'}:${warning.district}:${warning.warningLevel}`,

    isOfficial:
      !warning.isFallback,

    affectedAreas:
      [
        warning.district,
        warning.state
      ].filter(Boolean),

    rawSourceUrl:
      warning.sourceUrl || null,

    issuedAt:
      warning.validFrom
        ? new Date(warning.validFrom)
        : null,

    metadata: {
      warningLevel:
        warning.warningLevel,

      action:
        warning.action,

      isFallback:
        warning.isFallback
    },

    status:
      new Date(
        warning.validTo ||
        Date.now() + 1
      ) >= new Date()
        ? 'active'
        : 'expired'
  };

  /* ---------------------------------------------------------
     Create or update alert
     --------------------------------------------------------- */

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

  console.log(
    `🚨 Alert synchronized: ${alert.title}`
  );

  /* ---------------------------------------------------------
     Notify matching users
     --------------------------------------------------------- */

  await notifyMatchedUsers(alert);

  return alert;
}

/* =========================================================
   EXPIRE MISSING OFFICIAL ALERTS
   ========================================================= */

async function expireMissingOfficialAlerts(
  activeExternalIds
) {
  await Alert.updateMany(
    {
      source: {
        $regex: /imd/i
      },

      status: 'active',

      externalId: {
        $nin: activeExternalIds
      }
    },
    {
      $set: {
        status: 'expired'
      }
    }
  );
}

/* =========================================================
   SYNC OFFICIAL IMD ALERTS
   ========================================================= */

/**
 * Synchronize official or fallback IMD warnings
 * into the persistent alerts collection.
 */
const syncOfficialAlerts = async (
  options = {}
) => {
  const now = Date.now();

  const force = Boolean(
    options.force
  );

  /* ---------------------------------------------------------
     Prevent excessive IMD requests
     --------------------------------------------------------- */

  if (
    !force &&
    now - lastOfficialSyncAt <
      OFFICIAL_SYNC_TTL_MS
  ) {
    return {
      skipped: true
    };
  }

  console.log(
    '🌦️ Synchronizing IMD official warnings...'
  );

  /* ---------------------------------------------------------
     Get warnings from IMD service
     --------------------------------------------------------- */

  const warnings =
    await imdService.getAllIMDWarnings();

  const activeWarnings =
    warnings.filter(
      (warning) =>
        warning.hasActiveWarning
    );

  const externalIds = [];

  /* ---------------------------------------------------------
     Process each active warning
     --------------------------------------------------------- */

  for (
    const warning of activeWarnings
  ) {
    const alert =
      await upsertOfficialWarning(
        warning
      );

    if (alert.externalId) {
      externalIds.push(
        alert.externalId
      );
    }
  }

  /* ---------------------------------------------------------
     Expire alerts that no longer exist
     --------------------------------------------------------- */

  await expireMissingOfficialAlerts(
    externalIds
  );

  lastOfficialSyncAt = now;

  console.log(
    `✅ IMD sync completed. ${activeWarnings.length} active warnings.`
  );

  return {
    skipped: false,
    syncedCount:
      activeWarnings.length
  };
};

/* =========================================================
   GET ALL ALERTS
   ========================================================= */

const getAlerts = async () => {
  return await Alert.find()
    .sort({
      createdAt: -1
    });
};

/* =========================================================
   GET ALERT BY ID
   ========================================================= */

const getAlert = async (
  alertId
) => {
  const alert =
    await Alert.findById(
      alertId
    );

  if (!alert) {
    const error =
      new Error(
        'Alert not found'
      );

    error.statusCode = 404;

    throw error;
  }

  return alert;
};

/* =========================================================
   GET ACTIVE ALERTS
   ========================================================= */

const getActiveAlerts = async () => {
  const now = new Date();

  return await Alert.find({
    status: 'active',

    startTime: {
      $lte: now
    },

    endTime: {
      $gte: now
    }
  }).sort({
    severity: -1,
    startTime: 1
  });
};

/* =========================================================
   CREATE ALERT
   ========================================================= */

const createAlert = async (
  alertData
) => {
  const alert =
    await Alert.create(
      alertData
    );

  /*
   * Also notify users when an alert is
   * manually/programmatically created.
   */
  await notifyMatchedUsers(
    alert
  );

  return alert;
};

/* =========================================================
   UPDATE ALERT STATUS
   ========================================================= */

const updateAlertStatus = async (
  alertId,
  status
) => {
  return await Alert.findByIdAndUpdate(
    alertId,
    {
      status
    },
    {
      returnDocument: 'after',
      runValidators: true
    }
  );
};

/* =========================================================
   LOCATION MATCHING LOGIC
   ========================================================= */

async function matchAlertsToLocations(locations) {
  if (!locations || locations.length === 0) return [];

  const matchTerms = [];
  locations.forEach(loc => {
    if (loc.city) matchTerms.push(loc.city.toLowerCase());
    if (loc.state) matchTerms.push(loc.state.toLowerCase());
    if (loc.name) matchTerms.push(loc.name.toLowerCase());
  });

  const activeAlerts = await Alert.find({
    status: 'active',
    endTime: { $gte: new Date() }
  });

  return activeAlerts.filter(alert => {
    const alertLocation = (alert.location || '').toLowerCase();
    const alertAreas = (alert.affectedAreas || []).map(a => a.toLowerCase());

    return matchTerms.some(term =>
      alertLocation.includes(term) ||
      alertAreas.some(area => area.includes(term))
    );
  });
}

const getAlertsForUser = async (userId) => {
  const locations = await SavedLocation.find({ userId });
  return await matchAlertsToLocations(locations);
};

/* =========================================================
   EXPORTS
   ========================================================= */

export {
  getAlerts,
  getAlert,
  getActiveAlerts,
  createAlert,
  updateAlertStatus,
  syncOfficialAlerts,
  getAlertsForUser
};

export default {
  getAlerts,
  getAlert,
  getActiveAlerts,
  createAlert,
  updateAlertStatus,
  syncOfficialAlerts,
  getAlertsForUser
};