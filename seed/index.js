import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from '../backend/node_modules/mongoose/index.js'
import bcrypt from '../backend/node_modules/bcryptjs/index.js'
import dotenv from '../backend/node_modules/dotenv/lib/main.js'

// Resolve paths to backend models
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') })

// Import Mongoose Models
import User from '../backend/src/models/User.js'
import UserPreferences from '../backend/src/models/UserPreferences.js'
import SavedLocation from '../backend/src/models/SavedLocation.js'
import Conversation from '../backend/src/models/Conversation.js'
import Message from '../backend/src/models/Message.js'
import Alert from '../backend/src/models/Alert.js'
import Notification from '../backend/src/models/Notification.js'
import ImdWarning from '../backend/src/models/ImdWarning.js'
import Station from '../backend/src/models/Station.js'
import FloodZone from '../backend/src/models/FloodZone.js'
import SatelliteProduct from '../backend/src/models/SatelliteProduct.js'
import CycloneTrack from '../backend/src/models/CycloneTrack.js'

// Import Datasets
import { usersSeedData } from './data/users.seed.js'
import { preferencesSeedData } from './data/preferences.seed.js'
import { locationsSeedData } from './data/locations.seed.js'
import { getAlertsSeedData } from './data/alerts.seed.js'
import { conversationsSeedData } from './data/conversations.seed.js'
import { notificationsSeedData } from './data/notifications.seed.js'
import { getImdWarningsSeedData } from './data/imd-warnings.seed.js'
import { stationsSeedData } from './data/stations.seed.js'
import { floodZonesSeedData } from './data/flood-zones.seed.js'
import { satelliteProductsSeedData } from './data/satellite-products.seed.js'
import { cycloneTracksSeedData } from './data/cyclone-tracks.seed.js'

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/weathergpt'

/**
 * Clean database collections
 */
async function cleanDatabase() {
  console.log('🧹 Cleaning existing database collections...')
  await Promise.all([
    User.deleteMany({}),
    UserPreferences.deleteMany({}),
    SavedLocation.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
    Alert.deleteMany({}),
    Notification.deleteMany({}),
    ImdWarning.deleteMany({}),
    Station.deleteMany({}),
    FloodZone.deleteMany({}),
    SatelliteProduct.deleteMany({}),
    CycloneTrack.deleteMany({})
  ])
  console.log('✅ Collections cleaned successfully.')
}

/**
 * Run seeding logic
 */
