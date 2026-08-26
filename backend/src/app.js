import express from 'express'
import cors from 'cors'

import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import conversationRoutes from './routes/conversationRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import locationRoutes from './routes/locationRoutes.js'
import alertRoutes from './routes/alertRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import weatherRoutes from './routes/weatherRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'

import errorMiddleware from './middleware/errorMiddleware.js'

import {
  apiLimiter,
  authLimiter,
  chatLimiter
} from './middleware/rateLimitMiddleware.js'

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173'
  })
)
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'WeatherGPT API is running' })
})

// General API rate limiting
app.use('/api', apiLimiter)

// Public routes
app.use('/api/auth', authLimiter, authRoutes)

app.use('/api/weather', weatherRoutes)
app.use('/api/alerts', alertRoutes)

// Protected routes
app.use('/api/users', userRoutes)
app.use('/api/conversations', conversationRoutes)

app.use('/api/messages', chatLimiter, messageRoutes)

app.use('/api/locations', locationRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/settings', settingsRoutes)

// Central error handler
app.use(errorMiddleware)

export default app
