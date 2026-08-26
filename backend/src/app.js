import express from 'express'

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

app.use(express.json())

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
