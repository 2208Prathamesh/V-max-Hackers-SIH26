# 📚 WeatherGPT Project Knowledge Base (`about/`)

> **Problem Statement ID:** 26068 (Smart India Hackathon 2026)  
> **Project Name:** WeatherGPT – Multi-Model NWP Weather Intelligence & Conversational AI Platform  
> **Core Architecture:** Node.js / Express 5 + MongoDB + React 19 (Vite) + React Native (Expo) + Google Gemini AI + Multi-Model NWP (ECMWF & GFS) + IMD & MOSDAC/ISRO APIs

Welcome to the central documentation and deep analysis hub of the **WeatherGPT** codebase. This directory (`about/`) is curated to allow developers, reviewers, and AI agents to instantly understand any subsystem, schema, API, or algorithm in seconds without re-scanning the entire repository.

---

## 🗺️ Documentation Directory & Quick Links

| File | Name | Scope & Key Topics Covered |
| :--- | :--- | :--- |
| **[`01_EXECUTIVE_SUMMARY.md`](./01_EXECUTIVE_SUMMARY.md)** | **Executive Summary & SIH Problem** | High-level problem statement, project scope, core solution components, standout innovations, tech stack overview. |
| **[`02_SYSTEM_ARCHITECTURE.md`](./02_SYSTEM_ARCHITECTURE.md)** | **System Architecture & Data Flow** | End-to-end architecture diagram, request lifecycle, real-time WebSocket protocol, multi-tier caching, offline resilience strategy. |
| **[`03_BACKEND_ARCHITECTURE.md`](./03_BACKEND_ARCHITECTURE.md)** | **Backend Architecture & REST APIs** | Express 5 server configuration, complete REST API registry (all 19 route modules), middleware stack, rate limiters, background cron schedulers. |
| **[`04_METEOROLOGY_AND_DATA_PIPELINE.md`](./04_METEOROLOGY_AND_DATA_PIPELINE.md)** | **NWP, Meteorology & GIS Pipeline** | Numerical Weather Prediction (ECMWF vs NOAA GFS), GRIB2 decoding (`@mattnucc/gribberish`), Open-Meteo, IMD warnings, MOSDAC/ISRO satellite imagery, cyclone tracks, 20-year climate trends. |
| **[`05_AI_AND_DECISION_SUPPORT.md`](./05_AI_AND_DECISION_SUPPORT.md)** | **Conversational AI & Advisories** | Grounded Gemini AI chat architecture, prompt engineering, deterministic multilingual offline fallback (6 Indian languages), Agro crop advisory, disaster checklist, voice STT/TTS. |
| **[`06_FRONTEND_ARCHITECTURE.md`](./06_FRONTEND_ARCHITECTURE.md)** | **Frontend Web Architecture** | React 19 + Vite + Tailwind CSS SPA, context-based routing, state management, all 11 pages, Leaflet GIS mapping, 6-language dictionary, client request deduplication. |
| **[`07_MOBILE_APP_ARCHITECTURE.md`](./07_MOBILE_APP_ARCHITECTURE.md)** | **Mobile App (Expo / React Native)** | React Native & Expo SDK 57 architecture, 15 mobile screens, auto-reconnecting backend health check, shared data contracts. |
| **[`08_DATABASE_AND_DATA_MODELS.md`](./08_DATABASE_AND_DATA_MODELS.md)** | **Database Schemas & Seeding** | 12 Mongoose schemas, compound indexes, seed scripts, demo user credentials (`sidpatil@gmail.com`, `authority@weathergpt.com`), mock datasets. |
| **[`09_TESTING_AND_VERIFICATION.md`](./09_TESTING_AND_VERIFICATION.md)** | **Testing & Quality Assurance** | Node.js native test harness (`test-runner.js`), 87+ tests across unit, integration, system, and edge-cases suites, oxlint configuration. |
| **[`10_DEVELOPER_PLAYBOOK.md`](./10_DEVELOPER_PLAYBOOK.md)** | **Developer Playbook & Runbook** | Local dev setup, seeding commands, environment variables, curl request cheat sheet, debugging tips, and extension guides. |
| **[`11_AVIATION_WEATHER_SYSTEM.md`](./11_AVIATION_WEATHER_SYSTEM.md)** | **Aviation Aerodrome & Runway Intelligence** | ICAO Annex 3 & DGCA compliance, 34 Indian aerodromes, METAR/TAF parser, runway crosswind decomposition matrix ($V \times \sin(\theta)$), custom bearing tool, cloud base ladder. |
| **[`12_MARINE_FISHERMEN_SAFETY_SYSTEM.md`](./12_MARINE_FISHERMEN_SAFETY_SYSTEM.md)** | **INCOIS Marine & Fishermen Safety** | INCOIS MEWS & ICG compliance, 36 coastal ports/districts across 9 states, WMO Beaufort scale (0–12), Indian Port Signals (1–11), vessel-class advisories, wave hydrodynamics ($H_s, T_p$), 1554 SAR helpline. |
| **[`13_URBAN_FLASH_FLOOD_INDEX.md`](./13_URBAN_FLASH_FLOOD_INDEX.md)** | **Urban Flash Flood & Runoff Index** | Rational Runoff Method ($Q = C \times I \times A$), 20 flood-prone Indian metro basins, drainage saturation ratios, waterlogging depth formula, hotspot directory with engineering failure causes, municipal directives. |
| **[`14_CAP_ALERT_INTEROPERABILITY.md`](./14_CAP_ALERT_INTEROPERABILITY.md)** | **ITU / OASIS CAP v1.2 Alert Engine** | ITU-T X.1303 & OASIS CAP v1.2 XML/JSON generation, NDMA SACHET & IMD schema compatibility, inter-agency export workflow in Authority Command Center. |

---

## ⚡ Quick Reference Card

### 1. Key Ports & Services
- **Backend API:** `http://localhost:5000` (`backend/src/server.js`)
- **Frontend SPA:** `http://localhost:5173` (`frontend/src/main.jsx`)
- **MongoDB Database:** `mongodb://localhost:27017/weathergpt`
- **Real-time WebSockets:** `ws://localhost:5000` (Socket.IO)

### 2. Default Seed Accounts
- **Standard User:** `sidpatil@gmail.com` / `password123`
- **Secondary User:** `aarav.sharma@example.com` / `password123`
- **International User:** `elena.rostova@weathergpt.io` / `password123`
- **Disaster Authority Admin:** `authority@weathergpt.com` / `AuthorityPassword123!`

### 3. Essential Commands
```bash
# Start backend service
npm run dev:backend

# Start frontend development server
npm run dev:frontend

# Fresh seed database
npm run seed:fresh

# Run entire automated test suite
npm test
```
