# 08. Database Architecture & Data Models

## 🗄️ Database Architecture

WeatherGPT utilizes **MongoDB** with **Mongoose 9.9.3** as the Object Document Mapper (ODM).

### Database Configuration (`backend/src/config/db.js`)
- **Connection Pooling:** Connects with automatic reconnect and bounded pool size.
- **Geospatial & Compound Indexes:** Optimized for high-speed spatial distance lookups and real-time alert queries.

---

## 📋 Complete Schema Dictionary (12 Collections)

### 1. `User` (`backend/src/models/User.js`)
Stores authentication identities and high-level role authorization:
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  profileImage: { type: String, default: null },
  language: { type: String, default: 'en' },
  timezone: { type: String, default: 'Asia/Kolkata' },
  isVerified: { type: Boolean, default: false },
  passwordResetTokenHash: { type: String, select: false },
  passwordResetExpiresAt: { type: Date, select: false },
  role: { type: String, enum: ['user', 'authority'], default: 'user' }
}
```

---

### 2. `Alert` (`backend/src/models/Alert.js`)
Central registry for all active and historical weather warnings:
```javascript
{
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['lightning', 'cyclone', 'flood', 'heatwave', 'coldwave',
           'strong_wind', 'fog', 'drought', 'rain', 'other'],
    required: true
  },
  severity: { type: String, enum: ['extreme', 'high', 'moderate', 'low'], required: true },
  location: { type: String, required: true },
  latitude: { type: Number, required: true, min: -90, max: 90 },
  longitude: { type: Number, required: true, min: -180, max: 180 },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  region: { type: String },
  probability: { type: String },
  action: { type: String },
  source: { type: String, required: true },
  externalId: { type: String, default: null, index: true },
  isOfficial: { type: Boolean, default: false },
  affectedAreas: { type: [String], default: [] },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active', index: true }
}
// Indexes: { status: 1, startTime: 1, endTime: 1 }, { severity: 1, createdAt: -1 }
```

---

### 3. `SavedLocation` (`backend/src/models/SavedLocation.js`)
Locations bookmarked by users for fast dashboard retrieval and geofenced alert pushes:
```javascript
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  country: { type: String, default: 'India' },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  isDefault: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false }
}
// Compound Index: { userId: 1, name: 1 }
```

---

### 4. `ImdWarning` (`backend/src/models/ImdWarning.js`)
Normalized district warnings parsed directly from official IMD bulletins:
```javascript
{
  district: { type: String, required: true, index: true },
  state: { type: String, required: true },
  warningLevel: { type: String, enum: ['Red', 'Orange', 'Yellow', 'Green'], required: true },
  hazard: { type: String, required: true },
  action: { type: String },
  advice: { type: String },
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  issuedAt: { type: Date, default: Date.now }
}
// Index: { district: 1, state: 1 }
```

---

### 5. `Conversation` & `Message`
Manages conversational AI chat history:
- **`Conversation.js`:** `userId`, `title`, `summary`, `lastMessageAt`.
- **`Message.js`:** `conversationId`, `sender` (`'user'` or `'assistant'`), `content`, `messageType` (`'text'`, `'weather'`, `'alert'`, `'advisory'`), and rich `metadata` containing grounded meteorological JSON payloads.

---

### 6. Specialized Meteorological Collections
- **`Station.js`:** Ground observation stations (`name`, `state`, `latitude`, `longitude`, `elevation`, `isActive`).
- **`FloodZone.js`:** Flood vulnerability polygons (`basin`, `riskLevel`, `geometry`).
- **`SatelliteProduct.js`:** INSAT-3D / 3DR imagery files (`channel`, `capturedAt`, `imageUrl`).
- **`CycloneTrack.js`:** Tropical storm paths (`cycloneName`, `basin`, `points`, `coneOfUncertainty`).
- **`Notification.js`:** User notification queue (`userId`, `alertId`, `isRead`).
- **`UserPreferences.js`:** Units (°C vs °F, km/h vs m/s), notification toggles, quiet hours.

---

## 🌱 Database Seeding Architecture (`seed/index.js`)

The database seeder provisions a complete, realistic demonstration environment across all 12 collections:

### Seeder Commands:
```bash
# Clean database and insert fresh sample data
npm run seed:fresh

# Wipe collections without inserting data
npm run seed:clean

# Standard seed
npm run seed
```

### Pre-Configured Demo Accounts:
| Name | Email | Password | Role | Default Focus |
| :--- | :--- | :--- | :--- | :--- |
| **Sid Patil** | `sidpatil@gmail.com` | `password123` | `user` | Primary demo user (Pune/Maharashtra) |
| **Aarav Sharma** | `aarav.sharma@example.com` | `password123` | `user` | North India agriculture focus |
| **Elena Rostova** | `elena.rostova@weathergpt.io`| `password123` | `user` | Global / International locations |
| **Authority Admin** | `authority@weathergpt.com` | `AuthorityPassword123!` | `authority`| Disaster management emergency operations |
