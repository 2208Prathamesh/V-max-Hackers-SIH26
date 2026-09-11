# 🚀 WeatherGPT Full-Stack Cloud Deployment Guide
## Vercel (Frontend) + Render / Railway (Backend) + MongoDB Atlas (Database)

This step-by-step guide walks you through deploying the complete WeatherGPT platform to free cloud tiers in under 10 minutes.

---

## Architecture Overview

```
 ┌────────────────────────┐         REST & WebSocket          ┌────────────────────────┐
 │   Vercel (Frontend)    │ ───────────────────────────────── │    Render / Railway    │
 │ https://app.vercel.app │                                   │       (Backend)        │
 └────────────────────────┘                                   └───────────┬────────────┘
                                                                          │
                                                                   Mongoose (SRV)
                                                                          │
                                                              ┌───────────▼────────────┐
                                                              │  MongoDB Atlas (Cloud) │
                                                              └────────────────────────┘
```

---

## Step 1: Set Up Free Cloud MongoDB (MongoDB Atlas)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign in or create a free account.
2. Click **Create Deployment** → Select **M0 Free Shared Tier** (AWS or Google Cloud).
3. Under **Security Quickstart**:
   - Create a database user (e.g. username: `weatheradmin`, password: generate a strong password and save it).
   - Under **Where would you like to connect from?**, select **Network Access** → Click **Add IP Address** → choose **Allow Access from Anywhere (`0.0.0.0/0`)** (essential so Render/Railway cloud containers can connect).
4. Click **Database** → **Connect** → choose **Drivers (Node.js)**.
5. Copy your connection string. It looks like:
   ```
   mongodb+srv://weatheradmin:<password>@cluster0.abcde.mongodb.net/weathergpt?retryWrites=true&w=majority
   ```
   *(Replace `<password>` with your actual database user password).*

---

## Step 2: Deploy Backend to Render (or Railway)

### Option A: Render (Recommended Free Tier)

1. Go to [render.com](https://render.com) and sign in with GitHub.
2. Click **New +** → **Web Service**.
3. Select your repository: `V-max-Hackers-SIH26` (branch: `prathamesh` or `main`).
4. Configure the service settings:
   - **Name:** `weathergpt-backend`
   - **Region:** Any (e.g. Oregon or Frankfurt)
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free`
5. Scroll down to **Environment Variables** and add:
   | Key | Value | Notes |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production security mode |
   | `PORT` | `5000` | Render automatically binds this port |
   | `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string from Step 1 |
   | `JWT_SECRET` | *(64-character random string)* | E.g., `openssl rand -hex 32` or any secure random phrase |
   | `JWT_EXPIRES_IN` | `7d` | Token expiry |
   | `FRONTEND_URL` | `https://your-app.vercel.app` | Leave blank initially; fill after Step 3 |
   | `REDIS_ENABLED` | `false` | Disables external Redis in favor of in-memory cache |
6. Click **Create Web Service**.
7. Once deployed, Render will provide a public URL like:
   ```
   https://weathergpt-backend.onrender.com
   ```
8. Verify it by visiting `https://weathergpt-backend.onrender.com/api/health` in your browser. You should see:
   ```json
   { "success": true, "message": "WeatherGPT API is running" }
   ```

*(Note: Default role accounts `citizen@weathergpt.ai`, `farmer@weathergpt.ai`, `authority@weathergpt.ai`, and `admin@weathergpt.ai` with password `password123` are automatically seeded upon first server boot).*

---

## Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New...** → **Project**.
3. Import your GitHub repository: `V-max-Hackers-SIH26`.
4. Configure the project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** → select `frontend` → Click **Continue**.
   - **Build Command:** `npm run build` *(default)*
   - **Output Directory:** `dist` *(default)*
5. Open the **Environment Variables** accordion and add:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://weathergpt-backend.onrender.com/api` |
   *(Replace with your actual Render backend URL from Step 2, including `/api` at the end).*
6. Click **Deploy**.
7. Within 60 seconds, Vercel will build and assign your production domain:
   ```
   https://v-max-hackers-sih26.vercel.app
   ```

---

## Step 4: Link Frontend URL Back to Backend CORS

1. Go back to your [Render Dashboard](https://dashboard.render.com).
2. Open your `weathergpt-backend` service → **Environment**.
3. Update `FRONTEND_URL` to your Vercel deployment URL (e.g. `https://v-max-hackers-sih26.vercel.app`).
4. Click **Save Changes** (Render will automatically redeploy with the updated CORS policy).

---

## Step 5: Mobile App Deployment (Optional - Android APK)

To build a standalone installable Android APK via Expo Application Services (EAS):

1. Inside the `mobile/` directory, create or edit `mobile/.env.local`:
   ```env
   EXPO_PUBLIC_API_URL=https://weathergpt-backend.onrender.com/api
   ```
2. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```
3. Log in to your Expo account:
   ```bash
   eas login
   ```
4. Build the Android APK:
   ```bash
   cd mobile
   eas build -p android --profile preview
   ```
5. Download and install the generated APK on any Android phone.

---

## Verification & Smoke Test Checklist

- [ ] `GET https://your-backend.onrender.com/api/health` returns `success: true`.
- [ ] Vercel homepage opens with rich dark/light mode weather interface.
- [ ] User authentication works with demo account (`citizen@weathergpt.ai` / `password123`) or new registration.
- [ ] Doppler radar map, Air Quality, and Urban Flash Flood models render live telemetry.
- [ ] Socket.IO real-time notification badge receives alerts.