async function runSeeder() {
  const isCleanOnly = process.argv.includes('--clean')
  const isFresh = process.argv.includes('--fresh') || process.argv.includes('--seed') || process.argv.length === 2

  console.log('==============================================')
  console.log('🌱 WeatherGPT Database Seeder')
  console.log(`📡 MongoDB URI: ${mongoUri}`)
  console.log('==============================================')

  await mongoose.connect(mongoUri)
  console.log('🔌 Connected to MongoDB.')

  if (isCleanOnly) {
    await cleanDatabase()
    return
  }

  if (isFresh) {
    await cleanDatabase()
  }

  console.log('\n📥 Seeding all datasets...')

  // 1. Seed Weather Alerts
  const freshAlertsData = getAlertsSeedData()
  console.log(`\n🔔 Seeding ${freshAlertsData.length} weather alerts...`)
  const createdAlerts = await Alert.insertMany(freshAlertsData)
  console.log(`  ✓ Created ${createdAlerts.length} alerts.`)

  // 2. Seed IMD District Warnings
  const imdWarnings = getImdWarningsSeedData()
  console.log(`\n🌧️ Seeding ${imdWarnings.length} IMD district warnings...`)
  const createdWarnings = await ImdWarning.insertMany(imdWarnings)
  console.log(`  ✓ Created ${createdWarnings.length} IMD warnings.`)

  // 3. Seed Weather Observation Stations
  console.log(`\n📡 Seeding ${stationsSeedData.length} weather stations...`)
  const createdStations = await Station.insertMany(stationsSeedData)
  console.log(`  ✓ Created ${createdStations.length} stations.`)

  // 4. Seed Flood Risk Zones
  console.log(`\n🌊 Seeding ${floodZonesSeedData.length} flood risk zones...`)
  const createdFloodZones = await FloodZone.insertMany(floodZonesSeedData)
  console.log(`  ✓ Created ${createdFloodZones.length} flood zones.`)

  // 5. Seed Satellite Products
  console.log(`\n🛰️ Seeding ${satelliteProductsSeedData.length} satellite products...`)
  const createdProducts = await SatelliteProduct.insertMany(satelliteProductsSeedData)
  console.log(`  ✓ Created ${createdProducts.length} satellite products.`)

  // 6. Seed Cyclone Tracks
  console.log(`\n🌀 Seeding ${cycloneTracksSeedData.length} cyclone tracks...`)
  const createdTracks = await CycloneTrack.insertMany(cycloneTracksSeedData)
  console.log(`  ✓ Created ${createdTracks.length} cyclone tracks.`)

  // 7. Seed Users & Preferences & Associated Data
  for (const userData of usersSeedData) {
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(userData.password, salt)

    const user = await User.create({
      name: userData.name,
      email: userData.email,
      passwordHash,
      language: userData.language,
      timezone: userData.timezone,
      isVerified: userData.isVerified
    })

    console.log(`\n👤 Created user: ${user.email} (Password: ${userData.password})`)

    // Preferences
    await UserPreferences.create({
      userId: user._id,
      ...preferencesSeedData,
      language: user.language
    })

    // Saved Locations
    await SavedLocation.insertMany(
      locationsSeedData.map(loc => ({
        ...loc,
        userId: user._id
      }))
    )
    console.log(`  ✓ Added ${locationsSeedData.length} saved locations for ${user.name}.`)

    // Conversations & Messages
    for (const convData of conversationsSeedData) {
      const conv = await Conversation.create({
        userId: user._id,
        title: convData.title,
        category: convData.category
      })

      if (convData.messages?.length) {
        await Message.insertMany(
          convData.messages.map(msg => ({
            conversationId: conv._id,
            sender: msg.sender,
            content: msg.content,
            messageType: msg.messageType || 'text',
            metadata: msg.metadata || {}
          }))
        )
      }
    }
    console.log(`  ✓ Added ${conversationsSeedData.length} conversations & message histories.`)

    // Notifications
    if (createdAlerts.length > 0) {
      await Notification.insertMany(
        notificationsSeedData.map((notif, index) => ({
          userId: user._id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          relatedAlertId: createdAlerts[index % createdAlerts.length]._id,
          isRead: notif.isRead
        }))
      )
      console.log(`  ✓ Added ${notificationsSeedData.length} notification entries.`)
    }
  }

  console.log('\n==============================================')
  console.log('🎉 Seeding completed successfully!')
  console.log('\nSeeded Collections Summary:')
  console.log(`  📊 Alerts:             ${createdAlerts.length}`)
  console.log(`  🌧️ IMD Warnings:       ${createdWarnings.length}`)
  console.log(`  📡 Stations:           ${createdStations.length}`)
  console.log(`  🌊 Flood Zones:        ${createdFloodZones.length}`)
  console.log(`  🛰️ Satellite Products: ${createdProducts.length}`)
  console.log(`  🌀 Cyclone Tracks:     ${createdTracks.length}`)
  console.log(`  👤 Users:              ${usersSeedData.length}`)
  console.log('\nDemo Login Credentials:')
  usersSeedData.forEach(u => {
    console.log(`  👉 Email: ${u.email.padEnd(28)} | Password: ${u.password}`)
  })
  console.log('==============================================\n')
}

try {
  await runSeeder()
} catch (err) {
  console.error('❌ Seeding failed:', err.message)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
  console.log('🔌 Disconnected from MongoDB.')
}
