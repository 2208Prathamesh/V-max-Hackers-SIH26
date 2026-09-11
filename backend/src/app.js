import express from 'express'
import cors from 'cors'
import compression from 'compression'
import env from './config/env.js'

// Core routes
import testNotificationRoutes from "./routes/testNotificationRoutes.js";
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import conversationRoutes from './routes/conversationRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import locationRoutes from './routes/locationRoutes.js'
import alertRoutes from './routes/alertRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import subscriptionRoutes from './routes/subscriptionRoutes.js'
import weatherRoutes from './routes/weatherRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'

// Extended weather intelligence & GIS routes
import imdRoutes from './routes/imdRoutes.js'
import climateRoutes from './routes/climateRoutes.js'
import advisoryRoutes from './routes/advisoryRoutes.js'
import mapRoutes from './routes/mapRoutes.js'
import voiceRoutes from './routes/voiceRoutes.js'
import satelliteRoutes from './routes/satelliteRoutes.js'
import authorityRoutes from './routes/authorityRoutes.js'
import newsRoutes from './routes/newsRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

// SIH 2026 Advanced Feature Routes
import aviationRoutes from './routes/aviationRoutes.js'
import marineRoutes from './routes/marineRoutes.js'
import urbanFloodRoutes from './routes/urbanFloodRoutes.js'

import errorMiddleware from './middleware/errorMiddleware.js'

import {
  apiLimiter,
  chatLimiter
} from './middleware/rateLimitMiddleware.js'

const app = express()

// Gzip / Deflate HTTP Response Compression (reduces large JSON payloads by 75-85%)
app.use(compression())

// 1. Security Headers (Defense-in-depth protection against clickjacking, sniffing, reflection)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(self)')
  if (env.IS_PRODUCTION) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  next()
})

// 2. Cross-Origin Resource Sharing (CORS)
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. native mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true)
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      // In development mode, allow localhost, 127.0.0.1, LAN IPs (192.168.*, 10.*, 172.*), and Expo
      if (
        env.IS_DEVELOPMENT ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes('192.168.') ||
        origin.includes('10.') ||
        origin.includes(':8081') ||
        origin.includes(':5173') ||
        origin.includes(':5174')
      ) {
        return callback(null, true)
      }
      return callback(new Error('Origin is not allowed by CORS'))
    },
    credentials: true
  })
)

// Body Parsers
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Liveness & Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'WeatherGPT API is running',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV
  })
})

// Public Maintenance Status Check
app.get('/api/maintenance/status', async (req, res, next) => {
  try {
    const { getPublicMaintenanceStatus } = await import('./controllers/adminController.js')
    return getPublicMaintenanceStatus(req, res, next)
  } catch (err) {
    return res.status(200).json({ success: true, data: { enabled: false } })
  }
})


// General API rate limiting
app.use('/api', apiLimiter)

// Public Routes

app.use(
  "/api/test",
  testNotificationRoutes
)
app.use('/api/auth', authRoutes)
app.use('/api/weather', weatherRoutes)
app.use('/api/alerts', alertRoutes)
app.use('/api/imd', imdRoutes)
app.use('/api/weather/imd', imdRoutes)
app.use('/api/climate', climateRoutes)
app.use('/api/advisories', advisoryRoutes)
app.use('/api/maps', mapRoutes)
app.use('/api/voice', voiceRoutes)
app.use('/api/satellite', satelliteRoutes)
app.use('/api/news', newsRoutes)
app.use('/api/aviation', aviationRoutes)
app.use('/api/marine', marineRoutes)
app.use('/api/urban-flood', urbanFloodRoutes)

// Protected Routes
app.use('/api/users', userRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api/messages', chatLimiter, messageRoutes)
app.use('/api/locations', locationRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/authority', authorityRoutes)
app.use('/api/admin', adminRoutes)

// Serve production frontend assets from frontend/dist
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const frontendDist = path.resolve(__dirname, '../../frontend/dist')

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist))
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(frontendDist, 'index.html'))
    }
    next()
  })
}

// 404 Fallback Handler for Unknown Routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  })
})

// Central Error Handler
app.use(errorMiddleware)

export default app
