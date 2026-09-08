# 07. Mobile Application Architecture (Expo & React Native)

## 📱 Mobile Architecture Overview

The `mobile/` directory contains a cross-platform mobile application built using **Expo SDK 57** and **React Native 0.86**. It provides native Android and iOS compatibility alongside web deployment via React Native Web.

### Technology Stack:
- **Framework:** Expo `~57.0.17`
- **Native Engine:** React Native `0.86.3`
- **Component Model:** React `19.2.3`
- **Web Export:** `react-native-web` `^0.21.2`
- **Status Bar:** `expo-status-bar` `~57.0.1`

---

## 📂 Mobile Directory Structure

```
mobile/
├── App.js                     # Mobile app entry point, navigation state & heartbeat
├── app.json                   # Expo project metadata & bundle identifiers
├── package.json               # Mobile dependency manifest
└── src/
    ├── components/            # Reusable UI primitives (Header, Sidebar, Cards)
    ├── data/                  # Offline fallback data & mock seed constants
    ├── screens/               # 15 complete screen views
    ├── services/              # Mobile API client with auto-heartbeat
    └── theme/                 # Dynamic light & dark mode theme tokens
```

---

## 📱 Screen Inventory (15 Dedicated Screens)

```
┌───────────────────────────────┬─────────────────────────────────────────────────────────┐
│ Screen Name                   │ Purpose & Capabilities                                  │
├───────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 1. DashboardScreen.js         │ Live weather metrics, apparent temp, quick hourly cards,│
│                               │ daily forecasts, and air quality indicators.            │
├───────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 2. ChatScreen.js              │ Mobile conversational AI interface with speech voice    │
│                               │ input and rich grounded weather response bubbles.       │
├───────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 3. WeatherMapScreen.js        │ Interactive mobile weather map, station pins,           │
│                               │ layer toggles (temp, rain, wind, alerts).               │
├───────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 4. AlertsScreen.js            │ IMD severe weather warnings feed, color badges          │
│                               │ (Red, Orange, Yellow), filter by hazard severity.       │
├───────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 5. AlertDetailsScreen.js      │ Detailed emergency breakdown, instructions, and         │
│                               │ affected district lists for a chosen alert.             │
├───────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 6. ForecastScreen.js          │ Multi-day detailed forecast with precipitation chances, │
│                               │ humidity gradients, and wind speed trends.              │
├───────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 7. AirQualityScreen.js        │ Detailed AQI breakdown: PM2.5, PM10, CO, NO2, SO2,      │
│                               │ and outdoor activity recommendations.                   │
├───────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 8. SavedLocationsScreen.js    │ Manage favorite locations with swipe/touch actions.     │
├───────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 9. AddLocationScreen.js       │ City search and geocoding screen to add new locations.  │
├───────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 10. CompareLocationsScreen.js │ Side-by-side weather metric comparison between 2 cities.│
├───────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 11. HistoryScreen.js          │ Log of previous user chat conversations and queries.    │
├───────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 12. SettingsScreen.js         │ Units (°C/°F), language selector, notification toggles. │
├───────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 13. ProfileScreen.js          │ User account details, role badge, and session controls. │
├───────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 14. LoginScreen.js            │ Mobile authentication screen with demo account buttons. │
├───────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 15. PremiumScreen.js          │ Extended radar and satellite imagery subscription view. │
└───────────────────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 🔄 Backend Liveness & Offline Resilience (`mobile/src/services/api.js`)

Mobile devices routinely experience intermittent network connections. The mobile app implements continuous connection sensing:

```javascript
// mobile/App.js
useEffect(() => {
  const checkBackend = async () => {
    try {
      await api.health();
      setBackendReady(true);
    } catch {
      setBackendReady(false);
    }
  };

  checkBackend();
  const interval = setInterval(checkBackend, 5000);
  return () => clearInterval(interval);
}, []);
```

### Fallback Behavior:
- **Connected Mode:** When the Express backend is detected, all screens query the live REST APIs (`/api/weather`, `/api/alerts`, `/api/messages`).
- **Offline / Disconnected Mode:** If the server is unreachable, the client falls back to bundled datasets in `src/data/mockData.js`, ensuring zero crashes and continuous UI usability during disaster field conditions.
