import 'dotenv/config'
import mongoose from 'mongoose'
import { hashPassword } from './utils/password.js'
import User from './models/User.js'
import UserPreferences from './models/UserPreferences.js'
import SavedLocation from './models/SavedLocation.js'
import Conversation from './models/Conversation.js'
import Message from './models/Message.js'
import Alert from './models/Alert.js'
import Notification from './models/Notification.js'

const demoEmail = 'sidpatil@gmail.com'

const savedLocations = [
  {
    name: 'Pune Home',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    latitude: 18.5204,
    longitude: 73.8567,
    isFavorite: true
  },
  {
    name: 'Mumbai Office',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    latitude: 19.076,
    longitude: 72.8777,
    isFavorite: false
  },
  {
    name: 'Delhi Trip',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.209,
    isFavorite: false
  }
]

const alertData = [
  {
    title: 'Heavy Rain Warning',
    description:
      'Heavy rainfall is expected in Pune. Avoid low-lying areas and travel carefully.',
    type: 'rain',
    severity: 'high',
    location: 'Pune, Maharashtra, India',
    latitude: 18.5204,
    longitude: 73.8567,
    startTime: new Date(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    source: 'WeatherGPT',
    status: 'active'
  },
  {
    title: 'Strong Wind Advisory',
    description:
      'Strong winds may accompany showers. Secure loose outdoor objects.',
    type: 'strong_wind',
    severity: 'moderate',
    location: 'Mumbai, Maharashtra, India',
    latitude: 19.076,
    longitude: 72.8777,
    startTime: new Date(),
    endTime: new Date(Date.now() + 36 * 60 * 60 * 1000),
    source: 'WeatherGPT',
    status: 'active'
  }
]

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI)

  const passwordHash = await hashPassword('password123')
  const user = await User.findOneAndUpdate(
    { email: demoEmail },
    {
      $set: {
        name: 'Sid Patil',
        role: 'user',
        passwordHash,
        language: 'en',
        timezone: 'Asia/Kolkata'
      }
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  )

  const authorityPasswordHash = await hashPassword('AuthorityPassword123!')
  await User.findOneAndUpdate(
    { email: 'authority@weathergpt.com' },
    {
      $set: {
        name: 'Authority Admin',
        role: 'authority',
        department: 'State Disaster Management & Meteorological Authority',
        state: 'Maharashtra State',
        passwordHash: authorityPasswordHash,
        language: 'en',
        timezone: 'Asia/Kolkata',
        isVerified: true
      }
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  )

  const oldConversations = await Conversation.find({ userId: user._id }).select(
    '_id'
  )

  await Promise.all([
    UserPreferences.deleteMany({ userId: user._id }),
    SavedLocation.deleteMany({ userId: user._id }),
    Conversation.deleteMany({ userId: user._id }),
    Message.deleteMany({
      conversationId: {
        $in: oldConversations.map(conversation => conversation._id)
      }
    }),
    Notification.deleteMany({ userId: user._id })
  ])

  await UserPreferences.create({
    userId: user._id,
    temperatureUnit: 'C',
    windUnit: 'km/h',
    pressureUnit: 'hPa',
    precipitationUnit: 'mm',
    appearance: 'system',
    language: 'en'
  })

  await SavedLocation.insertMany(
    savedLocations.map(location => ({
      ...location,
      userId: user._id
    }))
  )

  const conversation = await Conversation.create({
    userId: user._id,
    title: 'Will it rain tomorrow in Pune?',
    category: 'forecast'
  })

  await Message.insertMany([
    {
      conversationId: conversation._id,
      sender: 'user',
      content: 'Will it rain tomorrow in Pune?',
      messageType: 'text'
    },
    {
      conversationId: conversation._id,
      sender: 'ai',
      content:
        'Rain is possible tomorrow in Pune. Check the latest forecast before making outdoor plans.',
      messageType: 'forecast'
    }
  ])

  const alerts = await Promise.all(
    alertData.map(alert =>
      Alert.findOneAndUpdate(
        {
          title: alert.title,
          location: alert.location,
          source: alert.source
        },
        { $set: alert },
        {
          upsert: true,
          returnDocument: 'after',
          setDefaultsOnInsert: true
        }
      )
    )
  )

  await Notification.create({
    userId: user._id,
    type: 'weather_alert',
    title: alerts[0].title,
    message: alerts[0].description,
    relatedAlertId: alerts[0]._id,
    isRead: false
  })

  console.log(`Seeded demo data for ${demoEmail}`)
  console.log('Demo password: password123')
}

try {
  await seed()
} catch (error) {
  console.error('Seed failed:', error.message)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
