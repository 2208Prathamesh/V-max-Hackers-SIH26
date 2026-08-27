# WeatherGPT Backend Service – Problem Statement ID: 26068

An industry-grade Express.js & MongoDB backend service powering **WeatherGPT: Conversational AI for Weather Forecasting, Alerts, and Climate Information**.

---

## 🏛️ Comprehensive API & Services Integration

| No. | API / Service | Purpose | Implemented Endpoints / Modules |
| :--- | :--- | :--- | :--- |
| **1** | **Open-Meteo Weather API** | Current, hourly & daily weather, soil moisture, evapotranspiration | `GET /api/weather/current`, `GET /api/weather/forecast`, `GET /api/weather/hourly` |
| **2** | **Open-Meteo Geocoding** | City name → Latitude/Longitude worldwide | `services/weather/openMeteo/geocoding.js` |
| **3** | **IMD Official Warnings** | Red/Orange/Yellow/Green alerts & district warnings | `GET /api/imd/warnings`, `GET /api/imd/warnings/district`, `GET /api/imd/bulletin` |
| **4** | **Historical Climate Analysis** | 20-year climate trends, anomalies & warming shift | `GET /api/climate/history`, `GET /api/climate/trends` |
| **5 & 6** | **NOAA GFS & ECMWF NWP** | Multi-model comparison & confidence score | `GET /api/weather/compare?city=Pune` |
| **7** | **MOSDAC / ISRO Satellite** | INSAT-3D/3DR imagery feeds & cyclone tracking | `GET /api/satellite/layers`, `GET /api/satellite/cyclone-tracks` |
| **8** | **Google Gemini AI** | Grounded intent parsing, multilingual answers & tool calling | `services/ai/geminiService.js`, `POST /api/messages` |
| **9 & 10** | **Voice (Whisper & Piper)** | Whisper Speech-to-Text & Piper Text-to-Speech audio | `POST /api/voice/transcribe`, `POST /api/voice/synthesize` |
| **11** | **MapLibre + OSM GIS** | Interactive weather, alert, & flood risk GeoJSON layers | `GET /api/maps/layers/weather`, `GET /api/maps/layers/alerts`, `GET /api/maps/layers/flood-risk` |
| **12** | **Agro & Disaster Advisory** | Soil moisture agro advice & disaster safety checklists | `GET /api/advisories/agriculture`, `GET /api/advisories/disaster` |

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
