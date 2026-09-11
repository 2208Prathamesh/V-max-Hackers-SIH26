# Mobile Application Demo & Fallback Data Reference Guide

> **Location:** `mobile/demo_fallback.md`  
> **Purpose:** Comprehensive registry of all screens in the mobile application where fallback / demo data is implemented. Use this file as a roadmap to hook up production APIs, database collections, and IoT sensor streams.

---

## 1. Summary of All Mobile Screens

All screens in the sidebar and navigation drawer are 100% accessible to all users (Citizens, Responders, Farmers, and Administrators) without authentication barriers or crash errors.

| Screen Name | File Path | API Endpoint | Fallback Mode Active |
|---|---|---|---|
| **Dashboard** | `mobile/src/screens/DashboardScreen.js` | `GET /api/weather`, `GET /api/forecast` | Automatic 7-day rolling local snapshot + memoized defaults |
| **Doppler Radar Map** | `mobile/src/screens/WeatherMapScreen.js` | Embedded Leaflet Web/Mobile WebView + `GET /api/weather` | 24 Indian Reference Stations with bi-directional postMessage bridge & RainViewer/ESRI layers |
| **Disaster Bulletins** | `mobile/src/screens/AlertsScreen.js` | `GET /api/alerts/active`, `GET /api/alerts` | `DEFAULT_IMD_ALERTS` (Red, Orange, Yellow CAP v1.2 alerts) |
| **WeatherGPT AI** | `mobile/src/screens/ChatScreen.js` | `POST /api/chat/message` | Offline Convective & Boundary Layer reasoning generator |
| **Aviation METAR** | `mobile/src/screens/AviationScreen.js` | `GET /api/aviation/briefing/:icao` | 6 Major Airports (`VABB`, `VIDP`, `VOBL`, `VOMM`, `VAPO`, `VECC`) + Runway vectors |
| **Marine & Coastal** | `mobile/src/screens/MarineScreen.js` | `GET /api/marine/coastal/:stationId` | 10 Port Trust Stations + Beaufort Force 3 metrics |
| **Urban Flash Flood** | `mobile/src/screens/UrbanFloodScreen.js` | `GET /api/urban-flood?city=...` | 6 Metros (Mumbai, Pune, Bengaluru, Delhi, Chennai, Kolkata) + 6-hr Hydrograph |
| **Air Quality Index** | `mobile/src/screens/AirQualityScreen.js` | `GET /api/weather?city=...` | 8 CPCB Air Quality Monitoring Stations + 24-hr Diurnal Trend |
| **7-Day NWP Forecast** | `mobile/src/screens/ForecastScreen.js` | `GET /api/forecast?city=...` | Multi-Model ECMWF/GFS Consensus generator |
| **Compare Cities** | `mobile/src/screens/CompareLocationsScreen.js` | `GET /api/weather?city=...` | 10 Station Comparison Matrix + Visual Gradient Differential |
| **Saved Locations** | `mobile/src/screens/SavedLocationsScreen.js` | `GET /api/locations` | `DEFAULT_SAVED_LOCATIONS` (Pune, Mumbai, Delhi, Bengaluru) |
| **7-Day Offline Archive** | `mobile/src/screens/HistoryScreen.js` | Local SQLite/AsyncStorage + `/api/chat` | Synthetic 7-Day Snapshots + Synoptic Bar Chart |
| **System Settings** | `mobile/src/screens/SettingsScreen.js` | Local Preferences + `/api/user/settings` | Offline units, theme, and language toggles |
| **Emergency Advisory** | `mobile/src/screens/AlertDetailsScreen.js` | `GET /api/alerts/active` | High-priority CAP v1.2 fallback advisory |
| **Add Location** | `mobile/src/screens/AddLocationScreen.js` | `GET /api/locations/search` | 8 Popular Indian Meteorological Stations |
| **WeatherGPT Pro** | `mobile/src/screens/PremiumScreen.js` | Local entitlements | 6 Pro capability cards |
| **My Profile** | `mobile/src/screens/ProfileScreen.js` | `GET /api/user/profile` | Fallback user profile credentials |

---

## 2. Screen-by-Screen Fallback Data Structures & Integration Notes

