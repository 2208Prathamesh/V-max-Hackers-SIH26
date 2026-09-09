# WeatherGPT Backend Service – Problem Statement ID: 26068

An industry-grade Express.js & MongoDB backend service powering **WeatherGPT: Conversational AI for Weather Forecasting, Alerts, and Climate Information**.

---

## 🏛️ Comprehensive API & Services Integration

| No.        | API / Service                   | Purpose                                                            | Implemented Endpoints / Modules                                                                  |
| :--------- | :------------------------------ | :----------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| **1**      | **Open-Meteo Weather API**      | Current, hourly & daily weather, soil moisture, evapotranspiration | `GET /api/weather/current`, `GET /api/weather/forecast`, `GET /api/weather/hourly`               |
| **2**      | **Open-Meteo Geocoding**        | City name → Latitude/Longitude worldwide                           | `services/weather/openMeteo/geocoding.js`                                                        |
| **3**      | **IMD Official Warnings**       | Red/Orange/Yellow/Green alerts & district warnings                 | `GET /api/imd/warnings`, `GET /api/imd/warnings/district`, `GET /api/imd/bulletin`               |
| **4**      | **Historical Climate Analysis** | 20-year climate trends, anomalies & warming shift                  | `GET /api/climate/history`, `GET /api/climate/trends`                                            |
| **5 & 6**  | **NOAA GFS & ECMWF NWP**        | Multi-model comparison & confidence score                          | `GET /api/weather/compare?city=Pune`                                                             |
| **7**      | **MOSDAC / ISRO Satellite**     | INSAT-3D/3DR imagery feeds & cyclone tracking                      | `GET /api/satellite/layers`, `GET /api/satellite/cyclone-tracks`                                 |
| **8**      | **Google Gemini AI**            | Grounded intent parsing, multilingual answers & tool calling       | `services/ai/geminiService.js`, `POST /api/messages`                                             |
| **9 & 10** | **Voice (Whisper & Piper)**     | Whisper Speech-to-Text & Piper Text-to-Speech audio                | `POST /api/voice/transcribe`, `POST /api/voice/synthesize`                                       |
| **11**     | **MapLibre + OSM GIS**          | Interactive weather, alert, & flood risk GeoJSON layers            | `GET /api/maps/layers/weather`, `GET /api/maps/layers/alerts`, `GET /api/maps/layers/flood-risk` |
| **12**     | **Agro & Disaster Advisory**    | Soil moisture agro advice & disaster safety checklists             | `GET /api/advisories/agriculture`, `GET /api/advisories/disaster`                                |

---

## ⚙️ Environment Configuration

Create or update `.env` in `backend/`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/weathergpt
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173

# AI & Official Services (Optional: graceful offline fallbacks built-in)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
IMD_API_KEY=your_imd_key
MOSDAC_API_KEY=your_mosdac_key

# Redis & Two-Tier Weather Memory Layer
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=true
CACHE_COORDINATE_PRECISION=2
REDIS_TTL_CURRENT_FRESH_S=600
REDIS_TTL_CURRENT_RETENTION_S=86400
REDIS_TTL_FORECAST_FRESH_S=3600
REDIS_TTL_FORECAST_RETENTION_S=2592000
REDIS_TTL_HOURLY_FRESH_S=1800
REDIS_TTL_HOURLY_RETENTION_S=1209600
REDIS_TTL_RUN_RETENTION_S=604800
REDIS_TTL_ALERTS_FRESH_S=600
REDIS_TTL_ALERTS_RETENTION_S=2592000
MAX_STALE_AGE_CURRENT_HOURS=24
MAX_STALE_AGE_HOURLY_HOURS=48
MAX_STALE_AGE_DAILY_DAYS=14
```

---

## ⚡ Redis Weather Cache & Memory Architecture

The WeatherGPT backend incorporates a high-performance **two-tier distributed weather memory and forecast reconciliation layer** backed by Redis with a zero-configuration in-memory fallback.

### 1. Three-Tier Key Strategy

- **Latest Merged Forecast (`latest`)**: `weather:forecast:<locKey>:<days>:latest` (Hot cache, fast responses during fresh TTL).
- **Retained Merged Forecast (`retained`)**: `weather:forecast:<locKey>:<days>:retained` (Long-lived usable forecast for gap filling and offline/stale fallback).
- **Historical Provider Runs (`run`)**: `weather:forecast:<locKey>:run:<provider>:<runTimestamp>` (Immutable historical runs for auditing and reconciliation).
- **Current Weather Keys**:
  - `weather:current:<locKey>:fast` (Preserves `includeNWP: false` optimization; never triggers GRIB downloads).
  - `weather:current:<locKey>:full` (Complete synthesis with NWP models).
  - `weather:current:<locKey>:retained` (Fallback for current conditions).
- **Alerts Key**: `weather:alerts:<locKey>`.

### 2. Location Keys & Precision

- Deterministic canonical coordinates via `parseAndValidateCoordinates()`.
- Precision is configurable via `CACHE_COORDINATE_PRECISION` (default `2`, e.g. `18.52_73.86` for ~1.1km grid, avoiding unnecessary key fragmentation).

### 3. Forecast Reconciliation & Gap Filling

When a new provider forecast is retrieved:

- **Timestamp Matching**: Aligns hourly points across runs using standardized ISO UTC strings.
- **Timestamp Gap Filling**: If the new provider forecast omits a timestamp present in the retained forecast, the old point is preserved as `isStale: true` with its original provider source and `fetchedAt`.
- **Field-Level Gap Filling**: If a timestamp exists in both runs but new data has `null` values (e.g. humidity), valid metrics are backfilled from the retained run while preserving new values, and tracked via `fieldProvenance`.
- **Safety Boundaries**:
  - Validates coordinate compatibility between runs before merging.
  - Enforces `MAX_STALE_AGE` (stale points older than threshold are discarded, never presented as usable data).
- **Staleness Representation**:
  - `fresh`: All points are fresh from the new run.
  - `mixed`: Some points are fresh and some are gap-filled from retained runs.
  - `stale`: All points come from retained data (e.g. during provider outage).

### 4. Running Without Redis / Graceful Fallback

If Redis is not running or unreachable:

- The backend logs a notice once and continues functioning normally.
- In-memory process cache (`Map`) transparently takes over.
- To run without Redis: set `REDIS_ENABLED=false` or omit Redis; no crashes will occur.

### 5. Consuming Cached Context in Chat

Future Chat or offline LLMs can query unified weather memory without knowing Redis key formats:

```javascript
import { getCachedWeatherContext } from './services/weather/cachedWeatherContext.js'

