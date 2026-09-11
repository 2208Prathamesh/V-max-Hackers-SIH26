# ✈️ Aviation Aerodrome Meteorological & Runway Crosswind Intelligence System

> **Standard Compliance:** ICAO Annex 3 (*Meteorological Service for International Air Navigation*), FAA AC 00-45H, DGCA India Flight Operations Circulars  
> **Backend Service:** `backend/src/services/aviation/aviationService.js`  
> **Backend Controller & Routes:** `backend/src/controllers/aviationController.js`, `backend/src/routes/aviationRoutes.js`  
> **Frontend Module:** `frontend/src/pages/AviationPage.jsx` (`/aviation`)  
> **Data Sources:** NOAA Aviation Weather Center (Live METAR/TAF API), Open-Meteo, Algorithmic Runway Trigonometry

---

## 1. Executive Overview & Problem Context
Civil aviation and military flight operations require instantaneous, high-precision aerodrome weather conditions before aircraft departure, approach, or landing. Weather-related flight disruptions (crosswind exceedance, convective cumulonimbus activity, low visibility, microbursts) account for significant flight delays and safety hazards across Indian airspace.

The **WeatherGPT Aviation Engine** delivers industrial-grade aerodrome intelligence at **zero budget** by connecting directly to the NOAA Aviation Weather Center and decoding live METAR (Meteorological Aerodrome Report) and TAF (Terminal Aerodrome Forecast) messages into operational dispatch metrics.

---

## 2. Core Functional Capabilities

### A. ICAO Flight Rules Classification (VFR / MVFR / IFR / LIFR)
Computes instantaneous operational flight category using dual-threshold ceiling and visibility gating:

| Category | Color | Ceiling (AGL) | Visibility | Operational Dispatch Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **VFR** (Visual Flight Rules) | Green (`#22c55e`) | $> 3,000$ ft | $> 5$ SM ($> 8,000$ m) | Visual approaches permitted without ATC radar vectoring. |
| **MVFR** (Marginal VFR) | Cyan/Blue (`#0284c7`) | $1,000–3,000$ ft | $3–5$ SM ($4,800–8,000$ m) | Visual approach permitted with ATC terrain separation caution. |
| **IFR** (Instrument Flight Rules) | Orange/Red (`#e11d48`) | $500–999$ ft | $1–2.99$ SM ($1,600–4,800$ m) | Mandatory ILS/RNAV instrument approach. Non-instrument craft grounded. |
| **LIFR** (Low IFR) | Purple (`#9333ea`) | $< 500$ ft | $< 1$ SM ($< 1,600$ m) | CAT II / CAT III ILS autoland required. High risk of diversion. |

### B. Runway Crosswind & Headwind Decomposition Matrix
Aircraft takeoffs and landings are limited by maximum demonstrated crosswind and tailwind components. The system calculates crosswind and headwind components across all physical runway orientations for each aerodrome using exact trigonometric decomposition:

$$\theta = |\text{Wind Direction} - \text{Runway Heading}| \pmod{360}$$
$$\text{Effective Angle} = \begin{cases} 360 - \theta & \text{if } \theta > 180^\circ \\ \theta & \text{otherwise} \end{cases}$$
$$\text{Crosswind Component} = V_{\text{wind}} \times |\sin(\text{Effective Angle})|$$
$$\text{Longitudinal Component} = V_{\text{wind}} \times \cos(\text{Effective Angle})$$

- If $\text{Longitudinal Component} \ge 0$, it is a **Headwind**.
- If $\text{Longitudinal Component} < 0$, it is a **Tailwind** (flagged as caution if $>10$ kt).
- **DGCA Safety Thresholds:**
  - $\le 15$ knots: Normal Operations (Green)
  - $16–20$ knots: Crosswind Advisory (Amber)
  - $> 20$ knots: Hazardous Crosswind / Exceedance Alert (Red)

### C. Emergency Disaster Airlift & Rescue Airfield Readiness Matrix (NDRF / IAF / Air Ambulance)
Operational flight readiness status designed specifically for disaster management coordinators, Indian Air Force relief transport, and civil air ambulance operations:
1. **🚁 Search & Rescue Helicopters (Heli-SAR / Winching):** Evaluates low-altitude hoist envelope for Mi-17, ALH Dhruv, and Chetak helicopters (wind $\le 25$ kt, visibility $\ge 1,500$ m, ceiling $\ge 500$ ft AGL, and absence of convective CB cells).
2. **🚑 Air Ambulance & Medical Evacuation (Medevac):** Evaluates critical patient transport approach minimums (VFR vs IFR precision ILS Cat I/II requirements).
3. **📦 Heavy Disaster Relief Cargo Sorties (C-130J / AN-32 / Civilian Evacuation):** Evaluates favored physical runway crosswind envelope ($\le 20$ kt) and wet runway braking distance.

