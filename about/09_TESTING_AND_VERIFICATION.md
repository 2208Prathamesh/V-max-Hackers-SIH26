# 09. Testing, Verification & Quality Assurance

## 🧪 Testing Philosophy

WeatherGPT incorporates a testing strategy utilizing the **native Node.js test runner (`node:test`)**. This eliminates external test runner overhead (such as Jest/Mocha setup bugs) while providing native ES Module support and fast execution.

```
┌─────────────────────────────────────────────────────────────────┐
│                    TEST SUITE ARCHITECTURE                      │
├───────────────────┬──────────────┬──────────────────────────────┤
│ Layer             │ File Count   │ Test Suites Included         │
├───────────────────┼──────────────┼──────────────────────────────┤
│ 1. Unit Tests     │ 10 files     │ NWP, Gemini, Advisories, GFS │
├───────────────────┼──────────────┼──────────────────────────────┤
│ 2. Integration    │ 12 files     │ Auth, Weather, Chat, Alerts  │
├───────────────────┼──────────────┼──────────────────────────────┤
│ 3. System (E2E)   │ 1 file       │ Complete End-to-End Workflow │
├───────────────────┼──────────────┼──────────────────────────────┤
│ 4. Edge-Cases     │ 3 files      │ Coordinates, Resilience, Sec │
└───────────────────┴──────────────┴──────────────────────────────┘
```

---

## 🏃 Test Runner Commands

From the workspace root directory:

```bash
# Run entire test suite (all 26 test files across 4 suites)
npm test

# Run only unit tests
npm run test:unit

# Run only API integration tests
npm run test:integration

# Run full end-to-end system test
npm run test:system

# Run edge-cases, resilience, and security tests
npm run test:edge
```

---

## 🔬 Test Suite Inventory

### 1. Unit Tests (`test/unit/`)
- **`modelComparison.test.js`:** Tests parametric spread calculation ($\Delta T, \Delta P, \Delta W$) and agreement score grading (`high`, `moderate`, `low`).
- **`ecmwf.test.js`:** Tests GRIB2 message decoding, time cycle reconstruction, and interval precipitation calculations.
- **`noaaGfs.test.js`:** Tests NOAA GFS 0.25° feed ingestion and coordinate extraction.
- **`gemini.test.js`:** Tests prompt construction, system instructions, and deterministic offline multilingual outputs (Marathi, Hindi, English).
- **`advisory.test.js`:** Validates irrigation scheduling logic (>25mm rain delay, <0.18 soil moisture trigger) and spray drift flags (>20 km/h wind).
- **`weatherSynthesis.test.js`:** Tests multi-source fusion between IMD surface observations and global NWP models.
- **`validators.test.js`:** Tests Joi payload validators against valid and invalid inputs.
- **`normalizer.test.js`:** Validates transformation of Open-Meteo JSON into internal WeatherGPT formats.
- **`password.test.js`:** Validates bcrypt hashing strength and comparison.
- **`response.test.js`:** Validates standard response envelope formatting.

---

### 2. Integration Tests (`test/integration/`)
- **`auth.test.js`:** User registration, password verification, JWT token issuance, profile access.
- **`weather.test.js`:** Verifies `/current`, `/forecast`, `/hourly`, and `/compare` HTTP endpoints.
- **`chat.test.js`:** Verifies conversation thread creation, message persistence, and grounded AI responses.
- **`alerts.test.js`:** Tests alert creation, active alert filtering, and saved-location alert matching.
- **`imd.test.js`:** Tests IMD warning endpoints, district queries, and bulletin generation.
- **`climate.test.js`:** Tests historical archive queries and 20-year climate trends.
- **`advisories.test.js`:** Tests crop-specific agricultural guidance and disaster checklist delivery.
- **`maps.test.js`:** Tests GeoJSON format compliance for weather points, alert polygons, and flood risk zones.
- **`satellite.test.js`:** Tests MOSDAC INSAT layer metadata and cyclone trajectory structures.
- **`locations.test.js`:** Tests saved location CRUD operations and favorite toggling.
- **`settings.test.js`:** Tests user preference updates and password modification.
- **`voice.test.js`:** Tests speech-to-text and text-to-speech endpoint contracts.

---

### 3. System & E2E Workflow (`test/system/`)
- **`e2e-workflow.test.js`:** Simulates a realistic user lifecycle:
  1. Register a new user account.
  2. Save home location (e.g. Pune).
  3. Simulate arrival of an official IMD Red Alert.
  4. Verify alert matching and in-app notification creation.
  5. Send user question: *"Should I irrigate my crops today?"*.
  6. Verify grounded response warns of the upcoming storm and recommends delaying irrigation.

---

### 4. Edge-Cases & Security (`test/edge-cases/`)
- **`coordinates.edge.test.js`:** Extreme coordinate boundaries (North/South poles $\pm 90^\circ$, Antimeridian $\pm 180^\circ$, null, undefined, strings).
- **`resilience.edge.test.js`:** Simulates external network timeouts and verifies automatic activation of offline meteorological generators.
- **`security.edge.test.js`:** NoSQL injection sanitization, rate-limiter response enforcement (`HTTP 429 Too Many Requests`), unauthorized role access rejection.

---

## ⚡ Linting & Static Code Quality

The frontend uses **`oxlint`** (an ultra-fast Rust-based JavaScript linter):
```bash
npm --prefix frontend run lint
```
- Ensures React Hooks adhere to dependency rules.
- Prevents unused imports, unhandled Promise rejections, and accidental global leaks.
