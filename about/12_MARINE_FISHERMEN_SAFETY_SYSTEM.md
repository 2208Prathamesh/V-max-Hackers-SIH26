# 🌊 INCOIS Marine & Coastal Fishermen Early Warning System

> **Standard Compliance:** INCOIS Marine Early Warning System (MEWS), WMO Beaufort Wind Force Scale (0–12), Indian Maritime Port Danger Signals (1–11), Indian Coast Guard Standard Operating Procedures  
> **Backend Service:** `backend/src/services/marine/marineService.js`  
> **Backend Controller & Routes:** `backend/src/controllers/marineController.js`, `backend/src/routes/marineRoutes.js`  
> **Frontend Module:** `frontend/src/pages/MarinePage.jsx` (`/marine`)  
> **Data Sources:** Open-Meteo Marine Hydrodynamic Model (Free, zero-budget), Empirical Oceanographic Formulas

---

## 1. Executive Overview & Problem Context
India has an extensive **7,516 km coastline** across 9 maritime states and 4 Union Territories, supporting over **4 million traditional fishermen and port workers**. Annually, severe squalls, depressions, and cyclones in the Arabian Sea and Bay of Bengal lead to tragic capsizing of country craft and catamarans due to inadequate localized early warnings.

The **WeatherGPT Marine System** integrates open oceanographic wave and wind telemetry, mapping them directly into:
1. Indian Maritime Port Cautionary Signals 1–11
2. WMO Beaufort Wind Force classifications
3. Operational sea-venturing advisories segregated by fishing craft vessel class
4. Instant 24x7 Indian Coast Guard Search and Rescue (SAR) emergency response (Helpline **1554**)

---

## 2. Core Functional Capabilities

### A. Early Warning Sea Venturing Directive by Vessel Class
Unlike generic weather apps that output only raw wave height, this system converts ocean parameters into **explicit operational directives** for local fishermen:

| Sea Status | Wave Height ($H_s$) | Wind Speed | Artisanal Country Craft / Catamarans | Mechanized Trawlers / Motorized Boats | Deep-Sea Commercial Vessels |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SAFE** | $< 1.5$ m | $< 22$ km/h | ✅ Unrestricted fishing permitted | ✅ Normal fishing operations | ✅ Standard operations |
| **CAUTION** | $1.5–2.4$ m | $22–33$ km/h | 🟡 Permitted within 10 NM of shore | ✅ Permitted within 20 NM; radio on | ✅ Normal operations |
| **WARNING** | $2.5–3.9$ m | $34–49$ km/h | 🚫 **PROHIBITED** from entering sea | ⚠️ Experienced crews only; stay $< 15$ NM | 🟡 Exercise standard caution |
| **DANGER** | $\ge 4.0$ m | $\ge 50$ km/h | 🚫 **TOTAL PROHIBITION** | 🚫 **ALL FISHING HALTED**; return to port | ⚠️ Seek sheltered anchorage |

### B. Indian Maritime Port Cautionary Signals (Signals 1 to 11)
Implements the official Indian Meteorological Department (IMD) and Indian Port Authority danger signal code:

| Signal | Name | Wind / Sea Condition | Port Authority & Harbor Master Directive |
| :--- | :--- | :--- | :--- |
| **Signal I** | Distant Cautionary I | Depression $>500$ km away; $H_s \ge 0.5$ m | Monitor IMD cyclone bulletins; no immediate port restriction. |
| **Signal II** | Distant Cautionary II | Depression intensifying; $H_s \ge 1.5$ m | Open sea craft advised to return to coastal waters. |
| **Signal III** | Local Cautionary I | Squally weather approaching; $H_s \ge 2.5$ m | Small craft prohibited from leaving harbor. Secure jetty lines. |
| **Signal IV** | Local Cautionary II | Gale force winds expected; $H_s \ge 4.0$ m | All fishing operations suspended. Coast Guard on alert. |
| **Signal V** | Danger Signal V | Cyclone crossing coast south/west; $\ge 40$ km/h | Port operations suspended. Evacuate waterfront warehouses. |
| **Signal VI** | Danger Signal VI | Cyclone crossing coast north/east; $\ge 50$ km/h | Total halt on maritime activities. 2–3 m storm surge expected. |
| **Signal VII** | Danger Signal VII | Severe cyclone crossing port directly; $\ge 65$ km/h | Extreme danger. Port sealed. Vessels move to deep-sea anchorage. |
| **Signal VIII** | Great Danger Signal VIII | Severe cyclone winds $90–119$ km/h | Maximum alert. Storm surge $3–5$ m. Coastal evacuation underway. |
| **Signal IX** | Great Danger Signal IX | Very severe cyclone winds $120–165$ km/h | Catastrophic conditions. Complete shutdown of port infrastructure. |
| **Signal X** | Great Danger Signal X | Super cyclone winds $\ge 166$ km/h | Unprecedented destruction expected. Pre-deploy NDRF teams. |
| **Signal XI** | Communication Failure | Cyclone tracking station contact lost | Follow last known storm track. Maintain maximum defense posture. |

