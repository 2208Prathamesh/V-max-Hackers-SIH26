# 03. Backend Architecture & REST API Registry

## 🏗️ Backend Server Architecture

The WeatherGPT backend is structured as an enterprise-grade Express.js (v5.2.1) server running natively on Node.js ES Modules (`"type": "module"`).

### Core Server Lifecycle (`backend/src/server.js`)
1. **HTTP Server Initialization:** Creates an HTTP server wrapping the Express app instance.
2. **Real-time WebSockets:** Binds Socket.IO to the HTTP server for low-latency bidirectional alert delivery.
3. **Database Connection:** Connects to MongoDB with connection pooling via Mongoose.
4. **Scheduler Activation:** Initializes recurring background tasks (e.g. IMD alert sync every 15 minutes).
5. **Graceful Termination Handlers:**
   - Listens for `SIGINT` and `SIGTERM`.
   - Stops incoming HTTP connections, terminates active Socket.IO connections, safely disconnects MongoDB, and enforces a 10-second hard-kill safety timeout.
   - Captures `unhandledRejection` and `uncaughtException` to log stack traces cleanly.

---

## 🛡️ Middleware Pipeline (`backend/src/middleware/`)

Requests traverse the following pipeline:

```
Request ──> [ CORS ] ──> [ Body Parsers (10MB) ] ──> [ Rate Limiters ]
            ──> [ JWT Auth / Role Guard ] ──> [ Joi Validation ]
            ──> [ Controller ] ──> [ Central Error Middleware ]
```

### 1. Security & CORS (`app.js`)
- Enforces strict CORS headers matching `FRONTEND_URL` with credentials allowed.
- Limits body sizes to `10mb` to support voice audio base64 uploads.

### 2. Rate Limiting (`rateLimitMiddleware.js`)
Protects against abuse, DDoS, and API exhaustion:
- **`apiLimiter`:** General API limit (100 requests / 15 minutes).
- **`authLimiter`:** Strict authentication limit (10 attempts / 15 minutes) to protect `/api/auth` from brute-force attacks.
- **`chatLimiter`:** Conversational AI throttle (30 messages / 15 minutes) to conserve LLM tokens and external quotas.

### 3. Authentication & Role-Based Access Control (`authMiddleware.js`)
- Validates standard `Authorization: Bearer <jwt_token>` header using `jsonwebtoken`.
- Attaches the decoded Mongoose `User` document to `req.user`.
- Provides `requireRole('authority')` middleware to protect disaster agency endpoints.

### 4. Input Validation (`validationMiddleware.js`)
- Validates request payloads against strict schemas compiled with **Joi** (`authValidator`, `chatValidator`, `locationValidator`, `userValidator`).
- Rejects malformed requests with detailed field-level error messages before reaching business logic.

### 5. Centralized Error Handling (`errorMiddleware.js`)
- Normalizes all errors (Mongoose validation, CastError, JWT errors, external 5xx) into a uniform JSON structure:
```json
{
  "success": false,
  "message": "Human readable error description",
  "error": "ErrorType",
  "statusCode": 400
}
```

---

## 📡 Complete REST API Endpoint Registry

### 1. Health & System
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System status, liveness probe, environment, and version timestamp. |

---

### 2. Authentication (`/api/auth`)
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account (`name`, `email`, `password`, `language`). |
| `POST` | `/api/auth/login` | Public | Authenticate user, return JWT token & user profile. |
| `GET` | `/api/auth/me` | Protected | Fetch current logged-in user profile. |
| `POST` | `/api/auth/logout` | Protected | Invalidate user session. |
| `POST` | `/api/auth/forgot-password` | Public | Generate timed password reset token hash. |
| `POST` | `/api/auth/reset-password/:token` | Public | Verify reset token and set new password. |

---

### 3. Weather & NWP Forecasting (`/api/weather`)
| Method | Path | Auth | Query / Body Parameters | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/weather/current` | Public | `?city=Pune` or `?latitude=18.52&longitude=73.85` | Live weather metrics, apparent temp, humidity, pressure, wind. |
| `GET` | `/api/weather/forecast` | Public | `?city=Pune&days=7` | 7-day normalized daily forecasts with precipitation probabilities. |
| `GET` | `/api/weather/hourly` | Public | `?city=Pune&hours=24` | 24-48 hour granular hourly forecast with soil and solar metrics. |
| `GET` | `/api/weather/compare` | Public | `?city=Pune` | Multi-model comparison between NOAA GFS and ECMWF-IFS with agreement score. |
| `GET` | `/api/weather/search` | Public | `?q=Mumbai` | Geocoding lookup matching city names to coordinates worldwide. |
| `GET` | `/api/weather/reverse-geocode` | Public | `?latitude=18.52&longitude=73.85` | Reverse geocode coordinates to locality, state, and country names. |

---

### 4. Official IMD Warnings (`/api/imd` and `/api/weather/imd`)
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/imd/warnings` | Public | Active national and state-level India Meteorological Department warnings. |
| `GET` | `/api/imd/warnings/district` | Public | District-level alert status (`?name=Pune`) returning Red/Orange/Yellow/Green alerts. |
| `GET` | `/api/imd/bulletin` | Public | IMD daily synoptic weather bulletins and nowcasting summaries. |

