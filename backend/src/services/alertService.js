import Alert from '../models/Alert.js'
import User from '../models/User.js'
import { getIO } from '../config/socket.js'
import Notification from '../models/Notification.js'
import SavedLocation from '../models/SavedLocation.js'
import imdService from './weather/imd/imdService.js'
import emailService from './emailService.js'
import { SEVERITY_LEVELS } from '../config/constants.js'

let lastOfficialSyncAt = 0

const OFFICIAL_SYNC_TTL_MS = 10 * 60 * 1000

/* =========================================================
   ALERT TYPE NORMALIZATION
   ========================================================= */

function normalizeAlertType (hazard = '') {
  const text = String(hazard).toLowerCase()

  if (text.includes('thunder') || text.includes('lightning')) {
    return 'lightning'
  }

  if (text.includes('cyclone') || text.includes('storm')) {
    return 'cyclone'
  }

  if (text.includes('flood')) {
    return 'flood'
  }

  if (text.includes('heat')) {
    return 'heatwave'
  }

  if (text.includes('cold')) {
    return 'coldwave'
  }

  if (text.includes('wind') || text.includes('squall')) {
    return 'strong_wind'
  }

  if (text.includes('fog')) {
    return 'fog'
  }

  if (text.includes('drought')) {
    return 'drought'
  }

  if (text.includes('rain') || text.includes('shower')) {
    return 'rain'
  }

  return 'other'
}

/* =========================================================
   SEVERITY NORMALIZATION
   ========================================================= */

function normalizeSeverity (level = 'low') {
  const normalized = String(level).toLowerCase()

  if (Object.values(SEVERITY_LEVELS).includes(normalized)) {
    return normalized
  }

  if (normalized.includes('extreme') || normalized.includes('red')) {
    return SEVERITY_LEVELS.EXTREME
  }

  if (normalized.includes('high') || normalized.includes('orange')) {
    return SEVERITY_LEVELS.HIGH
  }

  if (normalized.includes('moderate') || normalized.includes('yellow')) {
    return SEVERITY_LEVELS.MODERATE
  }

  return SEVERITY_LEVELS.LOW
}

/* =========================================================
   REAL-TIME USER NOTIFICATION
   ========================================================= */

async function notifyMatchedUsers (alert) {
  if (!alert?._id) {
    console.log('⚠️ Cannot notify users: alert ID missing.')
    return
  }

  /* ---------------------------------------------------------
     Build location matching terms
     --------------------------------------------------------- */

  const matchTerms = [alert.location, ...(alert.affectedAreas || [])]
    .map(value =>
      String(value || '')
        .trim()
        .toLowerCase()
    )
    .filter(Boolean)

  if (matchTerms.length === 0) {
    console.log(`ℹ️ No location information available for alert ${alert._id}`)

    return
  }

  console.log(`📍 Searching users for alert location: ${matchTerms.join(', ')}`)

  /* ---------------------------------------------------------
     Get saved locations
     --------------------------------------------------------- */

  const savedLocations = await SavedLocation.find({
    notificationsEnabled: true
  })

  const matchingLocations = savedLocations.filter(location => {
    const searchable = [
      location.name,
      location.city,
      location.state,
      location.country
    ]
      .map(value =>
        String(value || '')
          .trim()
          .toLowerCase()
      )
      .filter(Boolean)

    return matchTerms.some(term =>
      searchable.some(value => value.includes(term) || term.includes(value))
    )
  })

  console.log(`👥 Matching saved locations: ${matchingLocations.length}`)

  /* ---------------------------------------------------------
     Prevent duplicate notification for same user
     --------------------------------------------------------- */

  const uniqueUsersMap = new Map()
  for (const location of matchingLocations) {
    if (location.userId && !uniqueUsersMap.has(String(location.userId))) {
      uniqueUsersMap.set(String(location.userId), location.userId)
    }
  }

  const userIdsToNotify = Array.from(uniqueUsersMap.values())
  console.log(`👥 Unique users to notify: ${userIdsToNotify.length}`)

  await Promise.all(
    userIdsToNotify.map(async userIdObj => {
      const userId = String(userIdObj)

      /* -----------------------------------------------------
         Check whether this user already received
         notification for this alert.
         ----------------------------------------------------- */

      const existing = await Notification.findOne({
        userId: userIdObj,
        relatedAlertId: alert._id
      })

      if (existing) {
        console.log(`ℹ️ Notification already exists for user ${userId}`)
        return existing
      }

      /* -----------------------------------------------------
         Create notification in MongoDB
         ----------------------------------------------------- */

      const notification = await Notification.create({
        userId: userIdObj,
        type: 'weather_alert',
        title: alert.title,
        message: alert.description,
        relatedAlertId: alert._id,
        isRead: false
      })

      console.log(`💾 Notification saved for user ${userId}`)

      /* -----------------------------------------------------
         Send REAL-TIME notification through Socket.IO
         ----------------------------------------------------- */

      try {
        const io = getIO()

        io.to(`user_${userId}`).emit('weatherNotification', notification)

        console.log(`🔔 Real-time notification sent to user ${userId}`)
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
        )
      }

      /* -----------------------------------------------------
         Send Severe Weather Email Alert for High/Extreme alerts
         ----------------------------------------------------- */
      const normSev = normalizeSeverity(alert.severity)
      if (normSev === SEVERITY_LEVELS.EXTREME || normSev === SEVERITY_LEVELS.HIGH) {
        User.findById(userIdObj)
          .select('name email')
          .then(targetUser => {
            if (targetUser && targetUser.email) {
              emailService.sendSevereWeatherEmailAlert({
                toEmail: targetUser.email,
                userName: targetUser.name,
                alert: {
                  title: alert.title,
                  description: alert.description,
                  location: alert.location,
                  severity: normSev,
                  type: alert.type
                }
              }).catch(emailErr => {
                console.warn(`⚠️ [AlertService] Email alert failed for ${targetUser.email}:`, emailErr.message)
              })
            }
          })
          .catch(() => {})
      }

      return notification
    })
  )
}