### C. WMO Beaufort Wind Force Scale (0 to 12)
Classifies wind force using the World Meteorological Organization standard:
- **Force 0–3** (Calm to Gentle Breeze, $0–19$ km/h)
- **Force 4–5** (Moderate to Fresh Breeze, $20–38$ km/h)
- **Force 6–7** (Strong Breeze to Near Gale, $39–61$ km/h)
- **Force 8–9** (Gale to Strong Gale, $62–88$ km/h)
- **Force 10–12** (Storm to Hurricane Force, $\ge 89$ km/h)

### D. Ocean Hydrodynamic Telemetry Matrix
Fetches and calculates:
1. **Significant Wave Height ($H_s$)**: Mean height of the highest third of waves.
2. **Peak Wave Period ($T_p$)**: Period of waves carrying maximum wave energy (longer periods indicate dangerous swells).
3. **Primary Swell Height & Direction**: Distant storm swell trajectories.
4. **Sea Surface Temperature (SST)**: Essential for monitoring marine heatwaves and cyclone intensification.
5. **7-Day Daily Wave Surge Forecast**: Anticipates coastal rough sea trends.

### E. Speech-Synthesized Regional Audio Alert & Rapid Action Coastal Distress Strip
Designed for low-literacy fishermen operating on glare-lit, salt-sprayed boat decks:
- **Audio Voice Readout:** High-fidelity speech synthesis announces current sea-venturing verdicts and safety advice in regional languages (`hi-IN`, `mr-IN`, `ta-IN`, `te-IN`, `bn-IN`, `en-IN`).
- **Rapid Coastal Distress Links:** Direct calling integration for deck-side crisis:
  - 📞 **1554**: Indian Coast Guard Maritime Rescue Coordination Centre (MRCC) — Toll Free 24x7
  - 📞 **1093**: Coastal Marine Police Helpline
  - 📞 **112**: National Unified Emergency Response
  - 📻 **VHF Channel 16 (156.8 MHz)**: International Maritime Distress, Urgency, and Calling Frequency

### F. Mandatory Pre-Departure Maritime Safety Checklist (SOLAS Compliance)
Enforces a 4-point verification mandated by the Ministry of Ports, Shipping and Waterways before slipping moorings:
1. **SOLAS-Approved Life Jackets:** Ensure one certified vest with whistle and SOLAS reflective tape per crew member.
2. **Marine VHF Radio / Mobile in Waterproof Pouch:** Tested communication gear on Channel 16 or coastal cellular band.
3. **NavIC / GPS Satellite Transponder:** Active position beacon and Emergency Position Indicating Radio Beacon (EPIRB/DAT).
4. **Pyrotechnic Distress Flares & Torch:** Red hand flares and orange buoyant smoke signals within valid shelf life.

---

## 3. Indian Coastal Stations & Port Catalog (36 Stations)

The catalog spans all maritime states, islands, and major/minor commercial and fishery ports:

