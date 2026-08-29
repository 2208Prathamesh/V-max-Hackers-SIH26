# WeatherGPT Automated Test Suite

This directory contains industry-grade automated testing suites for the WeatherGPT backend, covering unit, integration, system, and edge-case testing.

## Directory Structure

```
test/
├── test-runner.js              # Custom test runner & summary reporter
├── helpers/
│   └── testServer.js               # Ephemeral in-memory test server orchestrator
├── unit/                           # Isolated Unit Tests
│   ├── normalizer.test.js          # NWP and Open-Meteo data normalizers
│   ├── password.test.js            # Bcrypt password hashing and verification
│   ├── response.test.js            # Standard response helper envelope integrity
│   └── validators.test.js          # Joi schema rules and boundary checks
├── integration/                    # Integration Tests (API + DB + External NWP)
│   ├── alerts.test.js              # Public alert browsing & details
│   ├── auth.test.js                # Registration, login, token verification
│   ├── chat.test.js                # AI conversation session & WeatherGPT queries
│   ├── locations.test.js           # Saved locations CRUD & live weather enrichment
│   ├── settings.test.js            # User preferences and password management
│   └── weather.test.js             # Geocoding and multi-model forecast endpoints
├── system/                         # End-to-End System Tests
│   └── e2e-workflow.test.js        # Full user lifecycle (Register -> Configure -> Chat -> Cascade Delete)
└── edge-cases/                     # Corner and Boundary Tests
    ├── coordinates.edge.test.js    # Polar, international date-line, ocean, out-of-range bounds
    ├── resilience.edge.test.js     # Empty payloads, malformed JSON, health checks
    └── security.edge.test.js       # NoSQL injection mitigation, malformed JWTs, XSS safety
```

## Running Tests

From root or backend:

```bash
# Run ALL test suites (Unit, Integration, System, Edge-Cases)
npm test

# Run specific suites
npm run test:unit
npm run test:integration
npm run test:system
npm run test:edge

# Run via custom test runner
node test/test-runner.js
node test/test-runner.js --unit
```