---

### 5. Weather Alerts & Emergency Warnings (`/api/alerts`)
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/alerts` | Public | List all active weather alerts with filters. |
| `GET` | `/api/alerts/active` | Public | List currently active alerts sorted by severity (Extreme to Low). |
| `GET` | `/api/alerts/my-alerts` | Protected | Filter active alerts matching the authenticated user's saved locations. |
| `GET` | `/api/alerts/:id` | Public | Retrieve detailed alert metadata and affected zones. |
| `POST`| `/api/alerts/sync` | Protected | Manually trigger official IMD alert feed synchronization. |

---

### 6. Conversational AI Chat (`/api/conversations` & `/api/messages`)
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/conversations` | Protected | List all conversation threads belonging to user. |
| `POST` | `/api/conversations` | Protected | Create new chat thread with title. |
| `GET` | `/api/conversations/:id` | Protected | Retrieve specific conversation metadata. |
| `DELETE`| `/api/conversations/:id` | Protected | Delete conversation thread and associated messages. |
| `GET` | `/api/messages/:conversationId` | Protected | Fetch chronologically ordered chat messages in a thread. |
| `POST` | `/api/messages` | Protected | Send user query; backend fetches weather, grounds context, calls Gemini/offline engine, and returns response. |

---

### 7. Agro-Meteorological & Disaster Advisories (`/api/advisories`)
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/advisories/agriculture` | Public | Crop advisory (`?city=Pune&crop=cotton`) analyzing soil moisture, ET0, and spray suitability. |
| `GET` | `/api/advisories/crop` | Public | Specialized crop advisory based on latitude and longitude coordinates. |
| `GET` | `/api/advisories/disaster` | Public | Disaster emergency protocols (`?location=Mumbai`) for floods, cyclones, heatwaves with helpline numbers. |

---

### 8. GIS Map Layers (`/api/maps`)
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/maps/layers/weather` | Public | GeoJSON FeatureCollection of station observation points (`?layer=temperature\|precipitation\|wind\|clouds`). |
| `GET` | `/api/maps/layers/alerts` | Public | GeoJSON polygon/circle features representing active hazard alert zones. |
| `GET` | `/api/maps/layers/flood-risk`| Public | GeoJSON flood vulnerability and river overflow risk zones. |

---

### 9. Satellite & Cyclone Intelligence (`/api/satellite`)
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/satellite/layers` | Public | Metadata for INSAT-3D/3DR satellite imagery products (visible, thermal infrared, water vapor). |
| `GET` | `/api/satellite/cyclone-tracks`| Public | Active and historical cyclone tracks, wind radius polygons, and projected paths. |

---

### 10. Climate & Historical Analytics (`/api/climate`)
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/climate/history` | Public | Historical meteorological records (`?city=Pune&startDate=2023-01-01&endDate=2023-12-31`). |
| `GET` | `/api/climate/trends` | Public | 20-year climate trends, warming anomalies, and decadal precipitation shifts. |
| `GET` | `/api/climate/full` | Public | Combined climate trend and seasonal variation report. |

---

### 11. Voice Assistance (`/api/voice`)
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/voice/transcribe` | Public | Transcribe audio recording (Base64) to text via Whisper profile. |
| `POST` | `/api/voice/synthesize` | Public | Generate speech audio stream or profile for text response via Piper profile. |

---

### 12. User Management & Preferences
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/locations` | Protected | List user's saved locations. |
| `POST` | `/api/locations` | Protected | Add new saved location with geocoordinates. |
| `PUT` | `/api/locations/:id` | Protected | Update saved location nickname or default status. |
| `DELETE`| `/api/locations/:id` | Protected | Remove saved location. |
| `PATCH`| `/api/locations/:id/favorite`| Protected | Toggle favorite status for quick dashboard access. |
| `GET` | `/api/notifications` | Protected | Retrieve notifications feed. |
| `GET` | `/api/notifications/unread-count`| Protected | Count unread notifications for navbar badge. |
| `PATCH`| `/api/notifications/:id/read`| Protected | Mark specific notification as read. |
| `PATCH`| `/api/notifications/read-all`| Protected | Mark all user notifications as read. |
| `GET` | `/api/settings` | Protected | Fetch user preferences (temperature unit, language, notification toggles). |
| `PUT` | `/api/settings` | Protected | Update user preferences. |
| `PUT` | `/api/settings/password` | Protected | Update account password. |
| `GET` | `/api/users/profile` | Protected | Retrieve user profile details. |
| `PUT` | `/api/users/profile` | Protected | Update profile metadata (name, timezone). |
| `GET` | `/api/authority/me` | Authority | Restricted profile check for disaster management authorities. |

---

## ⏰ Background Scheduler (`backend/src/services/scheduler.js`)

The backend runs scheduled background maintenance jobs using `node-cron`:

```javascript
// Syncs official IMD warnings every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  await alertService.syncOfficialAlerts({ force: true });
});
```

- Fetches new warnings from official sources.
- De-duplicates against MongoDB.
- Automatically triggers user geofence matching and real-time Socket.IO alerts.