| Basin | State | Port / District | Station ID | UN/LOCODE | Coordinates |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Arabian Sea** | Gujarat | Deendayal / Kandla Port | `kandla` | `INIXY` | 23.0000° N, 70.2200° E |
| **Arabian Sea** | Gujarat | Mundra Port & SEZ | `mundra` | `INMUN` | 22.8400° N, 69.7200° E |
| **Arabian Sea** | Gujarat | Porbandar Coastal Port | `porbandar` | `INPBD` | 21.6400° N, 69.6000° E |
| **Arabian Sea** | Gujarat | Veraval / Somnath Fishery | `veraval` | `INVRL` | 20.9000° N, 70.3600° E |
| **Arabian Sea** | Gujarat | Bhavnagar Anchorage Port | `bhavnagar` | `INBHU` | 21.7600° N, 72.1500° E |
| **Arabian Sea** | Gujarat | Hazira / Surat Port | `surat` | `INHZA` | 21.1100° N, 72.6400° E |
| **Arabian Sea** | Maharashtra | Dahanu / Palghar Fishery | `dahanu` | `INDHN` | 19.9700° N, 72.7300° E |
| **Arabian Sea** | Maharashtra | Mumbai Port (JNPT / MbPT) | `mumbai` | `INBOM` | 18.9438° N, 72.8441° E |
| **Arabian Sea** | Maharashtra | Alibag / Raigad Coastal | `alibag` | `INALB` | 18.6400° N, 72.8700° E |
| **Arabian Sea** | Maharashtra | Ratnagiri Fishery Port | `ratnagiri` | `INRTC` | 16.9902° N, 73.3120° E |
| **Arabian Sea** | Maharashtra | Malvan / Sindhudurg | `sindhudurg` | `INMLV` | 16.0594° N, 73.4682° E |
| **Arabian Sea** | Goa | Mormugao Major Port (MPT) | `goa` | `INMRM` | 15.4167° N, 73.8000° E |
| **Arabian Sea** | Karnataka | Karwar / Baithkol Port | `karwar` | `INKRW` | 14.8100° N, 74.1300° E |
| **Arabian Sea** | Karnataka | Malpe Fishery Port (Udupi) | `udupi` | `INMLP` | 13.3500° N, 74.7000° E |
| **Arabian Sea** | Karnataka | New Mangalore Port (NMPT) | `mangalore` | `INNML` | 12.9344° N, 74.8211° E |
| **Arabian Sea** | Kerala | Azhikkal / Kannur Port | `kannur` | `INAZK` | 11.8700° N, 75.3700° E |
| **Arabian Sea** | Kerala | Beypore / Kozhikode | `kozhikode` | `INBEY` | 11.2500° N, 75.7800° E |
| **Arabian Sea** | Kerala | Cochin Major Port (CoPT) | `kochi` | `INCOK` | 9.9667° N, 76.2667° E |
| **Arabian Sea** | Kerala | Alappuzha / Alleppey Pier | `alappuzha` | `INALP` | 9.4900° N, 76.3300° E |
| **Arabian Sea** | Kerala | Neendakara / Kollam Fishing | `kollam` | `INKOL` | 8.8900° N, 76.6000° E |
| **Arabian Sea** | Kerala | Vizhinjam Seaport | `vizhinjam` | `INVZJ` | 8.3800° N, 76.9900° E |
| **Bay of Bengal** | Tamil Nadu | Kanyakumari / Cape Comorin | `kanyakumari` | `INKYK` | 8.0800° N, 77.5400° E |
| **Bay of Bengal** | Tamil Nadu | V.O.C. / Thoothukudi Port | `tuticorin` | `INTCR` | 8.7642° N, 78.1348° E |
| **Bay of Bengal** | Tamil Nadu | Rameswaram / Pamban Pass | `rameswaram` | `INPAM` | 9.2800° N, 79.3100° E |
| **Bay of Bengal** | Tamil Nadu | Nagapattinam Deep Water | `nagapattinam` | `INNPT` | 10.7600° N, 79.8400° E |
| **Bay of Bengal** | Tamil Nadu | Cuddalore Anchorage Port | `cuddalore` | `INCDL` | 11.7500° N, 79.7700° E |
| **Bay of Bengal** | Tamil Nadu | Chennai Port / Ennore | `chennai` | `INMAA` | 13.0827° N, 80.2707° E |
| **Bay of Bengal** | Puducherry | Puducherry Port Harbour | `puducherry` | `INPNY` | 11.9400° N, 79.8100° E |
| **Bay of Bengal** | Andhra Pradesh | Krishnapatnam Port | `krishnapatnam` | `INKRI` | 14.2500° N, 80.1200° E |
| **Bay of Bengal** | Andhra Pradesh | Machilipatnam / Krishna | `machilipatnam` | `INMPT` | 16.1800° N, 81.1300° E |
| **Bay of Bengal** | Andhra Pradesh | Kakinada Deep Water Port | `kakinada` | `INKAK` | 16.9800° N, 82.2400° E |
| **Bay of Bengal** | Andhra Pradesh | Visakhapatnam Major Port | `vizag` | `INVTZ` | 17.6868° N, 83.2185° E |
| **Bay of Bengal** | Odisha | Gopalpur Port (Ganjam) | `gopalpur` | `INGPR` | 19.2600° N, 84.9100° E |
| **Bay of Bengal** | Odisha | Puri Coastal Station | `puri` | `INPURI` | 19.8135° N, 85.8312° E |
| **Bay of Bengal** | Odisha | Paradip Major Port (PPA) | `paradip` | `INPRT` | 20.3167° N, 86.6167° E |
| **Bay of Bengal** | Odisha | Dhamra Port (Bhadrak) | `dhamra` | `INDHM` | 20.7900° N, 86.9700° E |
| **Bay of Bengal** | West Bengal | Digha / Shankarpur Hub | `digha` | `INDGH` | 21.6300° N, 87.5100° E |
| **Bay of Bengal** | West Bengal | Haldia Dock Complex (HDC) | `haldia` | `INHAL` | 22.0600° N, 88.0600° E |
| **Bay of Bengal** | West Bengal | Kolkata Port (SMP) | `kolkata` | `INCCU` | 22.5726° N, 88.3639° E |
| **Bay of Bengal** | Andaman & Nicobar | Port Blair / South Andaman | `portblair` | `INIXZ` | 11.6200° N, 92.7200° E |
| **Arabian Sea** | Lakshadweep | Kavaratti Lagoon Jetty | `kavaratti` | `INKVT` | 10.5700° N, 72.6400° E |