/* =========================================================
   UPSERT OFFICIAL IMD WARNING
   ========================================================= */

async function upsertOfficialWarning (warning) {
  const payload = {
    title: `${warning.warningLevel} alert for ${warning.district}`,

    description: `${warning.hazard}. ${warning.advice}`.trim(),

    type: normalizeAlertType(warning.hazard),

    severity: normalizeSeverity(
      warning.colorDetails?.severity || warning.warningLevel
    ),

    location: warning.district,

    latitude: warning.latitude ?? 20.5937,

    longitude: warning.longitude ?? 78.9629,

    startTime: new Date(warning.validFrom || Date.now()),

    endTime: new Date(warning.validTo || Date.now() + 24 * 3600 * 1000),

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
  }

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
  )

  console.log(`🚨 Alert synchronized: ${alert.title}`)

  /* ---------------------------------------------------------
     Notify matching users
     --------------------------------------------------------- */

  await notifyMatchedUsers(alert)

  return alert
}

/* =========================================================
   EXPIRE MISSING OFFICIAL ALERTS
   ========================================================= */

async function expireMissingOfficialAlerts (activeExternalIds) {
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
  )
}

/* =========================================================
   SYNC OFFICIAL IMD ALERTS
   ========================================================= */

/**
 * Synchronize official or fallback IMD warnings
 * into the persistent alerts collection.
 */
const syncOfficialAlerts = async (options = {}) => {
  const now = Date.now()

  const force = Boolean(options.force)

  /* ---------------------------------------------------------
     Prevent excessive IMD requests
     --------------------------------------------------------- */

  if (!force && now - lastOfficialSyncAt < OFFICIAL_SYNC_TTL_MS) {
    return {
      skipped: true
    }
  }

  console.log('🌦️ Synchronizing IMD official warnings...')

  /* ---------------------------------------------------------
     Get warnings from IMD service
     --------------------------------------------------------- */

  const warnings = await imdService.getAllIMDWarnings()

  const activeWarnings = warnings.filter(warning => warning.hasActiveWarning)

  const externalIds = []

  /* ---------------------------------------------------------
     Process each active warning
     --------------------------------------------------------- */

  for (const warning of activeWarnings) {
    const alert = await upsertOfficialWarning(warning)

    if (alert.externalId) {
      externalIds.push(alert.externalId)
    }
  }

  /* ---------------------------------------------------------
     Expire alerts that no longer exist
     --------------------------------------------------------- */

  await expireMissingOfficialAlerts(externalIds)

  lastOfficialSyncAt = now

  console.log(
    `✅ IMD sync completed. ${activeWarnings.length} active warnings.`
  )

  return {
    skipped: false,
    syncedCount: activeWarnings.length
  }
}

