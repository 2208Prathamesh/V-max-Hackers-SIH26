# 🏙️ Urban Flash Flood & Drainage Inundation Vulnerability Index

> **Standard Compliance:** Rational Runoff Method ($Q = C \times I \times A$), NDMA Guidelines on Management of Urban Flooding (National Disaster Management Authority, India)  
> **Backend Service:** `backend/src/services/urban/urbanFloodService.js`  
> **Backend Controller & Routes:** `backend/src/controllers/urbanFloodController.js`, `backend/src/routes/urbanFloodRoutes.js`  
> **Frontend Integration:** `frontend/src/pages/DashboardPage.jsx`  
> **Data Sources:** Derived from Open-Meteo High-Resolution Precipitation Telemetry, Municipal Stormwater Drain Baselines

---

## 1. Executive Overview & Problem Context
Rapid and unplanned urbanization in India has dramatically altered hydrological catchments. High impermeability (asphalt, concrete, loss of urban water bodies) combined with British-era stormwater drains designed for only $15–25$ mm/hr of rain creates **catastrophic urban flash flooding** within 30 minutes of intense convective rainfall.

The **WeatherGPT Urban Flash Flood Engine** implements the **Rational Runoff Method** calibrated with city-specific terrain and drainage parameters for **20 major Indian metropolitan basins**, empowering municipal disaster managers (e.g. MCGM, BBMP, NDMC) and citizens with predictive drainage saturation and waterlogging depth intelligence.

---

## 2. Mathematical Hydrological Engine

### A. The Rational Runoff Method Equation
The engine computes total peak surface runoff discharge ($Q$) using:

$$Q = C \times I \times A \times \text{Elevation Risk Factor}$$

Where:
- **$C$ (Runoff Impermeability Coefficient)**: Proportion of rainfall that turns into surface runoff rather than infiltrating the soil ($0.0$ to $1.0$). Concrete Indian metros range from $0.71$ to $0.85$.
- **$I$ (Rainfall Intensity)**: Observed live or forecasted peak precipitation rate in millimeters per hour (mm/hr).
- **$A$ (Catchment Area)**: Normalized unit area ($1 \text{ km}^2$) for standard index comparability.
- **$\text{Elevation Risk Factor}$**: Multiplier ($1.1$ to $1.45$) capturing saucer-shaped topography, coastal high-tide locking, or low gradients that impede gravity discharge.

### B. Drainage Saturation Ratio ($S_r$)
Calculated by comparing computed surface runoff ($Q$) against the designed municipal drain carrying capacity ($D_{\text{cap}}$):

$$S_r = \frac{Q}{D_{\text{cap}}}$$

| Saturation Level | Saturation Ratio ($S_r$) | Color Badge | Hydrological Condition & Road Status |
| :--- | :--- | :--- | :--- |
| **Normal** | $S_r < 0.70$ | Green (`#22c55e`) | Inflow within drain capacity. Free-flowing drainage; no ponding. |
| **Advisory** | $0.70 \le S_r < 1.20$ | Yellow (`#eab308`) | Drains near 70–100% capacity. Minor surface ponding in low points. |
| **Severe** | $1.20 \le S_r < 2.00$ | Orange (`#f97316`) | Drains overwhelmed. Significant waterlogging in subways and underpasses. |
| **Critical Inundation**| $S_r \ge 2.00$ | Red (`#dc2626`) | Catastrophic deluge. Roads impassable. High risk of vehicular drowning. |

### C. Estimated Waterlogging Depth Formula
Predicts the expected standing water depth in centimeters for low-lying urban pockets:

$$\text{Depth}_{\text{waterlog}} (\text{cm}) = \begin{cases} 0 & \text{if } S_r \le 1.0 \\ (S_r - 1.0) \times D_{\text{cap}} \times 0.40 \times \text{Elevation Factor} & \text{if } S_r > 1.0 \end{cases}$$

- **$< 15$ cm**: Minor puddle ponding. Pedestrians and two-wheelers can traverse with care.
- **$15–30$ cm**: Two-wheelers stall. Pedestrians at risk of falling into open manholes.
- **$> 30$ cm**: Cars and low-chassis vehicles stall. Subways submerge; total traffic diversion mandatory.

