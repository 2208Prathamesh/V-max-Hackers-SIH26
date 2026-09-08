# 06. Frontend Web Architecture & UI Systems

## 🖥️ Architecture Overview

The WeatherGPT frontend is built with **React 19** and **Vite 8**, styled using **Tailwind CSS 3.4**, and enriched with **Leaflet GIS** and **Recharts**.

### Technology Stack:
- **Core Library:** React 19.2.8 (Hooks, Suspense, Concurrent rendering)
- **Build Engine:** Vite 8.2.2 (Fast HMR, optimized production rollup)
- **CSS Utility Engine:** Tailwind CSS 3.4.17 with PostCSS
- **GIS / Mapping:** Leaflet 1.9.4 & `react-leaflet` 5.0.0
- **Data Visualization:** Recharts 3.10.1 (SVG charts with responsive containers)
- **Icons:** `lucide-react` 1.41.0
- **Real-Time Client:** `socket.io-client` 4.8.3

---

## 🧭 State Management & Context System

The frontend adopts a centralized **React Context Architecture**, avoiding bulky third-party state managers while preserving state across navigation:

```
                      ┌──────────────────────┐
                      │    ThemeProvider     │
                      └──────────┬───────────┘
                                 │
                      ┌──────────▼───────────┐
                      │   LanguageProvider   │
                      └──────────┬───────────┘
                                 │
                      ┌──────────▼───────────┐
                      │   WeatherProvider    │
                      └──────────┬───────────┘
                                 │
                     ┌───────────▼───────────┐
                     │       AppContent      │
                     └───────────────────────┘
```

### 1. `WeatherContext.jsx` (Global App State)
Controls all core application state and actions:
- **Active Navigation:** `currentPage` (`'dashboard'`, `'chat'`, `'forecast'`, `'alerts'`, `'weather-map'`, `'advisory'`, `'climate-historical'`, `'saved-locations'`, `'history'`, `'settings'`, `'login'`).
- **User & Auth Session:** `user`, `isAuthenticated`, tokens stored in `localStorage`.
- **Weather & NWP Stores:** `weatherData`, `forecastData`, `weatherLoading`, `forecastLoading`.
- **Alerts & Real-Time Events:** `alerts`, `notifications`, active emergency broadcast state.
- **Location Context:** `selectedMapLocation`, `savedLocations`, GPS geolocation detection.
- **Modal Controllers:** `isAddLocationOpen`, `isAirQualityOpen`, `isEditProfileOpen`, `isForgotPasswordOpen`.

### 2. `LanguageContext.jsx` (147KB Multilingual Engine)
- Provides high-speed in-memory localization dictionaries across **6 languages**: English (`en`), Hindi (`hi`), Marathi (`mr`), Bengali (`bn`), Tamil (`ta`), and Telugu (`te`).
- Exposes translation helpers: `t(key)`, `translateCondition(code)`, `translateCity(name)`, `translateAlertTitle(title)`.

### 3. `ThemeContext.jsx` (Dynamic Theme Engine)
- Toggles between Dark Mode and Light Mode with persistence in `localStorage`.
- Applies class `dark` to the HTML root document for Tailwind dark variants.

---

## 📑 Page Breakdown (11 Core Screens)

