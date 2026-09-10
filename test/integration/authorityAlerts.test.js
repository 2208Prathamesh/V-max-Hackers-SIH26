import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer, stopTestServer } from '../helpers/testServer.js'
import User from '../../backend/src/models/User.js'
import Alert from '../../backend/src/models/Alert.js'
import SavedLocation from '../../backend/src/models/SavedLocation.js'
import Notification from '../../backend/src/models/Notification.js'
import generateToken from '../../backend/src/utils/generateToken.js'

describe('Integration: Authority Alerts Lifecycle & Public Notification Delivery', () => {
  let baseUrl = ''
  let authorityUser = null
  let authorityToken = ''
  let regularUser1 = null // Matched location, notifications enabled
  let regularUser2 = null // Unmatched location
  let regularUser3 = null // Matched location, notifications disabled
  let regularUser4 = null // Matched multiple locations (deduplication test)
  let regularToken = ''

  const createdAlertIds = []

  before(async () => {
    const res = await startTestServer()
    baseUrl = res.serverUrl

    const timestamp = Date.now()

    // 1. Create Authority User
    authorityUser = await User.create({
      name: 'State Disaster Authority',
      email: `authority_${timestamp}@weathergpt.com`,
      passwordHash: 'AuthorityPassword123!',
      role: 'authority'
    })
    authorityToken = generateToken(authorityUser._id)

    // 2. Create Regular User 1 (Pune, notifications enabled)
    regularUser1 = await User.create({
      name: 'Pune Citizen 1',
      email: `citizen1_${timestamp}@example.com`,
      passwordHash: 'CitizenPassword123!',
      role: 'user'
    })
    regularToken = generateToken(regularUser1._id)

    await SavedLocation.create({
      userId: regularUser1._id,
      name: 'Home',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      latitude: 18.5204,
      longitude: 73.8567,
      notificationsEnabled: true
    })

    // 3. Create Regular User 2 (Mumbai, notifications enabled)
    regularUser2 = await User.create({
      name: 'Mumbai Citizen',
      email: `citizen2_${timestamp}@example.com`,
      passwordHash: 'CitizenPassword123!',
      role: 'user'
    })

    await SavedLocation.create({
      userId: regularUser2._id,
      name: 'Office',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      latitude: 19.076,
      longitude: 72.8777,
      notificationsEnabled: true
    })

    // 4. Create Regular User 3 (Pune, notifications disabled)
    regularUser3 = await User.create({
      name: 'Pune Citizen Opted Out',
      email: `citizen3_${timestamp}@example.com`,
      passwordHash: 'CitizenPassword123!',
      role: 'user'
    })

    await SavedLocation.create({
      userId: regularUser3._id,
      name: 'Pune Flat',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      latitude: 18.5204,
      longitude: 73.8567,
      notificationsEnabled: false
    })

    // 5. Create Regular User 4 (Pune, multiple saved locations in Pune)
    regularUser4 = await User.create({
      name: 'Pune Citizen Multi Location',
      email: `citizen4_${timestamp}@example.com`,
      passwordHash: 'CitizenPassword123!',
      role: 'user'
    })

    await SavedLocation.create({
      userId: regularUser4._id,
      name: 'Pune Home',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      latitude: 18.5204,
      longitude: 73.8567,
      notificationsEnabled: true
    })

    await SavedLocation.create({
      userId: regularUser4._id,
      name: 'Pune Office',
      city: 'Pune District',
      state: 'Maharashtra',
      country: 'India',
      latitude: 18.53,
      longitude: 73.86,
      notificationsEnabled: true
    })
  })

  after(async () => {
    // Cleanup alerts
    if (createdAlertIds.length > 0) {
      await Alert.deleteMany({ _id: { $in: createdAlertIds } })
    }
    // Cleanup users
    const userIds = [
      authorityUser?._id,
      regularUser1?._id,
      regularUser2?._id,
      regularUser3?._id,
      regularUser4?._id
    ].filter(Boolean)
    await User.deleteMany({ _id: { $in: userIds } })
    await SavedLocation.deleteMany({ userId: { $in: userIds } })
    await Notification.deleteMany({ userId: { $in: userIds } })

    await stopTestServer()
  })

  /* =========================================================================
     1. Authentication & Role Authorization
     ========================================================================= */
  test('POST /api/authority/alerts should reject unauthenticated requests (401)', async () => {
    const res = await fetch(`${baseUrl}/api/authority/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Unauthorized Alert',
        description: 'Should not be allowed',
        location: 'Pune District'
      })
    })

    assert.equal(res.status, 401)
  })

  test('POST /api/authority/alerts should reject non-authority users (403)', async () => {
    const res = await fetch(`${baseUrl}/api/authority/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${regularToken}`
      },
      body: JSON.stringify({
        title: 'Forbidden Alert',
        description: 'Regular user should not create authority alert',
        location: 'Pune District'
      })
    })

    assert.equal(res.status, 403)
  })

  /* =========================================================================
     2. Strict Alert Creation (Draft Lifecycle & Isolation)
     ========================================================================= */
  let testDraftAlertId = null

  test('POST /api/authority/alerts should create alert strictly as draft and NEVER trigger notifications', async () => {
    const alertData = {
      title: 'Flash Flood Warning - Pune',
      description:
        'Extremely heavy localized showers expected. Keep emergency kits ready.',
      type: 'flood',
      severity: 'extreme',
      location: 'Pune District',
      affectedAreas: ['Pune', 'Pune District'],
      latitude: 18.5204,
      longitude: 73.8567,
      action: 'Avoid riverbanks and low-lying roadways.',
      status: 'active' // ATTENTION: Client attempts to pass active; server MUST force draft
    }

    const res = await fetch(`${baseUrl}/api/authority/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authorityToken}`
      },
      body: JSON.stringify(alertData)
    })

    const payload = await res.json()
    assert.equal(res.status, 201)
    assert.equal(payload.success, true)
    assert.ok(payload.data._id)

    testDraftAlertId = payload.data._id
    createdAlertIds.push(testDraftAlertId)

    // Verify properties
    assert.equal(
      payload.data.status,
      'draft',
      'Alert status MUST be draft upon creation'
    )
    assert.equal(payload.data.source, 'AUTHORITY')
    assert.equal(payload.data.sourceType, 'authority')
    assert.equal(payload.data.isOfficial, true)
    assert.equal(String(payload.data.createdBy), String(authorityUser._id))

    // Verify 0 notifications were created
    const notificationsCount = await Notification.countDocuments({
      relatedAlertId: testDraftAlertId
    })
    assert.equal(
      notificationsCount,
      0,
      'Draft alert creation must never trigger notifications'
    )
  })

  test('Draft alert must NOT appear in public active alerts (/api/alerts/active)', async () => {
    const res = await fetch(`${baseUrl}/api/alerts/active`)
    const payload = await res.json()

    assert.equal(res.status, 200)
    const found = payload.data.some(
      a => String(a._id) === String(testDraftAlertId)
    )
    assert.equal(
      found,
      false,
      'Draft alerts must not leak to public active feed'
    )
  })

  test('Validation: Missing required fields or invalid times must return 400', async () => {
    // Missing description
    const resMissing = await fetch(`${baseUrl}/api/authority/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authorityToken}`
      },
      body: JSON.stringify({
        title: 'Incomplete Alert',
        location: 'Pune'
      })
    })
    assert.equal(resMissing.status, 400)

    // Invalid time: endTime before startTime
    const resBadTime = await fetch(`${baseUrl}/api/authority/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authorityToken}`
      },
      body: JSON.stringify({
        title: 'Bad Time Alert',
        description: 'Test timing',
        location: 'Pune',
        startTime: new Date(Date.now() + 100000).toISOString(),
        endTime: new Date(Date.now() - 100000).toISOString()
      })
    })
    assert.equal(resBadTime.status, 400)
  })

  /* =========================================================================
     3. Draft Editing Rules
     ========================================================================= */
  test('PUT /api/authority/alerts/:id should allow full updates on draft without notifying', async () => {
    const res = await fetch(
      `${baseUrl}/api/authority/alerts/${testDraftAlertId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authorityToken}`
        },
        body: JSON.stringify({
          title: 'Updated Flash Flood Warning - Pune District',
          description: 'Updated instructions for Pune citizens.',
          severity: 'high'
        })
      }
    )

    const payload = await res.json()
    assert.equal(res.status, 200)
    assert.equal(
      payload.data.title,
      'Updated Flash Flood Warning - Pune District'
    )
    assert.equal(payload.data.severity, 'high')

    // Still 0 notifications
    const notificationsCount = await Notification.countDocuments({
      relatedAlertId: testDraftAlertId
    })
    assert.equal(notificationsCount, 0)
  })

  /* =========================================================================
     4. Publishing, Targeted Notifications, & Deduplication
     ========================================================================= */
  test('POST /api/authority/alerts/:id/publish transitions draft to active and delivers deduplicated notifications', async () => {
    const res = await fetch(
      `${baseUrl}/api/authority/alerts/${testDraftAlertId}/publish`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authorityToken}`
        }
      }
    )

    const payload = await res.json()
    assert.equal(res.status, 200)
    assert.equal(payload.success, true)
    assert.equal(payload.data.status, 'active')
    assert.ok(payload.data.publishedAt)
    assert.equal(String(payload.data.publishedBy), String(authorityUser._id))

    // Check public active alerts now includes it
    const publicRes = await fetch(`${baseUrl}/api/alerts/active`)
    const publicPayload = await publicRes.json()
    const foundInPublic = publicPayload.data.some(
      a => String(a._id) === String(testDraftAlertId)
    )
    assert.equal(
      foundInPublic,
      true,
      'Published alert must now appear in /api/alerts/active'
    )

    // Give notification async delivery a tick
    await new Promise(resolve => setTimeout(resolve, 500))

    // Verify User 1 (Pune, enabled) received EXACTLY 1 notification
    const user1Notes = await Notification.find({
      userId: regularUser1._id,
      relatedAlertId: testDraftAlertId
    })
    assert.equal(
      user1Notes.length,
      1,
      'Matching Pune citizen must receive exactly 1 notification'
    )

    // Verify User 2 (Mumbai, enabled) received 0 notifications (location does not match)
    const user2Notes = await Notification.find({
      userId: regularUser2._id,
      relatedAlertId: testDraftAlertId
    })
    assert.equal(
      user2Notes.length,
      0,
      'Mumbai citizen must not receive Pune alert notification'
    )

    // Verify User 3 (Pune, disabled) received 0 notifications (notifications opt-out)
    const user3Notes = await Notification.find({
      userId: regularUser3._id,
      relatedAlertId: testDraftAlertId
    })
    assert.equal(
      user3Notes.length,
      0,
      'Citizen with notifications disabled must not receive notification'
    )

    // Verify User 4 (Pune, 2 saved locations in Pune) received EXACTLY 1 notification (deduplicated)
    const user4Notes = await Notification.find({
      userId: regularUser4._id,
      relatedAlertId: testDraftAlertId
    })
    assert.equal(
      user4Notes.length,
      1,
      'Citizen with multiple saved Pune locations must receive exactly 1 notification'
    )
  })

  /* =========================================================================
     5. Publish Idempotency
     ========================================================================= */
  test('POST /api/authority/alerts/:id/publish on already active alert must reject (400) and NOT duplicate notifications', async () => {
    const res = await fetch(
      `${baseUrl}/api/authority/alerts/${testDraftAlertId}/publish`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authorityToken}`
        }
      }
    )

    assert.equal(res.status, 400)

    // Verify notification count did not double
    const user1Notes = await Notification.find({
      userId: regularUser1._id,
      relatedAlertId: testDraftAlertId
    })
    assert.equal(
      user1Notes.length,
      1,
      'Notifications must remain strictly deduplicated'
    )
  })

  /* =========================================================================
     6. Active Alert Editing Restrictions
     ========================================================================= */
  test('PUT /api/authority/alerts/:id on active alert allows restricted updates (action/description) and never re-notifies', async () => {
    const res = await fetch(
      `${baseUrl}/api/authority/alerts/${testDraftAlertId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authorityToken}`
        },
        body: JSON.stringify({
          title: 'Illegal Title Change On Active Alert',
          description: 'Updated instructions for emergency shelters.',
          action: 'Shelter in designated safe halls immediately.'
        })
      }
    )

    const payload = await res.json()
    assert.equal(res.status, 200)
    // Description and action are updated
    assert.equal(
      payload.data.description,
      'Updated instructions for emergency shelters.'
    )
    assert.equal(
      payload.data.action,
      'Shelter in designated safe halls immediately.'
    )
    // Title is NOT modified on active alerts
    assert.notEqual(payload.data.title, 'Illegal Title Change On Active Alert')

    // No duplicate notifications triggered
    const user1Notes = await Notification.find({
      userId: regularUser1._id,
      relatedAlertId: testDraftAlertId
    })
    assert.equal(user1Notes.length, 1)
  })

  /* =========================================================================
     7. Alert Cancellation & Active Feed Eviction
     ========================================================================= */
  test('POST /api/authority/alerts/:id/cancel cancels alert, preserves DB record, and removes from active feed', async () => {
    const res = await fetch(
      `${baseUrl}/api/authority/alerts/${testDraftAlertId}/cancel`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authorityToken}`
        }
      }
    )

    const payload = await res.json()
    assert.equal(res.status, 200)
    assert.equal(payload.data.status, 'cancelled')
    assert.ok(payload.data.cancelledAt)
    assert.equal(String(payload.data.cancelledBy), String(authorityUser._id))

    // Verify removed from public active feed
    const publicRes = await fetch(`${baseUrl}/api/alerts/active`)
    const publicPayload = await publicRes.json()
    const foundInPublic = publicPayload.data.some(
      a => String(a._id) === String(testDraftAlertId)
    )
    assert.equal(
      foundInPublic,
      false,
      'Cancelled alert must immediately disappear from public active feed'
    )

    // Verify record still exists in DB
    const dbAlert = await Alert.findById(testDraftAlertId)
    assert.ok(dbAlert, 'Alert must not be hard-deleted from DB')
    assert.equal(dbAlert.status, 'cancelled')
  })

  test('Cannot publish or edit a cancelled alert (400)', async () => {
    // Attempt publish on cancelled
    const publishRes = await fetch(
      `${baseUrl}/api/authority/alerts/${testDraftAlertId}/publish`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${authorityToken}` }
      }
    )
    assert.equal(publishRes.status, 400)

    // Attempt edit on cancelled
    const editRes = await fetch(
      `${baseUrl}/api/authority/alerts/${testDraftAlertId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authorityToken}`
        },
        body: JSON.stringify({ description: 'New description' })
      }
    )
    assert.equal(editRes.status, 400)

    // Attempt cancel on already cancelled
    const cancelRes = await fetch(
      `${baseUrl}/api/authority/alerts/${testDraftAlertId}/cancel`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${authorityToken}` }
      }
    )
    assert.equal(cancelRes.status, 400)
  })

  /* =========================================================================
     8. Authority Listing & Status Filtering
     ========================================================================= */
  test('GET /api/authority/alerts returns authority alerts and filters correctly', async () => {
    // Create another draft alert
    const newDraftRes = await fetch(`${baseUrl}/api/authority/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authorityToken}`
      },
      body: JSON.stringify({
        title: 'Nashik High Wind Advisory',
        description: 'Gusts up to 60km/h expected in elevated sectors.',
        type: 'strong_wind',
        severity: 'moderate',
        location: 'Nashik District, Maharashtra'
      })
    })
    const newDraft = await newDraftRes.json()
    createdAlertIds.push(newDraft.data._id)

    // Fetch all authority alerts
    const allRes = await fetch(`${baseUrl}/api/authority/alerts`, {
      headers: { Authorization: `Bearer ${authorityToken}` }
    })
    const allPayload = await allRes.json()
    assert.equal(allRes.status, 200)
    assert.ok(Array.isArray(allPayload.data))
    assert.ok(allPayload.data.length >= 2)

    // Filter by status=draft
    const draftRes = await fetch(
      `${baseUrl}/api/authority/alerts?status=draft`,
      {
        headers: { Authorization: `Bearer ${authorityToken}` }
      }
    )
    const draftPayload = await draftRes.json()
    assert.ok(draftPayload.data.every(a => a.status === 'draft'))
    assert.ok(
      draftPayload.data.some(a => String(a._id) === String(newDraft.data._id))
    )

    // Filter by status=cancelled
    const cancelledRes = await fetch(
      `${baseUrl}/api/authority/alerts?status=cancelled`,
      {
        headers: { Authorization: `Bearer ${authorityToken}` }
      }
    )
    const cancelledPayload = await cancelledRes.json()
    assert.ok(cancelledPayload.data.every(a => a.status === 'cancelled'))
    assert.ok(
      cancelledPayload.data.some(
        a => String(a._id) === String(testDraftAlertId)
      )
    )

    // Verify audit population on cancelled alert
    const cancelledItem = cancelledPayload.data.find(
      a => String(a._id) === String(testDraftAlertId)
    )
    assert.ok(cancelledItem.createdBy && cancelledItem.createdBy.email)
    assert.ok(cancelledItem.cancelledBy && cancelledItem.cancelledBy.email)
  })

  test('GET /api/authority/stats returns operational stats & resource readiness', async () => {
    const res = await fetch(`${baseUrl}/api/authority/stats`, {
      headers: { Authorization: `Bearer ${authorityToken}` }
    })
    assert.equal(res.status, 200)
    const payload = await res.json()
    assert.ok(payload.data.summary)
    assert.ok(payload.data.summary.totalAlerts >= 0)
    assert.ok(Array.isArray(payload.data.severityBreakdown))
    assert.ok(Array.isArray(payload.data.recentAlerts))
    assert.ok(payload.data.resourceReadiness)
    assert.ok(payload.data.resourceReadiness.sdrfUnitsDeployed > 0)
  })

  test('GET /api/authority/districts returns live weather & risk profile for districts', async () => {
    const res = await fetch(`${baseUrl}/api/authority/districts`, {
      headers: { Authorization: `Bearer ${authorityToken}` }
    })
    assert.equal(res.status, 200)
    const payload = await res.json()
    assert.ok(Array.isArray(payload.data))
    assert.ok(payload.data.length >= 10)
    const pune = payload.data.find(d => d.name === 'Pune')
    assert.ok(pune)
    assert.ok(typeof pune.rainMm === 'number')
    assert.ok(typeof pune.tempC === 'number')
  })

  test('GET /api/authority/resources returns disaster relief shelters and battalions', async () => {
    const res = await fetch(`${baseUrl}/api/authority/resources`, {
      headers: { Authorization: `Bearer ${authorityToken}` }
    })
    assert.equal(res.status, 200)
    const payload = await res.json()
    assert.ok(Array.isArray(payload.data.shelters))
    assert.ok(payload.data.shelters.length > 0)
    assert.ok(Array.isArray(payload.data.battalions))
    assert.ok(payload.data.equipmentSummary)
  })

  test('GET /api/authority/analytics returns timeframe analytics and district rankings', async () => {
    const res = await fetch(`${baseUrl}/api/authority/analytics?timeRange=Last%2030%20Days`, {
      headers: { Authorization: `Bearer ${authorityToken}` }
    })
    assert.equal(res.status, 200)
    const payload = await res.json()
    assert.ok(payload.data.summary)
    assert.ok(Array.isArray(payload.data.timeline))
    assert.ok(Array.isArray(payload.data.topDistricts))
    assert.ok(payload.data.kpis)
  })

  test('GET /api/authority/reports/export streams CSV incident log report', async () => {
    const res = await fetch(`${baseUrl}/api/authority/reports/export`, {
      headers: { Authorization: `Bearer ${authorityToken}` }
    })
    assert.equal(res.status, 200)
    const text = await res.text()
    assert.ok(text.includes('Alert ID,Title,Severity,Type,District/Location'))
  })
})