### D. Vertical Atmospheric Cloud Stratification Ladder
Decodes METAR cloud coverage codes (`FEW`, `SCT`, `BKN`, `OVC`) and bases (in hundreds of feet AGL up to Flight Level FL100). Automatically flags convective hazardous cloud types:
- `CB`: Cumulonimbus (Severe updrafts, icing, lightning, microburst risk)
- `TCU`: Towering Cumulus (Developing thunderstorm cells)

### E. DGCA Drone / UAV Pilot Weather Clearance HUD (The Drone Rules 2021)
Statutory compliance assessment for commercial, agricultural, and recreational Remotely Piloted Aircraft Systems (RPAS) under DGCA Civil Aviation Requirements (CAR) Section 3, Series X, Part I:
- **Wind Speed Gate:** $\le 15\text{ kt}$ ($28\text{ km/h}$) max allowable limit.
- **Flight Visibility:** Minimum $3,000\text{ m}$ for Visual Line of Sight (VLOS) operations.
- **Cloud Ceiling:** Mandatory sub-cloud clearance up to the legal ceiling of $400\text{ ft AGL}$ ($120\text{ m}$).
- **Precipitation:** Zero tolerance for convective cells, thunderstorms (CB), or heavy rain.
- **Verdicts:** `🟢 PERMITTED TO FLY`, `🟡 CAUTION: LOW ALTITUDE ONLY`, or `🔴 NO-FLY WEATHER HOLD`.

### F. Emergency Diversion & Nearest Alternate Aerodromes Matrix (ICAO Annex 6)
Calculates real-time great-circle nautical distance (NM) and ground distance (km) between the selected aerodrome and all 33 other catalog hubs using the Haversine formula. Automatically ranks the top 4 closest emergency diversion aerodromes with 1-click transition to inspect their runways and METAR.

---

## 3. Comprehensive Indian Aerodrome Directory (34 National Hubs)

The engine monitors 34 high-density commercial, defense, and island hubs across all regions of India:

| Region | ICAO | IATA | Aerodrome Name | City / State | Elevation | Primary Runways |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **West** | `VABB` | BOM | Chhatrapati Shivaji Maharaj Intl | Mumbai, MH | 39 ft (12 m) | `09/27` (090°), `14/32` (140°) |
| **North** | `VIDP` | DEL | Indira Gandhi International | Delhi, DL | 777 ft (237 m) | `09/27`, `10/28`, `11/29` |
| **South** | `VOBL` | BLR | Kempegowda International | Bengaluru, KA | 3,000 ft (915 m) | `09L/27R`, `09R/27L` |
| **South** | `VOMM` | MAA | Chennai International | Chennai, TN | 52 ft (16 m) | `07/25` (070°), `12/30` (120°) |
| **East** | `VECC` | CCU | Netaji Subhas Chandra Bose Intl | Kolkata, WB | 16 ft (5 m) | `01L/19R`, `01R/19L` |
| **West** | `VAPO` | PNQ | Pune Lohegaon Airport & IAF Stn | Pune, MH | 1,942 ft (592 m) | `10/28` (100°), `14/32` (140°) |
| **South** | `VOHS` | HYD | Rajiv Gandhi International | Hyderabad, TS | 2,024 ft (617 m) | `09L/27R`, `09R/27L` |
| **West** | `VAAH` | AMD | Sardar Vallabhbhai Patel Intl | Ahmedabad, GJ | 189 ft (58 m) | `05/23` (050°) |
| **North** | `VIJP` | JAI | Jaipur International | Jaipur, RJ | 1,263 ft (385 m) | `09/27` (090°), `15/33` (150°) |
| **North** | `VILK` | LKO | Chaudhary Charan Singh Intl | Lucknow, UP | 405 ft (123 m) | `09/27` (090°) |
| **North-East** | `VEGT` | GAU | Lokpriya Gopinath Bordoloi Intl | Guwahati, AS | 162 ft (49 m) | `02/20` (020°) |
| **North** | `VISR` | SXR | Sheikh ul-Alam International | Srinagar, JK | 5,430 ft (1,655 m) | `13/31` (130°) |
| **South** | `VOCI` | COK | Cochin International | Kochi, KL | 30 ft (9 m) | `09/27` (090°) |
| **South** | `VOTV` | TRV | Thiruvananthapuram Intl | Trivandrum, KL | 15 ft (5 m) | `14/32` (140°) |
| **South** | `VOCL` | CCJ | Calicut International | Kozhikode, KL | 342 ft (104 m) | `10/28` (100°) |
| **South** | `VOML` | IXE | Mangalore International | Mangalore, KA | 336 ft (102 m) | `06/24` (060°), `09/27` (090°) |
| **South** | `VOCB` | CJB | Coimbatore International | Coimbatore, TN | 1,320 ft (402 m) | `05/23` (050°) |
| **South** | `VOMD` | IXM | Madurai International | Madurai, TN | 461 ft (141 m) | `09/27` (090°) |
| **South** | `VOVZ` | VTZ | Visakhapatnam (INS Dega) | Visakhapatnam, AP | 17 ft (5 m) | `10/28` (100°), `05/23` (050°) |
| **East** | `VEBS` | BBI | Biju Patnaik International | Bhubaneswar, OD | 146 ft (45 m) | `14/32` (140°), `05/23` (050°) |
| **East** | `VEPT` | PAT | Jayprakash Narayan Intl | Patna, BR | 170 ft (52 m) | `07/25` (070°) |
| **North** | `VEBN` | VNS | Lal Bahadur Shastri Intl | Varanasi, UP | 266 ft (81 m) | `09/27` (090°) |
| **North** | `VIAR` | ATQ | Sri Guru Ram Dass Jee Intl | Amritsar, PB | 756 ft (230 m) | `16/34` (160°) |
| **North** | `VICG` | IXC | Shaheed Bhagat Singh Intl | Chandigarh, CH | 1,012 ft (308 m) | `11/29` (110°) |
| **Central** | `VAID` | IDR | Devi Ahilyabai Holkar Intl | Indore, MP | 1,850 ft (564 m) | `07/25` (070°) |
| **Central** | `VABP` | BHO | Raja Bhoj International | Bhopal, MP | 1,720 ft (524 m) | `12/30` (120°) |
| **Central** | `VANP` | NAG | Dr. Babasaheb Ambedkar Intl | Nagpur, MH | 1,033 ft (315 m) | `14/32` (140°), `09/27` (090°) |
| **West** | `VASU` | STV | Surat International | Surat, GJ | 16 ft (5 m) | `04/22` (040°) |
| **West** | `VABO` | BDQ | Vadodara Civil Aerodrome | Vadodara, GJ | 129 ft (39 m) | `04/22` (040°) |
| **Islands** | `VOPB` | IXZ | Veer Savarkar International | Port Blair, AN | 53 ft (16 m) | `04/22` (040°) |
| **North** | `VILH` | IXL | Kushok Bakula Rimpochee | Leh, Ladakh | 10,682 ft (3,256 m) | `07/25` (070°) |
| **West** | `VOGO` | GOX | Manohar International (Mopa) | Goa (Mopa), GA | 558 ft (170 m) | `09/27` (090°) |
| **West** | `VAGO` | GOI | Dabolim Airport (INS Hansa) | Goa (Dabolim), GA | 184 ft (56 m) | `08/26` (080°) |
| **West** | `VAJJ` | IXU | Chhatrapati Sambhajinagar | Aurangabad, MH | 1,909 ft (582 m) | `09/27` (090°) |