/* =========================================================
   GET ALL ALERTS
   ========================================================= */

const getAlerts = async () => {
  return await Alert.find().sort({
    createdAt: -1
  })
}

/* =========================================================
   GET ALERT BY ID
   ========================================================= */

const getAlert = async alertId => {
  const alert = await Alert.findById(alertId)

  if (!alert) {
    const error = new Error('Alert not found')

    error.statusCode = 404

    throw error
  }

  return alert
}

/* =========================================================
   GET ACTIVE ALERTS
   ========================================================= */

const getActiveAlerts = async () => {
  const now = new Date()

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
  })
}

/* =========================================================
   CREATE ALERT
   ========================================================= */

const createAlert = async alertData => {
  const alert = await Alert.create(alertData)

  /*
   * Also notify users when an alert is
   * manually/programmatically created.
   */
  await notifyMatchedUsers(alert)

  return alert
}

/* =========================================================
   UPDATE ALERT STATUS
   ========================================================= */

const updateAlertStatus = async (alertId, status) => {
  return await Alert.findByIdAndUpdate(
    alertId,
    {
      status
    },
    {
      returnDocument: 'after',
      runValidators: true
    }
  )
}

/* =========================================================
   LOCATION MATCHING LOGIC
   ========================================================= */

async function matchAlertsToLocations (locations) {
  if (!locations || locations.length === 0) return []

  const matchTerms = []
  locations.forEach(loc => {
    if (loc.city) matchTerms.push(loc.city.toLowerCase())
    if (loc.state) matchTerms.push(loc.state.toLowerCase())
    if (loc.name) matchTerms.push(loc.name.toLowerCase())
  })

  const activeAlerts = await Alert.find({
    status: 'active',
    endTime: { $gte: new Date() }
  })

  return activeAlerts.filter(alert => {
    const alertLocation = (alert.location || '').toLowerCase()
    const alertAreas = (alert.affectedAreas || []).map(a => a.toLowerCase())

    return matchTerms.some(
      term =>
        alertLocation.includes(term) ||
        alertAreas.some(area => area.includes(term))
    )
  })
}

const getAlertsForUser = async userId => {
  const locations = await SavedLocation.find({ userId })
  return await matchAlertsToLocations(locations)
}

/* =========================================================
   AUTHORITY ALERT LIFECYCLE & OPERATIONS
   ========================================================= */

/**
 * Create a new authority alert.
 * RULE: ALWAYS creates with status = 'draft'.
 * Never triggers notifyMatchedUsers().
 */