---

## 4. REST API Reference

### `GET /api/v1/marine/coastal/:district`
Fetches complete oceanographic hydrodynamics, Beaufort classification, Indian Port Cautionary signal status, and fishermen safety directives.

- **URL Parameter:** `district` (string, district key, e.g. `mumbai`, `veraval`, `kochi`, `paradip`)
- **Query Parameters:** `latitude`, `longitude` (optional coordinate override)
- **Sample Request:**
  ```bash
  curl -X GET http://localhost:5000/api/v1/marine/coastal/veraval
  ```
- **Sample Response Payload:**
  ```json
  {
    "status": "success",
    "data": {
      "location": {
        "latitude": 20.90,
        "longitude": 70.36,
        "district": {
          "name": "Veraval / Somnath Fishery Harbour",
          "state": "Gujarat",
          "coast": "Arabian Sea"
        }
      },
      "source": "Open-Meteo Marine API",
      "timestamp": "2026-09-11T00:30:00.000Z",
      "current": {
        "waveHeight": 1.2,
        "waveDirection": 235,
        "wavePeriod": 6.8,
        "swellHeight": 0.9,
        "swellDirection": 240,
        "swellPeriod": 8.1,
        "seaSurfaceTemperature": 28.6,
        "estimatedWindKmh": 18
      },
      "beaufort": {
        "force": 3,
        "actualKnots": 10,
        "label": "Gentle Breeze",
        "seaState": "Large wavelets, some crests break",
        "waveHeight": "0.3–1 m",
        "color": "#a0d468"
      },
      "portSignal": {
        "signal": 2,
        "name": "Distant Cautionary Signal II",
        "severity": "low",
        "action": "Fishing vessels in open sea should return to port. Monitor hourly IMD advisories."
      },
      "fishermenSafety": {
        "status": "SAFE",
        "verdict": "SAFE FOR FISHING — Favourable sea conditions",
        "color": "#22c55e",
        "icon": "✅",
        "details": "Calm to slight sea with wave heights of 1.2m and light winds. Conditions favourable for all types of fishing operations."
      },
      "dailyForecast": [
        { "date": "2026-09-11", "maxWaveHeight": 1.3, "dominantDirection": 230, "maxWavePeriod": 7.0 },
        { "date": "2026-09-12", "maxWaveHeight": 1.4, "dominantDirection": 235, "maxWavePeriod": 7.2 }
      ],
      "coastalDistricts": ["kandla", "mundra", "porbandar", "veraval", "..."],
      "districtsList": [
        { "id": "kandla", "name": "Deendayal / Kandla Port", "state": "Gujarat", "coast": "Arabian Sea" }
      ]
    }
  }
  ```

---

## 5. Verification & Test Coverage
- Unit test suite: `test/unit/sihAdvancedFeatures.test.js`
- Test cases:
  1. Beaufort Force 0 to 12 scale boundaries.
  2. Indian Port Cautionary Signals 1–11 classification under varied wave and wind regimes.
  3. Fishermen safety verdict consistency across artisanal and mechanized craft.
- Production build: Compiles cleanly into client bundle chunk `dist/assets/MarinePage-*.js`.