---

## 4. REST API Reference

### `GET /api/v1/aviation/briefing/:icao`
Fetches parsed METAR telemetry, crosswind decomposition across all runways, favored runway analysis, raw TAF, and operational flight rules.

- **URL Parameter:** `icao` (string, 4-letter ICAO code, e.g. `VABB`, `VIDP`)
- **Sample Request:**
  ```bash
  curl -X GET http://localhost:5000/api/v1/aviation/briefing/VABB
  ```
- **Sample Response Payload:**
  ```json
  {
    "status": "success",
    "data": {
      "icao": "VABB",
      "airport": "Chhatrapati Shivaji Maharaj International Airport",
      "city": "Mumbai",
      "state": "Maharashtra",
      "flightRules": "VFR",
      "rawMetar": "VABB 101200Z 24012KT 6000 FEW020 BKN080 29/24 Q1008 NOSIG",
      "rawTaf": "TAF VABB 101100Z 1012/1118 25010KT 6000 SCT025...",
      "decoded": {
        "station": "VABB",
        "observationTime": "101200Z",
        "wind": { "direction": 240, "speed": 12, "gust": null, "unit": "kt", "variable": false },
        "visibility": { "value": 6000, "unit": "m" },
        "clouds": [
          { "coverage": "FEW", "base": 2000, "type": null },
          { "coverage": "BKN", "base": 8000, "type": null }
        ],
        "temperature": 29,
        "dewpoint": 24,
        "pressure": { "qnh": 1008, "unit": "hPa" },
        "ceilingFt": 8000
      },
      "runwayAnalysis": [
        {
          "runway": "09/27",
          "heading": 90,
          "crosswind": { "crosswind": 6, "headwind": 10, "tailwind": false, "angleDeg": 30 },
          "warning": null
        },
        {
          "runway": "14/32",
          "heading": 140,
          "crosswind": { "crosswind": 12, "headwind": 2, "tailwind": true, "angleDeg": 80 },
          "warning": "Crosswind component moderate"
        }
      ],
      "bestRunway": { "runway": "09/27", "heading": 90 }
    }
  }
  ```

---

## 5. Verification & Test Coverage
- Unit test suite: `test/unit/sihAdvancedFeatures.test.js`
- Test cases:
  1. METAR parser verification (wind speed, direction, visibility, cloud decks, temperature, QNH).
  2. ICAO flight category boundaries (VFR, MVFR, IFR, LIFR).
  3. Runway crosswind trigonometry accuracy.
- Production build: Compiles cleanly into client bundle chunk `dist/assets/AviationPage-*.js`.