const createAuthorityAlert = async (alertData, user) => {
  if (!user || user.role !== 'authority') {
    const error = new Error('Forbidden: Authority role required')
    error.statusCode = 403
    throw error
  }

  const {
    title,
    description,
    type,
    severity,
    location,
    affectedAreas,
    latitude,
    longitude,
    startTime,
    endTime,
    action,
    probability,
    metadata
  } = alertData

  if (!title || !String(title).trim()) {
    const error = new Error('Alert title is required')
    error.statusCode = 400
    throw error
  }

  if (!description || !String(description).trim()) {
    const error = new Error('Alert description is required')
    error.statusCode = 400
    throw error
  }

  if (!location || !String(location).trim()) {
    const error = new Error('Alert location is required')
    error.statusCode = 400
    throw error
  }

  const normalizedType = normalizeAlertType(type || 'other')
  const normalizedSeverity = normalizeSeverity(severity || 'moderate')

  const start = startTime ? new Date(startTime) : new Date()
  if (isNaN(start.getTime())) {
    const error = new Error('Invalid startTime date format')
    error.statusCode = 400
    throw error
  }

  let end
  if (endTime) {
    end = new Date(endTime)
    if (isNaN(end.getTime())) {
      const error = new Error('Invalid endTime date format')
      error.statusCode = 400
      throw error
    }
  } else {
    end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  }

  if (end <= start) {
    const error = new Error('Alert endTime must be strictly after startTime')
    error.statusCode = 400
    throw error
  }

  let areas = []
  if (Array.isArray(affectedAreas)) {
    areas = affectedAreas.map(a => String(a).trim()).filter(Boolean)
  } else if (typeof affectedAreas === 'string') {
    areas = affectedAreas
      .split(',')
      .map(a => a.trim())
      .filter(Boolean)
  }
  if (!areas.includes(location.trim())) {
    areas.unshift(location.trim())
  }

  const lat =
    latitude !== undefined && !isNaN(Number(latitude))
      ? Number(latitude)
      : 20.5937
  const lng =
    longitude !== undefined && !isNaN(Number(longitude))
      ? Number(longitude)
      : 78.9629

  // STRICT: Always created as 'draft'
  const alert = await Alert.create({
    title: String(title).trim(),
    description: String(description).trim(),
    type: normalizedType,
    severity: normalizedSeverity,
    location: String(location).trim(),
    affectedAreas: areas,
    latitude: lat,
    longitude: lng,
    startTime: start,
    endTime: end,
    action: action
      ? String(action).trim()
      : 'Follow official emergency guidelines and remain alert.',
    probability: probability ? String(probability).trim() : 'High',
    source: 'AUTHORITY',
    sourceType: 'authority',
    isOfficial: true,
    status: 'draft',
    createdBy: user._id,
    issuedAt: start,
    metadata: metadata || {}
  })

  console.log(`📝 Authority draft alert created: ${alert._id} (${alert.title})`)
  return alert
}

/**
 * Publish a draft authority alert.
 * Transitions: draft -> active.
 * Idempotent: Rejects if already active, cancelled, or expired.
 * Triggers notifyMatchedUsers() ONLY upon this transition.
 */
const publishAuthorityAlert = async (alertId, user) => {
  if (!user || user.role !== 'authority') {
    const error = new Error('Forbidden: Authority role required')
    error.statusCode = 403
    throw error
  }

  const alert = await Alert.findById(alertId)
  if (!alert) {
    const error = new Error('Alert not found')
    error.statusCode = 404
    throw error
  }

  if (alert.status === 'active') {
    const error = new Error('Alert is already published and active')
    error.statusCode = 400
    throw error
  }

  if (alert.status === 'cancelled') {
    const error = new Error('Cannot publish a cancelled alert')
    error.statusCode = 400
    throw error
  }

  if (alert.status === 'expired' || new Date(alert.endTime) <= new Date()) {
    const error = new Error('Cannot publish an expired alert')
    error.statusCode = 400
    throw error
  }

  alert.status = 'active'
  alert.publishedAt = new Date()
  alert.publishedBy = user._id

  if (!alert.issuedAt) {
    alert.issuedAt = new Date()
  }

  await alert.save()
  console.log(`📢 Authority alert published: ${alert._id} (${alert.title})`)

  // Trigger targeted notification delivery
  try {
    await notifyMatchedUsers(alert)
  } catch (notifyErr) {
    console.error(
      `⚠️ Notification delivery failure for alert ${alert._id}:`,
      notifyErr.message
    )
  }

  return alert
}

/**
 * Cancel an authority alert.
 * Transitions to: cancelled.
 * Preserves record in DB with cancelledAt and cancelledBy audit details.
 * Never deletes the record.
 */
const cancelAuthorityAlert = async (alertId, user) => {
  if (!user || user.role !== 'authority') {
    const error = new Error('Forbidden: Authority role required')
    error.statusCode = 403
    throw error
  }

  const alert = await Alert.findById(alertId)
  if (!alert) {
    const error = new Error('Alert not found')
    error.statusCode = 404
    throw error
  }

  if (alert.status === 'cancelled') {
    const error = new Error('Alert is already cancelled')
    error.statusCode = 400
    throw error
  }

  alert.status = 'cancelled'
  alert.cancelledAt = new Date()
  alert.cancelledBy = user._id

  await alert.save()
  console.log(`🛑 Authority alert cancelled: ${alert._id} (${alert.title})`)

  return alert
}

