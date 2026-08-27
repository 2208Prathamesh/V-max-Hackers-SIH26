# WeatherGPT Backend Service

An industry-grade Express.js & MongoDB backend service powering **WeatherGPT** — featuring multi-model Numerical Weather Prediction (ECMWF, NOAA GFS, Open-Meteo), AI-assisted conversational weather forecasting, and real-time geographic alerts.

---

## 🏛️ Architecture & Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── env.js                      # Centralized environment variable manager & defaults
│   │   ├── db.js                       # MongoDB connection orchestrator & graceful lifecycle
│   │   └── constants.js                # Enums, severe alert types, units, and cache TTLs
│   ├── controllers/
│   │   ├── alertController.js          # Public alert feeds & read confirmations
│   │   ├── authController.js           # Registration, login, logout, password resets
│   │   ├── conversationController.js   # Chat sessions & thread management
│   │   ├── locationController.js       # Saved locations CRUD with live weather enrichment
│   │   ├── messageController.js        # WeatherGPT messages & AI responses
│   │   ├── notificationController.js   # Notification queries & read state management
│   │   ├── settingsController.js       # User preferences (units, theme, notifications)
│   │   ├── userController.js           # Profile updates & cascading account deletion
│   │   └── weatherController.js        # Multi-model weather, geocoding & hourly forecasts
│   ├── middleware/
│   │   ├── authMiddleware.js           # JWT Bearer token authentication
│   │   ├── errorMiddleware.js          # Central error envelope handler
│   │   ├── rateLimitMiddleware.js      # Endpoint & auth rate limiters
│   │   └── validationMiddleware.js     # Joi payload & query validation
│   ├── models/
│   │   ├── Alert.js                    # Severe weather alert schema & geospatial indexes
│   │   ├── Conversation.js             # Chat threads schema
│   │   ├── Message.js                  # Message entities with weather metadata
│   │   ├── Notification.js             # Alert & forecast notifications
│   │   ├── SavedLocation.js            # User favorite & saved coordinates
│   │   ├── User.js                     # User account & credential hash
│   │   └── UserPreferences.js          # Measurement units & UI theme preferences
│   ├── routes/                         # Express API route declarations
│   ├── services/
│   │   ├── alertService.js             # Alert retrieval & filtering
│   │   ├── authService.js              # Authentication logic & password hashing
│   │   ├── chatService.js              # WeatherGPT entity extraction & response generation
│   │   ├── locationService.js          # Location management
│   │   ├── notificationService.js      # Notification dispatch & read tracking
│   │   └── weather/                    # NWP & Open-Meteo data integration
│   │       ├── normalizers/            # Data payload standardizers
│   │       ├── nwp/ecmwf/              # Direct ECMWF GRIB2 range parser & caching
│   │       ├── nwp/noaaGfs/            # NOAA GFS client
│   │       ├── openMeteo/              # Open-Meteo forecast, air quality, flood, marine
│   │       └── weatherService.js       # Weather aggregation engine with inflight deduplication
│   ├── utils/
│   │   ├── generateToken.js            # JWT signing helper
│   │   ├── password.js                 # Bcrypt hashing & verification
│   │   └── response.js                 # Standardized JSON response envelopes
│   ├── validators/                     # Joi validation schemas
│   ├── app.js                          # Express app configuration & middleware pipeline
│   └── server.js                       # Server bootstrapper & graceful shutdown handler
├── package.json
└── .env
```

---

## ⚙️ Environment Variables

Create a `.env` file in `backend/` or root:

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | `number` | `5000` | HTTP server port |
| `NODE_ENV` | `string` | `development` | Environment (`development`, `production`, `test`) |
| `MONGO_URI` | `string` | `mongodb://localhost:27017/weathergpt` | MongoDB connection URI |
| `JWT_SECRET` | `string` | `dev_secret_key...` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | `string` | `7d` | JWT expiration duration |
| `FRONTEND_URL` | `string` | `http://localhost:5173` | CORS allowed client origin |

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Seed database with demo accounts & sample locations
npm run seed:fresh

# 3. Start development server with hot-reload
npm run dev

# 4. Execute test suites
npm test
```

---

## 📡 Core API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Authenticate user & retrieve JWT
- `GET /api/auth/me` - Fetch authenticated user profile

### 🌦️ Weather Intelligence (`/api/weather`)
- `GET /api/weather/current?city=Pune` - Live multi-model weather for city or lat/lon
- `GET /api/weather/forecast?latitude=18.52&longitude=73.85&days=7` - Multi-model forecast (ECMWF, GFS, Open-Meteo)
- `GET /api/weather/hourly?city=Mumbai&hours=24` - 24-48 hour hourly forecast

### 💬 WeatherGPT Chatbot (`/api/messages` & `/api/conversations`)
- `POST /api/conversations` - Start new conversation thread
- `GET /api/conversations` - List all user conversations
- `POST /api/messages` - Send query to WeatherGPT and receive AI weather answer
- `GET /api/messages/:conversationId` - Retrieve thread messages

### 📍 Locations (`/api/locations`)
- `GET /api/locations` - List saved locations enriched with live weather
- `POST /api/locations` - Save new geographic coordinate
- `PATCH /api/locations/:id/favorite` - Toggle favorite location
- `DELETE /api/locations/:id` - Remove saved location

### ⚠️ Alerts (`/api/alerts`)
- `GET /api/alerts` - List all regional severe weather alerts
- `GET /api/alerts/active` - Filter currently active alerts
- `PATCH /api/alerts/:id/read` - Mark alert notification as read

### ⚙️ Preferences & Profile (`/api/settings` & `/api/users`)
- `GET /api/settings` - Retrieve user unit & display preferences
- `PUT /api/settings` - Update preferences (Celsius/Fahrenheit, metric/imperial, theme)
- `PATCH /api/users/me` - Update profile details
- `DELETE /api/users/me` - Cascading account and data deletion
