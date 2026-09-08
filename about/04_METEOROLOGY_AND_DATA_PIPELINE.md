# 04. Meteorology, NWP & Data Ingestion Pipeline

## 🌍 Overview of Meteorological Data Sources

WeatherGPT does not rely on a single third-party weather API. Instead, it aggregates, normalizes, and compares data from four distinct meteorological tiers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        METEOROLOGICAL TIERS                            │
├───────────────────────┬──────────────────────┬─────────────────────────┤
│ Tier 1: Global NWP    │ NOAA GFS (0.25°)     │ ECMWF-IFS (0.4°)        │
├───────────────────────┼──────────────────────┼─────────────────────────┤
│ Tier 2: Open Feeds    │ Open-Meteo Forecast  │ CAMS Air Quality        │
├───────────────────────┼──────────────────────┼─────────────────────────┤
│ Tier 3: National Inst │ IMD Warnings         │ IMD Ground Stations     │
├───────────────────────┼──────────────────────┼─────────────────────────┤
│ Tier 4: Space / GIS   │ ISRO MOSDAC INSAT    │ Flood Vulnerability GIS │
└───────────────────────┴──────────────────────┴─────────────────────────┘
```

---

## 🧮 Numerical Weather Prediction (NWP) Ensemble

### 1. The Global Models
- **ECMWF-IFS (European Centre for Medium-Range Weather Forecasts):** Globally recognized as the gold standard for atmospheric medium-range forecasts. Operates on a high-resolution grid.
- **NOAA GFS (Global Forecast System, USA):** Renowned open-access numerical model produced by the National Centers for Environmental Prediction (NCEP).

### 2. GRIB2 Binary Message Parsing (`@mattnucc/gribberish`)
Raw NWP model outputs are distributed in the WMO GRIB2 (General Regularly-distributed Information in Binary form) standard. WeatherGPT utilizes WebAssembly-accelerated parsing:

```javascript
// backend/src/services/weather/nwp/ecmwf/service.js
import { GribMessageFactory } from '@mattnucc/gribberish';