### A. Urban Flash Flood Screen (`UrbanFloodScreen.js`)
- **File:** [`mobile/src/screens/UrbanFloodScreen.js`](file:///c:/Users/barbo/Desktop/SIH/new%20sih/V-max-Hackers-SIH26/mobile/src/screens/UrbanFloodScreen.js)
- **Endpoint:** `GET /api/urban-flood?city={cityName}`
- **Fallback Data Objects:**
  1. `HOTSPOTS_FALLBACK`: Contains micro-inundation hotspots for **Mumbai**, **Pune**, **Bengaluru**, **Delhi**, **Chennai**, and **Kolkata** with status (`CRITICAL`, `CLOSED`, `HIGH`, `MODERATE`, `CLEAR`), estimated water depth in cm, and road transit detour advice.
  2. `HYDROGRAPH_FALLBACK`: 6-hour time-series of rainfall intensity (mm/hr) and inundation runoff depth (cm).
  3. `transitClearance`: Evaluates accessibility for Pedestrians, Two Wheelers, Low Sedans, and Heavy Transit / SUVs based on current water depth.
- **Future Integration Task:**
  Connect to Municipal SCADA telemetry or CWC flood gauges. Return JSON matching:
  ```json
  {
    "city": "Mumbai",
    "saturationLevelPct": 82,
    "saturationStatus": "CRITICAL SATURATION",
    "estimatedRunoffDepthCm": 38,
    "drainageCapacityScore": 4.2,
    "status": "RED ALERT",
    "hotspots": [
      { "name": "Hindmata Junction", "status": "CRITICAL", "depthCm": 45, "advice": "Avoid underpass" }
    ],
    "hydrograph": [
      { "time": "12:00", "rainfallMm": 34, "runoffCm": 38 }
    ],
    "recommendations": ["Pumps active at 100%"]
  }
  ```

---

### B. Air Quality Index Screen (`AirQualityScreen.js`)
- **File:** [`mobile/src/screens/AirQualityScreen.js`](file:///c:/Users/barbo/Desktop/SIH/new%20sih/V-max-Hackers-SIH26/mobile/src/screens/AirQualityScreen.js)
- **Endpoint:** `GET /api/weather?city={cityName}` (under `airQuality` field)
- **Fallback Data Objects:**
  1. Default AQI `55` (Moderate).
  2. Pollutants fallback:
     - `PM2.5`: `26 µg/m³`
     - `PM10`: `30 µg/m³`
     - `NO₂`: `16 ppb`
     - `SO₂`: `24 ppb`
     - `O₃`: `48 ppb`
     - `CO`: `159 ppb`
  3. `hourlyAqiTrend`: 6 temporal checkpoints (02:00, 06:00, 10:00, 14:00, 18:00, 22:00) with dynamic category colors.
- **Future Integration Task:**
  Hook into CPCB / Open-Meteo Air Quality API: `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=...&longitude=...&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi`.

---

### C. Disaster Bulletins & Alerts (`AlertsScreen.js`)
- **File:** [`mobile/src/screens/AlertsScreen.js`](file:///c:/Users/barbo/Desktop/SIH/new%20sih/V-max-Hackers-SIH26/mobile/src/screens/AlertsScreen.js)
- **Endpoints:** `GET /api/alerts/active`, `GET /api/alerts`
- **Fallback Data Objects:**
  `DEFAULT_IMD_ALERTS`:
  - **Red Alert (Severe):** Extremely Heavy Rainfall & Flash Flood Red Warning for Konkan Coast.
  - **Orange Alert:** Severe Heatwave & Convective Squall Advisory for Vidarbha & Marathwada.
  - **Yellow Alert:** Squall Line & Lightning Thunderstorm Watch for Western Ghats Catchment.
- **Future Integration Task:**
  Ensure backend `/api/alerts/active` pulls from IMD RSS / CAP feed (`https://sachet.ndma.gov.in/cap_feed/`).

---

### D. Aviation METAR Screen (`AviationScreen.js`)
- **File:** [`mobile/src/screens/AviationScreen.js`](file:///c:/Users/barbo/Desktop/SIH/new%20sih/V-max-Hackers-SIH26/mobile/src/screens/AviationScreen.js)
- **Endpoint:** `GET /api/aviation/briefing/:icao`
- **Fallback Data Objects:**
  - `AIRPORTS`: 6 standard Indian aerodromes (`VABB` Mumbai, `VIDP` Delhi, `VOBL` Bengaluru, `VOMM` Chennai, `VAPO` Pune, `VECC` Kolkata).
  - Synthetic METAR string: `${selectedIcao} 110200Z 28012KT 6000 FEW025 BKN080 28/22 Q1011 NOSIG`.
  - Trigonometric runway crosswind/headwind vector calculation: `normHeadwind`, `normCrosswind`.
- **Future Integration Task:**
  Connect to NOAA Aviation Weather Center (`https://aviationweather.gov/api/data/metar?ids={ICAO}&format=json`).

---

### E. Marine & Coastal Screen (`MarineScreen.js`)
- **File:** [`mobile/src/screens/MarineScreen.js`](file:///c:/Users/barbo/Desktop/SIH/new%20sih/V-max-Hackers-SIH26/mobile/src/screens/MarineScreen.js)
- **Endpoint:** `GET /api/marine/coastal/:stationId`
- **Fallback Data Objects:**
  - `STATIONS`: 10 major ports (Mumbai, Kandla, JNPT, Ratnagiri, Mormugao, Mangalore, Kochi, Chennai, Visakhapatnam, Paradip).
  - Fallback sea metrics: Wave height `0.8 m`, Swell period `7 sec`, Sea surface temp `29°C`, Tide `Ebb Tide`, Beaufort `Force 3 (Gentle Breeze)`.
- **Future Integration Task:**
  Hook into INCOIS (Indian National Centre for Ocean Information Services) Marine Ocean State Forecasts (`https://incois.gov.in/portal/osf/osf.jsp`).

---

### F. Compare Locations Screen (`CompareLocationsScreen.js`)
- **File:** [`mobile/src/screens/CompareLocationsScreen.js`](file:///c:/Users/barbo/Desktop/SIH/new%20sih/V-max-Hackers-SIH26/mobile/src/screens/CompareLocationsScreen.js)
- **Endpoint:** `GET /api/weather?city={cityName}`
- **Fallback Data Objects:**
  - `COMPARISON_STATIONS`: 10 preconfigured Indian cities.
  - Fallback metrics: `temp1: 27°C`, `temp2: 28°C`, `hum1: 70%`, `hum2: 75%`, `wind1: 14 km/h`, `wind2: 18 km/h`, `pres1: 1008 hPa`, `pres2: 1006 hPa`.
  - **Visual Gradient Differential:** Renders side-by-side proportional comparison bars with delta callouts (`+2°C warmer`, `+5% higher humidity`).

---

### G. Saved Locations Screen (`SavedLocationsScreen.js`)
- **File:** [`mobile/src/screens/SavedLocationsScreen.js`](file:///c:/Users/barbo/Desktop/SIH/new%20sih/V-max-Hackers-SIH26/mobile/src/screens/SavedLocationsScreen.js)
- **Endpoints:** `GET /api/locations`, `POST /api/locations`, `DELETE /api/locations/:id`
- **Fallback Data Objects:**
  `DEFAULT_SAVED_LOCATIONS`: Pre-seeds **Pune**, **Mumbai**, **New Delhi**, and **Bengaluru** with live condition telemetry so new users and offline visitors immediately see rich cards rather than a blank state.

---

### H. 7-Day Offline Archive Screen (`HistoryScreen.js`)
- **File:** [`mobile/src/screens/HistoryScreen.js`](file:///c:/Users/barbo/Desktop/SIH/new%20sih/V-max-Hackers-SIH26/mobile/src/screens/HistoryScreen.js)
- **Storage:** Local AsyncStorage / SQLite cache via `offlineStorage.get7DayHistory(cityName)`.
- **Fallback Data Objects:**
  - `generateFallback7Day(cityName)`: Generates 7 sequential daily meteorological records with realistic variance in temperature, humidity, rain probability, pressure, and AQI.
  - `DEFAULT_CONVERSATIONS`: 3 synthetic meteorological consultation conversations.
  - **7-Day Synoptic Bar Chart:** Visualizes historical mean and daily temperatures across the 7-day window.

---

### I. Doppler Radar Map Screen (`WeatherMapScreen.js`)
- **File:** [`mobile/src/screens/WeatherMapScreen.js`](file:///c:/Users/barbo/Desktop/SIH/new%20sih/V-max-Hackers-SIH26/mobile/src/screens/WeatherMapScreen.js)
- **Renderer:** Web Leaflet Map on Web, plus Native Doppler Radar Telemetry Canvas with 16 reference stations and live radar sweep badge on mobile native.
