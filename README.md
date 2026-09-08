# WeatherGPT – Multi-Model NWP Weather Intelligence & AI Chatbot

> **Smart India Hackathon 2026** | **Problem Statement ID: 26068**  
> Conversational AI for Weather Forecasting, Alerts, and Climate Information

WeatherGPT is an industry-grade weather intelligence and decision-support platform that unifies numerical weather predictions (ECMWF & NOAA GFS), official IMD alerts, satellite imagery, and conversational AI powered by Google Gemini (with deterministic multilingual offline fallback).

---

## 📚 Comprehensive Project Analysis & Documentation

A complete, deep-dive analysis of the entire project architecture, services, databases, data pipelines, and UI is available in the **[`about/`](./about/README.md)** directory:

1. **[`Executive Summary & SIH Problem Statement`](./about/01_EXECUTIVE_SUMMARY.md)**
2. **[`System Architecture & End-to-End Data Flow`](./about/02_SYSTEM_ARCHITECTURE.md)**
3. **[`Backend Architecture & Complete REST API Registry`](./about/03_BACKEND_ARCHITECTURE.md)**
4. **[`Meteorology, NWP Comparison & Ingestion Pipeline`](./about/04_METEOROLOGY_AND_DATA_PIPELINE.md)**
5. **[`Conversational AI, Grounding & Agro Advisory`](./about/05_AI_AND_DECISION_SUPPORT.md)**
6. **[`Frontend Web Architecture (React 19 & Leaflet GIS)`](./about/06_FRONTEND_ARCHITECTURE.md)**
7. **[`Mobile App Architecture (Expo SDK 57 & React Native)`](./about/07_MOBILE_APP_ARCHITECTURE.md)**
8. **[`Database Schemas & Data Seeder`](./about/08_DATABASE_AND_DATA_MODELS.md)**
9. **[`Testing, Verification & Quality Assurance`](./about/09_TESTING_AND_VERIFICATION.md)**
10. **[`Developer Playbook & Operations Guide`](./about/10_DEVELOPER_PLAYBOOK.md)**

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Seed database
npm run seed:fresh

# 3. Start Backend API (Port 5000)
npm run dev:backend

# 4. Start Frontend Web Client (Port 5173)
npm run dev:frontend

# 5. Run Automated Tests
npm test
```

---

## 🔑 Demo Login Credentials
- **Regular User:** `sidpatil@gmail.com` / `password123`
- **Authority Admin:** `authority@weathergpt.com` / `AuthorityPassword123!`
