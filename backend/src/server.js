import http from 'http'
import env from './config/env.js'
import { connectDB, disconnectDB } from './config/db.js'
import { initializeSocket } from './config/socket.js'
import { connectRedis, disconnectRedis } from './services/cache/redisClient.js'
import Scheduler from './services/scheduler.js'
import app from './app.js'

const PORT = env.PORT // Restart 1

let server

// ============================================
// CREATE HTTP SERVER
// ============================================

const httpServer = http.createServer(app)

// ============================================
// INITIALIZE SOCKET.IO
// ============================================

initializeSocket(httpServer)

// ============================================
// START SERVER
// ============================================

async function startServer () {
  try {
    await connectDB()

    // Connect Redis asynchronously (non-blocking, server works even if Redis fails)
    connectRedis().catch(err => {
      console.warn('⚠️ [Redis] Non-blocking connect notice:', err.message)
    })

    Scheduler.init()

    server = httpServer.listen(PORT, () => {
      console.log(
        `🚀 WeatherGPT API Server running in ${env.NODE_ENV} mode on port ${PORT}`
      )

      console.log(`🌐 HTTP Server: http://localhost:${PORT}`)

      console.log(`🔌 Socket.IO: http://localhost:${PORT}`)

      console.log('🔔 Real-time notification system enabled')
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error.message)

    process.exit(1)
  }
}

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

const handleShutdown = async signal => {
  console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`)

  if (server) {
    server.close(async () => {
      console.log('🔒 HTTP server closed.')

      await disconnectRedis()
      await disconnectDB()

      console.log('🔒 Database & Cache connections closed.')

      process.exit(0)
    })
  } else {
    await disconnectRedis()
    await disconnectDB()
    process.exit(0)
  }

  setTimeout(() => {
    console.error('⏱️ Graceful shutdown timed out. Forcing exit.')

    process.exit(1)
  }, 10000)
}

// ============================================
// PROCESS SIGNALS
// ============================================

process.on('SIGINT', () => handleShutdown('SIGINT'))

process.on('SIGTERM', () => handleShutdown('SIGTERM'))

// ============================================
// ERROR HANDLING
// ============================================

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', error => {
  console.error('💥 Uncaught Exception thrown:', error)

  handleShutdown('UNCAUGHT_EXCEPTION')
})

// ============================================
// START
// ============================================

startServer()