const context = await getCachedWeatherContext(
  { latitude: 18.52, longitude: 73.85 },
  { days: 5 }
)
// Returns: { current, forecast, alerts, sources, fetchedAt, cacheStatus, isStale, hasUsableData }
```

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Seed database with demo accounts, locations, and alerts
npm run seed:fresh

# 3. Start development server with hot-reload
npm run dev

# 4. Run automated test suite (87 tests across 17 suites)
npm test
```

---

## 📡 Complete REST API Reference

### 🤖 WeatherGPT AI Chat (`/api/messages` & `/api/conversations`)

- `POST /api/conversations` - Create new conversation thread
- `GET /api/conversations` - Retrieve all user conversations
- `POST /api/messages` - Send user message and get grounded Gemini AI weather response
- `GET /api/messages/:conversationId` - Fetch conversation message history

### 🌦️ Multi-Model Weather & NWP (`/api/weather`)

- `GET /api/weather/current?city=Pune` - Live weather metrics
- `GET /api/weather/forecast?latitude=18.52&longitude=73.85&days=7` - Multi-day forecast
- `GET /api/weather/hourly?city=Mumbai&hours=24` - 24-48 hour hourly forecasts
- `GET /api/weather/compare?city=Pune` - NWP multi-model comparison (GFS vs ECMWF) with confidence score

### 🚨 IMD Official Warnings (`/api/imd`)

- `GET /api/imd/warnings` - Active national and state-level weather alerts
- `GET /api/imd/warnings/district?name=Pune` - District alert status (Red, Orange, Yellow, Green)
- `GET /api/imd/bulletin` - Synoptic weather bulletin and nowcasts

### 📈 Climate & 20-Year Historical Analysis (`/api/climate`)

- `GET /api/climate/history?city=Pune&startDate=2023-01-01&endDate=2023-12-31` - Historical weather archive
- `GET /api/climate/trends?city=Pune` - 20-year climate shift, temperature anomalies, and rainfall change

### 🌾 Agriculture & Disaster Decision Support (`/api/advisories`)

- `GET /api/advisories/agriculture?city=Pune&crop=cotton` - Soil moisture & crop management advisory
- `GET /api/advisories/disaster?city=Mumbai` - Emergency safety checklist & disaster hotlines

### 🗺️ MapLibre / OpenStreetMap GIS GeoJSON (`/api/maps`)

- `GET /api/maps/layers/weather?layer=temperature|precipitation|wind|clouds` - GeoJSON weather points
- `GET /api/maps/layers/alerts` - GeoJSON active alert zones
- `GET /api/maps/layers/flood-risk` - GeoJSON flood vulnerability zones

### 🎙️ Voice Assistance (`/api/voice`)

- `POST /api/voice/transcribe` - Whisper speech-to-text transcription
- `POST /api/voice/synthesize` - Piper text-to-speech audio synthesis profile

### 🛰️ Satellite & WMO WIS 2.0 (`/api/satellite`)

- `GET /api/satellite/layers` - INSAT-3D/3DR satellite imagery products
- `GET /api/satellite/cyclone-tracks` - Active cyclone trajectories and wind radiuses
