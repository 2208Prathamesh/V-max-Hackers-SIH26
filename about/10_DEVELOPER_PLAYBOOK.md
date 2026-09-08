# 10. Developer Playbook & Operations Guide

## 🚀 Local Development Quickstart

### Prerequisites
- **Node.js:** v18.0.0+ or v20+ recommended.
- **MongoDB:** v6.0+ running locally on port `27017` or a MongoDB Atlas URI.
- **Package Manager:** npm or bun.

---

### Step-by-Step Setup

```bash
# 1. Clone or navigate to the repository
cd V-max-Hackers-SIH26

# 2. Install workspace dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 3. Configure backend environment variables
cp backend/.env.example backend/.env

# 4. Seed database with test users, locations, and weather alerts
npm run seed:fresh

# 5. Start the backend server (Runs on http://localhost:5000)
npm run dev:backend

# 6. In a second terminal, start the frontend Vite server (Runs on http://localhost:5173)
npm run dev:frontend
```

---

## ⚙️ Environment Variables Reference (`backend/.env`)

| Variable Name | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Express HTTP & WebSocket server port. |
| `NODE_ENV` | `development` | Application environment (`development`, `production`, `test`). |
| `MONGO_URI` | `mongodb://localhost:27017/weathergpt` | MongoDB connection connection string. |
| `JWT_SECRET` | `dev_secret_key_change_in_production` | Cryptographic secret for signing JWT tokens. |
| `JWT_EXPIRES_IN` | `7d` | Token expiration duration. |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed CORS origin for web client. |
| `GEMINI_API_KEY` | *(empty by default)* | Google Gemini API key. If empty, offline grounded engine activates. |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Gemini model variant used for conversational reasoning. |
| `IMD_API_KEY` | *(empty by default)* | Optional official IMD API key. |
| `MOSDAC_API_KEY` | *(empty by default)* | Optional ISRO MOSDAC satellite API key. |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limiting sliding window (15 minutes in ms). |
| `RATE_LIMIT_MAX` | `100` | Maximum requests per IP in the window. |

---

## 📡 API Testing with cURL

### 1. Authenticate (Login as Demo User)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sidpatil@gmail.com","password":"password123"}'
```
*Save the returned `token` from the response.*

### 2. Fetch Live Weather for a City
```bash
curl "http://localhost:5000/api/weather/current?city=Pune"
```

### 3. Compare NOAA GFS vs ECMWF NWP Models
```bash
curl "http://localhost:5000/api/weather/compare?city=Pune"
```

### 4. Fetch Active IMD Weather Alerts
```bash
curl "http://localhost:5000/api/alerts/active"
```

### 5. Send Grounded AI Query
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{"message":"What is the weather in Pune and should I irrigate my crops?"}'
```

### 6. Get Agricultural Advisory for Cotton
```bash
curl "http://localhost:5000/api/advisories/agriculture?city=Pune&crop=cotton"
```

---

## 🔧 Common Troubleshooting & Gotchas

### 1. MongoDB Connection Refused
- **Symptoms:** Server startup fails with `Failed to connect to MongoDB`.
- **Fix:** Ensure the MongoDB daemon is active:
  - Windows: Check Windows Services (`services.msc`) for `MongoDB Server`, or start via `net start MongoDB`.
  - macOS/Linux: `brew services start mongodb-community` or `sudo systemctl start mongod`.

### 2. Gemini API Rate Limits or Missing API Key
- **Symptoms:** Chat queries taking longer or returning offline fallback.
- **Behavior:** The system is **designed** never to fail on missing AI keys. If `GEMINI_API_KEY` is not provided in `.env`, the deterministic multilingual fallback engine generates fluent, grounded responses automatically.

### 3. Leaflet Tile Display Glitches in Development
- **Symptoms:** Map tiles look shifted or gray.
- **Fix:** Leaflet needs its CSS imported. Ensure `leaflet/dist/leaflet.css` is imported in `frontend/src/pages/WeatherMapPage.jsx`.

### 4. Port 5000 Already in Use
- **Symptoms:** `EADDRINUSE: address already in use :::5000`.
- **Fix:** Find and terminate the dangling Node process:
  - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`.
  - macOS/Linux: `lsof -i :5000` then `kill -9 <PID>`.

---

## 📝 Maintenance Protocol for `about/` Knowledge Base

To ensure this directory remains accurate:
1. **New Endpoints:** When adding new routes to `backend/src/routes/`, update the API tables in `03_BACKEND_ARCHITECTURE.md`.
2. **Schema Changes:** When modifying Mongoose models in `backend/src/models/`, document added attributes in `08_DATABASE_AND_DATA_MODELS.md`.
3. **Frontend Changes:** When creating new pages or modals, update `06_FRONTEND_ARCHITECTURE.md`.
4. **Always refer to `about/README.md`** as the navigation hub for any subsequent development tasks.
