# 01. Executive Summary & SIH Problem Statement

## 📌 Problem Statement Details
- **Hackathon:** Smart India Hackathon (SIH 2026)
- **Problem Statement ID:** `26068`
- **Domain:** Agriculture, FoodTech & Rural Development / Disaster Management & Climate Action
- **Title:** Conversational AI for Weather Forecasting, Alerts, and Climate Information

---

## 🎯 The Core Problem & Gap Analysis

1. **Information Fragmentation:** Citizens, farmers, and emergency planners often have to navigate multiple disconnected portals:
   - IMD for official alerts and bulletins.
   - Global NWP forecasts (ECMWF, GFS) for 7-day outlooks.
   - ISRO / MOSDAC for satellite imagery and cyclone tracking.
   - State Agricultural Universities for agro-met crop advice.
2. **Cognitive Overload & Technical Jargon:** Raw meteorological metrics (such as atmospheric pressure in hPa, convective available potential energy, evapotranspiration in mm/day, or GRIB2 model spreads) are difficult for non-specialists to interpret.
3. **Language & Accessibility Barrier:** Rural farmers and coastal communities require insights in their local native languages (Hindi, Marathi, Bengali, Tamil, Telugu) with spoken voice capabilities.
4. **Hallucination Risk in Pure LLMs:** Standard AI chatbots hallucinate weather numbers when queried. Weather intelligence requires **grounded**, fact-verified meteorological inputs before language generation.
5. **Network Fragility:** Disaster conditions often coincide with connectivity blackouts. Systems must be resilient and offer deterministic offline operations.

---

## 💡 The WeatherGPT Solution

**WeatherGPT** is a comprehensive, production-grade intelligence platform that bridges global numerical models, national meteorological infrastructure, and end-user decision support.

```
       [ NOAA GFS ]       [ ECMWF-IFS ]       [ Open-Meteo ]
             \                  |                  /
              \                 |                 /
               ▼                ▼                ▼
     ┌──────────────────────────────────────────────────────┐
     │           WeatherGPT Multi-Model Engine              │
     │   - GRIB2 binary decoding (@mattnucc/gribberish)     │
     │   - Model spread calculation & agreement scoring     │
     │   - IMD ground station interpolation & nowcasting   │
     └──────────────────────────┬───────────────────────────┘
                                │ Verified Grounded Data
                                ▼
     ┌──────────────────────────────────────────────────────┐
     │        AI Reasoning & Grounded Generation            │
     │   - Google Gemini 1.5 Flash (API integration)        │
     │   - Deterministic Multilingual Fallback Engine       │
     │   - Conversational, Agro & Disaster Advisory         │
     └──────────────────────────┬───────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
  [ Web Application ]                          [ Mobile Application ]
  React 19 + Tailwind + Leaflet GIS            React Native + Expo SDK 57
  (Multilingual, Charts, Voice, Alerts)        (Offline cache, Push notifications)
```

---

## 🏆 Key Standout Innovations

### 1. Multi-Model NWP Ensemble Comparison
- Simultaneously fetches and normalizes **NOAA GFS (0.25°)** and **ECMWF-IFS (0.4°)** numerical weather prediction models.
- Calculates parametric spread across temperature, precipitation, and wind speed.
- Assigns a **Confidence & Agreement Score** (High / Moderate / Low) indicating forecast certainty.

### 2. Fact-Grounded Conversational AI
- Instead of asking the LLM to guess weather, the backend fetches verified live observations and forecasts, packs them into a structured prompt, and instructs **Google Gemini** with temperature `0.3` to synthesize natural answers.
- Built-in **Deterministic Offline Engine**: If the Gemini API key is unset or external networks fail, the backend generates fluent, natural responses in **English, Marathi, Hindi, Bengali, Tamil, or Telugu**.

### 3. Precision Agro-Meteorological Advisories
- Computes topsoil moisture (0–1 cm), soil temperature, and FAO Penman-Monteith reference evapotranspiration ($ET_0$).
- Produces actionable farming advisories:
  - **Irrigation Guidance:** Recommends holding irrigation if >25mm rain is expected in 72 hours.
  - **Pesticide / Spray Window:** Flags high wind speed (>20 km/h drift risk) and upcoming rainfall (>10mm washout risk).
  - **Crop-Specific Intelligence:** Tailored advice for Cotton (bollworm risk), Wheat (terminal heat stress), Rice (standing water limits), and Sugarcane.

### 4. Official IMD Warnings & Geofenced Alerts
- Automatic 15-minute background sync with official **IMD (India Meteorological Department)** warning feeds.
- Geofencing matching against user saved locations.
- Instant push notifications via **Socket.IO** WebSockets and in-app Notification Center.

### 5. Multi-Layer GIS Mapping (MapLibre / Leaflet)
- Interactive thematic layers: Temperature gradients, Precipitation intensity, Wind velocity vectors, Cloud cover.
- Active IMD alert zones with color-coded severity (Red, Orange, Yellow, Green).
- Flood vulnerability polygons and MOSDAC / ISRO cyclone tracking with forecasted trajectories.

### 6. Voice & Multilingual Accessibility
- Complete audio pipeline: Speech-to-Text (Whisper profile) and Text-to-Speech (Piper profile).
- Full UI localization in 6 Indian languages with an exhaustive 147KB client dictionary.

---

## 🛠️ Technology Stack Summary

| Layer | Primary Technologies | Key Libraries / Modules |
| :--- | :--- | :--- |
| **Backend Runtime** | Node.js (ES Modules), Express 5.2.1 | `express`, `cors`, `dotenv`, `express-rate-limit`, `joi` |
| **Database & ODM** | MongoDB 6+, Mongoose 9.9.3 | `mongoose`, compound geospatial & status indexes |
| **Real-Time Layer** | WebSockets via Socket.IO 4.8.3 | `socket.io` (server), `socket.io-client` (clients) |
| **Meteorology / NWP** | Open-Meteo, ECMWF, NOAA GFS, IMD | `@mattnucc/gribberish`, `@weacast/grib2json`, `fast-xml-parser` |
| **Artificial Intelligence** | Google Gemini 1.5 Flash | Direct REST integration, localized prompt grounding |
| **Background Scheduler**| node-cron 4.6.0 | Recurring 15-minute official IMD alert sync |
| **Web Frontend** | React 19.2.8, Vite 8.2.2, Tailwind CSS 3.4 | `react-leaflet`, `leaflet`, `lucide-react`, `recharts`, `canvas-confetti` |
| **Mobile Frontend** | React Native 0.86, Expo SDK 57 | Custom multi-screen navigation, background health sync |
| **Testing & Quality** | Node.js Native Test Runner (`node:test`) | 87 tests across unit, integration, system, edge-cases; `oxlint` |