/**
 * Update an authority alert.
 * Drafts: Full editing permitted.
 * Active: Restricted updates only (action/description).
 * Cancelled/Expired: Rejected.
 * Never triggers notification delivery.
 */
const updateAuthorityAlert = async (alertId, updateData, user) => {
  if (!user || user.role !== 'authority') {
    const error = new Error('Forbidden: Authority role required')
    error.statusCode = 403
    throw error
  }

  const alert = await Alert.findById(alertId)
  if (!alert) {
    const error = new Error('Alert not found')
    error.statusCode = 404
    throw error
  }

  if (alert.status === 'cancelled' || alert.status === 'expired') {
    const error = new Error(
      `Cannot edit an alert with status '${alert.status}'`
    )
    error.statusCode = 400
    throw error
  }

  if (alert.status === 'active') {
    if (updateData.action !== undefined)
      alert.action = String(updateData.action).trim()
    if (updateData.description !== undefined)
      alert.description = String(updateData.description).trim()
    await alert.save()
    return alert
  }

  // Draft updates
  const {
    title,
    description,
    type,
    severity,
    location,
    affectedAreas,
    latitude,
    longitude,
    startTime,
    endTime,
    action,
    probability
  } = updateData

  if (title !== undefined) alert.title = String(title).trim()
  if (description !== undefined) alert.description = String(description).trim()
  if (type !== undefined) alert.type = normalizeAlertType(type)
  if (severity !== undefined) alert.severity = normalizeSeverity(severity)
  if (location !== undefined) alert.location = String(location).trim()
  if (action !== undefined) alert.action = String(action).trim()
  if (probability !== undefined) alert.probability = String(probability).trim()
  if (latitude !== undefined && !isNaN(Number(latitude)))
    alert.latitude = Number(latitude)
  if (longitude !== undefined && !isNaN(Number(longitude)))
    alert.longitude = Number(longitude)
  if (startTime !== undefined) alert.startTime = new Date(startTime)
  if (endTime !== undefined) alert.endTime = new Date(endTime)

  if (affectedAreas !== undefined) {
    let areas = []
    if (Array.isArray(affectedAreas)) {
      areas = affectedAreas.map(a => String(a).trim()).filter(Boolean)
    } else if (typeof affectedAreas === 'string') {
      areas = affectedAreas
        .split(',')
        .map(a => a.trim())
        .filter(Boolean)
    }
    alert.affectedAreas = areas
  }

  if (alert.endTime <= alert.startTime) {
    const error = new Error('Alert endTime must be strictly after startTime')
    error.statusCode = 400
    throw error
  }

  await alert.save()
  return alert
}

/**
 * Retrieve authority alerts list with audit population and status filtering.
 */
const getAuthorityAlerts = async (filters = {}) => {
  const query = { sourceType: 'authority' }

  if (filters.status && filters.status !== 'all') {
    query.status = filters.status
  }

  return await Alert.find(query)
    .populate('createdBy', 'name email role')
    .populate('publishedBy', 'name email role')
    .populate('cancelledBy', 'name email role')
    .sort({ createdAt: -1 })
}

/**
 * Retrieve single authority alert with audit details.
 */
const getAuthorityAlertById = async alertId => {
  const alert = await Alert.findById(alertId)
    .populate('createdBy', 'name email role')
    .populate('publishedBy', 'name email role')
    .populate('cancelledBy', 'name email role')

  if (!alert) {
    const error = new Error('Alert not found')
    error.statusCode = 404
    throw error
  }

  return alert
}

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
  getAlertsForUser,
  createAuthorityAlert,
  publishAuthorityAlert,
  cancelAuthorityAlert,
  updateAuthorityAlert,
  getAuthorityAlerts,
  getAuthorityAlertById
}

export default {
  getAlerts,
  getAlert,
  getActiveAlerts,
  createAlert,
  updateAlertStatus,
  syncOfficialAlerts,
  getAlertsForUser,
  createAuthorityAlert,
  publishAuthorityAlert,
  cancelAuthorityAlert,
  updateAuthorityAlert,
  getAuthorityAlerts,
  getAuthorityAlertById
}