### D. Citizen Commuter Route Waterlogging & Vehicle Stall Assessment
Provides hyper-local, actionable route guidance for everyday citizens navigating low-lying underpasses and arterial corridors during monsoons:
- **🛵 Two-Wheelers:** Assesses skid hazards and water ingestion into low-mounted exhaust pipes ($>10\text{ cm}$).
- **🚗 Hatchbacks & Low-Chassis Sedans:** Evaluates hydro-locking risks when air intake snorkels submerge ($>12\text{ cm}$).
- **🚌 SUVs & Public Transit Buses:** Determines safe wading depths up to $30\text{ cm}$ before requiring bypass diversion.
- **Hotspot Diagnosis:** Informs the commuter of the root infrastructure vulnerability (e.g., railway culvert constriction, river backflow, tidal lock).

### E. Speech-Synthesized Voice Advisories & Municipal Direct Dial
- **Voice TTS Broadcast:** Synthesizes audio emergency directives in local languages (`en-IN`, `hi-IN`, `mr-IN`, `bn-IN`, `ta-IN`, `te-IN`) for commuters on the road.
- **Rapid Action Helpline Directory:** Direct 1-click dial connection to municipal disaster cells across all 20 cities (e.g., MCGM 1916, BBMP 1533, NDMC 1077, GCC 1913), NDRF Control (1078), and National Emergency (112).

---

## 3. Comprehensive Indian Metro Basin Profiles (20 Cities)

The platform includes detailed empirical profiles for 20 flood-prone Indian cities:

| Metro City | State | Population | Runoff Coeff ($C$) | Drain Capacity ($D_{\text{cap}}$) | Elevation Factor | High-Vulnerability Hotspots & Failure Causes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Mumbai** | Maharashtra | 20.4M | 0.85 | 25 mm/hr | 1.30 | **Hindmata** (lowest rail junction), **Sion-Matunga** (Mithi basin), **Andheri Subway** |
| **Delhi** | NCT Delhi | 32.9M | 0.78 | 30 mm/hr | 1.10 | **Minto Bridge** (underpass trap), **ITO** (Yamuna flood plain), **Pul Prahladpur** |
| **Bengaluru** | Karnataka | 13.2M | 0.80 | 22 mm/hr | 1.15 | **Silk Board** (lake breach), **Outer Ring Road** (reclaimed lake beds), **Koramangala** |
| **Pune** | Maharashtra | 7.4M | 0.72 | 28 mm/hr | 1.20 | **Sinhagad Road** (Mutha river proximity), **Ambil Odha** (nallah encroachment) |
| **Chennai** | Tamil Nadu | 11.5M | 0.82 | 20 mm/hr | 1.35 | **Velachery** (Pallikaranai marsh loss), **T. Nagar** (zero soil absorption), **Adyar Basin** |
| **Kolkata** | West Bengal | 15.1M | 0.79 | 18 mm/hr | 1.40 | **Salt Lake** (wetland reclamation), **Behala** (Diamond Harbour Rd), **Ruby More** |
| **Hyderabad** | Telangana | 10.5M | 0.75 | 25 mm/hr | 1.20 | **Falaknuma** (Musi river backflow), **Tolichowki** (nala blockages), **Alwal Lake** |
| **Ahmedabad** | Gujarat | 8.4M | 0.78 | 24 mm/hr | 1.15 | **Akhbarnagar Subway** (deep railway trap), **Parimal Underpass**, **Mithakhali** |
| **Surat** | Gujarat | 6.9M | 0.82 | 20 mm/hr | 1.40 | **Adajan** (Tapi floodplain), **Varachha** (high concrete density), **Rander** |
| **Guwahati** | Assam | 1.2M | 0.80 | 18 mm/hr | 1.45 | **Anil Nagar & Nabin Nagar** (deepest city bowl), **Zoo Road**, **Maligaon Underpass** |
| **Patna** | Bihar | 2.5M | 0.77 | 16 mm/hr | 1.40 | **Rajendra Nagar** (saucer depression; 2019 deluge site), **Kankarbagh**, **Boring Canal** |
| **Kochi** | Kerala | 2.1M | 0.79 | 20 mm/hr | 1.35 | **MG Road & KSRTC Stand** (below high tide), **Edappally Toll**, **Kaloor Stadium** |
| **Nagpur** | Maharashtra | 2.9M | 0.73 | 26 mm/hr | 1.15 | **Narendra Nagar RUB** (rail underbridge fills in 20 mins), **Nag River Corridor** |
| **Nashik** | Maharashtra | 2.2M | 0.71 | 27 mm/hr | 1.20 | **Ramkund / Panchavati** (Godavari ghats flood during Gangapur dam discharge) |
| **Lucknow** | Uttar Pradesh | 3.8M | 0.76 | 22 mm/hr | 1.20 | **Charbagh Station Circle** (natural low basin), **Alambagh** (Haider Canal siltation) |
| **Srinagar** | Jammu & Kashmir | 1.6M | 0.74 | 18 mm/hr | 1.40 | **Rajbagh & Jawahar Nagar** (Jhelum flood plain), **Lal Chowk Bund**, **Bemina** |
| **Bhubaneswar** | Odisha | 1.2M | 0.76 | 22 mm/hr | 1.25 | **Acharya Vihar Underpass** (NH-16 flood trap), **ISKCON / Nayapalli**, **Bomikhal Canal** |
| **Jaipur** | Rajasthan | 4.1M | 0.72 | 26 mm/hr | 1.10 | **MI Road** (Aravalli rapid runoff), **Sanganer** (Dravyavati river flash basin) |
| **Indore** | Madhya Pradesh | 3.3M | 0.74 | 25 mm/hr | 1.15 | **Rajwada / Sarafa** (old city narrow drains), **Khan River Riverfront** |
| **Bhopal** | Madhya Pradesh | 2.4M | 0.73 | 24 mm/hr | 1.20 | **Karond Railway Underpass** (extreme slope depression), **MP Nagar Zone 2** |