```
┌───────────────────────────┬─────────────────────────────────────────────────────────┐
│ Page Component            │ Core Features & Capabilities                            │
├───────────────────────────┼─────────────────────────────────────────────────────────┤
│ 1. DashboardPage          │ Ultra-modern glassmorphic weather hub, night-adaptive    │
│                           │ visual engine (Moon & starry sky vs Sun based on real    │
│                           │ sunset/sunrise), real-time city switcher carousel,       │
│                           │ sunrise/sunset daylight tracker, NWP consensus badge,    │
│                           │ 24-hr interactive Recharts curve (Temp/Rain/Wind),       │
│                           │ 8-card precision telemetry matrix, 7-day range bars,     │
│                           │ and manual-scroll 'Do You know?' illustrated fact cards  │
│                           │ plus single-line social media platform channels bar.     │
├───────────────────────────┼─────────────────────────────────────────────────────────┤
│ 2. ChatPage               │ Conversational AI interface, multi-turn history,        │
│                           │ grounded metric chips, speech voice transcription.      │
├───────────────────────────┼─────────────────────────────────────────────────────────┤
│ 3. ForecastPage           │ Multi-model comparison (GFS vs ECMWF), agreement score, │
│                           │ spread analysis, Recharts temperature distribution.     │
├───────────────────────────┼─────────────────────────────────────────────────────────┤
│ 4. AlertsPage             │ Official IMD alerts feed (Red, Orange, Yellow, Green),  │
│                           │ district filters, hazard types, manual sync button.     │
├───────────────────────────┼─────────────────────────────────────────────────────────┤
│ 5. WeatherMapPage         │ Interactive Leaflet GIS, custom station divIcons,       │
│                           │ temp/rain/wind/clouds layers, flood zones, cyclone path.│
├───────────────────────────┼─────────────────────────────────────────────────────────┤
│ 6. ClimateHistorical      │ 20-year climate shift analysis, temperature anomalies,  │
│                           │ historical date picker, decadal rainfall trends.        │
├───────────────────────────┼─────────────────────────────────────────────────────────┤
│ 7. AdvisoryPage           │ Agro crop advisory (Cotton, Wheat, Rice, Sugarcane),    │
│                           │ soil moisture, spray window, disaster emergency guide.  │
├───────────────────────────┼─────────────────────────────────────────────────────────┤
│ 8. SavedLocationsPage     │ Add/delete favorite cities, set default home station,   │
│                           │ multi-city weather card comparison.                     │
├───────────────────────────┼─────────────────────────────────────────────────────────┤
│ 9. HistoryPage            │ Archived conversation queries and past weather lookups. │
├───────────────────────────┼─────────────────────────────────────────────────────────┤
│ 10. SettingsPage          │ Units (°C/°F, km/h, mm), notification toggles, language,│
│                           │ security password change, account management.           │
├───────────────────────────┼─────────────────────────────────────────────────────────┤
│ 11. LoginPage             │ Glassmorphic login & register screen, demo quick-access │
│                           │ buttons for standard and disaster authority roles.      │
└───────────────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 🗺️ GIS Mapping System (`WeatherMapPage.jsx`)

The mapping engine is built using **Leaflet** and **React-Leaflet**:
- **Smooth Viewport Fly-To (`MapController`):** When a user selects a new city or clicks "Locate Me", the map dynamically flies to the coordinates (`map.flyTo([lat, lng], zoom, { duration: 1.2 })`).
- **Dynamic Station divIcons (`createStationIcon`):** Converts numeric meteorological metrics into colored pill badges (e.g. Red for $\ge 35^\circ\text{C}$, Amber for $28–34^\circ\text{C}$, Emerald for $20–27^\circ\text{C}$, Blue for $< 20^\circ\text{C}$).
- **Thematic Layer Switcher:**
  - `Temperature (°C)`
  - `Precipitation (mm)`
  - `Wind Speed (km/h)`
  - `Cloud Cover (%)`
  - `Active Alert Zones (GeoJSON polygons)`
  - `Flood Risk Vulnerability (GeoJSON)`
  - `Cyclone Trajectories & Forecast Cones`

---

## 🚨 Emergency Broadcast Banner (`EmergencyBroadcastBanner.jsx`)

When an active IMD **Red** or **Orange** alert is detected for the user's current or saved location:
1. A prominent banner displays across the top of the interface.
2. Displays the issuing authority (IMD / NDMA), alert severity badge, affected districts, and recommended actions.
3. Includes an optional audio chime and a quick link to disaster helplines.

---

## ⚡ Client-Side Performance & Request Deduplication (`api.js`)

To prevent API flooding and provide instantaneous navigation:
1. **In-Memory Cache Map:** Stores GET responses with TTLs (2 mins general / 30 secs alerts).
2. **Concurrent Request Deduplication:** If three different dashboard widgets request the current weather simultaneously, `api.js` intercepts the requests:
```javascript
// In-flight deduplication
if (inflight.has(cacheKey)) {
  return inflight.get(cacheKey);
}
const fetchPromise = (async () => { /* network call */ })();
inflight.set(cacheKey, fetchPromise);
```
3. **Optimistic UI Updates:** State toggles (like marking notifications as read or saving locations) update the UI immediately while syncing in the background.
