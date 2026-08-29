import express from 'express';
import cors from 'cors';
import env from './config/env.js';

// Core routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

// Extended weather intelligence & GIS routes
import imdRoutes from './routes/imdRoutes.js';
import climateRoutes from './routes/climateRoutes.js';
import advisoryRoutes from './routes/advisoryRoutes.js';
import mapRoutes from './routes/mapRoutes.js';
import voiceRoutes from './routes/voiceRoutes.js';
import satelliteRoutes from './routes/satelliteRoutes.js';

import errorMiddleware from './middleware/errorMiddleware.js';

import {
  apiLimiter,
  authLimiter,
  chatLimiter
} from './middleware/rateLimitMiddleware.js';

const app = express();

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Liveness & Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'WeatherGPT API is running',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV
  });
});

// General API rate limiting
app.use('/api', apiLimiter);

// Public Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/imd', imdRoutes);
app.use('/api/climate', climateRoutes);
app.use('/api/advisories', advisoryRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/satellite', satelliteRoutes);

// Protected Routes
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', chatLimiter, messageRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

// 404 Fallback Handler for Unknown Routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Central Error Handler
app.use(errorMiddleware);

export default app;