---

## 4. REST API Reference

### `GET /api/v1/urban-flood`
Calculates real-time operational flash flood index and 6-hour forecast peak for any profiled Indian city from live atmospheric telemetry.

- **Query Parameters:**
  - `city` (string, e.g. `mumbai`, `ahmedabad`, `patna`)
  - `mode` (string, optional: `live` [default, real-time telemetry], `forecast` [next 6-hour storm peak], `monsoon_surge` [cloudburst baseline])
- **Sample Request:**
  ```bash
  curl -X GET "http://localhost:5000/api/v1/urban-flood?city=mumbai&mode=live"
  ```
- **Sample Response Payload:**
  ```json
  {
    "status": "success",
    "data": {
      "city": "Ahmedabad",
      "state": "Gujarat",
      "population": "8.4 million",
      "rainfallIntensityMmh": 45,
      "runoffCoefficient": 0.78,
      "drainageCapacityMmh": 24,
      "computedRunoff": 40.4,
      "saturationRatio": 1.68,
      "saturation": {
        "level": "Severe",
        "color": "#f97316",
        "icon": "🟠",
        "description": "Drainage capacity exceeded. Significant waterlogging in known hotspots. Avoid underpasses and low roads."
      },
      "vulnerabilityScore": 84,
      "estimatedWaterlogDepthCm": 26,
      "activeHotspots": [
        {
          "area": "Akhbarnagar Subway",
          "risk": "Critical",
          "reason": "Deep railway underpass prone to sudden 6-foot waterlogging"
        },
        {
          "area": "Parimal Underpass",
          "risk": "Critical",
          "reason": "Stormwater collection bowl, vehicular drowning trap"
        }
      ],
      "allHotspots": [
        { "area": "Akhbarnagar Subway", "risk": "Critical", "reason": "Deep railway underpass..." },
        { "area": "Parimal Underpass", "risk": "Critical", "reason": "Stormwater collection bowl..." },
        { "area": "Mithakhali Subway", "risk": "Severe", "reason": "Low gradient runoff funnel..." },
        { "area": "Vastrapur Lake Area", "risk": "Moderate", "reason": "Lake catchment overflow..." }
      ],
      "recommendations": [
        "⚠️ Avoid underpasses, subways, and low-lying roads.",
        "🚗 Do not attempt to drive through waterlogged areas. Turn around, don't drown.",
        "📱 Keep phone charged and monitor IMD / municipal alerts."
      ],
      "methodology": "Rational Runoff Method (Q = C × I × A × Elevation Risk Factor)"
    }
  }
  ```

### `GET /api/v1/urban-flood/cities`
Returns the complete list of 20 supported metropolitan profiles.

---

## 5. Verification & Test Coverage
- Unit test suite: `test/unit/sihAdvancedFeatures.test.js`
- Test cases:
  1. Rational Runoff computation for varying rainfall intensities ($15, 35, 65, 90$ mm/hr).
  2. Drainage saturation level and depth transitions (Normal $\to$ Advisory $\to$ Severe $\to$ Critical).
  3. City profiles registry integrity.
- Production build: Integrated directly into `DashboardPage.jsx` and verified with `npm run build --prefix frontend`.