function parseMessage(buffer, param) {
  const factory = GribMessageFactory.fromBuffer(new Uint8Array(buffer));
  return factory.getMessage(factory.availableMessages[0]);
}
```

- **De-accumulation:** Many NWP fields (such as precipitation) are cumulative from model initialization time ($T_0$). The service de-accumulates step data to calculate step-by-step interval precipitation:
$$\Delta P_t = \max(0, P_t - P_{t-1})$$

---

### 3. Model Comparison & Agreement Algorithm (`modelComparisonService.js`)

When a user requests `/api/weather/compare?city=Pune`, the system aligns GFS and ECMWF forecast arrays by timestamp and evaluates their parametric spread:

#### Spread Formulas:
$$\Delta T = |T_{GFS} - T_{ECMWF}| \quad (^\circ\text{C})$$
$$\Delta P = |P_{GFS} - P_{ECMWF}| \quad (\text{mm})$$
$$\Delta W = |W_{GFS} - W_{ECMWF}| \quad (\text{km/h})$$

#### Spread Classification Matrix:
| Parameter | Low Spread (High Confidence) | Moderate Spread | High Spread (Uncertainty) |
| :--- | :--- | :--- | :--- |
| **Temperature** | $\le 1.0^\circ\text{C}$ | $1.0^\circ\text{C} - 3.0^\circ\text{C}$ | $> 3.0^\circ\text{C}$ |
| **Precipitation** | $\le 1.0\text{ mm}$ | $1.0\text{ mm} - 5.0\text{ mm}$ | $> 5.0\text{ mm}$ |
| **Wind Speed** | $\le 5.0\text{ km/h}$ | $5.0 - 10.0\text{ km/h}$ | $> 10.0\text{ km/h}$ |

#### Agreement Score Calculation:
The agreement score (0–100) measures how closely the models converge:
$$\text{Score} = 100 - (\text{Penalty}_T + \text{Penalty}_P + \text{Penalty}_W)$$
- **Score $\ge 90$:** `high` (Both models strongly agree; forecast is reliable).
- **Score $70–89$:** `moderate` (Minor discrepancies in cloud cover or timing).
- **Score $< 70$:** `low` (Significant divergence, such as one model predicting rain and the other clear skies; advisory flags added to UI).

---

## 🛰️ Open-Meteo High-Resolution Integration

Open-Meteo serves as the high-resolution primary provider for surface weather metrics:
- **Surface Weather:** Temperature ($2\text{m}$), apparent temperature ("feels like"), relative humidity, surface pressure, wind speed ($10\text{m}$) and gust speed, weather code (WMO 4677 interpretation).
- **Subsurface Agricultural Metrics:**
  - `soil_moisture_0_to_1cm` ($m^3/m^3$) – Topsoil moisture for germination and seed health.
  - `soil_temperature_0cm` ($^\circ\text{C}$) – Ground surface heat.
  - `et0_fao_evapotranspiration` ($\text{mm/day}$) – FAO Penman-Monteith reference evapotranspiration rate.
- **Air Quality & Atmospheric Chemistry:**
  - Ingestion of particulate matter ($\text{PM}_{2.5}, \text{PM}_{10}$), Carbon Monoxide ($\text{CO}$), Nitrogen Dioxide ($\text{NO}_2$), Sulphur Dioxide ($\text{SO}_2$), and Ozone ($O_3$).
  - Computation of European Air Quality Index (EAQI) and US AQI scale.
- **Hydrology & Marine Feeds:**
  - River discharge rates and flash flood risk indices.
  - Wave heights and swell periods for coastal regions.

---

## 🇮🇳 IMD (India Meteorological Department) Pipeline

### 1. Alert Warning Classification
The system syncs warnings directly matching the 4-tier IMD alert taxonomy:
- 🟢 **Green (No Warning):** Normal atmospheric conditions; no action required.
- 🟡 **Yellow (Watch / Be Updated):** Moderately bad weather likely; check updates.
- 🟠 **Orange (Alert / Be Prepared):** Severe weather expected; transport disruption possible.
- 🔴 **Red (Warning / Take Action):** Extremely severe weather; imminent risk to life and property.

### 2. Ground Station Locator (`imdStationLocator.js`)
- Contains coordinates of official surface weather stations across Indian states and union territories.
- Uses the **Haversine formula** to calculate great-circle distance between user coordinates $(\phi_1, \lambda_1)$ and station coordinates $(\phi_2, \lambda_2)$:
$$d = 2r \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
- Selects the closest reporting station for local ground truth calibration.

---

## 🌀 Satellite & Cyclone Tracking (MOSDAC / ISRO)

The `/api/satellite/cyclone-tracks` and `/api/satellite/layers` endpoints ingest satellite metadata and tropical storm data:

### Cyclone Categorization (North Indian Ocean Scale)
| Category | Sustained Winds (km/h) | Pressure Deficit |
| :--- | :--- | :--- |
| **Depression (D)** | $31 - 49$ | $\sim 3\text{ hPa}$ |
| **Deep Depression (DD)** | $50 - 61$ | $\sim 4.5\text{ hPa}$ |
| **Cyclonic Storm (CS)** | $62 - 88$ | $\sim 7\text{ hPa}$ |
| **Severe Cyclonic Storm (SCS)** | $89 - 117$ | $\sim 14\text{ hPa}$ |
| **Very Severe Cyclonic Storm (VSCS)** | $118 - 166$ | $\sim 25\text{ hPa}$ |
| **Extremely Severe Cyclonic Storm (ESCS)** | $167 - 221$ | $\sim 40\text{ hPa}$ |
| **Super Cyclonic Storm (SuCS)** | $\ge 222$ | $> 50\text{ hPa}$ |

The system stores historical waypoints, current eye position, and projected cone of uncertainty coordinates to render animated trajectories on Leaflet GIS maps.

---

## 📉 20-Year Historical Climate Analysis (`climateRoutes.js`)

Provides long-term climate shift analytics based on ERA5 reanalysis datasets:
1. **Decadal Temperature Anomaly ($\Delta T_{anomaly}$):**
   - Compares the baseline decade ($2000 - 2010$) against recent records ($2011 - 2025$).
   - Computes warming shifts for summer extremes and winter minimums.
2. **Precipitation Distribution Variance:**
   - Quantifies increases in short-duration extreme downpours vs total dry-spell days.
3. **Interactive Recharts Visualization:**
   - Renders historical temperature and rainfall distribution curves in `ClimateHistorical.jsx`.
